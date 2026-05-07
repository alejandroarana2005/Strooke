const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetallePedido = sequelize.define('DetallePedido', {
  pedido_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'detalle_pedidos',
  timestamps: false,
});

module.exports = DetallePedido;
