# 070 — Ícones de skills no painel Heróis

## Objetivo

No painel principal de Heróis, substituir o **nome textual** das skills ativas por **ícones** e exibi-las **lado a lado** (horizontal).

## Alterações

### `HeroActiveSkillsPresentation.ts`
- Usa `getSkillIconUrl` + `imgTag` no lugar de `.hero-skill-chip-label`
- Mantém tooltip (`data-skill-tooltip`) e `aria-label` com nome + rank

### `panel.css`
- `.hero-active-skills`: `grid` 3 colunas → `flex` horizontal
- `.hero-skill-chip`: chip compacto 24×24px com ícone 16×16px
- Slot vazio: quadrado tracejado sem texto

## Validação

```bash
npm test
npm run build
```
