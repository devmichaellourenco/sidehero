/**
 * Tokens canônicos do tema Side Hero.
 * Chrome = pergaminho claro + tinta. Battle/waves têm tokens de contexto próprios.
 * Espelhar em `panel.css` `:root`.
 *
 * Regra: variável = contexto de uso (não só o hex). Mesma cor em contextos
 * diferentes → tokens distintos, para trocar temas sem acoplar significados.
 */
export const MEDIEVAL_THEME = {
  /* —— Base chrome —— */
  sealGold: '#c9a227',
  sealGoldDark: '#8a6510',
  parchment0: '#fff9ed',
  parchment1: '#f3e4bc',
  parchment2: '#e8d4a0',
  ink: '#1f1710',
  inkMuted: '#3d3428',
  forest: '#2f6b38',
  forestHi: '#3f8a49',
  bg: '#f3e4bc',
  surface: '#fff9ed',
  accent: '#8b3a2f',
  text: '#1f1710',
  muted: '#3d3428',
  strip: '#2a2118',
  floor: '#3d2e1f',

  /* —— Semântica chrome —— */
  danger: '#8a2828',
  info: '#1a5a8a',
  crit: '#8a6510',
  elementFire: '#b85a10',
  elementCold: '#156a8a',
  elementLightning: '#8a7010',
  elementChaos: '#6a3a8a',

  /* —— CTA / rótulos sobre cor —— */
  forestCtaLabel: '#fff9ed',
  onAccentLabel: '#ffffff',
  onDarkGoldLabel: '#ffe6a8',
  onDarkMutedLabel: '#b8c8e8',
  onDarkIceLabel: '#d8e4ff',
  onDarkWarmLabel: '#ffe08a',
  onDarkBrightGoldLabel: '#ffe9a8',

  /* —— Badges comparação inventário —— */
  badgeUpgradeInk: '#0f1f12',
  badgeUpgradeFill: '#7ee787',
  badgeDowngradeFill: '#ff6b6b',
  destroyActionLabel: '#ffcdd2',
  metaOwnedLabel: '#9dffb0',
  skillChipOk: '#8fd694',
  skillChipBad: '#e88a8a',
  emptySlotMuted: '#9aa3b2',
  rosterActiveLabel: '#9dffb0',

  /* —— Barras HP / XP (contexto HUD) —— */
  hpFillStart: '#2d7a3e',
  hpFillMid: '#4caf6a',
  hpFillEnd: '#8be8a8',
  xpFillMid: '#f5d76e',
  xpFillEnd: '#ffe9a8',

  /* —— Scrollbar —— */
  scrollbarThumb: '#c9892f',
  scrollbarThumbHi: '#f8d56b',
  scrollbarThumbLo: '#a56f22',
  scrollbarThumbHoverHi: '#ffe494',

  /* —— Toast / Wow —— */
  toastOnDarkLabel: '#ffe6a8',
  wowProgressGoldStart: '#d4a82a',
  wowProgressGoldEnd: '#f5c542',
  toastVictoryDeep: '#6b241c',
  metaCtaDeep: '#6b241c',

  /* —— Battle strip / floats —— */
  stripSkyStart: '#1a3a5c',
  floatDamage: '#ff3d5c',
  floatFire: '#ff7a1a',
  floatCold: '#42d8ff',
  floatLightning: '#fff44d',
  floatChaos: '#e070ff',
  floatCrit: '#ffcc00',
  floatCritBuff: '#ffcc00',
  floatCritHeal: '#fff44d',
  floatHeal: '#2dffb0',
  floatLevelUp: '#ffe566',
  waveMarkerGoldLabel: '#ffe9a8',
  waveMarkerEliteLabel: '#d4a0ff',
  waveMarkerBossLabel: '#ffe08a',
  enemyResistLabel: '#9fd4ff',
  elementPipFire: '#ff8c42',
  elementPipCold: '#5eb8ff',
  elementPipLightning: '#c9a0ff',
  elementPipChaos: '#c76bff',
  elementPipPhysical: '#c8c8c8',
  resistStrongLabel: '#b8d8ff',
  resistWeakLabel: '#ffc0c0',

  /* —— Campanha / mapas —— */
  mapStendra: '#6ecf8a',
  mapGruftall: '#a89b8c',
  mapGruftallTooltip: '#9a8b7a',
  mapValdris: '#6eb8ff',
  mapMorthaven: '#a98cff',
  mapBrokenSky: '#58d7e8',
  mapCrimsonAbyss: '#ff6b6b',
  mapEternalForge: '#ff9a4a',
  mapAncientGrove: '#7fd46a',
  mapTwilightTower: '#b07cff',
  mapVoidThrone: '#f5c542',
} as const;

export type MedievalThemeToken = keyof typeof MEDIEVAL_THEME;

/** Aliases semânticos → token canônico (documentação / futuros temas). */
export const MEDIEVAL_THEME_SEMANTICS = {
  damage: 'danger',
  worse: 'danger',
  heal: 'forest',
  better: 'forest',
  critical: 'crit',
  mitigation: 'info',
  skillEmphasis: 'sealGoldDark',
  ctaLabel: 'forestCtaLabel',
  inventoryUpgrade: 'badgeUpgradeFill',
  inventoryDowngrade: 'badgeDowngradeFill',
} as const;
