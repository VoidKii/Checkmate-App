import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const engineSource = resolve(root, 'node_modules/stockfish/bin');
const target = resolve(root, 'android/app/src/main/assets/stockfish');
const engineFiles = [
  'stockfish-19-lite-single.js',
  'stockfish-19-lite-single.wasm',
];

await mkdir(target, { recursive: true });
for (const file of engineFiles) {
  await copyFile(resolve(engineSource, file), resolve(target, file));
}
await copyFile(
  resolve(root, 'assets/stockfish/index.html'),
  resolve(target, 'index.html'),
);
console.log('Prepared bundled Stockfish 19 Lite single-threaded Android assets.');
