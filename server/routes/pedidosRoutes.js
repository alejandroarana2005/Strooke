const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  crearPedido,
  getEstadoPedido,
  actualizarEstadoPedido,
  getMisPedidos,
} = require('../controllers/pedidosController');

router.post('/',                                authMiddleware,                         crearPedido);
// router.get('/pse-callback', pseCallback); — reemplazado por Wompi
router.get('/mis-pedidos',                      authMiddleware,                         getMisPedidos);
router.get('/:numero_pedido/estado',            authMiddleware,                         getEstadoPedido);
router.patch('/admin/:id/estado',               authMiddleware, roleMiddleware('admin'), actualizarEstadoPedido);

module.exports = router;
