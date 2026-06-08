import { Enemy } from '../../entities/Enemy';

export function spawnEncounterForStage(stage: number): Enemy[] {
  const primary = Enemy.forStage(stage);

  if (stage >= 12 && stage % 6 === 0) {
    const secondary = Enemy.restore({
      ...primary.toProps(),
      id: `${primary.id}-ally`,
      name: `${primary.name} II`,
    });
    return [primary, secondary];
  }

  return [primary];
}
