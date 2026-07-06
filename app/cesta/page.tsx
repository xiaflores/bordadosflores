'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useCart, CartItem } from '../context/CartContext';
import { 
  Loader2, 
  ShoppingBasket, 
  ShoppingBag, 
  BookOpen, 
  Truck, 
  Palette, 
  Info, 
  Receipt, 
  ChevronDown, 
  Calendar, 
  Minus, 
  Plus, 
  Trash2 
} from 'lucide-react';

const DEPARTAMENTOS = [
  { id: 'or', name: 'Oruro (Recojo en Tienda/Taller)', costo: 0 },
  { id: 'lp', name: 'La Paz', costo: 15 },
  { id: 'cb', name: 'Cochabamba', costo: 25 },
  { id: 'sc', name: 'Santa Cruz', costo: 25 },
  { id: 'pt', name: 'Potosí', costo: 30 },
  { id: 'ch', name: 'Chuquisaca', costo: 30 },
  { id: 'tj', name: 'Tarija', costo: 30 },
  { id: 'be', name: 'Beni', costo: 40 },
  { id: 'pd', name: 'Pando', costo: 40 },
  { id: 'otro', name: 'Otro (Especificar provincia/lugar)', costo: 35 }
];

export default function CestaPage() {
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal, cartCount, isLoaded } = useCart();
  const [selectedDeptId, setSelectedDeptId] = useState('or');
  const [customLocation, setCustomLocation] = useState('');

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

  const selectedDept = DEPARTAMENTOS.find(d => d.id === selectedDeptId) || DEPARTAMENTOS[0];
  const total = cartSubtotal + selectedDept.costo;

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;
  };

  const handleCheckout = () => {
    const stockItems = cartItems.filter(item => item.availability === 'En Stock');
    const customItems = cartItems.filter(item => item.availability === 'A Pedido');

    let text = `🇧🇴 *NUEVO PEDIDO - BORDADOS FLORES* 🇧🇴\n\n`;
    text += `Hola Bordados Flores, me gustaría coordinar la compra de los siguientes artículos de mi cesta:\n\n`;

    if (stockItems.length > 0) {
      text += `📦 *ARTÍCULOS EN STOCK* (Entrega en 24-48h):\n`;
      stockItems.forEach(item => {
        text += `• *${item.quantity}x ${item.name}* (${item.category})\n`;
        const attrs = [];
        if (item.colorName) attrs.push(`Color: ${item.colorName}`);
        if (item.talla) attrs.push(`Talla: ${item.talla}`);
        if (item.panos) attrs.push(`Paños: ${item.panos}`);
        if (item.largo) attrs.push(`Largo: ${item.largo}cm`);
        if (item.cintura) attrs.push(`Cintura: ${item.cintura}cm`);
        if (attrs.length > 0) text += `  _${attrs.join(' | ')}_\n`;
        text += `  _Precio:_ ${formatCurrency(item.price * item.quantity)}\n\n`;
      });
    }

    if (customItems.length > 0) {
      text += `🧶 *ARTÍCULOS A PEDIDO* (Confección artesanal 15-25 días):\n`;
      customItems.forEach(item => {
        text += `• *${item.quantity}x ${item.name}* (${item.category})\n`;
        const attrs = [];
        if (item.colorName) attrs.push(`Color: ${item.colorName}`);
        if (item.talla) attrs.push(`Talla: ${item.talla}`);
        if (item.panos) attrs.push(`Paños: ${item.panos}`);
        if (item.largo) attrs.push(`Largo: ${item.largo}cm`);
        if (item.cintura) attrs.push(`Cintura: ${item.cintura}cm`);
        if (item.fechaEntrega) attrs.push(`Entrega estimada: ${item.fechaEntrega}`);
        if (attrs.length > 0) text += `  _${attrs.join(' | ')}_\n`;
        text += `  _Precio:_ ${formatCurrency(item.price * item.quantity)}\n\n`;
      });
    }

    const shippingName = selectedDeptId === 'otro' 
      ? `Otro Lugar/Provincia: ${customLocation || 'No especificado'}` 
      : selectedDept.name;

    text += `----------------------------------\n`;
    text += `📍 *Departamento de Envío:* ${shippingName} (${formatCurrency(selectedDept.costo)})\n`;
    text += `💰 *Subtotal:* ${formatCurrency(cartSubtotal)}\n`;
    text += `💵 *Total a Pagar:* ${formatCurrency(total)}\n\n`;
    text += `Por favor, confírmenme los datos para realizar el pago (transferencia o QR) y coordinar el envío. ¡Muchas gracias!`;

    const encodedMessage = encodeURIComponent(text);
    window.open(`https://wa.me/591?text=${encodedMessage}`, '_blank');
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
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-8 text-center lg:text-left flex items-center justify-center lg:justify-start gap-3">
            <ShoppingBasket className="w-10 h-10 text-primary" />
            Mi Cesta de Compras
          </h1>

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
                          formatCurrency={formatCurrency}
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
                          formatCurrency={formatCurrency}
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

                <div className="space-y-4 font-body-md text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Prendas ({cartCount})</span>
                    <span className="font-semibold text-on-surface">{formatCurrency(cartSubtotal)}</span>
                  </div>

                  {/* Shipping Section */}
                  <div className="space-y-2 pt-2 border-t border-primary/5">
                    <label htmlFor="dept-select" className="font-headline-sm text-sm font-semibold text-on-surface block">
                      Departamento de Envío (Bolivia)
                    </label>
                    <div className="relative">
                      <select
                        id="dept-select"
                        value={selectedDeptId}
                        onChange={(e) => handleDeptChange(e.target.value)}
                        className="w-full h-11 px-3 bg-surface-container-low border border-primary/20 rounded-xl font-body-md text-on-surface focus:border-primary cursor-pointer transition-all outline-none appearance-none"
                      >
                        {DEPARTAMENTOS.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name} {dept.costo > 0 ? `(+ ${formatCurrency(dept.costo)})` : '(Gratis / Recojo)'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                    </div>
                  </div>

                  {selectedDeptId === 'otro' && (
                    <div className="space-y-2 pt-2">
                      <label htmlFor="custom-location" className="font-headline-sm text-sm font-semibold text-on-surface block">
                        Especificar lugar (provincia/municipio)
                      </label>
                      <input
                        type="text"
                        id="custom-location"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="Ej. Challapata, Oruro / Copacabana, La Paz"
                        className="w-full h-11 px-4 bg-surface-container-low border border-primary/20 rounded-xl font-body-md text-on-surface focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/40"
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span>Costo de Envío</span>
                    <span className="font-semibold text-on-surface">{formatCurrency(selectedDept.costo)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t-2 border-primary/15">
                    <span className="font-headline-sm text-lg font-bold text-on-surface">Total</span>
                    <span className="font-headline-lg text-xl font-bold text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full h-14 bg-[#25d366] text-white hover:bg-[#20ba59] font-headline-sm font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md hover:shadow-lg uppercase tracking-wider text-sm"
                  >
                    {/* SVG WhatsApp icon */}
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.743 1.452 5.51 0 9.995-4.485 9.998-10 .002-2.673-1.037-5.184-2.927-7.076C16.522 1.639 14.019.596 11.35.596 5.845.596 1.36 5.08 1.357 10.58c-.001 1.7.452 3.359 1.31 4.816L1.65 20.89l5.59-1.464-.593-.272zm9.194-6.388c-.282-.141-1.666-.822-1.923-.916-.257-.095-.443-.141-.63.141-.186.282-.719.916-.882 1.1-.162.186-.326.21-.608.069-.282-.141-1.194-.44-2.276-1.405-.842-.751-1.41-1.678-1.575-1.96-.165-.282-.018-.434.123-.574.127-.127.282-.329.424-.494.141-.165.188-.282.282-.47.094-.188.047-.353-.024-.494-.071-.141-.63-1.517-.862-2.082-.226-.543-.454-.47-.63-.478-.163-.008-.35-.008-.537-.008-.187 0-.49.07-.747.353-.257.282-.98.959-.98 2.337 0 1.378 1.002 2.71 1.143 2.898.14.188 1.972 3.011 4.777 4.22.668.288 1.19.46 1.597.59.67.213 1.28.183 1.761.111.537-.08 1.666-.68 1.9-.1337.234-.659.234-1.222.164-1.316-.07-.095-.257-.141-.539-.282z" />
                    </svg>
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

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
  formatCurrency: (amount: number) => string;
}

function CartItemRow({ item, onUpdateQuantity, onRemove, formatCurrency }: CartItemRowProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm hover:bg-white border border-primary/10 rounded-2xl p-4 md:p-6 shadow-[0px_4px_15px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-4 md:gap-6 items-center transition-all">
      {/* Product Image */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container-low shrink-0 shadow-sm">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Item info */}
      <div className="flex-1 w-full space-y-2 text-center md:text-left">
        <div>
          <span className="font-label-md text-[10px] text-primary uppercase tracking-widest font-extrabold">{item.category}</span>
          <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">{item.name}</h3>
        </div>

        {/* Selected Attributes Chips */}
        <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
          {item.colorName && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full text-xs font-body-sm text-on-surface-variant font-medium">
              {item.colorHex && (
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0" 
                  style={{ backgroundColor: item.colorHex }}
                />
              )}
              Color: {item.colorName}
            </span>
          )}
          {item.talla && (
            <span className="px-2.5 py-1 bg-surface-container rounded-full text-xs font-body-sm text-on-surface-variant font-medium">
              Talla: {item.talla}
            </span>
          )}
          {item.panos && (
            <span className="px-2.5 py-1 bg-surface-container rounded-full text-xs font-body-sm text-on-surface-variant font-medium">
              Paños: {item.panos}
            </span>
          )}
          {item.largo && (
            <span className="px-2.5 py-1 bg-surface-container rounded-full text-xs font-body-sm text-on-surface-variant font-medium">
              Largo: {item.largo}cm
            </span>
          )}
          {item.cintura && (
            <span className="px-2.5 py-1 bg-surface-container rounded-full text-xs font-body-sm text-on-surface-variant font-medium">
              Cintura: {item.cintura}cm
            </span>
          )}
          {item.fechaEntrega && (
            <span className="px-2.5 py-1 bg-primary-fixed text-on-primary-fixed rounded-full text-[11px] font-body-sm font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Confección: {item.fechaEntrega}
            </span>
          )}
        </div>
      </div>

      {/* Quantity & Price controls */}
      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t border-primary/5 md:border-t-0 shrink-0">
        
        {/* Quantity selector */}
        <div className="flex items-center border border-primary/20 rounded-xl bg-surface-container-low px-1 py-1">
          <button
            onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-90 transition-all cursor-pointer"
            aria-label="Disminuir cantidad"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-headline-sm font-semibold text-sm text-on-surface">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container active:scale-90 transition-all cursor-pointer"
            aria-label="Aumentar cantidad"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing details */}
        <div className="text-right">
          <div className="font-headline-sm text-base font-bold text-primary">
            {formatCurrency(item.price * item.quantity)}
          </div>
          {item.quantity > 1 && (
            <div className="font-body-sm text-[11px] text-on-surface-variant">
              ({formatCurrency(item.price)} c/u)
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={() => onRemove(item.key)}
          className="p-2 rounded-full text-red-500 hover:bg-red-50 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Eliminar producto"
        >
          <Trash2 className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}
