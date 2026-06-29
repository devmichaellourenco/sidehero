# 137 — Release Chrome Web Store v0.8.0

## Versão

- `manifest.json` → **0.8.0**
- `package.json` → **0.8.0** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test`
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.8.0.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.8.0.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.8.0.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.8.0.zip`

## Destaques desta versão (0.7.2 → 0.8.0)

- Wow Strip para recompensas, pendências e celebrações
- Árvore de melhorias com grafo de dependências e tooltips
- Módulo Player Delight integrado à Wow Strip (substitui cards/overlays flutuantes)
- Retratos reais em unlocks; Paladino renomeado para Valerius
- Espada padrão exclusiva do Galneon na loja
- Correções de piscar na Wow Strip e abrir baú durante pause
