const { Op, QueryTypes } = require('sequelize');
const { sequelize, Producto, Pedido, DetallePedido, Usuario, Categoria } = require('../models');

// GET /api/admin/productos — lista todos (incluye inactivos)
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
      order: [['id', 'DESC']],
    });
    return res.json(productos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// T-086 — POST /api/admin/productos
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen_url, categoria_id } = req.body;
    if (!nombre || precio === undefined || !categoria_id) {
      return res.status(400).json({ error: 'nombre, precio y categoria_id son requeridos' });
    }
    const producto = await Producto.create({
      nombre, descripcion, precio, stock: stock ?? 0, imagen_url, categoria_id, activo: true,
    });
    return res.status(201).json(producto);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear el producto' });
  }
};

// T-087 — PUT /api/admin/productos/:id
const editarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = ['nombre', 'descripcion', 'precio', 'stock', 'imagen_url', 'categoria_id', 'activo'];
    const updates = {};
    for (const campo of campos) {
      if (req.body[campo] !== undefined) updates[campo] = req.body[campo];
    }
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update(updates);
    return res.json(producto);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al editar el producto' });
  }
};

// T-088 — DELETE /api/admin/productos/:id (soft delete)
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ activo: false });
    return res.json({ mensaje: 'Producto desactivado exitosamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al desactivar el producto' });
  }
};

// T-089 — PATCH /api/admin/productos/:id/stock
const actualizarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    if (stock === undefined || Number(stock) < 0) {
      return res.status(400).json({ error: 'stock debe ser >= 0' });
    }
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    await producto.update({ stock: Number(stock) });
    return res.json(producto);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al actualizar el stock' });
  }
};

// T-090 — GET /api/admin/pedidos
const getPedidos = async (req, res) => {
  try {
    const { estado, fecha_inicio, fecha_fin, page = 1, limit = 20 } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (fecha_inicio || fecha_fin) {
      where.created_at = {};
      if (fecha_inicio) where.created_at[Op.gte] = new Date(fecha_inicio);
      if (fecha_fin) {
        const fin = new Date(fecha_fin);
        fin.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = fin;
      }
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await Pedido.findAndCountAll({
      where,
      include: [
        { model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] },
        {
          model: DetallePedido, as: 'detalles',
          include: [{ model: Producto, as: 'producto', attributes: ['nombre', 'imagen_url'] }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit: Number(limit),
      offset,
      distinct: true,
    });
    return res.json({ total: count, page: Number(page), pedidos: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};

// T-091 — GET /api/admin/estadisticas
const getEstadisticas = async (req, res) => {
  try {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const hace6Meses = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1);

    const [ventasTotales, ventasMes, pedidosActivos, totalProductos, productosMasVendidos, ventasPorMesRaw] =
      await Promise.all([
        Pedido.sum('total', { where: { estado: { [Op.ne]: 'cancelado' } } }),
        Pedido.sum('total', {
          where: { estado: { [Op.ne]: 'cancelado' }, created_at: { [Op.gte]: inicioMes } },
        }),
        Pedido.count({ where: { estado: { [Op.notIn]: ['entregado', 'cancelado'] } } }),
        Producto.count({ where: { activo: true } }),
        sequelize.query(
          `SELECT dp.producto_id, SUM(dp.cantidad) AS total_vendido, p.nombre, p.imagen_url
           FROM detalle_pedidos dp
           JOIN productos p ON p.id = dp.producto_id
           GROUP BY dp.producto_id, p.nombre, p.imagen_url
           ORDER BY total_vendido DESC
           LIMIT 5`,
          { type: QueryTypes.SELECT }
        ),
        sequelize.query(
          `SELECT YEAR(created_at) AS anio, MONTH(created_at) AS mes, SUM(total) AS total
           FROM pedidos
           WHERE estado != 'cancelado' AND created_at >= ?
           GROUP BY YEAR(created_at), MONTH(created_at)
           ORDER BY anio ASC, mes ASC`,
          { type: QueryTypes.SELECT, replacements: [hace6Meses] }
        ),
      ]);

    const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ventasPorMes = ventasPorMesRaw.map((v) => ({
      mes: `${MESES[Number(v.mes) - 1]} ${v.anio}`,
      total: Number(v.total),
    }));

    return res.json({
      ventasTotales: ventasTotales || 0,
      ventasMes: ventasMes || 0,
      pedidosActivos,
      totalProductos,
      productosMasVendidos,
      ventasPorMes,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getProductos, crearProducto, editarProducto, eliminarProducto, actualizarStock,
  getPedidos, getEstadisticas,
};
