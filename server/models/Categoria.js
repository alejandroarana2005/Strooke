const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  nombre: { type: DataTypes.STRING(50), allowNull: false },
  descripcion: { type: DataTypes.TEXT },
}, {
  tableName: 'categorias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Categoria;
