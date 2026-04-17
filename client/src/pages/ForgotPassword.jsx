import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ForgotPassword = () => {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { correo });
      setEnviado(true);
    } catch {
      setError('Error al procesar la solicitud');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white shadow-sm overflow-hidden">
        <div className="bg-[#111] text-white p-8 text-center">
          <h2 className="text-xl font-bold tracking-[0.3em] uppercase">
            STROOKE
          </h2>
          <p className="text-xs tracking-wider text-gray-400 mt-1 uppercase">
            Recuperar Contraseña
          </p>
        </div>
        <div className="p-8">
          {enviado ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 tracking-wider leading-relaxed">
                Si el correo está registrado en nuestro sistema, recibirás las
                instrucciones pronto.
              </p>
              <Link
                to="/auth"
                className="inline-block text-xs tracking-widest uppercase underline hover:opacity-70 mt-2"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu
                contraseña.
              </p>
              {error && (
                <p className="text-xs text-red-600 tracking-wider">{error}</p>
              )}
              <div>
                <label className="text-xs tracking-wider uppercase text-gray-600 block mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-black text-white py-3 text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors disabled:opacity-60"
              >
                {cargando ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
              <p className="text-center">
                <Link
                  to="/auth"
                  className="text-xs text-gray-500 tracking-wider hover:text-black"
                >
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

export default ForgotPassword;
