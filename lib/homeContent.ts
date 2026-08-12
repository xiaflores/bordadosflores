import { supabase } from '@/lib/supabase';

export interface HeroSlide {
  id: string;
  title: string;
  imageUrl: string;
  tag: string;
  buttonText: string;
  link: string;
}

export interface HomeTexts {
  heroAnnounce: string;
  featuredTitle: string;
  featuredSubtitle: string;
  socialTiktok: string;
  socialInstagram: string;
  socialFacebook: string;
  socialWhatsapp: string;
  minDeliveryDate?: string;
  shippingCosts?: Record<string, number>;
}

export const DEFAULT_SHIPPING_COSTS: Record<string, number> = {
  or: 0,
  lp: 15,
  cb: 25,
  sc: 25,
  pt: 30,
  ch: 30,
  tj: 30,
  bn: 40,
  pn: 40,
  otro: 35
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: '1',
    title: 'Bordados Flores Tradición y Cultura Boliviana',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLt9Ol8mBnhx0D1Q9_tIWq9C9TfImhS0OYNV69AXhIGJwJGGnH5ppTt5eoUStEHga0nfPK9rEAJ_C0_Aeu578r4dacGOXpC0ArQE6JzPwhTQM51jMMGMj04TkOaPXsgpP_V0iCoVRkIghO0NaYxpdhokedggjz2REgZm8C9yALg6RvPi7l-FVRBqVBmckCckWB3IQqDwO3n2vQFXleP2wgd39A2MgD7kjtMlBAJI6cpR3-bFXo7JS7etXA',
    tag: 'Colección',
    buttonText: 'Ver Catálogo',
    link: '/catalogo'
  },
  {
    id: '2',
    title: 'Bordados a Mano: Arte en cada hilo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxHGAyw3uH0jMzH44ctfXVn49yiSvmV-ud3PoTrJhoB-9-IPt3QubYhaXUhymm0Kck8-nyWDc-mhpmegbYAQ0kXidmg8ZIC1Q7ajUvgJ37rCcAX8oSzROEWPXOjGUlatL-9w7-y0K-H9qw-HsyWexHqcxRSHwZBo93WYUAU0Q8UWFxW4Xhp8GW8ewfLJh_gb-C1LuBCsGafPgempnYDaYhDrKKpwCtUvnvypmYBJItXTy8PR-3NoJNPBK_z5CaXFf4cI-_dphmiw',
    tag: 'Artesanía',
    buttonText: 'Ver Detalles',
    link: '/catalogo'
  },
  {
    id: '3',
    title: 'Elegancia Alpaca: Tradición y Estilo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Gj8r5Pfzr5wVfY4UpYGlMjd0UC6AvFmyBpN3GdaMfX1c_6ar8rYu8z7VEl6HCxFs0YyIkdzI_Ui506kDR4C56sJ5yiHBSi__UBTSC6wQlmuXVsY5SHFRy0DR9RlwfJEhc9sTqmBn60BBvgnF4O0zW_6tEG2Vxx8jJwN1mZnnLAmKcB28l7PbP6Ac3mA4UXHuESfpPJN2XBJLvUY91g5oxqfYRBbF3EOcvUq42OSXhm7tERQCkD2eCfRbEzKficjJifHo_DcBJg',
    tag: 'Premium',
    buttonText: 'Explorar',
    link: '/catalogo'
  }
];

export const DEFAULT_HOME_TEXTS: HomeTexts = {
  heroAnnounce: 'Confección artesanal auténtica de polleras, chaquetas y textiles andinos de Oruro, Bolivia',
  featuredTitle: 'Productos Destacados',
  featuredSubtitle: 'Selección exclusiva de alta costura tradicional bordada a mano por maestros artesanos.',
  socialTiktok: 'https://tiktok.com/@bordadodosflores',
  socialInstagram: 'https://instagram.com/bordadosflores1',
  socialFacebook: 'https://facebook.com/bordadosflores1',
  socialWhatsapp: 'https://wa.me/59171182580',
  shippingCosts: DEFAULT_SHIPPING_COSTS
};

const SLIDES_STORAGE_KEY = 'bordados_flores_hero_slides';
const TEXTS_STORAGE_KEY = 'bordados_flores_home_texts';

export function getStoredHeroSlides(): HeroSlide[] {
  if (typeof window === 'undefined') return DEFAULT_HERO_SLIDES;
  try {
    const raw = localStorage.getItem(SLIDES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading hero slides from localStorage:', e);
  }
  return DEFAULT_HERO_SLIDES;
}

export function saveStoredHeroSlides(slides: HeroSlide[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SLIDES_STORAGE_KEY, JSON.stringify(slides));
    window.dispatchEvent(new Event('bordados_flores_slides_updated'));
  } catch (e) {
    console.error('Error saving hero slides to localStorage:', e);
  }
}

export function getStoredHomeTexts(): HomeTexts {
  if (typeof window === 'undefined') return DEFAULT_HOME_TEXTS;
  try {
    const raw = localStorage.getItem(TEXTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_HOME_TEXTS, ...parsed };
    }
  } catch (e) {
    console.error('Error reading home texts from localStorage:', e);
  }
  return DEFAULT_HOME_TEXTS;
}

export function saveStoredHomeTexts(texts: HomeTexts): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEXTS_STORAGE_KEY, JSON.stringify(texts));
    window.dispatchEvent(new Event('bordados_flores_texts_updated'));
  } catch (e) {
    console.error('Error saving home texts to localStorage:', e);
  }
}
