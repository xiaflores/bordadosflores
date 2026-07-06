'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { useCart } from '../context/CartContext';
import { Search, ShoppingBag } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { cartCount, isLoaded } = useCart();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
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
            {user ? (
              <Link
                href="/login"
                className="flex items-center gap-2 hover:opacity-80 transition-all"
              >
                {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                  <img
                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                    alt={user.user_metadata.full_name || 'Perfil'}
                    className="w-8 h-8 rounded-full border border-primary/20 object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm uppercase">
                    {(user.user_metadata?.full_name || user.email || 'U').charAt(0)}
                  </div>
                )}
                <span className="hidden sm:inline font-bold text-label-md uppercase tracking-wider text-on-surface">
                  {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Mi Perfil'}
                </span>
              </Link>
            ) : (
              <Link
                className={`font-bold text-label-md uppercase tracking-wider transition-colors ${
                  pathname === '/login' ? 'text-primary' : 'text-on-surface hover:text-primary'
                }`}
                href="/login"
              >
                Mi Perfil
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button className="p-2 rounded-full active:scale-95 text-primary hover:bg-surface-container transition-all flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/cesta"
              className="p-2 rounded-full relative active:scale-95 text-primary hover:bg-surface-container transition-all flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {isLoaded && cartCount > 0 && (
                <span className="absolute top-1 right-1 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white bg-primary font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
