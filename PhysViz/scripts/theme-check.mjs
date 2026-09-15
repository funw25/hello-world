/* 主题对比验收：同一个模型 + 同一个预设 + 同一个视角，只换配色主题，
   各截一张图，然后逐像素统计"到底有没有换色"。

   为什么必须自动化：配色主题是"看着好像差不多"的重灾区 ——
   按钮高亮了、CSS 变量改了，但 3D 材质的颜色没跟着变，
   肉眼扫一眼很容易漏掉。这个脚本直接数像素，骗不了人。

   用法：node scripts/theme-check.mjs */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES } from '../src/core/theme.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = resolve(root, 'shots');
if (!existsSync(SHOTS)) mkdirSync(SHOTS, { recursive: true });

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(p => existsSync(p));
if (!CHROME) { console.error('找不到 Chrome'); process.exit(2); }

/* 挑一个"场线 + 轨迹 + 矢量 + 标记点"全都出现的场景，
   这样一套主题里所有会被换色的元素都在画面里 */
const Q = 'model=velocity-matching&preset=classic&t=0.42&pause=1';
const page = `file:///${resolve(root, 'dist/index.html').replace(/\\/g, '/').replace(/ /g, '%20')}`;

for (const t of THEMES) {
  const out = resolve(SHOTS, `theme_${t.id}.png`).replace(/\\/g, '/');
  const profile = resolve(SHOTS, `_prof-theme-${t.id}`);
  try {
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader', '--no-sandbox',
      '--hide-scrollbars', '--window-size=1440,900',
      `--user-data-dir=${profile}`,
      '--virtual-time-budget=6000', `--screenshot=${out}`,
      `${page}?${Q}&theme=${t.id}`,
    ], { stdio: 'ignore', timeout: 90000 });
  } finally {
    // 一个 Chrome profile 有 10~20 MB，不清会一直堆
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch (_) {}
  }
  console.log(`  ✓ ${t.id} → theme_${t.id}.png`);
}

/* 用 scripts/theme-compare.py 解码 PNG，统计 3D 画布区的颜色分布与两两差异 */
const names = THEMES.map(t => resolve(SHOTS, `theme_${t.id}.png`));
const py = ['C:/Users/fnw/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe', 'python']
  .find(p => { try { execFileSync(p, ['-c', 'pass'], { stdio: 'ignore' }); return true; } catch (_) { return false; } }) || 'python';
console.log('\n' + execFileSync(py, [resolve(root, 'scripts/theme-compare.py'), ...names], { encoding: 'utf8' }));
