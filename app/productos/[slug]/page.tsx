import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductDetailClient from '@/components/product/ProductDetailClient';
import { formatCurrency } from '@/lib/utils';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: product } = await supabase
    .from('productos')
    .select('name, description, imageUrl, price, category, availability, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (!product) {
    return {
      title: 'Producto no encontrado | Bordados Flores',
      description: 'El producto solicitado no existe o no se encuentra disponible en nuestro catálogo.'
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bordadosflores.com';
  const pageUrl = `${siteUrl}/productos/${product.slug}`;
  const formattedPrice = formatCurrency(product.price, true);
  
  // Format clean plain-text description (max 160 chars)
  const cleanDescription = product.description 
    ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 155).trim() + '...'
    : `Pieza textil artesanal de la categoría ${product.category}. Confeccionada a mano en Bolivia. Disponibilidad: ${product.availability}. Precio: ${formattedPrice}.`;

  const metaTitle = `${product.name} (${formattedPrice}) - Bordados Flores`;

  // Absolute image URL resolution
  let imageUrl = product.imageUrl || '';
  if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    imageUrl = `${siteUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return {
    title: metaTitle,
    description: cleanDescription,
    keywords: [
      product.name, 
      product.category, 
      'bordados flores', 
      'artesania boliviana', 
      'polleras', 
      'chaquetas', 
      product.availability, 
      'oruro bolivia'
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${product.name} - ${formattedPrice}`,
      description: cleanDescription,
      url: pageUrl,
      siteName: 'Bordados Flores',
      locale: 'es_BO',
      type: 'article',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.name,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${formattedPrice}`,
      description: cleanDescription,
      creator: '@bordadosflores1',
      images: imageUrl ? [imageUrl] : [],
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'BOB',
      'product:availability': product.availability === 'En Stock' ? 'in stock' : 'preorder',
      'product:category': product.category || 'Textiles'
    }
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  // Fetch the product from Supabase database
  const { data: product, error } = await supabase
    .from('productos')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !product) {
    console.error('Error fetching product detail:', error);
    return notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bordadosflores.com';
  const pageUrl = `${siteUrl}/productos/${product.slug}`;

  // Structured Data (JSON-LD) for Search Engines and Social Media Crawlers
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl],
    description: product.description || `${product.name} - Artesanía boliviana bordada a mano.`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Bordados Flores'
    },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'BOB',
      price: product.price,
      availability: product.availability === 'En Stock' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
