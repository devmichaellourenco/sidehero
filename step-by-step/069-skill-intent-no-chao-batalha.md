# 069 — Ícone de próxima skill no chão do battle strip

## Objetivo

Mover o indicador de próxima skill para **abaixo da barra de vida**, no espaço visual do chão (`.strip-floor`), sem deslocar sprites de heróis/inimigos.

## Solução

### 1. Reordenação do DOM
- `HeroBattlePresentation.ts` / `EnemyBattlePresentation.ts`: ordem passa a ser sprite → status → vida → skill intent
- O slot de skill fica fora do fluxo vertical principal via CSS absoluto

### 2. Slot no chão
- `CombatSkillIntentPresentation.ts`: envolve intent + charging em `.combat-skill-floor-slot`
- Posicionamento `absolute` com `top: 100%` (logo abaixo da vida), centralizado no card

### 3. Chão mais alto + atores elevados
- `.strip-floor`: `14px` → `28px` (`--strip-floor-height`, ajustado em etapas)
- Heróis/inimigos: `bottom` passa a usar `--strip-actors-bottom` (= chão + 2px de folga)
- Ícone da skill: `--strip-floor-skill-inset: 4px` de margem inferior; slot ancorado no chão via `bottom` negativo calculado

### Variáveis em `.battle-strip`

| Variável | Valor | Função |
|----------|-------|--------|
| `--strip-floor-height` | 28px | Altura visual do chão |
| `--strip-actor-gap` | 2px | Folga entre pés e topo do chão |
| `--strip-actors-bottom` | 30px | Offset de heróis/inimigos (chão + folga) |
| `--strip-floor-skill-inset` | 4px | Margem inferior do ícone |
| `--strip-floor-skill-zone` | 16px | Altura do slot do ícone |

### Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `CombatSkillIntentPresentation.ts` | Wrapper `.combat-skill-floor-slot` |
| `HeroBattlePresentation.ts` | Skill intent após barra de vida |
| `EnemyBattlePresentation.ts` | Idem |
| `panel.css` | Chão maior + posicionamento do slot |

## Validação

```bash
npm test
npm run build
```
