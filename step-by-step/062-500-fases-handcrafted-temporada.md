# 062 — 500 fases handcrafted, escala de dificuldade e fim de temporada

## Objetivo

Expandir a campanha para **500 fases** determinísticas (handcrafted), com **boss de capítulo a cada 50 fases**, curva de dificuldade que exige farm/equipamento, desativar procedural no runtime e adicionar **fim de temporada + novo jogo**.

## Estrutura de conteúdo

| Mapa | Fases | Tier global |
|------|-------|-------------|
| Estrenda | 1-1 … 1-50 | 1–50 |
| Gondonor | 2-1 … 2-50 | 51–100 |
| Valdris | 3-1 … 3-50 | 101–150 |
| Morthaven | 4-1 … 4-50 | 151–200 |
| Céu Quebrado | 5-1 … 5-50 | 201–250 |
| Abismo Carmesim | 6-1 … 6-50 | 251–300 |
| Forja Eterna | 7-1 … 7-50 | 301–350 |
| Bosque Antigo | 8-1 … 8-50 | 351–400 |
| Torre do Crepúsculo | 9-1 … 9-50 | 401–450 |
| Trono do Vazio | 10-1 … 10-50 | 451–500 |

- Fases **X-50**: `milestoneBoss` com waves extras e `statMultiplier` 1.45
- Fase **10-50**: `seasonFinale`, `statMultiplier` 1.85, sem `unlocks`

## Arquivos principais

| Arquivo | Função |
|---------|--------|
| `CampaignMaps.ts` | Definição dos 10 mapas e total de fases |
| `HandcraftedPhaseCatalog.ts` | Gera as 500 fases com regras fixas (não procedural em runtime) |
| `CampaignCatalog.ts` | Resolve apenas handcrafted; procedural reservado |
| `WaveEnemyFactory.ts` | Curva `difficultyScale()` + multiplicador por fase |
| `CampaignProgress.ts` | Campo `seasonCompleted` |
| `PhaseCombatHandlers.ts` | Marca temporada ao derrotar boss final |
| `NewGameUseCase.ts` | Reseta save para `GameState.initial()` |
| UI (`panel.html`, `GameViewController`) | Banner de temporada + botão Novo Jogo |

## Escala de dificuldade

```typescript
difficultyScale(tier, phaseMultiplier) =
  (1 + (tier - 1)^1.12 * 0.11) * phaseMultiplier
```

Inimigos em tiers altos exigem níveis, atributos e equipamento — avanço linear sem farm fica inviável.

## Fim de temporada

1. Derrotar boss da fase **10-50**
2. `campaignProgress.seasonCompleted = true`
3. Toast + banner persistente no painel
4. Botão **Novo Jogo** → confirmação → `NEW_GAME` → estado inicial

## Validação

```bash
npm test   # 70 testes
npm run build
```

## Reflexão

O catálogo handcrafted é gerado deterministicamente na inicialização do módulo — 500 fases sem aleatoriedade em runtime, mantendo o arquivo `ProceduralPhaseGenerator.ts` como referência futura sem acoplamento. A curva de escala não-linear força farm nas fases médias/altas. Próximo passo natural: ajustar balanceamento fino por faixa de tier com playtesting e, se necessário, presets handcrafted manuais para marcos narrativos (50, 100, 250, 500).
