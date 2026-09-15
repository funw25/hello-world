/* 针对本次新功能的定向截图：碰撞闪光 / 球大小 / 浅色地球 / 左右分屏。
   用法：node scripts/shoot-new.mjs
   输出到 shots/v3_*.png，用 Read 工具肉眼确认。 */
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
  // 碰撞预设（注意：?t= 是轨迹长度的"份数"，不是绝对秒）
  //   大球撞小球（heavy）：t_c = x0/(u1-u2) = 0.5s，tEnd ≈ 1.3s → 撞击在 0.385
  { png: 'v3_collision_pre.png',   qs: '?model=collision&preset=heavy&t=0.20&pause=1' },     // 撞击前：两球渐近
  { png: 'v3_collision_flash.png', qs: '?model=collision&preset=heavy&t=0.385&pause=1' },    // 撞击瞬间：闪光 + 大球压扁
  { png: 'v3_collision_post.png',  qs: '?model=collision&preset=heavy&t=0.65&pause=1' },     // 撞击后：小球高速弹出
  //   小球撞大球（light）：同 t_c=0.5s，tEnd ≈ 1.83s → 撞击在 0.273
  { png: 'v3_collision_light.png', qs: '?model=collision&preset=light&t=0.273&pause=1' },    // 小球撞大球、闪黄光
  // 浅色地球（classroom / paper / soft）+ 等轴视角最能看出 3D 感（高光 + 终结线）
  { png: 'v3_orbit_earth.png',     qs: '?model=orbit&preset=leo&view=iso&t=0.20&pause=1' },
  { png: 'v3_orbit_paper.png',     qs: '?model=orbit&preset=leo&theme=paper&view=iso&t=0.20&pause=1' },
  { png: 'v3_orbit_soft.png',      qs: '?model=orbit&preset=leo&theme=soft&view=iso&t=0.20&pause=1' },
  { png: 'v3_orbit_earth_top.png', qs: '?model=orbit&preset=leo&view=top&t=0.20&pause=1' },     // 俯视：高光应在顶部
  { png: 'v3_orbit_earth_front.png',qs: '?model=orbit&preset=leo&view=front&t=0.20&pause=1' },   // 前视：高光应在正面
  { png: 'v3_orbit_moon.png',      qs: '?model=orbit&preset=moon&t=0.20&pause=1' },              // 月球也是白灰 + 高光
  { png: 'v4_orbit_earth.png',     qs: '?model=orbit&preset=geo&t=0.20&pause=1' },               // geo 同步轨道：地球更远更小，仍白灰高光
  // 左右分屏：meo | geo（scaleOverride 共用尺度 → 大小关系真实可比）
  { png: 'v3_split.png',           qs: '?model=orbit&preset=meo&cmp=split&t=0.20&pause=1' },
];

function run(url, png, budget = 8000) {
  const profile = resolve(SHOTS, `_prof-new-${Math.random().toString(36).slice(2, 9)}`);
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
