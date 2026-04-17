const { Categoria } = require('../models');

const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
    return res.json(categorias);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

module.exports = { getCategorias };
