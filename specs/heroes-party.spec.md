# Spec — Heróis e Party

## Status

**Aceite:** 5/5 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 5/5 presentes na suite

## Objetivo

O jogador gerencia **equipe ativa** (até 4 slots) e **reserva**, desbloqueia classes (Berserker, Paladino) e edita formação apenas na pausa de loadout.

## Critérios de aceite

- [x] Party editável só quando `canEditParty` (pausa loadout)
- [x] Drag-and-drop: reserva ↔ equipe, reordenar slots
- [x] Unlock de herói via melhoria (`hero_unlock_*`) adiciona à reserva
- [x] XP de batalha para party ativa; bench segue `BenchXpPolicy`
- [x] Detalhe do herói: modal com abas Loadout / Progressão / Skills / Classe

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
