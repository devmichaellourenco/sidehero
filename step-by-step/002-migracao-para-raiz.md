# Step-by-Step — Migração para diretório raiz

## Data: 06/06/2025

## O que aconteceu

O MVP foi criado inicialmente em `dev/afiliado-extensao/`, mas o diretório correto do projeto é a **raiz `cbh/`**.

O usuário recortou e colou todo o conteúdo para `/home/michael/devTestes/cbh/`.

## Estrutura atual (raiz `cbh/`)

```
cbh/
├── src/              → Código-fonte (DDD)
├── dist/             → Build da extensão Chrome
├── scripts/          → Build e geração de ícones
├── step-by-step/     → Documentação de progresso
├── manifest.json     → Manifest Chrome MV3
├── package.json
└── tsconfig.json
```

## Comandos a partir de agora

```bash
cd /home/michael/devTestes/cbh
npm install --cache ./.npm-cache
npm run build
```

Carregar no Chrome: pasta `dist/` dentro de `cbh/`.

## Status

✅ Projeto consolidado na raiz `cbh/`
