'use client';

import { useState, useEffect, useRef } from 'react';
import { mockHeroSlides } from '../data/products';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlider = () => {
    stopSlider();
    sliderIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mockHeroSlides.length);
    }, 4000);
  };

  const stopSlider = () => {
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
    }
  };

  useEffect(() => {
    startSlider();
    return () => stopSlider();
  }, []);

  const handleIndicatorClick = (index: number) => {
    setCurrentSlide(index);
    startSlider(); // reset timer on manual interaction
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-secondary-container text-on-secondary-container h-[240px] shadow-lg group">
      <div className="relative h-full w-full overflow-hidden">
        {/* Slides Container */}
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out"
          style={{
            width: `${mockHeroSlides.length * 100}%`,
            transform: `translateX(-${(currentSlide * 100) / mockHeroSlides.length}%)`,
          }}
        >
          {mockHeroSlides.map((slide) => (
            <div key={slide.id} className="relative w-full h-full shrink-0" style={{ width: `${100 / mockHeroSlides.length}%` }}>
              <img
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
                src={slide.imageUrl}
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="relative z-10 p-6 flex flex-col justify-center h-full max-w-[80%]">
                {slide.tag && (
                  <span className="bg-primary/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-label-md font-label-md inline-block mb-3 self-start">
                    {slide.tag}
                  </span>
                )}
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-white mb-4">
                  {slide.title}
                </h2>
                <a
                  href={slide.link}
                  className="bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-full font-headline-sm text-headline-sm transition-all shadow-md self-start h-12 flex items-center justify-center cursor-pointer active:scale-95"
                >
                  {slide.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {mockHeroSlides.map((_, index) => (
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
      </div>
    </section>
  );
}
