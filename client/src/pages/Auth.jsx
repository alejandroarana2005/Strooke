import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [modo, setModo] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ correo: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    nombre: '',
    correo: '',
    password: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, loginForm);
      login(data.token, data.usuario);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/register`, registerForm);
      login(data.token, data.usuario);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 shadow-sm overflow-hidden">
        {/* --- LOGIN --- */}
        <div className="bg-white">
          <div className="bg-[#111] text-white p-8 text-center">
            <h2 className="text-xl font-bold tracking-[0.3em] uppercase">
              STROOKE
            </h2>
            <p className="text-xs tracking-wider text-gray-400 mt-1 uppercase">
              Iniciar Sesión
            </p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            {error && modo === 'login' && (
              <p className="text-xs text-red-600 tracking-wider">{error}</p>
            )}
            <div>
              <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
                Correo
              </label>
              <input
                type="email"
                required
                value={loginForm.correo}
                onChange={(e) =>
                  setLoginForm((p) => ({ ...p, correo: e.target.value }))
                }
                onFocus={() => setModo('login')}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div className="relative">
              <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
                Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((p) => ({ ...p, password: e.target.value }))
                }
                onFocus={() => setModo('login')}
                className="w-full border border-gray-300 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9 text-gray-400 hover:text-black"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-black tracking-wider"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <button
              type="submit"
              disabled={cargando && modo === 'login'}
              className="w-full bg-black text-white py-3 text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-60"
            >
              {cargando && modo === 'login' ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
            <p className="text-xs text-center text-gray-500 tracking-wider">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setModo('register')}
                className="underline hover:text-black"
              >
                Regístrate
              </button>
            </p>
          </form>
        </div>

        {/* --- REGISTRO --- */}
        <div className="bg-[#F9F9F9] border-t md:border-t-0 md:border-l border-gray-200">
          <div className="bg-[#111] text-white p-8 text-center">
            <h2 className="text-xl font-bold tracking-[0.3em] uppercase">
              STROOKE
            </h2>
            <p className="text-xs tracking-wider text-gray-400 mt-1 uppercase">
              Crear Cuenta
            </p>
          </div>
          <form onSubmit={handleRegister} className="p-8 space-y-4">
            {error && modo === 'register' && (
              <p className="text-xs text-red-600 tracking-wider">{error}</p>
            )}
            <div>
              <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={registerForm.nombre}
                onChange={(e) =>
                  setRegisterForm((p) => ({ ...p, nombre: e.target.value }))
                }
                onFocus={() => setModo('register')}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
                Correo
              </label>
              <input
                type="email"
                required
                value={registerForm.correo}
                onChange={(e) =>
                  setRegisterForm((p) => ({ ...p, correo: e.target.value }))
                }
                onFocus={() => setModo('register')}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
                Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm((p) => ({ ...p, password: e.target.value }))
                }
                onFocus={() => setModo('register')}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={cargando && modo === 'register'}
              className="w-full bg-black text-white py-3 text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-60 mt-2"
            >
              {cargando && modo === 'register' ? 'Cargando...' : 'Crear Cuenta'}
            </button>
            <p className="text-xs text-center text-gray-500 tracking-wider">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setModo('login')}
                className="underline hover:text-black"
              >
                Inicia sesión
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
