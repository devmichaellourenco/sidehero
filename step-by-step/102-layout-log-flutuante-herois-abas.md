# 102 — Layout inicial: log flutuante + heróis com abas

## Status: concluída

## 1. Log de batalha flutuante

**Antes:** painel fixo ocupando espaço vertical na tela inicial.

**Agora:**
- Botão 📜 na barra de ícones inferior abre/fecha o log.
- Overlay flutuante acima do footer (backdrop + painel compacto).
- Botão × ou clique fora fecha o log.
- Preferência de visibilidade salva em `sessionStorage`.

**Arquivos:** `panel.html`, `panel.css`, `BattleLogPanelController.ts`, `GameViewController.ts`

## 2. Painel Heróis com abas

### Batalhando
- Cards completos dos heróis em combate (stats, barras, loadout).
- Sem setas de formação.
- Clique abre drawer de detalhes (comportamento anterior).

### Formação
- **Equipe:** ícones horizontais estilo battle strip + setas ← → e botão −.
- **Reserva:** ícones horizontais + botão + (se houver vaga).
- Tooltip ao passar o mouse: stats, equipamentos e skills.
- Aviso de bloqueio quando party não pode ser editada.

**Arquivos:** `HeroesPanelPresentation.ts` (novo), `HeroPanelRenderer.ts`, `HeroBattlePresentation.ts` (`renderHeroFormationTooltipContent`)

## 3. Mais espaço vertical

- Log removido do fluxo principal do `#app`.
- `.heroes-panel` com `flex: 1` e scroll interno.
- `#app` com `overflow: hidden` — scroll só no painel de heróis quando necessário.

## Removido

- `PartyPanelPresentation.ts` — substituído por `HeroesPanelPresentation.ts`.

## Validação manual

1. Clicar 📜 → log aparece; clicar de novo ou × → some.
2. Aba **Batalhando** → cards sem setas de party.
3. Aba **Formação** → ícones horizontais, reordenar com ← →, reserva com +.
4. Hover nos ícones da formação → tooltip com stats/itens.
