# 135 — Release Chrome Web Store v0.7.0

## Versão

- `manifest.json` → **0.7.0**
- `package.json` → **0.7.0** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test`
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.7.0.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.7.0.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.7.0.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.7.0.zip`

## Destaques desta versão (0.6.1 → 0.7.0)

- Combate temporal com fila paralela e cooldowns consistentes
- Sistema elemental completo (resistências, mitigação, DOT, tier scaling)
- Inventário em grid, baú de itens e Forja Divina
- Intermissão de combate com overlays CLEAR/WARNING/DEFEAT
- Sprites por ascensão e setas de navegação na ficha de herói
- Stage scaling, XP por nível e wipe na fase anterior
