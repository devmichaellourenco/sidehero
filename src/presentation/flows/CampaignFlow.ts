import { CampaignOverviewDto, ActSceneDto } from '../../application/dto/CampaignDto';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { IGameClient } from '../../application/ports/IGameClient';
import {
  CampaignViewMode,
  getStoredCampaignViewMode,
  isMapNewToPlayer,
  markMapSeen,
  setStoredCampaignViewMode,
} from '../campaign/CampaignViewStorage';
import {
  CampaignModalRenderer,
  isMapUnlocked,
  resolveInitialMapId,
} from '../components/CampaignModalRenderer';
import { renderCampaignViewToggle } from '../components/CampaignMapPresentation';
import {
  syncMissionPopoverPlacement,
} from '../components/CampaignMissionMapPresentation';
import { bindCampaignTooltips, hideCampaignTooltip } from '../components/CampaignTooltipBinder';
import { bindEnemyTooltips, hideEnemyTooltip } from '../components/EnemyTooltipBinder';
import { ModalController } from '../components/ModalController';

export class CampaignFlow {
  private campaign: CampaignOverviewDto | null = null;
  private activeMapId = 'stendra';
  private pendingMissionId: string | null = null;
  private viewMode: CampaignViewMode = 'region';
  private actSceneReader: ((scene: ActSceneDto) => void) | null = null;

  private onMissionStarted: ((state: GameStateDto) => void) | null = null;

  constructor(
    private readonly client: IGameClient,
    private readonly modal: ModalController,
    private readonly renderer = new CampaignModalRenderer(),
  ) {}

  setActSceneReader(handler: (scene: ActSceneDto) => void): void {
    this.actSceneReader = handler;
  }

  setMissionStartedHandler(handler: (state: GameStateDto) => void): void {
    this.onMissionStarted = handler;
  }

  async open(
    onState: (state: GameStateDto) => void,
    modalBody: HTMLElement,
  ): Promise<void> {
    const response = await this.client.send({ type: 'GET_CAMPAIGN_OVERVIEW' });
    if (!response.ok || !response.campaign) return;

    this.campaign = response.campaign;
    this.activeMapId = resolveInitialMapId(response.campaign);
    this.pendingMissionId = null;
    this.viewMode = this.resolveInitialViewMode(response.campaign);
    this.renderModal(modalBody);
    this.bindInteractions(modalBody, onState);
    this.scrollPendingMissionIntoView(modalBody);
  }

  private resolveInitialViewMode(campaign: CampaignOverviewDto): CampaignViewMode {
    const stored = getStoredCampaignViewMode();
    if (stored) return stored;

    const unlockedCount = campaign.maps.filter((map) => map.unlocked).length;
    return unlockedCount > 1 ? 'world' : 'region';
  }

  private shouldShowUnlockBanner(): boolean {
    if (!this.campaign || this.viewMode !== 'region') return false;
    const activeMap = this.campaign.maps.find((map) => map.id === this.activeMapId);
    if (!activeMap || !activeMap.unlocked) return false;
    return isMapNewToPlayer(activeMap.id, activeMap.unlocked);
  }

  private renderModal(modalBody: HTMLElement): void {
    if (!this.campaign) return;

    modalBody.innerHTML = this.renderer.render(
      this.campaign,
      this.activeMapId,
      null,
      this.viewMode,
      {
        showUnlockBanner: this.shouldShowUnlockBanner(),
        pendingMissionId: this.pendingMissionId,
      },
    );

    if (this.viewMode === 'region' && this.shouldShowUnlockBanner()) {
      markMapSeen(this.activeMapId);
    }

    this.mountHeaderToggle();
    bindCampaignTooltips(modalBody);
    bindEnemyTooltips(modalBody);
    syncMissionPopoverPlacement(modalBody);
  }

  private chromeRoot(modalBody: HTMLElement): HTMLElement {
    return (modalBody.closest('.modal-dialog') as HTMLElement | null) ?? modalBody;
  }

  private mountHeaderToggle(): void {
    if (!this.campaign) return;
    this.modal.setTitleHtml(renderCampaignViewToggle(this.campaign, this.viewMode));
    bindCampaignTooltips(this.modal.getTitleElement());
  }

  private bindInteractions(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    hideCampaignTooltip();
    hideEnemyTooltip();
    this.bindViewToggle(modalBody, onState);
    this.bindWorldMapNodes(modalBody, onState);
    this.bindMissionButtons(modalBody, onState);
    this.bindStartButton(modalBody, onState);
    this.bindMissionPopoverDismiss(modalBody, onState);
    this.bindActSceneButtons(modalBody);
  }

  private bindMissionPopoverDismiss(
    modalBody: HTMLElement,
    onState: (state: GameStateDto) => void,
  ): void {
    modalBody.addEventListener('pointerdown', (event) => {
      if (!this.pendingMissionId || this.viewMode !== 'region') return;

      const target = event.target as HTMLElement | null;
      if (!target?.closest) return;
      if (!target.closest('[data-campaign-map-panel]')) return;
      if (target.closest('[data-mission-id]')) return;
      if (target.closest('[data-campaign-mission-preview]')) return;
      if (target.closest('#enemy-tooltip-portal')) return;

      this.pendingMissionId = null;
      this.refreshRegionView(modalBody, onState);
    });
  }

  private bindActSceneButtons(modalBody: HTMLElement): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-act-scene-read]').forEach((button) => {
      button.addEventListener('click', () => {
        const sceneId = button.dataset.actSceneRead;
        if (!sceneId || !this.campaign) return;

        const map = this.campaign.maps.find((entry) => entry.id === this.activeMapId);
        const scene = map?.actScenes.find((entry) => entry.id === sceneId);
        if (!scene || !scene.unlocked) return;

        this.actSceneReader?.(scene);
      });
    });
  }

  private bindViewToggle(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    this.chromeRoot(modalBody)
      .querySelectorAll<HTMLButtonElement>('[data-campaign-view]')
      .forEach((button) => {
        button.addEventListener('click', () => {
          const mode = button.dataset.campaignView as CampaignViewMode | undefined;
          if (!mode || mode === this.viewMode) return;
          this.viewMode = mode;
          setStoredCampaignViewMode(mode);
          this.refreshViewMode(modalBody, onState);
        });
      });
  }

  private bindWorldMapNodes(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-campaign-world-map]').forEach((button) => {
      button.addEventListener('click', () => {
        const mapId = button.dataset.campaignWorldMap;
        if (!mapId || button.getAttribute('aria-disabled') === 'true' || !this.campaign) return;

        const map = this.campaign.maps.find((entry) => entry.id === mapId);
        if (!map || !isMapUnlocked(map)) return;

        this.activeMapId = mapId;
        this.pendingMissionId = null;
        this.viewMode = 'region';
        setStoredCampaignViewMode('region');
        this.refreshViewMode(modalBody, onState);
      });
    });
  }

  private bindMissionButtons(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-mission-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const missionId = button.dataset.missionId;
        if (!missionId || button.disabled) return;
        this.pendingMissionId = this.pendingMissionId === missionId ? null : missionId;
        this.refreshRegionView(modalBody, onState);
      });
    });
  }

  private bindStartButton(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-campaign-start-mission]').forEach((button) => {
      button.addEventListener('click', () => {
        const missionId = button.dataset.campaignStartMission;
        if (!missionId || button.disabled) return;
        void this.confirmMission(missionId, button, onState);
      });
    });
  }

  private scrollPendingMissionIntoView(modalBody: HTMLElement): void {
    requestAnimationFrame(() => {
      modalBody
        .querySelector(
          '.campaign-mission-pin--pending, .campaign-world-node--active',
        )
        ?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
    });
  }

  private syncCampaignTheme(modalBody: HTMLElement): void {
    modalBody.querySelector('.campaign-modal')?.setAttribute('data-campaign-theme', this.activeMapId);
    modalBody.querySelector('[data-campaign-map-panel]')?.setAttribute('data-campaign-theme', this.activeMapId);
  }

  private updateViewToggleUi(modalBody: HTMLElement): void {
    this.chromeRoot(modalBody)
      .querySelectorAll<HTMLButtonElement>('[data-campaign-view]')
      .forEach((button) => {
        const mode = button.dataset.campaignView as CampaignViewMode | undefined;
        const active = mode === this.viewMode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });

    modalBody.querySelector('.campaign-modal')?.setAttribute('data-campaign-view', this.viewMode);
  }

  private refreshViewMode(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    if (!this.campaign) return;

    hideCampaignTooltip();
    hideEnemyTooltip();
    this.updateViewToggleUi(modalBody);

    const panelHost = modalBody.querySelector('[data-campaign-map-panel]') as HTMLElement | null;
    modalBody.querySelector('[data-campaign-map-tabs]')?.remove();

    if (this.viewMode === 'world') {
      if (panelHost) {
        panelHost.classList.add('campaign-map-panel--world');
        panelHost.setAttribute('aria-label', 'Mapa-mundo');
        panelHost.setAttribute('data-campaign-theme', this.activeMapId);
        panelHost.innerHTML = this.renderer.renderWorldPanel(this.campaign, this.activeMapId);
        bindCampaignTooltips(panelHost);
      }
      this.bindWorldMapNodes(modalBody, onState);
      this.scrollPendingMissionIntoView(modalBody);
      return;
    }

    const activeMap = this.campaign.maps.find((map) => map.id === this.activeMapId);
    if (panelHost && activeMap) {
      panelHost.classList.remove('campaign-map-panel--world');
      panelHost.innerHTML = this.renderer.renderMapPanel(activeMap, null, {
        showUnlockBanner: this.shouldShowUnlockBanner(),
        pendingMissionId: this.pendingMissionId,
      });
      panelHost.setAttribute('aria-label', activeMap.name);
      panelHost.setAttribute('data-campaign-theme', this.activeMapId);
      if (this.shouldShowUnlockBanner()) {
        markMapSeen(this.activeMapId);
      }
      bindCampaignTooltips(panelHost);
      bindEnemyTooltips(panelHost);
      syncMissionPopoverPlacement(panelHost);
    }

    this.syncCampaignTheme(modalBody);
    this.bindMissionButtons(modalBody, onState);
    this.bindStartButton(modalBody, onState);
    this.scrollPendingMissionIntoView(modalBody);
  }

  private refreshRegionView(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    if (!this.campaign) return;

    const panelHost = modalBody.querySelector('[data-campaign-map-panel]');
    const activeMap = this.campaign.maps.find((map) => map.id === this.activeMapId);

    if (panelHost && activeMap) {
      panelHost.innerHTML = this.renderer.renderMapPanel(activeMap, null, {
        showUnlockBanner: isMapNewToPlayer(activeMap.id, activeMap.unlocked),
        pendingMissionId: this.pendingMissionId,
      });
      panelHost.setAttribute('aria-label', activeMap.name);
      if (isMapNewToPlayer(activeMap.id, activeMap.unlocked)) {
        markMapSeen(activeMap.id);
      }
      bindCampaignTooltips(panelHost);
      bindEnemyTooltips(panelHost);
      syncMissionPopoverPlacement(panelHost);
    }

    this.syncCampaignTheme(modalBody);
    this.bindMissionButtons(modalBody, onState);
    this.bindStartButton(modalBody, onState);
    this.scrollPendingMissionIntoView(modalBody);
  }

  private async confirmMission(
    missionId: string,
    button: HTMLButtonElement,
    onState: (state: GameStateDto) => void,
  ): Promise<void> {
    if (button.classList.contains('campaign-phase-preview-start--loading')) return;

    button.classList.add('campaign-phase-preview-start--loading');
    button.disabled = true;
    await new Promise((resolve) => window.setTimeout(resolve, 180));

    const response = await this.client.send({ type: 'START_MISSION', missionId });
    if (!response.ok) {
      button.classList.remove('campaign-phase-preview-start--loading');
      button.disabled = false;
      return;
    }

    onState(response.state);
    this.modal.close();
    this.onMissionStarted?.(response.state);
  }
}
