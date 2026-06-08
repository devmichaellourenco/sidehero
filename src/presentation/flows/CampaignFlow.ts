import { CampaignOverviewDto } from '../../application/dto/CampaignDto';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { IGameClient } from '../../application/ports/IGameClient';
import {
  CampaignModalRenderer,
  isMapUnlocked,
  resolveInitialMapId,
} from '../components/CampaignModalRenderer';
import { ModalController } from '../components/ModalController';

export class CampaignFlow {
  private campaign: CampaignOverviewDto | null = null;
  private activeMapId = 'stendra';

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
    modalBody.innerHTML = this.renderer.render(this.campaign, this.activeMapId);
    this.bindInteractions(modalBody, onState);
  }

  private bindInteractions(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    this.bindMapTabs(modalBody, onState);
    this.bindPhaseButtons(modalBody, onState);
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
        this.refreshMapView(modalBody, onState);
      });
    });
  }

  private bindPhaseButtons(modalBody: HTMLElement, onState: (state: GameStateDto) => void): void {
    modalBody.querySelectorAll<HTMLButtonElement>('[data-phase-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const phaseId = button.dataset.phaseId;
        if (!phaseId || button.disabled) return;
        void this.selectPhase(phaseId, onState);
      });
    });
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
      panelHost.innerHTML = this.renderer.renderMapPanel(activeMap);
      panelHost.setAttribute('aria-label', activeMap.name);
    }

    this.bindMapTabs(modalBody, onState);
    this.bindPhaseButtons(modalBody, onState);
  }

  private async selectPhase(phaseId: string, onState: (state: GameStateDto) => void): Promise<void> {
    const response = await this.client.send({ type: 'SELECT_PHASE', phaseId });
    if (!response.ok) return;
    onState(response.state);
    this.modal.close();
  }
}
