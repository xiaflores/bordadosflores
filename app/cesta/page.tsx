'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { useCart } from '@/context/CartContext';
import CartItemRow from '@/components/cart/CartItemRow';
import { DEPARTAMENTOS, getDepartamentosWithCosts } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { 
  Loader2, 
  ShoppingBasket, 
  ShoppingBag, 
  BookOpen, 
  Truck, 
  Palette, 
  Info, 
  Receipt, 
  ChevronDown 
} from 'lucide-react';

export default function CestaPage() {
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal, cartCount, isLoaded, clearCart } = useCart();
  const [selectedDeptId, setSelectedDeptId] = useState('or');
  const [customLocation, setCustomLocation] = useState('');
  const [shippingCosts, setShippingCosts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const fetchShippingCosts = async () => {
      try {
        const res = await fetch('/api/admin/home-config');
        if (res.ok) {
          const data = await res.json();
          if (data.texts?.shippingCosts) {
            setShippingCosts(data.texts.shippingCosts);
          }
        }
      } catch (err) {
        console.error('Error fetching shipping costs for cart:', err);
      }
    };
    fetchShippingCosts();
  }, []);

  // Set initial default department from localStorage if available
  useEffect(() => {
    const savedDept = localStorage.getItem('bordados_flores_shipping_dept');
    if (savedDept && DEPARTAMENTOS.some(d => d.id === savedDept)) {
      setSelectedDeptId(savedDept);
    }
  }, []);

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    localStorage.setItem('bordados_flores_shipping_dept', deptId);
  };

  const departamentos = getDepartamentosWithCosts(shippingCosts);
  const selectedDept = departamentos.find(d => d.id === selectedDeptId) || departamentos[0];
  const total = cartSubtotal + selectedDept.costo;

  const handleCheckout = async () => {
    // 1. Get current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    const customerName = user?.user_metadata?.full_name || user?.email || 'Cliente Web';
    const customerPhone = user?.phone || '';

    // 2. Insert order details in Supabase
    let orderId = '';
    try {
      const { data: insertedOrder, error } = await supabase
        .from('pedidos')
        .insert([{
          customer_name: customerName,
          customer_phone: customerPhone,
          shipping_destination: selectedDeptId,
          custom_location: selectedDeptId === 'otro' ? customLocation : null,
          subtotal: cartSubtotal,
          shipping_cost: selectedDept.costo,
          total: total,
          monto_adelanto: 0,
          saldo_pendiente: total,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            colorName: item.colorName,
            colorHex: item.colorHex,
            panos: item.panos,
            largo: item.largo,
            cintura: item.cintura,
            talla: item.talla,
            fechaEntrega: item.fechaEntrega,
            slug: item.slug
          })),
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      if (insertedOrder) {
        orderId = insertedOrder.id;
      }
    } catch (err) {
      console.error('Error saving order in database:', err);
    }

    let text = `🇧🇴 *NUEVO PEDIDO - BORDADOS FLORES* 🇧🇴\n`;
    if (orderId) {
      text += `*Referencia:* #${orderId.substring(0, 8)}\n`;
    }
    text += `\n`;
    text += `Hola Bordados Flores, me gustaría coordinar la compra de los siguientes artículos de mi cesta:\n\n`;

    const formatRow = (label: string, value: string) => {
      const paddedLabel = label.padEnd(15).substring(0, 15);
      const paddedValue = value.padEnd(23).substring(0, 23);
      return `| ${paddedLabel} | ${paddedValue} |\n`;
    };

    cartItems.forEach((item, index) => {
      // Build absolute product URL using window.location.origin
      const productLink = `${window.location.origin}/productos/${item.slug || item.id}`;
      
      text += `🛍️ *PRODUCTO #${index + 1}*\n`;
      text += `${productLink}\n\n`;
      
      text += `\`\`\`\n`;
      text += `+-----------------+-------------------------+\n`;
      text += formatRow('Detalle', 'Valor');
      text += `+-----------------+-------------------------+\n`;
      text += formatRow('Nombre', item.name);
      text += formatRow('Cantidad', item.quantity + 'x');
      text += formatRow('Categoría', item.category);
      text += formatRow('Disponibilidad', item.availability);
      
      if (item.colorName) text += formatRow('Color', item.colorName);
      if (item.talla) text += formatRow('Talla', item.talla);
      if (item.panos) text += formatRow('Paños', item.panos + '');
      if (item.largo) text += formatRow('Largo', item.largo + ' cm');
      if (item.cintura) text += formatRow('Cintura', item.cintura + ' cm');
      if (item.fechaEntrega) text += formatRow('Confección', item.fechaEntrega);
      
      text += formatRow('Precio Unit.', formatCurrency(item.price, true));
      text += formatRow('Subtotal', formatCurrency(item.price * item.quantity, true));
      text += `+-----------------+-------------------------+\n`;
      text += `\`\`\`\n\n`;
    });

    const shippingName = selectedDeptId === 'otro' 
      ? `Otro Lugar/Provincia: ${customLocation || 'No especificado'}` 
      : selectedDept.name;

    text += `==========================================\n`;
    text += `📍 *Departamento de Envío:* ${shippingName}\n`;
    text += `💰 *Subtotal Prendas:* ${formatCurrency(cartSubtotal, true)}\n`;
    text += `🚚 *Costo de Envío:* ${formatCurrency(selectedDept.costo, true)}\n`;
    text += `💵 *TOTAL A PAGAR:* ${formatCurrency(total, true)}\n`;
    text += `==========================================\n\n`;
    text += `Por favor, confírmenme los datos para realizar el pago (transferencia o QR) y coordinar el envío. ¡Muchas gracias!`;

    const encodedMessage = encodeURIComponent(text);
    
    // Clear the cart on successful checkout
    clearCart();
    
    window.open(`https://wa.me/59171182580?text=${encodedMessage}`, '_blank');
  };

  const stockItems = cartItems.filter(item => item.availability === 'En Stock');
  const customItems = cartItems.filter(item => item.availability === 'A Pedido');

  // Prevent flash or visual shifts before hydration completes
  if (!isLoaded) {
    return (
      <>
        <Header />
        <div className="artisanal-bg min-h-screen pt-24 pb-28 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-body-md text-on-surface-variant font-semibold">Cargando tu cesta...</p>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="artisanal-bg min-h-screen pt-24 pb-28 px-margin-mobile md:px-margin-tablet lg:px-margin-desktop">
        <main className="max-w-container-max mx-auto w-full">

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white/70 backdrop-blur-md rounded-2xl border border-primary/10 max-w-2xl mx-auto shadow-sm p-8 text-center">
              <ShoppingBag className="w-16 h-16 text-primary/30 mb-4" />
              <h2 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">Tu cesta está vacía</h2>
              <p className="font-body-md text-on-surface-variant mb-8 max-w-md">
                Aún no has agregado prendas a tu cesta. Explora nuestras exclusivas colecciones de polleras, sacos bordados y accesorios hechos a mano.
              </p>
              <Link
                href="/catalogo"
                className="px-8 py-3 bg-primary text-white hover:bg-primary/95 font-headline-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Cart Items grouped */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Items in Stock */}
                {stockItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-primary/15 pb-2">
                      <Truck className="w-6 h-6 text-green-600" />
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                        Prendas en Stock
                        <span className="font-label-md text-xs px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 uppercase font-extrabold tracking-wider">
                          Listo para envío (24-48h)
                        </span>
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {stockItems.map(item => (
                        <CartItemRow 
                          key={item.key} 
                          item={item} 
                          onUpdateQuantity={updateQuantity} 
                          onRemove={removeFromCart}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Items On Order (Custom) */}
                {customItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-primary/15 pb-2">
                      <Palette className="w-6 h-6 text-primary" />
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2 flex-wrap">
                        Confección a Pedido
                        <span className="font-label-md text-xs px-2.5 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/20 uppercase font-extrabold tracking-wider">
                          Hecho a mano (15-25 días)
                        </span>
                      </h2>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="font-body-sm text-on-surface-variant text-xs leading-relaxed">
                        <strong>Prendas artesanales personalizadas:</strong> Estas piezas se confeccionan especialmente para ti según tus medidas y elecciones de color. El trabajo artesanal requiere un tiempo estimado de 15 a 25 días antes del despacho. ¡Agradecemos tu paciencia y apoyo al comercio justo!
                      </p>
                    </div>

                    <div className="space-y-4">
                      {customItems.map(item => (
                        <CartItemRow 
                          key={item.key} 
                          item={item} 
                          onUpdateQuantity={updateQuantity} 
                          onRemove={removeFromCart}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Checkout Summary */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-primary/10 p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface pb-3 border-b border-primary/10 flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-primary" />
                  Resumen del Pedido
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Subtotal Prendas</span>
                    <span className="font-semibold text-on-surface">{formatCurrency(cartSubtotal, true)}</span>
                  </div>

                  {/* Destination dropdown selector */}
                  <div className="space-y-2 pt-2 border-t border-primary/5">
                    <label className="font-label-md text-xs text-on-surface-variant block uppercase tracking-wider">
                      Destino de Envío (Bolivia)
                    </label>
                    <div className="relative group">
                      <select
                        value={selectedDeptId}
                        onChange={(e) => handleDeptChange(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 pr-10 font-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none text-sm"
                      >
                        {departamentos.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} {dept.costo > 0 ? `(+ ${formatCurrency(dept.costo, true)})` : '(Gratis / Recojo)'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant group-hover:text-primary transition-colors" />
                    </div>

                    {selectedDeptId === 'otro' && (
                      <div className="pt-2 animate-fadeIn space-y-1">
                        <label className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider block">
                          Especificar lugar de envío
                        </label>
                        <input
                          type="text"
                          value={customLocation}
                          onChange={(e) => setCustomLocation(e.target.value)}
                          placeholder="Ej. Challapata, Oruro / Coroico, La Paz"
                          className="w-full bg-surface border border-outline-variant rounded-xl py-2 px-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2 border-t border-primary/5">
                    <span className="text-on-surface-variant">Costo de Envío</span>
                    <span className="font-semibold text-on-surface">{formatCurrency(selectedDept.costo, true)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                    <span className="font-bold text-on-surface text-base">TOTAL A PAGAR</span>
                    <span className="font-headline-lg text-xl font-bold text-primary">{formatCurrency(total, true)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full h-14 bg-primary text-on-primary font-headline-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    Pedir por WhatsApp
                  </button>
                  <p className="font-body-sm text-[11px] text-center text-on-surface-variant mt-3 leading-tight">
                    Al confirmar, se abrirá WhatsApp con el resumen de tu cesta para que un artesano de Bordados Flores te indique los métodos de pago y confirme el despacho.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
