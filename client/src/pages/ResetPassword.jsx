import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      return setError('La contraseña debe tener mínimo 8 caracteres');
    }
    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    setCargando(true);
    try {
      await axios.post(`${API}/api/auth/reset-password`, { token, password });
      setExito(true);
      setTimeout(() => navigate('/auth'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al restablecer la contraseña');
    } finally {
      setCargando(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white shadow-sm p-8 text-center">
          <p className="text-sm text-gray-600 mb-4">El enlace de recuperación es inválido o ha expirado.</p>
          <Link to="/forgot-password" className="text-xs tracking-widest uppercase underline hover:opacity-70">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white shadow-sm overflow-hidden">
        <div className="bg-[#111] text-white p-8 text-center">
          <h2 className="text-xl font-bold tracking-[0.3em] uppercase">STROOKE</h2>
          <p className="text-xs tracking-wider text-gray-400 mt-1 uppercase">
            Nueva Contraseña
          </p>
        </div>

        <div className="p-8">
          {exito ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 tracking-wider leading-relaxed">
                ¡Contraseña actualizada exitosamente!
              </p>
              <p className="text-xs text-gray-400">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Ingresa tu nueva contraseña. Debe tener mínimo 8 caracteres.
              </p>

              {error && (
                <p className="text-xs text-red-600 tracking-wider">{error}</p>
              )}

              <div>
                <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {mostrarPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
                  Confirmar contraseña
                </label>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-black text-white py-3 text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-60"
              >
                {cargando ? 'Actualizando...' : 'Guardar nueva contraseña'}
              </button>

              <p className="text-center">
                <Link to="/auth" className="text-xs text-gray-500 tracking-wider hover:text-black">
                  Volver al inicio de sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
