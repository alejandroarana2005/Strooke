
// Middleware para verificar el rol del usuario y controlar el acceso a rutas específicas
const roleMiddleware = (...roles) => {
  return (req, res, next) => {

    // Verificar que el usuario esté autenticado y tenga un rol válido para acceder a la ruta
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    //
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Si el usuario tiene el rol adecuado, permitir el acceso a la ruta
    next();
  };
};

// Exportar el middleware para ser utilizado en rutas protegidas
module.exports = roleMiddleware;
