const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialEnvio = sequelize.define('HistorialEnvio', {
  pedido_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'historial_envios',
  timestamps: false,
});

module.exports = HistorialEnvio;
