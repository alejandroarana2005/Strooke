const { Producto, Categoria } = require('../models');
const { Op } = require('sequelize');

const getProductos = async (req, res) => {
  try {
    const { categoria, busqueda, page = 1, limit = 20 } = req.query;
    const where = { activo: true };

    if (categoria && categoria !== 'todos') {
      const cat = await Categoria.findOne({
        where: { nombre: { [Op.like]: `%${categoria}%` } },
      });
      if (cat) where.categoria_id = cat.id;
    }

    if (busqueda) {
      where.nombre = { [Op.like]: `%${busqueda}%` };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Producto.findAndCountAll({
      where,
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    return res.json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      productos: rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findOne({
      where: { id, activo: true },
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
    });

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const relacionados = await Producto.findAll({
      where: {
        activo: true,
        categoria_id: producto.categoria_id,
        id: { [Op.ne]: producto.id },
      },
      include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
      limit: 4,
      order: [['created_at', 'DESC']],
    });

    return res.json({ ...producto.toJSON(), relacionados });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener producto' });
  }
};

module.exports = { getProductos, getProductoById };
