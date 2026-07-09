import { CombatSkillVfxDto } from '../../application/dto/CombatSkillVfxDto';
import { getAssetUrl } from '../assets/AssetCatalog';
import {
  getSkillVfxDefinition,
  getSkillVfxImpactSvgPath,
  getSkillVfxSvgPath,
  SkillVfxDefinition,
} from '../assets/SkillVfxCatalog';

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

  private async spawn(event: CombatSkillVfxDto, definition: SkillVfxDefinition): Promise<void> {
    const targetAnchor = this.findAnchor(event.targetSide, event.targetId);
    if (!targetAnchor) return;

    const stripRect = this.battleStrip.getBoundingClientRect();
    const toRect = targetAnchor.getBoundingClientRect();

    if (definition.placement === 'target_column') {
      const frame = this.resolveColumnFrame(definition, stripRect, toRect);
      this.spawnColumn(event, definition, frame.x, frame.y, frame.width, frame.height);
      return;
    }

    const needsAttacker = definition.motion === 'projectile';
    const attackerAnchor = needsAttacker
      ? this.findAnchor(event.attackerSide, event.attackerId)
      : null;
    if (needsAttacker && !attackerAnchor) return;

    const fromRect = attackerAnchor?.getBoundingClientRect();

    const startX = fromRect
      ? fromRect.left - stripRect.left + fromRect.width / 2 - definition.width / 2
      : 0;
    const startY = fromRect
      ? fromRect.top - stripRect.top + fromRect.height * 0.32 - definition.height / 2
      : 0;
    const endX = toRect.left - stripRect.left + toRect.width / 2 - definition.width / 2;
    const endY = toRect.top - stripRect.top + toRect.height * 0.32 - definition.height / 2;
    const impactCenterX = toRect.left - stripRect.left + toRect.width / 2;
    const impactCenterY = toRect.top - stripRect.top + toRect.height * 0.32;

    const placementTarget = definition.placement === 'target';
    const anchorRect = placementTarget ? toRect : fromRect ?? toRect;
    const anchorX = anchorRect.left - stripRect.left + anchorRect.width / 2 - definition.width / 2;
    const anchorY =
      anchorRect.top - stripRect.top + anchorRect.height * 0.32 - definition.height / 2;

    if (definition.motion === 'self') {
      this.spawnSelfPulse(definition, anchorX, anchorY, event.skillId);
    } else if (definition.motion === 'melee') {
      this.spawnMelee(event, definition, anchorX, anchorY);
    } else if (definition.motion === 'aoe') {
      this.spawnAoe(event, definition, anchorX, anchorY);
    } else {
      this.spawnProjectile(event, definition, { startX, startY, endX, endY });
    }

    if (definition.impact && definition.motion !== 'self') {
      const impactDelay = definition.impact.delayMs ?? definition.durationMs;
      window.setTimeout(() => {
        this.spawnImpact(definition, impactCenterX, impactCenterY, event.skillId);
      }, impactDelay);
    }
  }

  private resolveColumnFrame(
    definition: SkillVfxDefinition,
    stripRect: DOMRect,
    targetRect: DOMRect,
  ): { x: number; y: number; width: number; height: number } {
    const height = stripRect.height;
    const aspectRatio = definition.columnAspectRatio ?? definition.width / definition.height;
    const width = height * aspectRatio;
    const x = targetRect.left - stripRect.left + targetRect.width / 2 - width / 2;

    return { x, y: 0, width, height };
  }

  private spawnColumn(
    event: CombatSkillVfxDto,
    definition: SkillVfxDefinition,
    anchorX: number,
    anchorY: number,
    width: number,
    height: number,
  ): void {
    const svgUrl = getAssetUrl(getSkillVfxSvgPath(event.skillId, definition.svgFile));
    if (!svgUrl) return;

    const host = document.createElement('div');
    host.className = 'battle-skill-vfx battle-skill-vfx--column';
    if (definition.glow === 'cold') {
      host.classList.add('battle-skill-vfx--cold');
    }
    host.setAttribute('aria-hidden', 'true');
    host.style.width = `${width}px`;
    host.style.height = `${height}px`;
    host.style.setProperty('--vfx-from-x', `${anchorX}px`);
    host.style.setProperty('--vfx-from-y', `${anchorY}px`);
    host.style.setProperty('--vfx-duration', `${definition.durationMs}ms`);
    if (definition.svgObjectPosition) {
      host.style.setProperty('--vfx-object-position', definition.svgObjectPosition);
    }
    host.appendChild(this.createSvgFrame(svgUrl, definition.rotationDeg));
    this.layer.appendChild(host);

    window.setTimeout(() => host.remove(), definition.durationMs + 80);
  }

  private spawnAoe(
    event: CombatSkillVfxDto,
    definition: SkillVfxDefinition,
    anchorX: number,
    anchorY: number,
  ): void {
    const svgUrl = getAssetUrl(getSkillVfxSvgPath(event.skillId, definition.svgFile));
    if (!svgUrl) return;

    const host = document.createElement('div');
    host.className = 'battle-skill-vfx battle-skill-vfx--aoe';
    if (definition.glow === 'cold') {
      host.classList.add('battle-skill-vfx--cold');
    }
    host.setAttribute('aria-hidden', 'true');
    host.style.width = `${definition.width}px`;
    host.style.height = `${definition.height}px`;
    host.style.setProperty('--vfx-from-x', `${anchorX}px`);
    host.style.setProperty('--vfx-from-y', `${anchorY}px`);
    host.style.setProperty('--vfx-duration', `${definition.durationMs}ms`);
    host.appendChild(this.createSvgFrame(svgUrl, definition.rotationDeg));
    this.layer.appendChild(host);

    window.setTimeout(() => host.remove(), definition.durationMs + 80);
  }

  private spawnMelee(
    event: CombatSkillVfxDto,
    definition: SkillVfxDefinition,
    anchorX: number,
    anchorY: number,
  ): void {
    const svgUrl = getAssetUrl(getSkillVfxSvgPath(event.skillId, definition.svgFile));
    if (!svgUrl) return;

    const host = document.createElement('div');
    host.className = 'battle-skill-vfx battle-skill-vfx--melee';
    if (definition.glow === 'slash') {
      host.classList.add('battle-skill-vfx--slash');
    }
    if (event.attackerSide === 'enemy') {
      host.classList.add('battle-skill-vfx--melee-rtl');
    }
    host.setAttribute('aria-hidden', 'true');
    host.style.width = `${definition.width}px`;
    host.style.height = `${definition.height}px`;
    host.style.setProperty('--vfx-from-x', `${anchorX}px`);
    host.style.setProperty('--vfx-from-y', `${anchorY}px`);
    host.style.setProperty('--vfx-duration', `${definition.durationMs}ms`);
    host.appendChild(this.createSvgFrame(svgUrl, definition.rotationDeg));
    this.layer.appendChild(host);

    window.setTimeout(() => host.remove(), definition.durationMs + 80);
  }

  private spawnProjectile(
    event: CombatSkillVfxDto,
    definition: SkillVfxDefinition,
    coords: { startX: number; startY: number; endX: number; endY: number },
  ): void {
    const svgUrl = getAssetUrl(getSkillVfxSvgPath(event.skillId, definition.svgFile));
    if (!svgUrl) return;

    const host = document.createElement('div');
    host.className = 'battle-skill-vfx battle-skill-vfx--projectile';
    if (definition.glow === 'lightning') {
      host.classList.add('battle-skill-vfx--lightning');
    } else if (definition.glow === 'fire') {
      host.classList.add('battle-skill-vfx--fire');
    }
    host.setAttribute('aria-hidden', 'true');
    host.style.width = `${definition.width}px`;
    host.style.height = `${definition.height}px`;
    host.style.setProperty('--vfx-from-x', `${coords.startX}px`);
    host.style.setProperty('--vfx-from-y', `${coords.startY}px`);
    host.style.setProperty('--vfx-to-x', `${coords.endX}px`);
    host.style.setProperty('--vfx-to-y', `${coords.endY}px`);
    host.style.setProperty('--vfx-duration', `${definition.durationMs}ms`);

    if (event.attackerSide === 'enemy') {
      host.classList.add('battle-skill-vfx--rtl');
    }

    host.appendChild(this.createSvgFrame(svgUrl, definition.rotationDeg));
    this.layer.appendChild(host);

    const duration = definition.durationMs || DEFAULT_DURATION_MS;
    window.setTimeout(() => host.remove(), duration + 80);
  }

  private spawnSelfPulse(
    definition: SkillVfxDefinition,
    startX: number,
    startY: number,
    skillId: string,
  ): void {
    const svgUrl = getAssetUrl(getSkillVfxSvgPath(skillId, definition.svgFile));
    if (!svgUrl) return;

    const host = document.createElement('div');
    host.className =
      definition.glow === 'heal'
        ? 'battle-skill-vfx battle-skill-vfx--heal'
        : 'battle-skill-vfx battle-skill-vfx--self';
    host.setAttribute('aria-hidden', 'true');
    host.style.width = `${definition.width}px`;
    host.style.height = `${definition.height}px`;
    host.style.setProperty('--vfx-from-x', `${startX}px`);
    host.style.setProperty('--vfx-from-y', `${startY}px`);
    host.style.setProperty('--vfx-to-x', `${startX}px`);
    host.style.setProperty('--vfx-to-y', `${startY}px`);
    host.style.setProperty('--vfx-duration', `${definition.durationMs}ms`);
    host.appendChild(this.createSvgFrame(svgUrl, definition.rotationDeg));
    this.layer.appendChild(host);

    window.setTimeout(() => host.remove(), definition.durationMs + 80);
  }

  private spawnImpact(
    definition: SkillVfxDefinition,
    centerX: number,
    centerY: number,
    skillId: string,
  ): void {
    const impact = definition.impact;
    if (!impact) return;

    const impactPath = getSkillVfxImpactSvgPath(skillId, impact);
    if (!impactPath) return;

    const svgUrl = getAssetUrl(impactPath);
    if (!svgUrl) return;

    const left = centerX - impact.width / 2;
    const top = centerY - impact.height / 2;

    const host = document.createElement('div');
    host.className = 'battle-skill-vfx battle-skill-vfx--impact';
    host.setAttribute('aria-hidden', 'true');
    host.style.width = `${impact.width}px`;
    host.style.height = `${impact.height}px`;
    host.style.setProperty('--vfx-from-x', `${left}px`);
    host.style.setProperty('--vfx-from-y', `${top}px`);
    host.style.setProperty('--vfx-duration', `${impact.durationMs}ms`);
    host.appendChild(this.createSvgObject(svgUrl));
    this.layer.appendChild(host);

    window.setTimeout(() => host.remove(), impact.durationMs + 80);
  }

  private createSvgFrame(svgUrl: string, rotationDeg?: number): HTMLElement {
    if (!rotationDeg) {
      return this.createSvgObject(svgUrl);
    }

    const frame = document.createElement('div');
    frame.className = 'battle-skill-vfx__rotator';
    frame.style.setProperty('--vfx-rotation', `${rotationDeg}deg`);
    frame.appendChild(this.createSvgObject(svgUrl));
    return frame;
  }

  private createSvgObject(svgUrl: string): HTMLObjectElement {
    const svgHost = document.createElement('object');
    svgHost.className = 'battle-skill-vfx__svg';
    svgHost.type = 'image/svg+xml';
    svgHost.data = svgUrl;
    svgHost.setAttribute('aria-hidden', 'true');
    return svgHost;
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
