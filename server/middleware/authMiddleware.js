const jwt = require('jsonwebtoken');

// Middleware para proteger rutas que requieren autenticación
const authMiddleware = (req, res, next) => {

  // Verificar que el token JWT esté presente en el encabezado Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // Extraer el token del encabezado y verificar su validez
  const token = authHeader.split(' ')[1];
  try {

    // Verificar el token utilizando la clave secreta definida en .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;

    // Si el token es válido, permitir el acceso a la ruta protegida
    next();
  } catch {

    // Si el token es inválido o ha expirado, devolver un error de autenticación
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
