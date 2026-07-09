# Spec — Heróis e Party

## Status

**Aceite:** 10/10 (100%)  
**Testes obrigatórios:** 12/12 presentes na suite

## Objetivo

O jogador gerencia **equipe ativa** (até 4 slots) e **reserva**, desbloqueia classes (Berserker, Paladino) e edita formação apenas na pausa de loadout.

## Critérios de aceite

- [x] Party editável só quando `canEditParty` (pausa loadout)
- [x] Drag-and-drop: reserva ↔ equipe, reordenar slots
- [x] Unlock de herói via melhoria (`hero_unlock_*`) adiciona à reserva
- [x] XP de batalha para party ativa; bench segue `BenchXpPolicy`
- [x] Detalhe do herói: modal com abas Loadout / Progressão / Skills / Classe
- [x] Aba Inventário do herói **sem** hint estático de equipamento; slots clicáveis e picker inline comunicam a ação
- [x] Aba Inventário: **sem** abas texto Todos/Armas/Armaduras/Acessórios; categoria só via ícones do loadout; grid único com ordenação compartilhada; slot ativo filtra o mesmo grid in-place
- [x] Header do modal exibe `Lv.{n} {Classe} - {Evolução}` (ex.: `Lv.2 Priest - Aprendiz`); aba Classe **sem** retrato/classe atual — só próxima(s) ascensão(ões) e skills de evolução
- [x] Aba Classe apresenta título compacto **Escolha seu destino** + cards temáticos; detalhes do momento de ascensão ficam no tooltip do título; requisitos e CTA dos cards ficam no tooltip do card

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Domain | `src/domain/party/*`, `src/domain/entities/Hero.ts`, `HeroUnlockService` |
| Application | `AddToPartyUseCase`, `RemoveFromPartyUseCase`, `MovePartyMemberUseCase`, `SetPartySlotUseCase` |
| Presentation | `HeroesPanelPresentation`, `PartyDragDrop*`, `hero-detail/*`, `GameViewController` |

## Invariantes

- `PartyValidator` é autoridade para composição válida
- Mínimo 1 herói na party em combate
- Estado imutável: `GameState.with*` / `Hero` props

## Fora de escopo

- Sinergia automática de composição
- Substituto automático ao cair em combate

## Testes obrigatórios

- [x] `PartyService.test.ts`, `PartyEditPolicy.test.ts`, `PartyValidator.test.ts`
- [x] `HeroUnlockService.test.ts`, `PartyDragDropPresentation.test.ts`
- [x] `HeroDetailModalRenderer.test.ts` — aba Inventário sem parágrafo “Toque em um slot de equipamento…”; slot ativo destacado no loadout
- [x] `InventoryModalRenderer.test.ts` — embedded sem filtros texto de categoria; modo slot ativo filtra grid in-place
- [x] `HeroDetailHeaderRenderer.test.ts` — linha `Lv.{n} {Classe} - {Evolução}` no topo
- [x] `HeroClassTabRenderer.test.ts` — aba Classe sem retrato/classe atual; só ascensões disponíveis
- [x] `HeroClassLinePresentation.test.ts` — formatação da linha classe/evolução
- [x] `HeroClassAscensionPresentation.test.ts` — cards com requisitos/CTA só no tooltip; seleção por clique quando disponível
- [x] `AscendClassConfirmPresentation.test.ts` — modal de confirmação com preview e aviso permanente
