import { describe, expect, it, beforeEach } from 'vitest';
import {
  parsePartyQueryParam,
  partyToQueryParam,
  partyLabel,
  HERO_CLASS_OPTIONS,
} from './referenceParty';

describe('parsePartyQueryParam', () => {
  it('faz parse de sorcerer:10,knight:10,priest:10', () => {
    const result = parsePartyQueryParam('sorcerer:10,knight:10,priest:10');
    expect(result).toEqual([
      { heroClass: 'sorcerer', level: 10 },
      { heroClass: 'knight', level: 10 },
      { heroClass: 'priest', level: 10 },
    ]);
  });

  it('faz parse de membro único', () => {
    const result = parsePartyQueryParam('knight:5');
    expect(result).toEqual([{ heroClass: 'knight', level: 5 }]);
  });

  it('limita a 3 membros', () => {
    const result = parsePartyQueryParam('knight:1,sorcerer:2,priest:3,berserker:4');
    expect(result).toHaveLength(3);
  });

  it('retorna null para string vazia', () => {
    expect(parsePartyQueryParam('')).toBeNull();
  });

  it('retorna null para classe inválida', () => {
    expect(parsePartyQueryParam('wizard:10')).toBeNull();
  });

  it('retorna null para level inválido (zero)', () => {
    expect(parsePartyQueryParam('knight:0')).toBeNull();
  });

  it('retorna null para formato sem dois-pontos', () => {
    expect(parsePartyQueryParam('knight10')).toBeNull();
  });

  it('aceita espaços ao redor da vírgula', () => {
    const result = parsePartyQueryParam('knight:10 , sorcerer:5');
    expect(result).toEqual([
      { heroClass: 'knight', level: 10 },
      { heroClass: 'sorcerer', level: 5 },
    ]);
  });

  it('aceita todas as classes de herói', () => {
    for (const heroClass of HERO_CLASS_OPTIONS) {
      const result = parsePartyQueryParam(`${heroClass}:10`);
      expect(result).not.toBeNull();
      expect(result![0]).toEqual({ heroClass, level: 10 });
    }
  });
});

describe('partyToQueryParam', () => {
  it('serializa party padrão corretamente', () => {
    const party = [
      { heroClass: 'sorcerer', level: 10 },
      { heroClass: 'knight', level: 10 },
      { heroClass: 'priest', level: 10 },
    ];
    expect(partyToQueryParam(party)).toBe('sorcerer:10,knight:10,priest:10');
  });

  it('round-trip: parse(serialize(party)) === party', () => {
    const party = [
      { heroClass: 'archer', level: 7 },
      { heroClass: 'berserker', level: 15 },
    ];
    const serialized = partyToQueryParam(party);
    const parsed = parsePartyQueryParam(serialized);
    expect(parsed).toEqual(party);
  });

  it('gera string vazia para party sem membros', () => {
    expect(partyToQueryParam([])).toBe('');
  });
});

describe('partyLabel', () => {
  it('gera rótulo legível para party padrão', () => {
    const label = partyLabel([
      { heroClass: 'sorcerer', level: 10 },
      { heroClass: 'knight', level: 10 },
      { heroClass: 'priest', level: 10 },
    ]);
    expect(label).toBe('Sorcerer Lv.10 + Knight Lv.10 + Priest Lv.10');
  });

  it('retorna placeholder para party vazia', () => {
    expect(partyLabel([])).toBe('(sem membros)');
  });

  it('inclui nível correto', () => {
    const label = partyLabel([{ heroClass: 'berserker', level: 25 }]);
    expect(label).toContain('Lv.25');
  });
});
