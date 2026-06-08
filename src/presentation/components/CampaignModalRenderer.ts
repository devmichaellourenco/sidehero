import { CampaignOverviewDto } from '../../application/dto/CampaignDto';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class CampaignModalRenderer {
  render(campaign: CampaignOverviewDto): string {
    const maps = campaign.maps
      .map((map) => {
        const phases = map.phases
          .map((phase) => {
            const status = phase.cleared ? '✓' : phase.unlocked ? '○' : '🔒';
            const selected = phase.selected ? ' campaign-phase--selected' : '';
            const disabled = phase.playable ? '' : ' disabled';
            const badge = phase.seasonFinale
              ? ' · 🏆 Final'
              : phase.milestoneBoss
                ? ' · 👑 Boss'
                : '';
            return `
              <button
                type="button"
                class="campaign-phase${selected}${phase.milestoneBoss ? ' campaign-phase--milestone' : ''}"
                data-phase-id="${escapeHtml(phase.id)}"
                ${disabled}
              >
                <span class="campaign-phase-status">${status}</span>
                <span class="campaign-phase-name">${escapeHtml(phase.displayName)}</span>
                <span class="campaign-phase-meta">${phase.waveCount} waves · T${phase.difficultyTier}${badge}</span>
              </button>
            `;
          })
          .join('');

        return `
          <section class="campaign-map">
            <h3 class="campaign-map-title">${escapeHtml(map.name)}</h3>
            <div class="campaign-phase-grid">${phases}</div>
          </section>
        `;
      })
      .join('');

    return `
      <div class="campaign-modal">
        <p class="campaign-modal-hint">500 fases · boss a cada 50 · XP só no boss da wave final.</p>
        ${maps}
      </div>
    `;
  }
}
