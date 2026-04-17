const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  correo: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('cliente', 'admin'), defaultValue: 'cliente' },
  telefono: { type: DataTypes.STRING(20) },
  direccion: { type: DataTypes.TEXT },
  reset_token: { type: DataTypes.STRING(255) },
  reset_token_expiry: { type: DataTypes.DATE },
  login_intentos: { type: DataTypes.INTEGER, defaultValue: 0 },
  bloqueado_hasta: { type: DataTypes.DATE },
}, {
  tableName: 'usuarios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Usuario;
