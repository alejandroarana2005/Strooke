import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { getItemCount, setIsOpen } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const count = getItemCount();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <div className="bg-black text-white text-xs text-center py-2 tracking-wider uppercase">
        Envío gratis en compras mayores a $150.000
      </div>

      <nav className="bg-[#111] text-white sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-4 grid grid-cols-3 items-center">
          {/* Izquierda: links */}
          <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase">
            <Link to="/catalogo" className="hover:opacity-70 transition-opacity">Nuevos</Link>
            <Link to="/catalogo" className="hover:opacity-70 transition-opacity">Catálogo</Link>
            <Link to="/catalogo?categoria=sale" className="hover:opacity-70 transition-opacity">Sale</Link>
          </div>

          {/* Mobile: hamburger */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Centro: logo */}
          <div className="flex justify-center">
            <Link to="/" className="text-xl font-bold tracking-[0.3em] uppercase">
              STROOKE
            </Link>
          </div>

          {/* Derecha: iconos */}
          <div className="flex items-center justify-end gap-5">
            <button className="hover:opacity-70 transition-opacity hidden md:block">
              <Search size={18} />
            </button>

            {/* Menú usuario */}
            <div className="relative">
              <button
                className="hover:opacity-70 transition-opacity"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User size={18} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-black shadow-lg z-50">
                  {usuario ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-medium truncate">{usuario.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{usuario.correo}</p>
                      </div>
                      <Link
                        to="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs tracking-wider hover:bg-gray-50 uppercase"
                      >
                        Mi Perfil
                      </Link>
                      {usuario.rol === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-xs tracking-wider hover:bg-gray-50 uppercase"
                        >
                          Panel Admin
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs tracking-wider hover:bg-gray-50 uppercase border-t border-gray-100"
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/auth"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs tracking-wider hover:bg-gray-50 uppercase"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/auth"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-xs tracking-wider hover:bg-gray-50 uppercase"
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className="relative hover:opacity-70 transition-opacity"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-800 px-6 py-4 flex flex-col gap-4 text-xs tracking-widest uppercase">
            <Link to="/catalogo" onClick={() => setMenuOpen(false)}>Nuevos</Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)}>Catálogo</Link>
            <Link to="/catalogo?categoria=sale" onClick={() => setMenuOpen(false)}>Sale</Link>
            <Link to={usuario ? '/perfil' : '/auth'} onClick={() => setMenuOpen(false)}>
              {usuario ? 'Mi Cuenta' : 'Iniciar Sesión'}
            </Link>
          </div>
        )}
      </nav>

      {/* Cerrar menú usuario al hacer clic afuera */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
