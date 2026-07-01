# 140 — Onboarding da primeira sessão

## Status: concluída

## Escopo

4 dicas contextuais na primeira sessão, uma por vez:

| Passo | Gatilho | Âncora |
|-------|---------|--------|
| `first-chest` | `pendingChestCount > 0` | `#open-chest-btn` |
| `pause-loadout` | combate ativo / party bloqueada | `#pause-loadout-btn` |
| `hero-points` | herói com `hasUnspentPoints` | `#hero-panels` |
| `first-upgrade` | `purchasableUpgradeCount > 0` | `#open-upgrades-btn` |

## Arquitetura

```
presentation/onboarding/
  OnboardingPolicy.ts      — ordem, gatilhos, textos
  OnboardingStorage.ts     — localStorage (dispensado / pular tudo)
  OnboardingController.ts  — card flutuante + highlight no alvo
```

## Comportamento

- Uma dica por vez, na ordem da tabela
- **Entendi** ou clique no fundo → dispensa o passo atual
- **Pular dicas** → não mostra mais nenhum (`sidehero_onboarding_skipped`)
- Ação real (abrir baú, pausar, abrir herói/melhorias) também dispensa o passo

## Persistência

- `localStorage.sidehero_onboarding_dismissed` — array de ids dispensados
- `localStorage.sidehero_onboarding_skipped` — flag global

## Validação manual

1. Limpar localStorage ou usar perfil novo
2. Jogar até ganhar baú → dica no ícone do baú
3. Abrir baú → próxima dica em Pausar
4. Ganhar pontos de herói → dica no painel de heróis
5. Acumular ouro para melhoria → dica na estrela ★

## Referência

`138-analise-melhorias-jogo.md` item 2
