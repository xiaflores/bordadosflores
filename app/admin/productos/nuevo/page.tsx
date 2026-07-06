'use client';

import ProductForm from '@/components/product/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Breadcrumbs / Header */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-2">Añadir Nuevo Producto</h2>
        <p className="text-sm text-on-surface-variant">Registra un nuevo textil artesanal en la base de datos de Bordados Flores.</p>
      </div>

      {/* Form */}
      <ProductForm />
    </div>
  );
}
