export interface Department {
  id: string;
  name: string;
  costo: number;
}

export const DEPARTAMENTOS: Department[] = [
  { id: 'or', name: 'Oruro (Recojo en Tienda/Taller)', costo: 0 },
  { id: 'lp', name: 'La Paz', costo: 15 },
  { id: 'cb', name: 'Cochabamba', costo: 25 },
  { id: 'sc', name: 'Santa Cruz', costo: 25 },
  { id: 'pt', name: 'Potosí', costo: 30 },
  { id: 'ch', name: 'Chuquisaca', costo: 30 },
  { id: 'tj', name: 'Tarija', costo: 30 },
  { id: 'bn', name: 'Beni', costo: 40 },
  { id: 'pn', name: 'Pando', costo: 40 },
  { id: 'otro', name: 'Otro (Especificar provincia/lugar)', costo: 35 }
];

export const DESTINATION_LABELS: Record<string, string> = {
  or: 'Oruro (Recojo en Tienda/Taller)',
  lp: 'La Paz',
  cb: 'Cochabamba',
  sc: 'Santa Cruz',
  pt: 'Potosí',
  ch: 'Chuquisaca',
  tj: 'Tarija',
  bn: 'Beni',
  pn: 'Pando',
  otro: 'Otro Lugar/Provincia'
};

export function getDepartamentosWithCosts(customCosts?: Record<string, number> | null): Department[] {
  if (!customCosts) return DEPARTAMENTOS;
  return DEPARTAMENTOS.map(dept => ({
    ...dept,
    costo: customCosts[dept.id] != null && !isNaN(Number(customCosts[dept.id]))
      ? Number(customCosts[dept.id])
      : dept.costo
  }));
}
