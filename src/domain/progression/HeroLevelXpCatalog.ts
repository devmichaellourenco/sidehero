/**
 * XP necessária para avançar do nível N para N+1 (níveis 1–100).
 */
export interface HeroLevelXpEntry {
  readonly level: number;
  readonly expForLevelUp: number;
}

export const HERO_MAX_LEVEL = 100;

export const HERO_LEVEL_XP_TABLE: readonly HeroLevelXpEntry[] = [
  { level: 1, expForLevelUp: 30 },
  { level: 2, expForLevelUp: 150 },
  { level: 3, expForLevelUp: 500 },
  { level: 4, expForLevelUp: 1_000 },
  { level: 5, expForLevelUp: 2_600 },
  { level: 6, expForLevelUp: 6_500 },
  { level: 7, expForLevelUp: 13_000 },
  { level: 8, expForLevelUp: 23_400 },
  { level: 9, expForLevelUp: 37_440 },
  { level: 10, expForLevelUp: 74_880 },
  { level: 11, expForLevelUp: 134_784 },
  { level: 12, expForLevelUp: 229_133 },
  { level: 13, expForLevelUp: 366_613 },
  { level: 14, expForLevelUp: 513_258 },
  { level: 15, expForLevelUp: 718_561 },
  { level: 16, expForLevelUp: 970_057 },
  { level: 17, expForLevelUp: 1_309_577 },
  { level: 18, expForLevelUp: 1_702_450 },
  { level: 19, expForLevelUp: 2_042_940 },
  { level: 20, expForLevelUp: 3_064_410 },
  { level: 21, expForLevelUp: 3_615_531 },
  { level: 22, expForLevelUp: 4_157_861 },
  { level: 23, expForLevelUp: 4_739_962 },
  { level: 24, expForLevelUp: 5_356_157 },
  { level: 25, expForLevelUp: 6_266_704 },
  { level: 26, expForLevelUp: 7_708_046 },
  { level: 27, expForLevelUp: 9_866_299 },
  { level: 28, expForLevelUp: 12_135_548 },
  { level: 29, expForLevelUp: 14_198_591 },
  { level: 30, expForLevelUp: 15_618_450 },
  { level: 31, expForLevelUp: 17_180_295 },
  { level: 32, expForLevelUp: 18_709_341 },
  { level: 33, expForLevelUp: 20_170_728 },
  { level: 34, expForLevelUp: 21_528_801 },
  { level: 35, expForLevelUp: 22_748_528 },
  { level: 36, expForLevelUp: 23_796_986 },
  { level: 37, expForLevelUp: 24_644_829 },
  { level: 38, expForLevelUp: 25_267_650 },
  { level: 39, expForLevelUp: 25_647_149 },
  { level: 40, expForLevelUp: 25_772_024 },
  { level: 41, expForLevelUp: 25_638_532 },
  { level: 42, expForLevelUp: 25_250_674 },
  { level: 43, expForLevelUp: 24_619_997 },
  { level: 44, expForLevelUp: 28_490_088 },
  { level: 45, expForLevelUp: 32_968_530 },
  { level: 46, expForLevelUp: 38_150_952 },
  { level: 47, expForLevelUp: 44_148_014 },
  { level: 48, expForLevelUp: 51_653_176 },
  { level: 49, expForLevelUp: 63_533_406 },
  { level: 50, expForLevelUp: 81_322_760 },
  { level: 51, expForLevelUp: 100_026_995 },
  { level: 52, expForLevelUp: 117_031_584 },
  { level: 53, expForLevelUp: 125_223_795 },
  { level: 54, expForLevelUp: 133_989_461 },
  { level: 55, expForLevelUp: 143_368_723 },
  { level: 56, expForLevelUp: 153_404_534 },
  { level: 57, expForLevelUp: 164_142_851 },
  { level: 58, expForLevelUp: 175_632_851 },
  { level: 59, expForLevelUp: 187_927_151 },
  { level: 60, expForLevelUp: 201_082_052 },
  { level: 61, expForLevelUp: 215_157_796 },
  { level: 62, expForLevelUp: 230_218_842 },
  { level: 63, expForLevelUp: 241_729_784 },
  { level: 64, expForLevelUp: 253_816_273 },
  { level: 65, expForLevelUp: 266_507_087 },
  { level: 66, expForLevelUp: 279_832_441 },
  { level: 67, expForLevelUp: 293_824_063 },
  { level: 68, expForLevelUp: 308_515_266 },
  { level: 69, expForLevelUp: 323_941_029 },
  { level: 70, expForLevelUp: 340_138_080 },
  { level: 71, expForLevelUp: 357_144_984 },
  { level: 72, expForLevelUp: 375_002_233 },
  { level: 73, expForLevelUp: 393_752_345 },
  { level: 74, expForLevelUp: 413_439_962 },
  { level: 75, expForLevelUp: 434_111_960 },
  { level: 76, expForLevelUp: 455_817_558 },
  { level: 77, expForLevelUp: 478_608_436 },
  { level: 78, expForLevelUp: 559_971_870 },
  { level: 79, expForLevelUp: 688_765_400 },
  { level: 80, expForLevelUp: 881_619_712 },
  { level: 81, expForLevelUp: 1_084_392_246 },
  { level: 82, expForLevelUp: 1_268_738_928 },
  { level: 83, expForLevelUp: 1_306_801_096 },
  { level: 84, expForLevelUp: 1_346_005_129 },
  { level: 85, expForLevelUp: 1_386_385_283 },
  { level: 86, expForLevelUp: 1_427_976_841 },
  { level: 87, expForLevelUp: 1_470_816_146 },
  { level: 88, expForLevelUp: 1_514_940_630 },
  { level: 89, expForLevelUp: 1_560_388_849 },
  { level: 90, expForLevelUp: 1_607_200_514 },
  { level: 91, expForLevelUp: 1_655_416_529 },
  { level: 92, expForLevelUp: 1_705_079_025 },
  { level: 93, expForLevelUp: 1_739_180_606 },
  { level: 94, expForLevelUp: 1_773_964_218 },
  { level: 95, expForLevelUp: 1_809_443_502 },
  { level: 96, expForLevelUp: 1_845_632_372 },
  { level: 97, expForLevelUp: 1_882_545_019 },
  { level: 98, expForLevelUp: 1_920_195_919 },
  { level: 99, expForLevelUp: 1_958_599_837 },
  { level: 100, expForLevelUp: 1_997_771_834 },
] as const;

/** XP para sair do nível informado. Retorna 0 no nível máximo. */
export function expRequiredToAdvanceFromLevel(level: number): number {
  if (level >= HERO_MAX_LEVEL) {
    return 0;
  }

  const safeLevel = Math.max(1, Math.floor(level));
  const entry = HERO_LEVEL_XP_TABLE.find((row) => row.level === safeLevel);
  return entry?.expForLevelUp ?? HERO_LEVEL_XP_TABLE[0].expForLevelUp;
}

export function clampHeroLevel(level: number): number {
  return Math.min(HERO_MAX_LEVEL, Math.max(1, Math.floor(level)));
}
