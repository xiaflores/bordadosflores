'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full bg-white shadow-md flex justify-between items-center px-margin-mobile transition-all duration-300 ${
        isScrolled ? 'h-14 bg-opacity-100' : 'h-16 bg-opacity-95'
      }`}
    >
      <div className="max-w-container-max mx-auto w-full flex justify-between items-center h-full px-4 md:px-gutter">
        <div className="flex items-center gap-4">
          <div className="flex items-center w-12">
            <Link href="/" className="flex items-center">
              <img
                alt="Bordados Flores Logo"
                className="h-10 w-10 object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3ok8RTRW6cxAwh3XQHvYm7TksIbjQh3YubTN36ArE6tF08MCC8HlXkIUW0_YTMInNFCFsbepuAqKZSAX2wZuKDek8FNUAwZ12jfnexWvaopWv-8w5bvzb3qxHfbhOH_22TF5yUOEn1r2JlAB7zdFmLw378ufoL6e4xPoOnwdHeO7TMX8ae2o6JziZz5YSiirkKu_3X93IWYW3yY1MSKgpiwXaS4gUe7oxaQ49AlE9bouNy1346D4EgxeSbQzw1cB2-Pg2F0P_kA"
              />
            </Link>
          </div>
          <span className="font-headline-sm tracking-wider uppercase lg:static absolute left-1/2 -translate-x-1/2 lg:translate-x-0 text-primary">
            Bordados Flores
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              className={`font-bold text-label-md uppercase tracking-wider transition-colors ${
                pathname === '/' ? 'text-primary' : 'text-on-surface hover:text-primary'
              }`}
              href="/"
            >
              Inicio
            </Link>
            <Link
              className={`font-bold text-label-md uppercase tracking-wider transition-colors ${
                pathname.startsWith('/catalogo') ? 'text-primary' : 'text-on-surface hover:text-primary'
              }`}
              href="/catalogo"
            >
              Catálogo
            </Link>
            <Link
              className={`font-bold text-label-md uppercase tracking-wider transition-colors ${
                pathname.startsWith('/cesta') ? 'text-primary' : 'text-on-surface hover:text-primary'
              }`}
              href="#"
            >
              Mi Perfil
            </Link>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button className="p-2 rounded-full active:scale-95 text-primary hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined flex items-center justify-center">
                search
              </span>
            </button>
            <button className="p-2 rounded-full relative active:scale-95 text-primary hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined flex items-center justify-center">
                shopping_basket
              </span>
              <span className="absolute top-1 right-1 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white bg-primary font-bold">
                2
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
