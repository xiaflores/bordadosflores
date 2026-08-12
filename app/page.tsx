import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import HeroSlider from '@/components/product/HeroSlider';
import HomeSocialAndHeader from '@/components/home/HomeSocialAndHeader';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Fetch only featured products (featured = true) that are not hidden
  const { data: rawProducts, error } = await supabase
    .from('productos')
    .select('*')
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .eq('featured', true)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching featured products from Supabase:', error);
  }

  // Filter out products marked as OCULTO in tags
  const visibleProducts = (rawProducts || []).filter((p) => {
    if (Array.isArray(p.tags) && p.tags.includes('OCULTO')) return false;
    return true;
  });

  const products = visibleProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
  })) as Product[];

  return (
    <>
      {/* Top Header Navigation */}
      <Header />

      {/* Main Container */}
      <main className="pt-20 pb-28 px-margin-mobile max-w-container-max mx-auto space-y-6 flex-1 w-full">
        
        {/* Automatic Hero Slider */}
        <HeroSlider />

        {/* Dynamic Social Links & Section Headers */}
        <HomeSocialAndHeader />

        {/* Dynamic Product Grid */}
        <section className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline-variant/30">
              No hay productos destacados en este momento.
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation Bar for Mobile */}
      <BottomNav />
    </>
  );
}
