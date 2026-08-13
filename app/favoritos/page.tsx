'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ProductCard from '@/components/product/ProductCard';
import { useFavorites } from '@/context/FavoritesContext';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase';
import { Heart, Loader2, ShoppingBag } from 'lucide-react';

export default function FavoritosPage() {
  const { favorites, isLoaded } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .in('id', favorites);

        if (error) throw error;

        if (data) {
          const mapped = data.map(p => ({
            ...p,
            price: Number(p.price),
            originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined
          })) as Product[];

          // Preserve order of favorited items
          const ordered = favorites
            .map(id => mapped.find(p => p.id === id))
            .filter((p): p is Product => p !== undefined);

          setProducts(ordered);
        }
      } catch (err) {
        console.error('Error fetching favorite products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, [favorites, isLoaded]);

  return (
    <>
      <Header />

      <main className="pt-20 pb-28 px-margin-mobile max-w-container-max mx-auto space-y-6 flex-1 w-full min-h-[70vh]">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-sm font-semibold">Cargando tus prendas favoritas...</span>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/30 p-8 space-y-4 max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 fill-primary text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-on-surface">Aún no tienes favoritos</h2>
              <p className="text-xs text-on-surface-variant">
                Haz clic en el icono del corazón en cualquier prenda para guardarla en tu lista personal.
              </p>
            </div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-primary-hover transition-all shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Explorar Catálogo
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
