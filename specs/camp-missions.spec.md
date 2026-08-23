# Spec — Acampamento, Mapa e Missões

## Status

**Aceite:** 22/22 (100%) · Fases 0–6  
**Testes obrigatórios:** 11/11

## Objetivo

Substituir o avanço automático de fases por um loop **acampamento → mapa → missão → batalha → resultado → acampamento**. O jogador escolhe missões no mapa; há três tipos (principal, secundária, normal) com regras distintas de disponibilidade, derrota e recompensa.

## Loop canônico

```
Acampamento → abrir mapa → escolher missão → batalha (waves)
  → vitória ou derrota → tela de resultado/recompensas → Acampamento
```

- Não há auto-avanço para a próxima fase/missão após limpar waves ou boss.
- Waves **dentro** de uma missão ativa continuam com intermissões CLEAR/WARNING (timeline: `stage-progress-bar`).
- Sistemas de party/loja/inventário/formação permanecem restritos ao **acampamento**.

## Tipos de missão

| Tipo | Papel | Repetível? | No mapa |
|------|--------|------------|---------|
| **Principal** (`main`) | Avança a história do mapa (marcos) | Não, após concluir | Sempre a **próxima** incompleta |
| **Secundária** (`side`) | História paralela + loot exclusivo | Não, após concluir | Desbloqueadas e incompletas (várias ok) |
| **Normal** (`normal`) | Loot/recursos; não avança história | Sim, em **próximos** sorteios; some da oferta atual na derrota/vitória; XP/ouro vêm só do orçamento da fase (kills), sem recompensa de conclusão | 2–4 por oferta, só do capítulo da main atual |

### Principais (marcos)

Por mapa (`stendra` … `morthaven` no v1), ids alinhados às fases-marco:

`{mapIndex}-1`, `{mapIndex}-5`, `{mapIndex}-10`, `{mapIndex}-15`, `{mapIndex}-20`, `{mapIndex}-25`, `{mapIndex}-30`, `{mapIndex}-35`, `{mapIndex}-40`, `{mapIndex}-45`, `{mapIndex}-50`.

- Ordem sequencial: só a **próxima** principal incompleta aparece no board.
- Concluídas **não** voltam ao mapa.
- Derrota: missão **permanece**; progresso da tentativa zera (recomeça waves do zero).

### Secundárias

- Únicas por arco de conteúdo; **várias** podem estar ativas ao mesmo tempo.
- **Vinculadas ao capítulo da main atual**: só aparecem no board se o `phaseTemplateId` estiver na mesma faixa da main incompleta (ex.: main `1-1` → sides com fases `1-2`…`1-5`).
- Cadeias de unlock (ex.: sides do capítulo `1-1` livres no início; após `1-1` → `Trilha de Cinzas` no capítulo `1-5`).
- Concluídas **não** repetíveis.
- **Expiram** se incompletas quando o jogador conclui uma main **posterior** no mesmo mapa (janela entre o maior pré-requisito main e a próxima main; ex.: unlock em `1-1` some ao zerar `1-5`).
- Derrota: permanece no mapa; tentativa zera.
- Recompensa exclusiva: item e/ou ouro e/ou XP e/ou cena narrativa (`story-scenes` / catálogo próprio).

### Normais

- Templates por **mapa** para fases `1–50` (incluindo marcos): `normal:x-n` usa o combate da fase `x-n`.
- **Capítulo da main atual**: oferta só sorteia templates na faixa `[marco atual .. próximo marco]` (ex.: main `1-1` → `1-1`…`1-5`; main `1-5` → `5`…`10`).
- Dentro do capítulo há templates mais fáceis e mais exigentes (próximo ao marco seguinte pede grind/build); não devem ser triviais nem impossíveis cedo demais.
- Oferta: entre **2 e 4** missões sorteadas (sem repetir **no mesmo** sorteio).
- **Repetíveis entre sorteios**: o mesmo template pode voltar em refreshes futuros (diferente de main/side). **Não** há penalidade de ouro/XP por “replay” — kills pagam cheio.
- Renovação: a cada `NORMAL_MISSION_REFRESH_EVERY_N_CAMP_VISITS` visitas ao acampamento (constante de domínio, default calibrável).
- Derrota: a missão **some** da oferta atual (pode voltar no próximo refresh).
- Vitória: remove da oferta atual; concede loot/recursos sem avançar história.

## Estrelas (1–5)

- Indicam dificuldade e template.
- UI: preview de waves, monstros e estatísticas dos inimigos **antes** de entrar.
- Balanceamento: ver `game-balance` (BAL de missões).

## UI do mapa

Evoluir o modal de campanha atual (`CampaignModal` / `CampaignFlow`):

1. **Mapa-mundo** (regiões) — mantém o padrão atual.
2. **Mapa de locais do mapa ativo** — substitui a trilha linear de fases: locais clicáveis (visual semelhante à árvore de skills **sem** edges/nós de pré-requisito), mostrando as missões **disponíveis nesta visita**.
3. Detalhe da missão: ao clicar no pin, popover ancorado **sobre o próprio pin** (tipo, estrelas, waves/monstros/stats, CTA iniciar). Sem footer fixo de preview — libera altura no painel pinado. Clique fora fecha. Popover clampa nas bordas. Tooltip de inimigo em grade compacta com ícones de estatística.

## Critérios de aceite

- [x] Fim de batalha (vitória ou derrota) mostra CLEAR/DEFEAT, depois tela só de recompensas (sem scroll; Continuar no deck); Continuar → hub ACAMPAMENTO e abre o mapa
- [x] **Iniciar missão** no mapa → cue START → combate (sem clique em Batalhar); em campanha unpin, relay para o side panel (`MissionBattleStartRelay`)
- [x] Hub / Acampamento sem reinício via Batalhar (`phaseRestartOnResume: false`); combate só pelo mapa
- [x] New game inicia no hub do acampamento (`loadoutEditOpen: true`) com overlay Acampamento
- [x] New game: depois da cena de abertura, boas-vindas → mapa aberto automaticamente → tutorial guiado (pinos/tipos de missão, preview do local, Iniciar missão); ver `battle-ui` (`OnboardingPolicy`)
- [x] Derrota em missão normal concede fração de ouro/XP **e** o overlay de recompensas exibe esses valores (delta da tentativa inteira vs. o hub no START — não só o último tick; sem inventar XP a partir de `xpReward` dos inimigos); main/side na derrota sem recompensa de conclusão
- [x] Sem auto-seleção / auto-start da próxima fase ao limpar boss de missão
- [x] Board do mapa lista próxima principal + secundárias elegíveis + oferta normal (2–4)
- [x] Principais = marcos `x-1`…`x-50` apenas; concluídas fora do board
- [x] Secundárias respeitam grafo de unlock; múltiplas ativas permitidas; incompletas expiram ao concluir main posterior no mapa
- [x] New game / party inicial: só Nix até unlocks na árvore (gates de main)
- [x] Normais sorteadas no **capítulo da main atual** (ex.: `1-1` → fases `1–5`); templates repetíveis entre sorteios; pool por visitas ao camp
- [x] Secundárias no board filtradas pelo mesmo capítulo (template na faixa) + grafo de unlock/expiração
- [x] Pins do mapa de locais com margem segura (visíveis por completo; sem corte no topo/laterais)
- [x] Derrota: normal some; main/side permanecem com tentativa zerada
- [x] Vitória main: marca concluída, libera próxima principal (e unlocks side se houver)
- [x] Vitória side: marca concluída, aplica unlocks e loot exclusivo
- [x] Vitória normal: remove da oferta, loot/recursos sem progresso de história
- [x] Preview de waves/monstros/stats antes de iniciar
- [x] Estrelas 1–5 visíveis nas normais (e onde aplicável)
- [x] Modal: mapa-mundo + mapa de locais (região compacta: padding/gap mínimos; progresso no hover; sem abas laterais)
- [x] Persistência: board, ofertas, concluídas, visitas desde refresh, tentativa ativa
- [x] `CampaignReleaseScope` base (mapas 1–4) respeitado
- [x] Presentation consome apenas DTOs
- [x] Domínio em `domain/campaign/missions/` (ou equivalente) sem Chrome/DOM
- [x] Use cases + handlers no service worker
- [x] Migração de save legado (fase linear → progresso de marcos + board inicial)
- [x] Testes listados abaixo criados/atualizados
- [x] Specs cruzadas (`combat-campaign`, `battle-ui`, `story-scenes`, `gear-loot`, `game-balance`, `stage-progress-bar`) alinhadas
- [x] Skill, agent e rule `camp-missions` presentes

## Constantes de domínio (iniciais)

| Constante | Default sugerido | Notas |
|-----------|------------------|--------|
| `NORMAL_MISSION_OFFER_MIN` | 2 | Inclusivo — **somente** missões normais |
| `NORMAL_MISSION_OFFER_MAX` | 4 | Inclusivo — principal/secundária não entram na contagem |
| `NORMAL_MISSION_REFRESH_EVERY_N_CAMP_VISITS` | 2 | Renova a cada 2 retornos ao camp (calibração Fase 6) |

XP e ouro de cada fase vêm exclusivamente do orçamento `targetXp`/`targetGold` (Balance Lab → aba XP), pagos via kills durante o combate. Missões não têm recompensa de conclusão em ouro/XP — apenas item exclusivo e cena (só na vitória).

## Camadas e arquivos-chave (alvo)

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/campaign/missions/*`, ajustes em `PhaseCombatHandlers`, `CampaignProgress`, `PartyEditPolicy` |
| Application | `GetMissionBoardUseCase`, `StartMissionUseCase`, `ResolveMissionOutcomeUseCase`, DTOs |
| Presentation | `CampaignFlow`, `CampaignModalRenderer`, `CampaignMapPresentation` (locais), fluxo de resultado → camp |
| Infra | `service-worker.ts` (novas actions), migração de storage |

## Invariantes

- Acampamento é o hub; combate só após `StartMission`
- Principais/secundárias concluídas nunca reaparecem no board
- Sem multiplicador de ouro/XP por template já cleared (normais farmam cheio)
- Sides incompletas saem do board ao expirar a janela de main
- Oferta normal é determinística por seed de save + epoch de refresh
- Domínio não conhece Chrome nem DOM
- Escopo `base` não oferece missões de mapas DLC

## Fora de escopo (v1)

- Replay de principais/secundárias
- Grafo não-linear de principais (continua sequência de marcos)
- Tela de mapa totalmente nova fora do modal de campanha
- Editor de missões in-game

## Testes obrigatórios

- [x] `MissionUnlockGraph.test.ts` — cadeias, paralelas e expiry ao completar main posterior
- [x] `NormalMissionOffer.test.ts` — 2–4, refresh por visitas, seed, faixa da main
- [x] `NormalMissionMainBand.test.ts` — banda de fases por marco da main
- [x] `CampMissionBoard.test.ts` — próxima main, sides elegíveis, normais na faixa
- [x] `MissionMapLayoutCatalog.test.ts` — margem segura dos pins
- [x] `ResolveMissionOutcomeUseCase.test.ts` — vitória/derrota por tipo → camp
- [x] `ResolveMissionOutcome.test.ts` — domínio: fração de ouro/XP na derrota normal; main/side sem recompensa
- [x] `StartMissionUseCase.test.ts` — inicia tentativa / rejeita inválida
- [x] `GetMissionBoardUseCase.test.ts` — DTO / escopo base
- [x] `CampaignMissionMapPresentation.test.ts` — locais clicáveis / tipos / popover no pin / tooltip de stats
- [x] `EnemyBattlePresentation.test.ts` — tooltip compacto com ícones (~3 por linha)
- [x] `MissionEnemyPreviewMapper.test.ts` — ficha de combate dos inimigos em destaque
- [x] `BattleVictoryDetector.test.ts` — vitória com rewards; derrota normal com ouro/XP da tentativa (baseline do START, não só o último tick)
- [x] `BattleAttemptRewardBaseline.test.ts` — captura/limpa snapshot da tentativa
- [x] `BattleVictoryFlow.test.ts` — CLEAR/DEFEAT → tela de recompensas e Continuar (ver também `battle-ui` / `combat-campaign`)
- [x] `BattleStartFlow.test.ts` — START antes do combate (ver também `battle-ui`)
- [x] Migração de save: progresso linear → marcos concluídos + board

## Relacionado

- [`combat-campaign.spec.md`](combat-campaign.spec.md) — combate, waves, fim de batalha
- [`battle-ui.spec.md`](battle-ui.spec.md) — acampamento, modal, resultado
- [`stage-progress-bar.spec.md`](stage-progress-bar.spec.md) — timeline na missão ativa
- [`story-scenes.spec.md`](story-scenes.spec.md) — cenas por unlock de missão
- [`gear-loot.spec.md`](gear-loot.spec.md) — loot exclusivo side / normal
- [`game-balance.spec.md`](game-balance.spec.md) — refresh e templates ★

## Fases de entrega

| Fase | Conteúdo |
|------|----------|
| 0 | Specs / skill / agent / rule (esta entrega) |
| 1 | Domínio board + unlock + oferta + persistência |
| 2 | Handlers fim de batalha → camp; derrota por tipo |
| 3 | Use cases + SW + DTOs |
| 4 | UI mapa de locais + preview + resultado |
| 5 | Catálogo marcos + pool normal ★ + sides piloto |
| 6 | Cenas/loot exclusivo + calibração refresh |
