// 把 esbuild 产出的 bundle 内联进 HTML，生成单文件、可离线、可 file:// 直接打开的产物
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = '<script>/*BUNDLE*/</script>';

const html = readFileSync(resolve(root, 'src/index.html'), 'utf8');
const js = readFileSync(resolve(root, 'dist/app.js'), 'utf8').replace(/<\/script>/gi, '<\\/script>');

if (!html.includes(MARKER)) {
  console.error('未找到占位符，请检查 src/index.html');
  process.exit(1);
}

// 用函数式替换，避免 bundle 里的 $& / $' 被当作替换模式
const out = html.replace(MARKER, () => `<script>\n${js}\n</script>`);
writeFileSync(resolve(root, 'dist/index.html'), out);
console.log(`✓ dist/index.html  ${(out.length / 1024).toFixed(0)} KB`);
