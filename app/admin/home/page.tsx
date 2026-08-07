'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  HeroSlide, 
  HomeTexts, 
  getStoredHeroSlides, 
  saveStoredHeroSlides, 
  getStoredHomeTexts, 
  saveStoredHomeTexts, 
  DEFAULT_HERO_SLIDES, 
  DEFAULT_HOME_TEXTS 
} from '@/lib/homeContent';
import { 
  Image as ImageIcon, 
  Plus, 
  Pencil, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Save, 
  RotateCcw, 
  Check, 
  Upload, 
  Loader2, 
  Sparkles, 
  Layout, 
  Share2, 
  MessageSquare, 
  FileText,
  Eye
} from 'lucide-react';

export default function AdminHomePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [homeTexts, setHomeTexts] = useState<HomeTexts>(DEFAULT_HOME_TEXTS);
  
  // Modal & Form State for Slide Editing
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideTag, setSlideTag] = useState('');
  const [slideButtonText, setSlideButtonText] = useState('Ver Catálogo');
  const [slideLink, setSlideLink] = useState('/catalogo');
  const [slideImageUrl, setSlideImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Success Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSlides(getStoredHeroSlides());
    setHomeTexts(getStoredHomeTexts());
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Modal to Create Slide
  const handleOpenCreateModal = () => {
    setEditingSlideId(null);
    setSlideTitle('');
    setSlideTag('Novedades');
    setSlideButtonText('Ver Catálogo');
    setSlideLink('/catalogo');
    setSlideImageUrl('');
    setImageError(false);
    setIsSlideModalOpen(true);
  };

  // Open Modal to Edit Slide
  const handleOpenEditModal = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideTitle(slide.title);
    setSlideTag(slide.tag);
    setSlideButtonText(slide.buttonText);
    setSlideLink(slide.link);
    setSlideImageUrl(slide.imageUrl);
    setImageError(false);
    setIsSlideModalOpen(true);
  };

  // Upload image to Supabase storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_${Date.now()}.${fileExt}`;

      // Upload file to product-images or avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        // Fallback to avatars bucket if product-images doesn't exist
        const { error: avatarUploadErr } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });
        
        if (avatarUploadErr) throw avatarUploadErr;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        setSlideImageUrl(publicUrl);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        setSlideImageUrl(publicUrl);
      }

      setImageError(false);
      triggerToast('Imagen subida correctamente');
    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      alert('No se pudo subir la imagen. Por favor pega una URL de imagen o intenta de nuevo.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Slide (Create or Edit)
  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim() || !slideImageUrl.trim()) {
      alert('Por favor proporciona un título y la URL de la imagen.');
      return;
    }

    if (editingSlideId) {
      // Update existing
      const updated = slides.map(s => s.id === editingSlideId ? {
        id: editingSlideId,
        title: slideTitle,
        tag: slideTag,
        buttonText: slideButtonText,
        link: slideLink,
        imageUrl: slideImageUrl
      } : s);
      setSlides(updated);
      saveStoredHeroSlides(updated);
      triggerToast('Banner actualizado correctamente');
    } else {
      // Create new
      const newSlide: HeroSlide = {
        id: String(Date.now()),
        title: slideTitle,
        tag: slideTag || 'Novedades',
        buttonText: slideButtonText || 'Ver Catálogo',
        link: slideLink || '/catalogo',
        imageUrl: slideImageUrl
      };
      const updated = [...slides, newSlide];
      setSlides(updated);
      saveStoredHeroSlides(updated);
      triggerToast('Nuevo banner agregado con éxito');
    }

    setIsSlideModalOpen(false);
  };

  // Delete Slide
  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) {
      alert('Debe haber al menos un banner en el carrusel.');
      return;
    }
    if (confirm('¿Estás seguro de eliminar este banner del inicio?')) {
      const updated = slides.filter(s => s.id !== id);
      setSlides(updated);
      saveStoredHeroSlides(updated);
      triggerToast('Banner eliminado');
    }
  };

  // Move Slide Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    const temp = newSlides[index - 1];
    newSlides[index - 1] = newSlides[index];
    newSlides[index] = temp;
    setSlides(newSlides);
    saveStoredHeroSlides(newSlides);
    triggerToast('Orden actualizado');
  };

  // Move Slide Down
  const handleMoveDown = (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    const temp = newSlides[index + 1];
    newSlides[index + 1] = newSlides[index];
    newSlides[index] = temp;
    setSlides(newSlides);
    saveStoredHeroSlides(newSlides);
    triggerToast('Orden actualizado');
  };

  // Save Home Texts
  const handleSaveTexts = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredHomeTexts(homeTexts);
    triggerToast('Textos e información del Home guardados');
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm('¿Deseas restaurar los banners y textos por defecto del inicio?')) {
      setSlides(DEFAULT_HERO_SLIDES);
      setHomeTexts(DEFAULT_HOME_TEXTS);
      saveStoredHeroSlides(DEFAULT_HERO_SLIDES);
      saveStoredHomeTexts(DEFAULT_HOME_TEXTS);
      triggerToast('Contenido restaurado por defecto');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-body-md">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-semibold text-sm animate-bounce">
          <Check className="w-5 h-5 text-green-300 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            Personalización de la Tienda
          </div>
          <h1 className="font-headline-lg text-2xl lg:text-3xl font-bold text-on-surface">
            Gestión de Imágenes y Textos del Home
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Administra los banners principales del carrusel, títulos destacados y enlaces de redes sociales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 bg-surface-container text-on-surface-variant hover:text-error border border-outline-variant/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Restaurar contenido predeterminado"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Val. Predeterminados
          </button>
        </div>
      </div>

      {/* 1. HERO SLIDER BANNERS SECTION */}
      <section className="bg-white p-6 lg:p-8 rounded-2xl border border-outline-variant/30 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-on-surface flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Carrusel de Banners Principales (Hero Slider)
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Imágenes y avisos de impacto que se muestran al ingresar a la tienda.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Agregar Nuevo Banner
          </button>
        </div>

        {/* Banners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide, idx) => (
            <div 
              key={slide.id}
              className="bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
            >
              {/* Image Preview */}
              <div className="relative h-44 w-full bg-surface-container overflow-hidden">
                <img 
                  src={slide.imageUrl} 
                  alt={slide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Tag Badge */}
                {slide.tag && (
                  <span className="absolute top-3 left-3 bg-primary/80 backdrop-blur-md text-white text-[10px] uppercase font-bold px-2.5 py-1 rounded-full">
                    {slide.tag}
                  </span>
                )}

                {/* Index Badge */}
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  #{idx + 1}
                </span>

                {/* Title Overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-sm leading-tight line-clamp-2">{slide.title}</h3>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-4 space-y-3 flex-grow flex flex-col justify-between bg-white">
                <div className="text-xs text-on-surface-variant space-y-1">
                  <p><span className="font-bold text-on-surface">Botón:</span> {slide.buttonText}</p>
                  <p className="truncate"><span className="font-bold text-on-surface">Enlace:</span> {slide.link}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant disabled:opacity-30 disabled:hover:bg-surface transition-all cursor-pointer"
                      title="Mover arriba"
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === slides.length - 1}
                      className="p-1.5 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant disabled:opacity-30 disabled:hover:bg-surface transition-all cursor-pointer"
                      title="Mover abajo"
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(slide)}
                      className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 text-error hover:bg-error-container/30 rounded-lg transition-all cursor-pointer"
                      title="Eliminar banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. HOME TEXTS & HEADINGS SECTION */}
      <form onSubmit={handleSaveTexts} className="space-y-8">
        <section className="bg-white p-6 lg:p-8 rounded-2xl border border-outline-variant/30 shadow-xs space-y-6">
          <div className="border-b border-outline-variant/20 pb-4">
            <h2 className="font-headline-sm text-xl font-bold text-on-surface flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Títulos y Textos Promocionales del Home
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Personaliza las frases, títulos de secciones y anuncios principales de la página inicial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                Anuncio o Subtítulo del Banner Principal
              </label>
              <textarea
                rows={2}
                value={homeTexts.heroAnnounce}
                onChange={(e) => setHomeTexts({ ...homeTexts, heroAnnounce: e.target.value })}
                placeholder="Ej. Confección artesanal auténtica de polleras y chaquetas de Oruro, Bolivia"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                Título de la Sección de Productos Destacados
              </label>
              <input
                type="text"
                value={homeTexts.featuredTitle}
                onChange={(e) => setHomeTexts({ ...homeTexts, featuredTitle: e.target.value })}
                placeholder="Ej. Productos Destacados"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                Subtítulo / Leyenda de Productos Destacados
              </label>
              <input
                type="text"
                value={homeTexts.featuredSubtitle}
                onChange={(e) => setHomeTexts({ ...homeTexts, featuredSubtitle: e.target.value })}
                placeholder="Ej. Selección exclusiva bordada a mano"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* 3. SOCIAL MEDIA SHORTCUTS SECTION */}
        <section className="bg-white p-6 lg:p-8 rounded-2xl border border-outline-variant/30 shadow-xs space-y-6">
          <div className="border-b border-outline-variant/20 pb-4">
            <h2 className="font-headline-sm text-xl font-bold text-on-surface flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Enlaces de Redes Sociales
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Configura los accesos directos a tus cuentas oficiales que aparecen en el Home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block flex items-center gap-2">
                <i className="bx bxl-tiktok text-lg text-[#010101]" />
                Enlace a TikTok
              </label>
              <input
                type="url"
                value={homeTexts.socialTiktok}
                onChange={(e) => setHomeTexts({ ...homeTexts, socialTiktok: e.target.value })}
                placeholder="https://tiktok.com/@tu_cuenta"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block flex items-center gap-2">
                <i className="bx bxl-instagram text-lg text-[#ee2a7b]" />
                Enlace a Instagram
              </label>
              <input
                type="url"
                value={homeTexts.socialInstagram}
                onChange={(e) => setHomeTexts({ ...homeTexts, socialInstagram: e.target.value })}
                placeholder="https://instagram.com/tu_cuenta"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block flex items-center gap-2">
                <i className="bx bxl-facebook text-lg text-[#1877F2]" />
                Enlace a Facebook
              </label>
              <input
                type="url"
                value={homeTexts.socialFacebook}
                onChange={(e) => setHomeTexts({ ...homeTexts, socialFacebook: e.target.value })}
                placeholder="https://facebook.com/tu_pagina"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block flex items-center gap-2">
                <i className="bx bxl-whatsapp text-lg text-[#25D366]" />
                Enlace a WhatsApp
              </label>
              <input
                type="url"
                value={homeTexts.socialWhatsapp}
                onChange={(e) => setHomeTexts({ ...homeTexts, socialWhatsapp: e.target.value })}
                placeholder="https://wa.me/59171182580"
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/20">
            <button
              type="submit"
              className="px-8 py-3.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios de Textos
            </button>
          </div>
        </section>
      </form>

      {/* SLIDE EDIT / CREATE MODAL */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 lg:p-8 shadow-2xl border border-outline-variant/30 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {editingSlideId ? 'Editar Banner del Hero' : 'Agregar Nuevo Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-5">
              
              {/* Image Preview & File Upload */}
              <div className="space-y-2">
                <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Imagen del Banner
                </label>
                
                <div className="relative h-44 w-full bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/30 flex items-center justify-center">
                  {slideImageUrl && !imageError ? (
                    <img 
                      src={slideImageUrl} 
                      alt="Previsualización" 
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-on-surface-variant text-xs">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span>Ninguna imagen seleccionada</span>
                    </div>
                  )}

                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Subiendo a Supabase Storage...
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <label className="flex-grow flex items-center justify-center gap-2 px-4 py-3 bg-surface-container-high hover:bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Subir Imagen (Archivo)
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                    O pega el enlace URL directo de la imagen:
                  </label>
                  <input
                    type="url"
                    value={slideImageUrl}
                    onChange={(e) => {
                      setSlideImageUrl(e.target.value);
                      setImageError(false);
                    }}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Título Principal del Banner
                </label>
                <input
                  type="text"
                  required
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  placeholder="Ej. Bordados a Mano: Arte en cada hilo"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tag */}
                <div className="space-y-2">
                  <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                    Etiqueta Destacada
                  </label>
                  <input
                    type="text"
                    value={slideTag}
                    onChange={(e) => setSlideTag(e.target.value)}
                    placeholder="Ej. Colección / Artesanía"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* Button Text */}
                <div className="space-y-2">
                  <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                    Texto del Botón (CTA)
                  </label>
                  <input
                    type="text"
                    value={slideButtonText}
                    onChange={(e) => setSlideButtonText(e.target.value)}
                    placeholder="Ej. Ver Catálogo"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Link */}
              <div className="space-y-2">
                <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider block">
                  Enlace del Botón
                </label>
                <input
                  type="text"
                  value={slideLink}
                  onChange={(e) => setSlideLink(e.target.value)}
                  placeholder="Ej. /catalogo o https://wa.me/59171182580"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-5 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  {editingSlideId ? 'Guardar Banner' : 'Crear Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
