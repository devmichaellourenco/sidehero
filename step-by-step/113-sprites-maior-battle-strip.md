# 113 — Sprites maiores na battle strip

## Problema

Heróis e inimigos customizados (PNG 1024×1024) apareciam menores que os placeholders do pack Demo (~204×186).

## Análise das imagens

| Sprite | Canvas | Conteúdo (alpha) | Preenchimento |
|--------|--------|------------------|---------------|
| nix_aprendiz | 1024² | ~921×950 px | ~90% |
| galneon_aprendiz | 1024² | ~889×875 px | ~87% |
| goblin | 1024² | ~921×961 px | ~90% |
| goblin_boss | 1024² | ~884×918 px | ~88% |
| saci_boss | 1024² | ~686×984 px | ~67% largura |
| slime (Demo) | 204×186 | 100% | sem margem |

Com `object-fit: contain` em caixas de 46–50 px, a margem transparente do PNG 1024² reduz o personagem visível em ~10–33% vs sprites antigos.

## Solução (CSS)

Variáveis em `.battle-strip`:

- `--strip-hero-slot: 58px` / `--strip-enemy-slot: 52px` / boss `58px`
- `--strip-sprite-zoom: 1.24` — zoom a partir da base dos pés
- `object-position: center bottom` + `transform-origin: center bottom`
- Altura da strip: `122px` → `128px`

## Arquivo

| Arquivo | Função |
|---------|---------|
| `panel.css` | Slots maiores + zoom para “cortar” margem transparente visualmente |

## Ajuste fino

Se ainda pequeno/grande, altere só `--strip-sprite-zoom` (ex.: `1.15`–`1.35`) em `.battle-strip`.

Heróis reduzidos 20% em relação ao slot inicial (`58px` → `46px`); inimigos mantidos em `52px` / boss `58px`. Zoom e `object-position` iguais para ambos.

## Validação

`npm run build` → recarregar extensão → comparar heróis/inimigos na faixa de batalha.
