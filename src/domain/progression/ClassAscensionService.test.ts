import { describe, expect, it } from 'vitest';
import { Hero } from '../entities/Hero';
import { Experience } from '../value-objects/Experience';
import { ClassAscensionService } from './ClassAscensionService';

describe('ClassAscensionService', () => {
  const service = new ClassAscensionService();

  it('lista duas opções por classe base', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Galneon');
    const options = service.listOptions(knight);

    expect(options).toHaveLength(2);
    expect(options.every((opt) => !opt.canAscend)).toBe(true);
  });

  it('permite ascender quando requisitos são atendidos', () => {
    let knight = Hero.createStarter('k1', 'knight', 'Galneon');
    knight = Hero.restore({
      ...knight.toProps(),
      experience: Experience.restore(0, 100, 10),
      allocatedAttributes: { str: 2, dex: 0, int: 0 },
    });

    expect(service.canAscend(knight, 'knight_guardian')).toBe(true);

    const ascended = service.ascend(knight, 'knight_guardian');
    expect(ascended.toProps().ascensionId).toBe('knight_guardian');
    expect(ascended.toProps().unspentAscensionPoints).toBe(2);
  });

  it('impede segunda ascensão', () => {
    let knight = Hero.createStarter('k1', 'knight', 'Galneon');
    knight = Hero.restore({
      ...knight.toProps(),
      ascensionId: 'knight_guardian',
      unspentAscensionPoints: 1,
    });

    expect(service.canAscend(knight, 'knight_reaver')).toBe(false);
    expect(() => service.ascend(knight, 'knight_reaver')).toThrow();
  });
});
