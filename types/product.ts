export interface Product {
  id: string;
  name: string;
  category: 'Chaquetas' | 'Polleras' | 'Accesorios' | 'Textiles';
  price: number;
  originalPrice?: number;
  discount?: number;
  availability: 'En Stock' | 'A Pedido';
  imageUrl: string;
  description: string;
  tags?: string[];
  images?: string[];
  color_name?: string;
  color_hex?: string;
  largo?: number;
  cintura?: number;
  panos?: number;
  talla?: string;
  slug?: string;
}
