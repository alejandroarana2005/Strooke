import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Truck, Shield, Package } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TALLAS = ['S', 'M', 'L', 'XL'];
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format';

const formatCOP = (price) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tallaSeleccionada, setTallaSeleccionada] = useState('M');
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    setCargando(true);
    setRelacionados([]);
    axios
      .get(`${API}/api/productos/${id}`)
      .then((res) => {
        const { relacionados: rel, ...prod } = res.data;
        setProducto(prod);
        setRelacionados(rel || []);
      })
      .catch(() => navigate('/catalogo'))
      .finally(() => setCargando(false));
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!producto || producto.stock === 0) return;
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      imagen_url: producto.imagen_url,
      talla: tallaSeleccionada,
      cantidad,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (!producto) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs tracking-wider uppercase mb-10 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={16} />
          Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Imagen */}
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img
              src={producto.imagen_url || FALLBACK_IMG}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = FALLBACK_IMG;
              }}
            />
          </div>

          {/* Info del producto */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">
                {producto.categoria?.nombre}
              </p>
              <h1 className="text-4xl font-medium tracking-wider uppercase leading-tight">
                {producto.nombre}
              </h1>
              <p className="text-3xl mt-4">{formatCOP(producto.precio)}</p>
            </div>

            {producto.descripcion && (
              <p className="text-gray-600 leading-relaxed text-sm">
                {producto.descripcion}
              </p>
            )}

            {/* Selector de talla */}
            <div>
              <p className="text-xs tracking-widest uppercase mb-3">Talla</p>
              <div className="flex gap-2">
                {TALLAS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTallaSeleccionada(t)}
                    className={`w-12 h-12 border text-xs font-medium tracking-wider transition-colors ${
                      tallaSeleccionada === t
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de cantidad */}
            <div>
              <p className="text-xs tracking-widest uppercase mb-3">
                Cantidad{' '}
                <span className="text-gray-400 normal-case tracking-normal font-normal">
                  ({producto.stock} disponibles)
                </span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center text-lg hover:border-black transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{cantidad}</span>
                <button
                  onClick={() =>
                    setCantidad((c) => Math.min(producto.stock, c + 1))
                  }
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center text-lg hover:border-black transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botón agregar al carrito */}
            <button
              onClick={handleAddToCart}
              disabled={producto.stock === 0}
              className={`w-full py-4 text-xs tracking-widest uppercase font-medium transition-colors ${
                producto.stock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : agregado
                  ? 'bg-green-700 text-white'
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              {producto.stock === 0
                ? 'Agotado'
                : agregado
                ? '¡Agregado al carrito!'
                : 'Agregar al carrito'}
            </button>

            {/* Badges informativos */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              {[
                { icon: <Truck size={18} />, texto: 'Envío gratis sobre $150k' },
                { icon: <Shield size={18} />, texto: 'Pago seguro' },
                { icon: <Package size={18} />, texto: 'Stock disponible' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <div className="text-gray-500">{item.icon}</div>
                  <p className="text-xs text-gray-500 leading-tight">{item.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Productos relacionados */}
      {relacionados.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-6 pb-20 pt-4 border-t border-gray-100">
          <h2 className="text-xs tracking-widest uppercase mb-8">También te puede gustar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relacionados.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
