/**
 * UI da auditoria de economia no Balance Lab.
 */

interface PhaseRow {
  phaseId: string;
  phaseNumber: number;
  chapterMainPhase: number;
  displayName: string;
  goldTotal: number;
  waveCount: number;
  enemyCount: number;
}

interface ShopItem {
  id: string;
  name: string;
  rarity: string;
  basePrice: number;
  effectivePrice: number;
}

interface ShopRow {
  shopId: string;
  shopName: string;
  tier: number;
  refreshCost: number;
  items: ShopItem[];
}

interface MapRow {
  mapId: string;
  mapName: string;
  mapIndex: number;
  phases: PhaseRow[];
  goldTotal: number;
  shops: ShopRow[];
}

interface ChapterOption {
  mainPhase: number;
  min: number;
  max: number;
  label: string;
}

interface Payload {
  maps: MapRow[];
  chapters: ChapterOption[];
}

let payload: Payload | null = null;
let filterMapIndex: number | undefined;
let filterChapterMain: number | undefined;
let statusMessage = '';
let statusError = false;

function setStatus(message: string, isError = false): void {
  statusMessage = message;
  statusError = isError;
  const el = document.getElementById('ea-status');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('is-error', isError);
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const json = (await response.json()) as T & { ok?: boolean; error?: string };
  if (!response.ok || json.ok === false) throw new Error(json.error || `HTTP ${response.status}`);
  return json;
}

export async function loadEconomyAudit(): Promise<void> {
  const params = new URLSearchParams();
  if (filterMapIndex !== undefined) params.set('mapIndex', String(filterMapIndex));
  if (filterChapterMain !== undefined) params.set('chapterMain', String(filterChapterMain));
  const data = await api<{ ok: boolean } & Payload>(`/api/economy-audit?${params}`);
  payload = { maps: data.maps, chapters: data.chapters };
}

function rarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: 'var(--rar-common)',
    uncommon: 'var(--rar-uncommon)',
    rare: 'var(--rar-rare)',
    epic: 'var(--rar-epic)',
    legendary: 'var(--rar-legendary)',
    mythic: 'var(--rar-mythic)',
  };
  return colors[rarity] ?? 'var(--text)';
}

export function renderEconomyAudit(): void {
  const host = document.getElementById('lab-economy-audit');
  if (!host || !payload) return;

  const totalGold = payload.maps.reduce((sum, m) => sum + m.goldTotal, 0);

  const shopSummary = payload.maps.flatMap((m) => m.shops);
  const cheapestItem = shopSummary.flatMap((s) => s.items).reduce(
    (min, item) => (item.effectivePrice < min ? item.effectivePrice : min),
    Infinity,
  );
  const mostExpensive = shopSummary.flatMap((s) => s.items).reduce(
    (max, item) => (item.effectivePrice > max ? item.effectivePrice : max),
    0,
  );

  host.innerHTML = `
    <div class="xp-layout">
      <aside class="xp-sidebar">
        <p class="lab-hint">Ouro por fase + pool de lojas + custo de renovação. Leia-only.</p>
        <div class="mb-filter-row">
          <label>Mapa
            <select id="ea-map">
              <option value="">Todos os mapas</option>
              ${payload.maps
                .map((m) => `<option value="${m.mapIndex}" ${filterMapIndex === m.mapIndex ? 'selected' : ''}>${m.mapName}</option>`)
                .join('')}
            </select>
          </label>
          <label>Capítulo
            <select id="ea-chapter">
              <option value="">Todos os capítulos</option>
              ${payload.chapters
                .map(
                  (c) =>
                    `<option value="${c.mainPhase}" ${filterChapterMain === c.mainPhase ? 'selected' : ''}>${c.label}</option>`,
                )
                .join('')}
            </select>
          </label>
          <button type="button" class="lab-btn--info" id="ea-refresh">↺ Atualizar</button>
        </div>
        <div class="ea-summary">
          <p><strong>Ouro total visível:</strong> <span class="ea-gold">${totalGold.toLocaleString('pt-BR')}</span></p>
          ${shopSummary.length > 0
            ? `<p><strong>Lojas:</strong> ${shopSummary.length} · preços ${cheapestItem}–${mostExpensive}</p>`
            : ''}
        </div>
      </aside>
      <section class="xp-main">
        ${payload.maps
          .map(
            (mapRow) => `
          <section class="ea-map-section">
            <h2 class="hc-section">Mapa ${mapRow.mapIndex} — ${mapRow.mapName}
              <span class="xp-muted">🪙 ${mapRow.goldTotal.toLocaleString('pt-BR')}</span>
            </h2>

            ${mapRow.phases.length > 0
              ? `<table class="ea-table">
                <thead>
                  <tr>
                    <th>Fase</th><th>Nome</th><th>Waves</th><th>Inimigos</th><th>Ouro</th>
                  </tr>
                </thead>
                <tbody>
                  ${mapRow.phases
                    .map(
                      (p) => `
                    <tr>
                      <td><code>${p.phaseId}</code></td>
                      <td>${p.displayName}</td>
                      <td>${p.waveCount}</td>
                      <td>${p.enemyCount}</td>
                      <td class="ea-gold">${p.goldTotal.toLocaleString('pt-BR')}</td>
                    </tr>`,
                    )
                    .join('')}
                </tbody>
              </table>`
              : '<p class="lab-hint">Nenhuma fase visível neste filtro.</p>'}

            ${mapRow.shops.length > 0
              ? `<h3 class="hc-section">Lojas do mapa ${mapRow.mapIndex}</h3>
                ${mapRow.shops
                  .map(
                    (shop) => `
                  <details class="ea-shop-card">
                    <summary>
                      <strong>${shop.shopName}</strong>
                      <span class="xp-muted">Tier ${shop.tier} · Renovar: ${shop.refreshCost} ouro</span>
                    </summary>
                    <table class="ea-table">
                      <thead>
                        <tr><th>Item</th><th>Raridade</th><th>Preço base</th><th>Preço efetivo</th></tr>
                      </thead>
                      <tbody>
                        ${shop.items
                          .map(
                            (item) => `
                          <tr>
                            <td>${item.name}</td>
                            <td style="color:${rarityColor(item.rarity)}">${item.rarity}</td>
                            <td>${item.basePrice}</td>
                            <td class="ea-gold">${item.effectivePrice}</td>
                          </tr>`,
                          )
                          .join('')}
                      </tbody>
                    </table>
                  </details>`,
                  )
                  .join('')}`
              : ''}
          </section>`,
          )
          .join('')}
        <p id="ea-status" class="lab-status${statusError ? ' is-error' : ''}" role="status">${statusMessage}</p>
      </section>
    </div>`;

  bindEconomyAudit(host);
}

function bindEconomyAudit(host: HTMLElement): void {
  host.querySelector<HTMLSelectElement>('#ea-map')?.addEventListener('change', (event) => {
    const val = (event.target as HTMLSelectElement).value;
    filterMapIndex = val ? Number(val) : undefined;
  });

  host.querySelector<HTMLSelectElement>('#ea-chapter')?.addEventListener('change', (event) => {
    const val = (event.target as HTMLSelectElement).value;
    filterChapterMain = val ? Number(val) : undefined;
  });

  host.querySelector('#ea-refresh')?.addEventListener('click', () => {
    void loadEconomyAudit()
      .then(() => {
        renderEconomyAudit();
        setStatus('Auditoria atualizada.');
      })
      .catch((err: Error) => setStatus(err.message, true));
  });
}

export async function mountEconomyAuditTab(): Promise<void> {
  await loadEconomyAudit();
  renderEconomyAudit();
  setStatus('Auditoria de economia carregada.');
}
