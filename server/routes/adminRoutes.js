const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getProductos, crearProducto, editarProducto, eliminarProducto, actualizarStock,
  getPedidos, getEstadisticas,
} = require('../controllers/adminController');

const admin = [authMiddleware, roleMiddleware('admin')];

router.get('/productos',              ...admin, getProductos);
router.post('/productos',             ...admin, crearProducto);
router.put('/productos/:id',          ...admin, editarProducto);
router.delete('/productos/:id',       ...admin, eliminarProducto);
router.patch('/productos/:id/stock',  ...admin, actualizarStock);

router.get('/pedidos',                ...admin, getPedidos);
router.get('/estadisticas',           ...admin, getEstadisticas);

module.exports = router;
