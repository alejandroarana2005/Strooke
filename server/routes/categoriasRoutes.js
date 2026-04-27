const router = require('express').Router();

// Importar controlador de categorías para manejar las peticiones relacionadas con categorías
const { getCategorias } = require('../controllers/categoriasController');


// Definir ruta para obtener todas las categorías disponibles
router.get('/', getCategorias);


// Exportar el router para ser utilizado en index.js
module.exports = router;
