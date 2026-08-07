'use client';

import { useState, useEffect, useRef } from 'react';
import { HeroSlide, getStoredHeroSlides } from '@/lib/homeContent';

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadSlides = () => {
    const loaded = getStoredHeroSlides();
    setSlides(loaded);
  };

  useEffect(() => {
    loadSlides();
    const handleUpdate = () => loadSlides();
    window.addEventListener('bordados_flores_slides_updated', handleUpdate);
    return () => window.removeEventListener('bordados_flores_slides_updated', handleUpdate);
  }, []);

  const startSlider = () => {
    stopSlider();
    if (slides.length <= 1) return;
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
  };

  const stopSlider = () => {
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
    }
  };

  useEffect(() => {
    startSlider();
    return () => stopSlider();
  }, [slides]);

  const handleIndicatorClick = (index: number) => {
    setCurrentSlide(index);
    startSlider(); // reset timer on manual interaction
  };

  if (slides.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-secondary-container text-on-secondary-container h-[260px] sm:h-[340px] md:h-[400px] lg:h-[460px] shadow-lg group">
      <div className="relative h-full w-full overflow-hidden">
        {/* Slides Container */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${(currentSlide * 100) / slides.length}%)`,
          }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="relative w-full h-full shrink-0" style={{ width: `${100 / slides.length}%` }}>
              <img
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                src={slide.imageUrl}
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative z-10 p-6 sm:p-12 lg:p-16 flex flex-col justify-center h-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%]">
                {slide.tag && (
                  <span className="bg-primary/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-label-md font-label-md inline-block mb-3 self-start font-bold uppercase tracking-wider text-xs">
                    {slide.tag}
                  </span>
                )}
                <h2 className="font-headline-lg text-headline-lg md:text-headline-xl text-white mb-4 lg:mb-6 max-w-2xl leading-tight">
                  {slide.title}
                </h2>
                <a
                  href={slide.link}
                  className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 md:px-8 md:py-4 rounded-full font-headline-sm text-headline-sm transition-all shadow-md self-start h-12 md:h-14 flex items-center justify-center cursor-pointer active:scale-95 font-bold uppercase tracking-wider text-xs"
                >
                  {slide.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleIndicatorClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none ${
                  index === currentSlide ? 'bg-white w-4' : 'bg-white/50'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
