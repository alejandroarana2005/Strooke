const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  numero_pedido: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM(
      'pendiente',
      'en_preparacion',
      'enviado',
      'en_camino',
      'entregado',
      'cancelado'
    ),
    defaultValue: 'pendiente',
    allowNull: false,
  },
  numero_guia: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  direccion_envio: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metodo_pago: {
    type: DataTypes.STRING(50),
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'pedidos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Pedido;
