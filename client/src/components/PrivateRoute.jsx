import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (!usuario) return <Navigate to="/auth" replace />;
  if (adminOnly && usuario.rol !== 'admin') return <Navigate to="/" replace />;

  return children;
};

export default PrivateRoute;
