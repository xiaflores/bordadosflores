'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { DEPARTAMENTOS } from '@/lib/constants';
import { 
  ClipboardList, 
  Search, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Package, 
  RefreshCw,
  ExternalLink,
  Receipt,
  Truck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Edit2
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  quantity: number;
  colorName?: string;
  colorHex?: string;
  panos?: number;
  largo?: number;
  cintura?: string | number;
  talla?: string;
  fechaEntrega?: string;
  slug?: string;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  shipping_destination: string;
  custom_location: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: 'pendiente' | 'pagado' | 'en_confeccion' | 'enviado' | 'entregado' | 'cancelado';
  items: OrderItem[];
  user_id: string | null;
  monto_adelanto: number;
  saldo_pendiente: number;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [tempAdelanto, setTempAdelanto] = useState<string>('');

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('No se pudo actualizar el estado del pedido.');
    }
  };

  const savePaymentUpdate = async (orderId: string, newAdelanto: number, total: number) => {
    const newSaldo = Math.max(0, total - newAdelanto);
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          monto_adelanto: newAdelanto,
          saldo_pendiente: newSaldo
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, monto_adelanto: newAdelanto, saldo_pendiente: newSaldo } : o));
      setEditingPaymentId(null);
    } catch (error) {
      console.error('Error saving payment update:', error);
      alert('Ocurrió un error al actualizar los montos de pago.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (expandedOrderId === orderId) {
        setExpandedOrderId(null);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Ocurrió un error al intentar borrar el pedido.');
    }
  };

  const getShippingLabel = (order: Order) => {
    const dept = DEPARTAMENTOS.find(d => d.id === order.shipping_destination);
    if (order.shipping_destination === 'otro') {
      return order.custom_location || 'Otro Lugar (No especificado)';
    }
    return dept ? dept.name : order.shipping_destination;
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  // Filtering
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-semibold">Cargando registros de pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-primary" />
            Control de Pedidos (WhatsApp)
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Administra el estado de las compras coordinadas por WhatsApp e ingresadas al sistema.
          </p>
        </div>
        
        <button
          onClick={fetchOrders}
          disabled={refreshing}
          className="self-start sm:self-center px-4 py-2 border border-outline rounded-xl hover:bg-surface-container-high font-semibold text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, referencia o producto..."
            className="w-full h-11 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-xl font-body-md text-sm transition-all outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
          {['todos', 'pendiente', 'pagado', 'en_confeccion', 'enviado', 'entregado', 'cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                statusFilter === status
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-outline'
              }`}
            >
              {status === 'todos' ? 'Todos' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 py-16 text-center text-on-surface-variant flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-12 h-12 mb-3 text-outline" />
          <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-1">No se encontraron pedidos</h3>
          <p className="text-sm max-w-md">
            {searchQuery || statusFilter !== 'todos'
              ? 'No hay registros que coincidan con la búsqueda o el filtro seleccionado.'
              : 'Aún no se han registrado pedidos desde la tienda web.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div 
                key={order.id}
                className={`bg-white rounded-2xl border transition-all duration-300 shadow-xs overflow-hidden ${
                  isExpanded ? 'border-primary ring-2 ring-primary/5' : 'border-outline-variant/30 hover:border-outline-variant/70'
                }`}
              >
                {/* Accordion Trigger Head */}
                <div 
                  onClick={() => toggleExpandOrder(order.id)}
                  className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Reference # */}
                    <div className="shrink-0">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-on-surface-variant block">Referencia</span>
                      <span className="font-mono text-sm font-bold text-primary">#{order.id.substring(0, 8)}</span>
                    </div>

                    {/* Date */}
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-on-surface-variant block">Fecha y Hora</span>
                      <span className="text-sm font-semibold text-on-surface">
                        {new Date(order.created_at).toLocaleDateString('es-BO', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Customer */}
                    <div>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-on-surface-variant block">Cliente</span>
                      <span className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-secondary shrink-0" />
                        {order.customer_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 justify-between lg:justify-end">
                    {/* Items count & Total */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-on-surface-variant block">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} prendas
                      </span>
                      <span className="font-headline-sm text-base font-bold text-primary">
                        {formatCurrency(order.total, true)}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>

                    {/* Expand Chevron */}
                    <div className="text-on-surface-variant">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="border-t border-outline-variant/20 bg-surface-container-lowest/30 p-5 md:p-6 space-y-6">
                    
                    {/* Status Management Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface rounded-xl border border-outline-variant/30">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Administrar Estado del Pedido</span>
                      </div>
                      
                      <div className="relative group min-w-[200px]">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full bg-white border border-outline-variant/60 rounded-lg py-2 px-4 pr-10 font-body-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-xs cursor-pointer appearance-none shadow-sm"
                        >
                          {Object.entries(STATUS_LABELS).map(([key, val]) => (
                            <option key={key} value={key}>{val}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Customer Info Card */}
                      <div className="p-4 bg-white rounded-xl border border-outline-variant/20 shadow-2xs space-y-3">
                        <h4 className="text-xs font-extrabold text-secondary uppercase tracking-widest border-b border-outline-variant/10 pb-1.5 flex items-center gap-1.5">
                          <User className="w-4 h-4" /> Datos de Contacto
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-on-surface-variant font-medium text-xs block">Nombre Registrado:</span> <span className="font-bold text-on-surface">{order.customer_name}</span></p>
                          <p>
                            <span className="text-on-surface-variant font-medium text-xs block">Teléfono / WhatsApp:</span>
                            {order.customer_phone ? (
                              <span className="font-bold text-on-surface flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-primary" /> {order.customer_phone}
                              </span>
                            ) : (
                              <span className="text-on-surface-variant/40 italic">No registrado en base de datos</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Address Card */}
                      <div className="p-4 bg-white rounded-xl border border-outline-variant/20 shadow-2xs space-y-3">
                        <h4 className="text-xs font-extrabold text-secondary uppercase tracking-widest border-b border-outline-variant/10 pb-1.5 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> Destino del Envío
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-on-surface-variant font-medium text-xs block">Destino Indicado:</span>
                            <span className="font-bold text-on-surface flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-primary" /> {getShippingLabel(order)}
                            </span>
                          </p>
                          <p>
                            <span className="text-on-surface-variant font-medium text-xs block">Costo de Despacho:</span>
                            <span className="font-bold text-on-surface">{formatCurrency(order.shipping_cost, true)}</span>
                          </p>
                        </div>
                                          {/* Summary Pricing Card */}
                      <div className="p-4 bg-white rounded-xl border border-outline-variant/20 shadow-2xs space-y-3">
                        <h4 className="text-xs font-extrabold text-secondary uppercase tracking-widest border-b border-outline-variant/10 pb-1.5 flex items-center gap-1.5">
                          <Receipt className="w-4 h-4" /> Desglose Financiero
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-xs text-on-surface-variant">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-on-surface">{formatCurrency(order.subtotal, true)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-on-surface-variant">
                            <span>Costo de Envío:</span>
                            <span className="font-semibold text-on-surface">{formatCurrency(order.shipping_cost, true)}</span>
                          </div>
                          <div className="flex justify-between border-t border-outline-variant/20 pt-1.5 text-xs font-bold text-on-surface">
                            <span>TOTAL:</span>
                            <span className="text-primary">{formatCurrency(order.total, true)}</span>
                          </div>

                          <div className="border-t border-dashed border-outline-variant/30 my-2 pt-2 space-y-2">
                            {editingPaymentId === order.id ? (
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-on-surface-variant block">Editar Adelanto:</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={tempAdelanto}
                                    onChange={(e) => setTempAdelanto(e.target.value)}
                                    className="w-full h-8 px-2 py-1 text-xs border border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded outline-none bg-surface"
                                    placeholder="Adelanto"
                                    min="0"
                                    max={order.total}
                                  />
                                  <button 
                                    onClick={() => savePaymentUpdate(order.id, Number(tempAdelanto), order.total)}
                                    className="h-8 px-3 bg-primary text-white text-[10px] rounded font-bold hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
                                  >
                                    Guardar
                                  </button>
                                  <button 
                                    onClick={() => setEditingPaymentId(null)}
                                    className="h-8 px-2 bg-surface-container text-on-surface-variant text-[10px] rounded font-medium hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-on-surface-variant">Adelanto (Depósito):</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-green-700">{formatCurrency(order.monto_adelanto || 0, true)}</span>
                                  <button 
                                    onClick={() => {
                                      setEditingPaymentId(order.id);
                                      setTempAdelanto((order.monto_adelanto || 0).toString());
                                    }}
                                    className="p-1 hover:bg-surface-container-high rounded text-outline hover:text-primary transition-colors cursor-pointer"
                                    title="Modificar Adelanto"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between border-t border-outline-variant/20 pt-2 text-xs font-bold">
                              <span className="text-on-surface">Saldo Pendiente:</span>
                              <span className={order.saldo_pendiente > 0 ? "text-amber-600 font-extrabold" : "text-green-600 font-extrabold"}>
                                {formatCurrency(order.saldo_pendiente ?? order.total, true)}
                              </span>
                            </div>

                            {/* Informative Payment Status Tag */}
                            <div className="pt-1.5">
                              {order.saldo_pendiente <= 0 ? (
                                <span className="inline-flex w-full items-center justify-center gap-1 py-1 rounded bg-green-50 text-[10px] font-bold text-green-700 border border-green-200">
                                  <CheckCircle2 className="w-3 h-3" /> Totalmente Pagado
                                </span>
                              ) : order.monto_adelanto > 0 ? (
                                <span className="inline-flex w-full items-center justify-center gap-1 py-1 rounded bg-amber-50 text-[10px] font-bold text-amber-700 border border-amber-200">
                                  <AlertCircle className="w-3 h-3" /> Pago Parcial (Adelanto)
                                </span>
                              ) : (
                                <span className="inline-flex w-full items-center justify-center gap-1 py-1 rounded bg-red-50 text-[10px] font-bold text-red-700 border border-red-200">
                                  <XCircle className="w-3 h-3" /> Sin Adelanto Registrado
                                </span>
                              )}
                            </div>

                          </div>
                        </div>
                      </div>     </div>

                    </div>

                    {/* Order Items Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-primary" /> Detalle de las Prendas
                      </h4>
                      
                      <div className="border border-outline-variant/20 rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-left border-collapse text-sm">
                          <thead>
                            <tr className="bg-surface border-b border-outline-variant/15 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                              <th className="px-4 py-3">Imagen</th>
                              <th className="px-4 py-3">Prenda</th>
                              <th className="px-4 py-3">Especificaciones / Detalles</th>
                              <th className="px-4 py-3 text-center">Cantidad</th>
                              <th className="px-4 py-3 text-right">Precio Unit.</th>
                              <th className="px-4 py-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {order.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-surface/30">
                                {/* Image */}
                                <td className="px-4 py-3 shrink-0">
                                  <div className="w-12 h-16 rounded-md overflow-hidden bg-surface-container-low border border-outline-variant/10">
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                </td>

                                {/* Name */}
                                <td className="px-4 py-3 font-semibold text-on-surface">
                                  {item.slug ? (
                                    <a 
                                      href={`/productos/${item.slug}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:text-primary hover:underline flex items-center gap-1"
                                    >
                                      {item.name} <ExternalLink className="w-3 h-3 text-outline" />
                                    </a>
                                  ) : (
                                    item.name
                                  )}
                                  <span className="block text-[10px] text-outline font-bold uppercase tracking-wider">{item.category}</span>
                                </td>

                                {/* Specs */}
                                <td className="px-4 py-3 text-xs">
                                  <div className="flex flex-wrap gap-1">
                                    {item.colorName && (
                                      <span className="px-2 py-0.5 bg-surface-container rounded-full font-medium text-on-surface-variant">
                                        Color: {item.colorName}
                                      </span>
                                    )}
                                    {item.talla && (
                                      <span className="px-2 py-0.5 bg-surface-container rounded-full font-medium text-on-surface-variant">
                                        Talla: {item.talla}
                                      </span>
                                    )}
                                    {item.panos && (
                                      <span className="px-2 py-0.5 bg-surface-container rounded-full font-medium text-on-surface-variant">
                                        Paños: {item.panos}
                                      </span>
                                    )}
                                    {item.largo && (
                                      <span className="px-2 py-0.5 bg-surface-container rounded-full font-medium text-on-surface-variant">
                                        Largo: {item.largo}cm
                                      </span>
                                    )}
                                    {item.cintura && (
                                      <span className="px-2 py-0.5 bg-surface-container rounded-full font-medium text-on-surface-variant">
                                        Cintura: {item.cintura}cm
                                      </span>
                                    )}
                                    {item.fechaEntrega && (
                                      <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed rounded-full font-semibold flex items-center gap-1 text-[10px]">
                                        Confección: {item.fechaEntrega}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Quantity */}
                                <td className="px-4 py-3 text-center font-bold text-on-surface">
                                  {item.quantity}x
                                </td>

                                {/* Price Unit */}
                                <td className="px-4 py-3 text-right font-medium text-on-surface">
                                  {formatCurrency(item.price, true)}
                                </td>

                                {/* Subtotal */}
                                <td className="px-4 py-3 text-right font-bold text-primary">
                                  {formatCurrency(item.price * item.quantity, true)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Footer Actions inside Details */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/10">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-4 py-2 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Registro
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
