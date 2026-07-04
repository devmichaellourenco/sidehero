import { CampaignOverviewDto } from '../../application/dto/CampaignDto';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { IGameClient } from '../../application/ports/IGameClient';
import {
  CampaignModalRenderer,
  isMapUnlocked,
  resolveInitialMapId,
} from '../components/CampaignModalRenderer';
import { resolveInitialPendingPhaseId } from '../components/CampaignMapPresentation';
import { ModalController } from '../components/ModalController';

export class CampaignFlow {
  private campaign: CampaignOverviewDto | null = null;
  private activeMapId = 'stendra';
  private pendingPhaseId: string | null = null;

  constructor(
    private readonly client: IGameClient,
    private readonly modal: ModalController,
    private readonly renderer = new CampaignModalRenderer(),
  ) {}

  async open(
    onState: (state: GameStateDto) => void,
    modalBody: HTMLElement,
  ): Promise<void> {
    const response = await this.client.send({ type: 'GET_CAMPAIGN_OVERVIEW' });
    if (!response.ok || !response.campaign) return;

    this.campaign = response.campaign;
    this.activeMapId = resolveInitialMapId(response.campaign);
    this.pendingPhaseId = this.resolvePendingForActiveMap();
    modalBody.innerHTML = this.renderer.render(this.campaign, this.activeMapId, this.pendingPhaseId);
    this.bindInteractions(modalBody, onState);
    this.scrollPendingPhaseIntoView(modalBody);
  }

  private resolvePendingForActiveMap(): string | null {
    if (!this.campaign) return null;
    const activeMap = this.campaign.maps.find((map) => map.id === this.activeMapId);
    if (!activeMap) return null;
    return resolveInitialPendingPhaseId(activeMap);
  }

  private bindInteractions(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    this.bindMapTabs(modalBody, onState);
    this.bindPhaseButtons(modalBody, onState);
    this.bindStartButton(modalBody, onState);
  }

  private bindMapTabs(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-campaign-map-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        if (tab.disabled) return;

        const mapId = tab.dataset.campaignMapTab;
        if (!mapId || mapId === this.activeMapId || !this.campaign) return;

        const map = this.campaign.maps.find((entry) => entry.id === mapId);
        if (!map || !isMapUnlocked(map)) return;

        this.activeMapId = mapId;
        this.pendingPhaseId = resolveInitialPendingPhaseId(map);
        this.refreshMapView(modalBody, onState);
      });
    });
  }

  private bindPhaseButtons(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-phase-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const phaseId = button.dataset.phaseId;
        if (!phaseId || button.disabled) return;
        this.pendingPhaseId = phaseId;
        this.refreshMapView(modalBody, onState);
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
        .querySelector('.campaign-path-node--pending, .campaign-path-node--current')
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

  private refreshMapView(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    if (!this.campaign) return;

    const tabsHost = modalBody.querySelector('[data-campaign-map-tabs]');
    const panelHost = modalBody.querySelector('[data-campaign-map-panel]');
    const activeMap = this.campaign.maps.find((map) => map.id === this.activeMapId);

    if (tabsHost) {
      tabsHost.innerHTML = this.renderer.renderTabs(this.campaign, this.activeMapId);
    }

    if (panelHost && activeMap) {
      panelHost.innerHTML = this.renderer.renderMapPanel(activeMap, this.pendingPhaseId);
      panelHost.setAttribute('aria-label', activeMap.name);
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
    if (button.classList.contains('campaign-phase-preview-start--loading')) return;

    button.classList.add('campaign-phase-preview-start--loading');
    button.disabled = true;
    await new Promise((resolve) => window.setTimeout(resolve, 180));

    const response = await this.client.send({ type: 'SELECT_PHASE', phaseId });
    if (!response.ok) {
      button.classList.remove('campaign-phase-preview-start--loading');
      button.disabled = false;
      return;
    }

    onState(response.state);
    this.modal.close();
  }
}
