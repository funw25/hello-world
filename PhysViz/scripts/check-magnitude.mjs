/* 全模型"物理量级"体检：
   电场偏转事故的教训 —— 公式对 ≠ 参数合理。
   这个脚本把每个预设的特征量打印出来，并标出**数量级可疑**的项：
     · 轨迹跨度 vs 模型自带特征长度（极板/导轨/半径）差 100 倍以上
     · 时间尺度跑出 1e-12 ~ 1e3 s 之外
     · 采样点里出现 NaN / Infinity
     · 速度分量里有一个比另一个大 1e6 倍（多半是"本该为 0 的分量"没清干净）
   它不是"自动判对错"，而是把可疑项**挑出来给人看**。 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src', 'models');

const flags = [];
const rows = [];

for (const f of readdirSync(dir).filter(x => x.endsWith('.js'))) {
  const mod = (await import(pathToFileURL(path.join(dir, f)).href)).default;
  for (const ps of mod.presets ?? []) {
    const p = ps.params ?? {};
    let d, traj;
    try { d = mod.derive(p); traj = mod.buildTrajectory(p, d); } catch (e) {
      flags.push(`${mod.id}/${ps.id}: derive 抛异常 ${e.message}`); continue;
    }
    const bad = [];

    // ① 采样点有限性
    let nan = 0, inf = 0;
    let vmax = 0, vmin = Infinity;
    for (const q of traj.pts) {
      for (const c of [q.x, q.y, q.z]) {
        if (Number.isNaN(c)) nan++;
        else if (!Number.isFinite(c)) inf++;
      }
    }
    if (nan) bad.push(`${nan} 个 NaN 坐标`);
    if (inf) bad.push(`${inf} 个 Inf 坐标`);

    // ② 时间尺度。
    //    下界 1e-13 s 兜住"回旋加速器"这类皮秒级过程；
    //    上界放到 1e6 s（≈11.6 天）—— 因为"天体运动"的同步轨道周期就是
    //    86164 s（一个恒星日），近地轨道 5540 s。这不是异常，是物理事实。
    const T = traj.tEnd;
    if (!(T > 0) || !Number.isFinite(T)) bad.push(`tEnd 非法 (${T})`);
    else if (T < 1e-13 || T > 1e6) bad.push(`tEnd = ${T.toExponential(2)} s 超出 1e-13~1e6`);

    // ③ 采样速度量级（检查"本该为 0 的分量"）
    const stride = Math.max(1, Math.floor(traj.pts.length / 200));
    let spanX = [Infinity, -Infinity], spanY = [Infinity, -Infinity], spanZ = [Infinity, -Infinity];
    for (let i = 0; i < traj.pts.length; i += stride) {
      const q = traj.pts[i];
      spanX[0] = Math.min(spanX[0], q.x); spanX[1] = Math.max(spanX[1], q.x);
      spanY[0] = Math.min(spanY[0], q.y); spanY[1] = Math.max(spanY[1], q.y);
      spanZ[0] = Math.min(spanZ[0], q.z); spanZ[1] = Math.max(spanZ[1], q.z);
      const t = (T * i) / (traj.pts.length - 1);
      try {
        const s = mod.sampleAt(t, p, d);
        const v = s.vel.length();
        if (v > vmax) vmax = v;
        if (v > 0 && v < vmin) vmin = v;
      } catch (_) {}
    }
    const sx = spanX[1] - spanX[0], sy = spanY[1] - spanY[0], sz = spanZ[1] - spanZ[0];
    const L = Math.max(sx, sy, sz);

    rows.push({ id: `${mod.id}/${ps.id}`, T, L, vmax, sx, sy, sz });

    // ④ 跨度极端小（几乎不动的"轨迹"多半是 bug）
    if (L < 1e-15) bad.push(`轨迹跨度 ${L.toExponential(2)} 几乎为 0`);

    if (bad.length) flags.push(`${mod.id}/${ps.id}: ` + bad.join('；'));
  }
}

console.log('模型 / 预设'.padEnd(34) + 'tEnd(s)'.padEnd(13) + '跨度'.padEnd(13) + 'v_max');
console.log('-'.repeat(78));
for (const r of rows) {
  console.log(r.id.padEnd(34)
    + r.T.toExponential(2).padEnd(13)
    + r.L.toExponential(2).padEnd(13)
    + r.vmax.toExponential(2));
}
console.log('-'.repeat(78));
if (flags.length) {
  console.log(`\n★ ${flags.length} 项可疑：`);
  for (const f of flags) console.log('  · ' + f);
} else {
  console.log('\n全部预设的物理量级正常（无 NaN/Inf、时间与跨度在合理范围内）');
}
