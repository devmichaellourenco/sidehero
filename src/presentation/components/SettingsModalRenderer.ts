import { GamePreferences } from './GamePreferences';

export type SettingsModalHandlers = {
  onPreferenceChange: <K extends keyof GamePreferences>(
    key: K,
    value: GamePreferences[K],
  ) => void;
};

export class SettingsModalRenderer {
  render(
    container: HTMLElement,
    preferences: GamePreferences,
    handlers: SettingsModalHandlers,
  ): void {
    container.innerHTML = `
      <p class="settings-intro">Ajuste automações e exibição do painel.</p>
      <div class="settings-list">
        <label class="settings-item">
          <input type="checkbox" data-pref="autoBattle" ${preferences.autoBattle ? 'checked' : ''} />
          <span class="settings-item-text">
            <strong>Auto-batalha</strong>
            <small>Avança batalhas automaticamente</small>
          </span>
        </label>
        <label class="settings-item">
          <input type="checkbox" data-pref="autoOpenChests" ${preferences.autoOpenChests ? 'checked' : ''} />
          <span class="settings-item-text">
            <strong>Auto-abrir baús</strong>
            <small>Abre baús assim que estiverem disponíveis</small>
          </span>
        </label>
        <label class="settings-item">
          <input type="checkbox" data-pref="autoEquipLoot" ${preferences.autoEquipLoot ? 'checked' : ''} />
          <span class="settings-item-text">
            <strong>Auto-equipar loot</strong>
            <small>Equipa itens recomendados sem abrir modal</small>
          </span>
        </label>
        <label class="settings-item">
          <input type="checkbox" data-pref="logFilterImportant" ${preferences.logFilterImportant ? 'checked' : ''} />
          <span class="settings-item-text">
            <strong>Log resumido</strong>
            <small>Mostra só vitórias, baús e equipamentos</small>
          </span>
        </label>
        <label class="settings-item settings-item-select">
          <span class="settings-item-text">
            <strong>Velocidade da auto-batalha</strong>
            <small>Intervalo entre ticks automáticos</small>
          </span>
          <select data-pref="autoBattleSpeed" class="settings-speed-select" aria-label="Velocidade da auto-batalha">
            <option value="1" ${preferences.autoBattleSpeed === 1 ? 'selected' : ''}>1x</option>
            <option value="2" ${preferences.autoBattleSpeed === 2 ? 'selected' : ''}>2x</option>
          </select>
        </label>
      </div>
      <p class="settings-hint">Atalho: <kbd>Espaço</kbd> avança batalha (com painel focado)</p>
    `;

    container.querySelectorAll('[data-pref]').forEach((element) => {
      const key = element.getAttribute('data-pref') as keyof GamePreferences;
      if (!key) return;

      const eventName = element instanceof HTMLSelectElement ? 'change' : 'change';
      element.addEventListener(eventName, () => {
        if (element instanceof HTMLInputElement && element.type === 'checkbox') {
          handlers.onPreferenceChange(key, element.checked as GamePreferences[typeof key]);
          return;
        }

        if (element instanceof HTMLSelectElement && key === 'autoBattleSpeed') {
          const speed = Number(element.value) === 2 ? 2 : 1;
          handlers.onPreferenceChange('autoBattleSpeed', speed);
        }
      });
    });
  }
}
