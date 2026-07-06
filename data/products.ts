import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  // Products from code.html (Home Page and Catalog Page references)
  {
    id: 'c1',
    name: 'Blanco Nevado',
    category: 'Chaquetas',
    price: 950.00,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtU1z2yLP174xm4NQGevSvs1p2vtrVJeBwrRrJx13zhhCvPsyxJoVo_LylGUhaJ6eQ80dL7GecJeIlylAb-OSDQMfGcvJR9QPPwX5yQInwOQ3V7ZMF7xHPaetCer5rMu43Ma3ViGI_lNfaZb4cz6WKhUsL0KuPiGKUCtiENoDn0GmNNR4Ej5eQIeyhjSHx3eVbU2pd44_HWpO3SfVicIVwdz2AphsfWEU3Nj_V3Fy-ejxkNjqLQ7owlZsreE2yOjv803wClEU85w',
    description: 'Chaqueta premium blanca confeccionada con telas bolivianas y finas costuras.',
    tags: ['Novedades']
  },
  {
    id: 'c2',
    name: 'Fucsia Tradicional',
    category: 'Polleras',
    price: 850.00,
    availability: 'En Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl_OgyWB3-x7vlS-AqxaNJY4WXPl4SnGDQluAOxCnM8J8Zk-LA3Thw-NtICtlusHIVZ0ihy2c_8byQz1woSAGc9_qv8tEfV5wgSbK835LwSMDWwNwFkLqdEf2HvvyqmI4KT5zPJhOk1V3g8dEPiQtMZCcnlSuPmMgTLP4PgxkcKIqO9AUd4F7bY9gu2iBvqg6uSlHTTugvqDqUnL6qeBjhxFZGz7M6JHqWXImci1CKelLOn0TOI8w0HzKtdaYwNV_s089SCJuQBw',
    description: 'Pollera tradicional de color fucsia intenso y pliegues marcados hechos por artesanos.',
    tags: ['Novedades']
  },
  {
    id: 'c3',
    name: 'Tierra de Fuego',
    category: 'Chaquetas',
    price: 1100.00,
    availability: 'En Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbxEpEUd2n_sjjw25ZSabKc5dEgPb90jGZdKkioqk-0m2-7muCWsp8iHmCkoVIE3SDqD6OdV_QJdxuv0nPN64qTFf4TvRpd5SkSd8gCEgBjLWPFwZiKIJuYhJ7ZLMu5zJtvsH-LR5wPrY1UUyI0xK6tlwxC8kOrvYwwbUq8IOvG-PjDR8sfGpivttls72xqS8OIE3ymC6-w5-q7ElK0pEHYnVIsAcEc5UYsJeLlrpkk-7ht_voKfVXyJS1V-xdBoRNfBwIE4bisw',
    description: 'Chaqueta de diseño exclusivo inspirado en los tonos terracotas andinos.',
    tags: ['Novedades']
  },
  {
    id: 'c4',
    name: 'Minimal Negro',
    category: 'Chaquetas',
    price: 880.00,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcmrbNkagVbOU6jvPXSJOnDmuyZmPU6wZU6LIB8KYGkm9PQ_yJIWdK59XrvU29m5xvzcMaYh29TtOPZz9uEbYNG5GspucOMGnCNh37TuceWeGgC4lYqSgfVfNugvxtLJ77Ty1mEURazYjWiN3oQQMl36cgvvDDOg2s20VueyHkLcl0MaaWLPqBnxMIOKgUi-EdyByO8-iMzuXFrIYBod2b6F139k6O3dIz7sLCI5xRD4XKqISbszch4TZFIjh5cVf987jrZEsTGQ',
    description: 'Saco minimalista negro con bordados discretos de hilo plateado.',
    tags: ['Todos']
  },
  {
    id: 'c5',
    name: 'Gala Esmeralda',
    category: 'Polleras',
    price: 1450.00,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtkwRHIAOIHr1ORleAJ8gQ_VyViOz2IDZ8G16izKpUVoCUSYVWo_W0cjL1vRjyJ5rwOloyP9goI2X8qZDgpUSVqBoyuTZ0uNCRYwkeQgCDPY5spLFap5LNKl931Fn717Cp6KzvIzoeLzd5TooaTUySuxEeM0m_Xa1I1LeB-C-5SVYcE8S7rIsF25fqo_EOeJKLQ7P-bzJHVPgr-phv8q0T4IOJQUIv3GjVBekaeVNt0NuaYFboE8zAJRrxE4DQxXzg420LAYgG-A',
    description: 'Pollera de gala verde esmeralda con encajes importados y caída elegante.',
    tags: ['Todos']
  },
  {
    id: 'c6',
    name: 'Rayas Tradicionales',
    category: 'Polleras',
    price: 720.00,
    availability: 'En Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADcMa7qBWtlu6MIQlhEdweXGxdE6M0t0w0YZmeX4HmGlP7HpL13cgOMAe2EizAXjreEa7Rryc8XLRVx1TQiNLbcyFTW85EbNnE6_w1gdE4BXv6ouXccPIT_T04DJbVuFTlQ0al97GjNKiuoYbTSAT3fifPWynGA325JUuPKKTBkWVIGHdqN2VYLxQFIm_OE0OPuvHsAiD29qUPJbt3oHhbYlIxUWsFTVLpU9jr3cF33nyZdYZZMXnptKf3hcQvB1PO9-myVfr9gw',
    description: 'Pollera clásica con rayas multicolores tradicionales hechas en telares criollos.',
    tags: ['Nuevos']
  },
  {
    id: 'c7',
    name: 'Detalle Carmín',
    category: 'Polleras',
    price: 890.00,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7ybbODaWoA6v3pPG9XNzrTcUNyVe5PmAmtWffpNp8FW-krN5Ai0241ujBUll2b6Im_S6e3NW6dUb_5zOr8tddLuu_EiUVzDsPXtJoqGuFpqGhYvxfJQSe4NQgrZO8yQd0kqwf2N59k1IVMb3Hdhq-yYxbC1BmPW3REosV0Q5m97bPfSMpo7AaJg2y7Yej4ghpfDYMaOnJTg-nL0JyaKxylHg87mksadFLvhcGdwKEfvxkd7syzcUdzFoqex-1hsAJ2tiejkXgDw',
    description: 'Pollera carmín de paño importado y decoraciones de encaje floral.',
    tags: ['Todos']
  },
  {
    id: 'c8',
    name: 'Crema Llama',
    category: 'Chaquetas',
    price: 1050.00,
    availability: 'En Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2YJ1D9aTzsmgdBmlvnW8wuLluIMw_9WXB8r4J93ASz6FGDDzX40rJzIuNJVAX1bkbS70aPziCkl02p1lt_Yi_mmyeZYDfyjHQ9ViLznW1M-c5x6F4vXZMyJxFrIBb0TD-ZF44FgVqXBPWelywfGjzp6tCnMU0MvQGX37On0suTl-cAyXdQWDGnSBeoLF4zqFT7YWCgSQOp4YIYZKIaJhhM4EHpflmTqjX78-HwcWAfnXLOXGcEsWYpNGhYaX2oz6EMPNR9ikajQ',
    description: 'Chaqueta artesanal de color crema de alpaca fina tejida.',
    tags: ['Nuevos']
  },
  {
    id: 'c9',
    name: 'Bosque Profundo',
    category: 'Polleras',
    price: 1200.00,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUgdGeSXnZ1vdnIbS48L5jnuVpW37ZZKdfi-E2zbSESiVocfSVu-ULPLe1jWI0ucJViw2yWEgN27KujpLGP9ipLdO7VtRh4LnxnGmezIKnVkvR0x8KeQvIHECoiLgKnkjo5bNqMAbcw53dc3AcSS18qlxsITl4nwE_oZq2cGOIaCbLPkak9BpbzhXV1PgvORTzkSxgaZIakL0_TqA4gNgGIsb9lrnir4_COnhvGJkuaeVpaHPnemFQA39g_4JjjLc0GefL4bmePw',
    description: 'Pollera premium de color verde bosque con finos detalles artesanales.',
    tags: ['Todos']
  },
  {
    id: 'c10',
    name: 'Aguayo Magenta',
    category: 'Chaquetas',
    price: 980.00,
    availability: 'En Stock',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLT-4fV81GLAvOj-rjZvka6RNmiUlyGWh_IEuU2GlLn9OMQqVLMOV3-3sILaIsuNaAQ_PXQN4UC1JBnNp9OiRHqJozVVWUFgYTap_LXt3Kh5DUhdxp2Lu4mYRPY_JgugzJB2LU-Z2FUMFd3wzlbDqVIHDjiJSqPpidtcESEO_hNFLaNxyN9DFJw1Pmov_Luh4L31SvGZeHe0slbWr_NY0aX_4hpD4SSljaB0xdufVByuSpe9J2H_z45QIp2tgDPY2epQHEjsbuYw',
    description: 'Saco premium con solapa estampada en aguayo tradicional magenta.',
    tags: ['Novedades']
  },
  // Extra products from the first task & placeholders to fill other categories
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
    id: 't1',
    name: 'Tejido Aguayo Tradicional',
    category: 'Textiles',
    price: 600.00,
    availability: 'A Pedido',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxHGAyw3uH0jMzH44ctfXVn49yiSvmV-ud3PoTrJhoB-9-IPt3QubYhaXUhymm0Kck8-nyWDc-mhpmegbYAQ0kXidmg8ZIC1Q7ajUvgJ37rCcAX8oSzROEWPXOjGUlatL-9w7-y0K-H9qw-HsyWexHqcxRSHwZBo93WYUAU0Q8UWFxW4Xhp8GW8ewfLJh_gb-C1LuBCsGafPgempnYDaYhDrKKpwCtUvnvypmYBJItXTy8PR-3NoJNPBK_z5CaXFf4cI-_dphmiw',
    description: 'Tela de aguayo tejida a mano con lana de alpaca teñida naturalmente con pigmentos orgánicos.',
    tags: ['Todos']
  }
];

export const mockHeroSlides = [
  {
    id: 1,
    title: 'Bordados Flores Tradición y Cultura Boliviana',
    imageUrl: 'https://lh3.googleusercontent.com/aida/AP1WRLt9Ol8mBnhx0D1Q9_tIWq9C9TfImhS0OYNV69AXhIGJwJGGnH5ppTt5eoUStEHga0nfPK9rEAJ_C0_Aeu578r4dacGOXpC0ArQE6JzPwhTQM51jMMGMj04TkOaPXsgpP_V0iCoVRkIghO0NaYxpdhokedggjz2REgZm8C9yALg6RvPi7l-FVRBqVBmckCckWB3IQqDwO3n2vQFXleP2wgd39A2MgD7kjtMlBAJI6cpR3-bFXo7JS7etXA',
    tag: 'Colección',
    buttonText: 'Ver Catálogo',
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
