import { ThemeConfig, ThemeId, FontId } from '../types/timer';

export const THEMES: ThemeConfig[] = [
  {
    id: 'classic',
    name: 'Midnight Black',
    colorSwatch: '#18181c',
    isDark: true,
  },
  {
    id: 'babyPink',
    name: 'Baby Pink',
    colorSwatch: '#f472b6',
    isDark: false,
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    colorSwatch: '#a855f7',
    isDark: true,
  },
  {
    id: 'cream',
    name: 'Warm Cream',
    colorSwatch: '#f5f0e8',
    isDark: false,
  },
  {
    id: 'cyan',
    name: 'Cyber Cyan',
    colorSwatch: '#06b6d4',
    isDark: true,
  },
  {
    id: 'matcha',
    name: 'Matcha Sage',
    colorSwatch: '#10b981',
    isDark: true,
  },
  {
    id: 'sunset',
    name: 'Sunset Crimson',
    colorSwatch: '#f43f5e',
    isDark: true,
  },
];

export const FONTS: { id: FontId; name: string; cssFamily: string }[] = [
  {
    id: 'outfit',
    name: 'Outfit (Aesthetic)',
    cssFamily: "'Outfit', sans-serif",
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta',
    cssFamily: "'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'dmsans',
    name: 'DM Sans',
    cssFamily: "'DM Sans', sans-serif",
  },
  {
    id: 'bebas',
    name: 'Bebas Neue',
    cssFamily: "'Bebas Neue', sans-serif",
  },
  {
    id: 'oswald',
    name: 'Oswald Bold',
    cssFamily: "'Oswald', sans-serif",
  },
];
