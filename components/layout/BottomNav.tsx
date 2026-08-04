'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useCart } from '@/context/CartContext';
import { Home, BookOpen, ShoppingCart, User as UserIcon } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { cartCount, isLoaded } = useCart();
  const [profile, setProfile] = useState<{ avatar_url: string } | null>(null);

  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .maybeSingle();
          if (data) {
            setProfile({ avatar_url: data.avatar_url || '' });
          }
        } catch (err) {
          console.error('Error loading bottom nav profile:', err);
        }
      };
      getProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    // Get initial session
    const getInitialUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error('Error fetching initial user in BottomNav:', err);
      }
    };
    getInitialUser();

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

  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user, profile]);

  const navAvatarUrl = (profile?.avatar_url && profile.avatar_url.trim() !== '')
    ? profile.avatar_url
    : (user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '');

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
        className={`flex flex-col items-center justify-center relative transition-all duration-300 ease-out active:scale-90 ${
          activeTab === 'cesta'
            ? 'scale-110 text-on-secondary font-bold'
            : 'text-on-secondary/70 hover:bg-on-secondary/10 rounded-lg p-1'
        }`}
      >
        <ShoppingCart className="w-6 h-6" fill={activeTab === 'cesta' ? 'currentColor' : 'none'} />
        <span className="font-label-md text-label-md mt-1">Cesta</span>
        {isLoaded && cartCount > 0 && (
          <span className="absolute top-0 right-1 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white bg-primary font-bold">
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
        {user && navAvatarUrl && !avatarError ? (
          <img
            src={navAvatarUrl}
            alt="Perfil"
            className="w-6 h-6 rounded-full border border-on-secondary/20 object-cover"
            referrerPolicy="no-referrer"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <UserIcon className="w-6 h-6" fill={activeTab === 'perfil' ? 'currentColor' : 'none'} />
        )}
        <span className="font-label-md text-label-md mt-1">Mi Perfil</span>
      </Link>
    </nav>
  );
}
