const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getPerfil, actualizarPerfil } = require('../controllers/usuariosController');

router.get('/perfil', authMiddleware, getPerfil);
router.put('/perfil', authMiddleware, actualizarPerfil);

module.exports = router;
