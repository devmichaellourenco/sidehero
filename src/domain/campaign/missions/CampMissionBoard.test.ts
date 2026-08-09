import { describe, expect, it } from 'vitest';
import {
  buildCampMissionBoard,
  ensureNormalOfferForBoard,
  nextMainMissionForMap,
} from './CampMissionBoard';
import { mainMissionId, sideMissionId } from './MissionId';
import { rollNormalMissionOffer } from './NormalMissionOffer';

describe('CampMissionBoard', () => {
  it('próxima main é 1-1 no início e 1-5 após concluir 1-1', () => {
    expect(nextMainMissionForMap('stendra', [])?.id).toBe(mainMissionId('1-1'));
    expect(nextMainMissionForMap('stendra', [mainMissionId('1-1')])?.id).toBe(
      mainMissionId('1-5'),
    );
  });

  it('board inclui main + sides elegíveis + normais da oferta', () => {
    const offer = rollNormalMissionOffer({
      mapId: 'stendra',
      saveSeed: 1,
      offerEpoch: 0,
    });
    const board = buildCampMissionBoard({
      mapId: 'stendra',
      completedMainIds: [mainMissionId('1-1'), mainMissionId('1-5')],
      completedSideIds: [],
      completedMissionIds: [mainMissionId('1-1'), mainMissionId('1-5')],
      normalOfferIds: offer,
    });

    expect(board.main?.id).toBe(mainMissionId('1-10'));
    expect(board.sides.map((s) => s.id)).toEqual(
      expect.arrayContaining([
        sideMissionId('stendra_ash_trail'),
        sideMissionId('stendra_wayward_patrol'),
      ]),
    );
    expect(board.normals.length).toBe(offer.length);
    expect(board.normals.every((n) => n.kind === 'normal')).toBe(true);
  });

  it('ensureNormalOfferForBoard cria oferta se vazia', () => {
    const ensured = ensureNormalOfferForBoard({
      mapId: 'stendra',
      saveSeed: 3,
      offerEpoch: 0,
      currentOffer: [],
    });
    expect(ensured.offer.length).toBeGreaterThanOrEqual(2);
    const kept = ensureNormalOfferForBoard({
      mapId: 'stendra',
      saveSeed: 3,
      offerEpoch: 0,
      currentOffer: ensured.offer,
    });
    expect(kept.offer).toEqual(ensured.offer);
  });
});
