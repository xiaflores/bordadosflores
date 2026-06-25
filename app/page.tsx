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
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.15 2.25 1.96 3.71 2.27.02 1.34.01 2.68.01 4.02-1.39-.02-2.79-.44-3.95-1.22-.8-.54-1.46-1.28-1.92-2.12-.03 2.16-.01 4.31-.02 6.47-.04 2.1-.55 4.22-1.63 6.01-1.24 2.05-3.4 3.51-5.74 3.93-2.61.47-5.4-.23-7.39-2.03C1.03 19.5 0 16.52 0 13.56c0-2.66 1.05-5.28 2.91-7.14 1.95-1.95 4.67-2.98 7.39-2.73v4.18c-1.35-.12-2.76.24-3.8 1.14-.99.85-1.54 2.15-1.49 3.44.02 1.34.62 2.63 1.63 3.48 1.11.93 2.62 1.32 4.05 1.01 1.29-.27 2.4-1.15 2.89-2.39.31-.8.43-1.67.4-2.52L13.88.02h-1.36z"/>
            </svg>
          </a>
          <a
            title="Instagram"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:bg-primary-container active:scale-90 transition-all"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </a>
          <a
            title="Facebook"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:bg-primary-container active:scale-90 transition-all"
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
            </svg>
          </a>
          <a
            title="WhatsApp"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:bg-primary-container active:scale-90 transition-all"
            href="https://wa.me/591"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.743 1.452 5.51 0 9.995-4.485 9.998-10 .002-2.673-1.037-5.184-2.927-7.076C16.522 1.639 14.019.596 11.35.596 5.845.596 1.36 5.08 1.357 10.58c-.001 1.7.452 3.359 1.31 4.816L1.65 20.89l5.59-1.464-.593-.272zm9.194-6.388c-.282-.141-1.666-.822-1.923-.916-.257-.095-.443-.141-.63.141-.186.282-.719.916-.882 1.1-.162.186-.326.21-.608.069-.282-.141-1.194-.44-2.276-1.405-.842-.751-1.41-1.678-1.575-1.96-.165-.282-.018-.434.123-.574.127-.127.282-.329.424-.494.141-.165.188-.282.282-.47.094-.188.047-.353-.024-.494-.071-.141-.63-1.517-.862-2.082-.226-.543-.454-.47-.63-.478-.163-.008-.35-.008-.537-.008-.187 0-.49.07-.747.353-.257.282-.98.959-.98 2.337 0 1.378 1.002 2.71 1.143 2.898.14.188 1.972 3.011 4.777 4.22.668.288 1.19.46 1.597.59.67.213 1.28.183 1.761.111.537-.08 1.666-.68 1.9-.1337.234-.659.234-1.222.164-1.316-.07-.095-.257-.141-.539-.282z"/>
            </svg>
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
