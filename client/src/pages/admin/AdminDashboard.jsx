import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const BADGE = {
  entregado:      { label: 'Entregado',      cls: 'bg-green-100 text-green-800' },
  en_camino:      { label: 'En camino',       cls: 'bg-blue-100 text-blue-800' },
  enviado:        { label: 'Enviado',         cls: 'bg-blue-100 text-blue-800' },
  en_preparacion: { label: 'En preparación', cls: 'bg-amber-100 text-amber-800' },
  pendiente:      { label: 'Pendiente',       cls: 'bg-amber-100 text-amber-800' },
  cancelado:      { label: 'Cancelado',       cls: 'bg-red-100 text-red-800' },
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/estadisticas'),
      api.get('/admin/pedidos?limit=5'),
    ])
      .then(([{ data: s }, { data: p }]) => {
        setStats(s);
        setPedidos(p.pedidos);
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xs font-bold tracking-[0.3em] uppercase mb-8 text-gray-400">Dashboard</h1>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Ventas del mes', value: formatCOP(stats.ventasMes) },
          { label: 'Pedidos activos', value: stats.pedidosActivos },
          { label: 'Productos activos', value: stats.totalProductos },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 p-6">
            <p className="text-xs tracking-[0.15em] uppercase text-gray-400 mb-2">{label}</p>
            <p className="text-2xl font-bold text-black tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Gráfica de ventas */}
      <div className="bg-white border border-gray-200 p-6 mb-8">
        <h2 className="text-xs tracking-[0.2em] uppercase font-semibold mb-6 text-black">
          Ventas por mes
        </h2>
        {stats.ventasPorMes.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.ventasPorMes} barSize={28}>
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v) => [formatCOP(v), 'Ventas']}
                contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 0 }}
              />
              <Bar dataKey="total" fill="#111" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8 tracking-wider">
            Sin datos de ventas aún
          </p>
        )}
      </div>

      {/* Últimos pedidos */}
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-xs tracking-[0.2em] uppercase font-semibold mb-4 text-black">
          Últimos pedidos
        </h2>
        {pedidos.length === 0 ? (
          <p className="text-sm text-gray-400 tracking-wider text-center py-6">No hay pedidos aún</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Número', 'Cliente', 'Total', 'Estado'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] tracking-[0.12em] uppercase text-gray-400 pb-3 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pedidos.map((p) => {
                const badge = BADGE[p.estado] || { label: p.estado, cls: 'bg-gray-100 text-gray-700' };
                return (
                  <tr key={p.id}>
                    <td className="py-3 text-xs font-medium tracking-wider">{p.numero_pedido}</td>
                    <td className="py-3 text-xs text-gray-600">{p.usuario?.nombre || '—'}</td>
                    <td className="py-3 text-xs tabular-nums">{formatCOP(p.total)}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 tracking-wide ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
