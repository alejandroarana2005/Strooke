const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');

// Producto — Categoria
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });

// Pedido — Usuario
Usuario.hasMany(Pedido, { foreignKey: 'usuario_id', as: 'pedidos' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// DetallePedido — Pedido
Pedido.hasMany(DetallePedido, { foreignKey: 'pedido_id', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedido_id', as: 'pedido' });

// DetallePedido — Producto
DetallePedido.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetallePedido, { foreignKey: 'producto_id', as: 'detalles_pedido' });

module.exports = { sequelize, Usuario, Categoria, Producto, Pedido, DetallePedido };
