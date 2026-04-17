import { X, Plus, Minus } from 'lucide-react';
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
    setIsOpen,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShipping,
    getTotal,
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white z-50 flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-sm font-medium tracking-widest uppercase">
            Tu Carrito ({items.length})
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-gray-500 text-sm tracking-wider">
                Tu carrito está vacío
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs tracking-widest uppercase underline hover:opacity-70"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <img
                    src={item.imagen_url || FALLBACK_IMG}
                    alt={item.nombre}
                    className="w-24 h-24 object-cover bg-gray-100 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = FALLBACK_IMG;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs tracking-wider uppercase leading-tight">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Talla: {item.talla}
                    </p>
                    <p className="text-sm mt-1">{formatCOP(item.precio)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.talla, item.cantidad - 1)
                        }
                        className="w-6 h-6 border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm w-5 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.talla, item.cantidad + 1)
                        }
                        className="w-6 h-6 border border-gray-300 flex items-center justify-center hover:border-black transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.talla)}
                    className="hover:opacity-70 transition-opacity self-start mt-0.5"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="tracking-wider text-gray-600">Subtotal</span>
              <span>{formatCOP(getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="tracking-wider text-gray-600">Envío</span>
              <span>
                {getShipping() === 0 ? (
                  <span className="text-green-700">Gratis</span>
                ) : (
                  formatCOP(getShipping())
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-3">
              <span className="tracking-widest uppercase">Total</span>
              <span>{formatCOP(getTotal())}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-black text-white text-xs tracking-widest uppercase py-4 text-center hover:bg-gray-900 transition-colors"
            >
              Proceder al Pago
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="block w-full text-xs tracking-widest uppercase py-3 text-center border border-black hover:bg-black hover:text-white transition-colors"
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
