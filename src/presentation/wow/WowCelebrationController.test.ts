// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { RewardMoment } from '../delight/types/RewardMoment';
import { WowCelebrationController } from './WowCelebrationController';

function buildMoment(): RewardMoment {
  return {
    id: 'test-moment',
    kind: 'milestone_boss_defeated',
    tier: 'macro',
    priority: 90,
    title: 'Boss derrotado',
    tone: 'victory',
  };
}

describe('WowCelebrationController', () => {
  it('bloqueia avanço enquanto celebração central está ativa', () => {
    document.body.innerHTML = `
      <button id="inbox"></button>
      <div id="root" class="hidden"><div id="stage"></div></div>
      <div id="inbox-root" class="hidden"><div id="panel"></div></div>
    `;

    const controller = new WowCelebrationController(
      document.getElementById('root')!,
      document.getElementById('stage')!,
      document.getElementById('inbox-root')!,
      document.getElementById('panel')!,
      document.getElementById('inbox') as HTMLButtonElement,
    );

    expect(controller.isBlockingAdvance()).toBe(false);
    controller.enqueueMoment(buildMoment());
    expect(controller.isBlockingAdvance()).toBe(true);
    controller.destroy();
  });
});
