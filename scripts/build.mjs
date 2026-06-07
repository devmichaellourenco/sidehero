import * as esbuild from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyAssets } from './copy-assets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

const watch = process.argv.includes('--watch');

const moduleEntryPoints = {
  'background/service-worker': join(root, 'src/presentation/background/service-worker.ts'),
  'panel/panel': join(root, 'src/presentation/panel/panel.ts'),
};

const contentScriptEntry = join(root, 'src/presentation/content/sidebar-host.ts');
const contentScriptOut = join(dist, 'content/sidebar-host.js');

async function copyStaticAssets() {
  await mkdir(join(dist, 'panel'), { recursive: true });
  await mkdir(join(dist, 'content'), { recursive: true });
  await mkdir(join(dist, 'icons'), { recursive: true });

  await copyFile(join(root, 'manifest.json'), join(dist, 'manifest.json'));
  await copyFile(join(root, 'src/presentation/panel/panel.html'), join(dist, 'panel/panel.html'));
  await copyFile(join(root, 'src/presentation/panel/panel.css'), join(dist, 'panel/panel.css'));
  await copyFile(
    join(root, 'src/presentation/content/sidebar-host.css'),
    join(dist, 'content/sidebar-host.css'),
  );
  await copyFile(join(root, 'src/presentation/icons/icon-16.png'), join(dist, 'icons/icon-16.png'));
  await copyFile(join(root, 'src/presentation/icons/icon-48.png'), join(dist, 'icons/icon-48.png'));
  await copyFile(join(root, 'src/presentation/icons/icon-128.png'), join(dist, 'icons/icon-128.png'));
}

async function build() {
  await mkdir(dist, { recursive: true });

  const moduleCtx = await esbuild.context({
    entryPoints: moduleEntryPoints,
    outdir: dist,
    bundle: true,
    format: 'esm',
    target: 'chrome110',
    sourcemap: true,
    logLevel: 'info',
  });

  const contentCtx = await esbuild.context({
    entryPoints: [contentScriptEntry],
    outfile: contentScriptOut,
    bundle: true,
    format: 'iife',
    target: 'chrome110',
    sourcemap: true,
    logLevel: 'info',
  });

  if (watch) {
    await copyStaticAssets();
    await copyAssets();
    await moduleCtx.watch();
    await contentCtx.watch();
    console.log('Watching for changes...');
  } else {
    await moduleCtx.rebuild();
    await contentCtx.rebuild();
    await copyStaticAssets();
    await copyAssets();
    await moduleCtx.dispose();
    await contentCtx.dispose();
    console.log('Build concluído em dist/');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
