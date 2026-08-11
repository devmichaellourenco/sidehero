/**
 * UI do editor de batalhas de missões no Balance Lab.
 */

type MissionKind = 'main' | 'side' | 'normal';

interface MissionListEntry {
  missionId: string;
  kind: MissionKind;
  mapId: string;
  name: string;
  phaseTemplateId: string;
  stars: number | null;
  hasOverride: boolean;
  waveCount: number;
}

interface EnemyOption {
  id: string;
  name: string;
  powerTier: number;
  rosterRole: string;
}

interface EnemySlotDraft {
  enemyType: string;
  role: 'trash' | 'elite' | 'boss';
  count: number;
  displayName?: string;
  level?: number;
}

interface WaveDraft {
  id: string;
  goldMultiplier?: number;
  slots: EnemySlotDraft[];
}

interface BattleDraft {
  displayName: string;
  statMultiplier: number;
  waves: WaveDraft[];
}

const ROLES: Array<EnemySlotDraft['role']> = ['trash', 'elite', 'boss'];

interface BackupEntry {
  id: string;
  path: string;
}

let enemies: EnemyOption[] = [];
let missions: MissionListEntry[] = [];
let backups: BackupEntry[] = [];
let selectedId: string | null = null;
let draft: BattleDraft | null = null;
let filterKind: '' | MissionKind = '';
let filterMap = '';
let statusMessage = '';
let statusError = false;

function setStatus(message: string, isError = false): void {
  statusMessage = message;
  statusError = isError;
  const el = document.getElementById('missions-status');
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
  if (!response.ok || (json as { ok?: boolean }).ok === false) {
    throw new Error((json as { error?: string }).error || `HTTP ${response.status}`);
  }
  return json;
}

function emptySlot(): EnemySlotDraft {
  return {
    enemyType: enemies[0]?.id ?? 'goblin_raider',
    role: 'trash',
    count: 1,
  };
}

function emptyWave(index: number): WaveDraft {
  return { id: `w${index + 1}`, goldMultiplier: 1, slots: [emptySlot()] };
}

function phaseToDraft(phase: {
  displayName: string;
  statMultiplier?: number;
  waves: WaveDraft[];
}): BattleDraft {
  return {
    displayName: phase.displayName,
    statMultiplier: phase.statMultiplier ?? 1,
    waves: phase.waves.map((wave, index) => ({
      id: wave.id || `w${index + 1}`,
      goldMultiplier: wave.goldMultiplier ?? 1,
      slots: wave.slots.map((slot) => ({
        enemyType: slot.enemyType,
        role: slot.role,
        count: slot.count,
        displayName: slot.displayName,
        level: slot.level,
      })),
    })),
  };
}

export async function loadMissionBattlesList(): Promise<void> {
  const query = new URLSearchParams();
  if (filterKind) query.set('kind', filterKind);
  if (filterMap) query.set('mapId', filterMap);
  const data = await api<{
    missions: MissionListEntry[];
    enemies: EnemyOption[];
    backups?: BackupEntry[];
  }>(`/api/mission-battles?${query.toString()}`);
  enemies = data.enemies;
  missions = data.missions;
  backups = data.backups ?? [];
}

export async function selectMission(missionId: string): Promise<void> {
  const data = await api<{
    mission: MissionListEntry;
    phase: { displayName: string; statMultiplier?: number; waves: WaveDraft[] };
  }>(`/api/mission-battles/${encodeURIComponent(missionId)}`);
  selectedId = missionId;
  draft = phaseToDraft(data.phase);
  setStatus(`Carregada: ${data.mission.name} (${data.mission.phaseTemplateId})`);
}

async function saveSelected(): Promise<void> {
  if (!selectedId || !draft) return;
  const data = await api<{
    backupPath: string | null;
    detail: { mission: MissionListEntry };
  }>(`/api/mission-battles/${encodeURIComponent(selectedId)}`, {
    method: 'PUT',
    body: JSON.stringify(draft),
  });
  await loadMissionBattlesList();
  setStatus(
    `Salvo em phase-battle-overrides.json${
      data.backupPath ? ` · backup: ${data.backupPath}` : ''
    }`,
  );
}

async function clearOverride(): Promise<void> {
  if (!selectedId) return;
  if (!confirm('Remover override e voltar ao baseline do catálogo?')) return;
  await api(`/api/mission-battles/${encodeURIComponent(selectedId)}`, {
    method: 'DELETE',
  });
  await selectMission(selectedId);
  await loadMissionBattlesList();
  setStatus('Override removido (baseline restaurado).');
}

async function resetToBaseline(): Promise<void> {
  if (!selectedId) return;
  const data = await api<{
    baselinePhase: { displayName: string; statMultiplier?: number; waves: WaveDraft[] };
  }>(`/api/mission-battles/${encodeURIComponent(selectedId)}`);
  draft = phaseToDraft(data.baselinePhase);
  setStatus('Rascunho resetado para o baseline (ainda não salvo).');
  renderMissionsEditor();
}

async function restoreBackup(backupId: string): Promise<void> {
  if (!confirm(`Restaurar backup ${backupId}? O arquivo atual será backupado antes.`)) return;
  await api(`/api/mission-battles-backups/${encodeURIComponent(backupId)}/restore`, {
    method: 'POST',
    body: '{}',
  });
  await loadMissionBattlesList();
  if (selectedId) await selectMission(selectedId);
  setStatus(`Backup restaurado: ${backupId}`);
}

function enemySelect(selected: string): string {
  return enemies
    .map(
      (enemy) =>
        `<option value="${enemy.id}" ${enemy.id === selected ? 'selected' : ''}>${enemy.name} (T${enemy.powerTier} · ${enemy.rosterRole})</option>`,
    )
    .join('');
}

function renderWaveEditor(wave: WaveDraft, waveIndex: number): string {
  const slots = wave.slots
    .map((slot, slotIndex) => {
      return `
        <div class="mb-slot" data-wave="${waveIndex}" data-slot="${slotIndex}">
          <label>Inimigo
            <select data-field="enemyType">${enemySelect(slot.enemyType)}</select>
          </label>
          <label>Papel
            <select data-field="role">
              ${ROLES.map(
                (role) =>
                  `<option value="${role}" ${role === slot.role ? 'selected' : ''}>${role}</option>`,
              ).join('')}
            </select>
          </label>
          <label>Qtd
            <input type="number" min="1" max="12" data-field="count" value="${slot.count}" />
          </label>
          <label>Nome (opc.)
            <input type="text" data-field="displayName" value="${slot.displayName ?? ''}" />
          </label>
          <label>Level (opc.)
            <input type="number" min="1" data-field="level" value="${slot.level ?? ''}" placeholder="tier" />
          </label>
          <button type="button" class="mb-btn-danger" data-action="remove-slot">Remover slot</button>
        </div>
      `;
    })
    .join('');

  return `
    <section class="mb-wave" data-wave-index="${waveIndex}">
      <header class="mb-wave-head">
        <strong>Wave ${waveIndex + 1}</strong>
        <label>id <input type="text" data-field="id" value="${wave.id}" /></label>
        <label>ouro × <input type="number" step="0.05" min="0" data-field="goldMultiplier" value="${wave.goldMultiplier ?? 1}" /></label>
        <button type="button" data-action="add-slot">+ slot</button>
        <button type="button" class="mb-btn-danger" data-action="remove-wave">Remover wave</button>
      </header>
      <div class="mb-slots">${slots}</div>
    </section>
  `;
}

function renderList(): string {
  if (missions.length === 0) {
    return `<p class="lab-hint">Nenhuma missão neste filtro.</p>`;
  }
  return `
    <ul class="mb-list">
      ${missions
        .map((mission) => {
          const active = mission.missionId === selectedId ? ' is-active' : '';
          const badge = mission.hasOverride ? '<span class="mb-badge">override</span>' : '';
          return `
            <li>
              <button type="button" class="mb-list-item${active}" data-select-mission="${mission.missionId}">
                <span class="mb-list-kind">${mission.kind}</span>
                <span class="mb-list-name">${mission.name}</span>
                <span class="mb-list-meta">${mission.phaseTemplateId} · ${mission.waveCount}w ${badge}</span>
              </button>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;
}

function renderEditor(): string {
  if (!draft || !selectedId) {
    return `<p class="lab-hint">Selecione uma missão à esquerda para editar waves e monstros.</p>`;
  }

  return `
    <div class="mb-editor-toolbar">
      <label>Nome da fase
        <input type="text" id="mb-display-name" value="${draft.displayName}" />
      </label>
      <label>statMultiplier
        <input type="number" id="mb-stat-mult" step="0.01" min="0.1" value="${draft.statMultiplier}" />
      </label>
      <button type="button" id="mb-add-wave">+ wave</button>
      <button type="button" id="mb-save">Salvar no sistema</button>
      <button type="button" id="mb-reset-baseline">Rascunho = baseline</button>
      <button type="button" class="mb-btn-danger" id="mb-clear-override">Apagar override</button>
    </div>
    <div class="mb-json-row">
      <label class="lab-field lab-field--full">JSON da batalha
        <textarea id="mb-json" rows="8" spellcheck="false">${JSON.stringify(draft, null, 2)}</textarea>
      </label>
      <button type="button" id="mb-apply-json">Aplicar JSON → formulário</button>
    </div>
    <div class="mb-waves">
      ${draft.waves.map((wave, index) => renderWaveEditor(wave, index)).join('')}
    </div>
  `;
}

function readDraftFromDom(root: HTMLElement): void {
  if (!draft) return;
  const name = root.querySelector('#mb-display-name') as HTMLInputElement | null;
  const mult = root.querySelector('#mb-stat-mult') as HTMLInputElement | null;
  if (name) draft.displayName = name.value;
  if (mult) draft.statMultiplier = Number(mult.value) || 1;

  root.querySelectorAll<HTMLElement>('.mb-wave').forEach((waveEl) => {
    const wi = Number(waveEl.dataset.waveIndex);
    const wave = draft!.waves[wi];
    if (!wave) return;
    const idInput = waveEl.querySelector<HTMLInputElement>('header [data-field="id"]');
    const goldInput = waveEl.querySelector<HTMLInputElement>(
      'header [data-field="goldMultiplier"]',
    );
    if (idInput) wave.id = idInput.value || `w${wi + 1}`;
    if (goldInput) wave.goldMultiplier = Number(goldInput.value) || 1;

    waveEl.querySelectorAll<HTMLElement>('.mb-slot').forEach((slotEl) => {
      const si = Number(slotEl.dataset.slot);
      const slot = wave.slots[si];
      if (!slot) return;
      const enemyType = slotEl.querySelector<HTMLSelectElement>('[data-field="enemyType"]');
      const role = slotEl.querySelector<HTMLSelectElement>('[data-field="role"]');
      const count = slotEl.querySelector<HTMLInputElement>('[data-field="count"]');
      const displayName = slotEl.querySelector<HTMLInputElement>('[data-field="displayName"]');
      const level = slotEl.querySelector<HTMLInputElement>('[data-field="level"]');
      if (enemyType) slot.enemyType = enemyType.value;
      if (role) slot.role = role.value as EnemySlotDraft['role'];
      if (count) slot.count = Math.max(1, Number(count.value) || 1);
      if (displayName) slot.displayName = displayName.value.trim() || undefined;
      if (level) {
        const n = Number(level.value);
        slot.level = Number.isFinite(n) && level.value !== '' ? n : undefined;
      }
    });
  });
}

function bindEditor(root: HTMLElement): void {
  root.querySelector('#mb-add-wave')?.addEventListener('click', () => {
    readDraftFromDom(root);
    draft?.waves.push(emptyWave(draft.waves.length));
    renderMissionsEditor();
  });

  root.querySelector('#mb-save')?.addEventListener('click', () => {
    readDraftFromDom(root);
    void saveSelected().then(() => renderMissionsEditor()).catch((error: Error) => {
      setStatus(error.message, true);
    });
  });

  root.querySelector('#mb-reset-baseline')?.addEventListener('click', () => {
    void resetToBaseline().catch((error: Error) => setStatus(error.message, true));
  });

  root.querySelector('#mb-clear-override')?.addEventListener('click', () => {
    void clearOverride().then(() => renderMissionsEditor()).catch((error: Error) => {
      setStatus(error.message, true);
    });
  });

  root.querySelector('#mb-apply-json')?.addEventListener('click', () => {
    const area = root.querySelector('#mb-json') as HTMLTextAreaElement | null;
    if (!area || !draft) return;
    try {
      const parsed = JSON.parse(area.value) as BattleDraft;
      if (!Array.isArray(parsed.waves)) throw new Error('JSON sem waves[]');
      draft = phaseToDraft(parsed);
      setStatus('JSON aplicado ao formulário.');
      renderMissionsEditor();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error), true);
    }
  });

  root.querySelectorAll('[data-action="add-slot"]').forEach((button) => {
    button.addEventListener('click', () => {
      readDraftFromDom(root);
      const waveEl = (button as HTMLElement).closest('.mb-wave') as HTMLElement;
      const wi = Number(waveEl.dataset.waveIndex);
      draft?.waves[wi]?.slots.push(emptySlot());
      renderMissionsEditor();
    });
  });

  root.querySelectorAll('[data-action="remove-slot"]').forEach((button) => {
    button.addEventListener('click', () => {
      readDraftFromDom(root);
      const slotEl = (button as HTMLElement).closest('.mb-slot') as HTMLElement;
      const wi = Number(slotEl.dataset.wave);
      const si = Number(slotEl.dataset.slot);
      const wave = draft?.waves[wi];
      if (!wave || wave.slots.length <= 1) return;
      wave.slots.splice(si, 1);
      renderMissionsEditor();
    });
  });

  root.querySelectorAll('[data-action="remove-wave"]').forEach((button) => {
    button.addEventListener('click', () => {
      readDraftFromDom(root);
      if (!draft || draft.waves.length <= 1) return;
      const waveEl = (button as HTMLElement).closest('.mb-wave') as HTMLElement;
      const wi = Number(waveEl.dataset.waveIndex);
      draft.waves.splice(wi, 1);
      renderMissionsEditor();
    });
  });
}

export function renderMissionsEditor(): void {
  const host = document.getElementById('lab-missions');
  if (!host) return;

  const maps = [...new Set(missions.map((m) => m.mapId))].sort();

  const backupOptions =
    backups.length === 0
      ? '<option value="">(nenhum backup ainda)</option>'
      : backups
          .map((backup) => `<option value="${backup.id}">${backup.id}</option>`)
          .join('');

  host.innerHTML = `
    <div class="mb-layout">
      <aside class="mb-sidebar">
        <div class="mb-filters">
          <label>Tipo
            <select id="mb-filter-kind">
              <option value="" ${filterKind === '' ? 'selected' : ''}>Todos</option>
              <option value="main" ${filterKind === 'main' ? 'selected' : ''}>Principal</option>
              <option value="side" ${filterKind === 'side' ? 'selected' : ''}>Secundária</option>
              <option value="normal" ${filterKind === 'normal' ? 'selected' : ''}>Normal</option>
            </select>
          </label>
          <label>Mapa
            <select id="mb-filter-map">
              <option value="" ${filterMap === '' ? 'selected' : ''}>Todos</option>
              ${maps
                .map(
                  (mapId) =>
                    `<option value="${mapId}" ${filterMap === mapId ? 'selected' : ''}>${mapId}</option>`,
                )
                .join('')}
            </select>
          </label>
        </div>
        ${renderList()}
        <div class="mb-backups">
          <h3>Backups</h3>
          <p class="lab-hint">Cada save/delete copia o JSON anterior.</p>
          <label>Arquivo
            <select id="mb-backup-select">${backupOptions}</select>
          </label>
          <button type="button" id="mb-restore-backup">Restaurar selecionado</button>
        </div>
      </aside>
      <section class="mb-main">
        ${renderEditor()}
        <p id="missions-status" class="lab-status${statusError ? ' is-error' : ''}" role="status">${statusMessage}</p>
      </section>
    </div>
  `;

  host.querySelector('#mb-filter-kind')?.addEventListener('change', (event) => {
    filterKind = (event.target as HTMLSelectElement).value as '' | MissionKind;
    void loadMissionBattlesList()
      .then(() => renderMissionsEditor())
      .catch((error: Error) => setStatus(error.message, true));
  });

  host.querySelector('#mb-filter-map')?.addEventListener('change', (event) => {
    filterMap = (event.target as HTMLSelectElement).value;
    void loadMissionBattlesList()
      .then(() => renderMissionsEditor())
      .catch((error: Error) => setStatus(error.message, true));
  });

  host.querySelectorAll<HTMLButtonElement>('[data-select-mission]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.selectMission;
      if (!id) return;
      void selectMission(id)
        .then(() => renderMissionsEditor())
        .catch((error: Error) => setStatus(error.message, true));
    });
  });

  host.querySelector('#mb-restore-backup')?.addEventListener('click', () => {
    const select = host.querySelector('#mb-backup-select') as HTMLSelectElement | null;
    const id = select?.value;
    if (!id) {
      setStatus('Selecione um backup.', true);
      return;
    }
    void restoreBackup(id)
      .then(() => renderMissionsEditor())
      .catch((error: Error) => setStatus(error.message, true));
  });

  bindEditor(host);
}

export async function mountMissionsTab(): Promise<void> {
  await loadMissionBattlesList();
  renderMissionsEditor();
}
