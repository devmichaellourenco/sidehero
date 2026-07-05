import { describe, expect, it } from 'vitest';
import { Hero } from '../../domain/entities/Hero';
import { mapHeroCombatStatSheet } from './HeroCombatStatSheetMapper';

describe('HeroCombatStatSheetMapper', () => {
  it('monta seções ofensiva, defesa e resistências', () => {
    const hero = Hero.createStarter('h1', 'knight', 'Galneon');
    const sheet = mapHeroCombatStatSheet(hero);

    expect(sheet.map((section) => section.id)).toEqual(['offense', 'defense', 'resistances']);

    const dps = sheet[0].lines.find((line) => line.id === 'dps');
    expect(dps?.value).toMatch(/\d+\.\d/);
    expect(dps?.tooltipLines.some((line) => line.includes('Ataque:'))).toBe(true);

    const attack = sheet[0].lines.find((line) => line.id === 'ataque');
    expect(attack?.tooltipLines[0]).toContain('Base da classe');

    const dodge = sheet[1].lines.find((line) => line.id === 'dodge');
    expect(dodge?.tooltipLines.some((line) => line.includes('DEX'))).toBe(true);
  });
});
