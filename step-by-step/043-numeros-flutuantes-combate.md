# 043 — Números flutuantes de dano e cura na battle strip

## Objetivo
Exibir valores de dano (vermelho) e cura (verde) subindo acima do herói ou inimigo afetado a cada tick de combate, com animação curta e cores harmônicas ao tema.

## Domínio

### `CombatFloatingEvent.ts`
- Tipos `CombatFloatingEvent`, helpers `createDamageEvent` e `createHealEvent` com delta real de HP.

### Pipeline de combate
- **`CombatActionExecutor`**: emite floats em ataque, skill de dano e cura.
- **`HeroActionPhase`**: agrega `floatingEvents` de cada ação.
- **`EnemyCounterPhase`**: um float de dano por herói atingido no contra-ataque.
- **`CombatPipeline`** + **`ICombatService`**: propagam `floatingEvents` no `CombatTickResult`.

## Aplicação
- **`CombatFloatingEventDto`**: DTO para a UI.
- **`TickGameUseCase`**: retorna `{ state, combatFloats }` acumulando eventos de múltiplos ticks.

## Infraestrutura
- **`GameMessageBus`**: resposta `TICK` inclui `combatFloats?`.
- **`service-worker`**: repassa `combatFloats` ao painel.

## Apresentação

### `BattleFloatingTextController.ts`
- Camada `#battle-float-layer` sobre a battle strip.
- Ancora em `[data-float-anchor]` nos sprites; texto `-N` / `+N`; remove após ~900 ms.

### Marcadores HTML
- `data-hero-id` / `data-enemy-id` nos cards.
- `data-float-anchor="hero|enemy"` nos sprites.

### `panel.css`
- `.battle-float--damage`: `#ff6b7f` (tom do `--accent`).
- `.battle-float--heal`: `#6fe3a0` (verde alinhado ao fill de HP dos heróis).
- Animação `battle-float-rise`: sobe ~28px e desvanece.

### `GameViewController`
- Após `render()` no `tick()`, chama `showCombatFloats(response.combatFloats)`.

## Validação
```bash
npm test
npm run build
```
Recarregar extensão: avançar batalha — dano no inimigo e nos heróis em vermelho; cura do priest em verde.
