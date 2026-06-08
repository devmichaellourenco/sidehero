import { GameStateDto } from '../../application/dto/GameStateDto';
import { GamePreferences } from './GamePreferences';
import { FeatureGate } from './FeatureGate';

export type SettingsModalHandlers = {
  onPreferenceChange: <K extends keyof GamePreferences>(
    key: K,
    value: GamePreferences[K],
  ) => void;
  onOpenUpgrades: () => void;
};

export class SettingsModalRenderer {
  render(
    container: HTMLElement,
    state: GameStateDto,
    preferences: GamePreferences,
    handlers: SettingsModalHandlers,
  ): void {
    container.innerHTML = `
      <p class="settings-intro">Ligue automações já desbloqueadas em Melhorias.</p>
      <div class="settings-list">
        ${this.renderToggle({
          key: 'autoBattle',
          title: 'Auto-batalha',
          hint: 'Avança batalhas automaticamente',
          unlocked: FeatureGate.canUseAutoBattle(state),
          checked: preferences.autoBattle,
        })}
        ${this.renderToggle({
          key: 'autoOpenChests',
          title: 'Auto-abrir baús',
          hint: 'Abre baús assim que estiverem disponíveis',
          unlocked: FeatureGate.canUseAutoOpenChests(state),
          checked: preferences.autoOpenChests,
        })}
        ${this.renderToggle({
          key: 'autoEquipLoot',
          title: 'Auto-equipar loot',
          hint: 'Equipa itens recomendados sem abrir modal',
          unlocked: FeatureGate.canUseAutoEquipLoot(state),
          checked: preferences.autoEquipLoot,
        })}
        ${this.renderToggle({
          key: 'logFilterImportant',
          title: 'Log resumido',
          hint: 'Mostra só vitórias, baús e equipamentos',
          unlocked: FeatureGate.canUseLogFilter(state),
          checked: preferences.logFilterImportant,
        })}
        ${this.renderSpeedSelect(state, preferences)}
      </div>
      <p class="settings-hint">Atalho: <kbd>Espaço</kbd> avança batalha (com painel focado)</p>
    `;

    container.querySelectorAll('[data-pref]').forEach((element) => {
      const key = element.getAttribute('data-pref') as keyof GamePreferences;
      if (!key) return;

      if (element instanceof HTMLInputElement && element.type === 'checkbox') {
        if (element.disabled) return;
        element.addEventListener('change', () => {
          handlers.onPreferenceChange(key, element.checked as GamePreferences[typeof key]);
        });
        return;
      }

      if (element instanceof HTMLSelectElement && key === 'autoBattleSpeed') {
        if (element.disabled) return;
        element.addEventListener('change', () => {
          const speed = Number(element.value) === 3 ? 3 : Number(element.value) === 2 ? 2 : 1;
          handlers.onPreferenceChange('autoBattleSpeed', speed as GamePreferences['autoBattleSpeed']);
        });
      }
    });

    container.querySelector('[data-open-upgrades]')?.addEventListener('click', () => {
      handlers.onOpenUpgrades();
    });
  }

  private renderToggle(options: {
    key: keyof GamePreferences;
    title: string;
    hint: string;
    unlocked: boolean;
    checked: boolean;
  }): string {
    if (!options.unlocked) {
      return `
        <div class="settings-item settings-item-locked">
          <span class="settings-item-text">
            <strong>${options.title}</strong>
            <small>Desbloqueie em <button type="button" class="settings-link-btn" data-open-upgrades>Melhorias</button></small>
          </span>
        </div>
      `;
    }

    return `
      <label class="settings-item">
        <input type="checkbox" data-pref="${options.key}" ${options.checked ? 'checked' : ''} />
        <span class="settings-item-text">
          <strong>${options.title}</strong>
          <small>${options.hint}</small>
        </span>
      </label>
    `;
  }

  private renderSpeedSelect(state: GameStateDto, preferences: GamePreferences): string {
    const maxSpeed = FeatureGate.maxAutoBattleSpeed(state);
    if (!FeatureGate.canUseAutoBattle(state)) {
      return `
        <div class="settings-item settings-item-locked settings-item-select">
          <span class="settings-item-text">
            <strong>Velocidade da auto-batalha</strong>
            <small>Desbloqueie auto-batalha em Melhorias</small>
          </span>
        </div>
      `;
    }

    const options = [
      { value: 1, label: '1x', enabled: true },
      { value: 2, label: '2x', enabled: maxSpeed >= 2 },
      { value: 3, label: '3x', enabled: maxSpeed >= 3 },
    ];

    const selected = Math.min(preferences.autoBattleSpeed, maxSpeed);

    return `
      <label class="settings-item settings-item-select">
        <span class="settings-item-text">
          <strong>Velocidade da auto-batalha</strong>
          <small>Intervalo entre ticks automáticos</small>
        </span>
        <select data-pref="autoBattleSpeed" class="settings-speed-select" aria-label="Velocidade da auto-batalha">
          ${options
            .map(
              (option) => `
                <option value="${option.value}" ${selected === option.value ? 'selected' : ''} ${option.enabled ? '' : 'disabled'}>
                  ${option.label}${option.enabled ? '' : ' (bloqueado)'}
                </option>
              `,
            )
            .join('')}
        </select>
      </label>
    `;
  }
}
