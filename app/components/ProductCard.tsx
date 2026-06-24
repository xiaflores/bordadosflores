'use client';

import { useState } from 'react';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-container-low">
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={product.imageUrl}
            alt={product.name}
          />

          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`absolute top-2 right-2 w-8 h-8 bg-white/85 backdrop-blur-xs rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-white shadow-sm ${
              isFavorite ? 'text-primary' : 'text-on-surface-variant'
            }`}
            aria-label="Agregar a favoritos"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: isFavorite ? '"FILL" 1' : undefined }}
            >
              favorite
            </span>
          </button>

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute bottom-2 left-2 bg-error text-white px-2 py-1 rounded text-label-md font-label-md font-bold shadow-xs">
              -{product.discount}%
            </div>
          )}

          {/* Stock Availability Badge */}
          <div
            className={`absolute bottom-2 right-2 px-2 py-1 rounded text-label-md font-label-md font-semibold shadow-xs ${
              product.availability === 'En Stock'
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-high text-on-surface'
            }`}
          >
            {product.availability}
          </div>
        </div>

        {/* Product Content Details */}
        <div className="p-3 flex flex-col gap-1">
          <span className="text-[10px] font-label-md text-primary uppercase tracking-wider mb-1 block">
            {product.category}
          </span>
          <h4
            className="font-label-md text-label-md text-on-surface-variant truncate"
            title={product.name}
          >
            {product.name}
          </h4>
        </div>
      </div>

      <div className="px-3 pb-3">
        {/* Pricing Layout */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-headline-sm text-headline-sm text-primary font-bold">
            {product.price.toFixed(2)} Bs.
          </span>
          {product.originalPrice && (
            <span className="font-body-sm text-body-sm line-through text-on-surface-variant/50">
              {product.originalPrice.toFixed(2)} Bs.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
