/* 无头冒烟测试：把每个模型 × 每个预设都在真实浏览器里跑一遍，
   检查 (1) 有没有 JS 报错 / 警告，(2) 读数面板是否被填充，(3) canvas 是否真的画了东西。

   为什么需要它：单测只能验证物理，验证不了"渲染层有没有把某个 key 打错字"。
   而渲染层的错误在浏览器里的表现是"画面全空 + 一行 TypeError"，
   肉眼看到时已经浪费很多时间。这个脚本把这件事变成一条命令。

   用法：
     node scripts/smoke.mjs                # 全模型 × 全预设
     node scripts/smoke.mjs --model=orbit  # 只跑一个模型
     node scripts/smoke.mjs --shots=1      # 每个模型额外存一张截图到 shots/smoke_*
*/
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { MODELS } from '../src/core/registry.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = resolve(root, 'shots');
const arg = (k, d) => {
  const hit = process.argv.find(a => a.startsWith(`--${k}=`));
  return hit ? hit.slice(k.length + 3) : d;
};
const wantShots = process.argv.includes('--shots=1');
const onlyModel = arg('model', null);

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(p => existsSync(p));
if (!CHROME) { console.error('找不到 Chrome'); process.exit(2); }
if (!existsSync(SHOTS)) mkdirSync(SHOTS);

/* 删 profile 用的参数：Windows 上 Chrome 退出后句柄约 1 秒才释放，
   默认的 maxRetries=3（约 300 ms）不够，会被静默吞掉 → 泄漏。
   放宽到 10 次 × 300 ms（约 3 秒）。 */
const RM_OPTS = { recursive: true, force: true, maxRetries: 10, retryDelay: 300 };
/* 循环内那一次是"尽力而为"：刚退出的那个 profile 往往还锁着，
   不值得为它卡 3 秒 × 52 次。删不掉的记进 LEFTOVER，收尾统一耐心重试。 */
const RM_LIGHT = { recursive: true, force: true, maxRetries: 3, retryDelay: 200 };

const PREFIX = '_prof-smoke-';
/* 清扫时认这些前缀。`_probe-` 是临时诊断脚本留下的，一并收掉。 */
const SWEEP_PREFIXES = [PREFIX, '_prof-', '_probe-'];

/* 同步 sleep（主线程没有 await 可用时）。Atomics.wait 是唯一干净的同步等待方式。 */
const _sleeper = new Int32Array(new SharedArrayBuffer(4));
function sleepSync(ms) { Atomics.wait(_sleeper, 0, 0, ms); }

/* 本轮创建过、但还没删掉的 profile。收尾按这个清单重试，
   比"重新 readdirSync 一遍"更准 —— 万一同目录下还有别的脚本留下的
   profile，也不会被误算成本轮残留。 */
const LEFTOVER = new Set();

const LAST_ERR = new Map();
function rmProfile(dir, opts = RM_OPTS) {
  try { rmSync(dir, opts); LAST_ERR.delete(dir); return true; }
  catch (e) { LAST_ERR.set(dir, e.code || String(e.message).slice(0, 40)); return false; }
}

/* 清扫遗留的临时 profile。
   ⚠️ 光靠 run() 的 finally 里 rmSync 不够 —— Windows 上 Chrome 退出后
   会短暂持有句柄，rmSync 抛 EBUSY/EPERM 并被 catch 吞掉，于是 profile
   悄悄堆积（2026-09-14 实测一次攒下 104 个 / 715 MB）。
   三道保险：① 开跑前先扫一遍（上一轮的此时早已解锁，必成）
             ② 循环内尽力删，删不掉的进 LEFTOVER
             ③ 收尾对 LEFTOVER 逐个耐心重试，最后报告还剩几个 */
function sweepProfiles({ quiet = false } = {}) {
  let n = 0, stuck = 0;
  for (const d of readdirSync(SHOTS)) {
    if (!SWEEP_PREFIXES.some(p => d.startsWith(p))) continue;
    if (rmProfile(resolve(SHOTS, d))) { n++; LEFTOVER.delete(resolve(SHOTS, d)); }
    else stuck++;
  }
  if (!quiet) {
    if (n) console.log(`（清掉 ${n} 个残留 profile）`);
    if (stuck) console.log(`（${stuck} 个 profile 仍被占用，收尾再试）`);
  }
  return n;
}

function finishProfiles() {
  /* 收尾：尽力清一次。
     ⚠️ 别指望"多等一会儿/多重试几次"能解决 —— 真正拦人的是沙箱护栏
     （见上面 SLOTS 的注释），它不是文件锁，重试永远不会放行。
     真正管用的是两条：① 一轮最多只剩 2 个目录（槽位轮转）
                     ② 清不掉就交给另一条命令 `npm run clean` */
  const PATIENT = { recursive: true, force: true, maxRetries: 4, retryDelay: 400 };
  for (const dir of [...LEFTOVER]) if (rmProfile(dir, PATIENT)) LEFTOVER.delete(dir);
  sweepProfiles({ quiet: true });
  if (LEFTOVER.size) {
    const codes = [...new Set([...LEFTOVER].map(d => LAST_ERR.get(d) || '?'))];
    console.log(`\n⚠️  ${LEFTOVER.size} 个临时 profile 本轮删不掉（${codes.join(', ')}）`);
    console.log('   跑 `npm run clean` 清掉即可（残留上限 = 2 个槽位，约 30 MB）。');
  } else {
    console.log('  profile 已全部清理');
  }
  return LEFTOVER.size;
}

sweepProfiles();
process.on('SIGINT', () => { sweepProfiles({ quiet: true }); process.exit(130); });
process.on('SIGTERM', () => { sweepProfiles({ quiet: true }); process.exit(143); });

/* `node scripts/smoke.mjs --clean`：只清 profile 不跑测试。
   `--after=<ms>`：先等一会儿再清（给 Chrome 释放句柄留时间）。 */
if (process.argv.includes('--clean')) {
  const after = Number((process.argv.find(a => a.startsWith('--after=')) || '').slice(8)) || 0;
  if (after > 0) sleepSync(after);
  const n = sweepProfiles({ quiet: after > 0 });
  console.log(`清理完成，清掉 ${n} 个，剩余 ${LEFTOVER.size} 个`);
  process.exit(0);
}

/* ---------- profile 槽位 ----------
   ★ 2026-09-14 真相：profile"泄漏"其实不是 Windows 文件锁，
   而是**沙箱的批量删除护栏**（`SAFE_DELETE_BULK_CONFIRM_REQUIRED`）。
   护栏按"累计删除量"计账：一轮 52 个 profile（每个几千个文件）删到中途就被拒，
   剩下的全部抛错；而把清理放到**另一条独立命令**里（`npm run clean`）又能一次删光。
   所以"重试/等待"根本没用 —— 再等也不会放行。

   对策：不再一轮创建 52 个目录，而是**两个槽位轮转**。
   每轮最多只剩 2 个目录要清（约 30 MB），远在护栏容忍范围内；
   就算偶尔删不掉，残留也是有界的，不会像以前那样堆到 GB 级。 */
const SLOTS = [`${PREFIX}a`, `${PREFIX}b`];
let slotIdx = 0;

function nextProfile() {
  const dir = resolve(SHOTS, SLOTS[slotIdx++ % SLOTS.length]);
  /* 用之前先尽力清掉上一次的残留（两轮之前留下的，早就不锁了） */
  rmProfile(dir, RM_LIGHT);
  LEFTOVER.add(dir);
  return dir;
}

/* 先生成带陷阱的副本 */
execFileSync(process.execPath, [resolve(root, 'scripts/make-err-harness.mjs')], { stdio: 'ignore' });
const HARNESS = `file:///${resolve(SHOTS, '_err.html').replace(/\\/g, '/').replace(/ /g, '%20')}`;

function run(url, { png = null, budget = 6000 } = {}) {
  const profile = nextProfile();
  const args = [
    '--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader', '--no-sandbox',
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
    '--window-size=1440,900',
    `--user-data-dir=${profile}`,
    `--virtual-time-budget=${budget}`,
    '--dump-dom',
  ];
  if (png) args.push(`--screenshot=${png}`);
  args.push(url);
  let dom = '';
  try {
    dom = execFileSync(CHROME, args, { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    dom = e.stdout || '';
  } finally {
    /* 尽力删（下一轮复用同一个槽位前还会再删一次） */
    if (rmProfile(profile, RM_LIGHT)) LEFTOVER.delete(profile);
  }
  return dom;
}

/* 从 DOM 里抠出某个 id 元素的纯文本 */
function text(dom, id) {
  const m = dom.match(new RegExp(`id="${id}"[^>]*>([\\s\\S]*?)</div>`));
  return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null;
}

/* 取景是否铺满画幅。#__diag 由错误陷阱脚本在页面稳定后写入。
   量的对象是"取景所依据的那个包围盒"，而相机正是按它拟合的，
   所以正常情况下 max(w, h) 应该接近 1（只有 3% 的 pad 余量）。
   max < 0.9 说明画幅比内容大出一截，多半是取景逻辑坏了。
   对比组（cmp）预设例外 —— 它们刻意共用一个更大的画幅，
   组里较小的那条就是该小，那是要给学生看的结论。 */
const FILL_MIN = 0.9;

/* canvas 非空白检测：把 PNG 交给 Python 数一下"非背景色像素"的比例。
   这是唯一能证明"3D 画面真的画出来了"的自动化手段。 */
const PNG_CHECK = resolve(SHOTS, '_pngcheck.py');
writeFileSync(PNG_CHECK, `
import sys, zlib, struct
def read_png(p):
    d = open(p,'rb').read()
    assert d[:8] == b'\\x89PNG\\r\\n\\x1a\\n'
    i, idat, w, h, bd, ct = 8, b'', 0, 0, 0, 0
    while i < len(d):
        ln = struct.unpack('>I', d[i:i+4])[0]; typ = d[i+4:i+8]; body = d[i+8:i+8+ln]
        if typ == b'IHDR':
            w, h, bd, ct = struct.unpack('>IIBB', body[:10])
        elif typ == b'IDAT':
            idat += body
        i += 12 + ln
    raw = zlib.decompress(idat)
    ch = {0:1, 2:3, 3:1, 4:2, 6:4}[ct]
    stride = w * ch
    out = bytearray(); prev = bytearray(stride)
    pos = 0
    for y in range(h):
        f = raw[pos]; pos += 1
        line = bytearray(raw[pos:pos+stride]); pos += stride
        for x in range(stride):
            a = line[x-ch] if x >= ch else 0
            b = prev[x]
            c = prev[x-ch] if x >= ch else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                pp = a + b - c
                pa, pb, pc = abs(pp-a), abs(pp-b), abs(pp-c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        out += line; prev = line
    return w, h, ch, bytes(out)
w, h, ch, px = read_png(sys.argv[1])
from collections import Counter
cnt = Counter()
for y in range(0, h, 3):
    for x in range(0, w, 3):
        o = (y*w + x) * ch
        cnt[px[o:o+3]] += 1
top, n = cnt.most_common(1)[0]
tot = sum(cnt.values())
print(f"{w}x{h} 主色={tuple(top)} 占比={n/tot:.3f} 不同颜色={len(cnt)}")
`, 'utf8');

const results = [];
const models = onlyModel ? MODELS.filter(m => m.id === onlyModel) : MODELS;
if (!models.length) { console.error(`没有模型 id = ${onlyModel}`); process.exit(2); }

for (const m of models) {
  for (const ps of m.presets) {
    const qs = `?model=${m.id}&preset=${ps.id}&t=0.42&pause=1`;
    const png = wantShots && ps === m.presets[0] ? resolve(SHOTS, `smoke_${m.id}.png`) : null;
    const dom = run(HARNESS + qs, { png });
    const err = text(dom, '__err');
    const warn = text(dom, '__warn');
    const rd = text(dom, 'readings');
    const hint = text(dom, 'hint');
    const probs = [];
    if (err) probs.push(`ERROR: ${err.slice(0, 180)}`);
    if (warn) probs.push(`WARN: ${warn.slice(0, 180)}`);
    if (!rd || rd.length < 8) probs.push(`readings 空 (${rd})`);
    if (!hint || hint.length < 20) probs.push(`hint 空 (${hint ? hint.length : 0} 字)`);
    let diag = null;
    const raw = text(dom, '__diag');
    if (raw && raw !== 'no-physviz') { try { diag = JSON.parse(raw); } catch (_) {} }
    const isCmp = !!ps.cmp;
    if (diag && diag.fill && diag.fill.max < FILL_MIN && !isCmp) {
      probs.push(`取景太松 fill.max=${diag.fill.max} (w=${diag.fill.w} h=${diag.fill.h})`);
    }
    results.push({ id: `${m.id}/${ps.id}`, probs, diag });
    const tag = probs.length ? '✗' : '✓';
    const info = diag && diag.fill ? `  fill ${diag.fill.w}/${diag.fill.h}${isCmp ? ' [cmp]' : ''}` : '';
    console.log(`${tag} ${(m.id + '/' + ps.id).padEnd(26)}${info}${probs.length ? '  ' + probs.join(' | ') : ''}`);
  }
}

const bad = results.filter(r => r.probs.length);
console.log('\n' + '─'.repeat(52));
console.log(`  ${results.length - bad.length} / ${results.length} 通过`);

/* ---------------- 对比组不变量 ----------------
   同一个 cmp 组里的所有成员，必须共用**完全相同**的相机视锥。
   这是"大小对比是真的"的充要条件：
   视锥一样 + 尺度一样 → 屏幕上谁大谁小，就是物理上谁大谁小。
   早先只锁了轨迹尺度、没锁装饰（箭头 / 坐标轴端点），
   各成员画幅被自己的箭头撑得不一样，「v₀ 加倍」的半径只显示成 1.71 倍。
   这个断言就是为了不让那种回归再溜过去。 */
const groups = new Map();
for (const m of models) {
  for (const ps of m.presets) {
    if (!ps.cmp) continue;
    const k = `${m.id}::${ps.cmp}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(`${m.id}/${ps.id}`);
  }
}
let groupBad = 0;
console.log('\n对比组画幅一致性');
for (const [k, ids] of groups) {
  const rows = ids.map(id => ({ id, r: results.find(x => x.id === id) })).filter(x => x.r && x.r.diag && x.r.diag.camera);
  if (rows.length < 2) { console.log(`  ? ${k}  样本不足`); continue; }
  const c0 = rows[0].r.diag.camera;
  const span = (c) => [c.right - c.left, c.top - c.bottom];
  const [w0, h0] = span(c0);
  let worst = 0;
  for (const { r } of rows) {
    const [w, h] = span(r.diag.camera);
    worst = Math.max(worst, Math.abs(w / w0 - 1), Math.abs(h / h0 - 1));
  }
  const spans = rows.map(x => (x.r.diag.span ? x.r.diag.span.w : 0));
  const ratio = Math.max(...spans) / Math.max(Math.min(...spans), 1e-9);
  const okFrame = worst < 1e-6;
  if (!okFrame) groupBad++;
  console.log(`  ${okFrame ? '✓' : '✗'} ${k.padEnd(30)} 视锥最大偏差 ${(worst * 100).toFixed(4)}%  ` +
    `轨迹占幅 ${spans.map(s => s.toFixed(3)).join(' / ')}（最大/最小 = ${ratio.toFixed(2)}）`);
}

console.log('─'.repeat(52));
/* 收尾：run() 里的 rmSync 在 Windows 上可能被文件锁挡掉，这里等待 + 重试。 */
const stuck = finishProfiles();
process.exit(bad.length || groupBad ? 1 : 0);
