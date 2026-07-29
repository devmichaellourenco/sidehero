import { describe, expect, it } from 'vitest';
import { resolveActionTimeRatio } from './ActionTimerTypes';
import { ActionTimerService } from './ActionTimerService';
import { Hero } from '../../entities/Hero';

describe('ActionTimerTypes', () => {
  it('retorna barra cheia quando o timer está pronto', () => {
    expect(resolveActionTimeRatio({ remaining: 0, total: 1 })).toBe(1);
    expect(resolveActionTimeRatio({ remaining: -0.2, total: 0.8 })).toBe(1);
  });

  it('calcula progresso proporcional durante a recarga', () => {
    expect(resolveActionTimeRatio({ remaining: 0.5, total: 1 })).toBeCloseTo(0.5);
    expect(resolveActionTimeRatio({ remaining: 0.8, total: 1 })).toBeCloseTo(0.2);
  });
});

describe('ActionTimerService', () => {
  const service = new ActionTimerService();

  it('armazena total da recarga ao agendar ação', () => {
    const hero = Hero.createStarter('h1', 'knight', 'Gal');
    const timers = service.createInitial([hero], []);
    const key = 'hero:h1';

    const updated = service.scheduleAfterAction(
      timers,
      { side: 'hero', id: 'h1' },
      1,
      1,
      false,
    );

    expect(updated[key]).toMatchObject({ remaining: 1, total: 1 });
    expect(resolveActionTimeRatio(updated[key])).toBe(0);
  });

  it('não carrega dívida negativa — uma ação por TTA mesmo após tick grande', () => {
    const hero = Hero.createStarter('h1', 'sorcerer', 'Nix');
    const key = 'hero:h1';
    const overdue = { [key]: { remaining: -0.9, total: 1 } };

    const afterSkill = service.scheduleAfterAction(
      overdue,
      { side: 'hero', id: 'h1' },
      1,
      1,
      true,
    );

    expect(afterSkill[key]?.remaining).toBeGreaterThan(0);
    expect(service.listReadyActors(afterSkill, [hero], [])).toHaveLength(0);
  });

  it('migra timers legados numéricos via normalize no advance', () => {
    const hero = Hero.createStarter('h1', 'knight', 'Gal');
    const legacy = { 'hero:h1': 0.4 } as unknown as ReturnType<ActionTimerService['createInitial']>;

    const advanced = service.advanceAll(legacy, 0.1);
    expect(advanced['hero:h1']?.total).toBe(0.4);
    expect(advanced['hero:h1']?.remaining).toBeCloseTo(0.3);
    // Sem entrada de timer, inimigo aparece "pronto" (remaining 0) — escopo só do herói migrado.
    expect(service.listReadyActors(advanced, [hero], [])).toHaveLength(0);
  });
});
