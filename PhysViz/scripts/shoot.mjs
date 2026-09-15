/* ============================================================
   无头 Chrome 批量截图
   ------------------------------------------------------------
   用法：node scripts/shoot.mjs <输出目录> [--urls=a,b,c]
   默认跑一组"每个模型各一张"的验收截图。

   两个坑（都踩过）：
     1. 必须给每个实例独立的 --user-data-dir，否则连拍时多个 Chrome
        抢同一个默认 profile 锁，进程会被 SIGTERM 掉。
     2. 单张截图要 5~15 秒（要等 WebGL 初始化 + 首帧），
        所以整批必须放到后台跑，不能占着前台超时。
   ============================================================ */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const run = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE = 'C:/Users/fnw/AppData/Local/Temp/physviz-chrome';

const outDir = resolve(root, process.argv[2] || 'shots');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const page = pathToFileURL(join(root, 'dist/index.html')).href;

/* 默认验收清单：覆盖每个模型的默认预设与视角，
   外加"同一场景 × 三套配色"的对比组 —— 配色是"看着好像差不多"的重灾区，
   必须留下可对照的图。 */
const SHOTS = [
  ['vm-classic',      'model=velocity-matching&preset=classic&t=0.35&pause=1'],
  ['vm-selector',     'model=velocity-matching&preset=selector&t=0.5&pause=1'],
  ['vm-bigB',         'model=velocity-matching&preset=bigB&t=0.5&pause=1'],
  ['vm-helix',        'model=velocity-matching&preset=helix&t=0.4&pause=1'],
  ['proj-flat',       'model=projectile&preset=flat&t=0.6&pause=1'],
  ['proj-oblique',    'model=projectile&preset=oblique&t=0.5&pause=1'],
  ['proj-moon',       'model=projectile&preset=moon&t=0.6&pause=1'],
  ['proj-spatial',    'model=projectile&preset=spatial&t=0.5&pause=1'],
  ['mag-electron',    'model=magnetic-circle&preset=electron&t=0.45&pause=1'],
  ['mag-v2',          'model=magnetic-circle&preset=v2&t=0.45&pause=1'],
  ['mag-proton',      'model=magnetic-circle&preset=proton&t=0.45&pause=1'],
  ['mag-helix',       'model=magnetic-circle&preset=helix&t=0.6&pause=1'],
  ['pen-base',        'model=conical-pendulum&preset=base&t=0.4&pause=1'],
  ['pen-sameH',       'model=conical-pendulum&preset=sameH&t=0.4&pause=1'],
  ['shm-base',        'model=shm&preset=base&t=0.3&pause=1'],
  ['shm-amp2',        'model=shm&preset=amp2&t=0.3&pause=1'],
  ['orbit-leo',       'model=orbit&preset=leo&t=0.3&pause=1'],
  ['orbit-geo',       'model=orbit&preset=geo&t=0.3&pause=1'],
  ['orbit-hohmann',   'model=orbit&preset=hohmann&t=0.25&pause=1'],
  ['theme-classroom', 'model=velocity-matching&preset=classic&theme=classroom&t=0.42&pause=1'],
  ['theme-paper',     'model=velocity-matching&preset=classic&theme=paper&t=0.42&pause=1'],
  ['theme-soft',      'model=velocity-matching&preset=classic&theme=soft&t=0.42&pause=1'],
];

const only = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const list = only ? SHOTS.filter(s => only.split(',').includes(s[0])) : SHOTS;

let ok = 0, bad = [];
for (const [name, q] of list) {
  const out = join(outDir, `v8_${name}.png`).replace(/\\/g, '/');
  const args = [
    '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader',
    '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${PROFILE}-${name}`,
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
    console.log(`  ✗ ${name}  ${String(e.message).slice(0, 120)}`);
  }
}

console.log(`\n${ok}/${list.length} 张成功${bad.length ? '，失败：' + bad.join(', ') : ''}`);
