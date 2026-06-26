'use client';

import { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import { mockProducts } from '../data/products';

type FilterType = 'Todos' | 'Novedades' | 'Chaquetas' | 'Polleras' | 'Accesorios';

export default function CatalogoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Todos');

  // Filter products by active chip and search query
  const filteredProducts = mockProducts.filter((product) => {
    // 1. Filter by chip selection
    if (selectedFilter === 'Todos') {
      // Allow all
    } else if (selectedFilter === 'Novedades') {
      if (!product.tags?.includes('Novedades')) return false;
    } else {
      if (product.category !== selectedFilter) return false;
    }

    // 2. Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const nameMatches = product.name.toLowerCase().includes(query);
      const descMatches = product.description.toLowerCase().includes(query);
      return nameMatches || descMatches;
    }

    return true;
  });

  const filterChips: FilterType[] = ['Todos', 'Novedades', 'Chaquetas', 'Polleras', 'Accesorios'];

  return (
    <>
      {/* Top Header Navigation */}
      <Header />

      {/* Main Catalog View */}
      <main className="pt-20 pb-28 px-margin-mobile md:px-margin-tablet lg:px-margin-desktop max-w-container-max mx-auto space-y-6">
        
        {/* Search Bar Section */}
        <section className="mt-4 w-full">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-surface-container border-b-2 border-transparent focus:border-primary focus:ring-0 rounded-t-lg font-body-md transition-all outline-none"
              placeholder="Busca ponchos, polleras, chaquetas..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined flex items-center justify-center">close</span>
              </button>
            )}
          </div>
        </section>

        {/* Category Quick Filters (Chips) */}
        <section className="w-full">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 w-full">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedFilter(chip)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer active:scale-95 ${
                  selectedFilter === chip
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-primary-container/10 text-primary hover:bg-primary-container/20'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* Product Count Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Producto' : 'Productos'}
          </span>
        </div>

        {/* Dynamic Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-gutter w-full">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty Search / Filter State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl block mb-2 text-outline">
              info
            </span>
            <p className="font-body-lg text-body-lg">
              No se encontraron productos que coincidan con la búsqueda o filtro seleccionado.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('Todos');
              }}
              className="mt-4 text-primary font-bold underline hover:opacity-80 cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </>
  );
}
