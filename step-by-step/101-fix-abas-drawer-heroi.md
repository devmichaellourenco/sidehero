# 101 — Fix abas do drawer de herói

## Status: concluída

## Problema

No drawer lateral do herói, clicar em **Progressão**, **Skills** ou **Classe** não trocava o conteúdo.

## Causa

`HeroDetailFlow.changeTab()` chama `refreshModal()` após carregar dados da aba. Esse callback apontava para `refreshModalIfOpen()`, que só re-renderiza quando o **modal** está aberto — o drawer usa outro container (`#hero-drawer-body`).

## Correção

- Novo método `refreshHeroDetailViews()` em `GameViewController` — atualiza drawer **e** modal (se aberto).
- Callback do `HeroDetailFlow` passou a usar `refreshHeroDetailViews()`.
- `afterHeroProgressionMutation()` também usa o mesmo método.

## Arquivo alterado

| Arquivo | Função |
|---------|--------|
| `GameViewController.ts` | Sincronizar UI do drawer ao trocar abas |

## Validação

Abrir herói pelo clique na battle strip → alternar Loadout / Progressão / Skills / Classe — cada aba deve exibir seu conteúdo.
