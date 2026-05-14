import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const BADGE = {
  entregado:      { label: 'Entregado',      cls: 'bg-green-100 text-green-800' },
  en_camino:      { label: 'En camino',       cls: 'bg-blue-100 text-blue-800' },
  enviado:        { label: 'Enviado',         cls: 'bg-blue-100 text-blue-800' },
  en_preparacion: { label: 'En preparación', cls: 'bg-amber-100 text-amber-800' },
  pendiente:      { label: 'Pendiente',       cls: 'bg-amber-100 text-amber-800' },
  cancelado:      { label: 'Cancelado',       cls: 'bg-red-100 text-red-800' },
};

const ESTADOS_ACTUALIZABLES = ['en_preparacion', 'enviado', 'en_camino', 'entregado', 'cancelado'];

const FALLBACK =
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=60&auto=format';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pedidoSel, setPedidoSel] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [actualizando, setActualizando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const fetchPedidos = useCallback(async () => {
    setCargando(true);
    try {
      const params = filtroEstado ? `?estado=${filtroEstado}` : '';
      const { data } = await api.get(`/admin/pedidos${params}`);
      setPedidos(data.pedidos);
      setTotal(data.total);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  const abrirModal = (pedido) => {
    setPedidoSel(pedido);
    setNuevoEstado(pedido.estado);
    setErrorModal('');
  };

  const handleActualizar = async () => {
    if (!nuevoEstado || !pedidoSel || nuevoEstado === pedidoSel.estado) return;
    setActualizando(true);
    setErrorModal('');
    try {
      await api.patch(`/pedidos/admin/${pedidoSel.id}/estado`, { estado: nuevoEstado });
      setPedidoSel(null);
      fetchPedidos();
    } catch (err) {
      setErrorModal(err.response?.data?.error || 'Error al actualizar el estado.');
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400">Pedidos</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 tracking-wider">{total} pedidos</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-200 px-3 py-2 text-xs text-black focus:outline-none focus:border-black bg-white tracking-wide"
          >
            <option value="">TODOS LOS ESTADOS</option>
            {Object.entries(BADGE).map(([k, v]) => (
              <option key={k} value={k}>{v.label.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Número', 'Cliente', 'Fecha', 'Total', 'Estado'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] tracking-[0.12em] uppercase text-gray-400 px-4 py-3 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pedidos.map((p) => {
                const badge = BADGE[p.estado] || { label: p.estado, cls: 'bg-gray-100 text-gray-700' };
                return (
                  <tr
                    key={p.id}
                    onClick={() => abrirModal(p)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-medium tracking-wider">{p.numero_pedido}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-800">{p.usuario?.nombre || '—'}</p>
                      <p className="text-[10px] text-gray-400">{p.usuario?.correo || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('es-CO', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums font-medium">{formatCOP(p.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 tracking-wide ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pedidos.length === 0 && (
            <p className="text-center text-sm text-gray-400 tracking-wider py-10">No hay pedidos.</p>
          )}
        </div>
      )}

      {/* Modal detalle pedido */}
      {pedidoSel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-[#111] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase">
                {pedidoSel.numero_pedido}
              </h3>
              <button
                onClick={() => setPedidoSel(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {/* Info cliente */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-1">Cliente</p>
                <p className="text-sm font-medium">{pedidoSel.usuario?.nombre || '—'}</p>
                <p className="text-xs text-gray-400">{pedidoSel.usuario?.correo || ''}</p>
              </div>

              {/* Productos */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-3">Productos</p>
                <div className="space-y-3">
                  {pedidoSel.detalles?.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={d.producto?.imagen_url || FALLBACK}
                        alt={d.producto?.nombre}
                        className="w-10 h-10 object-cover bg-gray-100 flex-shrink-0"
                        onError={(e) => { e.target.src = FALLBACK; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs tracking-wide truncate">{d.producto?.nombre}</p>
                        <p className="text-[10px] text-gray-400">Cant: {d.cantidad} · {formatCOP(d.precio_unitario)} c/u</p>
                      </div>
                      <p className="text-xs font-medium tabular-nums">{formatCOP(d.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-xs tracking-[0.15em] uppercase font-bold">Total</span>
                <span className="text-lg font-bold tabular-nums">{formatCOP(pedidoSel.total)}</span>
              </div>

              {/* Cambiar estado */}
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">
                  Actualizar estado
                </p>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white mb-3"
                >
                  {ESTADOS_ACTUALIZABLES.map((e) => (
                    <option key={e} value={e}>
                      {BADGE[e]?.label || e}
                    </option>
                  ))}
                </select>

                {errorModal && (
                  <p className="text-xs text-red-600 tracking-wider mb-3">{errorModal}</p>
                )}

                <button
                  onClick={handleActualizar}
                  disabled={actualizando || nuevoEstado === pedidoSel.estado}
                  className="w-full bg-black text-white text-xs tracking-[0.15em] uppercase py-3 hover:bg-gray-900 transition-colors disabled:opacity-40"
                >
                  {actualizando ? 'ACTUALIZANDO...' : 'ACTUALIZAR ESTADO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPedidos;
