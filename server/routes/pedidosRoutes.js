const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { crearPedido, pseCallback, getMisPedidos } = require('../controllers/pedidosController');

router.post('/', authMiddleware, crearPedido);
router.get('/pse-callback', pseCallback);       // sin auth — simula retorno del banco
router.get('/mis-pedidos', authMiddleware, getMisPedidos);

module.exports = router;
