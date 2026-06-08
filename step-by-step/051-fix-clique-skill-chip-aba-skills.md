# 051 — Clique em skill no painel abre aba Skills

## Status: concluída

## Problema

Chips de skill ativa ficavam dentro do botão `data-hero-open` do card. O clique abria a ficha do herói na aba **Ficha** (equipamento), não em **Skills**.

## Correção

| Arquivo | Alteração |
|---------|-----------|
| `HeroActiveSkillsPresentation.ts` | Chips ativos viram `<button data-hero-skills-open>` |
| `GameViewController.ts` | Delegação trata `data-hero-skills-open`; `openHeroDetailModal(heroId, tab)` |
| `panel.css` | Estilo de botão para chips clicáveis |

## Como validar

Painel Heróis → clicar chip de skill → modal abre direto na aba **Skills**.
