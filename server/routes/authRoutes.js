// Rutas para autenticación (registro, login, recuperación de contraseña)
const router = require('express').Router();

// Importar controladores de autenticación
const { register, login, forgotPassword, resetPassword, googleAuth } = require('../controllers/authController');


// Definir rutas para cada acción de autenticación
router.post('/register', register);
router.post('/login', login);

// Rutas para recuperación de contraseña
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

// Exportar el router para ser utilizado en index.js
module.exports = router;
