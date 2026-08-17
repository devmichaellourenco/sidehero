/**
 * UI do editor de batalhas de missões no Balance Lab.
 */

import {
  bindSpriteFallback,
  enemyTriggerHtml,
  openEnemyPicker,
} from './enemyPicker';
import { confirmChangeReview } from './changeReview';
import { debounce } from './debounce';
import { enemySpriteUrlForLab } from './enemySprites';
import { withPreservedScroll } from './scrollPreserve';
import { registerWorkspaceSave, setWorkspaceDirty } from './workspaceState';
import {
  getReferenceParty,
  renderPartyEditorHtml,
  bindPartyEditor,
  partyToQueryParam,
  partyLabel,
} from './referenceParty';
import { openEnemyInSimulator } from './navigation';
import {
  renderRunsSelectHtml,
  readRunsSelect,
  renderProfileSelectHtml,
  readProfileSelect,
  getRefPartyForApi,
  fetchCombatSim,
  renderSimResult,
} from './combatSimUi';
import { renderSweepPanelHtml, bindSweepPanel } from './combatSweepUi';

type MissionKind = 'main' | 'side' | 'normal';

interface MissionListEntry {
  missionId: string;
  kind: MissionKind;
  mapId: string;
  name: string;
  phaseTemplateId: string;
  phaseNumber: number;
  chapterMainPhase: number;
  chapterMin: number;
  chapterMax: number;
  stars: number | null;
  hasOverride: boolean;
  waveCount: number;
  sharedMissionIds: string[];
}

interface ChapterOption {
  mainPhase: number;
  min: number;
  max: number;
  label: string;
}

interface EnemyOption {
  id: string;
  name: string;
  powerTier: number;
  rosterRole: string;
  spriteUrl?: string;
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
let chapters: ChapterOption[] = [];
let maps: string[] = [];
let backups: BackupEntry[] = [];
let selectedId: string | null = null;
let selectedMission: MissionListEntry | null = null;
let draft: BattleDraft | null = null;
/** Rascunhos por missão — sobrevivem à troca de item até salvar. */
const draftsByMissionId = new Map<string, BattleDraft>();
/** Snapshot JSON do que veio do servidor (para detectar dirty). */
const loadedSnapshotByMissionId = new Map<string, string>();
const dirtyMissionIds = new Set<string>();
let filterKind: '' | MissionKind = '';
let filterMap = '';
let filterChapter = '';
let filterQuery = '';
let statusMessage = '';
let statusError = false;

function cloneDraft(value: BattleDraft): BattleDraft {
  return JSON.parse(JSON.stringify(value)) as BattleDraft;
}

function snapshotDraft(value: BattleDraft): string {
  return JSON.stringify(value);
}

function dirtyMissionCount(): number {
  return dirtyMissionIds.size;
}

function updateMissionDirtyChrome(): void {
  const saveBtn = document.getElementById('mb-save') as HTMLButtonElement | null;
  const count = dirtyMissionCount();
  if (saveBtn) {
    saveBtn.disabled = count === 0;
    saveBtn.textContent =
      count > 1 ? `Salvar tudo (${count})` : count === 1 ? 'Salvar no sistema' : 'Salvar no sistema';
  }
  const el = document.getElementById('mb-dirty-count');
  if (el) el.textContent = count > 0 ? `${count} missão(ões) alterada(s)` : '';
}

function markCurrentMissionDirtyState(): void {
  if (!selectedId || !draft) return;
  draftsByMissionId.set(selectedId, cloneDraft(draft));
  const loaded = loadedSnapshotByMissionId.get(selectedId);
  if (!loaded || loaded !== snapshotDraft(draft)) dirtyMissionIds.add(selectedId);
  else dirtyMissionIds.delete(selectedId);
  updateMissionDirtyChrome();
}

/** Grava o editor atual no mapa de rascunhos antes de trocar de missão. */
function stashCurrentMissionDraft(root?: HTMLElement | null): void {
  if (!selectedId || !draft) return;
  const host = root ?? document.getElementById('lab-missions');
  if (host) readDraftFromDom(host);
  markCurrentMissionDirtyState();
}

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

function starsLabel(stars: number | null): string {
  if (!stars) return '';
  return `★${stars}`;
}

export async function loadMissionBattlesList(): Promise<void> {
  const query = new URLSearchParams();
  if (filterKind) query.set('kind', filterKind);
  if (filterMap) query.set('mapId', filterMap);
  if (filterChapter) query.set('chapterMain', filterChapter);
  if (filterQuery.trim()) query.set('q', filterQuery.trim());
  const data = await api<{
    missions: MissionListEntry[];
    enemies: EnemyOption[];
    chapters?: ChapterOption[];
    maps?: string[];
    backups?: BackupEntry[];
  }>(`/api/mission-battles?${query.toString()}`);
  enemies = data.enemies;
  missions = data.missions;
  chapters = data.chapters ?? chapters;
  maps = data.maps ?? maps;
  backups = data.backups ?? [];
}

export async function selectMission(missionId: string): Promise<void> {
  stashCurrentMissionDraft();
  const resolvedMissionId =
    missions.find(
      (mission) =>
        mission.missionId === missionId || mission.phaseTemplateId === missionId,
    )?.missionId ?? missionId;

  const data = await api<{
    mission: MissionListEntry;
    phase: { displayName: string; statMultiplier?: number; waves: WaveDraft[] };
  }>(`/api/mission-battles/${encodeURIComponent(resolvedMissionId)}`);
  selectedId = resolvedMissionId;
  selectedMission = data.mission;

  const cached = draftsByMissionId.get(resolvedMissionId);
  if (cached && dirtyMissionIds.has(resolvedMissionId)) {
    draft = cloneDraft(cached);
  } else {
    draft = phaseToDraft(data.phase);
    draftsByMissionId.set(resolvedMissionId, cloneDraft(draft));
    loadedSnapshotByMissionId.set(resolvedMissionId, snapshotDraft(draft));
    dirtyMissionIds.delete(resolvedMissionId);
  }

  const shared =
    data.mission.sharedMissionIds.length > 0
      ? ` · compartilhada com ${data.mission.sharedMissionIds.join(', ')}`
      : '';
  const pending =
    dirtyMissionCount() > 0 ? ` · ${dirtyMissionCount()} rascunho(s) pendente(s)` : '';
  setStatus(
    `Cap. ${data.mission.chapterMainPhase} (${data.mission.chapterMin}–${data.mission.chapterMax}) · ${data.mission.name} · ${data.mission.phaseTemplateId}${shared}${pending}`,
  );
}

async function saveAllDirty(): Promise<void> {
  stashCurrentMissionDraft();
  if (dirtyMissionIds.size === 0) {
    setStatus('Nada para salvar.');
    return;
  }

  const updates: Record<string, BattleDraft> = {};
  for (const missionId of dirtyMissionIds) {
    const pending = draftsByMissionId.get(missionId);
    if (!pending) continue;
    updates[missionId] = pending;
  }

  if (Object.keys(updates).length === 0) {
    setStatus('Nada para salvar.');
    return;
  }
  if (
    !(await confirmChangeReview('Salvar batalhas das missões', dirtyMissionIds.size, updates))
  ) {
    return;
  }

  const data = await api<{
    backupPath: string | null;
    saved: Array<{ missionId: string; phaseTemplateId: string }>;
  }>('/api/mission-battles', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
  });

  for (const missionId of Object.keys(updates)) {
    const savedDraft = updates[missionId]!;
    loadedSnapshotByMissionId.set(missionId, snapshotDraft(savedDraft));
    draftsByMissionId.set(missionId, cloneDraft(savedDraft));
    dirtyMissionIds.delete(missionId);
  }

  await loadMissionBattlesList();
  if (selectedId && draftsByMissionId.has(selectedId)) {
    draft = cloneDraft(draftsByMissionId.get(selectedId)!);
    const meta = missions.find((mission) => mission.missionId === selectedId);
    if (meta) selectedMission = meta;
  }

  setStatus(
    `Salvas ${data.saved.length} missão(ões) em phase-battle-overrides.json${
      data.backupPath ? ` · 1 backup` : ''
    }`,
  );
}

async function clearOverride(): Promise<void> {
  if (!selectedId) return;
  if (!confirm('Remover override e voltar ao baseline do catálogo?')) return;
  stashCurrentMissionDraft();
  await api(`/api/mission-battles/${encodeURIComponent(selectedId)}`, {
    method: 'DELETE',
  });
  dirtyMissionIds.delete(selectedId);
  draftsByMissionId.delete(selectedId);
  loadedSnapshotByMissionId.delete(selectedId);
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
  draftsByMissionId.set(selectedId, cloneDraft(draft));
  dirtyMissionIds.add(selectedId);
  setStatus('Rascunho resetado para o baseline (ainda não salvo).');
  renderMissionsEditor();
}

async function restoreBackup(backupId: string): Promise<void> {
  if (!confirm(`Restaurar backup ${backupId}? O arquivo atual será backupado antes.`)) return;
  await api(`/api/mission-battles-backups/${encodeURIComponent(backupId)}/restore`, {
    method: 'POST',
    body: '{}',
  });
  draftsByMissionId.clear();
  loadedSnapshotByMissionId.clear();
  dirtyMissionIds.clear();
  await loadMissionBattlesList();
  if (selectedId) await selectMission(selectedId);
  setStatus(`Backup restaurado: ${backupId}`);
}

function renderEnemyField(selectedId: string, waveIndex: number, slotIndex: number): string {
  const withUrls = enemies.map((enemy) => ({
    ...enemy,
    spriteUrl: enemy.spriteUrl ?? enemySpriteUrlForLab(enemy.id),
  }));
  return `
    <div class="mb-enemy-field" data-wave="${waveIndex}" data-slot="${slotIndex}">
      <input type="hidden" data-field="enemyType" value="${selectedId}" />
      ${enemyTriggerHtml({ enemyId: selectedId, enemies: withUrls })}
    </div>
  `;
}

function renderWaveEditor(wave: WaveDraft, waveIndex: number): string {
  const slots = wave.slots
    .map((slot, slotIndex) => {
      return `
        <div class="mb-slot" data-wave="${waveIndex}" data-slot="${slotIndex}">
          <label class="mb-slot-enemy">inimigo
            ${renderEnemyField(slot.enemyType, waveIndex, slotIndex)}
          </label>
          <label>role
            <select data-field="role">
              ${ROLES.map(
                (role) =>
                  `<option value="${role}" ${slot.role === role ? 'selected' : ''}>${role}</option>`,
              ).join('')}
            </select>
          </label>
          <label>qtd
            <input type="number" min="1" data-field="count" value="${slot.count}" />
          </label>
          <label>nome
            <input type="text" data-field="displayName" value="${slot.displayName ?? ''}" />
          </label>
          <label>level
            <input type="number" data-field="level" value="${slot.level ?? ''}" placeholder="auto" />
          </label>
          <button type="button" class="mb-btn-danger lab-btn--icon" data-action="remove-slot" title="Remover slot">×</button>
        </div>
      `;
    })
    .join('');

  const firstSlot = wave.slots[0];
  const openSimBtn = firstSlot
    ? `<button type="button" class="lab-btn--info"
         data-open-enemy-sim="${firstSlot.enemyType}"
         data-open-enemy-level="${firstSlot.level ?? 1}"
         data-open-enemy-role="${firstSlot.role}"
         title="${wave.slots.length > 1 ? 'Abre o 1º slot da wave' : ''}"
       >▶ Sim${wave.slots.length > 1 ? ' (1º slot)' : ''}</button>`
    : '';

  return `
    <section class="mb-wave" data-wave-index="${waveIndex}">
      <header class="mb-wave-head">
        <strong>Wave ${waveIndex + 1}</strong>
        <label>id <input type="text" data-field="id" value="${wave.id}" /></label>
        <label class="mb-field--gold">ouro × <input type="number" step="0.05" min="0" data-field="goldMultiplier" value="${wave.goldMultiplier ?? 1}" /></label>
        ${openSimBtn}
        <button type="button" class="lab-btn--create" data-action="add-slot">+ slot</button>
        <button type="button" class="mb-btn-danger" data-action="remove-wave">Remover wave</button>
      </header>
      <div class="mb-slots">${slots}</div>
    </section>
  `;
}

function renderList(): string {
  if (missions.length === 0) {
    return `<p class="lab-hint">Nenhuma missão neste filtro. Ajuste capítulo / tipo / mapa / busca.</p>`;
  }
  return `
    <p class="mb-list-count">${missions.length} missão(ões)${
      dirtyMissionCount() > 0 ? ` · <strong>${dirtyMissionCount()} rascunho(s)</strong>` : ''
    }</p>
    <ul class="mb-list">
      ${missions
        .map((mission) => {
          const active = mission.missionId === selectedId ? ' is-active' : '';
          const dirty = dirtyMissionIds.has(mission.missionId)
            ? '<span class="mb-badge mb-badge--dirty">rascunho</span>'
            : '';
          const badge = mission.hasOverride ? '<span class="mb-badge">override</span>' : '';
          const shared =
            mission.sharedMissionIds.length > 0
              ? '<span class="mb-badge mb-badge--shared">shared</span>'
              : '';
          const stars = starsLabel(mission.stars);
          return `
            <li>
              <button type="button" class="mb-list-item${active}${
                dirtyMissionIds.has(mission.missionId) ? ' is-dirty' : ''
              }" data-select-mission="${mission.missionId}">
                <span class="mb-list-kind mb-list-kind--${mission.kind}">${mission.kind}${
                  stars ? ` · <span class="mb-stars">${stars}</span>` : ''
                }</span>
                <span class="mb-list-name">${mission.name}</span>
                <span class="mb-list-meta">${mission.phaseTemplateId} · cap.${mission.chapterMainPhase} · ${mission.waveCount}w ${dirty}${badge}${shared}</span>
              </button>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;
}

function renderSharedNotice(): string {
  if (!selectedMission || selectedMission.sharedMissionIds.length === 0) return '';
  return `
    <p class="mb-shared-note" role="note">
      Esta batalha é compartilhada pelo template <code>${selectedMission.phaseTemplateId}</code>.
      Alterar/salvar afeta também:
      <strong>${selectedMission.sharedMissionIds.join(', ')}</strong>
      (ex.: main e normal no mesmo marco).
    </p>
  `;
}

function renderEditor(): string {
  if (!draft || !selectedId || !selectedMission) {
    return `<p class="lab-hint">Selecione uma missão à esquerda para editar waves e monstros do capítulo.</p>`;
  }

  return `
    <div class="mb-editor-meta">
      <div>
        <strong>${selectedMission.name}</strong>
        <span class="mb-editor-id">${selectedMission.missionId}</span>
      </div>
      <div class="mb-editor-chips">
        <span class="mb-chip mb-chip--kind">${selectedMission.kind}</span>
        <span class="mb-chip mb-chip--map">mapa ${selectedMission.mapId}</span>
        <span class="mb-chip mb-chip--chapter">cap. ${selectedMission.chapterMainPhase} (${selectedMission.chapterMin}–${selectedMission.chapterMax})</span>
        ${
          selectedMission.stars
            ? `<span class="mb-chip mb-chip--stars">${starsLabel(selectedMission.stars)}</span>`
            : ''
        }
      </div>
    </div>
    ${renderSharedNotice()}
    <div class="mb-editor-toolbar">
      <label>Nome da fase
        <input type="text" id="mb-display-name" value="${draft.displayName}" />
      </label>
      <label>statMultiplier
        <input type="number" id="mb-stat-mult" step="0.01" min="0.1" value="${draft.statMultiplier}" />
      </label>
      <button type="button" class="lab-btn--create" id="mb-add-wave">+ wave</button>
      <button type="button" class="lab-btn--primary" id="mb-save" ${
        dirtyMissionCount() === 0 ? 'disabled' : ''
      }>${
        dirtyMissionCount() > 1
          ? `Salvar tudo (${dirtyMissionCount()})`
          : 'Salvar no sistema'
      }</button>
      <span id="mb-dirty-count" class="xp-dirty-count">${
        dirtyMissionCount() > 0 ? `${dirtyMissionCount()} missão(ões) alterada(s)` : ''
      }</span>
      <button type="button" class="lab-btn--warn" id="mb-reset-baseline">Rascunho = baseline</button>
      <button type="button" class="mb-btn-danger" id="mb-clear-override">Apagar override</button>
    </div>
    <div class="mb-json-row">
      <label class="lab-field lab-field--full">JSON da batalha
        <textarea id="mb-json" rows="8" spellcheck="false">${JSON.stringify(draft, null, 2)}</textarea>
      </label>
      <button type="button" class="lab-btn--info" id="mb-apply-json">Aplicar JSON → formulário</button>
    </div>
    <div class="mb-waves">
      ${draft.waves.map((wave, index) => renderWaveEditor(wave, index)).join('')}
    </div>
    <div id="mb-wave-power" class="mb-wave-power">
      <div id="mb-party-editor-wrap">
        ${renderPartyEditorHtml(getReferenceParty())}
      </div>
      <div class="cs-action-row">
        <button type="button" class="lab-btn--info" id="mb-load-wave-power">⚡ Calcular poder das waves</button>
        <span class="cs-sep">·</span>
        ${renderProfileSelectHtml('mb-sim-profile', 'geared')}
        ${renderRunsSelectHtml('mb-sim-runs', 1)}
        <button type="button" class="lab-btn--info" id="mb-load-combat-sim">▶️ Simular combate (real)</button>
      </div>
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
      const enemyType = slotEl.querySelector<HTMLInputElement>('[data-field="enemyType"]');
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
  const touchDraft = (): void => {
    readDraftFromDom(root);
    markCurrentMissionDirtyState();
  };

  root.querySelector('#mb-add-wave')?.addEventListener('click', () => {
    touchDraft();
    draft?.waves.push(emptyWave(draft.waves.length));
    markCurrentMissionDirtyState();
    renderMissionsEditor();
  });

  root.querySelector('#mb-save')?.addEventListener('click', () => {
    void saveAllDirty()
      .then(() => renderMissionsEditor())
      .catch((error: Error) => {
        setStatus(error.message, true);
      });
  });

  root.querySelector('#mb-clear-override')?.addEventListener('click', () => {
    void clearOverride()
      .then(() => renderMissionsEditor())
      .catch((error: Error) => {
        setStatus(error.message, true);
      });
  });

  root.querySelector('#mb-reset-baseline')?.addEventListener('click', () => {
    void resetToBaseline().catch((error: Error) => setStatus(error.message, true));
  });

  root.querySelector('#mb-apply-json')?.addEventListener('click', () => {
    const area = root.querySelector('#mb-json') as HTMLTextAreaElement | null;
    if (!area || !draft) return;
    try {
      const parsed = JSON.parse(area.value) as BattleDraft;
      draft = phaseToDraft(parsed);
      markCurrentMissionDirtyState();
      setStatus('JSON aplicado ao formulário.');
      renderMissionsEditor();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'JSON inválido', true);
    }
  });

  // Bind party editor dentro do painel de wave power
  const partyEditorWrap = root.querySelector<HTMLElement>('#mb-party-editor-wrap');
  if (partyEditorWrap) {
    const editorEl = partyEditorWrap.querySelector<HTMLElement>('#rp-editor');
    if (editorEl) bindPartyEditor(editorEl);
  }

  root.querySelector('#mb-load-wave-power')?.addEventListener('click', () => {
    const phaseId = selectedMission?.phaseTemplateId;
    if (!phaseId) return;
    const container = root.querySelector('#mb-wave-power');
    const resultsId = 'mb-wave-power-results';
    let resultsEl = root.querySelector<HTMLElement>(`#${resultsId}`);
    if (!resultsEl) {
      resultsEl = document.createElement('div');
      resultsEl.id = resultsId;
      container?.appendChild(resultsEl);
    }
    resultsEl.innerHTML = '<p class="lab-hint">Calculando…</p>';

    const party = getReferenceParty();
    const partyParam = partyToQueryParam(party);
    fetch(
      `/api/wave-power?phaseId=${encodeURIComponent(phaseId)}&party=${encodeURIComponent(partyParam)}`,
    )
      .then((res) => res.json())
      .then((data: {
        ok: boolean;
        phaseId: string;
        waves: Array<{ waveIndex: number; enemyCount: number; totalHp: number; totalAttack: number; estimatedEnemyBasicDps: number; referencePartyDps: number; estimatedClearSeconds: number; pressureRatio: number }>;
        phaseClearSeconds: number;
        totalHp: number;
        referencePartyDps: number;
      }) => {
        if (!resultsEl) return;
        if (!(data as { ok?: boolean }).ok) {
          resultsEl.innerHTML = `<p class="lab-hint is-error">Erro: ${(data as { error?: string }).error ?? 'desconhecido'}</p>`;
          return;
        }
        const partyLabelText = partyLabel(party);
        resultsEl.innerHTML = `
          <div class="mb-wave-power-summary">
            <h4>⚡ Poder da fase <code>${data.phaseId}</code></h4>
            <p class="lab-hint lab-hint--tight">Party: ${partyLabelText}</p>
            <div class="lab-totals-row">
              <div class="lab-stat lab-stat--compact lab-stat--hp"><strong>${Math.round(data.totalHp).toLocaleString('pt-BR')}</strong><span>HP total</span></div>
              <div class="lab-stat lab-stat--compact lab-stat--atk"><strong>${Math.round(data.referencePartyDps).toLocaleString('pt-BR')}</strong><span>DPS party</span></div>
              <div class="lab-stat lab-stat--compact lab-stat--speed"><strong>${data.phaseClearSeconds.toFixed(1)}s</strong><span>Limpar fase</span></div>
            </div>
            <table class="ea-table">
              <thead><tr><th>Wave</th><th>Inimigos</th><th>HP total</th><th>DPS inimigos</th><th>Limpar (s)</th><th>Pressão</th></tr></thead>
              <tbody>
                ${data.waves.map((w) => `<tr>
                  <td>${w.waveIndex + 1}</td>
                  <td>${w.enemyCount}</td>
                  <td>${Math.round(w.totalHp).toLocaleString('pt-BR')}</td>
                  <td>${Math.round(w.estimatedEnemyBasicDps).toLocaleString('pt-BR')}</td>
                  <td>${w.estimatedClearSeconds.toFixed(1)}</td>
                  <td>${(w.pressureRatio * 100).toFixed(0)}%</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>`;
      })
      .catch((err: Error) => {
        if (resultsEl) resultsEl.innerHTML = `<p class="lab-hint">Erro ao calcular poder: ${err.message}</p>`;
      });
  });

  root.querySelector('#mb-load-combat-sim')?.addEventListener('click', () => {
    const phaseId = selectedMission?.phaseTemplateId;
    if (!phaseId) return;
    const container = root.querySelector<HTMLElement>('#mb-wave-power');
    const resultsId = 'mb-combat-sim-results';
    let resultsEl = root.querySelector<HTMLElement>(`#${resultsId}`);
    if (!resultsEl) {
      resultsEl = document.createElement('div');
      resultsEl.id = resultsId;
      container?.appendChild(resultsEl);
    }
    resultsEl.innerHTML = '<p class="lab-hint">Simulando…</p>';
    const runs = readRunsSelect(root, 'mb-sim-runs');
    const profile = readProfileSelect(root, 'mb-sim-profile');
    void fetchCombatSim({ phaseId, party: getRefPartyForApi(), profile, runs, seed: 1 })
      .then((data) => { if (resultsEl) renderSimResult(resultsEl, data, runs, phaseId); })
      .catch((err: Error) => { if (resultsEl) resultsEl.innerHTML = `<p class="lab-hint is-error">Erro: ${err.message}</p>`; });
  });

  // Abrir primeiro inimigo de cada wave no Simulador
  root.querySelectorAll<HTMLButtonElement>('[data-open-enemy-sim]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const enemyType = btn.dataset.openEnemySim ?? '';
      const level = parseInt(btn.dataset.openEnemyLevel ?? '1', 10) || 1;
      const role = (btn.dataset.openEnemyRole ?? 'trash') as 'trash' | 'elite' | 'boss';
      openEnemyInSimulator(enemyType, level, role);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-action="add-slot"]').forEach((button) => {
    button.addEventListener('click', () => {
      const wi = Number(button.closest<HTMLElement>('.mb-wave')?.dataset.waveIndex);
      touchDraft();
      draft?.waves[wi]?.slots.push(emptySlot());
      markCurrentMissionDirtyState();
      renderMissionsEditor();
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-action="remove-slot"]').forEach((button) => {
    button.addEventListener('click', () => {
      const slotEl = button.closest<HTMLElement>('.mb-slot');
      const wi = Number(slotEl?.dataset.wave);
      const si = Number(slotEl?.dataset.slot);
      touchDraft();
      const wave = draft?.waves[wi];
      if (!wave || wave.slots.length <= 1) return;
      wave.slots.splice(si, 1);
      markCurrentMissionDirtyState();
      renderMissionsEditor();
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-action="remove-wave"]').forEach((button) => {
    button.addEventListener('click', () => {
      touchDraft();
      if (!draft || draft.waves.length <= 1) return;
      const wi = Number(button.closest<HTMLElement>('.mb-wave')?.dataset.waveIndex);
      draft.waves.splice(wi, 1);
      markCurrentMissionDirtyState();
      renderMissionsEditor();
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-action="open-enemy-picker"]').forEach((button) => {
    button.addEventListener('click', () => {
      const field = button.closest<HTMLElement>('.mb-enemy-field');
      if (!field || !draft) return;
      const wi = Number(field.dataset.wave);
      const si = Number(field.dataset.slot);
      const slot = draft.waves[wi]?.slots[si];
      if (!slot) return;
      const withUrls = enemies.map((enemy) => ({
        ...enemy,
        spriteUrl: enemy.spriteUrl ?? enemySpriteUrlForLab(enemy.id),
      }));
      openEnemyPicker({
        enemies: withUrls,
        selectedId: slot.enemyType,
        onPick: (enemyId) => {
          readDraftFromDom(root);
          const current = draft?.waves[wi]?.slots[si];
          if (!current) return;
          current.enemyType = enemyId;
          markCurrentMissionDirtyState();
          renderMissionsEditor();
        },
      });
    });
  });

  root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    '#mb-display-name, #mb-stat-mult, #mb-json, .mb-wave input, .mb-wave select',
  ).forEach((input) => {
    input.addEventListener('input', () => touchDraft());
    input.addEventListener('change', () => touchDraft());
  });

  root.querySelectorAll<HTMLImageElement>('img[data-enemy-thumb]').forEach(bindSpriteFallback);
}

function reloadListAndRender(): void {
  stashCurrentMissionDraft();
  void loadMissionBattlesList()
    .then(() => renderMissionsEditor())
    .catch((error: Error) => setStatus(error.message, true));
}

export function renderMissionsEditor(): void {
  const host = document.getElementById('lab-missions');
  if (!host) return;
  setWorkspaceDirty('missions', dirtyMissionCount());
  withPreservedScroll(host, ['.mb-sidebar', '.mb-main'], () => renderMissionsEditorInto(host));
}

function renderMissionsEditorInto(host: HTMLElement): void {
  const mapOptions = maps.length > 0 ? maps : [...new Set(missions.map((m) => m.mapId))].sort();

  const backupOptions =
    backups.length === 0
      ? '<option value="">(nenhum backup ainda)</option>'
      : backups
          .map((backup) => `<option value="${backup.id}">${backup.id}</option>`)
          .join('');

  host.innerHTML = `
    <div class="mb-layout">
      <aside class="mb-sidebar">
        <p class="lab-hint mb-intro">
          Filtre pelo <strong>capítulo da main</strong> (ex.: Cap. 1 = fases 1–5) para calibrar normais/sides daquele arco.
          Overrides gravam por <code>phaseTemplateId</code>.
        </p>
        <div class="mb-filters">
          <label>Capítulo
            <select id="mb-filter-chapter">
              <option value="" ${filterChapter === '' ? 'selected' : ''}>Todos</option>
              ${chapters
                .map(
                  (chapter) =>
                    `<option value="${chapter.mainPhase}" ${
                      filterChapter === String(chapter.mainPhase) ? 'selected' : ''
                    }>${chapter.label}</option>`,
                )
                .join('')}
            </select>
          </label>
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
              ${mapOptions
                .map(
                  (mapId) =>
                    `<option value="${mapId}" ${filterMap === mapId ? 'selected' : ''}>${mapId}</option>`,
                )
                .join('')}
            </select>
          </label>
          <label>Busca
            <input type="search" id="mb-filter-q" placeholder="id, nome ou fase" value="${filterQuery.replace(/"/g, '&quot;')}" />
          </label>
        </div>
        ${renderSweepPanelHtml(filterMap)}
        ${renderList()}
        <div class="mb-backups">
          <h3>Backups</h3>
          <p class="lab-hint">Salve várias missões de uma vez — gera 1 backup por save em lote.</p>
          <label>Arquivo
            <select id="mb-backup-select">${backupOptions}</select>
          </label>
          <button type="button" class="lab-btn--info" id="mb-restore-backup">Restaurar selecionado</button>
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
    reloadListAndRender();
  });

  host.querySelector('#mb-filter-map')?.addEventListener('change', (event) => {
    filterMap = (event.target as HTMLSelectElement).value;
    reloadListAndRender();
  });

  host.querySelector('#mb-filter-chapter')?.addEventListener('change', (event) => {
    filterChapter = (event.target as HTMLSelectElement).value;
    reloadListAndRender();
  });

  const searchInput = host.querySelector('#mb-filter-q') as HTMLInputElement | null;
  const applySearch = debounce(() => {
    filterQuery = searchInput?.value ?? '';
    reloadListAndRender();
  });
  searchInput?.addEventListener('input', applySearch);
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      filterQuery = searchInput.value;
      reloadListAndRender();
    }
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

  bindSweepPanel(host, () => filterMap);

  bindEditor(host);
}

export async function mountMissionsTab(): Promise<void> {
  registerWorkspaceSave('missions', saveAllDirty);
  await loadMissionBattlesList();
  renderMissionsEditor();
}
