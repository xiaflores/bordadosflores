'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 group relative flex flex-col justify-between">
      <Link href={`/productos/${product.id}`} className="block flex-1 flex flex-col justify-between cursor-pointer">
        <div>
          {/* Product Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-container-low">
            <img
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              src={product.imageUrl}
              alt={product.name}
            />

            {/* Favorite Button (Top-Left) */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className={`absolute top-2 left-2 w-10 h-10 bg-white/80 backdrop-blur-xs rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm z-10 ${
                isFavorite ? 'text-primary' : 'text-secondary'
              }`}
              aria-label="Agregar a favoritos"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isFavorite ? '"FILL" 1' : '"FILL" 0' }}
              >
                favorite
              </span>
            </button>

            {/* Availability Badge (Top-Right) */}
            <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider z-10 shadow-sm">
              {product.availability}
            </span>

            {/* Discount Badge (Bottom-Left) */}
            {product.discount && (
              <div className="absolute bottom-2 left-2 bg-error text-white px-2 py-1 rounded text-label-md font-label-md font-bold shadow-xs">
                -{product.discount}%
              </div>
            )}
          </div>

          {/* Product Content Details */}
          <div className="p-3">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">
              {product.category}
            </p>
            <h3 className="font-headline-sm text-[16px] text-on-surface line-clamp-1 mb-1">
              {product.name}
            </h3>
          </div>
        </div>

        <div className="px-3 pb-3">
          {/* Pricing Layout */}
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-primary">
              Bs. {product.price.toLocaleString('es-BO')}
            </span>
            {product.originalPrice && (
              <span className="text-[12px] line-through text-on-surface-variant/50">
                Bs. {product.originalPrice.toLocaleString('es-BO')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
