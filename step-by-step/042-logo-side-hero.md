# 042 — Logo Side Hero (`public/logo.png`)

## Objetivo
Substituir a logo demo (`group_image_swordmark3.png`) pela logo oficial do jogo em `public/logo.png` (128×128 px).

## Alterações

### `scripts/copy-assets.mjs`
- Novo mapa **`PUBLIC_ASSET_MAP`**: `logo.png` → `dist/panel/assets/ui/brand.png`.
- Removida a entrada antiga do pacote ResourcesData que apontava para `ui/brand.png`.
- `copyAssets()` passa a copiar também de `public/`.

### Referências existentes (inalteradas)
- **`AssetCatalog.ts`**: `ASSETS.ui.brand` → `ui/brand.png`.
- **`panel.html`**: `<img class="brand-icon" src="assets/ui/brand.png">` (exibida em 40×40 px via CSS).
- **`SidebarHost.ts`**: toolbar lateral usa o mesmo asset (18×18 px via CSS).

## Arquivos

| Arquivo | Função |
|---------|--------|
| `public/logo.png` | Fonte da logo (128×128). |
| `dist/panel/assets/ui/brand.png` | Cópia gerada no build, usada na UI. |

## Validação
```bash
npm run build
```
Recarregar extensão: header do painel e ícone na toolbar da sidebar devem mostrar a nova logo Side Hero.
