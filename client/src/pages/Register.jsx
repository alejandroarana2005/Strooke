import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import GoogleAuthButton from '../components/GoogleAuthButton';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ nombre: '', correo: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/register`, form);
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
      <div className="w-full max-w-md bg-white shadow-sm overflow-hidden">
        <div className="bg-[#111] text-white p-8 text-center">
          <h2 className="text-xl font-bold tracking-[0.3em] uppercase">STROOKE</h2>
          <p className="text-xs tracking-wider text-gray-400 mt-1 uppercase">Crear Cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <p className="text-xs text-red-600 tracking-wider">{error}</p>}

          <div>
            <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
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
              value={form.correo}
              onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))}
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
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

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-black text-white py-3 text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-60 mt-2"
          >
            {cargando ? 'Cargando...' : 'Crear Cuenta'}
          </button>

          <div className="flex items-center gap-3 my-1">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400 tracking-wider">O</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <GoogleAuthButton
            label="Registrarse con Google"
            onError={(msg) => setError(msg)}
          />

          <p className="text-xs text-center text-gray-500 tracking-wider">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="underline hover:text-black">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
