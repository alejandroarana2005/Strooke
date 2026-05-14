const { Op } = require('sequelize');
const { sequelize, Pedido, DetallePedido, Producto, HistorialEnvio, Usuario } = require('../models');
const { sendEmail, generarEmailConfirmacion, generarEmailEstado } = require('../services/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const ESTADOS_VALIDOS = ['pendiente', 'en_preparacion', 'enviado', 'en_camino', 'entregado', 'cancelado'];

// Descripción automática para cada transición de estado
const descripcionEstado = (estado, guia = null) => {
  const mapa = {
    pendiente:       'Pedido recibido y en espera de confirmación de pago',
    en_preparacion:  'Tu pedido está siendo preparado',
    enviado:         `Tu pedido fue despachado. Guía: ${guia}`,
    en_camino:       'Tu pedido está en camino',
    entregado:       'Tu pedido fue entregado exitosamente',
    cancelado:       'El pedido fue cancelado',
  };
  return mapa[estado] || estado;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

// T-064: ORD-YYYYMMDD-XXXX
const generarNumeroPedido = async (transaction) => {
  const hoy = new Date();
  const fecha =
    hoy.getFullYear().toString() +
    String(hoy.getMonth() + 1).padStart(2, '0') +
    String(hoy.getDate()).padStart(2, '0');
  const prefijo = `ORD-${fecha}-`;
  const cantidad = await Pedido.count({
    where: { numero_pedido: { [Op.like]: `${prefijo}%` } },
    transaction,
  });
  return `${prefijo}${String(cantidad + 1).padStart(4, '0')}`;
};

// T-072: STR-YYYYMMDD-XXXX
const generarNumeroGuia = async () => {
  const hoy = new Date();
  const fecha =
    hoy.getFullYear().toString() +
    String(hoy.getMonth() + 1).padStart(2, '0') +
    String(hoy.getDate()).padStart(2, '0');
  const prefijo = `STR-${fecha}-`;
  const cantidad = await Pedido.count({
    where: { numero_guia: { [Op.like]: `${prefijo}%` } },
  });
  return `${prefijo}${String(cantidad + 1).padStart(4, '0')}`;
};

// ── POST /api/pedidos — T-063 + T-065 + T-067 + T-070 ────────────────────────
const crearPedido = async (req, res) => {
  const { items, direccion_envio, metodo_pago } = req.body;

  if (!items || !direccion_envio || !metodo_pago) {
    return res.status(400).json({ error: 'items, direccion_envio y metodo_pago son requeridos' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito no puede estar vacío' });
  }

  const transaction = await sequelize.transaction();
  try {
    const lineas = [];
    let total = 0;

    for (const item of items) {
      if (!item.producto_id || !item.cantidad || item.cantidad < 1) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Cada item debe tener producto_id y cantidad >= 1' });
      }

      const producto = await Producto.findOne({
        where: { id: item.producto_id, activo: true },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });

      if (!producto) {
        await transaction.rollback();
        return res.status(404).json({ error: `Producto ${item.producto_id} no encontrado o inactivo` });
      }
      if (producto.stock < item.cantidad) {
        await transaction.rollback();
        return res.status(409).json({
          error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}`,
        });
      }

      const precio_unitario = Number(producto.precio);
      const subtotal = precio_unitario * item.cantidad;
      total += subtotal;
      lineas.push({ producto, cantidad: item.cantidad, precio_unitario, subtotal });
    }

    const numero_pedido = await generarNumeroPedido(transaction);

    const pedido = await Pedido.create(
      { numero_pedido, usuario_id: req.usuario.id, direccion_envio, metodo_pago, total: total.toFixed(2) },
      { transaction }
    );

    const detalles = await DetallePedido.bulkCreate(
      lineas.map(({ producto, cantidad, precio_unitario, subtotal }) => ({
        pedido_id: pedido.id,
        producto_id: producto.id,
        cantidad,
        precio_unitario,
        subtotal,
      })),
      { transaction }
    );

    for (const { producto, cantidad } of lineas) {
      await producto.update({ stock: producto.stock - cantidad }, { transaction });
    }

    // T-070: primer registro en historial dentro de la transacción
    await HistorialEnvio.create(
      { pedido_id: pedido.id, estado: 'pendiente', descripcion: descripcionEstado('pendiente') },
      { transaction }
    );

    await transaction.commit();

    // T-079: confirmación de compra — fire and forget
    const lineasEmail = lineas.map(({ producto, cantidad, precio_unitario, subtotal }) => ({
      nombre: producto.nombre,
      imagen_url: producto.imagen_url,
      cantidad,
      precio_unitario,
      subtotal,
    }));
    Promise.resolve()
      .then(async () => {
        const usuario = await Usuario.findByPk(req.usuario.id);
        if (!usuario) return;
        await sendEmail({
          to: usuario.correo,
          subject: `Confirmación de pedido ${pedido.numero_pedido} — Strooke`,
          html: generarEmailConfirmacion({ usuario, pedido, detalles: lineasEmail }),
        });
      })
      .catch((err) => console.error('Error enviando correo de confirmación:', err));

    return res.status(201).json({
      mensaje: 'Pedido creado exitosamente',
      pedido: {
        id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        estado: pedido.estado,
        total: pedido.total,
        direccion_envio: pedido.direccion_envio,
        metodo_pago: pedido.metodo_pago,
        created_at: pedido.created_at,
        detalles: detalles.map((d, i) => ({
          producto_id: d.producto_id,
          nombre: lineas[i].producto.nombre,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          subtotal: d.subtotal,
        })),
      },
    });
  } catch (err) {
    await transaction.rollback();
    console.error('Error al crear pedido:', err);
    return res.status(500).json({ error: 'Error interno al procesar el pedido' });
  }
};

// ── GET /api/pedidos/pse-callback — T-067 ────────────────────────────────────
const pseCallback = async (req, res) => {
  const { ref, result } = req.query;

  if (!ref || !['approved', 'pending', 'rejected'].includes(result)) {
    return res.redirect(`${FRONTEND_URL}/resultado-pago?result=rejected`);
  }

  try {
    const pedido = await Pedido.findOne({ where: { numero_pedido: ref } });
    if (!pedido) return res.redirect(`${FRONTEND_URL}/resultado-pago?result=rejected`);

    if (result === 'approved') {
      await pedido.update({ estado: 'en_preparacion' });
      await HistorialEnvio.create({
        pedido_id: pedido.id,
        estado: 'en_preparacion',
        descripcion: 'Pago confirmado. ' + descripcionEstado('en_preparacion'),
      });
    } else if (result === 'rejected') {
      const transaction = await sequelize.transaction();
      try {
        await pedido.update({ estado: 'cancelado' }, { transaction });

        const detalles = await DetallePedido.findAll({ where: { pedido_id: pedido.id }, transaction });
        for (const detalle of detalles) {
          await Producto.increment('stock', {
            by: detalle.cantidad,
            where: { id: detalle.producto_id },
            transaction,
          });
        }

        await HistorialEnvio.create(
          { pedido_id: pedido.id, estado: 'cancelado', descripcion: 'Pago rechazado por el banco. ' + descripcionEstado('cancelado') },
          { transaction }
        );

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        console.error('Error restaurando stock en rechazo:', err);
      }
    }

    const redirectUrl = new URL(`${FRONTEND_URL}/resultado-pago`);
    redirectUrl.searchParams.set('result', result);
    if (result !== 'rejected') redirectUrl.searchParams.set('ref', ref);
    return res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error('Error en pse-callback:', err);
    return res.redirect(`${FRONTEND_URL}/resultado-pago?result=rejected`);
  }
};

// ── GET /api/pedidos/:numero_pedido/estado — T-071 ────────────────────────────
const getEstadoPedido = async (req, res) => {
  const { numero_pedido } = req.params;
  try {
    const pedido = await Pedido.findOne({
      where: { numero_pedido },
      include: [
        {
          model: HistorialEnvio,
          as: 'historial',
        },
        {
          model: DetallePedido,
          as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['nombre', 'imagen_url'] }],
        },
      ],
      order: [[{ model: HistorialEnvio, as: 'historial' }, 'fecha', 'ASC']],
    });

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (pedido.usuario_id !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver este pedido' });
    }

    return res.json({
      numero_pedido: pedido.numero_pedido,
      estado: pedido.estado,
      numero_guia: pedido.numero_guia,
      total: pedido.total,
      created_at: pedido.created_at,
      historial: pedido.historial.map((h) => ({
        estado: h.estado,
        descripcion: h.descripcion,
        fecha: h.fecha,
      })),
      detalles: pedido.detalles.map((d) => ({
        producto: { nombre: d.producto.nombre, imagen_url: d.producto.imagen_url },
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
      })),
    });
  } catch (err) {
    console.error('Error al obtener estado del pedido:', err);
    return res.status(500).json({ error: 'Error al obtener el estado del pedido' });
  }
};

// ── PATCH /api/pedidos/admin/:id/estado — T-073 ──────────────────────────────
const actualizarEstadoPedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosActualizables = ['en_preparacion', 'enviado', 'en_camino', 'entregado', 'cancelado'];
  if (!estado || !estadosActualizables.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosActualizables.join(', ')}` });
  }

  try {
    const pedido = await Pedido.findByPk(id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    const updates = { estado };
    let guia = pedido.numero_guia;

    // T-072: generar guía al despachar
    if (estado === 'enviado' && !pedido.numero_guia) {
      guia = await generarNumeroGuia();
      updates.numero_guia = guia;
    }

    await pedido.update(updates);
    await HistorialEnvio.create({
      pedido_id: pedido.id,
      estado,
      descripcion: descripcionEstado(estado, guia),
    });

    const pedidoActualizado = await Pedido.findByPk(id, {
      include: [{ model: HistorialEnvio, as: 'historial' }],
      order: [[{ model: HistorialEnvio, as: 'historial' }, 'fecha', 'ASC']],
    });

    // T-080: correo de cambio de estado — fire and forget
    const ESTADOS_CON_CORREO = ['en_preparacion', 'enviado', 'en_camino', 'entregado'];
    if (ESTADOS_CON_CORREO.includes(estado)) {
      const snapshot = pedidoActualizado;
      Promise.resolve()
        .then(async () => {
          const usuario = await Usuario.findByPk(pedido.usuario_id);
          if (!usuario) return;
          await sendEmail({
            to: usuario.correo,
            subject: `Actualización de tu pedido ${pedido.numero_pedido} — Strooke`,
            html: generarEmailEstado({ usuario, pedido: snapshot, nuevoEstado: estado }),
          });
        })
        .catch((err) => console.error('Error enviando correo de estado:', err));
    }

    return res.json(pedidoActualizado);
  } catch (err) {
    console.error('Error al actualizar estado del pedido:', err);
    return res.status(500).json({ error: 'Error al actualizar el estado' });
  }
};

// ── GET /api/pedidos/mis-pedidos ──────────────────────────────────────────────
const getMisPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { usuario_id: req.usuario.id },
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'imagen_url'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    return res.json(pedidos);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    return res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};

// pseCallback eliminado — reemplazado por webhookWompi en webhookRoutes
module.exports = { crearPedido, getEstadoPedido, actualizarEstadoPedido, getMisPedidos };
