'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

interface InventoryAlert {
  id: string;
  name: string;
  category: string;
  availability: string;
  talla?: string;
  imageUrl?: string;
}

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [inStockCount, setInStockCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Chart state
  const [chartView, setChartView] = useState<'semanal' | 'mensual'>('semanal');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch all products
        const { data: products, error } = await supabase
          .from('productos')
          .select('id, name, category, availability, featured, imageUrl, talla');

        if (error) throw error;

        if (products) {
          setTotalProducts(products.length);
          
          const inStock = products.filter(p => p.availability === 'En Stock');
          setInStockCount(inStock.length);
          
          const featured = products.filter(p => p.featured === true);
          setFeaturedCount(featured.length);

          // Build simulated alert list from "A Pedido" products or a subset
          const alerts = products
            .filter(p => p.availability === 'A Pedido')
            .slice(0, 3)
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
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Weekly values
  const weeklyData = [
    { label: 'LUN', height: 'h-[40%]', value: 'Bs. 850' },
    { label: 'MAR', height: 'h-[65%]', value: 'Bs. 1200' },
    { label: 'MIE', height: 'h-[50%]', value: 'Bs. 950' },
    { label: 'JUE', height: 'h-[85%]', value: 'Bs. 1850' },
    { label: 'VIE', height: 'h-[70%]', value: 'Bs. 1500' },
    { label: 'SAB', height: 'h-[100%]', value: 'Bs. 2400' },
    { label: 'DOM', height: 'h-[60%]', value: 'Bs. 1300' }
  ];

  // Monthly values
  const monthlyData = [
    { label: 'ENE', height: 'h-[50%]', value: 'Bs. 8.5k' },
    { label: 'FEB', height: 'h-[60%]', value: 'Bs. 10.2k' },
    { label: 'MAR', height: 'h-[40%]', value: 'Bs. 7.1k' },
    { label: 'ABR', height: 'h-[75%]', value: 'Bs. 12.0k' },
    { label: 'MAY', height: 'h-[90%]', value: 'Bs. 15.4k' },
    { label: 'JUN', height: 'h-[100%]', value: 'Bs. 18.2k' },
    { label: 'JUL', height: 'h-[80%]', value: 'Bs. 14.1k' }
  ];

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
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface">Dashboard</h2>
        <p className="text-sm md:text-base text-on-surface-variant">Gestión y análisis de tu tienda en tiempo real.</p>
      </div>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bento-card bg-white p-6 flex flex-col justify-between border border-outline-variant/10 shadow-sm rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-green-600 text-xs font-bold flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12.5%
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Ventas Totales</p>
            <h3 className="font-manrope text-headline-md font-bold text-on-surface">Bs. 12,450</h3>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bento-card bg-white p-6 flex flex-col justify-between border border-outline-variant/10 shadow-sm rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <span className="text-secondary text-xs font-bold flex items-center gap-1 bg-secondary-fixed px-2.5 py-1 rounded-full uppercase tracking-wider">
              <span className="material-symbols-outlined text-[14px] animate-pulse">pending</span> Activos
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Pedidos Activos</p>
            <h3 className="font-manrope text-headline-md font-bold text-on-surface">24</h3>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bento-card bg-white p-6 flex flex-col justify-between border border-outline-variant/10 shadow-sm rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">inventory</span>
            </div>
            <span className="text-on-surface-variant text-xs font-bold bg-surface-container px-2.5 py-1 rounded-full">
              {inStockCount} / {totalProducts}
            </span>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">Productos en Stock</p>
            <h3 className="font-manrope text-headline-md font-bold text-on-surface">{inStockCount} items</h3>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bento-card bg-white p-6 flex flex-col justify-between border border-outline-variant/10 shadow-sm rounded-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-on-surface-variant/10 flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">star</span>
            </div>
            <span className="text-green-600 text-xs font-bold flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
              {featuredCount} Destacados
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
              <p className="text-body-sm text-on-surface-variant">Rendimiento monetario de la plataforma</p>
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
                <div className={`w-full bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all duration-500 shadow-sm hover:shadow-md ${data.height}`} />
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
        <div className="bento-card p-6 md:p-8 bg-primary-container text-on-primary-container overflow-hidden relative border border-primary/10 rounded-2xl shadow-sm">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none w-32 h-32 rotate-12">
            <span className="material-symbols-outlined text-[120px] font-fill" style={{ fontVariationSettings: "'FILL' 1" }}>
              grid_view
            </span>
          </div>
          <h2 className="font-manrope text-headline-sm font-bold mb-2">Alertas de Inventario</h2>
          <p className="text-body-sm opacity-80 mb-6">Productos actualmente a pedido o sin stock</p>
          
          <div className="space-y-4 relative z-10">
            {lowStockAlerts.length > 0 ? (
              lowStockAlerts.map((alert) => (
                <div key={alert.id} className="bg-white/15 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 border border-white/10 hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low overflow-hidden border border-white/10 flex-shrink-0">
                    {alert.imageUrl ? (
                      <img src={alert.imageUrl} alt={alert.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-bold truncate text-white">{alert.name}</p>
                    <p className="text-[11px] text-white/70 font-medium">Cat: {alert.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white font-semibold shadow-sm">
                      {alert.availability}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/10 p-6 rounded-xl text-center">
                <span className="material-symbols-outlined text-3xl mb-2 text-white">check_circle</span>
                <p className="text-sm font-bold text-white">Todo en Stock</p>
                <p className="text-xs text-white/70">No hay alertas de disponibilidad críticas.</p>
              </div>
            )}
          </div>

          <Link
            href="/admin/productos"
            className="block text-center w-full mt-8 py-3 bg-white text-primary rounded-xl font-bold hover:bg-opacity-95 transition-all shadow-lg text-sm cursor-pointer"
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
            <p className="text-body-sm text-on-surface-variant">Gestión de transacciones en tiempo real</p>
          </div>
          <button className="px-6 py-2 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-colors cursor-pointer text-sm">
            Ver Todo
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-widest font-extrabold">
              <tr>
                <th className="px-8 py-4">ID Pedido</th>
                <th className="px-8 py-4">Cliente</th>
                <th className="px-8 py-4">Fecha</th>
                <th className="px-8 py-4">Monto</th>
                <th className="px-8 py-4">Estado</th>
                <th className="px-8 py-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              <tr className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-8 py-5 font-bold text-primary">#BF-9021</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-[12px] font-bold">MS</div>
                    <span className="text-body-sm font-medium">Mariana Sanchez</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-on-surface-variant text-body-sm">Oct 24, 2023</td>
                <td className="px-8 py-5 text-body-sm font-bold">Bs. 850.00</td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Enviado</span>
                </td>
                <td className="px-8 py-5">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-8 py-5 font-bold text-primary">#BF-9022</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[12px] font-bold">RP</div>
                    <span className="text-body-sm font-medium">Roberto Poma</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-on-surface-variant text-body-sm">Oct 24, 2023</td>
                <td className="px-8 py-5 text-body-sm font-bold">Bs. 1,200.00</td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Pendiente</span>
                </td>
                <td className="px-8 py-5">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-8 py-5 font-bold text-primary">#BF-9023</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary text-[12px] font-bold">AC</div>
                    <span className="text-body-sm font-medium">Andrea Calle</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-on-surface-variant text-body-sm">Oct 23, 2023</td>
                <td className="px-8 py-5 text-body-sm font-bold">Bs. 450.00</td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Entregado</span>
                </td>
                <td className="px-8 py-5">
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors cursor-pointer text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
