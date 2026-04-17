const router = require('express').Router();
const { getCategorias } = require('../controllers/categoriasController');

router.get('/', getCategorias);

module.exports = router;
