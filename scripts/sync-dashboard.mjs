import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const targetFile = resolve(rootDir, 'public/vigor/index.html');
const sourceCandidates = [
  resolve(rootDir, 'vineyard-vigor/outputs/dashboard/index.html'),
  targetFile,
];

const sourceFile = sourceCandidates.find((candidate) => existsSync(candidate));

if (!sourceFile) {
  console.error('Dashboard build not found and no fallback page is available.');
  process.exit(1);
}

mkdirSync(dirname(targetFile), { recursive: true });
if (sourceFile !== targetFile) {
  copyFileSync(sourceFile, targetFile);
}
console.log(`Synced dashboard to ${targetFile}`);
