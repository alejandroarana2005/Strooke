const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { generarFirma } = require('../controllers/wompiController');

router.post('/firma', authMiddleware, generarFirma);

module.exports = router;
