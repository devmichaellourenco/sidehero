import { CampaignOverviewDto } from '../../application/dto/CampaignDto';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { IGameClient } from '../../application/ports/IGameClient';
import { CampaignModalRenderer } from '../components/CampaignModalRenderer';
import { ModalController } from '../components/ModalController';

export class CampaignFlow {
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

    this.renderModal(response.campaign, modalBody, onState);
  }

  private renderModal(
    campaign: CampaignOverviewDto,
    modalBody: HTMLElement,
    onState: (state: GameStateDto) => void,
  ): void {
    modalBody.innerHTML = this.renderer.render(campaign);
    modalBody.querySelectorAll<HTMLButtonElement>('[data-phase-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const phaseId = button.dataset.phaseId;
        if (!phaseId || button.disabled) return;
        void this.selectPhase(phaseId, onState);
      });
    });
  }

  private async selectPhase(phaseId: string, onState: (state: GameStateDto) => void): Promise<void> {
    const response = await this.client.send({ type: 'SELECT_PHASE', phaseId });
    if (!response.ok) return;
    onState(response.state);
    this.modal.close();
  }
}
