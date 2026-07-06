import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from '@/components/product/ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: product } = await supabase
    .from('productos')
    .select('name,description')
    .eq('slug', slug)
    .single();

  if (!product) {
    return {
      title: 'Producto no encontrado | Bordados Flores'
    };
  }

  return {
    title: `${product.name} - Bordados Flores`
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  // Fetch the product from Supabase database
  const { data: product, error } = await supabase
    .from('productos')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !product) {
    console.error('Error fetching product detail:', error);
    return notFound();
  }

  return <ProductDetailClient product={product} />;
}

