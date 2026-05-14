import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const iniciales = (nombre) => {
  if (!nombre) return '?';
  const partes = nombre.trim().split(' ').filter(Boolean);
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
};

const BADGE = {
  entregado:      { label: 'Entregado',      cls: 'bg-green-100 text-green-800' },
  en_camino:      { label: 'En camino',       cls: 'bg-blue-100 text-blue-800' },
  enviado:        { label: 'Enviado',         cls: 'bg-blue-100 text-blue-800' },
  en_preparacion: { label: 'En preparación', cls: 'bg-amber-100 text-amber-800' },
  pendiente:      { label: 'Pendiente',       cls: 'bg-amber-100 text-amber-800' },
  cancelado:      { label: 'Cancelado',       cls: 'bg-red-100 text-red-800' },
};

const TABS = [['datos', 'MIS DATOS'], ['pedidos', 'MIS PEDIDOS']];

const Perfil = () => {
  const { usuario, actualizarUsuario } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('datos');
  const [perfil, setPerfil] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', telefono: '', direccion: '' });

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [{ data: perfilData }, { data: pedidosData }] = await Promise.all([
          api.get('/usuarios/perfil'),
          api.get('/pedidos/mis-pedidos'),
        ]);
        setPerfil(perfilData);
        setForm({
          nombre: perfilData.nombre || '',
          telefono: perfilData.telefono || '',
          direccion: perfilData.direccion || '',
        });
        setPedidos(pedidosData);
      } catch {
        setError('No se pudo cargar el perfil.');
      } finally {
        setCargando(false);
      }
    };
    fetchDatos();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return setError('El nombre es requerido.');
    setError('');
    setExito(false);
    setGuardando(true);
    try {
      const { data } = await api.put('/usuarios/perfil', form);
      setPerfil(data);
      actualizarUsuario({ nombre: data.nombre });
      setExito(true);
    } catch {
      setError('No se pudo guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#111] text-white">
        <div className="max-w-[900px] mx-auto px-6 py-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-base font-bold tracking-widest flex-shrink-0">
            {iniciales(perfil?.nombre || usuario?.nombre)}
          </div>
          <div>
            <p className="text-base font-bold tracking-[0.15em] uppercase">
              {perfil?.nombre || usuario?.nombre}
            </p>
            <p className="text-xs text-gray-400 tracking-wider mt-0.5">
              {perfil?.correo || usuario?.correo}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-[57px] z-10">
        <div className="max-w-[900px] mx-auto px-6 flex gap-8">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`py-4 text-xs tracking-[0.2em] uppercase border-b-2 transition-colors ${
                tab === key
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        {/* ── MIS DATOS ── */}
        {tab === 'datos' && (
          <form onSubmit={handleGuardar} className="max-w-md">
            <h2 className="text-xs tracking-[0.25em] uppercase font-semibold mb-6 pb-3 border-b border-gray-100">
              Información personal
            </h2>

            <div className="mb-4">
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-500 mb-1.5">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-500 mb-1.5">Teléfono</label>
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-500 mb-1.5">Dirección</label>
              <textarea
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 px-3 py-2.5 text-sm text-black focus:outline-none focus:border-black resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs tracking-[0.15em] uppercase text-gray-500 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={perfil?.correo || ''}
                disabled
                className="w-full border border-gray-100 px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>

            {error && <p className="text-xs text-red-600 tracking-wider mb-4">{error}</p>}
            {exito && (
              <p className="text-xs text-green-700 tracking-wider mb-4 uppercase">
                ✓ Cambios guardados exitosamente
              </p>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="bg-black text-white text-xs tracking-[0.2em] uppercase px-8 py-3 hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {guardando ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
            </button>
          </form>
        )}

        {/* ── MIS PEDIDOS ── */}
        {tab === 'pedidos' && (
          <div>
            <h2 className="text-xs tracking-[0.25em] uppercase font-semibold mb-6 pb-3 border-b border-gray-100">
              Historial de pedidos
            </h2>

            {pedidos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-gray-400 tracking-wider">No tienes pedidos aún.</p>
                <button
                  onClick={() => navigate('/catalogo')}
                  className="mt-6 bg-black text-white text-xs tracking-[0.2em] uppercase px-8 py-3 hover:bg-gray-900 transition-colors"
                >
                  IR AL CATÁLOGO
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pedidos.map((p) => {
                  const badge = BADGE[p.estado] || { label: p.estado, cls: 'bg-gray-100 text-gray-700' };
                  const totalItems = p.detalles?.reduce((acc, d) => acc + d.cantidad, 0) ?? 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/seguimiento/${p.numero_pedido}`)}
                      className="w-full text-left py-4 hover:bg-gray-50 transition-colors px-2 -mx-2 group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium tracking-wider">{p.numero_pedido}</p>
                          <p className="text-xs text-gray-400 mt-0.5 tracking-wide">
                            {new Date(p.created_at).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                            {' · '}
                            {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs px-2.5 py-1 tracking-wide whitespace-nowrap ${badge.cls}`}>
                            {badge.label}
                          </span>
                          <span className="text-sm font-medium tabular-nums">{formatCOP(p.total)}</span>
                          <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-lg leading-none">›</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
