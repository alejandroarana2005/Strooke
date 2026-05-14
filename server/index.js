const express = require('express');
const cors = require('cors');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Importar modelos y rutas
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productosRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');

// Configuración del servidor
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para permitir solicitudes desde el frontend de desarrollo (cors)
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({ mensaje: '✅ Servidor de Strooke funcionando correctamente' });
});

// Rutas de la API

// Configurar rutas para autenticación, productos y categorías
// Las peticiones a estas rutas serán manejadas por los controladores correspondientes
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/pedidos', pedidosRoutes);

// verificar conexión a la base de datos y sincronizar modelos antes de iniciar el servidor
sequelize
  // Verificar conexión a la base de datos
  .authenticate()
  .then(() => {
    console.log('✅ Conexión a MySQL establecida');
    // Sincronizar modelos con la base de datos (crear tablas si no existen)
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MySQL:', err.message);
    process.exit(1);
  });
