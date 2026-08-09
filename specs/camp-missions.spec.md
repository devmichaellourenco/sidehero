# Spec — Acampamento, Mapa e Missões

## Status

**Aceite:** 22/22 (100%) · Fases 0–6  
**Testes obrigatórios:** 8/8

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
| **Normal** (`normal`) | Loot/recursos; não avança história | Oferta some na derrota ou ao concluir; pool renova | 2–4 por oferta |

### Principais (marcos)

Por mapa (`stendra` … `morthaven` no v1), ids alinhados às fases-marco:

`{mapIndex}-1`, `{mapIndex}-5`, `{mapIndex}-10`, `{mapIndex}-15`, `{mapIndex}-20`, `{mapIndex}-25`, `{mapIndex}-30`, `{mapIndex}-35`, `{mapIndex}-40`, `{mapIndex}-45`, `{mapIndex}-50`.

- Ordem sequencial: só a **próxima** principal incompleta aparece no board.
- Concluídas **não** voltam ao mapa.
- Derrota: missão **permanece**; progresso da tentativa zera (recomeça waves do zero).

### Secundárias

- Únicas por arco de conteúdo; **várias** podem estar ativas ao mesmo tempo.
- Cadeias de unlock (ex.: concluir `x-5` → oferece `side_xyz` → concluir → `side_hyj` final).
- Cadeias independentes podem coexistir no mapa.
- Concluídas **não** repetíveis.
- Derrota: permanece no mapa; tentativa zera.
- Recompensa exclusiva: item e/ou ouro e/ou XP e/ou cena narrativa (`story-scenes` / catálogo próprio).

### Normais

- Templates por **mapa** e **estrela (1–5)** — cada estrela aponta a um template distinto no catálogo.
- Conteúdo das fases intermediárias legadas (`x-2`, `x-3`, … não-marco) alimenta o **pool** de templates normais.
- Oferta: entre **2 e 4** missões sorteadas.
- Renovação: a cada `NORMAL_MISSION_REFRESH_EVERY_N_CAMP_VISITS` visitas ao acampamento (constante de domínio, default calibrável).
- Derrota: a missão **some** da oferta atual (não reaparece até o próximo refresh do pool).
- Vitória: remove da oferta; concede loot/recursos sem avançar história.

## Estrelas (1–5)

- Indicam dificuldade e template.
- UI: preview de waves, monstros e estatísticas dos inimigos **antes** de entrar.
- Balanceamento: ver `game-balance` (BAL de missões).

## UI do mapa

Evoluir o modal de campanha atual (`CampaignModal` / `CampaignFlow`):

1. **Mapa-mundo** (regiões) — mantém o padrão atual.
2. **Mapa de locais do mapa ativo** — substitui a trilha linear de fases: locais clicáveis (visual semelhante à árvore de skills **sem** edges/nós de pré-requisito), mostrando as missões **disponíveis nesta visita**.
3. Detalhe da missão: tipo, estrelas, waves/monstros/stats, CTA iniciar.

## Critérios de aceite

- [x] Fim de batalha (vitória ou derrota) sempre retorna ao acampamento após resultado/recompensas
- [x] Sem auto-seleção / auto-start da próxima fase ao limpar boss de missão
- [x] Board do mapa lista próxima principal + secundárias elegíveis + oferta normal (2–4)
- [x] Principais = marcos `x-1`…`x-50` apenas; concluídas fora do board
- [x] Secundárias respeitam grafo de unlock; múltiplas ativas permitidas
- [x] Normais sorteadas de templates por mapa×estrela; pool parametrizado por visitas ao camp
- [x] Derrota: normal some; main/side permanecem com tentativa zerada
- [x] Vitória main: marca concluída, libera próxima principal (e unlocks side se houver)
- [x] Vitória side: marca concluída, aplica unlocks e loot exclusivo
- [x] Vitória normal: remove da oferta, loot/recursos sem progresso de história
- [x] Preview de waves/monstros/stats antes de iniciar
- [x] Estrelas 1–5 visíveis nas normais (e onde aplicável)
- [x] Modal: mapa-mundo + mapa de locais (sem trilha linear antiga como UX principal)
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
- Oferta normal é determinística por seed de save + epoch de refresh
- Domínio não conhece Chrome nem DOM
- Escopo `base` não oferece missões de mapas DLC

## Fora de escopo (v1)

- Replay de principais/secundárias
- Grafo não-linear de principais (continua sequência de marcos)
- Tela de mapa totalmente nova fora do modal de campanha
- Editor de missões in-game

## Testes obrigatórios

- [x] `MissionUnlockGraph.test.ts` — cadeias e paralelas
- [x] `NormalMissionOffer.test.ts` — 2–4, refresh por visitas, seed
- [x] `CampMissionBoard.test.ts` — próxima main, sides elegíveis, normais
- [x] `ResolveMissionOutcomeUseCase.test.ts` — vitória/derrota por tipo → camp
- [x] `StartMissionUseCase.test.ts` — inicia tentativa / rejeita inválida
- [x] `GetMissionBoardUseCase.test.ts` — DTO / escopo base
- [x] `CampaignMissionMapPresentation.test.ts` — locais clicáveis / tipos
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
