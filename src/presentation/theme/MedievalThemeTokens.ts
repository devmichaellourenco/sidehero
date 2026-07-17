/**
 * Tokens canônicos do tema medieval (painel Side Hero).
 * Chrome = pergaminho claro + tinta (tutorial). Batalha/waves ficam fora desse chrome.
 * Espelhar em `panel.css` `:root`.
 */
export const MEDIEVAL_THEME = {
  sealGold: '#c9a227',
  sealGoldDark: '#8a6510',
  parchment0: '#fff9ed',
  parchment1: '#f3e4bc',
  parchment2: '#e8d4a0',
  ink: '#1f1710',
  inkMuted: '#3d3428',
  forest: '#2f6b38',
  forestHi: '#3f8a49',
  /** Fundo do painel (claro) */
  bg: '#f3e4bc',
  /** Superfície elevada (claro) */
  surface: '#fff9ed',
  accent: '#8b3a2f',
  /** Texto no chrome claro */
  text: '#1f1710',
  muted: '#3d3428',
  /** Fallback cênico — só battle-stage / strip */
  strip: '#2a2118',
  floor: '#3d2e1f',
} as const;

export type MedievalThemeToken = keyof typeof MEDIEVAL_THEME;
