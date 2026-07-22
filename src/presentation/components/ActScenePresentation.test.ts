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
    const html = renderActSceneOverlay({
      ...scene,
      id: 'stendra-act-2',
      actNumber: 2,
    });

    expect(html).toContain('O que passou');
    expect(html).toContain('Pela frente');
    expect(html).toContain('A party chega a Stendra.');
    expect(html).toContain('data-act-scene-dismiss');
  });

  it('renderiza cena 1 de Stendra em overlay full-bleed', () => {
    const html = renderActSceneOverlay({
      ...scene,
      imageAssetPath: 'campaign/stendra/scene_1.png',
    });

    expect(html).toContain('act-scene-overlay-card--full-bleed');
    expect(html).toContain('scene_1.png');
    expect(html).toContain('data-act-scene-dismiss');
    expect(html).not.toContain('O que passou');
  });

  it('renderiza cena 1 de Gruftall em overlay full-bleed', () => {
    const html = renderActSceneOverlay({
      ...scene,
      id: 'gruftall-act-1',
      mapId: 'gruftall',
      title: 'Ruínas de Gruftall',
      imageAssetPath: 'campaign/grutfall/scene_1.png',
    });

    expect(html).toContain('act-scene-overlay-card--full-bleed');
    expect(html).toContain('campaign/grutfall/scene_1.png');
    expect(html).toContain('data-act-scene-dismiss');
    expect(html).not.toContain('O que passou');
  });

  it('renderiza cena 1 de Valdris em overlay full-bleed', () => {
    const html = renderActSceneOverlay({
      ...scene,
      id: 'valdris-act-1',
      mapId: 'valdris',
      title: 'Sombras de Valdris',
      imageAssetPath: 'campaign/valdris/scene_1.png',
    });

    expect(html).toContain('act-scene-overlay-card--full-bleed');
    expect(html).toContain('campaign/valdris/scene_1.png');
    expect(html).toContain('data-act-scene-dismiss');
    expect(html).not.toContain('O que passou');
  });

  it('renderiza cena 1 de Morthaven em overlay full-bleed', () => {
    const html = renderActSceneOverlay({
      ...scene,
      id: 'morthaven-act-1',
      mapId: 'morthaven',
      title: 'Castelo de Morthaven',
      imageAssetPath: 'campaign/morthaven/scene_1.png',
    });

    expect(html).toContain('act-scene-overlay-card--full-bleed');
    expect(html).toContain('campaign/morthaven/scene_1.png');
    expect(html).toContain('data-act-scene-dismiss');
    expect(html).not.toContain('O que passou');
  });

  it('oculta copy em ato bloqueado', () => {
    const html = renderActSceneCard({ ...scene, unlocked: false });

    expect(html).toContain('campaign-act-scene--locked');
    expect(html).not.toContain('data-act-scene-read');
  });
});
