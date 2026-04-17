import { Link } from 'react-router-dom';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format';

const formatCOP = (price) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

const ProductCard = ({ producto }) => {
  return (
    <Link to={`/producto/${producto.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={producto.imagen_url || FALLBACK_IMG}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />
        {producto.stock > 0 && producto.stock < 5 && (
          <span className="absolute top-3 left-3 bg-white text-black text-xs px-2 py-1 tracking-wider uppercase">
            Últimas
          </span>
        )}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-gray-700">
              Agotado
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs tracking-wider uppercase text-gray-500">
          {producto.categoria?.nombre}
        </p>
        <p className="text-sm tracking-wider uppercase">{producto.nombre}</p>
        <p className="text-sm text-gray-600">{formatCOP(producto.precio)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;
