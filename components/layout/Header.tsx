'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Search, ShoppingBag, Heart } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { cartCount, isLoaded } = useCart();
  const { favoritesCount } = useFavorites();
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);

  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();
          if (data) {
            setProfile({
              full_name: data.full_name || '',
              avatar_url: data.avatar_url || ''
            });
          }
        } catch (err) {
          console.error('Error loading header profile:', err);
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
        console.error('Error fetching initial user in Header:', err);
      }
    };
    getInitialUser();

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

  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user, profile]);

  const headerAvatarUrl = (profile?.avatar_url && profile.avatar_url.trim() !== '')
    ? profile.avatar_url
    : (user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '');

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
                className="h-10 w-10 object-contain rounded-full"
                src="/images/logo.webp"
              />
            </Link>
          </div>
          <span className="font-headline-sm tracking-wider uppercase lg:static absolute left-1/2 -translate-x-1/2 lg:translate-x-0 text-primary">
            Bordados Flores
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          {/* Desktop Navigation */}
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
              className={`font-bold text-label-md uppercase tracking-wider transition-colors flex items-center gap-1.5 relative ${
                pathname === '/favoritos' ? 'text-primary' : 'text-on-surface hover:text-primary'
              }`}
              href="/favoritos"
            >
              <span>Favoritos</span>
              {favoritesCount > 0 && (
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-0.5">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <Link
              className={`font-bold text-label-md uppercase tracking-wider transition-colors flex items-center gap-1.5 relative ${
                pathname === '/cesta' ? 'text-primary' : 'text-on-surface hover:text-primary'
              }`}
              href="/cesta"
            >
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>Cesta</span>
              {isLoaded && cartCount > 0 && (
                <span className="bg-primary text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-0.5">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Right Controls: Favorites icon ONLY (No Cart icon in Mobile Header) */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/favoritos"
              className="p-2 rounded-full relative active:scale-95 text-primary hover:bg-surface-container transition-all flex items-center justify-center"
              aria-label="Mis Favoritos"
            >
              <Heart className="w-5 h-5 fill-primary text-primary" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white bg-primary font-bold">
                  {favoritesCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Profile Link (desktop only) */}
            {user ? (
              <Link
                href="/login"
                className="hidden lg:flex items-center gap-2 hover:opacity-80 transition-all ml-3"
              >
                {headerAvatarUrl && !avatarError ? (
                  <img
                    src={headerAvatarUrl}
                    alt={profile?.full_name || user.user_metadata?.full_name || 'Perfil'}
                    className="w-8 h-8 rounded-full border border-primary/20 object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm uppercase">
                    {(profile?.full_name || user.user_metadata?.full_name || user.email || 'U').charAt(0)}
                  </div>
                )}
                <span className="font-bold text-label-md uppercase tracking-wider text-on-surface">
                  {(profile?.full_name || user.user_metadata?.full_name || user.email)?.split(' ')[0] || 'Mi Perfil'}
                </span>
              </Link>
            ) : (
              <Link
                className={`hidden lg:flex font-bold text-label-md uppercase tracking-wider transition-colors ml-3 ${
                  pathname === '/login' ? 'text-primary' : 'text-on-surface hover:text-primary'
                }`}
                href="/login"
              >
                Mi Perfil
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
