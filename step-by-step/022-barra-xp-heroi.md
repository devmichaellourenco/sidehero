# 022 — Barra de XP e tooltips de HP/XP

## Objetivo
Dar feedback visual de progresso de nível com barra de XP abaixo da barra de HP, e tooltips ao passar o mouse mostrando valores atuais e totais.

## Alterações

### Domínio / DTO
- `GameStateDto.ts`: `HeroDto` ganha `experience` e `experienceToNextLevel`
- `mapHeroToDto` lê do value object `Experience` do herói

### Apresentação
- **`HeroBarsPresentation.ts`** (novo): renderiza barras de HP e XP com tooltips
  - HP: `120 / 120 HP`
  - XP: `45 / 100 XP · faltam 55 para Lv.3`
- **`HeroPanelRenderer.ts`**: usa `renderHeroBars` nos cards compactos
- **`HeroDetailModalRenderer.ts`**: usa `renderHeroBars` na ficha do herói

### Estilos
- `panel.css`: `.hero-bars`, `.xp-bar`, `.xp-fill`, `.bar-tooltip` com hover

## Arquivos por função
| Arquivo | Função |
|---------|--------|
| `HeroBarsPresentation.ts` | Templates e textos das barras + tooltips |
| `GameStateDto.ts` | Expõe XP no DTO para a UI |
| `HeroPanelRenderer.ts` | Cards de herói com HP + XP |
| `HeroDetailModalRenderer.ts` | Ficha com HP + XP |
| `panel.css` | Visual da barra dourada de XP e tooltips |

## Ajuste — fundo e tooltips
- Fundo das barras nos cards trocado de `frame.png` (distorcia em largura total) para trilho CSS
- Tooltips via `BarTooltipBinder.ts` (portal fixo, igual equipamentos)
- Formato: `112/140` (HP) e `500/1200` (XP)

## Validação
```bash
npm run build
```
Recarregar extensão: cada herói exibe barra de XP dourada abaixo do HP; hover mostra `112/140` e `500/1200`.
