'use client';

import { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HeroSlider from './components/HeroSlider';
import ProductCard from './components/ProductCard';
import { mockProducts } from './data/products';

export default function Home() {
  const [selectedTag, setSelectedTag] = useState<'Todos' | 'Nuevos'>('Todos');

  // Filter products by selected tag
  const filteredProducts = mockProducts.filter((product) => {
    if (selectedTag === 'Todos') return true;
    return product.tags?.includes(selectedTag);
  });

  return (
    <>
      {/* Top Header Navigation */}
      <Header />

      {/* Main Container */}
      <main className="pt-20 pb-28 px-margin-mobile max-w-container-max mx-auto space-y-8 flex-1 w-full">
        
        {/* Automatic Hero Slider */}
        <HeroSlider />

        {/* Social Media Shortcuts Integration */}
        <section className="flex justify-center gap-6 py-4" aria-label="Redes Sociales">
          <a
            title="TikTok"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:bg-primary-container active:scale-90 transition-all"
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined flex items-center justify-center">
              video_library
            </span>
          </a>
          <a
            title="Instagram"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:bg-primary-container active:scale-90 transition-all"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined flex items-center justify-center">
              photo_camera
            </span>
          </a>
          <a
            title="Facebook"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:bg-primary-container active:scale-90 transition-all"
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined flex items-center justify-center">
              facebook
            </span>
          </a>
          <a
            title="WhatsApp"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:bg-primary-container active:scale-90 transition-all"
            href="https://wa.me/591"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined flex items-center justify-center">
              chat
            </span>
          </a>
        </section>

        {/* Flash Sale / Direct Sale Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Venta Directa
              </h3>
            </div>
            
            {/* Filter Tags */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto mt-2 md:mt-0">
              <button
                onClick={() => setSelectedTag('Todos')}
                className={`px-4 py-2 rounded-full text-label-md font-label-md shrink-0 transition-all cursor-pointer ${
                  selectedTag === 'Todos'
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedTag('Nuevos')}
                className={`px-4 py-2 rounded-full text-label-md font-label-md shrink-0 transition-all cursor-pointer ${
                  selectedTag === 'Nuevos'
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                Nuevos
              </button>
            </div>
          </div>

          {/* Dynamic Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              No hay productos disponibles con esta etiqueta.
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation Bar for Mobile */}
      <BottomNav />
    </>
  );
}
