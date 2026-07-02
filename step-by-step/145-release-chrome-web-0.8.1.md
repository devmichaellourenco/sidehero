# 145 — Release Chrome Web Store v0.8.1

## Versão

- `manifest.json` → **0.8.1**
- `package.json` → **0.8.1** (sincronizado)

## Script de release

```bash
npm run release
```

Executa:
1. `npm test`
2. `npm run build`
3. Remove legado `dist/content/` (content scripts antigos)
4. Gera `releases/side-hero-v0.8.1.zip` (sem `.map`)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `scripts/pack-release.mjs` | Build + zip para Chrome Web Store |
| `releases/side-hero-v0.8.1.zip` | Pacote para upload |
| `releases/RELEASE_NOTES_v0.8.1.md` | Notas para a loja |

## Upload

Chrome Web Store → Pacote → Upload de `releases/side-hero-v0.8.1.zip`

## Destaques desta versão (0.8.0 → 0.8.1)

- Skills por slot sem ouro; drawer do herói reorganizado
- Heróis e Formação em modais; barra inferior com 3 botões por linha
- Celebrações Wow em overlay central; inbox no header (✦)
- Configurações na barra inferior; overlay ACAMPAMENTO centralizado
