'use client';

import { Calendar, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (key: string, qty: number) => void;
  onRemove: (key: string) => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
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
            {formatCurrency(item.price * item.quantity, true)}
          </div>
          {item.quantity > 1 && (
            <div className="font-body-sm text-[11px] text-on-surface-variant">
              ({formatCurrency(item.price, true)} c/u)
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
