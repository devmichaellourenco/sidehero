import { describe, expect, it } from 'vitest';
import { renderActSceneCard, renderActSceneOverlay } from './ActScenePresentation';

const scene = {
  id: 'stendra-act-1',
  mapId: 'stendra',
  actNumber: 1,
  title: 'Ecos nas Planícies',
  recap: 'A party chega a Stendra.',
  preview: 'Goblins atacam nas encostas.',
  imageAssetPath: 'campaign/stendra/campaign_stendra_banner.png',
  unlocked: true,
  viewed: false,
};

describe('ActScenePresentation', () => {
  it('renderiza card na trilha com botão de leitura', () => {
    const html = renderActSceneCard(scene);

    expect(html).toContain('campaign-act-scene');
    expect(html).toContain('Ecos nas Planícies');
    expect(html).toContain('data-act-scene-read="stendra-act-1"');
    expect(html).toContain('Nova');
  });

  it('renderiza overlay com recap e preview', () => {
    const html = renderActSceneOverlay(scene);

    expect(html).toContain('O que passou');
    expect(html).toContain('Pela frente');
    expect(html).toContain('A party chega a Stendra.');
    expect(html).toContain('data-act-scene-dismiss');
  });

  it('oculta copy em ato bloqueado', () => {
    const html = renderActSceneCard({ ...scene, unlocked: false });

    expect(html).toContain('campaign-act-scene--locked');
    expect(html).not.toContain('data-act-scene-read');
  });
});
