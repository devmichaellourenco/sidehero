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
import {
  resolveInitialPendingPhaseId,
  renderCampaignViewToggle,
} from '../components/CampaignMapPresentation';
import { bindCampaignTooltips, hideCampaignTooltip } from '../components/CampaignTooltipBinder';
import { ModalController } from '../components/ModalController';

export class CampaignFlow {
  private campaign: CampaignOverviewDto | null = null;
  private activeMapId = 'stendra';
  private pendingPhaseId: string | null = null;
  private viewMode: CampaignViewMode = 'region';
  private actSceneReader: ((scene: ActSceneDto) => void) | null = null;

  constructor(
    private readonly client: IGameClient,
    private readonly modal: ModalController,
    private readonly renderer = new CampaignModalRenderer(),
  ) {}

  setActSceneReader(handler: (scene: ActSceneDto) => void): void {
    this.actSceneReader = handler;
  }

  async open(
    onState: (state: GameStateDto) => void,
    modalBody: HTMLElement,
  ): Promise<void> {
    const response = await this.client.send({ type: 'GET_CAMPAIGN_OVERVIEW' });
    if (!response.ok || !response.campaign) return;

    this.campaign = response.campaign;
    this.activeMapId = resolveInitialMapId(response.campaign);
    this.pendingPhaseId = this.resolvePendingForActiveMap();
    this.viewMode = this.resolveInitialViewMode(response.campaign);
    this.renderModal(modalBody);
    this.bindInteractions(modalBody, onState);
    this.scrollPendingPhaseIntoView(modalBody);
  }

  private resolveInitialViewMode(campaign: CampaignOverviewDto): CampaignViewMode {
    const stored = getStoredCampaignViewMode();
    if (stored) return stored;

    const unlockedCount = campaign.maps.filter((map) => map.unlocked).length;
    return unlockedCount > 1 ? 'world' : 'region';
  }

  private resolvePendingForActiveMap(): string | null {
    if (!this.campaign) return null;
    const activeMap = this.campaign.maps.find((map) => map.id === this.activeMapId);
    if (!activeMap) return null;
    return resolveInitialPendingPhaseId(activeMap);
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
      this.pendingPhaseId,
      this.viewMode,
      { showUnlockBanner: this.shouldShowUnlockBanner() },
    );

    if (this.viewMode === 'region' && this.shouldShowUnlockBanner()) {
      markMapSeen(this.activeMapId);
    }

    this.mountHeaderToggle();
    bindCampaignTooltips(modalBody);
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
    this.bindViewToggle(modalBody, onState);
    this.bindWorldMapNodes(modalBody, onState);
    this.bindMapTabs(modalBody, onState);
    this.bindPhaseButtons(modalBody, onState);
    this.bindStartButton(modalBody, onState);
    this.bindActSceneButtons(modalBody);
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
        this.pendingPhaseId = resolveInitialPendingPhaseId(map);
        this.viewMode = 'region';
        setStoredCampaignViewMode('region');
        this.refreshViewMode(modalBody, onState);
      });
    });
  }

  private bindMapTabs(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-campaign-map-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        if (tab.getAttribute('aria-disabled') === 'true') return;

        const mapId = tab.dataset.campaignMapTab;
        if (!mapId || mapId === this.activeMapId || !this.campaign) return;

        const map = this.campaign.maps.find((entry) => entry.id === mapId);
        if (!map || !isMapUnlocked(map)) return;

        this.activeMapId = mapId;
        this.pendingPhaseId = resolveInitialPendingPhaseId(map);
        this.refreshRegionView(modalBody, onState);
      });
    });
  }

  private bindPhaseButtons(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-phase-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const phaseId = button.dataset.phaseId;
        if (!phaseId || button.disabled) return;
        void this.confirmPhase(phaseId, button, onState);
      });
    });
  }

  private bindStartButton(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-campaign-start-phase]').forEach((button) => {
      button.addEventListener('click', () => {
        const phaseId = button.dataset.campaignStartPhase;
        if (!phaseId || button.disabled) return;
        void this.confirmPhase(phaseId, button, onState);
      });
    });
  }

  private scrollPendingPhaseIntoView(modalBody: HTMLElement): void {
    requestAnimationFrame(() => {
      modalBody
        .querySelector('.campaign-path-node--pending, .campaign-path-node--current, .campaign-world-node--active')
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
    this.updateViewToggleUi(modalBody);

    const panelHost = modalBody.querySelector('[data-campaign-map-panel]') as HTMLElement | null;
    let tabsHost = modalBody.querySelector('[data-campaign-map-tabs]');

    if (this.viewMode === 'world') {
      tabsHost?.remove();
      if (panelHost) {
        panelHost.classList.add('campaign-map-panel--world');
        panelHost.setAttribute('aria-label', 'Mapa-mundo');
        panelHost.setAttribute('data-campaign-theme', this.activeMapId);
        panelHost.innerHTML = this.renderer.renderWorldPanel(this.campaign, this.activeMapId);
        bindCampaignTooltips(panelHost);
      }
      this.bindWorldMapNodes(modalBody, onState);
      this.scrollPendingPhaseIntoView(modalBody);
      return;
    }

    if (!tabsHost) {
      panelHost?.insertAdjacentHTML(
        'beforebegin',
        `<div class="campaign-map-tabs" data-campaign-map-tabs role="tablist" aria-label="Mapas"></div>`,
      );
      tabsHost = modalBody.querySelector('[data-campaign-map-tabs]');
    }

    if (tabsHost) {
      tabsHost.innerHTML = this.renderer.renderTabs(this.campaign, this.activeMapId);
      bindCampaignTooltips(tabsHost);
    }

    const activeMap = this.campaign.maps.find((map) => map.id === this.activeMapId);
    if (panelHost && activeMap) {
      panelHost.classList.remove('campaign-map-panel--world');
      panelHost.innerHTML = this.renderer.renderMapPanel(activeMap, this.pendingPhaseId, {
        showUnlockBanner: this.shouldShowUnlockBanner(),
      });
      panelHost.setAttribute('aria-label', activeMap.name);
      panelHost.setAttribute('data-campaign-theme', this.activeMapId);
      if (this.shouldShowUnlockBanner()) {
        markMapSeen(this.activeMapId);
      }
      bindCampaignTooltips(panelHost);
    }

    this.syncCampaignTheme(modalBody);
    this.bindMapTabs(modalBody, onState);
    this.bindPhaseButtons(modalBody, onState);
    this.bindStartButton(modalBody, onState);
    this.scrollPendingPhaseIntoView(modalBody);
  }

  private refreshRegionView(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    if (!this.campaign) return;

    const tabsHost = modalBody.querySelector('[data-campaign-map-tabs]');
    const panelHost = modalBody.querySelector('[data-campaign-map-panel]');
    const activeMap = this.campaign.maps.find((map) => map.id === this.activeMapId);

    if (tabsHost) {
      tabsHost.innerHTML = this.renderer.renderTabs(this.campaign, this.activeMapId);
      bindCampaignTooltips(tabsHost);
    }

    if (panelHost && activeMap) {
      panelHost.innerHTML = this.renderer.renderMapPanel(activeMap, this.pendingPhaseId, {
        showUnlockBanner: isMapNewToPlayer(activeMap.id, activeMap.unlocked),
      });
      panelHost.setAttribute('aria-label', activeMap.name);
      if (isMapNewToPlayer(activeMap.id, activeMap.unlocked)) {
        markMapSeen(activeMap.id);
      }
    }

    this.syncCampaignTheme(modalBody);
    this.bindMapTabs(modalBody, onState);
    this.bindPhaseButtons(modalBody, onState);
    this.bindStartButton(modalBody, onState);
    this.scrollPendingPhaseIntoView(modalBody);
  }

  private async confirmPhase(
    phaseId: string,
    button: HTMLButtonElement,
    onState: (state: GameStateDto) => void,
  ): Promise<void> {
    const loadingClass = button.hasAttribute('data-phase-id')
      ? 'campaign-path-node--selecting'
      : 'campaign-phase-preview-start--loading';
    if (button.classList.contains(loadingClass)) return;

    button.classList.add(loadingClass);
    button.disabled = true;
    await new Promise((resolve) => window.setTimeout(resolve, 180));

    const response = await this.client.send({ type: 'SELECT_PHASE', phaseId });
    if (!response.ok) {
      button.classList.remove(loadingClass);
      button.disabled = false;
      return;
    }

    onState(response.state);
    this.modal.close();
  }
}
