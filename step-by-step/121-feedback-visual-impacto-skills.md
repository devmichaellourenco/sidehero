# 121 — Feedback visual de impacto nas skills

## Objetivo

Além dos números flutuantes, exibir ícone/imagem no personagem afetado quando uma skill causa dano, cura ou aplica buff/debuff (incluindo efeitos de área).

## Arquivos alterados

### Domínio

| Arquivo | Função |
|---------|--------|
| `src/domain/services/combat/CombatFloatingEvent.ts` | Tipos `buff` e `debuff` em `CombatFloatKind`; helper `createStatusImpactEvent()` para emitir evento por alvo |
| `src/domain/services/combat/CombatActionExecutor.ts` | Em `applyStatusEffect()`, gera `floatingEvents` com ícone de buff/debuff para cada alvo da área |

### Aplicação

| Arquivo | Função |
|---------|--------|
| `src/application/dto/CombatFloatingEventDto.ts` | DTO alinhado com os novos kinds `buff` e `debuff` |

### Apresentação

| Arquivo | Função |
|---------|--------|
| `src/presentation/components/BattleImpactFeedbackController.ts` | **Novo.** Localiza o card do alvo (`data-hero-id` / `data-enemy-id`), exibe overlay com ícone, aplica flash no sprite e shake em dano |
| `src/presentation/components/BattleFloatingTextController.ts` | Ignora `buff`/`debuff` (só ícone, sem número duplicado) |
| `src/presentation/components/GameViewController.ts` | Instancia `BattleImpactFeedbackController` e chama `show()` junto com floats |
| `src/presentation/panel/panel.css` | Estilos `.battle-impact`, flashes por tipo e animação `battle-target-shake` |

## Ícones utilizados

| Tipo | Asset |
|------|-------|
| Dano / crítico | `ui/attack.png` |
| Cura | `skills/heal.png` |
| Buff | `skills/buff` → `ui/defense.png` |
| Debuff | `skills/debuff` → `ui/defense.png` |

## Fluxo

```
CombatTurnPhase → floatingEvents (damage/heal/crit/buff/debuff)
  → TickGameUseCase.combatFloats
  → GameViewController.showCombatFloats()
      → BattleFloatingTextController (números: damage/heal/crit)
      → BattleImpactFeedbackController (ícone + flash no card)
```

## Comportamento visual

- **Dano/crit:** ícone de ataque sobre o sprite, flash vermelho, shake horizontal (~350 ms)
- **Cura:** ícone de cura, flash verde
- **Buff/debuff:** ícone de escudo/defesa, flash azul/roxo (sem número flutuante)
- **Área:** um overlay por alvo — cada card recebe seu próprio feedback

## Testes

Rodar manualmente: `npm test`

Validar em batalha:
1. Skill de dano em um inimigo → ícone + shake + número `-N`
2. Skill de cura → ícone verde + `+N`
3. Buff/debuff em área → ícone em todos os alvos afetados, sem números extras

## Análise (escalabilidade / manutenção)

A separação entre `BattleFloatingTextController` (texto) e `BattleImpactFeedbackController` (ícone no card) mantém responsabilidades claras e permite evoluir cada feedback de forma independente — por exemplo, partículas ou sons no futuro sem tocar na lógica de números.

Os eventos reutilizam o pipeline existente de `floatingEvents`, evitando novo canal de DTO ou estado de combate. Para escalar, basta estender `CombatFloatKind` e mapear novos ícones em `IMPACT_ICON`; efeitos visuais adicionais ficam confinados ao controller e ao CSS.

Próximos passos opcionais: ícone dedicado para debuff, duração configurável por tipo, ou testes unitários do controller com DOM mock.

## Correção — cura em aliado (122)

**Problema:** ícone de cura não aparecia no herói curado (ex.: Elara curando Galneon), embora o evento de domínio fosse emitido corretamente.

**Causa:** o ícone era anexado dentro do `button.hero-sprite`, ficando atrás da camada `#battle-float-layer` (z-index 4) e parcialmente oculto pelo sprite.

**Correção:** `BattleImpactFeedbackController` passa a renderizar ícones na mesma camada dos números flutuantes, posicionados via `getBoundingClientRect` do anchor do alvo. Flash/shake permanecem no card do personagem.

**Testes:** `CombatActionExecutor.test.ts` — cura single ally e cura em área emitem `floatingEvents` com `target: 'hero'` e `targetId` do aliado curado.
