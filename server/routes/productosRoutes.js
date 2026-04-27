const router = require('express').Router();

// Importar controlador de productos para manejar las peticiones relacionadas con productos
const { getProductos, getProductoById } = require('../controllers/productosController');


// Definir rutas para obtener todos los productos o un producto específico por ID 
router.get('/', getProductos);
router.get('/:id', getProductoById);

// Exportar el router para ser utilizado en index.js
module.exports = router;
