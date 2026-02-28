export const PROGS = [
  "Livelo",
  "Esfera",
  "Átomos",
  "Smiles",
  "Azul",
  "LATAM",
  "Inter",
  "Itaú"
] as const;

export type ProgramaFidelidade = typeof PROGS[number];

export const COLORS = {
  primary: '#0f172a',
  accent: '#d4af37',
  bg: '#f1f5f9',
  surface: '#ffffff',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#f59e0b',
  gray: '#64748b',
  bgDark: '#020617',
  surfaceDark: '#0f172a',
  borderDark: 'rgba(255,255,255,0.06)',
};

export const THRESHOLDS = {
  CPM_MAX_EXCELENTE: 18,
  CPM_MAX_ACEITAVEL: 25,
  CPV_MIN_EXCELENTE: 28,
  CPV_MIN_ACEITAVEL: 22,
  ROI_MIN_EXCELENTE: 30,
  ROI_MIN_BOM: 20,
  ROI_MIN_ACEITAVEL: 10,
};
