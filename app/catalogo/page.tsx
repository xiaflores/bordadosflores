import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase';
import SearchInput from '@/components/catalogo/SearchInput';
import { Info } from 'lucide-react';

type FilterType = 'Todos' | 'Novedades' | 'Chaquetas' | 'Polleras' | 'Accesorios';

interface CatalogoProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CatalogoPage({ searchParams }: CatalogoProps) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page;
  const search = resolvedSearchParams.search;
  const filter = resolvedSearchParams.filter;

  const currentPage = parseInt(typeof page === 'string' ? page : '1', 10) || 1;
  const currentSearch = typeof search === 'string' ? search : '';
  const currentFilter = (typeof filter === 'string' ? filter : 'Todos') as FilterType;

  const limit = 10; // 10 items per page
  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;

  let dbQuery = supabase
    .from('productos')
    .select('*', { count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // 1. Filter by chip selection
  if (currentFilter === 'Novedades') {
    dbQuery = dbQuery.overlaps('tags', ['Novedades', 'Nuevos']);
  } else if (currentFilter !== 'Todos') {
    dbQuery = dbQuery.eq('category', currentFilter);
  }

  // 2. Filter by search query
  if (currentSearch.trim() !== '') {
    dbQuery = dbQuery.or(`name.ilike.%${currentSearch}%,description.ilike.%${currentSearch}%`);
  }

  // Fetch from Supabase
  const { data: rawProducts, count, error } = await dbQuery
    .range(from, to)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching products in catalog:', error);
  }

  const products = (rawProducts || []).map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
  })) as Product[];

  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const filterChips: FilterType[] = ['Todos', 'Novedades', 'Chaquetas', 'Polleras', 'Accesorios'];

  return (
    <>
      {/* Top Header Navigation */}
      <Header />

      {/* Main Catalog View */}
      <main className="pt-20 pb-28 px-margin-mobile md:px-margin-tablet lg:px-margin-desktop max-w-container-max mx-auto space-y-6">
        
        {/* Search Bar Section */}
        <section className="mt-4 w-full">
          <SearchInput initialValue={currentSearch} />
        </section>

        {/* Category Quick Filters (Chips) */}
        <section className="w-full">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 w-full">
            {filterChips.map((chip) => {
              const queryParams = new URLSearchParams();
              queryParams.set('filter', chip);
              if (currentSearch) {
                queryParams.set('search', currentSearch);
              }
              queryParams.set('page', '1'); // Reset to page 1 on filter change

              return (
                <Link
                  key={chip}
                  href={`/catalogo?${queryParams.toString()}`}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all duration-200 cursor-pointer active:scale-95 ${
                    currentFilter === chip
                      ? 'bg-primary text-on-primary shadow-md'
                      : 'bg-primary-container/10 text-primary hover:bg-primary-container/20'
                  }`}
                >
                  {chip}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Product Count Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            {totalItems} {totalItems === 1 ? 'Producto' : 'Productos'}
          </span>
        </div>

        {/* Dynamic Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-gutter w-full">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Server-Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-8">
            {prevPage ? (
              <Link
                href={`/catalogo?filter=${currentFilter}&search=${currentSearch}&page=${prevPage}`}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all font-label-md text-label-md active:scale-95"
              >
                Anterior
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface-variant/30 cursor-not-allowed font-label-md text-label-md">
                Anterior
              </span>
            )}

            <span className="text-label-md font-label-md text-on-surface-variant">
              Página {currentPage} de {totalPages}
            </span>

            {nextPage ? (
              <Link
                href={`/catalogo?filter=${currentFilter}&search=${currentSearch}&page=${nextPage}`}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all font-label-md text-label-md active:scale-95"
              >
                Siguiente
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface-variant/30 cursor-not-allowed font-label-md text-label-md">
                Siguiente
              </span>
            )}
          </div>
        )}

        {/* Empty Search / Filter State */}
        {totalItems === 0 && (
          <div className="text-center py-16 text-on-surface-variant flex flex-col items-center justify-center">
            <Info className="w-10 h-10 mb-2 text-outline" />
            <p className="font-body-lg text-body-lg">
              No se encontraron productos que coincidan con la búsqueda o filtro seleccionado.
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block text-primary font-bold underline hover:opacity-80 cursor-pointer"
            >
              Restablecer filtros
            </Link>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </>
  );
}
