/* 定向截图：碰撞模型的接触几何 + 各模型新默认视角。
   沿用 smoke.mjs 的 Chrome 调用约定（--disable-gpu / profile 落在 shots/ 并及时删）。
   用法：SHOT_JOBS='[["名字","query串"],...]' node scripts/shoot-coll.mjs  */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SHOTS = path.join(root, 'shots');
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(p => existsSync(p));
if (!CHROME) { console.error('找不到 Chrome'); process.exit(2); }
if (!existsSync(SHOTS)) mkdirSync(SHOTS);

const DIST = 'file:///' + path.join(root, 'dist', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');

function shot(name, query, budget = 5000) {
  const profile = path.join(SHOTS, '_prof-shot-' + Math.random().toString(36).slice(2, 9));
  const png = path.join(SHOTS, name + '.png');
  const args = [
    '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader', '--no-sandbox',
    '--hide-scrollbars', '--window-size=1440,900',
    '--user-data-dir=' + profile,
    '--virtual-time-budget=' + budget,
    '--screenshot=' + png.replace(/\\/g, '/'),
    DIST + '?' + query,
  ];
  try {
    execFileSync(CHROME, args, { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'], timeout: 60000 });
  } catch (e) { /* 超时/非零退出都继续，看 png 是否落地 */ }
  finally { try { rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch (_) {} }
  const ok = existsSync(png);
  console.log((ok ? 'OK  ' : 'FAIL') + '  ' + name);
  return ok;
}

const DEFAULT_JOBS = [
  ['c_face_t0',   'model=collision&preset=equal&view=face&t=0.0&pause=1'],
  ['c_face_tc',   'model=collision&preset=equal&view=face&t=0.42&pause=1'],
  ['c_face_t75',  'model=collision&preset=equal&view=face&t=0.75&pause=1'],
  ['c_iso_tc',    'model=collision&preset=equal&view=iso&t=0.42&pause=1'],
  ['c_heavy_tc',  'model=collision&preset=heavy&view=face&t=0.42&pause=1'],
  ['c_light_tc',  'model=collision&preset=light&view=face&t=0.42&pause=1'],
  ['c_headon_tc', 'model=collision&preset=headon&view=face&t=0.42&pause=1'],
];

let jobs = DEFAULT_JOBS;
try { if (process.env.SHOT_JOBS) jobs = JSON.parse(process.env.SHOT_JOBS); } catch (_) {}

/* 开跑前先扫一遍残留 profile：命令被 SIGTERM 打断时 finally 里的删除执行不到，
   profile 会越积越多（曾积 138 个 / 1.8 GB）。每跑一次先清一次，兜住这个泄漏。 */
function sweepProfiles() {
  let n = 0;
  try {
    for (const e of readdirSync(SHOTS, { withFileTypes: true })) {
      if (e.isDirectory() && e.name.startsWith('_prof-')) {
        try { rmSync(path.join(SHOTS, e.name), { recursive: true, force: true, maxRetries: 3 }); n++; } catch (_) {}
      }
    }
  } catch (_) {}
  if (n) console.log(`（清扫 ${n} 个残留 profile）`);
}
sweepProfiles();

let fail = 0;
for (const [n, q] of jobs) if (!shot(n, q)) fail++;
console.log(fail ? `\n${fail} 张失败` : '\n全部成功');
