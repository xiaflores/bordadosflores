export interface Product {
  id: string;
  name: string;
  category: 'Chaquetas' | 'Polleras' | 'Accesorios';
  price: number;
  originalPrice?: number;
  discount?: number;
  availability: 'En Stock' | 'A Pedido';
  imageUrl: string;
  description: string;
  tags?: string[];
}

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Saco Bordado Flores - Verde Oliva',
    category: 'Chaquetas',
    price: 120.00,
    originalPrice: 175.00,
    discount: 30,
    availability: 'En Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLvvs1krNcBTjWoG6aKp98AtAbzEFDcUuLjaKou9bUK6vS592ceK3doduQRuyb1m4zR9TVwk93NelxBWRRwb908IayY1ZtKuOHNzDg0B9kpMmhbV8dQPt3cE9U1ehVDeqsr0qqogh6TfQ22ilVhgRIJ3VOWy9Rl5xrB6e8pnmQltM3DPUh4gFAO87uohQgJmblbJg1EE3QUV4pWQJRVfys6YU5Cm7m0PeDaTkyBSgmfhI03QXbFGmIerlQ',
    description: 'Saco sastre premium de corte moderno con bordados tradicionales bolivianos hechos a mano en las solapas. Elegancia y patrimonio.',
    tags: ['Todos', 'Nuevos']
  },
  {
    id: 'p2',
    name: 'Chal Aguayo Seda',
    category: 'Accesorios',
    price: 85.00,
    availability: 'En Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7FG8Fsse5EpgTabs4Yx1p8NSfd__vFhYCw8-BJMf8ON0l0wNFterWf-DcSNLjvWFBa2RxKda3WWCm-0h0sXERzkxT415AkgeP-cuH03xOYgkhcSJ3rHwM7lXhyBgfU3UijQOkRhJLMTUJRhWEcnOqZR71wvzjyfXNZNK-IAT4KOUG56yLrMP3JO_vDQKNwiOGP5K4sblU3vfp9LO1e5jt0kYig6sV256XvbkVDrvVb2gsFm6ehHAvXk794FJBbbTZNm1HznyLrg',
    description: 'Elegante chal elaborado en seda con tramas inspiradas en el aguayo tradicional andino. Suave y abrigador.',
    tags: ['Todos']
  },
  {
    id: 'p3',
    name: 'Pollera Tradicional Herencia - Rojo Carmín',
    category: 'Polleras',
    price: 320.00,
    originalPrice: 380.00,
    discount: 15,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxHGAyw3uH0jMzH44ctfXVn49yiSvmV-ud3PoTrJhoB-9-IPt3QubYhaXUhymm0Kck8-nyWDc-mhpmegbYAQ0kXidmg8ZIC1Q7ajUvgJ37rCcAX8oSzROEWPXOjGUlatL-9w7-y0K-H9qw-HsyWexHqcxRSHwZBo93WYUAU0Q8UWFxW4Xhp8GW8ewfLJh_gb-C1LuBCsGafPgempnYDaYhDrKKpwCtUvnvypmYBJItXTy8PR-3NoJNPBK_z5CaXFf4cI-_dphmiw',
    description: 'Pollera artesanal confeccionada a medida con paños detallados y plisado tradicional boliviano.',
    tags: ['Todos', 'Nuevos']
  },
  {
    id: 'p4',
    name: 'Chaqueta de Gala Aguayo Fino',
    category: 'Chaquetas',
    price: 280.00,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLt9Ol8mBnhx0D1Q9_tIWq9C9TfImhS0OYNV69AXhIGJwJGGnH5ppTt5eoUStEHga0nfPK9rEAJ_C0_Aeu578r4dacGOXpC0ArQE6JzPwhTQM51jMMGMj04TkOaPXsgpP_V0iCoVRkIghO0NaYxpdhokedggjz2REgZm8C9yALg6RvPi7l-FVRBqVBmckCckWB3IQqDwO3n2vQFXleP2wgd39A2MgD7kjtMlBAJI6cpR3-bFXo7JS7etXA',
    description: 'Chaqueta formal con detalles en mangas y cuello de aguayo de alpaca de alta densidad.',
    tags: ['Todos']
  },
  {
    id: 'p5',
    name: 'Sombrero Cholita Elegancia',
    category: 'Accesorios',
    price: 150.00,
    availability: 'En Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Gj8r5Pfzr5wVfY4UpYGlMjd0UC6AvFmyBpN3GdaMfX1c_6ar8rYu8z7VEl6HCxFs0YyIkdzI_Ui506kDR4C56sJ5yiHBSi__UBTSC6wQlmuXVsY5SHFRy0DR9RlwfJEhc9sTqmBn60BBvgnF4O0zW_6tEG2Vxx8jJwN1mZnnLAmKcB28l7PbP6Ac3mA4UXHuESfpPJN2XBJLvUY91g5oxqfYRBbF3EOcvUq42OSXhm7tERQCkD2eCfRbEzKficjJifHo_DcBJg',
    description: 'Borsalino de alta calidad con cinta tejida artesanalmente. El complemento ideal para trajes tradicionales.',
    tags: ['Todos', 'Nuevos']
  },
  {
    id: 'p6',
    name: 'Pollera Terciopelo Imperial (4 Paños)',
    category: 'Polleras',
    price: 450.00,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxHGAyw3uH0jMzH44ctfXVn49yiSvmV-ud3PoTrJhoB-9-IPt3QubYhaXUhymm0Kck8-nyWDc-mhpmegbYAQ0kXidmg8ZIC1Q7ajUvgJ37rCcAX8oSzROEWPXOjGUlatL-9w7-y0K-H9qw-HsyWexHqcxRSHwZBo93WYUAU0Q8UWFxW4Xhp8GW8ewfLJh_gb-C1LuBCsGafPgempnYDaYhDrKKpwCtUvnvypmYBJItXTy8PR-3NoJNPBK_z5CaXFf4cI-_dphmiw',
    description: 'Pollera premium de terciopelo importado con 4 paños decorados con encajes y pedrería fina.',
    tags: ['Todos']
  }
];

export const mockHeroSlides = [
  {
    id: 1,
    title: 'Bordados Flores Tradicion y Cultura Boliviana',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLt9Ol8mBnhx0D1Q9_tIWq9C9TfImhS0OYNV69AXhIGJwJGGnH5ppTt5eoUStEHga0nfPK9rEAJ_C0_Aeu578r4dacGOXpC0ArQE6JzPwhTQM51jMMGMj04TkOaPXsgpP_V0iCoVRkIghO0NaYxpdhokedggjz2REgZm8C9yALg6RvPi7l-FVRBqVBmckCckWB3IQqDwO3n2vQFXleP2wgd39A2MgD7kjtMlBAJI6cpR3-bFXo7JS7etXA',
    tag: 'Colección',
    buttonText: 'Ver Catalogo',
    link: '#catalogo'
  },
  {
    id: 2,
    title: 'Bordados a Mano: Arte en cada hilo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxHGAyw3uH0jMzH44ctfXVn49yiSvmV-ud3PoTrJhoB-9-IPt3QubYhaXUhymm0Kck8-nyWDc-mhpmegbYAQ0kXidmg8ZIC1Q7ajUvgJ37rCcAX8oSzROEWPXOjGUlatL-9w7-y0K-H9qw-HsyWexHqcxRSHwZBo93WYUAU0Q8UWFxW4Xhp8GW8ewfLJh_gb-C1LuBCsGafPgempnYDaYhDrKKpwCtUvnvypmYBJItXTy8PR-3NoJNPBK_z5CaXFf4cI-_dphmiw',
    tag: 'Artesanía',
    buttonText: 'Ver Detalles',
    link: '#artesania'
  },
  {
    id: 3,
    title: 'Elegancia Alpaca: Tradición y Estilo',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Gj8r5Pfzr5wVfY4UpYGlMjd0UC6AvFmyBpN3GdaMfX1c_6ar8rYu8z7VEl6HCxFs0YyIkdzI_Ui506kDR4C56sJ5yiHBSi__UBTSC6wQlmuXVsY5SHFRy0DR9RlwfJEhc9sTqmBn60BBvgnF4O0zW_6tEG2Vxx8jJwN1mZnnLAmKcB28l7PbP6Ac3mA4UXHuESfpPJN2XBJLvUY91g5oxqfYRBbF3EOcvUq42OSXhm7tERQCkD2eCfRbEzKficjJifHo_DcBJg',
    tag: 'Premium',
    buttonText: 'Explorar',
    link: '#premium'
  }
];
