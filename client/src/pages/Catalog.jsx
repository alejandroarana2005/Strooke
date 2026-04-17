import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const FILTROS = ['TODOS', 'URBANAS', 'DEPORTIVAS', 'PERSONALIZADAS'];

const Catalog = () => {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('TODOS');
  const [orden, setOrden] = useState('reciente');
  const [cargando, setCargando] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('categoria');
    if (cat) setFiltro(cat.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtro !== 'TODOS') params.append('categoria', filtro.toLowerCase());
    if (busqueda) params.append('busqueda', busqueda);
    params.append('limit', '20');

    axios
      .get(`${API}/api/productos?${params}`)
      .then((res) => {
        let prods = res.data.productos || [];
        if (orden === 'precio-asc') prods = [...prods].sort((a, b) => a.precio - b.precio);
        if (orden === 'precio-desc') prods = [...prods].sort((a, b) => b.precio - a.precio);
        setProductos(prods);
        setTotal(res.data.total || 0);
      })
      .catch(console.error)
      .finally(() => setCargando(false));
  }, [filtro, busqueda, orden]);

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-widest uppercase mb-1">
            Catálogo
          </h1>
          <p className="text-sm text-gray-500">{total} productos</p>
        </div>

        {/* Búsqueda + Orden */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="BUSCAR GORRAS..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-xs tracking-wider uppercase placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          <div className="relative">
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="appearance-none bg-white pl-4 pr-10 py-3 text-xs tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
            >
              <option value="reciente">Más recientes</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
            />
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 text-xs tracking-widest uppercase border transition-colors ${
                filtro === f
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        {cargando ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-24 text-gray-500 text-sm tracking-wider">
            No se encontraron productos
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {productos.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
