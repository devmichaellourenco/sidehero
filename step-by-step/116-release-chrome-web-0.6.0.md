# 116 — Release Chrome Web Store v0.6.0

## Versão

- `manifest.json` → **0.6.0**
- `package.json` → **0.6.0** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test`
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.6.0.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.6.0.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.6.0.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.6.0.zip`

## Destaques desta versão (0.4.0 → 0.6.0)

- Combate temporal (ASPD/Cast/Crit)
- Sistema de party + Berserker/Paladino
- Roster de 50 inimigos + skills unificadas
- UX: drawer de herói, baú flutuante, pendências, vitória
