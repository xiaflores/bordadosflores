'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import BottomNav from '../../components/BottomNav';
import { Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  ChevronDown, 
  Calendar, 
  Truck, 
  Layers, 
  Zap, 
  Info, 
  Star, 
  Lock, 
  ShoppingBasket, 
  Loader2, 
  CheckCircle, 
  MessageSquare 
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shippingDestination, setShippingDestination] = useState('or');
  const [customShippingLocation, setCustomShippingLocation] = useState('');
  const [cartState, setCartState] = useState<'idle' | 'processing' | 'added'>('idle');

  // Sync shipping destination selection with localStorage for the cart page
  useEffect(() => {
    localStorage.setItem('bordados_flores_shipping_dept', shippingDestination);
    if (shippingDestination === 'otro') {
      localStorage.setItem('bordados_flores_custom_shipping_location', customShippingLocation);
    }
  }, [shippingDestination, customShippingLocation]);

  // Customization state for 'A Pedido'
  const isCustomizable = product.availability === 'A Pedido';
  
  // Polleras Customization
  const basePanels = product.panos || 10;
  const [selectedColor, setSelectedColor] = useState({
    name: product.color_name || 'Verde Esmeralda',
    hex: product.color_hex || '#004d40'
  });
  const [selectedPanels, setSelectedPanels] = useState(basePanels);
  const [selectedLength, setSelectedLength] = useState(product.largo || 45);
  const [waistMeasurement, setWaistMeasurement] = useState('');

  // Jackets Customization
  const [selectedJacketSize, setSelectedJacketSize] = useState('M');
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const [jacketDeliveryDate, setJacketDeliveryDate] = useState('');

  useEffect(() => {
    // Set default date to 15 days from now
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 15);
    setJacketDeliveryDate(minDate.toISOString().split('T')[0]);
  }, []);

  const getMinDeliveryDateString = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 15);
    return minDate.toISOString().split('T')[0];
  };

  // Calculate dynamic price based on panels (only for Polleras A Pedido)
  const isPollera = product.category === 'Polleras';
  const isJacket = product.category === 'Chaquetas';
  const isAccessory = product.category === 'Accesorios' || product.category === 'Textiles';

  const currentPrice = (isPollera && isCustomizable)
    ? Math.round((product.price / basePanels) * selectedPanels)
    : product.price;


  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toLocaleString('es-BO')}`;
  };

  // Helper to get estimated delivery date for Polleras (15-20 days from now)
  const getEstimatedDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 15);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 20);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${minDate.toLocaleDateString('es-ES', options)} - ${maxDate.toLocaleDateString('es-ES', options)}`;
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    setCartState('processing');
    
    // Construct cart item attributes based on category and customization
    const cartItemAttributes: any = {
      id: product.id,
      name: product.name,
      category: product.category,
      price: currentPrice,
      imageUrl: product.imageUrl,
      availability: product.availability,
    };

    if (isPollera) {
      if (isCustomizable) {
        cartItemAttributes.colorName = selectedColor.name;
        cartItemAttributes.colorHex = selectedColor.hex;
        cartItemAttributes.panos = selectedPanels;
        cartItemAttributes.largo = selectedLength;
        cartItemAttributes.cintura = waistMeasurement || 'No especificada';
        cartItemAttributes.fechaEntrega = getEstimatedDate();
      } else {
        cartItemAttributes.colorName = product.color_name || 'Único';
        cartItemAttributes.colorHex = product.color_hex || '#000000';
        cartItemAttributes.panos = product.panos;
        cartItemAttributes.largo = product.largo;
        cartItemAttributes.cintura = product.cintura || 'Estándar';
      }
    } else if (isJacket) {
      if (isCustomizable) {
        cartItemAttributes.colorName = product.color_name || 'Único';
        cartItemAttributes.colorHex = product.color_hex || '#000000';
        cartItemAttributes.talla = selectedJacketSize;
        cartItemAttributes.fechaEntrega = jacketDeliveryDate;
      } else {
        cartItemAttributes.colorName = product.color_name || 'Único';
        cartItemAttributes.colorHex = product.color_hex || '#000000';
        cartItemAttributes.talla = product.talla || 'M';
      }
    } else {
      // Accessories and Textiles
      cartItemAttributes.colorName = product.color_name || 'Único';
      cartItemAttributes.colorHex = product.color_hex || '#000000';
    }

    addToCart(cartItemAttributes);

    setTimeout(() => {
      setCartState('added');
      setTimeout(() => {
        setCartState('idle');
      }, 2000);
    }, 600);
  };

  // Contact on WhatsApp helper
  const handleWhatsAppConsult = () => {
    let customText = '';
    if (isPollera) {
      customText = isCustomizable 
        ? `Color: ${selectedColor.name}, Paños: ${selectedPanels}, Largo: ${selectedLength}cm, Cintura: ${waistMeasurement || 'No especificada'}cm` 
        : `Especificaciones fijas de stock: Color: ${product.color_name}, Largo: ${product.largo}cm, Cintura: ${product.cintura}cm, Paños: ${product.panos}`;
    } else if (isJacket) {
      customText = isCustomizable
        ? `Color: ${product.color_name}, Talla Seleccionada: ${selectedJacketSize}, Fecha de Entrega: ${jacketDeliveryDate}`
        : `Especificaciones fijas de stock: Color: ${product.color_name}, Talla: ${product.talla || 'M'}`;
    } else {
      customText = `Accesorio en stock: Color: ${product.color_name || 'Tono Único'}`;
    }

    const destinationLabels: Record<string, string> = {
      lp: 'La Paz',
      sc: 'Santa Cruz',
      cb: 'Cochabamba',
      or: 'Oruro (Recojo en Tienda/Taller)',
      pt: 'Potosí',
      tj: 'Tarija',
      ch: 'Chuquisaca',
      bn: 'Beni',
      pn: 'Pando'
    };

    const shippingDestText = shippingDestination === 'otro'
      ? `Otro Lugar/Provincia: ${customShippingLocation || 'No especificado'}`
      : (destinationLabels[shippingDestination] || 'No especificado');

    const message = `Hola Bordados Flores, estoy interesado en el producto: *${product.name}* (ID: ${product.id}).\n\n` + 
      `*Categoría:* ${product.category}\n` +
      `*Disponibilidad:* ${product.availability}\n` +
      `*Detalles:* ${customText}\n` +
      `*Destino Estimado:* ${shippingDestText}\n` +
      `*Precio:* ${formatCurrency(currentPrice)}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/591?text=${encodedMessage}`, '_blank');
  };

  return (
    <>
      {/* Top Header Navigation */}
      <Header />

      {/* Main Details Layout */}
      <main className="pt-20 pb-28 max-w-container-max mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin-desktop lg:flex lg:gap-16 items-start w-full">
        
        {/* Left Column: Image Section with Carousel & Thumbnails */}
        <div className="lg:w-3/5 w-full space-y-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-container-low shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <img
              alt={`${product.name} - Vista ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
              src={images[activeImageIndex]}
            />

            {/* Favorite button */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`absolute top-4 left-4 w-11 h-11 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white active:scale-90 transition-all z-10 ${
                isFavorite ? 'text-primary' : 'text-on-surface-variant'
              }`}
              aria-label="Agregar a favoritos"
            >
              <Heart className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            {/* Carousel navigation buttons (Desktop/Tablet overlay) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-on-surface p-3 rounded-full shadow-lg backdrop-blur-md hover:bg-white transition-all active:scale-90 z-10 hidden md:flex items-center justify-center"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-on-surface p-3 rounded-full shadow-lg backdrop-blur-md hover:bg-white transition-all active:scale-90 z-10 hidden md:flex items-center justify-center"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Carousel Indicators (Mobile dots overlay) */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === activeImageIndex
                        ? 'bg-primary w-6 shadow-sm'
                        : 'bg-white/60 w-2.5 hover:bg-white'
                    }`}
                    aria-label={`Ir a imagen ${i + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Availability Badge */}
            <div className="absolute top-4 right-4 bg-primary text-on-primary px-4.5 py-1.5 rounded-full font-label-md text-label-md shadow-xl uppercase tracking-wider z-10 font-bold">
              {product.availability}
            </div>
          </div>

          {/* Secondary images / Thumbnails (Desktop only) */}
          {images.length > 1 && (
            <div className="hidden lg:grid grid-cols-5 gap-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`aspect-square rounded-xl overflow-hidden cursor-pointer transition-all relative ${
                    index === activeImageIndex
                      ? 'border-2 border-primary ring-4 ring-primary/10 opacity-100'
                      : 'opacity-70 hover:opacity-100 border border-outline-variant/30'
                  }`}
                >
                  <img
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-cover"
                    src={img}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Customization */}
        <div className="lg:w-2/5 w-full mt-8 lg:mt-0 lg:sticky lg:top-24 space-y-6">
          <div className="flex flex-col gap-2">
            <span className="text-secondary font-label-md text-label-md tracking-[0.25em] uppercase font-bold">
              {product.category}
            </span>
            <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-xl text-on-background leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="font-headline-md text-secondary font-bold text-2xl">
                {formatCurrency(currentPrice)}
              </p>
              {product.originalPrice && (
                <span className="text-body-lg line-through text-on-surface-variant/50">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary font-label-md text-[10px] tracking-wide uppercase font-semibold">
                Alta Costura
              </span>
            </div>
          </div>

          <div className="h-px bg-surface-container-high" />

          {/* 1. FLOW FOR POLLERAS */}
          {isPollera && (
            isCustomizable ? (
              /* A PEDIDO FLOW */
              <section className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30">
                <h3 className="font-headline-sm text-[18px] text-on-surface font-semibold uppercase tracking-wider border-b border-outline-variant/20 pb-2">
                  Personalización de la Prenda
                </h3>

                {/* Color Selection (Display fixed color) */}
                <div className="flex flex-col gap-3">
                  <label className="font-label-md text-on-surface-variant uppercase tracking-widest text-[12px]">
                    Color de la Tela
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-white border border-outline-variant rounded-xl">
                    <div 
                      className="w-6 h-6 rounded-full border border-black/10 shrink-0" 
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <span className="font-body-md text-on-surface font-semibold">
                      {selectedColor.name}
                    </span>
                    <Check className="w-4 h-4 ml-auto text-primary" />
                  </div>
                </div>

                {/* Panels Selection */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block tracking-wider uppercase">
                    Cantidad de Paños (Vuelo)
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedPanels}
                      onChange={(e) => setSelectedPanels(Number(e.target.value))}
                      className="w-full bg-surface border border-outline-variant rounded-lg py-3 px-4 pr-10 font-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
                    >
                      <option value="6">6 paños ({formatCurrency(Math.round((product.price / basePanels) * 6))})</option>
                      <option value="8">8 paños ({formatCurrency(Math.round((product.price / basePanels) * 8))})</option>
                      <option value="10">10 paños ({formatCurrency(Math.round((product.price / basePanels) * 10))})</option>
                      <option value="12">12 paños ({formatCurrency(Math.round((product.price / basePanels) * 12))})</option>
                      <option value="14">14 paños ({formatCurrency(Math.round((product.price / basePanels) * 14))})</option>
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                  </div>
                </div>

                {/* Length Selection */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block tracking-wider uppercase">
                    Talla / Largo de la Pollera
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLength}
                      onChange={(e) => setSelectedLength(Number(e.target.value))}
                      className="w-full bg-surface border border-outline-variant rounded-lg py-3 px-4 pr-10 font-body-md font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer appearance-none"
                    >
                      <option value="35">35 cm (Mini)</option>
                      <option value="40">40 cm (Corto)</option>
                      <option value="45">45 cm (Medio estándar)</option>
                      <option value="50">50 cm (Largo tradicional)</option>
                    </select>
                    <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
                  </div>
                </div>

                {/* Waist Measurement */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block tracking-wider uppercase">
                    Medida de Cintura (cm)
                  </label>
                  <input
                    type="number"
                    value={waistMeasurement}
                    onChange={(e) => setWaistMeasurement(e.target.value)}
                    placeholder="Ej. 75"
                    className="w-full bg-surface border border-outline-variant rounded-lg py-3 px-4 font-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                {/* Delivery Warning Box */}
                <div className="flex gap-3.5 p-4.5 bg-primary/5 rounded-lg border border-primary/20">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold text-primary text-body-sm">Tiempo de confección: 15-20 días</p>
                    <p className="text-on-surface-variant text-[11px]">
                      Esta pieza se fabrica de forma artesanal y personalizada por maestros tejedores.
                    </p>
                  </div>
                </div>

                {/* Estimated Delivery Date */}
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant block tracking-wider uppercase">
                    Fecha de Entrega Estimada
                  </label>
                  <div className="p-4 bg-surface rounded-lg border border-outline-variant flex items-center justify-between">
                    <span className="font-semibold text-on-surface">{getEstimatedDate()}</span>
                    <Calendar className="w-5 h-5 text-on-surface-variant" />
                  </div>
                </div>
              </section>
            ) : (
              /* EN STOCK FLOW */
              <section className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30">
                <h3 className="font-headline-sm text-[18px] text-on-surface font-semibold uppercase tracking-wider border-b border-outline-variant/20 pb-2">
                  Especificaciones Técnicas
                </h3>

                <div className="space-y-4">
                  {/* Fixed Color */}
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2.5 tracking-wider uppercase">
                      COLOR DE LA PRENDA
                    </label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: product.color_hex || '#004d40' }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-body-md text-on-surface font-semibold">
                        {product.color_name || 'Verde Esmeralda Deep'}
                      </span>
                    </div>
                  </div>

                  {/* Fixed attributes grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-label-md text-label-md text-on-surface-variant block mb-2 tracking-wider uppercase">
                        LARGO FIJO
                      </label>
                      <div className="flex items-center justify-center w-full py-3.5 rounded-xl bg-surface border border-outline-variant/20 font-headline-sm text-on-surface shadow-xs">
                        {product.largo || 45} cm
                      </div>
                    </div>
                    <div>
                      <label className="font-label-md text-label-md text-on-surface-variant block mb-2 tracking-wider uppercase">
                        CINTURA FIJA
                      </label>
                      <div className="flex items-center justify-center w-full py-3.5 rounded-xl bg-surface border border-outline-variant/20 font-headline-sm text-on-surface shadow-xs">
                        {product.cintura || 75} cm
                      </div>
                    </div>
                  </div>

                  {/* Fixed Panels */}
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2 tracking-wider uppercase">
                      VOLUMEN FIJO
                    </label>
                    <div className="flex items-center px-5 py-3.5 rounded-xl bg-surface border border-outline-variant/20 font-body-md font-semibold text-on-surface shadow-xs">
                      <Layers className="w-5 h-5 mr-3 text-primary" />
                      {product.panos || 10} paños premium
                    </div>
                  </div>

                  {/* Fixed availability dispatch */}
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-2 tracking-wider uppercase">
                      DISPONIBILIDAD
                    </label>
                    <div className="flex items-center gap-2 text-primary bg-primary/5 p-3.5 rounded-lg border border-primary/20">
                      <Zap className="w-5 h-5" />
                      <span className="font-headline-sm text-base uppercase tracking-wider font-bold">ENVÍO INMEDIATO</span>
                    </div>
                  </div>
                </div>

                <div className="p-4.5 bg-surface rounded-xl border-l-4 border-primary flex gap-3.5 shadow-xs">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
                    Esta es una pieza artesanal única de entrega inmediata. <span className="font-bold text-on-surface">No admite personalizaciones adicionales</span> ni modificaciones.
                  </p>
                </div>
              </section>
            )
          )}

          {/* 2. FLOW FOR CHAQUETAS */}
          {isJacket && (
            isCustomizable ? (
              /* A PEDIDO FLOW */
              <section className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30">
                <h3 className="font-headline-sm text-[18px] text-on-surface font-semibold uppercase tracking-wider border-b border-outline-variant/20 pb-2">
                  Personalización de la Prenda
                </h3>

                {/* Color Selection (Display default color) */}
                <div className="flex flex-col gap-3">
                  <label className="font-label-md text-on-surface-variant uppercase tracking-widest text-[12px]">
                    Color Seleccionado
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-white border border-outline-variant rounded-xl">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-body-md text-on-surface font-medium">
                      {product.color_name || 'Carmesí Ancestral'}
                    </span>
                  </div>
                </div>

                {/* Size Selection (XS - XXL Buttons) */}
                <div className="flex flex-col gap-3">
                  <label className="font-label-md text-on-surface-variant uppercase tracking-widest text-[12px]">
                    Talla Seleccionada
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedJacketSize(size)}
                        className={`min-w-[56px] h-14 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer font-bold ${
                          selectedJacketSize === size
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant text-on-surface hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Date Input (Min 15 days in future) */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface-variant uppercase tracking-widest text-[12px]">
                    Fecha de Entrega
                  </label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={jacketDeliveryDate}
                      min={getMinDeliveryDateString()}
                      onChange={(e) => setJacketDeliveryDate(e.target.value)}
                      className="w-full p-4 pr-12 bg-white border border-outline-variant rounded-xl font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                    />
                    <Calendar className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none group-focus-within:text-primary" />
                  </div>
                </div>

                {/* Confection Info */}
                <div className="flex gap-4 p-5 bg-primary/5 rounded-xl border border-primary/20">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-primary text-body-md">Tiempo de confección: 15-20 días</p>
                    <p className="font-body-sm text-on-surface-variant leading-relaxed">
                      Mínimo 15 días a partir de hoy. La fecha de entrega está limitada conforme al proceso de fabricación artesanal a medida.
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              /* EN STOCK FLOW */
              <section className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30">
                <h3 className="font-headline-sm text-[18px] text-on-surface font-semibold uppercase tracking-wider border-b border-outline-variant/20 pb-2">
                  Especificaciones Técnicas
                </h3>

                <div className="space-y-5">
                  {/* Fixed Color */}
                  <div className="space-y-3">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Color de la Prenda
                    </label>
                    <div className="flex items-center gap-3 bg-surface-container-highest/50 p-4 rounded-xl border border-primary/20">
                      <div
                        className="w-8 h-8 rounded-full bg-secondary shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: product.color_hex || '#c2185b' }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-body-md text-body-md font-semibold">
                        {product.color_name || 'Carmesí Ancestral'}
                      </span>
                      <Lock className="w-4 h-4 ml-auto text-outline" />
                    </div>
                  </div>

                  {/* Fixed Size */}
                  <div className="space-y-3">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Talla Disponible
                    </label>
                    <div className="flex items-center gap-3 bg-surface-container-highest/50 p-4 rounded-xl border border-primary/20">
                      <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                        {product.talla || 'M'}
                      </div>
                      <span className="font-body-md text-body-md font-semibold">Talla Única de Stock</span>
                      <Lock className="w-4 h-4 ml-auto text-outline" />
                    </div>
                  </div>

                  {/* Availability Dispatch */}
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                      Disponibilidad
                    </label>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Truck className="w-5 h-5" />
                      <span className="font-body-md text-body-md">ENTREGA INMEDIATA</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/5 border-l-4 border-secondary p-4 rounded-r-xl">
                  <p className="text-on-surface-variant font-body-sm text-body-sm leading-relaxed">
                    <span className="font-bold text-secondary">Nota:</span> Esta es una pieza única disponible para envío inmediato. No admite modificaciones en talla o color.
                  </p>
                </div>
              </section>
            )
          )}

          {/* 3. FLOW FOR ACCESORIOS & TEXTILES */}
          {isAccessory && (
            <section className="space-y-6 bg-surface-container-low p-6 rounded-xl border border-outline-variant/30">
              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-headline-sm text-on-surface border-b border-outline-variant/30 pb-2 text-[18px] font-semibold">
                  Descripción
                </h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Color reference */}
              <div className="space-y-3">
                <h3 className="font-headline-sm text-on-surface border-b border-outline-variant/30 pb-2 text-[18px] font-semibold">
                  Color de Referencia
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white border border-outline-variant/30 px-4 py-3 rounded-xl shadow-xs">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: product.color_hex || '#c2185b' }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-body-md font-semibold text-on-surface">
                      {product.color_name || 'Tono Único'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Confection warning (if A Pedido accessory) */}
              {isCustomizable && (
                <div className="flex gap-4 p-5 bg-primary/5 rounded-xl border border-primary/20">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-primary text-body-md">Tiempo de confección: 10-15 días</p>
                    <p className="font-body-sm text-on-surface-variant leading-relaxed">
                      Esta pieza artesanal se teje bajo pedido. Estará lista para despacho en aproximadamente dos semanas.
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Shipping Select Dropdown (Applicable to all categories/flows) */}
          <div className="space-y-2.5">
            <label className="font-label-md text-label-md text-on-surface-variant block tracking-wider uppercase">
              Destino del Envío (Bolivia)
            </label>
            <div className="relative group">
              <select
                value={shippingDestination}
                onChange={(e) => setShippingDestination(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3.5 px-5 pr-10 font-body-md font-semibold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer appearance-none"
              >
                <option value="or">Oruro (Recojo en Tienda/Taller)</option>
                <option value="lp">La Paz</option>
                <option value="sc">Santa Cruz</option>
                <option value="cb">Cochabamba</option>
                <option value="pt">Potosí</option>
                <option value="tj">Tarija</option>
                <option value="ch">Chuquisaca</option>
                <option value="bn">Beni</option>
                <option value="pn">Pando</option>
                <option value="otro">Otro (Especificar provincia/lugar)</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant group-hover:text-primary transition-colors" />
            </div>

            {shippingDestination === 'otro' && (
              <div className="space-y-2 pt-1">
                <label className="font-label-md text-label-md text-on-surface-variant block tracking-wider uppercase text-xs">
                  Especificar Lugar o Provincia
                </label>
                <input
                  type="text"
                  value={customShippingLocation}
                  onChange={(e) => setCustomShippingLocation(e.target.value)}
                  placeholder="Ej. Challapata, Oruro / Copacabana, La Paz"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-on-surface-variant/40"
                />
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={cartState !== 'idle'}
              className={`w-full h-16 text-on-primary font-headline-sm rounded-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-semibold uppercase tracking-wider cursor-pointer ${
                cartState === 'added'
                  ? 'bg-green-600 shadow-green-600/10'
                  : 'bg-primary hover:bg-primary-container shadow-primary/20'
              }`}
            >
              {cartState === 'idle' && (
                <>
                  <ShoppingBasket className="w-5 h-5" />
                  Añadir a la Cesta
                </>
              )}
              {cartState === 'processing' && (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              )}
              {cartState === 'added' && (
                <>
                  <CheckCircle className="w-5 h-5" />
                  ¡En tu cesta!
                </>
              )}
            </button>

            <button
              onClick={handleWhatsAppConsult}
              className="w-full h-16 border-2 border-primary text-primary hover:bg-primary/5 font-headline-sm rounded-xl active:scale-[0.98] transition-all font-semibold uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5" />
              Consultar Detalles
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Nav Bar for Mobile */}
      <BottomNav />
    </>
  );
}
