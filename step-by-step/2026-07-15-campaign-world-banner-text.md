# Campanha mapa-mundo — textos dos banners

Data: 2026-07-15

## Objetivo

Nos banners de região do Mapa-mundo, aumentar título e subtítulo (fases concluídas) e tornar o subtítulo dourado para legibilidade sobre a arte.

## Alteração

Arquivo: `src/presentation/panel/panel.css`

- `.campaign-world-node-name`: 13px
- `.campaign-world-node-meta`: 11px, cor `var(--gold)`
- Variantes `--illustrated`: nome 14px; meta 12px dourada

Classes afetadas: `campaign-world-node-name`, `campaign-world-node-meta` (HTML em `CampaignMapPresentation.ts`).
