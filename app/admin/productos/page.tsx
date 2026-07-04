'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  availability: 'En Stock' | 'A Pedido';
  imageUrl: string;
  featured: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todos');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('id, name, category, price, availability, imageUrl, featured')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data) {
        setProducts(data.map(p => ({
          ...p,
          price: Number(p.price)
        })));
      }
    } catch (err) {
      console.error('Error fetching products from database:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (productId: string, currentVal: boolean) => {
    const newVal = !currentVal;
    
    // Optimistic state update
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, featured: newVal } : p))
    );

    try {
      const { error } = await supabase
        .from('productos')
        .update({ featured: newVal })
        .eq('id', productId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating product visibility:', err);
      // Revert optimistic update
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, featured: currentVal } : p))
      );
      alert('Error al actualizar la visibilidad en Supabase.');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${productName}"?`)) return;

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      
      // Update UI
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Ocurrió un error al eliminar el producto en Supabase.');
    }
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'todos' || 
                            product.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-semibold">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-container-max mx-auto space-y-8 flex-grow flex flex-col">
      
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-2">Catálogo de Productos</h3>
          <p className="text-sm md:text-base text-on-surface-variant">Administra el inventario de textiles exclusivos bolivianos.</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 shrink-0 cursor-pointer text-sm"
        >
          <span className="material-symbols-outlined">add</span>
          Añadir Producto
        </Link>
      </div>

      {/* Real-time search and filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-outline-variant/10 shadow-sm">
        <div className="relative md:col-span-2">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all focus:bg-white focus:outline-none"
            placeholder="Buscar por nombre, categoría o SKU/ID..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all focus:bg-white appearance-none focus:outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="todos">Todas las categorías</option>
            <option value="chaquetas">Chaquetas</option>
            <option value="polleras">Polleras</option>
            <option value="accesorios">Accesorios</option>
            <option value="textiles">Textiles</option>
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
            expand_more
          </span>
        </div>
      </div>

      {/* Catalog Table Container */}
      <section className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex-grow flex flex-col justify-between">
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/20">
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Imagen</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Nombre de Producto</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Categoría</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Precio</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Estado</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant text-center">Destacado</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-low/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 shadow-inner">
                        {product.imageUrl ? (
                          <img alt={product.name} className="w-full h-full object-cover" src={product.imageUrl} />
                        ) : (
                          <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-lg">image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface leading-snug">{product.name}</div>
                      <div className="text-xs text-on-surface-variant font-semibold">SKU: {product.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-on-surface">{product.price} Bs.</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${product.availability === 'En Stock' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                        <span className="text-sm font-bold text-on-surface">{product.availability}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.featured)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            product.featured ? 'bg-primary' : 'bg-surface-container-highest'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              product.featured ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant font-medium">
                    No se encontraron productos en el catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card List View */}
        <div className="lg:hidden divide-y divide-outline-variant/10">
          {currentItems.length > 0 ? (
            currentItems.map((product) => (
              <div key={product.id} className="p-5 hover:bg-surface-container-low/20 transition-colors">
                <div className="flex gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 flex-shrink-0 shadow-inner">
                    {product.imageUrl ? (
                      <img alt={product.name} className="w-full h-full object-cover" src={product.imageUrl} />
                    ) : (
                      <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-primary/5 text-primary text-[9px] font-extrabold rounded-full uppercase tracking-wider mb-1 inline-block">
                        {product.category}
                      </span>
                      <div className="flex gap-1">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="p-1.5 text-on-surface-variant hover:text-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 text-on-surface-variant hover:text-red-600 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-on-surface text-base truncate">{product.name}</h4>
                    <p className="text-xs text-on-surface-variant font-semibold">SKU: {product.id}</p>
                    <p className="text-base font-extrabold text-primary mt-1">{product.price} Bs.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${product.availability === 'En Stock' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                    <span className="text-xs font-bold text-on-surface">{product.availability}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">Destacado</span>
                    <button
                      onClick={() => handleToggleFeatured(product.id, product.featured)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        product.featured ? 'bg-primary' : 'bg-surface-container-highest'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          product.featured ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-on-surface-variant font-medium">
              No se encontraron productos en el catálogo.
            </div>
          )}
        </div>

        {/* Pagination Section */}
        <div className="px-6 py-6 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between bg-surface-container-low/10 gap-4">
          <span className="text-sm font-medium text-on-surface-variant order-2 md:order-1">
            Mostrando <span className="text-on-surface font-bold">{currentItems.length}</span> de <span className="text-on-surface font-bold">{totalItems}</span> productos
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 order-1 md:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 flex flex-col sm:flex-row justify-between items-center border-t border-outline-variant/15 text-xs md:text-sm text-on-surface-variant/70 gap-4">
        <div className="text-primary font-extrabold text-base">Bordados Flores</div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-primary transition-colors font-medium">Políticas de Privacidad</Link>
          <Link href="#" className="hover:text-primary transition-colors font-medium">Términos de Servicio</Link>
          <Link href="#" className="hover:text-primary transition-colors font-medium">Soporte</Link>
        </div>
        <div>© 2026 Bordados Flores. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}
