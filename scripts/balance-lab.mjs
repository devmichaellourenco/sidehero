#!/usr/bin/env node
/**
 * Laboratório de balanceamento local (não entra no zip da extensão).
 * Uso: npm run balance-lab
 */
import * as esbuild from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'tools/balance-lab/dist');
const port = Number(process.env.BALANCE_LAB_PORT ?? 5179);

async function build() {
  await mkdir(outDir, { recursive: true });
  await esbuild.build({
    entryPoints: [join(root, 'tools/balance-lab/lab.ts')],
    outfile: join(outDir, 'lab.js'),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    sourcemap: true,
    logLevel: 'info',
  });
  await copyFile(join(root, 'tools/balance-lab/index.html'), join(outDir, 'index.html'));
  await copyFile(join(root, 'tools/balance-lab/lab.css'), join(outDir, 'lab.css'));
}

function contentType(path) {
  if (path.endsWith('.html')) return 'text/html; charset=utf-8';
  if (path.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (path.endsWith('.css')) return 'text/css; charset=utf-8';
  if (path.endsWith('.map')) return 'application/json';
  return 'application/octet-stream';
}

async function main() {
  await build();

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
      let pathname = url.pathname === '/' ? '/index.html' : url.pathname;
      const filePath = join(outDir, pathname.replace(/^\//, ''));
      if (!filePath.startsWith(outDir)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });

  server.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}/`;
    console.log(`\nBalance Lab: ${url}`);
    console.log('Ctrl+C para encerrar.\n');
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
