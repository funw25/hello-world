/* ============================================================
   定向截图：本轮"全部检查"修过的场景
   ------------------------------------------------------------
   用法：node scripts/shoot-audit.mjs
   输出：shots/a_<name>.png

   坑（见 MEMORY.md）：
     · 必须 --disable-gpu，不能用 --disable-gpu-sandbox（后者挂死）
     · 每张要独立 --user-data-dir，跑完要清，否则 profile 会堆到 GB 级
   ============================================================ */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROF_BASE = 'C:/Users/fnw/AppData/Local/Temp/physviz-shot';

const outDir = resolve(root, 'shots');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const page = pathToFileURL(join(root, 'dist/index.html')).href;

const SHOTS = [
  // 单摆：大角度（本轮从"线性化"改成"精确解"，T 应从 2.01 s 变 2.21 s）
  ['pend-large', 'model=pendulum&preset=large&t=0.02&pause=1'],
  ['pend-small', 'model=pendulum&preset=small&t=0.02&pause=1'],
  ['pend-end',   'model=pendulum&preset=large&t=0.999&pause=1'],
  // 简谐运动：t=3T 处（原显示"速度 v=1.39 fm/s"，现应显示 0 m/s）
  ['shm-end',    'model=shm&preset=base&t=0.999&pause=1'],
  ['shm-eq',     'model=shm&preset=fromEq&t=0&pause=1'],
  // 电场偏转：撞板（文案曾自相矛盾）
  ['ed-strong',  'model=electric-deflection&preset=strong&t=0.999&pause=1'],
  // 平抛：落地（原显示"高度 y=3.55 fm"）
  ['proj-land',  'model=projectile&preset=flat&t=0.999&pause=1'],
  ['proj-apex',  'model=projectile&preset=vertical&t=0.5&pause=1'],
];

/* 开跑前先扫掉上一轮残留的 profile —— 命令被 SIGTERM 打断时
   finally 里的删除执行不到，profile 会越堆越多。 */
function sweep() {
  const dir = dirname(PROF_BASE);
  const base = PROF_BASE.split(/[\\/]/).pop();
  let n = 0;
  for (const d of readdirSync(dir)) {
    if (d.startsWith(base)) {
      try { rmSync(join(dir, d), { recursive: true, force: true }); n++; } catch (_) {}
    }
  }
  if (n) console.log(`（清掉 ${n} 个残留 profile）`);
}
sweep();

let ok = 0;
const bad = [];
for (const [name, q] of SHOTS) {
  const out = join(outDir, `a_${name}.png`).replace(/\\/g, '/');
  const args = [
    '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader',
    '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${PROF_BASE}-${name}`,
    '--window-size=1600,1000', '--hide-scrollbars',
    '--virtual-time-budget=6000',
    `--screenshot=${out}`,
    `${page}?${q}`,
  ];
  try {
    await run(CHROME, args, { timeout: 60000, maxBuffer: 1 << 24 });
    ok++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    bad.push(name);
    console.log(`  ✗ ${name}  ${String(e.message).slice(0, 140)}`);
  }
}
sweep();
console.log(`\n${ok}/${SHOTS.length} 张成功${bad.length ? '，失败：' + bad.join(', ') : ''}`);
