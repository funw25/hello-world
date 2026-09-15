/* 审计辅助：导出全部模型 × 全部预设的
   —— 文案（title / note / q / layerTip / hint）
   —— 关键特征量（由 derive() 与轨迹采样得到）
   目的是把"文案里的物理断言"和"代码算出来的数"并排放在一起，逐条核对。
   只打印，不判断。 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src', 'models');

const only = process.argv[2] || null;

for (const f of readdirSync(dir).filter(x => x.endsWith('.js')).sort()) {
  const mod = (await import(pathToFileURL(path.join(dir, f)).href)).default;
  if (only && mod.id !== only) continue;

  console.log('\n' + '='.repeat(78));
  console.log(`模型 ${mod.id} — ${mod.name}`);
  console.log(`  一句话：${mod.tagline}`);
  if (mod.layerTip) console.log(`  图层提示：${strip(mod.layerTip)}`);
  console.log('  参数：' + mod.params.map(pp =>
    `${pp.sym || pp.key}∈[${pp.min},${pp.max}]${pp.unit ? ' ' + pp.unit : ''}`).join('  '));
  console.log('='.repeat(78));

  for (const ps of mod.presets ?? []) {
    const p = ps.params ?? {};
    const d = mod.derive(p);
    const traj = mod.buildTrajectory(p, d);

    console.log(`\n▸ [${ps.id}] ${ps.title}   视角=${ps.view || mod.defaultView}`);
    console.log(`  参数：${JSON.stringify(p)}`);
    console.log(`  note：${strip(ps.note || '')}`);
    if (ps.q) console.log(`  q：${strip(ps.q)}`);

    // 特征量：tEnd、轨迹跨度、末态
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    for (const q of traj.pts) {
      if (q.x < xmin) xmin = q.x; if (q.x > xmax) xmax = q.x;
      if (q.y < ymin) ymin = q.y; if (q.y > ymax) ymax = q.y;
    }
    const last = mod.sampleAt(traj.tEnd, p, d);
    const first = mod.sampleAt(0, p, d);
    console.log(`  ▸ tEnd=${fmt(traj.tEnd)}  轨迹 x∈[${fmt(xmin)},${fmt(xmax)}] y∈[${fmt(ymin)},${fmt(ymax)}]`);
    console.log(`  ▸ 初态 pos=(${fmt(first.pos.x)},${fmt(first.pos.y)},${fmt(first.pos.z)})`
      + ` v=(${fmt(first.vel.x)},${fmt(first.vel.y)},${fmt(first.vel.z)})`);
    console.log(`  ▸ 末态 pos=(${fmt(last.pos.x)},${fmt(last.pos.y)},${fmt(last.pos.z)})`
      + ` v=(${fmt(last.vel.x)},${fmt(last.vel.y)},${fmt(last.vel.z)})`);

    // hint（需要 ctx）
    if (mod.hint) {
      try {
        const c = { t: traj.tEnd * 0.5, p, d, s: mod.sampleAt(traj.tEnd * 0.5, p, d) };
        console.log(`  hint：${strip(mod.hint(c))}`);
      } catch (e) { console.log(`  hint：<抛异常 ${e.message}>`); }
    }

    // readings 的末态值
    if (mod.readingsOf) {
      try {
        const c = { t: traj.tEnd, p, d, s: last };
        const r = mod.readingsOf(last, c);
        const items = mod.readings.map(rr => `${rr.label}=${r[rr.key]}`).join(' | ');
        console.log(`  ▸ 末态读数：${items}`);
        const c0 = { t: 0, p, d, s: first };
        const r0 = mod.readingsOf(first, c0);
        const items0 = mod.readings.map(rr => `${rr.label}=${r0[rr.key]}`).join(' | ');
        console.log(`  ▸ 初态读数：${items0}`);
      } catch (e) { console.log(`  readings：<抛异常 ${e.message}>`); }
    }

    // timeScale
    if (mod.timeScale) {
      try {
        const ts = mod.timeScale(p, d);
        console.log(`  ▸ timeScale：${JSON.stringify(ts)}`);
      } catch (e) { console.log(`  timeScale：<抛异常 ${e.message}>`); }
    }
  }
}

/* 只剥"已知的行内标签"。⚠️ 不能用通用的 /<[^>]+>/
   —— 文案里会出现真正的"小于号"，如 "顺时针（q < 0）。"
   通用正则会从 `<` 一路吃到 `</b>` 的 `>`，把 `q < 0）` 整段吞掉，
   于是审计报告里出现"文案被截断"的假阳性（2026-09-14 踩过）。 */
function strip(s) {
  return String(s)
    .replace(/<\/?(?:b|i|em|strong|sub|sup|br|span|small|code)\b[^>]*>/gi, '')
    .replace(/\s+/g, ' ').trim();
}
function fmt(v) {
  if (!isFinite(v)) return String(v);
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e4 || a < 1e-3) return v.toExponential(3);
  return v.toPrecision(4);
}
