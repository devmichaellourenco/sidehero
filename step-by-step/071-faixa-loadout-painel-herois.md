# 071 — Faixa de loadout no painel Heróis

## Objetivo

Compactar o card de herói na tela principal:
- Stats inline no cabeçalho (nível + ATK/DEF/HP)
- Barras de vida e XP inalteradas
- Uma faixa única: 3 skills | 3 equipamentos, slots 30×30px

## Layout

```
[🧙 Nome    Lv.12  ⚔12 🛡8 ❤45/50]
[barra vida]
[barra xp]
[🔥][⚔][—] | [⚔][🛡][💍]
```

## Arquivos

| Arquivo | Função |
|---------|--------|
| `HeroLoadoutStripPresentation.ts` | Orquestra skills + divisor + gear |
| `HeroActiveSkillsPresentation.ts` | `renderHeroActiveSkillSlots` com `.loadout-slot` |
| `GearPresentation.ts` | `variant: 'loadout'` + `renderHeroEquipmentLoadout` |
| `HeroPanelRenderer.ts` | Cabeçalho compacto + faixa fora do botão principal |
| `panel.css` | `.hero-loadout-strip`, `.loadout-slot`, `.hero-inline-stats` |

## Interação

- Cabeçalho + barras: clique abre ficha do herói
- Skill: abre aba Skills (`data-hero-skills-open`)
- Equipamento: abre seletor de slot (`equipment-slot-clickable`)

## Molduras das skills

Skills usam o mesmo `border-image` dos equipamentos (`frames/item-*.png`), mapeadas por branch:

| Branch | Frame |
|--------|-------|
| offense | rare |
| defense | common |
| utility | epic |
| vazio | common |

`getSkillBranchFrameUrl` em `SkillIconCatalog.ts`.

## Validação

```bash
npm test
npm run build
```
