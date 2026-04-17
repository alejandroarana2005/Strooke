import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#111] text-white py-16 px-6">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-lg font-bold tracking-[0.3em] uppercase mb-4">
            STROOKE
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Gorras streetwear de calidad premium. Diseñadas para quienes marcan
            estilo en cada paso.
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase mb-5 text-gray-300">
            Navegación
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <Link to="/catalogo" className="hover:text-white transition-colors">
                Catálogo
              </Link>
            </li>
            <li>
              <Link to="/catalogo" className="hover:text-white transition-colors">
                Nuevos
              </Link>
            </li>
            <li>
              <Link
                to="/catalogo?categoria=sale"
                className="hover:text-white transition-colors"
              >
                Sale
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-widest uppercase mb-5 text-gray-300">
            Mi Cuenta
          </h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <Link to="/auth" className="hover:text-white transition-colors">
                Iniciar Sesión
              </Link>
            </li>
            <li>
              <Link to="/perfil" className="hover:text-white transition-colors">
                Mi Perfil
              </Link>
            </li>
            <li>
              <Link to="/perfil" className="hover:text-white transition-colors">
                Mis Pedidos
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs tracking-wider">
        © 2025 Strooke. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
