'use client';

import { useState } from 'react';

export default function BottomNav() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'catalogo' | 'cesta' | 'perfil'>('inicio');

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-secondary shadow-[0px_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl lg:hidden">
      <button
        onClick={() => setActiveTab('inicio')}
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${
          activeTab === 'inicio'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: activeTab === 'inicio' ? '"FILL" 1' : undefined }}
        >
          home
        </span>
        <span className="font-label-md text-label-md mt-1">Inicio</span>
      </button>

      <button
        onClick={() => setActiveTab('catalogo')}
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${
          activeTab === 'catalogo'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: activeTab === 'catalogo' ? '"FILL" 1' : undefined }}
        >
          menu_book
        </span>
        <span className="font-label-md text-label-md mt-1">Catálogo</span>
      </button>

      <button
        onClick={() => setActiveTab('cesta')}
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 relative ${
          activeTab === 'cesta'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: activeTab === 'cesta' ? '"FILL" 1' : undefined }}
        >
          shopping_cart
        </span>
        <span className="font-label-md text-label-md mt-1">Cesta</span>
        <span className="absolute top-0 -right-1 bg-on-secondary text-secondary text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-secondary font-bold">
          2
        </span>
      </button>

      <button
        onClick={() => setActiveTab('perfil')}
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${
          activeTab === 'perfil'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: activeTab === 'perfil' ? '"FILL" 1' : undefined }}
        >
          person
        </span>
        <span className="font-label-md text-label-md mt-1">Mi Perfil</span>
      </button>
    </nav>
  );
}
