import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin', label: 'DASHBOARD', icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'PRODUCTOS', icon: Package },
  { to: '/admin/pedidos', label: 'PEDIDOS', icon: ShoppingBag },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-52 bg-[#111] text-white flex flex-col flex-shrink-0">
        <div className="px-6 py-6 border-b border-gray-800">
          <p className="text-xs font-bold tracking-[0.3em] uppercase">STROOKE</p>
          <p className="text-[10px] text-gray-500 tracking-widest mt-0.5 uppercase">Admin</p>
        </div>

        <nav className="flex-1 py-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-xs tracking-[0.12em] uppercase transition-colors ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 text-xs tracking-[0.12em] uppercase text-gray-500 hover:text-white hover:bg-gray-800 transition-colors border-t border-gray-800"
        >
          <LogOut size={14} />
          CERRAR SESIÓN
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-black">STROOKE — ADMIN</p>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
