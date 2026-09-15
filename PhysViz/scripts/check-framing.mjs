/* 全模型"取景健康度"体检：
   逐个模型逐个预设，算 (轨迹纵向/横向跨度) 与"模型自带固定装饰(极板/网格/圆心等)"的比值。
   如果轨迹跨度比装饰大出一两个数量级，画面上装饰就会缩成一个点 → 看起来"模型卡住/空白"。
   这正是电场偏转那一版的病根，所以做成常驻体检脚本。 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src', 'models');

const files = readdirSync(dir).filter(f => f.endsWith('.js'));
const rows = [];

for (const f of files) {
  const mod = (await import(pathToFileURL(path.join(dir, f)).href)).default;
  for (const ps of mod.presets ?? []) {
    const p = ps.params ?? {};
    const d = mod.derive(p);
    const traj = mod.buildTrajectory(p, d);
    if (!traj?.pts?.length) continue;
    let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    for (const q of traj.pts) {
      if (q.x < xmin) xmin = q.x; if (q.x > xmax) xmax = q.x;
      if (q.y < ymin) ymin = q.y; if (q.y > ymax) ymax = q.y;
    }
    const sx = xmax - xmin, sy = ymax - ymin;
    const big = Math.max(sx, sy), small = Math.max(Math.min(sx, sy), 1e-30);
    // 收集该预设下所有 guide 点的跨度（这是"装饰"的真实尺寸）
    let gx = [Infinity, -Infinity], gy = [Infinity, -Infinity];
    try {
      const t0 = traj.tEnd * 0.5;
      const s = mod.sampleAt(t0, p, d);
      const ctx = { t: t0, p, d, s, C: {}, lw: { guide: 1 }, N: 1, EPS: 1e-30 };
      const gs = mod.guides ? mod.guides(ctx) : [];
      for (const g of gs) for (const q of g.pts) {
        if (q.x < gx[0]) gx[0] = q.x; if (q.x > gx[1]) gx[1] = q.x;
        if (q.y < gy[0]) gy[0] = q.y; if (q.y > gy[1]) gy[1] = q.y;
      }
    } catch (_) {}
    const gspan = isFinite(gx[0]) ? Math.max(gx[1] - gx[0], gy[1] - gy[0]) : null;
    rows.push({
      model: mod.id, preset: ps.id,
      sx, sy, aspect: big / small,
      guideSpan: gspan,
      guideVsTraj: gspan ? gspan / big : null,
    });
  }
}

const fmt = (v, n = 3) => (v == null || !isFinite(v) ? '   —  ' : v.toExponential(n));
console.log('模型 / 预设'.padEnd(34) + '跨度x'.padEnd(11) + '跨度y'.padEnd(11)
  + '装饰/轨迹');
console.log('-'.repeat(70));

/* 判据只用"装饰尺寸 / 轨迹尺寸"。
   注意：长宽比在本项目里**不是**合适的判据 —— 相当多模型本来就是
   平面运动或一维运动（碰撞 y 恒为 0、磁场圆周是圆、简谐是往返），
   长宽比会是 0、∞ 或任意值，却完全正常。
   真正的病征只有一个：**模型自带的固定几何（极板、网格、导轨…）
   在轨迹面前缩成了极小的一块** —— 那才是"画面空白/卡住"。
   经验阈值：装饰小于轨迹的 2% 就该报警。 */
const GUIDE_MIN = 0.02;
let warn = 0;
for (const r of rows) {
  const bad = r.guideVsTraj != null && r.guideVsTraj < GUIDE_MIN;
  if (bad) warn++;
  console.log(
    (r.model + '/' + r.preset).padEnd(34)
    + fmt(r.sx).padEnd(11) + fmt(r.sy).padEnd(11)
    + (r.guideVsTraj == null ? '  —（无固定装饰）' : r.guideVsTraj.toFixed(4))
    + (bad ? '   ← 装饰被轨迹淹没' : ''));
}
console.log('-'.repeat(70));
console.log(warn ? `${warn} 个预设的固定装饰相对轨迹过小` : '全部预设取景比例健康');
