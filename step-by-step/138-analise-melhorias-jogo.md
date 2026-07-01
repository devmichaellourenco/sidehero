# 138 — Análise de melhorias do jogo

Documento de referência com oportunidades de evolução do Side Hero (v0.8+), priorizadas por impacto no jogador.

## Alto impacto, esforço moderado

### 1. Completar sprites de inimigos
~26 de 53 inimigos de campanha têm sprite dedicado; o restante usa goblin genérico. Pipeline pronto (`EnemySpriteCatalog` + cópia automática em `copy-assets.mjs`).

### 2. Onboarding da primeira sessão
Sem tutorial guiado. Sugestão: 3–4 tooltips contextuais (primeiro baú, pontos de herói, primeira melhoria).

### 3. Fase D — UX inline e drag-and-drop
Ver `139-fase-d-ux-inline-drag-drop.md`. Equipar sem modal empilhado; arrastar gear, stash e formação.

### 4. Revisar aliases de sprite
Arquivos como `denver` e `goblin_left` devem bater com o inimigo correto no roster.

## Dopamina e loop idle

### 5. Wow Strip mais inteligente
Prioridade visual clara, evitar repetir banner dispensado, destaque maior para loot raro/epic.

### 6. Relatório idle enriquecido
Resumo de sessão na Wow Strip (ouro, fases, baús, level-ups).

### 7. Meta entre temporadas
Persistência leve além do wipe (cosmético, bônus, árvore permanente).

## Combate e profundidade

### 8. Ícones de skills
Várias skills ainda usam placeholder (`attack`/`weapon`).

### 9. Feedback elemental na UI
Resistências e fraquezas visíveis no card do inimigo e nas skills.

### 10. Bench com propósito
Sinergia de composição, substituto automático ao cair, XP de reserva mais claro na UI.

## Produto e distribuição

### 11. Chrome Web Store
Screenshots reais, GIF curto, descrição focada no hook do painel lateral.

### 12. Performance do side panel
Sprites grandes (1024²), tamanho do zip, lazy load onde fizer sentido.

## Qualidade técnica

### 13. Atualizar docs step-by-step
Referências a controllers removidos (PendingActionsBar, BattleChestAffordance, delight overlays).

### 14. Testes de apresentação
Wow Strip, sprites, drag-and-drop — evitar regressões visuais.

## Priorização sugerida

| Ordem | Foco |
|-------|------|
| 1 | Sprites inimigos tier 1–2 |
| 2 | Onboarding leve |
| 3 | Fase D UX (inline + DnD) |
| 4 | Polish Wow Strip + idle |
| 5 | Meta entre temporadas |
