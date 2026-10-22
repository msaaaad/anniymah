export const THEME_COLOR_KEYS = [
  'bg',
  'surface',
  'sage',
  'sageDark',
  'sageTint',
  'rose',
  'roseDark',
  'roseTint',
  'text',
  'muted',
  'border',
  'mediaBg',
] as const;

export type ThemeColorKey = (typeof THEME_COLOR_KEYS)[number];
export type ThemeColors = Record<ThemeColorKey, string>;

export const DEFAULT_THEME_COLORS: ThemeColors = {
  bg: '#FBF6EF',
  surface: '#FFFFFF',
  sage: '#C05112',
  sageDark: '#9C420E',
  sageTint: '#F3E2D3',
  rose: '#EBD7C7',
  roseDark: '#D8BFA6',
  roseTint: '#FBF6EF',
  text: '#2B211A',
  muted: '#8C7565',
  border: '#EFE0CF',
  mediaBg: '#F3E2D3',
};

export const THEME_COLOR_DESCRIPTIONS: Record<ThemeColorKey, string> = {
  bg: 'Page background',
  surface: 'Cards, header, inputs',
  sage: 'Primary buttons, links, active states',
  sageDark: 'Hover states, price text',
  sageTint: 'Soft backgrounds such as trust badges and notes',
  rose: 'Accent badges',
  roseDark: 'Accent hover state',
  roseTint: 'Soft accent backgrounds',
  text: 'Body text and headings',
  muted: 'Secondary text, labels, captions',
  border: 'Card borders, dividers, input borders',
  mediaBg: 'Image and icon placeholder backgrounds',
};
