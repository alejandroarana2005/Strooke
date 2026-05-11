import { Check, XCircle } from 'lucide-react';

const PASOS = [
  { key: 'pendiente',      label: 'Pedido recibido' },
  { key: 'en_preparacion', label: 'En preparación' },
  { key: 'enviado',        label: 'Despachado' },
  { key: 'en_camino',      label: 'En camino' },
  { key: 'entregado',      label: 'Entregado' },
];

const ORDEN = PASOS.map((p) => p.key);

const formatFecha = (fecha) => {
  if (!fecha) return null;
  return new Date(fecha).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderTimeline = ({ estadoActual, historial = [], numeroGuia }) => {
  const cancelado = estadoActual === 'cancelado';
  const indiceActual = ORDEN.indexOf(estadoActual);

  const getEntrada = (estado) => historial.find((h) => h.estado === estado) || null;

  if (cancelado) {
    const entradaCancelado = getEntrada('cancelado');
    return (
      <div className="flex gap-4">
        <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-xs tracking-wider uppercase font-semibold text-red-600">
            Pedido cancelado
          </p>
          {entradaCancelado?.descripcion && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {entradaCancelado.descripcion}
            </p>
          )}
          {entradaCancelado?.fecha && (
            <p className="text-xs text-gray-400 mt-0.5">{formatFecha(entradaCancelado.fecha)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {PASOS.map((paso, i) => {
        const completado = i < indiceActual;
        const activo = i === indiceActual;
        const esUltimo = i === PASOS.length - 1;
        const entrada = getEntrada(paso.key);

        return (
          <div key={paso.key} className="flex gap-4">
            {/* Indicador + línea */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center mt-0.5 transition-colors ${
                  completado
                    ? 'bg-black'
                    : activo
                    ? 'border-2 border-black bg-white'
                    : 'bg-gray-200'
                }`}
              >
                {completado && <Check size={9} strokeWidth={3} className="text-white" />}
                {activo && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              {!esUltimo && (
                <div
                  className={`w-px my-1 ${completado ? 'bg-black' : 'bg-gray-200'}`}
                  style={{ minHeight: '36px' }}
                />
              )}
            </div>

            {/* Contenido del paso */}
            <div className={`${esUltimo ? '' : 'pb-1'} min-w-0`} style={{ paddingBottom: esUltimo ? '0' : undefined }}>
              <p
                className={`text-xs tracking-wider uppercase font-semibold leading-none mt-0.5 ${
                  completado || activo ? 'text-black' : 'text-gray-300'
                }`}
              >
                {paso.label}
              </p>

              {entrada ? (
                <div className="mt-1 mb-4">
                  {entrada.descripcion && (
                    <p className="text-xs text-gray-500 leading-relaxed">{entrada.descripcion}</p>
                  )}
                  {paso.key === 'enviado' && numeroGuia && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Guía:{' '}
                      <span className="font-medium tabular-nums text-black">{numeroGuia}</span>
                    </p>
                  )}
                  {entrada.fecha && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatFecha(entrada.fecha)}</p>
                  )}
                </div>
              ) : (
                <div className="mb-4">
                  {!activo && (
                    <p className="text-xs text-gray-300 mt-0.5">Pendiente</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
