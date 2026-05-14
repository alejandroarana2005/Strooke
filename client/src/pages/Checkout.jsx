import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&auto=format';

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(n);

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-1.5">
      {label}
    </label>
    <input
      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
      {...props}
    />
  </div>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, total, vaciarCarrito } = useCart();
  const { usuario } = useAuth();

  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    direccion: usuario?.direccion || '',
    ciudad: '',
    telefono: usuario?.telefono || '',
    tipo_persona: 'natural',
    documento: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [pedidoCreado, setPedidoCreado] = useState(false);

  // Si el carrito está vacío al montar (y no fue porque acabamos de crear el pedido), ir al catálogo
  useEffect(() => {
    if (!pedidoCreado && items.length === 0) {
      navigate('/catalogo', { replace: true });
    }
  }, [items, pedidoCreado, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const envio = subtotal >= 150000 ? 0 : 12000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, direccion, ciudad, telefono, documento } = form;

    if (!nombre.trim() || !direccion.trim() || !ciudad.trim() || !telefono.trim()) {
      setError('Completa todos los campos de dirección de envío.');
      return;
    }
    if (!documento.trim()) {
      setError('Ingresa tu número de documento.');
      return;
    }

    setEnviando(true);
    setError('');

    try {
      // 1. Crear pedido en el backend
      const { data } = await api.post('/pedidos', {
        items: items.map((i) => ({ producto_id: i.id, cantidad: i.cantidad })),
        direccion_envio: `${nombre.trim()} — ${direccion.trim()}, ${ciudad.trim()} — Tel: ${telefono.trim()}`,
        metodo_pago: 'Wompi',
      });

      const { numero_pedido, total: montoPedido } = data.pedido;
      const montoTotal = Number(montoPedido) + envio;

      // 2. Obtener firma de integridad (WOMPI_INTEGRITY_SECRET nunca sale del backend)
      const { data: firmaData } = await api.post('/wompi/firma', {
        referencia: numero_pedido,
        monto: montoTotal,
        moneda: 'COP',
      });

      // 3. Abrir widget de Wompi
      setEnviando(false);

      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: firmaData.montoEnCentavos,
        reference: numero_pedido,
        publicKey: import.meta.env.VITE_WOMPI_PUBLIC_KEY,
        signature: { integrity: firmaData.firma },
        redirectUrl: 'https://strooke.vercel.app/resultado-pago',
        customerData: {
          email: usuario.correo,
          fullName: usuario.nombre,
          phoneNumber: form.telefono,
          phoneNumberPrefix: '+57',
          legalId: form.documento,
          legalIdType: form.tipo_persona === 'natural' ? 'CC' : 'NIT',
        },
        shippingAddress: {
          addressLine1: form.direccion,
          city: form.ciudad,
          phoneNumber: form.telefono,
          region: form.ciudad,
          country: 'CO',
        },
      });

      // Wompi redirige solo a redirectUrl — solo limpiamos el carrito aquí
      checkout.open(() => {
        setPedidoCreado(true);
        vaciarCarrito();
      });

    } catch (err) {
      setError(
        err.response?.data?.error || 'Error al procesar el pedido. Inténtalo de nuevo.'
      );
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <h1 className="text-xs font-bold tracking-[0.3em] uppercase mb-10 pb-5 border-b border-gray-200">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

            {/* ── Columna izquierda: formulario ── */}
            <div className="space-y-10">

              {/* Dirección de envío */}
              <section>
                <h2 className="text-xs tracking-[0.25em] uppercase font-semibold mb-5 pb-3 border-b border-gray-100">
                  Dirección de Envío
                </h2>
                <div className="space-y-4">
                  <Field
                    label="Nombre completo"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Juan García"
                    autoComplete="name"
                  />
                  <Field
                    label="Dirección"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Calle 123 # 45-67"
                    autoComplete="street-address"
                  />
                  <Field
                    label="Ciudad"
                    name="ciudad"
                    value={form.ciudad}
                    onChange={handleChange}
                    placeholder="Bogotá"
                    autoComplete="address-level2"
                  />
                  <Field
                    label="Teléfono"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="300 000 0000"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
              </section>

              {/* Datos de facturación */}
              <section>
                <h2 className="text-xs tracking-[0.25em] uppercase font-semibold mb-5 pb-3 border-b border-gray-100">
                  Datos de Facturación
                </h2>
                <div className="space-y-5">

                  {/* Tipo de persona */}
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">
                      Tipo de persona
                    </label>
                    <div className="flex gap-8">
                      {[
                        { value: 'natural',  label: 'Natural' },
                        { value: 'juridica', label: 'Jurídica' },
                      ].map(({ value, label }) => (
                        <label
                          key={value}
                          className="flex items-center gap-2 cursor-pointer text-sm select-none"
                        >
                          <input
                            type="radio"
                            name="tipo_persona"
                            value={value}
                            checked={form.tipo_persona === value}
                            onChange={handleChange}
                            className="accent-black"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Documento */}
                  <Field
                    label={form.tipo_persona === 'natural' ? 'Cédula de ciudadanía (CC)' : 'NIT'}
                    name="documento"
                    value={form.documento}
                    onChange={handleChange}
                    placeholder={form.tipo_persona === 'natural' ? '1000000000' : '900000000-1'}
                    inputMode="numeric"
                  />
                </div>
              </section>
            </div>

            {/* ── Columna derecha: resumen ── */}
            <div>
              <h2 className="text-xs tracking-[0.25em] uppercase font-semibold mb-5 pb-3 border-b border-gray-100">
                Resumen del Pedido
              </h2>

              {/* Lista de productos */}
              <div className="divide-y divide-gray-100 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3">
                    <img
                      src={item.imagen_url || FALLBACK_IMG}
                      alt={item.nombre}
                      className="w-16 h-16 object-cover bg-gray-50 flex-shrink-0"
                      onError={(e) => { e.target.src = FALLBACK_IMG; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs tracking-wider uppercase leading-tight line-clamp-2">
                        {item.nombre}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Cant. {item.cantidad}</p>
                    </div>
                    <p className="text-sm tabular-nums font-medium whitespace-nowrap self-center">
                      {formatCOP(item.precio * item.cantidad)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-xs tracking-wider">
                  <span className="text-gray-500 uppercase">Subtotal</span>
                  <span className="tabular-nums">{formatCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs tracking-wider">
                  <span className="text-gray-500 uppercase">Envío</span>
                  <span>
                    {envio === 0 ? (
                      <span className="text-green-700 text-xs uppercase tracking-wider">Gratis</span>
                    ) : (
                      <span className="tabular-nums">{formatCOP(envio)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
                  <span className="text-xs tracking-[0.2em] uppercase font-bold">Total</span>
                  <span className="text-xl font-bold tabular-nums">
                    {formatCOP(total + envio)}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-xs tracking-wide leading-relaxed">
                  {error}
                </div>
              )}

              {/* CTA */}
              <button
                type="submit"
                disabled={enviando}
                className="mt-6 w-full bg-black text-white text-xs tracking-[0.25em] uppercase py-4 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? 'Procesando...' : 'Pagar con Wompi'}
              </button>
              <p className="mt-3 text-center text-xs text-gray-400 tracking-wide">
                Pago seguro con tarjeta, PSE o Nequi
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
