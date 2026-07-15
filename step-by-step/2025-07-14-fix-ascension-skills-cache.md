# Step-by-step — Skills de evolução no herói errado

**Data:** 2025-07-14  
**Bug:** aba Skills mostrava skills de ascensão do último herói carregado (ex.: Galneon) em outros personagens.

## Causa

Após mover skills de evolução para a aba Skills, `prepareOpen` / `changeTab` só chamavam `GET_HERO_ASCENSION_TREE` na aba Classe. Os nós ficavam em cache no `HeroDetailFlow`.

## Correção

`HeroDetailFlow` carrega ascensão também em `skills` (abrir e trocar aba). Em falha da request, zera o cache.
