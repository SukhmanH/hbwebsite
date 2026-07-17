import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const sourceFile = resolve(rootDir, 'vineyard-vigor/outputs/dashboard/index.html');
const targetFile = resolve(rootDir, 'public/vigor/index.html');

if (!existsSync(sourceFile)) {
  console.error(`Dashboard build not found at ${sourceFile}`);
  process.exit(1);
}

mkdirSync(dirname(targetFile), { recursive: true });
copyFileSync(sourceFile, targetFile);
console.log(`Synced dashboard to ${targetFile}`);
