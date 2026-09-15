/* 定向截图：验证「半透明天体 + 新配色」。
   用法：node scripts/shoot-palette.mjs → shots/p_*.png，用 Read 肉眼确认。 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, mkdirSync } from 'node:fs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = resolve(root, 'shots');
if (!existsSync(SHOTS)) mkdirSync(SHOTS);

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(p => existsSync(p));
if (!CHROME) { console.error('找不到 Chrome'); process.exit(2); }

const BASE = `file:///${resolve(root, 'dist/index.html').replace(/\\/g, '/').replace(/ /g, '%20')}`;

const jobs = [
  // 天体：半透明（能看见指向球心的 F 矢量）+ 哑光 —— 开 force 图层验证箭头穿透可见
  { png: 'p_orbit_leo.png',      qs: '?model=orbit&preset=leo&layers=force&t=0.20&pause=1' },
  { png: 'p_orbit_hohmann.png',  qs: '?model=orbit&preset=hohmann&layers=force&t=0.30&pause=1' },
  { png: 'p_orbit_moon.png',     qs: '?model=orbit&preset=moon&layers=force&t=0.20&pause=1' },
  // 场线最密的两个模型：验证场线不再"脏"
  { png: 'p_mag_helix.png',      qs: '?model=magnetic-circle&preset=helix&t=0.20&pause=1' },
  { png: 'p_mag_electron.png',   qs: '?model=magnetic-circle&preset=electron&t=0.20&pause=1' },
  // 矢量最多的模型：验证多色可辨
  { png: 'p_vm_helix.png',       qs: '?model=velocity-matching&preset=helix&t=0.20&pause=1' },
  { png: 'p_conic_base.png',     qs: '?model=conical-pendulum&preset=base&t=0.20&pause=1' },
  { png: 'p_pend_large.png',     qs: '?model=pendulum&preset=large&t=0.20&pause=1' },
  { png: 'p_proj_flat.png',      qs: '?model=projectile&preset=flat&t=0.20&pause=1' },
  // 三主题对比（orbit 一个场景）
  { png: 'p_theme_paper.png',    qs: '?model=orbit&preset=leo&theme=paper&t=0.20&pause=1' },
  { png: 'p_theme_soft.png',     qs: '?model=orbit&preset=leo&theme=soft&t=0.20&pause=1' },
  // 批注色板：纯红/纯蓝/纯黄（留给老师）
  { png: 'p_ink.png',            qs: '?model=orbit&preset=leo&ink=shape&t=0.20&pause=1' },
];

function run(url, png, budget = 8000) {
  const profile = resolve(SHOTS, `_prof-p-${Math.random().toString(36).slice(2, 9)}`);
  const args = [
    '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader', '--no-sandbox',
    '--hide-scrollbars', '--window-size=1440,900',
    `--user-data-dir=${profile}`, `--virtual-time-budget=${budget}`,
    `--screenshot=${png}`, url,
  ];
  try {
    execFileSync(CHROME, args, { stdio: 'ignore', timeout: 60000 });
  } finally {
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch (_) {}
  }
  console.log(png, existsSync(png) ? '✓' : '✗ 未生成');
}

for (const j of jobs) run(BASE + j.qs, resolve(SHOTS, j.png));
