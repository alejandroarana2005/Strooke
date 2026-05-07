const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { crearPedido, getMisPedidos } = require('../controllers/pedidosController');

router.post('/', authMiddleware, crearPedido);
router.get('/mis-pedidos', authMiddleware, getMisPedidos);

module.exports = router;
