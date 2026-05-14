import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import OrderTimeline from '../components/ui/OrderTimeline';
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&auto=format';
const POLL_INTERVAL = 30000;

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);

const Seguimiento = () => {
  const { numero_pedido } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const fetchPedido = useCallback(async () => {
    try {
      const { data } = await api.get(`/pedidos/${numero_pedido}/estado`);
      setPedido(data);
      setError('');
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate('/mis-pedidos', { replace: true });
      } else {
        setError('No se pudo cargar la información del pedido.');
      }
    } finally {
      setCargando(false);
    }
  }, [numero_pedido, navigate]);

  useEffect(() => {
    fetchPedido();
    const interval = setInterval(fetchPedido, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPedido]);

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-sm text-gray-500 tracking-wider">{error}</p>
      </div>
    );
  }

  if (!pedido) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[900px] mx-auto px-6 py-12">

        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-10">
          <p className="text-xs text-gray-400 tracking-[0.2em] uppercase mb-1">
            Seguimiento de pedido
          </p>
          <h1 className="text-lg font-bold tracking-[0.2em] uppercase">
            {pedido.numero_pedido}
          </h1>
          <p className="text-xs text-gray-400 mt-1 tracking-wide">
            Realizado el{' '}
            {new Date(pedido.created_at).toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Columna izquierda: Timeline */}
          <div>
            <h2 className="text-xs tracking-[0.25em] uppercase font-semibold mb-6 pb-3 border-b border-gray-100">
              Estado del Envío
            </h2>
            <OrderTimeline
              estadoActual={pedido.estado}
              historial={pedido.historial}
              numeroGuia={pedido.numero_guia}
            />
          </div>

          {/* Columna derecha: Productos */}
          <div>
            <h2 className="text-xs tracking-[0.25em] uppercase font-semibold mb-6 pb-3 border-b border-gray-100">
              Productos del Pedido
            </h2>

            <div className="divide-y divide-gray-100 mb-6">
              {pedido.detalles.map((d, i) => (
                <div key={i} className="flex gap-3 py-3">
                  <img
                    src={d.producto.imagen_url || FALLBACK_IMG}
                    alt={d.producto.nombre}
                    className="w-16 h-16 object-cover bg-gray-50 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs tracking-wider uppercase leading-tight line-clamp-2">
                      {d.producto.nombre}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Cant. {d.cantidad}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatCOP(d.precio_unitario)} c/u
                    </p>
                  </div>
                  <p className="text-sm tabular-nums font-medium whitespace-nowrap self-center">
                    {formatCOP(d.subtotal)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs tracking-[0.2em] uppercase font-bold">Total pagado</span>
                <span className="text-xl font-bold tabular-nums">{formatCOP(pedido.total)}</span>
              </div>
            </div>

            {/* Número de guía destacado */}
            {pedido.numero_guia && (
              <div className="mt-4 px-4 py-3 bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-500 tracking-wider uppercase">Número de guía</p>
                <p className="text-sm font-medium tabular-nums mt-0.5">{pedido.numero_guia}</p>
              </div>
            )}

            {/* Indicador de actualización en tiempo real */}
            <p className="text-xs text-gray-300 mt-6 tracking-wide text-right">
              Actualizando automáticamente cada 30s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seguimiento;
