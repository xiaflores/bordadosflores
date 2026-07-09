'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { DEPARTAMENTOS } from '@/lib/constants';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Receipt,
  XCircle,
  Activity
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
  shipping_destination: string;
  custom_location: string | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: 'pendiente' | 'pagado' | 'en_confeccion' | 'enviado' | 'entregado' | 'cancelado';
  items: OrderItem[];
  monto_adelanto: number;
  saldo_pendiente: number;
}

const STATUS_DETAILS = {
  pendiente: {
    label: 'Pendiente de Pago / Coordinación',
    description: 'Hemos recibido la solicitud de tu pedido. Estamos coordinando el adelanto del pago y detalles de confección contigo a través de WhatsApp.',
    colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
    stepIndex: 1
  },
  pagado: {
    label: 'Pago Recibido / Listo para Confección',
    description: 'Hemos confirmado tu depósito o adelanto. Tu pedido ha sido ingresado a nuestro taller artesanal.',
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
    stepIndex: 2
  },
  en_confeccion: {
    label: 'En Taller / Confección y Bordado',
    description: '¡Manos a la obra! Nuestros artesanos están tejiendo, bordando y dando forma a tu prenda personalizada con la máxima calidad.',
    colorClass: 'text-purple-600 bg-purple-50 border-purple-200',
    stepIndex: 3
  },
  enviado: {
    label: 'Despachado / En Camino',
    description: '¡Tu pedido está listo y ha sido enviado! Tu paquete está en camino a tu dirección de destino por transporte coordinado.',
    colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    stepIndex: 4
  },
  entregado: {
    label: 'Entregado con Éxito',
    description: 'El pedido ha sido entregado en tus manos. Esperamos que disfrutes de esta hermosa muestra de tradición y cultura boliviana.',
    colorClass: 'text-green-600 bg-green-50 border-green-200',
    stepIndex: 5
  },
  cancelado: {
    label: 'Pedido Cancelado',
    description: 'Este pedido ha sido anulado de nuestro registro.',
    colorClass: 'text-red-600 bg-red-50 border-red-200',
    stepIndex: 0
  }
};

const TIMELINE_STEPS = [
  { label: 'Recibido', desc: 'Registro inicial' },
  { label: 'Confirmado', desc: 'Seña / Pago' },
  { label: 'Taller', desc: 'Bordado artesanal' },
  { label: 'Enviado', desc: 'Despacho' },
  { label: 'Entregado', desc: 'Finalizado' }
];

export default function OrderTrackingPage() {
  const [refInput, setRefInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check URL params for direct link tracking: /pedidos?ref=xxxx
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        setRefInput(refParam);
        trackOrder(refParam);
      }
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder(refInput);
  };

  const trackOrder = async (queryRef: string) => {
    const cleanRef = queryRef.trim().replace('#', '');
    if (cleanRef.length < 4) {
      setErrorMsg('Por favor ingresa al menos 4 caracteres de tu código de referencia.');
      setOrder(null);
      return;
    }

    setSearching(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.rpc('buscar_pedido_por_referencia', { ref_code: cleanRef });
      
      if (error) throw error;

      if (data && data.length > 0) {
        setOrder(data[0] as Order);
        // Update URL query param quietly
        const newUrl = `${window.location.pathname}?ref=${cleanRef}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } else {
        setErrorMsg('No encontramos ningún pedido con ese código de referencia. Por favor verifica el número enviado a tu WhatsApp.');
        setOrder(null);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setErrorMsg('Ocurrió un error al consultar el estado. Inténtalo de nuevo.');
      setOrder(null);
    } finally {
      setSearching(false);
    }
  };

  const getShippingLabel = (orderObj: Order) => {
    const dept = DEPARTAMENTOS.find(d => d.id === orderObj.shipping_destination);
    if (orderObj.shipping_destination === 'otro') {
      return orderObj.custom_location || 'Otro Lugar (No especificado)';
    }
    return dept ? dept.name : orderObj.shipping_destination;
  };

  const currentStatusInfo = order ? STATUS_DETAILS[order.status] : null;

  return (
    <>
      <Header />
      <div className="artisanal-bg min-h-screen pt-24 pb-28 px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">
        <main className="max-w-3xl mx-auto w-full space-y-8">
          
          {/* Header Title */}
          <div className="text-center space-y-2">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Seguimiento de Pedido
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-lg mx-auto">
              Ingresa el código de referencia de 8 caracteres que enviamos a tu WhatsApp para verificar el avance y detalles de tu pedido.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-lg max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                <input
                  type="text"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="Ej: e3b8a1c9 o #e3b8a1c9"
                  className="w-full h-12 pl-12 pr-4 bg-surface rounded-2xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 font-mono text-sm tracking-wider uppercase transition-all outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/10 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {searching ? 'Buscando...' : 'Consultar Estado'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {errorMsg && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Order Details Display Card */}
          {order && currentStatusInfo && (
            <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-xl space-y-8 animate-fade-in">
              
              {/* Header Details */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-6">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-outline block">Referencia del Pedido</span>
                  <h3 className="font-mono text-xl font-bold text-primary">#{order.id.substring(0, 8)}</h3>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-outline block">Fecha de Registro</span>
                  <span className="text-sm font-semibold text-on-surface">
                    {new Date(order.created_at).toLocaleDateString('es-BO', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Status & Banner Description */}
              <div className={`p-5 rounded-2xl border ${currentStatusInfo.colorClass} space-y-2`}>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-sm uppercase tracking-wide">{currentStatusInfo.label}</h4>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{currentStatusInfo.description}</p>
              </div>

              {/* Step Timeline Progress */}
              {order.status !== 'cancelado' && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Línea de Tiempo de Confección</h4>
                  
                  <div className="relative flex justify-between items-center w-full">
                    {/* Line behind steps */}
                    <div className="absolute left-0 right-0 h-1 bg-surface-container-high -translate-y-1/2 top-1/2 z-0" />
                    
                    {/* Filled active line */}
                    <div 
                      className="absolute left-0 h-1 bg-primary -translate-y-1/2 top-1/2 z-0 transition-all duration-700" 
                      style={{ 
                        width: `${((currentStatusInfo.stepIndex - 1) / (TIMELINE_STEPS.length - 1)) * 100}%` 
                      }}
                    />

                    {TIMELINE_STEPS.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isActive = stepNum <= currentStatusInfo.stepIndex;
                      const isCurrent = stepNum === currentStatusInfo.stepIndex;

                      return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-500 ${
                              isCurrent 
                                ? 'bg-primary text-on-primary border-primary scale-110 shadow-md ring-4 ring-primary/10' 
                                : isActive 
                                  ? 'bg-primary-fixed text-on-primary-fixed border-primary-container' 
                                  : 'bg-surface border-outline-variant text-on-surface-variant/40'
                            }`}
                          >
                            {isActive && !isCurrent ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              stepNum
                            )}
                          </div>
                          <span className={`text-[11px] font-bold tracking-tight ${isActive ? 'text-primary' : 'text-on-surface-variant/50'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery and Customer Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/15">
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" /> Datos de Envío
                  </h4>
                  <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 space-y-2 text-sm">
                    <p><span className="text-on-surface-variant text-xs block">Cliente Destinatario:</span> <span className="font-bold text-on-surface">{order.customer_name}</span></p>
                    <p><span className="text-on-surface-variant text-xs block">Destino de Entrega:</span> <span className="font-bold text-on-surface flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {getShippingLabel(order)}</span></p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-primary" /> Detalles de Pago
                  </h4>
                  <div className="bg-surface rounded-2xl p-4 border border-outline-variant/20 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant text-xs">Total del Pedido:</span>
                      <span className="font-semibold text-on-surface">{formatCurrency(order.total, true)}</span>
                    </div>
                    <div className="flex justify-between border-b border-outline-variant/15 pb-1.5">
                      <span className="text-on-surface-variant text-xs">Adelanto Recibido:</span>
                      <span className="font-bold text-green-700">{formatCurrency(order.monto_adelanto || 0, true)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold">
                      <span className="text-on-surface text-xs">Saldo por Pagar:</span>
                      <span className={order.saldo_pendiente > 0 ? "text-amber-600" : "text-green-600"}>
                        {formatCurrency(order.saldo_pendiente, true)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-primary" /> Prendas Solicitadas
                </h4>

                <div className="border border-outline-variant/20 rounded-2xl overflow-hidden bg-white divide-y divide-outline-variant/10">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-4 flex gap-4 items-center">
                      <div className="w-14 h-20 rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/10 shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="font-semibold text-on-surface truncate text-sm">{item.name}</h5>
                          <span className="text-xs font-bold text-primary shrink-0">{item.quantity}x {formatCurrency(item.price, true)}</span>
                        </div>
                        <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mb-1.5">{item.category}</span>
                        
                        <div className="flex flex-wrap gap-1">
                          {item.colorName && (
                            <span className="px-2 py-0.5 bg-surface text-[10px] rounded-full border border-outline-variant/20 text-on-surface-variant">
                              Color: {item.colorName}
                            </span>
                          )}
                          {item.talla && (
                            <span className="px-2 py-0.5 bg-surface text-[10px] rounded-full border border-outline-variant/20 text-on-surface-variant">
                              Talla: {item.talla}
                            </span>
                          )}
                          {item.panos && (
                            <span className="px-2 py-0.5 bg-surface text-[10px] rounded-full border border-outline-variant/20 text-on-surface-variant">
                              Paños: {item.panos}
                            </span>
                          )}
                          {item.largo && (
                            <span className="px-2 py-0.5 bg-surface text-[10px] rounded-full border border-outline-variant/20 text-on-surface-variant">
                              Largo: {item.largo}cm
                            </span>
                          )}
                          {item.cintura && (
                            <span className="px-2 py-0.5 bg-surface text-[10px] rounded-full border border-outline-variant/20 text-on-surface-variant">
                              Cintura: {item.cintura}cm
                            </span>
                          )}
                          {item.fechaEntrega && (
                            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed rounded-full text-[9px] font-bold">
                              Entrega Confección: {item.fechaEntrega}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consult / Follow Up WhatsApp Button */}
              <div className="pt-4 text-center border-t border-outline-variant/15">
                <a
                  href={`https://wa.me/59171182580?text=${encodeURIComponent(
                    `Hola Bordados Flores, me gustaría consultar el estado de mi pedido #${order.id.substring(0, 8)} a nombre de ${order.customer_name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold items-center justify-center gap-2 shadow-md shadow-green-100 transition-all cursor-pointer active:scale-98 text-sm"
                >
                  Consultar Saldo o Entrega por WhatsApp
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

            </div>
          )}

        </main>
      </div>
      <BottomNav />
    </>
  );
}
