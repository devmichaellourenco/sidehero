# 030 — Sprite do Arthos (guerreiro)

## Problema

Arthos (`knight`) usava `character_sample_01`, visual de arqueiro (arco e aljava).

## Solução

| Herói | Classe | Sprite origem | Motivo |
|-------|--------|---------------|--------|
| Arthos | knight | `character_sample_03` | Armadura pesada, elmo e escudo — perfil guerreiro |
| Lyra | sorcerer | `character_sample_02` | Sem alteração |
| Elara | priest | `character_sample_01` | Libera o sample 03 para o cavaleiro |

## Arquivo alterado

- `scripts/copy-assets.mjs` — mapeamento na cópia de assets do build

## Como validar

```bash
npm run build
```

Recarregar extensão + F5 → Arthos deve aparecer com armadura/escudo na battle strip e nos modais.
