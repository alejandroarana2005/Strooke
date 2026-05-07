import { useEffect, useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=200&auto=format';

const formatCOP = (price) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

const CartDrawer = () => {
  const {
    items,
    isOpen,
    subtotal,
    total,
    cantidadTotal,
    quitarProducto,
    modificarCantidad,
    cerrarCarrito,
  } = useCart();

  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const t = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 280);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!visible) return null;

  const envio = subtotal >= 150000 ? 0 : 8000;

  return (
    <>
      {/* Overlay */}
      <div
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          closing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={cerrarCarrito}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-[380px] bg-white z-50 flex flex-col shadow-2xl ${
          closing ? 'animate-slide-out' : 'animate-slide-in'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xs font-bold tracking-[0.25em] uppercase">
              Mi Carrito
            </h2>
            {cantidadTotal > 0 && (
              <p className="text-xs text-gray-400 mt-0.5 tracking-wider">
                {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>
          <button
            onClick={cerrarCarrito}
            className="hover:opacity-60 transition-opacity"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
              <ShoppingBag size={52} strokeWidth={1} className="text-gray-200" />
              <div>
                <p className="text-sm tracking-[0.2em] uppercase font-medium">
                  Tu carrito está vacío
                </p>
                <p className="text-xs text-gray-400 mt-2 tracking-wide">
                  Agrega productos para comenzar
                </p>
              </div>
              <Link
                to="/catalogo"
                onClick={cerrarCarrito}
                className="text-xs tracking-[0.2em] uppercase bg-black text-white px-10 py-3 hover:bg-gray-900 transition-colors"
              >
                Ver Catálogo
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 px-5 py-4">
                  <img
                    src={item.imagen_url || FALLBACK_IMG}
                    alt={item.nombre}
                    className="w-20 h-20 object-cover bg-gray-50 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs tracking-wider uppercase leading-tight font-medium line-clamp-2">
                        {item.nombre}
                      </p>
                      <button
                        onClick={() => quitarProducto(item.id)}
                        className="text-gray-300 hover:text-black transition-colors flex-shrink-0 mt-0.5"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Controles de cantidad */}
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            modificarCantidad(item.id, item.cantidad - 1)
                          }
                          className="w-7 h-7 border border-gray-200 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs w-8 text-center tabular-nums select-none">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            modificarCantidad(item.id, item.cantidad + 1)
                          }
                          disabled={item.cantidad >= item.stock}
                          className="w-7 h-7 border border-gray-200 flex items-center justify-center hover:border-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      {/* Precio total del item */}
                      <p className="text-sm font-medium tabular-nums">
                        {formatCOP(item.precio * item.cantidad)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con resumen */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 space-y-2 bg-white">
            <div className="flex justify-between text-xs tracking-wider">
              <span className="text-gray-500 uppercase">Subtotal</span>
              <span className="tabular-nums">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs tracking-wider">
              <span className="text-gray-500 uppercase">Envío</span>
              <span>
                {envio === 0 ? (
                  <span className="text-green-700 tracking-wider text-xs uppercase">
                    Gratis
                  </span>
                ) : (
                  <span className="tabular-nums">{formatCOP(envio)}</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-gray-200">
              <span className="text-xs tracking-[0.2em] uppercase font-bold">
                Total
              </span>
              <span className="text-base font-bold tabular-nums">
                {formatCOP(total + envio)}
              </span>
            </div>

            <Link
              to="/checkout"
              onClick={cerrarCarrito}
              className="block w-full bg-black text-white text-xs tracking-[0.25em] uppercase py-4 text-center hover:bg-gray-900 transition-colors mt-2"
            >
              Proceder al Pago
            </Link>
            <button
              onClick={cerrarCarrito}
              className="w-full text-xs tracking-[0.2em] uppercase py-3 text-center border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
