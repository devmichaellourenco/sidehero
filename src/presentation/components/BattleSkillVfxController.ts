import { CombatSkillVfxDto } from '../../application/dto/CombatSkillVfxDto';
import { getAssetUrl } from '../assets/AssetCatalog';
import { getSkillVfxDefinition, getSkillVfxSvgPath } from '../assets/SkillVfxCatalog';

const DEFAULT_DURATION_MS = 520;

export class BattleSkillVfxController {
  constructor(
    private readonly layer: HTMLElement,
    private readonly battleStrip: HTMLElement,
  ) {}

  show(events: CombatSkillVfxDto[]): void {
    if (!events.length) return;

    for (const event of events) {
      const definition = getSkillVfxDefinition(event.skillId);
      if (!definition) continue;

      void this.spawn(event, definition);
    }
  }

  private async spawn(
    event: CombatSkillVfxDto,
    definition: NonNullable<ReturnType<typeof getSkillVfxDefinition>>,
  ): Promise<void> {
    const attackerAnchor = this.findAnchor(event.attackerSide, event.attackerId);
    const targetAnchor = this.findAnchor(event.targetSide, event.targetId);
    if (!attackerAnchor || !targetAnchor) return;

    const stripRect = this.battleStrip.getBoundingClientRect();
    const fromRect = attackerAnchor.getBoundingClientRect();
    const toRect = targetAnchor.getBoundingClientRect();

    const startX = fromRect.left - stripRect.left + fromRect.width / 2 - definition.width / 2;
    const startY = fromRect.top - stripRect.top + fromRect.height * 0.32 - definition.height / 2;
    const endX = toRect.left - stripRect.left + toRect.width / 2 - definition.width / 2;
    const endY = toRect.top - stripRect.top + toRect.height * 0.32 - definition.height / 2;

    const host = document.createElement('div');
    host.className = 'battle-skill-vfx';
    host.setAttribute('aria-hidden', 'true');
    host.style.width = `${definition.width}px`;
    host.style.height = `${definition.height}px`;
    host.style.setProperty('--vfx-from-x', `${startX}px`);
    host.style.setProperty('--vfx-from-y', `${startY}px`);
    host.style.setProperty('--vfx-to-x', `${endX}px`);
    host.style.setProperty('--vfx-to-y', `${endY}px`);
    host.style.setProperty('--vfx-duration', `${definition.durationMs}ms`);

    if (event.attackerSide === 'enemy') {
      host.classList.add('battle-skill-vfx--rtl');
    }

    if (definition.motion === 'self') {
      host.classList.add('battle-skill-vfx--self');
      host.style.setProperty('--vfx-to-x', `${startX}px`);
      host.style.setProperty('--vfx-to-y', `${startY}px`);
    }

    const svgUrl = getAssetUrl(getSkillVfxSvgPath(event.skillId));
    if (!svgUrl) return;

    const svgHost = document.createElement('object');
    svgHost.className = 'battle-skill-vfx__svg';
    svgHost.type = 'image/svg+xml';
    svgHost.data = svgUrl;
    svgHost.setAttribute('aria-hidden', 'true');
    host.appendChild(svgHost);

    this.layer.appendChild(host);

    const duration = definition.durationMs || DEFAULT_DURATION_MS;
    window.setTimeout(() => host.remove(), duration + 80);
  }

  private findAnchor(side: 'hero' | 'enemy', actorId: string): HTMLElement | null {
    if (side === 'hero') {
      return this.battleStrip.querySelector(
        `[data-hero-id="${actorId}"] [data-float-anchor="hero"]`,
      );
    }

    return this.battleStrip.querySelector(
      `[data-enemy-id="${actorId}"] [data-float-anchor="enemy"]`,
    );
  }
}
