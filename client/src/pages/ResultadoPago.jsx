import { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);

const ESTADOS = {
  approved: {
    Icono: CheckCircle,
    iconoClass: 'text-green-600',
    titulo: '¡Compra Exitosa!',
    subtitulo: 'Tu pedido fue confirmado y está siendo preparado.',
    mostrarRef: true,
    botones: [
      { label: 'Ver mi pedido', href: (ref) => `/seguimiento/${ref}`, primario: true },
      { label: 'Seguir comprando', href: () => '/catalogo', primario: false },
    ],
  },
  pending: {
    Icono: Clock,
    iconoClass: 'text-amber-500',
    titulo: 'Pago en Proceso',
    subtitulo:
      'Tu transacción está siendo verificada. Te notificaremos por correo cuando se confirme.',
    mostrarRef: true,
    botones: [
      { label: 'Ver estado', href: (ref) => `/seguimiento/${ref}`, primario: true },
      { label: 'Ir al inicio', href: () => '/', primario: false },
    ],
  },
  rejected: {
    Icono: XCircle,
    iconoClass: 'text-red-500',
    titulo: 'Pago Rechazado',
    subtitulo:
      'Tu banco no autorizó la transacción. Verifica tus datos e intenta de nuevo.',
    mostrarRef: false,
    botones: [
      { label: 'Intentar de nuevo', href: () => '/checkout', primario: true },
      { label: 'Ir al inicio', href: () => '/', primario: false },
    ],
  },
};

// Wompi devuelve APPROVED / PENDING / DECLINED / ERROR / VOIDED
const WOMPI_STATUS_MAP = {
  APPROVED: 'approved',
  PENDING:  'pending',
  DECLINED: 'rejected',
  ERROR:    'rejected',
  VOIDED:   'rejected',
};

const ResultadoPago = () => {
  const { state } = useLocation();
  const [params] = useSearchParams();

  const wompiId = params.get('id');

  // Estado inicial: si no viene ?id usamos los params clásicos (?result y ?ref)
  const [result, setResult] = useState(
    !wompiId ? (params.get('result') || (state?.numero_pedido ? 'approved' : null)) : null
  );
  const [ref, setRef] = useState(
    !wompiId ? (params.get('ref') || state?.numero_pedido || null) : null
  );
  const [totalPagado, setTotalPagado] = useState(state?.total || null);
  const [cargando, setCargando] = useState(!!wompiId);

  useEffect(() => {
    if (!wompiId) return;

    fetch(`https://sandbox.wompi.co/v1/transactions/${wompiId}`)
      .then((r) => r.json())
      .then(({ data }) => {
        setResult(WOMPI_STATUS_MAP[data?.status] ?? 'rejected');
        setRef(data?.reference || params.get('reference') || null);
        if (data?.amount_in_cents) {
          setTotalPagado(data.amount_in_cents / 100);
        }
      })
      .catch(() => setResult('rejected'))
      .finally(() => setCargando(false));
  }, [wompiId]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (!result || !ESTADOS[result]) return <Navigate to="/" replace />;

  const { Icono, iconoClass, titulo, subtitulo, mostrarRef, botones } = ESTADOS[result];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Ícono de estado */}
        <Icono size={60} strokeWidth={1.2} className={`mx-auto ${iconoClass}`} />

        {/* Títulos */}
        <div className="space-y-2">
          <h1 className="text-xs font-bold tracking-[0.3em] uppercase">
            {titulo}
          </h1>
          <p className="text-sm text-gray-500 tracking-wide leading-relaxed max-w-xs mx-auto">
            {subtitulo}
          </p>
        </div>

        {/* Datos del pedido */}
        {mostrarRef && ref && (
          <div className="border border-gray-200 px-6 py-5 space-y-2 text-left">
            <div className="flex justify-between text-xs tracking-wider">
              <span className="text-gray-400 uppercase">Número de pedido</span>
              <span className="font-medium tabular-nums">{ref}</span>
            </div>
            {totalPagado && (
              <div className="flex justify-between text-xs tracking-wider">
                <span className="text-gray-400 uppercase">Total</span>
                <span className="font-medium tabular-nums">{formatCOP(totalPagado)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs tracking-wider">
              <span className="text-gray-400 uppercase">Estado</span>
              <span
                className={`font-medium uppercase text-xs tracking-wider ${
                  result === 'approved'
                    ? 'text-green-700'
                    : result === 'pending'
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {result === 'approved'
                  ? 'Confirmado'
                  : result === 'pending'
                  ? 'En verificación'
                  : 'Rechazado'}
              </span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col gap-3">
          {botones.map(({ label, href, primario }) =>
            primario ? (
              <Link
                key={label}
                to={href(ref)}
                className="block w-full bg-black text-white text-xs tracking-[0.25em] uppercase py-4 text-center hover:bg-gray-900 transition-colors"
              >
                {label}
              </Link>
            ) : (
              <Link
                key={label}
                to={href(ref)}
                className="block w-full border border-gray-200 text-xs tracking-[0.2em] uppercase py-3 text-center text-gray-500 hover:border-black hover:text-black transition-colors"
              >
                {label}
              </Link>
            )
          )}
        </div>

        {/* Nota de correo solo para approved/pending */}
        {result !== 'rejected' && (
          <p className="text-xs text-gray-400 tracking-wide">
            Recibirás un correo de confirmación con los detalles de tu pedido.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResultadoPago;
