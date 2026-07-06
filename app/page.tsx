import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import HeroSlider from '@/components/product/HeroSlider';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase';

export default async function Home() {
  // Fetch only featured products (featured = true)
  const { data: rawProducts, error } = await supabase
    .from('productos')
    .select('*')
    .eq('featured', true)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching featured products from Supabase:', error);
  }

  const products = (rawProducts || []).map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
  })) as Product[];

  return (
    <>
      {/* Top Header Navigation */}
      <Header />

      {/* Main Container */}
      <main className="pt-20 pb-28 px-margin-mobile max-w-container-max mx-auto space-y-8 flex-1 w-full">
        
        {/* Automatic Hero Slider */}
        <HeroSlider />

        {/* Social Media Shortcuts Integration */}
        <section className="flex justify-center gap-6 py-6" aria-label="Redes Sociales">
          <a
            title="TikTok"
            className="w-12 h-12 rounded-full bg-[#010101] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_0_15px_rgba(0,242,254,0.4),_0_0_15px_rgba(254,44,85,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 group"
            href="https://tiktok.com/@bordadodosflores"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bx bxl-tiktok text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </a>
          <a
            title="Instagram"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(238,42,123,0.25)] hover:shadow-[0_0_20px_rgba(238,42,123,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 group"
            href="https://instagram.com/bordadosflores1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bx bxl-instagram text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </a>
          <a
            title="Facebook"
            className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:shadow-[0_0_20px_rgba(24,119,242,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 group"
            href="https://facebook.com/bordadosflores1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bx bxl-facebook text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </a>
          <a
            title="WhatsApp"
            className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(37,211,102,0.25)] hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 group"
            href="https://wa.me/59171182580"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bx bxl-whatsapp text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </a>
        </section>

        {/* Featured Products Showcase */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Productos Destacados
            </h3>
          </div>

          {/* Dynamic Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
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
