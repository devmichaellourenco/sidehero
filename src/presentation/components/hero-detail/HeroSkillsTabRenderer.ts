import { SkillNodeDto } from '../../../application/dto/SkillNodeDto';

export function renderHeroSkillsTab(nodes: SkillNodeDto[], unspentPoints: number): string {
  if (nodes.length === 0) {
    return '<p class="empty-state">Carregando árvore de skills...</p>';
  }

  const cards = nodes
    .map((node) => {
      const rankLabel = `${node.currentRank}/${node.maxRank}`;
      const equipLabel = node.isEquipped ? 'Ativa' : 'Inativa';
      const canAllocate = node.status === 'ready' && unspentPoints > 0;
      const canActivate = node.currentRank > 0 && !node.isEquipped;
      const canDeactivate = node.isEquipped;

      return `
        <article class="skill-card skill-card-${node.status}">
          <header class="skill-card-header">
            <h4>${node.name}</h4>
            <span class="skill-rank">${rankLabel}</span>
          </header>
          <p class="skill-desc">${node.description}</p>
          <p class="skill-meta">${node.scope === 'class' ? 'Classe' : 'Universal'} · ${node.scaling.toUpperCase()}</p>
          <ul class="skill-reqs">
            ${node.requirements.map((req) => `<li class="${req.met ? 'met' : 'unmet'}">${req.label}</li>`).join('')}
          </ul>
          <div class="skill-actions">
            <button type="button" data-skill-allocate="${node.id}" ${canAllocate ? '' : 'disabled'}>+1 rank</button>
            <button type="button" data-skill-activate="${node.id}" ${canActivate ? '' : 'disabled'}>Ativar (${node.activationCost} ouro)</button>
            <button type="button" data-skill-deactivate="${node.id}" ${canDeactivate ? '' : 'disabled'}>Desativar</button>
            <span class="skill-equip-status">${equipLabel}</span>
          </div>
        </article>
      `;
    })
    .join('');

  return `
    <section class="hero-skills-tab">
      <p class="hero-detail-hint">Pontos disponíveis: <strong>${unspentPoints}</strong></p>
      <div class="skill-list">${cards}</div>
    </section>
  `;
}
