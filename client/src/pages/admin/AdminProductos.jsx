import { useState, useEffect, useCallback } from 'react';
import { X, Plus, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const FORM_VACIO = { nombre: '', descripcion: '', precio: '', stock: 0, imagen_url: '', categoria_id: '' };

const FALLBACK =
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=80&auto=format';

const AdminProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'crear' | 'editar', data?: producto }
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const fetchData = useCallback(async () => {
    setCargando(true);
    try {
      const [{ data: p }, { data: c }] = await Promise.all([
        api.get('/admin/productos'),
        api.get('/categorias'),
      ]);
      setProductos(p);
      setCategorias(c);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setErrorForm('');
    setModal({ mode: 'crear' });
  };

  const abrirEditar = (producto) => {
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      imagen_url: producto.imagen_url || '',
      categoria_id: producto.categoria_id,
    });
    setErrorForm('');
    setModal({ mode: 'editar', data: producto });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorForm('');
    if (!form.nombre.trim() || form.precio === '' || !form.categoria_id) {
      return setErrorForm('Nombre, precio y categoría son requeridos.');
    }
    setGuardando(true);
    try {
      if (modal.mode === 'crear') {
        await api.post('/admin/productos', form);
      } else {
        await api.put(`/admin/productos/${modal.data.id}`, form);
      }
      setModal(null);
      fetchData();
    } catch (err) {
      setErrorForm(err.response?.data?.error || 'Error al guardar el producto.');
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (producto) => {
    const accion = producto.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} "${producto.nombre}"?`)) return;
    try {
      await api.put(`/admin/productos/${producto.id}`, { activo: !producto.activo });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar el producto.');
    }
  };

  const campo = (label, key, tipo = 'text', extra = {}) => (
    <div>
      <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1.5">
        {label}
      </label>
      <input
        type={tipo}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
        {...extra}
      />
    </div>
  );

  if (cargando) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400">Productos</h1>
        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-black text-white text-xs tracking-[0.15em] uppercase px-5 py-2.5 hover:bg-gray-900 transition-colors"
        >
          <Plus size={14} />
          NUEVO PRODUCTO
        </button>
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map((h) => (
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
            {productos.map((p) => (
              <tr key={p.id} className={!p.activo ? 'opacity-50' : ''}>
                <td className="px-4 py-3">
                  <img
                    src={p.imagen_url || FALLBACK}
                    alt={p.nombre}
                    className="w-10 h-10 object-cover bg-gray-100"
                    onError={(e) => { e.target.src = FALLBACK; }}
                  />
                </td>
                <td className="px-4 py-3 text-xs font-medium tracking-wide max-w-[180px] truncate">
                  {p.nombre}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {p.categoria?.nombre || '—'}
                </td>
                <td className="px-4 py-3 text-xs tabular-nums">{formatCOP(p.precio)}</td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 text-xs tabular-nums ${p.stock < 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                    {p.stock < 5 && <AlertTriangle size={12} />}
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 tracking-wide ${
                      p.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="text-[10px] tracking-[0.1em] uppercase text-black underline hover:no-underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(p)}
                      className="text-[10px] tracking-[0.1em] uppercase text-gray-400 underline hover:no-underline"
                    >
                      {p.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productos.length === 0 && (
          <p className="text-center text-sm text-gray-400 tracking-wider py-10">No hay productos.</p>
        )}
      </div>

      {/* Modal crear / editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-[#111] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase">
                {modal.mode === 'crear' ? 'Nuevo producto' : 'Editar producto'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              {campo('Nombre *', 'nombre')}
              {campo('Descripción', 'descripcion')}

              <div className="grid grid-cols-2 gap-4">
                {campo('Precio *', 'precio', 'number', { min: 0, step: '0.01' })}
                {campo('Stock', 'stock', 'number', { min: 0 })}
              </div>

              {campo('URL de imagen', 'imagen_url', 'url')}

              <div>
                <label className="block text-[10px] tracking-[0.15em] uppercase text-gray-500 mb-1.5">
                  Categoría *
                </label>
                <select
                  value={form.categoria_id}
                  onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                  className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {errorForm && (
                <p className="text-xs text-red-600 tracking-wider">{errorForm}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="flex-1 bg-black text-white text-xs tracking-[0.15em] uppercase py-3 hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                  {guardando ? 'GUARDANDO...' : 'GUARDAR'}
                </button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-6 border border-gray-200 text-xs tracking-[0.15em] uppercase hover:bg-gray-50 transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductos;
