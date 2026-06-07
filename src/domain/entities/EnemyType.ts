export type EnemyType = 'slime' | 'goblin' | 'orc' | 'wraith' | 'dragon';

export const ENEMY_DEFINITIONS: ReadonlyArray<{ type: EnemyType; name: string }> = [
  { type: 'slime', name: 'Slime' },
  { type: 'goblin', name: 'Goblin' },
  { type: 'orc', name: 'Orc' },
  { type: 'wraith', name: 'Wraith' },
  { type: 'dragon', name: 'Dragon' },
];

export function enemyTypeForStage(stage: number): EnemyType {
  return ENEMY_DEFINITIONS[(stage - 1) % ENEMY_DEFINITIONS.length].type;
}

export function enemyNameForStage(stage: number): string {
  const definition = ENEMY_DEFINITIONS[(stage - 1) % ENEMY_DEFINITIONS.length];
  return `${definition.name} Lv.${stage}`;
}

export function inferEnemyType(name: string, stage: number): EnemyType {
  const match = ENEMY_DEFINITIONS.find((definition) =>
    name.toLowerCase().startsWith(definition.name.toLowerCase()),
  );

  return match?.type ?? enemyTypeForStage(stage);
}
