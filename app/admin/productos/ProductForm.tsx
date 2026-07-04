'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!productId;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Chaquetas');
  const [price, setPrice] = useState(0);
  const [availability, setAvailability] = useState<'En Stock' | 'A Pedido'>('En Stock');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Dynamic spec attributes
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#9b0044');
  const [talla, setTalla] = useState(''); // Size (Chaquetas / Accesorios)
  const [largo, setLargo] = useState<number | ''>(''); // Length (Polleras)
  const [cintura, setCintura] = useState<number | ''>(''); // Waist (Polleras)
  const [panos, setPanos] = useState<number | ''>(''); // Pleats (Polleras)

  // Fetch product data if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;

        if (data) {
          setId(data.id);
          setName(data.name || '');
          setCategory(data.category || 'Chaquetas');
          setPrice(Number(data.price) || 0);
          setAvailability(data.availability || 'En Stock');
          setDescription(data.description || '');
          setImageUrl(data.imageUrl || '');
          setImages(data.images || []);
          
          // Spec attributes
          setColorName(data.color_name || '');
          setColorHex(data.color_hex || '#9b0044');
          setTalla(data.talla || '');
          setLargo(data.largo || '');
          setCintura(data.cintura || '');
          setPanos(data.panos || '');
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setErrorMsg('No se pudo cargar el producto de la base de datos.');
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [productId, isEditMode]);

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate fields
    if (!name || !category || price <= 0 || !imageUrl) {
      setErrorMsg('Por favor completa los campos requeridos (Nombre, Categoría, Precio y URL de Imagen Principal).');
      setLoading(false);
      return;
    }

    const slugId = isEditMode ? id : (id.trim() || `prod_${Math.random().toString(36).substring(2, 9)}`);

    const productPayload = {
      id: slugId,
      name,
      category,
      price,
      availability,
      imageUrl,
      description,
      images,
      // Spec attributes
      color_name: colorName || null,
      color_hex: colorHex || null,
      talla: talla || null,
      largo: largo ? Number(largo) : null,
      cintura: cintura ? Number(cintura) : null,
      panos: panos ? Number(panos) : null
    };

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('productos')
          .update(productPayload)
          .eq('id', productId);

        if (error) throw error;
        setSuccessMsg('¡Producto actualizado exitosamente!');
      } else {
        const { error } = await supabase
          .from('productos')
          .insert([productPayload]);

        if (error) throw error;
        setSuccessMsg('¡Producto creado exitosamente!');
      }

      // Redirect back after a delay
      setTimeout(() => {
        router.push('/admin/productos');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMsg(err.message || 'Ocurrió un error al guardar el producto.');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-semibold">Cargando datos del producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="divide-y divide-outline-variant/25">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Header Feedback */}
          {errorMsg && (
            <div className="p-4 text-sm text-error bg-error-container/30 border border-error/20 rounded-xl text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-4 text-sm text-primary bg-primary-fixed/20 border border-primary/20 rounded-xl text-center">
              {successMsg}
            </div>
          )}

          {/* Section 1: Product Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Información del Producto</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SKU / ID */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">SKU / Identificador Único</label>
                <input
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm disabled:opacity-60"
                  placeholder="ej. BF-JKT-001 (Automático si se deja vacío)"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  disabled={isEditMode}
                />
              </div>

              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Nombre del Producto <span className="text-primary">*</span></label>
                <input
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                  placeholder="ej. Chaqueta Kantuta Imperial"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Categoría <span className="text-primary">*</span></label>
                <div className="relative">
                  <select
                    className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/5 appearance-none transition-all text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Chaquetas">Chaquetas</option>
                    <option value="Polleras">Polleras</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Textiles">Textiles</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Price and Stock */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
              <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Precio y Disponibilidad</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Precio (Bs.) <span className="text-primary">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium text-sm">Bs.</span>
                  <input
                    className="w-full h-11 pl-12 pr-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                    placeholder="850.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              {/* Stock toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Disponibilidad</label>
                <div className="h-11 flex items-center justify-between bg-surface-container-low px-4 rounded-xl border border-outline-variant/30">
                  <span className={`text-sm font-bold ${availability === 'En Stock' ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {availability === 'En Stock' ? 'En Stock' : 'A Pedido'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAvailability(prev => prev === 'En Stock' ? 'A Pedido' : 'En Stock')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      availability === 'En Stock' ? 'bg-primary' : 'bg-outline-variant/50'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        availability === 'En Stock' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Spec Attributes based on Category */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-primary text-xl">tune</span>
              <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Atributos de Especificación</h3>
            </div>

            {/* Dynamic Attributes Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Color Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Nombre del Color</label>
                <input
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                  placeholder="ej. Rojo Kantuta, Azul Colonial"
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                />
              </div>

              {/* Color Hex */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">Código Hex de Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    className="w-12 h-11 border border-outline-variant/50 rounded-xl cursor-pointer p-1 bg-white"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                  />
                  <input
                    className="flex-1 h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm font-mono"
                    placeholder="#ffffff"
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                  />
                </div>
              </div>

              {/* CATEGORY: Chaquetas / Textiles */}
              {(category === 'Chaquetas' || category === 'Textiles') && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-on-surface">Talla / Dimensiones</label>
                  <div className="flex flex-wrap gap-2">
                    {['Única', 'XS', 'S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTalla(size)}
                        className={`h-10 px-6 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          talla === size
                            ? 'bg-primary/10 text-primary border-primary font-bold shadow-sm'
                            : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                    <input
                      type="text"
                      className="h-10 px-4 flex-1 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-sm placeholder:text-on-surface-variant/40 focus:border-primary"
                      placeholder="Otra talla o tamaño personalizado..."
                      value={talla}
                      onChange={(e) => setTalla(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* CATEGORY: Polleras */}
              {category === 'Polleras' && (
                <>
                  {/* Largo */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-on-surface">Largo (cm)</label>
                    <div className="flex gap-2">
                      {[40, 45, 50, 55].map((lengthVal) => (
                        <button
                          key={lengthVal}
                          type="button"
                          onClick={() => setLargo(lengthVal)}
                          className={`flex-1 h-10 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                            largo === lengthVal
                              ? 'bg-primary/10 text-primary border-primary font-bold shadow-sm'
                              : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary'
                          }`}
                        >
                          {lengthVal}cm
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      className="w-full h-11 px-4 mt-1 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-sm focus:border-primary"
                      placeholder="Largo personalizado (cm)"
                      value={largo}
                      onChange={(e) => setLargo(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>

                  {/* Waist / Cintura */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-on-surface">Cintura (cm)</label>
                    <input
                      className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm"
                      placeholder="ej. 70"
                      type="number"
                      value={cintura}
                      onChange={(e) => setCintura(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>

                  {/* Pleats / Panos */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-on-surface">Paños y Volumen</label>
                    <div className="relative">
                      <select
                        className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary appearance-none text-sm"
                        value={panos}
                        onChange={(e) => setPanos(e.target.value ? Number(e.target.value) : '')}
                      >
                        <option value="">Seleccionar pliegues</option>
                        <option value="6">6 Paños</option>
                        <option value="8">8 Paños</option>
                        <option value="10">10 Paños</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                        expand_more
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* CATEGORY: Accesorios */}
              {category === 'Accesorios' && (
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-semibold text-on-surface">Tipo de Accesorio</label>
                  <div className="flex flex-wrap gap-2">
                    {['Manta', 'Chal', 'Sombrero', 'Bolso'].map((accType) => (
                      <button
                        key={accType}
                        type="button"
                        onClick={() => setTalla(accType)}
                        className={`h-10 px-6 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                          talla === accType
                            ? 'bg-primary/10 text-primary border-primary font-bold shadow-sm'
                            : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary'
                        }`}
                      >
                        {accType}
                      </button>
                    ))}
                    <input
                      type="text"
                      className="h-10 px-4 flex-1 rounded-xl bg-surface-container-lowest border border-outline-variant/50 text-sm placeholder:text-on-surface-variant/40 focus:border-primary"
                      placeholder="Otro tipo de accesorio..."
                      value={talla}
                      onChange={(e) => setTalla(e.target.value)}
                    />
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* Section 4: Multimedia Upload */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">imagesmode</span>
                <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Multimedia</h3>
              </div>
              <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded">
                Máx. 5 Imágenes
              </span>
            </div>

            <div className="space-y-4">
              {/* Primary Image URL */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface">URL de Imagen Principal <span className="text-primary">*</span></label>
                <input
                  className="w-full h-11 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>

              {/* Grid of images preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Image adding interface */}
                <div className="lg:col-span-1">
                  <div className="p-4 border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest flex flex-col gap-3">
                    <span className="text-xs font-semibold text-on-surface-variant">Añadir Imagen Adicional</span>
                    <input
                      className="w-full h-10 px-3 rounded-lg border border-outline-variant/50 text-xs"
                      placeholder="URL de imagen adicional..."
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      disabled={images.length >= 4}
                      className="w-full py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/15 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Añadir a Galería
                    </button>
                  </div>
                </div>

                {/* List of current secondary images */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-full items-center">
                    
                    {/* Primary Image preview */}
                    <div className="aspect-square rounded-xl bg-surface-container-highest overflow-hidden relative border-2 border-primary shadow-sm group">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Principal" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-outline-variant">
                          <span className="material-symbols-outlined text-2xl">image</span>
                          <span className="text-[10px] font-bold mt-1">Sin Imagen</span>
                        </div>
                      )}
                      <div className="absolute bottom-1 inset-x-1 bg-black/60 text-white text-[9px] py-0.5 rounded text-center font-bold">
                        PRINCIPAL
                      </div>
                    </div>

                    {/* Secondary Images preview */}
                    {Array.from({ length: 4 }).map((_, index) => {
                      const img = images[index];
                      return img ? (
                        <div key={index} className="aspect-square rounded-xl bg-surface-container-highest overflow-hidden relative shadow-sm border border-outline-variant/20 group">
                          <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={img} alt={`Galería ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-full p-1 shadow-lg hover:bg-error transition-colors cursor-pointer text-white flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <div key={index} className="aspect-square rounded-xl bg-surface-container-low flex flex-col items-center justify-center border border-outline-variant/20 border-dashed text-outline-variant/60">
                          <span className="material-symbols-outlined text-xl">image</span>
                          <span className="text-[9px] mt-1">Vacío</span>
                        </div>
                      );
                    })}

                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Section 5: Description */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-primary text-xl">description</span>
              <h3 className="font-bold text-sm uppercase tracking-widest text-on-surface-variant">Descripción del Catálogo</h3>
            </div>
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm resize-none placeholder:text-on-surface-variant/40"
                placeholder="Describe los materiales, técnicas de tejido, bordado andino e instrucciones de cuidado de la prenda..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </section>

        </div>

        {/* Form Footer Action Buttons */}
        <div className="bg-surface-container-low/30 p-6 md:p-8 flex flex-col sm:flex-row gap-4 justify-end">
          <Link
            href="/admin/productos"
            className="w-full sm:w-auto px-8 py-3 bg-transparent border-2 border-outline text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-all order-2 sm:order-1 text-center text-sm"
          >
            Cancelar Cambios
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 active:scale-95 transition-all flex items-center justify-center gap-2 order-1 sm:order-2 cursor-pointer text-sm disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">save</span>
                {isEditMode ? 'Guardar Cambios' : 'Guardar Producto'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
