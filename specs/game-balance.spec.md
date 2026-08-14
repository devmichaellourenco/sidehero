# Spec — Balanceamento do Jogo (transversal)

## Status

**Aceite:** 12/12 (100%) · auditoria 2026-08-14  
**Testes obrigatórios:** 9/9 + `BalanceAudit.test.ts` + `PhaseBattleOverrides`

## Objetivo

Garantir que **todos os sistemas do jogo**, juntos, produzam uma experiência **desafiadora porém justa**: o jogador sente progressão e escolhas relevantes, sem walls impossíveis nem trivialização precoce.

Este documento é **transversal** — não substitui specs de feature (`combat-campaign`, `gear-loot`, etc.). Define **como auditar, coordenar e validar** balanceamento antes e depois de mudanças numéricas ou de curva.

## Princípios de balanceamento

1. **Curva suave** — poder do jogador e dificuldade do conteúdo escalam juntos (tier, stage, melhorias, gear, meta).
2. **Contramedidas** — resistências, DEF, esquiva e economia limitam snowball; fraquezas temáticas recompensam build diversa.
3. **Legibilidade** — fórmulas centralizadas em catálogos/serviços; evitar números mágicos espalhados na UI.
4. **Reprodutibilidade** — seeds determinísticos onde o jogador reabre a mesma oferta/fase; RNG de loot com pesos documentados.
5. **Desafio ≠ impossível** — wipe e retry são aceitáveis; estagnar horas no mesmo tier sem rota de upgrade não é.

## Domínios de auditoria

| Domínio | O que verificar | Spec parceira | Arquivos-chave |
|---------|-----------------|---------------|----------------|
| **Combate e fórmulas** | Dano, cura, crítico, status, turnos/tick | `combat-campaign` | `MitigationPipeline`, `CombatDamageResolver`, `CombatActionExecutor`, `CombatTurnPhase` |
| **Elementos** | Cada elemento (`physical`/`fire`/`cold`/`lightning`/`air`) usa mitigação do tipo; multi-componente; DOT | `combat-campaign`, `skills-progression` | `DamageElement`, `ResistanceProfile`, `HeroCombatSkillCatalog`, `EnemyMonsterCombatSkillCatalog` |
| **Gear e loot** | Stats por raridade/tier; resist/def por slot; caps | `gear-loot` | `LootService`, `GearTemplateCatalog`, `DifficultyCombatScaling` |
| **Waves e fases** | HP/ATK/DEF por level+attrs+role; boss vs trash; handcrafted; overrides do Balance Lab | `combat-campaign`, `camp-missions` | `EnemyProgressionCatalog`, `WaveEnemyFactory`, `HandcraftedPhaseCatalog`, `PhaseBattleOverrides`, `PhaseRewardOverrides` |
| Missões / board | Oferta normal 2–4 no capítulo da main (ex.: 1-1 → 1–5); refresh por visitas; templates ★; unlock side; fração na derrota normal | `camp-missions` | `NormalMissionOffer`, `NormalMissionMainBand`, `MissionCatalog`, `CampMissionBoard`, `ResolveMissionOutcome` |
| **Skills e progressão** | `Base × (powerPerRank × nível) × (attr × fator)`; cooldowns; ascensão vs tier | `skills-progression`, `heroes-party` | `HeroCombatSkillCatalog`, `SkillPowerCalculator`, `SkillDamageBalance`, `HeroLevelXpCatalog` |
| **Economia** | Ouro in/out; loja; baús; forja; loja refresh | `shop-economy`, `stash-forge`, `gear-loot` | `ConfigurableShopCatalog`, `ShopService`, `ShopPricing`, `EconomyReference`, `PhaseGoldBudget`, `ForgeSalvageGoldCatalog`, `PhaseCombatHandlers` |
| **Melhorias e meta** | Gates, custos, impacto em features | `upgrade-tree`, `meta-legacy` | `UpgradeCatalog`, `MetaUpgradeCatalog`, `FeatureAccessPolicy` |
| **Integração** | Mudança num domínio não quebra curva global | todas | esta spec + checklist abaixo |

## Pipeline de dano (referência)

```
Poder × crítico → split damageComponents[]
  → físico: DEF/armadura (mitigatePhysicalDamage)
  → elemental: resist[elemento] + allElemental
  → soma → esquiva → bloqueio → redução %
  → HP
```

**Regra:** todo dano que reduz HP deve passar pelo mesmo pipeline (incluindo DOT), salvo exceção documentada na spec.

## Critérios de aceite

- [x] Spec, agent e skill de balanceamento criados e registrados no SDD
- [x] Matriz de coordenação com specs de feature documentada
- [x] DOT (`CombatTurnPhase`) mitigado por elemento + defesas como hit instantâneo
- [x] Ciclo elemental completo: skills `frost_shard`, `blizzard` e `frost_breath` (gelo)
- [x] Auditoria documentada de curva tier 1–25 (early), 26–100 (mid), 101–200 (late) no jogo base v1
- [x] Loja, loot e baús validados contra renda de ouro por fase (sem trivializar nem starvation)
- [x] Ouro de combate em fases normais limitado à renda de referência do tier (`PhaseGoldBudget`)
- [x] Waves/boss: tempo médio para clear dentro de faixa alvo por tier (ver skill)
- [x] Backlog de balanceamento revisado após cada entrega numérica relevante
- [x] BAL-010 — identidade soft por mapa (pools + resists −15/+20) nos 4 mapas base
- [x] BAL-011 — micro-desafios multi-slot (race/sustain/spike/warded/armored) nos 4 mapas base
- [x] BAL-012 — cadência early: TTA = 1/ASPD por combatente; CD/básico/ASPD/crescimento na identidade do herói ou tipo de monstro; recovery/CDR/rank na skill
- [x] BAL-013 — inimigos no mesmo modelo de combate dos heróis (level/attrs/ranks/passivas; CD e básico unificados; sem knobs ATK/HP/skill)
- [x] BAL-015 — rebalance camp-missions: ASPD efetiva ~½ (TTA ~2×, fator por combatente); recovery/CDR por skill; `powerPerRank` das skills de herói com CD ×3 no catálogo; raridade da loja por mains; party Nix solo + unlocks por main
- [x] Balance Lab: aba **Missões** edita waves/inimigos por fase; filtros por capítulo da main / tipo / mapa / busca; aviso de template compartilhado (main↔normal); overrides em `phase-battle-overrides.json` mesclados via `PhaseBattleOverrides` / `CampaignCatalog.resolvePhase`; backups em `data/backups/phase-battle-overrides/`
- [x] Balance Lab: aba **XP por fase** lista XP/ouro por fase (soma de kills), acumulado, nível projetado e filtros mapa/capítulo; edição de alvos com save em `phase-reward-overrides.json` + backups (`GET|PUT|DELETE /api/phase-rewards`)
- [x] Balance Lab: aba **XP por nível** lista a curva de level-up 1→100 (XP base, XP efetiva, crescimento vs nível anterior, XP acumulada) com filtro por faixa de 10 níveis; edição por nível com save em `hero-level-xp-overrides.json` + backups (`GET|PUT|DELETE /api/hero-level-xp`); merge em `expRequiredToAdvanceFromLevel`
- [x] Balance Lab: aba **Itens** lista o catálogo (`gear-items.catalog.json`) com filtros slot/raridade/busca; edita nome, preço base fixo, raridade, flags, requisitos e stats; save em `gear-item-overrides.json` + backups (`GET|PUT|DELETE /api/gear-items`); merge em `getGearCatalogItem` / loot lists
- [x] Balance Lab: aba **Lojas** cria/edita/duplica/exclui lojas vinculadas a marcos `main:X-Y`, com pool explícito e modificadores globais; save em `shop-overrides.json` + backups (`GET|PUT|DELETE /api/shops`); merge em `listConfiguredShops` / `resolveActiveShop`
- [x] Balance Lab: aba **Personagens** edita stats base (ATK/DEF/HP), identidade, skills de combate, passivas e evoluções (ascensão); save em `hero-combat-overrides.json` + backups (`GET|PUT /api/hero-combat`); merge em `getHeroCombatSkill` / `getHeroCombatIdentity` / `getHeroBaseStats` / `getPassiveDefinition` / `getAscensionById`
- [x] Balance Lab: aba **Inimigos** edita identidade e skills de monstro por tipo de inimigo; roster completo com tier/role/sprite; save em `enemy-combat-overrides.json` + backups (`GET|PUT /api/enemy-combat`); merge em `EnemyCombatOverrides` / `EnemyCombatIdentityCatalog` / `CombatSkillRegistry`
- [x] Balance Lab: aba **Melhorias** edita custo, nome e descrição dos upgrades da árvore; save em `upgrade-overrides.json` + backups (`GET|PUT /api/upgrades`); merge em `UpgradeOverrides` / `UpgradeCatalog`
- [x] Balance Lab: aba **Economia** auditoria read-only de ouro por fase (por mapa/capítulo) + pool de lojas com preços efetivos e custo de renovação (`GET /api/economy-audit`)
- [x] Balance Lab: **Wave Power** em Missões — botão no editor de batalha carrega poder da fase via `GET /api/wave-power?phaseId=` usando `estimatePhasePower` + `DEFAULT_REFERENCE_PARTY`; mostra HP total, DPS da party, tempo de clear e pressão por wave
- [x] Balance Lab: **Stock Preview** de loja — painel seed/tier na aba Lojas gera prévia determinística do estoque via `GET /api/shops/:id/stock-preview?seed=&tier=`

## Coordenação com outros agents

| Situação | Agent principal | Consultar balanceamento quando |
|----------|-----------------|-------------------------------|
| Nova skill ou rebalance de poder | `skills-progression` | Alterar `basePower`, cooldown, elemento ou DOT |
| Novo inimigo ou fase | `combat-campaign` | Stats, skills, resist inata, wave count |
| Loot, affixes, raridade | `gear-loot` | Multiplicadores, caps, distribuição por baú |
| Preços loja / refresh | `shop-economy` | Caps por main, quantidade de ofertas, preços |
| Custo de melhoria | `upgrade-tree` | Impacto cumulativo na curva de poder |
| Selos / meta | `meta-legacy` | Bônus % que afetam combate ou economia |
| UI de combate (só números) | `battle-ui` | Nunca alterar fórmula na presentation |

**Fluxo recomendado:** feature agent propõe mudança → balance agent revisa impacto cross-domain → atualiza critérios/backlog nesta spec → feature agent implementa.

## Invariantes

- Fórmulas de combate vivem em `domain/combat` e `domain/services/combat`, não na UI
- Resistência física = stat DEF; resistência elemental = profile separado (`fire`/`cold`/`lightning`/`air` + `allElemental`)
- `allElemental` soma a **todos** os elementos (não a físico)
- Elemento canônico de DOT sem `dotElement` explícito = `air` (ex-caos)
- Scaling de inimigo usa `difficultyTier` global da fase, não stage local arbitrário
- Determinismo: IDs de oferta/seed não podem mudar item ao recomprar no mesmo tier+seed
- Básico, s/turno de CD, ASPD e crescimento ATK/DEF/HP vivem na identidade do herói ou tipo de monstro (`HeroCombatIdentityCatalog`, `EnemyCombatIdentityCatalog`)
- Recovery, redução por rank e teto/piso de CDR vivem na skill (`CatalogCombatSkillDefinition`); sem piso global de recarga

## Escopo v1 (jogo base até Morthaven)

Auditoria de balanceamento do release inicial cobre **tier 1–200** (fases `1-1` … `4-50`). Tiers 201–500 (DLC) permanecem no catálogo numérico mas ficam fora do escopo de aceite até liberação de DLC.

| Faixa | Tiers (v1) | Notas |
|-------|------------|-------|
| Early | 1–25 | Stendra |
| Mid | 26–100 | Gruftall + início Valdris |
| Late | 101–200 | Valdris + Morthaven |

Âncoras de auditoria v1: `1, 10, 25, 26, 50, 100, 150, 200`. Tiers `250` e `500` reservados para perfil `full` / DLC.

## Fora de escopo

- Balanceamento PvP ou modos não implementados
- Simulação Monte Carlo automatizada em CI (manual por enquanto)
- Tabela de drop rates publicada ao jogador in-game

## Testes obrigatórios (matemática de balanceamento)

Criar ou atualizar; **não executar** automaticamente.

- [x] `MitigationPipeline.test.ts` — resist por elemento; físico vs elemental
- [x] `DamageElement.test.ts` — elementos canônicos incluem `air` e excluem `chaos`
- [x] `CombatDamageResolver.test.ts` — multi-componente, crítico, dodge
- [x] `CombatActionExecutor.test.ts` — resist gear, DOT apply, debuff defesa
- [x] `DifficultyCombatScaling.test.ts` — scaling por tier
- [x] `ResistanceProfileAggregator.test.ts` — soma de resist no equip
- [x] `EnemyInnateResists.test.ts` — temas e fraquezas (+ bias de mapa)
- [x] `MapCombatIdentityCatalog.test.ts` — identidade soft dos 4 mapas base
- [x] `PhaseChallengeCatalog.test.ts` — BAL-011 multi-slot (race/sustain/spike/warded/armored) 4 mapas
- [x] `SkillCooldownTiming.test.ts` — CD = turns × s/turno do combatente − per-rank da skill
- [x] `HeroCombatIdentityCatalog.test.ts` / `EnemyCombatIdentityCatalog.test.ts` — knobs por herói/tipo de monstro
- [x] `DamageThroughputEstimate.test.ts` — eficácia vs resists da área
- [x] `ShopService.test.ts` — cap de raridade por mains concluídas, preços
- [x] `CombatSpeedScaling.test.ts` / `CombatProfileProvider.test.ts` — ASPD efetiva ~½ (BAL-015)
- [x] `SkillDamageBalance.test.ts` / `HeroCombatSkillCatalog.test.ts` / `EnemyMonsterCombatSkillCatalog.test.ts` — poder ×3; timing (recovery/CDR/rank) por skill
- [x] `DotTickResolver.test.ts` — DOT mitigado; default sem elemento = `air`
- [x] `BalanceAudit.test.ts` — curva por tier, economia loja/forja, tempo de clear
- [x] `PhaseGoldBudget.test.ts` — teto de ouro por fase normal alinhado à referência
- [x] `EnemyCombatOverrides.test.ts` — normalize/apply de identidade e monster skills
- [x] `UpgradeOverrides.test.ts` — normalize/apply de custo/nome/desc; runtime override
- [x] `WavePartyPowerEstimate.test.ts` — estimativa de poder por wave/fase; DPS cresce com nível
- [x] `MilestoneGoldCap.test.ts` — teto de ouro em milestones (BAL-007)
- [x] `MapGearLevelPolicy.test.ts` — faixa de nível de item por mapa
- [x] `ProgressionPowerScale.test.ts` — curva de XP e stats de gear por nível
- [x] `CampaignXpScaling.test.ts` — XP por mapa, early boost e metas de progressão
- [x] `GameStateMigration.test.ts` — migração legada `chaos*` → `air*` (gear, IDs, DOT)
- [x] `EnemyProgressionCatalog.test.ts` — sheet por level/role (BAL-013)
- [x] `WaveEnemyFactory.test.ts` — spawn por level; HP derivado sem knobs legados
- [x] `EnemyCombatStatSheetMapper.test.ts` — ficha de combate do inimigo
- [x] `SkillPowerCalculator.test.ts` — básico/skill inimigo alinhados ao herói
- [x] `SkillCooldownTiming.test.ts` — CD unificado herói/inimigo
- [x] `PhaseBattleOverrides.test.ts` — merge de waves do Balance Lab sobre fase handcrafted
- [x] `PhaseRewardOverrides.test.ts` — alvos XP do lab escalam kills da fase
- [x] `HeroCombatOverrides.test.ts` — knobs de skill/identidade/passiva/evolução do lab no lookup do domínio
- [x] `HeroLevelXpOverrides.test.ts` — XP por nível do lab na curva efetiva e no level-up de `Experience`
- [x] `GearItemOverrides.test.ts` — nome/stats/requisitos do lab no lookup do catálogo de itens
- [x] `ConfigurableShopCatalog.test.ts` — criar/editar/excluir lojas e resolver a ativa por marco

## Balance Lab (ferramenta de calibração)

Ferramenta **fora do produto jogável** (`npm run balance-lab` → http://127.0.0.1:5179/):

| Peça | Função |
|------|--------|
| Aba Simulador | Combatente com **identidade** (básico, s/turno CD, ASPD, ATK/DEF/HP, level-up); fórmulas só com pesos STR/DEX e piso ASPD |
| Skill no lab | Recovery, CD (turns × s/turno da identidade − per-rank) e CDR teto/piso da skill selecionada |
| Aba Missões | Editar composição de batalhas por `phaseTemplateId`; filtrar por capítulo da main (faixa do board), tipo, mapa e busca; alertar missões que compartilham o mesmo template; seletor de inimigos com miniatura |
| Aba XP por fase | Distribuição de XP/ouro por fase; editar alvos e salvar overrides; XP acumulado e nível projetado; filtros mapa/capítulo |
| Aba XP por nível | Curva de XP para subir de nível (1→100); XP base vs efetiva, crescimento, acumulado; filtro por faixa; salvar overrides; backups |
| Aba Itens | Catálogo de gear (156+); editar nome/preço base/raridade/flags/requisitos/stats; filtros slot/raridade/busca; salvar overrides; backups |
| Aba Lojas | CRUD de lojas; marco `main:X-Y`; pool explícito; multiplicador/ajuste globais; backups |
| Aba Personagens | Editar stats base, identidade, skills, passivas e evoluções por herói; impacto (pts/skills/passiva); salvar overrides; backups |
| `src/domain/campaign/data/phase-battle-overrides.json` | Overrides persistidos; merge sobre handcrafted |
| `src/domain/campaign/data/phase-reward-overrides.json` | Alvos XP/ouro por fase; escala em `WaveEnemyFactory` |
| `PhaseBattleOverrides.ts` | Merge determinístico usado por `CampaignCatalog.resolvePhase` |
| `PhaseRewardOverrides.ts` / `PhaseXpBudget.ts` | Overrides de recompensa + escala de XP |
| `tools/balance-lab/missionBattlesCatalog.ts` | Snapshot + filtros de capítulo/shared |
| `tools/balance-lab/missionBattlesUi.ts` | UI da aba Missões |
| `tools/balance-lab/phaseRewardsCatalog.ts` | Soma XP/ouro por fase + acumulado + disk overrides |
| `tools/balance-lab/phaseRewardsUi.ts` | UI editável da aba XP por fase |
| `src/domain/progression/data/hero-level-xp-overrides.json` | XP por nível (N→N+1); merge em `expRequiredToAdvanceFromLevel` |
| `HeroLevelXpOverrides.ts` / `HeroLevelXpCatalog.ts` | Curva canônica (`catalogExpRequiredToAdvanceFromLevel`) + override do lab |
| `tools/balance-lab/heroLevelXpCatalog.ts` / `heroLevelXpUi.ts` | Snapshot e UI editável da aba XP por nível |
| `src/domain/gear/data/gear-item-overrides.json` | Nome/preço base/raridade/stats/requisitos/flags por item; merge em `getGearCatalogItem` |
| `GearItemOverrides.ts` / `GearItemCatalog.ts` | Override esparso + catálogo canônico (`getCatalogGearItem`) |
| `tools/balance-lab/gearItemsCatalog.ts` / `gearItemsUi.ts` | Snapshot e UI editável da aba Itens |
| `src/domain/shop/data/shop-overrides.json` | Lojas criadas/editadas no lab; tombstones de canônicas |
| `ConfigurableShopCatalog.ts` / `ShopStock.ts` | Catálogo + overrides + estoque persistido por loja |
| `tools/balance-lab/shopCatalog.ts` / `shopUi.ts` | Snapshot e CRUD da aba Lojas |
| `src/domain/progression/data/hero-combat-overrides.json` | Knobs de skill/identidade/stats base/passiva/ascensão; merge nos lookups |
| `HeroCombatOverrides.ts` / `HeroBaseStatsCatalog.ts` | Normalize + apply de recursos de herói (incl. ATK/DEF/HP base) |
| `tools/balance-lab/heroCombatCatalog.ts` | Snapshot por herói para o lab |
| `tools/balance-lab/heroCombatUi.ts` | UI da aba Personagens |
| `src/domain/campaign/data/backups/phase-battle-overrides/` | Snapshots ao salvar batalhas |
| `src/domain/campaign/data/backups/phase-reward-overrides/` | Snapshots ao salvar recompensas |

Não substitui catálogos canônicos: identidade/skills calibrados no lab gravam `hero-combat-overrides.json` (merge no lookup); cola no catálogo TS só na promoção. Overrides de missão são camada até promoção ao handcrafted.

## Backlog conhecido (auditoria 2026-07-03)

| ID | Severidade | Descrição | Domínio | Status |
|----|------------|-----------|---------|--------|
| BAL-001 | Alta | DOT ignora `MitigationPipeline` e defesas | Combate | ✅ Resolvido |
| BAL-002 | Média | Elemento `cold` sem fonte ofensiva no catálogo | Elementos | ✅ Resolvido |
| BAL-003 | Baixa | Dodge/block/DR aplicados na soma total, não por componente | Combate | Aberto (aceito) |
| BAL-004 | Baixa | `debuff_defense` só afeta componente físico | Combate | Aberto (intencional — ver tooltip in-game) |
| BAL-005 | Média | Gear sem dano/resist elemental visível no loot | Gear/Loot | ✅ Resolvido |
| BAL-006 | Média | Gear sem flat/%, velocidade negativa e redução de CD | Gear/Loot | ✅ Resolvido |
| BAL-007 | Média | Milestones (ex. 2-50) pagam ouro muito acima da renda de referência — épico na loja fica trivial nessas fases | Economia | ✅ Resolvido (`MilestoneGoldCap`) |
| BAL-008 | Média | Ouro por fase normal escalava acima da renda de referência em fases multi-inimigo (épico trivial cedo) | Economia | ✅ Resolvido (`PhaseGoldBudget`) |
| BAL-009 | Alta | Progressão de nível lenta no v1; loot fora da faixa do mapa; dano não escalava até ~20k DPS | Progressão/Loot | ✅ Resolvido (`ProgressionPowerScale`, `MapGearLevelPolicy`) |
| BAL-010 | Alta | Mapas sem identidade de combate — meta colapsa em DPS genérico | Campanha/Elementos | ✅ Resolvido (`MapCombatIdentityCatalog`, bias soft, X-50) |
| BAL-011 | Alta | Builds monótonas; pressão só no priest; mago/físico sem trade-off | Campanha/Waves | ✅ Resolvido (`PhaseChallengeCatalog` race/sustain/spike/warded/armored · Stendra→Morthaven) |
| BAL-012 | Alta | Combate early acelerado demais (TTA curto, skills rápidas, básico = ATK cheio) | Combate/Skills | ✅ Resolvido (TTA = 1/ASPD; CD/básico/ASPD/crescimento por herói ou tipo de monstro; recovery/CDR/rank por skill) |
| BAL-013 | Alta | Inimigos usavam knobs/fórmulas paralelas (HP factor, ASPD por stage, CD 1s/turn) | Combate/Campanha | ✅ Resolvido (`EnemyProgressionCatalog`, `CombatantDerivedStats`, CD/básico unificados) |
| BAL-014 | Alta | Loop camp-missions: oferta normal, refresh N visitas, curva ★1–5 por mapa | Missões | Calibrado — refresh=2; ver [`camp-missions.spec.md`](camp-missions.spec.md) |
| BAL-015 | Alta | Loop camp lento demais cedo / party 3 starters trivializa; loja por tier antecipa raridade | Camp/Missões/Combate/Loja | ✅ Resolvido (Nix solo + unlocks por main; sides expiram; ASPD½; `powerPerRank` CD ×3 no catálogo; loja por main; knobs globais de combate extraídos para identidade por herói/monstro/skill) |
