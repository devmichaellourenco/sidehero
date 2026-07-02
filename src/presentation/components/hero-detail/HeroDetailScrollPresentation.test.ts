import { describe, expect, it, vi } from 'vitest';
import {
  captureHeroDetailScroll,
  restoreHeroDetailScroll,
  scrollHeroDetailSkillCardIntoView,
} from './HeroDetailScrollPresentation';

describe('HeroDetailScrollPresentation', () => {
  it('captura e restaura scroll da lista de skills', () => {
    const skillsScroll = { scrollTop: 180, className: 'hero-skills-tab-scroll' };
    const container = {
      querySelector: (selector: string) =>
        selector === '.hero-skills-tab-scroll' ? skillsScroll : null,
    } as unknown as HTMLElement;

    const state = captureHeroDetailScroll(container);
    skillsScroll.scrollTop = 0;

    restoreHeroDetailScroll(container, state);
    expect(skillsScroll.scrollTop).toBe(180);
  });

  it('ancora o card da skill após re-render', () => {
    const scrollIntoView = vi.fn();
    const card = { className: 'skill-card', scrollIntoView };
    const button = {
      getAttribute: (name: string) => (name === 'data-skill-allocate' ? 'fireball' : null),
      closest: () => card,
    };
    const container = {
      querySelector: () => button,
    } as unknown as HTMLElement;

    expect(scrollHeroDetailSkillCardIntoView(container, 'fireball')).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
  });
});
