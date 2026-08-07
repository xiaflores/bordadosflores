'use client';

import { useState, useEffect } from 'react';
import { HomeTexts, getStoredHomeTexts } from '@/lib/homeContent';

export default function HomeSocialAndHeader() {
  const [texts, setTexts] = useState<HomeTexts>(getStoredHomeTexts());

  useEffect(() => {
    const handleUpdate = () => {
      setTexts(getStoredHomeTexts());
    };
    window.addEventListener('bordados_flores_texts_updated', handleUpdate);
    return () => window.removeEventListener('bordados_flores_texts_updated', handleUpdate);
  }, []);

  return (
    <>
      {/* Announcement Banner (if configured) */}
      {texts.heroAnnounce && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
          <p className="text-xs sm:text-sm font-semibold text-primary">
            ✨ {texts.heroAnnounce}
          </p>
        </div>
      )}

      {/* Social Media Shortcuts Integration */}
      <section className="flex justify-center gap-6 py-4" aria-label="Redes Sociales">
        {texts.socialTiktok && (
          <a
            title="TikTok"
            className="w-12 h-12 rounded-full bg-[#010101] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_0_15px_rgba(0,242,254,0.4),_0_0_15px_rgba(254,44,85,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 group"
            href={texts.socialTiktok}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bx bxl-tiktok text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </a>
        )}
        {texts.socialInstagram && (
          <a
            title="Instagram"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(238,42,123,0.25)] hover:shadow-[0_0_20px_rgba(238,42,123,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 group"
            href={texts.socialInstagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bx bxl-instagram text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </a>
        )}
        {texts.socialFacebook && (
          <a
            title="Facebook"
            className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:shadow-[0_0_20px_rgba(24,119,242,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 group"
            href={texts.socialFacebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bx bxl-facebook text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </a>
        )}
        {texts.socialWhatsapp && (
          <a
            title="WhatsApp"
            className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(37,211,102,0.25)] hover:shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:scale-110 active:scale-95 transition-all duration-300 group"
            href={texts.socialWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bx bxl-whatsapp text-xl group-hover:scale-110 transition-transform duration-300"></i>
          </a>
        )}
      </section>

      {/* Featured Header */}
      <div className="flex flex-col gap-1 pt-2">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          {texts.featuredTitle || 'Productos Destacados'}
        </h3>
        {texts.featuredSubtitle && (
          <p className="text-xs text-on-surface-variant/80 font-medium">
            {texts.featuredSubtitle}
          </p>
        )}
      </div>
    </>
  );
}
