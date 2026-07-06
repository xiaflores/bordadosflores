'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { useCart } from '../context/CartContext';
import { Home, BookOpen, ShoppingCart, User as UserIcon } from 'lucide-react';

export default function BottomNav() {
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getActiveTab = () => {
    if (pathname === '/') return 'inicio';
    if (pathname.startsWith('/catalogo')) return 'catalogo';
    if (pathname.startsWith('/cesta')) return 'cesta';
    if (pathname.startsWith('/login')) return 'perfil';
    return 'inicio';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-secondary shadow-[0px_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl lg:hidden">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${
          activeTab === 'inicio'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        <Home className="w-6 h-6" fill={activeTab === 'inicio' ? 'currentColor' : 'none'} />
        <span className="font-label-md text-label-md mt-1">Inicio</span>
      </Link>

      <Link
        href="/catalogo"
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${
          activeTab === 'catalogo'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        <BookOpen className="w-6 h-6" fill={activeTab === 'catalogo' ? 'currentColor' : 'none'} />
        <span className="font-label-md text-label-md mt-1">Catálogo</span>
      </Link>

      <Link
        href="/cesta"
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 relative ${
          activeTab === 'cesta'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        <ShoppingCart className="w-6 h-6" fill={activeTab === 'cesta' ? 'currentColor' : 'none'} />
        <span className="font-label-md text-label-md mt-1">Cesta</span>
        {isLoaded && cartCount > 0 && (
          <span className="absolute top-0 -right-1 bg-on-secondary text-secondary text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-secondary font-bold">
            {cartCount}
          </span>
        )}
      </Link>

      <Link
        href="/login"
        className={`flex flex-col items-center justify-center transition-all duration-300 ease-out active:scale-90 ${
          activeTab === 'perfil'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        {user && (user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
          <img
            src={user.user_metadata.avatar_url || user.user_metadata.picture}
            alt="Perfil"
            className="w-6 h-6 rounded-full border border-on-secondary/20 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <UserIcon className="w-6 h-6" fill={activeTab === 'perfil' ? 'currentColor' : 'none'} />
        )}
        <span className="font-label-md text-label-md mt-1">Mi Perfil</span>
      </Link>
    </nav>
  );
}
