const router = require('express').Router();
const { webhookWompi } = require('../controllers/wompiController');

// Sin authMiddleware — Wompi llama este endpoint directamente
router.post('/wompi', webhookWompi);

module.exports = router;
