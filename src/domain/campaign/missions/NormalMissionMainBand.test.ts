import { describe, expect, it } from 'vitest';
import {
  isNormalPhaseInBandForMain,
  chapterMainPhaseForPhaseNumber,
  listMissionChapterOptions,
  normalPhaseNumberBandForCurrentMain,
} from './NormalMissionMainBand';
import { normalMissionId } from './MissionId';
import { rollNormalMissionOffer } from './NormalMissionOffer';
import { parsePhaseId } from '../CampaignIds';
import { getMissionById } from './MissionCatalog';

describe('NormalMissionMainBand', () => {
  it('na main 1-1 o capítulo é 1–5', () => {
    expect(normalPhaseNumberBandForCurrentMain(1)).toEqual({ min: 1, max: 5 });
  });

  it('na main 1-5 o capítulo é 5–10', () => {
    expect(normalPhaseNumberBandForCurrentMain(5)).toEqual({ min: 5, max: 10 });
  });

  it('na main 1-10 o capítulo é 10–15', () => {
    expect(normalPhaseNumberBandForCurrentMain(10)).toEqual({ min: 10, max: 15 });
  });

  it('no marco final o capítulo é só 50', () => {
    expect(normalPhaseNumberBandForCurrentMain(50)).toEqual({ min: 50, max: 50 });
  });

  it('chapterMainPhaseForPhaseNumber aponta o marco dono', () => {
    expect(chapterMainPhaseForPhaseNumber(1)).toBe(1);
    expect(chapterMainPhaseForPhaseNumber(4)).toBe(1);
    expect(chapterMainPhaseForPhaseNumber(5)).toBe(5);
    expect(chapterMainPhaseForPhaseNumber(9)).toBe(5);
    expect(chapterMainPhaseForPhaseNumber(12)).toBe(10);
  });

  it('listMissionChapterOptions cobre todos os marcos', () => {
    const options = listMissionChapterOptions();
    expect(options[0]).toMatchObject({
      mainPhase: 1,
      min: 1,
      max: 5,
    });
    expect(options[0]?.label).toContain('1–5');
    expect(options.some((entry) => entry.mainPhase === 50)).toBe(true);
  });

  it('isNormalPhaseInBandForMain rejeita fases de outro capítulo', () => {
    expect(isNormalPhaseInBandForMain(1, 1)).toBe(true);
    expect(isNormalPhaseInBandForMain(5, 1)).toBe(true);
    expect(isNormalPhaseInBandForMain(6, 1)).toBe(false);
    expect(isNormalPhaseInBandForMain(20, 1)).toBe(false);
  });
});

describe('rollNormalMissionOffer com marco da main', () => {
  it('na main 1-1 só sorteia templates 1-1…1-5', () => {
    const offer = rollNormalMissionOffer({
      mapId: 'stendra',
      saveSeed: 42,
      offerEpoch: 0,
      currentMainPhaseNumber: 1,
    });

    expect(offer.length).toBeGreaterThan(0);
    for (const id of offer) {
      const mission = getMissionById(id);
      expect(mission?.kind).toBe('normal');
      const phaseNumber = parsePhaseId(mission!.phaseTemplateId).phaseNumber;
      expect(phaseNumber).toBeGreaterThanOrEqual(1);
      expect(phaseNumber).toBeLessThanOrEqual(5);
      expect(id).not.toBe(normalMissionId('1-20'));
    }
  });

  it('próximo sorteio pode repetir template normal do mesmo capítulo', () => {
    const first = rollNormalMissionOffer({
      mapId: 'stendra',
      saveSeed: 7,
      offerEpoch: 0,
      currentMainPhaseNumber: 1,
    });
    const second = rollNormalMissionOffer({
      mapId: 'stendra',
      saveSeed: 7,
      offerEpoch: 1,
      currentMainPhaseNumber: 1,
    });
    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBeGreaterThan(0);
    // Pool pequeno (5); em epochs distintos a interseção é esperada com alta chance.
    // Garantimos pelo menos que ambos só usam o capítulo 1–5.
    for (const id of [...first, ...second]) {
      const phaseNumber = parsePhaseId(getMissionById(id)!.phaseTemplateId).phaseNumber;
      expect(phaseNumber).toBeGreaterThanOrEqual(1);
      expect(phaseNumber).toBeLessThanOrEqual(5);
    }
  });
});
