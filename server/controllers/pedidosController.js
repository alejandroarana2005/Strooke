const { Op } = require('sequelize');
const { sequelize, Pedido, DetallePedido, Producto } = require('../models');

// T-064: genera ORD-YYYYMMDD-XXXX contando pedidos del día dentro de la transacción
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

// POST /api/pedidos — T-063 + T-065
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
    // Validar productos y stock — con SELECT FOR UPDATE para evitar condiciones de carrera
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

    // T-064: número de pedido único
    const numero_pedido = await generarNumeroPedido(transaction);

    // Crear pedido
    const pedido = await Pedido.create(
      {
        numero_pedido,
        usuario_id: req.usuario.id,
        direccion_envio,
        metodo_pago,
        total: total.toFixed(2),
      },
      { transaction }
    );

    // Crear detalles y reducir stock (T-065)
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

    await transaction.commit();

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

// GET /api/pedidos/mis-pedidos
const getMisPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { usuario_id: req.usuario.id },
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          include: [
            {
              model: Producto,
              as: 'producto',
              attributes: ['id', 'nombre', 'imagen_url'],
            },
          ],
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

module.exports = { crearPedido, getMisPedidos };
