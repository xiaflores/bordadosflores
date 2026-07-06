'use client';

import { useParams } from 'next/navigation';
import ProductForm from '@/components/product/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-2">Editar Producto</h2>
        <p className="text-sm text-on-surface-variant">Modifica los detalles y especificaciones del producto en Supabase. ID: <span className="font-mono text-primary font-bold">{id}</span></p>
      </div>

      {/* Form */}
      <ProductForm productId={id} />
    </div>
  );
}
