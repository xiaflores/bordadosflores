'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { 
  Coins, 
  TrendingUp, 
  Truck, 
  Clock, 
  Package, 
  Star, 
  LayoutGrid, 
  Image as ImageIcon, 
  CheckCircle, 
  MoreVertical,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Phone
} from 'lucide-react';

interface InventoryAlert {
  id: string;
  name: string;
  category: string;
  availability: string;
  talla?: string;
  imageUrl?: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  shipping_destination: string;
  total: number;
  status: 'pendiente' | 'pagado' | 'en_confeccion' | 'enviado' | 'entregado' | 'cancelado';
  items: OrderItem[];
  monto_adelanto: number;
  saldo_pendiente: number;
}

interface ChartBarData {
  label: string;
  height: string;
  value: string;
  rawVal: number;
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente de Pago',
  pagado: 'Pagado / Listo',
  en_confeccion: 'En Confección',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  pagado: 'bg-blue-50 text-blue-700 border-blue-200',
  en_confeccion: 'bg-purple-50 text-purple-700 border-purple-200',
  enviado: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  entregado: 'bg-green-50 text-green-700 border-green-200',
  cancelado: 'bg-red-50 text-red-700 border-red-200'
};

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [inStockCount, setInStockCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryAlert[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [weeklyData, setWeeklyData] = useState<ChartBarData[]>([]);
  const [monthlyData, setMonthlyData] = useState<ChartBarData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartView, setChartView] = useState<'semanal' | 'mensual'>('semanal');

  const fetchDashboardStats = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Products
      const { data: products, error: prodError } = await supabase
        .from('productos')
        .select('id, name, category, availability, featured, imageUrl, talla')
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (prodError) throw prodError;

      if (products) {
        setTotalProducts(products.length);
        
        const inStock = products.filter(p => p.availability === 'En Stock');
        setInStockCount(inStock.length);
        
        const featured = products.filter(p => p.featured === true);
        setFeaturedCount(featured.length);

        // Build alert list from "A Pedido" products
        const alerts = products
          .filter(p => p.availability === 'A Pedido')
          .slice(0, 4)
          .map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            availability: p.availability,
            talla: p.talla || 'Única',
            imageUrl: p.imageUrl
          }));
        setLowStockAlerts(alerts);
      }

      // 2. Fetch Orders
      const { data: orders, error: ordError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordError) throw ordError;

      if (orders) {
        // Recent 5 orders for table
        setRecentOrders(orders.slice(0, 5));

        // Active orders (not delivered and not cancelled)
        const active = orders.filter(o => o.status !== 'entregado' && o.status !== 'cancelado');
        setActiveOrdersCount(active.length);

        // Total sales (sum of total for non-cancelled orders)
        const validOrders = orders.filter(o => o.status !== 'cancelado');
        const salesSum = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        setTotalSales(salesSum);

        // 3. Compute Weekly Chart Data (Current Week: Lun - Dom)
        const now = new Date();
        const days = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
        const weeklyTotals = [0, 0, 0, 0, 0, 0, 0];

        validOrders.forEach(o => {
          const d = new Date(o.created_at);
          // Get day index (0 = Mon, 6 = Sun)
          const dayIdx = (d.getDay() + 6) % 7;
          weeklyTotals[dayIdx] += Number(o.total) || 0;
        });

        const maxWeekly = Math.max(...weeklyTotals, 1);
        const compiledWeekly: ChartBarData[] = days.map((dayLabel, idx) => {
          const val = weeklyTotals[idx];
          const pct = val > 0 ? Math.max(Math.round((val / maxWeekly) * 100), 12) : 6;
          return {
            label: dayLabel,
            height: `h-[${pct}%]`,
            value: formatCurrency(val, true),
            rawVal: val
          };
        });
        setWeeklyData(compiledWeekly);

        // 4. Compute Monthly Chart Data (Last 7 Months)
        const monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const currentMonthIdx = now.getMonth();
        
        // Take last 7 months
        const last7Months: { idx: number; name: string }[] = [];
        for (let i = 6; i >= 0; i--) {
          const mIdx = (currentMonthIdx - i + 12) % 12;
          last7Months.push({ idx: mIdx, name: monthNames[mIdx] });
        }

        const monthlyTotals = last7Months.map(() => 0);
        validOrders.forEach(o => {
          const d = new Date(o.created_at);
          const oMonth = d.getMonth();
          const targetIdx = last7Months.findIndex(m => m.idx === oMonth);
          if (targetIdx !== -1) {
            monthlyTotals[targetIdx] += Number(o.total) || 0;
          }
        });

        const maxMonthly = Math.max(...monthlyTotals, 1);
        const compiledMonthly: ChartBarData[] = last7Months.map((m, idx) => {
          const val = monthlyTotals[idx];
          const pct = val > 0 ? Math.max(Math.round((val / maxMonthly) * 100), 12) : 6;
          return {
            label: m.name,
            height: `h-[${pct}%]`,
            value: formatCurrency(val, true),
            rawVal: val
          };
        });
        setMonthlyData(compiledMonthly);
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const currentChartData = chartView === 'semanal' ? weeklyData : monthlyData;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-semibold">Cargando datos del panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-container-max mx-auto">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface">Dashboard</h2>
          <p className="text-sm md:text-base text-on-surface-variant">Gestión y análisis de tu tienda en tiempo real.</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-outline-variant rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </button>
      </div>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Total Sales */}
        <div className="bento-card bg-white p-6 flex flex-col justify-between border border-outline-variant/10 shadow-sm rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Coins className="w-6 h-6" />
            </div>
            <span className="text-green-600 text-xs font-bold flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
              <TrendingUp className="w-3.5 h-3.5" /> Acumulado
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Ventas Totales</p>
            <h3 className="font-manrope text-headline-md font-bold text-on-surface">{formatCurrency(totalSales, true)}</h3>
          </div>
        </div>

        {/* Card 2: Active Orders */}
        <div className="bento-card bg-white p-6 flex flex-col justify-between border border-outline-variant/10 shadow-sm rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-secondary text-xs font-bold flex items-center gap-1 bg-secondary-fixed px-2.5 py-1 rounded-full uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> Activos
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Pedidos Activos</p>
            <h3 className="font-manrope text-headline-md font-bold text-on-surface">{activeOrdersCount}</h3>
          </div>
        </div>

        {/* Card 3: In-Stock Products */}
        <div className="bento-card bg-white p-6 flex flex-col justify-between border border-outline-variant/10 shadow-sm rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-on-surface-variant text-xs font-bold bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
              {inStockCount} / {totalProducts}
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Productos en Stock</p>
            <h3 className="font-manrope text-headline-md font-bold text-on-surface">{inStockCount} ítems</h3>
          </div>
        </div>

        {/* Card 4: Featured Products */}
        <div className="bento-card bg-white p-6 flex flex-col justify-between border border-outline-variant/10 shadow-sm rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <span className="text-amber-700 text-xs font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              En Inicio
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Destacados en Inicio</p>
            <h3 className="font-manrope text-headline-md font-bold text-on-surface">{featuredCount} Productos</h3>
          </div>
        </div>
      </section>

      {/* Analytics & Alerts Section */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Analytics Chart */}
        <div className="bento-card bg-white p-6 md:p-8 xl:col-span-2 border border-outline-variant/10 shadow-sm rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-manrope text-headline-sm font-bold text-on-surface">Análisis de Ventas</h2>
              <p className="text-body-sm text-on-surface-variant">Rendimiento monetario de la plataforma en tiempo real</p>
            </div>
            <div className="flex gap-2 bg-surface-container rounded-lg p-1">
              <button
                onClick={() => setChartView('semanal')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  chartView === 'semanal'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setChartView('mensual')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  chartView === 'mensual'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          {/* Render columns chart */}
          <div className="relative rounded-2xl border border-dashed border-primary/25 p-6 flex items-end gap-3 md:gap-6 h-64 bg-gradient-to-t from-primary/5 to-transparent overflow-hidden">
            {currentChartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-8 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {data.value}
                </div>
                {/* Bar */}
                <div 
                  style={{ height: `${data.height.replace('h-[', '').replace('%]', '')}%` }} 
                  className="w-full bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-500 shadow-sm hover:shadow-md min-h-[8px]" 
                />
              </div>
            ))}

            {/* Simulated Grid Lines */}
            <div className="absolute inset-x-6 bottom-6 h-full border-b border-surface-container-highest/30 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-t border-surface-container-highest/30 w-full h-px"></div>
              <div className="border-t border-surface-container-highest/30 w-full h-px"></div>
              <div className="border-t border-surface-container-highest/30 w-full h-px"></div>
              <div className="border-t border-surface-container-highest/30 w-full h-px"></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4 px-2 text-[10px] md:text-xs font-bold text-on-surface-variant tracking-wider uppercase">
            {currentChartData.map((data, index) => (
              <span key={index} className="flex-1 text-center">{data.label}</span>
            ))}
          </div>
        </div>

        {/* Inventory Alert Widget */}
        <div className="bento-card p-6 md:p-8 bg-primary-container text-on-primary-container overflow-hidden relative border border-primary/10 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none w-32 h-32 rotate-12 flex items-center justify-center text-white">
            <LayoutGrid className="w-28 h-28" />
          </div>
          <div>
            <h2 className="font-manrope text-headline-sm font-bold mb-2">Alertas de Inventario</h2>
            <p className="text-body-sm opacity-80 mb-6">Productos actualmente a pedido o sin stock</p>
            
            <div className="space-y-3 relative z-10 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white/15 backdrop-blur-md p-3 rounded-xl flex items-center gap-3 border border-white/10 hover:bg-white/20 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-low overflow-hidden border border-white/10 flex-shrink-0">
                      {alert.imageUrl ? (
                        <img src={alert.imageUrl} alt={alert.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-white">{alert.name}</p>
                      <p className="text-[10px] text-white/70 font-medium">Cat: {alert.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                        {alert.availability}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white/10 p-6 rounded-xl text-center flex flex-col items-center justify-center">
                  <CheckCircle className="w-8 h-8 mb-2 text-white" />
                  <p className="text-sm font-bold text-white">Todo en Stock</p>
                  <p className="text-xs text-white/70">No hay prendas "A Pedido" actualmente.</p>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/admin/productos"
            className="block text-center w-full mt-6 py-3 bg-white text-primary rounded-xl font-bold hover:bg-opacity-95 transition-all shadow-lg text-xs uppercase tracking-wider cursor-pointer"
          >
            Administrar Catálogo
          </Link>
        </div>
      </section>

      {/* Recent Orders Section */}
      <section className="bento-card bg-white border border-outline-variant/10 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-manrope text-headline-sm font-bold text-on-surface">Pedidos Recientes</h2>
            <p className="text-body-sm text-on-surface-variant">Gestión de transacciones en tiempo real desde Supabase</p>
          </div>
          <Link
            href="/admin/pedidos"
            className="px-6 py-2 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-colors cursor-pointer text-xs uppercase tracking-wider inline-flex items-center gap-2 self-start sm:self-auto"
          >
            Ver Todo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm">
              No hay pedidos registrados en la base de datos.
            </div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-extrabold border-b border-surface-container-highest">
                <tr>
                  <th className="px-6 py-4">ID Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Monto Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {recentOrders.map((ord) => {
                  const initial = ord.customer_name ? ord.customer_name.charAt(0).toUpperCase() : 'C';
                  const dateStr = new Date(ord.created_at).toLocaleDateString('es-BO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <tr key={ord.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-primary text-xs">
                        #{ord.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs uppercase shrink-0">
                            {initial}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-on-surface block">{ord.customer_name}</span>
                            <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              {ord.customer_phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-xs font-medium">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4 text-xs font-extrabold text-on-surface">
                        {formatCurrency(ord.total, true)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider ${STATUS_COLORS[ord.status] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABELS[ord.status] || ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href="/admin/pedidos"
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          Gestionar
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
