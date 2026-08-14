/**
 * Aba Manutenção do Balance Lab.
 *
 * Funcionalidades:
 *  - Promoção segura de overrides para catálogo canônico (JSON-backed e TS-backed)
 *  - Histórico de backups com diff entre dois snapshots
 */

const SCOPE_LABELS: Record<string, string> = {
  'gear-items': 'Itens (gear-items.catalog.json)',
  shops: 'Lojas (shops.catalog.json)',
  'phase-battle': 'Batalhas de missão (TS-backed — revisão manual)',
  'phase-reward': 'Recompensas de fase (TS-backed — revisão manual)',
  'hero-combat': 'Personagens (TS-backed — revisão manual)',
  'hero-level-xp': 'XP por nível (TS-backed — revisão manual)',
  'enemy-combat': 'Inimigos (TS-backed — revisão manual)',
  upgrades: 'Melhorias (TS-backed — revisão manual)',
};

const JSON_BACKED = new Set(['gear-items', 'shops']);

type DiffEntry = {
  path: string;
  before: unknown;
  after: unknown;
  kind: 'added' | 'removed' | 'changed';
};

type DiffResult = {
  added: DiffEntry[];
  removed: DiffEntry[];
  changed: DiffEntry[];
};

let maintenanceMounted = false;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getStatusEl(): HTMLElement | null {
  return document.getElementById('maint-status');
}

function setStatus(msg: string, isError = false): void {
  const el = getStatusEl();
  if (!el) return;
  el.textContent = msg;
  el.className = `lab-status${isError ? ' is-error' : ''}`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function valueLabel(v: unknown): string {
  if (v === undefined) return '—';
  if (typeof v === 'string') return `"${escapeHtml(v)}"`;
  return escapeHtml(JSON.stringify(v) ?? '—');
}

// ── Promoção ─────────────────────────────────────────────────────────────────

async function fetchPreview(scope: string): Promise<void> {
  const container = document.getElementById('maint-preview-result');
  if (!container) return;
  container.innerHTML = '<p class="lab-hint">Carregando preview…</p>';

  try {
    const res = await fetch(`/api/promotion/preview?scope=${encodeURIComponent(scope)}`);
    const data = await res.json();

    if (!data.ok) {
      container.innerHTML = `<p class="lab-status is-error">${escapeHtml(data.error ?? 'Erro desconhecido')}</p>`;
      return;
    }

    if (data.tsBackedOnly) {
      const patchStr = JSON.stringify(data.patchJson, null, 2);
      container.innerHTML = `
        <div class="maint-ts-notice">
          <p class="lab-status is-error">
            ⚠ Catálogo TS-backed — <strong>revisão manual necessária</strong>.
            Copie o patch abaixo e aplique no arquivo TypeScript correspondente.
          </p>
          <p class="lab-hint">Chaves do override: ${escapeHtml((data.overrideKeys ?? []).join(', ') || '(vazio)')}</p>
          <button type="button" class="lab-btn--info" id="btn-copy-patch">Copiar patch JSON</button>
          <pre class="maint-patch-code">${escapeHtml(patchStr)}</pre>
        </div>
      `;
      document.getElementById('btn-copy-patch')?.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(patchStr);
          setStatus('Patch copiado!');
        } catch {
          setStatus('Não foi possível copiar.', true);
        }
      });
      return;
    }

    const diff: DiffResult = data.diff ?? { added: [], removed: [], changed: [] };
    const total = diff.added.length + diff.removed.length + diff.changed.length;

    if (total === 0) {
      container.innerHTML = `<p class="lab-hint">Nenhuma diferença encontrada. Override já está refletido no catálogo ou vazio.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="maint-diff-summary">
        <span class="maint-diff-badge maint-diff-badge--added">${diff.added.length} adicionados</span>
        <span class="maint-diff-badge maint-diff-badge--removed">${diff.removed.length} removidos</span>
        <span class="maint-diff-badge maint-diff-badge--changed">${diff.changed.length} alterados</span>
      </div>
      <div class="maint-diff-table-wrap">
        <table class="maint-diff-table">
          <thead><tr><th>Tipo</th><th>Caminho</th><th>Antes</th><th>Depois</th></tr></thead>
          <tbody>
            ${[...diff.added, ...diff.changed, ...diff.removed]
              .map(
                (entry) => `
              <tr class="maint-diff-row maint-diff-row--${entry.kind}">
                <td><span class="maint-diff-kind">${entry.kind}</span></td>
                <td class="maint-diff-path"><code>${escapeHtml(entry.path)}</code></td>
                <td class="maint-diff-val">${valueLabel(entry.before)}</td>
                <td class="maint-diff-val">${valueLabel(entry.after)}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <div class="maint-apply-row">
        <button type="button" class="lab-btn--warn" id="btn-apply-promotion" data-scope="${escapeHtml(scope)}">
          Aplicar ao catálogo e limpar override
        </button>
        <p class="lab-hint maint-apply-warning">
          ⚠ Ação irreversível (backup automático criado). Confirme antes de prosseguir.
        </p>
      </div>
    `;

    document.getElementById('btn-apply-promotion')?.addEventListener('click', () => {
      void applyPromotion(scope);
    });
  } catch (err) {
    container.innerHTML = `<p class="lab-status is-error">${escapeHtml(String(err))}</p>`;
  }
}

async function applyPromotion(scope: string): Promise<void> {
  const confirmed = window.confirm(
    `Incorporar os overrides de "${SCOPE_LABELS[scope] ?? scope}" ao catálogo JSON canônico?\n\n` +
      'Um backup de ambos os arquivos será criado. O override será zerado após a promoção.\n\n' +
      'Confirmar?',
  );
  if (!confirmed) return;

  setStatus('Aplicando promoção…');
  try {
    const res = await fetch('/api/promotion/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope, confirmed: true }),
    });
    const data = await res.json();

    if (!data.ok) {
      setStatus(`Erro: ${data.error ?? 'Falha'}`, true);
      return;
    }

    const container = document.getElementById('maint-preview-result');
    if (container) {
      const total =
        (data.diff?.added?.length ?? 0) +
        (data.diff?.removed?.length ?? 0) +
        (data.diff?.changed?.length ?? 0);
      container.innerHTML = `
        <div class="maint-success">
          <p class="lab-status">✓ Promoção aplicada com sucesso em ${data.promotedAt ?? ''}.</p>
          <p class="lab-hint">${total} alterações incorporadas ao catálogo.</p>
          <p class="lab-hint">Backup do catálogo: <code>${escapeHtml(String(data.backupCatalogPath ?? '—'))}</code></p>
          <p class="lab-hint">Backup do override: <code>${escapeHtml(String(data.backupOverridePath ?? '—'))}</code></p>
          <p class="lab-hint lab-hint--tight">Faça rebuild da extensão para aplicar as mudanças ao jogo.</p>
        </div>
      `;
    }
    setStatus('Promoção aplicada.');
  } catch (err) {
    setStatus(`Erro: ${String(err)}`, true);
  }
}

// ── Diff de backups ───────────────────────────────────────────────────────────

async function loadBackupsForScope(scope: string): Promise<Array<{ id: string; path: string }>> {
  const res = await fetch(`/api/backups?scope=${encodeURIComponent(scope)}`);
  const data = await res.json();
  return data.ok ? (data.backups ?? []) : [];
}

async function fetchBackupDiff(): Promise<void> {
  const scopeSelect = document.getElementById('maint-diff-scope') as HTMLSelectElement | null;
  const aSelect = document.getElementById('maint-diff-a') as HTMLSelectElement | null;
  const bSelect = document.getElementById('maint-diff-b') as HTMLSelectElement | null;
  const container = document.getElementById('maint-diff-result');
  if (!scopeSelect || !aSelect || !bSelect || !container) return;

  const scope = scopeSelect.value;
  const a = aSelect.value;
  const b = bSelect.value;

  if (!a || !b) {
    setStatus('Selecione dois backups para comparar.', true);
    return;
  }
  if (a === b) {
    setStatus('Selecione backups diferentes para comparar.', true);
    return;
  }

  container.innerHTML = '<p class="lab-hint">Calculando diff…</p>';
  try {
    const url = `/api/backups/diff?scope=${encodeURIComponent(scope)}&a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) {
      container.innerHTML = `<p class="lab-status is-error">${escapeHtml(data.error ?? 'Erro')}</p>`;
      return;
    }

    const diff: DiffResult = data.diff ?? { added: [], removed: [], changed: [] };
    const total = diff.added.length + diff.removed.length + diff.changed.length;

    if (total === 0) {
      container.innerHTML = `<p class="lab-hint">Snapshots idênticos — sem diferenças.</p>`;
      return;
    }

    container.innerHTML = `
      <div class="maint-diff-summary">
        <span class="maint-diff-badge maint-diff-badge--added">${diff.added.length} adicionados</span>
        <span class="maint-diff-badge maint-diff-badge--removed">${diff.removed.length} removidos</span>
        <span class="maint-diff-badge maint-diff-badge--changed">${diff.changed.length} alterados</span>
      </div>
      <div class="maint-diff-table-wrap">
        <table class="maint-diff-table">
          <thead><tr><th>Tipo</th><th>Caminho</th><th>${escapeHtml(a)} (A)</th><th>${escapeHtml(b)} (B)</th></tr></thead>
          <tbody>
            ${[...diff.added, ...diff.changed, ...diff.removed]
              .map(
                (entry) => `
              <tr class="maint-diff-row maint-diff-row--${entry.kind}">
                <td><span class="maint-diff-kind">${entry.kind}</span></td>
                <td class="maint-diff-path"><code>${escapeHtml(entry.path)}</code></td>
                <td class="maint-diff-val">${valueLabel(entry.before)}</td>
                <td class="maint-diff-val">${valueLabel(entry.after)}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p class="lab-status is-error">${escapeHtml(String(err))}</p>`;
  }
}

async function updateBackupSelects(scope: string): Promise<void> {
  const aSelect = document.getElementById('maint-diff-a') as HTMLSelectElement | null;
  const bSelect = document.getElementById('maint-diff-b') as HTMLSelectElement | null;
  if (!aSelect || !bSelect) return;

  const backups = await loadBackupsForScope(scope);
  const opts =
    backups.length === 0
      ? `<option value="">Nenhum backup disponível</option>`
      : backups.map((b) => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.id)}</option>`).join('');

  aSelect.innerHTML = `<option value="">— selecione A —</option>${opts}`;
  bSelect.innerHTML = `<option value="">— selecione B —</option>${opts}`;

  const container = document.getElementById('maint-diff-result');
  if (container) container.innerHTML = '';
}

// ── Render da aba ─────────────────────────────────────────────────────────────

function renderMaintenanceTab(): void {
  const host = document.getElementById('lab-maintenance');
  if (!host) return;

  const scopeOptionsHtml = Object.entries(SCOPE_LABELS)
    .map(([id, label]) => {
      const badge = JSON_BACKED.has(id) ? ' ✓' : ' (manual)';
      return `<option value="${escapeHtml(id)}">${escapeHtml(label)}${badge}</option>`;
    })
    .join('');

  host.innerHTML = `
    <section class="maint-section">
      <h2 class="lab-panel-title">Manutenção<span>promoção, backups e diff</span></h2>

      <!-- Promoção de overrides -->
      <div class="maint-card">
        <h3>Promoção de overrides para catálogo canônico</h3>
        <p class="lab-hint">
          Scopes <strong>JSON-backed</strong> (✓) permitem promoção automática com backup + diff.
          Scopes TS-backed (manual) geram patch JSON para revisão manual — <strong>nunca sobrescrevem</strong> arquivos TypeScript.
        </p>
        <div class="maint-form-row">
          <label class="lab-field">
            <span class="lab-field-name">Scope</span>
            <select id="maint-promo-scope">${scopeOptionsHtml}</select>
          </label>
          <button type="button" class="lab-btn--info" id="btn-preview-promotion">
            Preview / Gerar patch
          </button>
        </div>
        <div id="maint-preview-result"></div>
      </div>

      <!-- Histórico de backups e diff -->
      <div class="maint-card">
        <h3>Histórico de backups e diff</h3>
        <p class="lab-hint">Compare dois snapshots de backup. Selecione o scope, depois os backups A e B.</p>
        <div class="maint-form-row">
          <label class="lab-field">
            <span class="lab-field-name">Scope</span>
            <select id="maint-diff-scope">${scopeOptionsHtml}</select>
          </label>
          <button type="button" class="lab-btn--info" id="btn-load-backups">Carregar backups</button>
        </div>
        <div class="maint-form-row">
          <label class="lab-field">
            <span class="lab-field-name">Backup A (antes)</span>
            <select id="maint-diff-a"><option value="">— carregue primeiro —</option></select>
          </label>
          <label class="lab-field">
            <span class="lab-field-name">Backup B (depois)</span>
            <select id="maint-diff-b"><option value="">— carregue primeiro —</option></select>
          </label>
        </div>
        <div class="maint-form-row">
          <button type="button" class="lab-btn--primary" id="btn-diff-backups">Comparar</button>
        </div>
        <div id="maint-diff-result"></div>
      </div>

      <p id="maint-status" class="lab-status" role="status"></p>
    </section>
  `;

  // Eventos — promoção
  document.getElementById('btn-preview-promotion')?.addEventListener('click', () => {
    const scope = (document.getElementById('maint-promo-scope') as HTMLSelectElement)?.value;
    if (scope) void fetchPreview(scope);
  });

  // Eventos — diff de backups
  document.getElementById('btn-load-backups')?.addEventListener('click', async () => {
    const scope = (document.getElementById('maint-diff-scope') as HTMLSelectElement)?.value;
    if (scope) await updateBackupSelects(scope);
  });

  document.getElementById('btn-diff-backups')?.addEventListener('click', () => {
    void fetchBackupDiff();
  });
}

// ── Ponto de entrada ──────────────────────────────────────────────────────────

export async function mountMaintenanceTab(): Promise<void> {
  if (maintenanceMounted) return;
  maintenanceMounted = true;
  renderMaintenanceTab();
}
