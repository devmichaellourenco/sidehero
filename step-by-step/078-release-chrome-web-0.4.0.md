# 078 — Release Chrome Web Store v0.4.0

## Versão

- `manifest.json` → **0.4.0**
- `package.json` → **0.4.0** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test` (94 testes)
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.4.0.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.4.0.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.4.0.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.4.0.zip`
