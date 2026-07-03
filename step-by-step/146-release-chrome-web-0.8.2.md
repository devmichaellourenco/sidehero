# 146 — Release Chrome Web Store v0.8.2

## Versão

- `manifest.json` → **0.8.2**
- `package.json` → **0.8.2** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test`
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.8.2.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.8.2.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.8.2.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.8.2.zip`

## Destaques desta versão (0.8.1 → 0.8.2)

- Árvore única de melhorias com pan/zoom e ramos retos
- Heróis, economia, QoL e combate integrados ao núcleo `auto_battle_2`
- Log resumido conectado após Auto-batalha III
- Testes de apresentação: modal, viewport, layout e catálogo da árvore
