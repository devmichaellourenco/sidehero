# 063 — Ícones de skills no battle strip

## Problema

A telegrafia de skills com **nome em texto** empurrava heróis/inimigos para fora da área visível do battle strip.

## Solução

### 1. Ícones no lugar de texto
- `SkillIconCatalog.ts` — mapeia cada `skillId` para ícones reutilizados de `ASSETS.skills`
- `CombatSkillIntentPresentation.ts` — renderiza só ícone (+ badge de cooldown nos carregando)
- Tooltip via `title`/`aria-label` com nome da skill

### 2. Ajuste de layout
- `.battle-strip`: `96px` → `122px`
- `.heroes-panel`: `flex: 1` → `flex: 0.72`, `max-height: 38vh`

### Mapeamento de ícones (placeholder)

| Tipo | Asset |
|------|-------|
| Ataque físico | `ui/attack.png` |
| Magia | `ui/energy.png` |
| Cura | `ui/health.png` |
| Buff/Debuff | `ui/defense.png` |
| Golpe de arma | `gear/weapon.png` |

### Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `AssetCatalog.ts` | Seção `skills` no catálogo de recursos |
| `SkillIconCatalog.ts` | Mapeamento skillId → ícone + nome para tooltip |
| `CombatSkillIntentPresentation.ts` | UI compacta com ícones |
| `CombatSkillIntent*.ts` | `skillId` nas skills em cooldown |
| `panel.css` | Alturas e estilos dos ícones |

## Validação

```bash
npm test
npm run build
```

## Reflexão

Reutilizar ícones de UI reduz altura sem nova arte. O catálogo centralizado facilita trocar por sprites exclusivos depois — basta alterar `SkillIconCatalog` e adicionar PNGs em `panel/assets/skills/`.
