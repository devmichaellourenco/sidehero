import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const releasesDir = join(root, 'releases');

async function readVersion() {
  const manifestPath = join(root, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  return manifest.version;
}

async function packRelease() {
  const version = await readVersion();
  const zipName = `side-hero-v${version}.zip`;
  const zipPath = join(releasesDir, zipName);
  const legacyContent = join(dist, 'content');

  console.log('Gerando build de produção...');
  execSync('npm run build', { cwd: root, stdio: 'inherit' });

  try {
    await rm(legacyContent, { recursive: true, force: true });
  } catch {
    // legado opcional
  }

  await mkdir(releasesDir, { recursive: true });
  await rm(zipPath, { force: true });

  console.log(`Empacotando ${zipName}...`);
  execSync(
    `zip -r "${zipPath}" . -x "*.map" -x "content/*" -x "content/**/*"`,
    { cwd: dist, stdio: 'inherit' },
  );

  console.log(`\nRelease pronta: releases/${zipName}`);
  console.log('Envie este ZIP na Chrome Web Store → Pacote → Fazer upload.');
}

packRelease().catch((error) => {
  console.error(error);
  process.exit(1);
});
