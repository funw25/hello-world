/* 探针：对每个模型 × 每个预设，跑一遍 vectors / markers / segments / guides，
   检查渲染钩子有没有返回 undefined 项，以及 parallelogram.tip / legs 的 key
   是否真的存在于本次返回的矢量列表里。
   这类"某个 key 打错字"的问题在浏览器里只表现为画面空白 + 一行 TypeError，
   在这里能一次性把全部模型扫出来。用法：node scripts/probe-vectors.mjs */
import { MODELS } from '../src/core/registry.js';
import { THEMES } from '../src/core/theme.js';
import { N } from '../src/physics.js';

const theme = THEMES[0];
let bad = 0;

function mkCtx() {
  return { t: 0, p: null, d: null, traj: null, wpts: [], C: theme.scene, lw: theme.lw, N, EPS: 1e-30, s: null };
}

for (const m of MODELS) {
  const c = mkCtx();
  console.log(`\n━━ ${m.id}  (${m.presets.length} 个预设)`);
  for (const ps of m.presets) {
    const p = ps.params;
    const d = m.derive(p);
    const traj = m.buildTrajectory(p, d);
    c.p = p; c.d = d; c.traj = traj;
    const problems = [];
    // 取几个时刻采样
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      const t = f * traj.tEnd;
      const s = m.sampleAt(t, p, d);
      c.t = t; c.s = s;

      const vecs = m.vectors ? m.vectors(s, c) : [];
      if (!Array.isArray(vecs)) problems.push(`t=${f}: vectors 不是数组`);
      const keys = new Set();
      for (let i = 0; i < vecs.length; i++) {
        const v = vecs[i];
        if (!v) { problems.push(`t=${f}: vectors[${i}] 是 undefined`); continue; }
        if (!v.key) problems.push(`t=${f}: vectors[${i}] 没有 key`);
        if (!v.vec) problems.push(`t=${f}: vectors[${i}] (key=${v.key}) 没有 vec`);
        else if (!isFinite(v.vec.x + v.vec.y + v.vec.z)) problems.push(`t=${f}: ${v.key} 的 vec 非有限值`);
        if (!v.ref || !isFinite(v.ref)) problems.push(`t=${f}: ${v.key} 的 ref 无效 (${v.ref})`);
        if (v.key) keys.add(v.key);
        if (v.anchor && !(isFinite(v.anchor.x + v.anchor.y + v.anchor.z))) {
          problems.push(`t=${f}: ${v.key} 的 anchor 非有限值`);
        }
      }
      for (const v of vecs) {
        if (!v || !v.parallelogram) continue;
        const { legs, tip } = v.parallelogram;
        if (!tip || !keys.has(tip)) problems.push(`t=${f}: ${v.key} 的 parallelogram.tip='${tip}' 不在矢量列表里 [${[...keys]}]`);
        for (const lg of legs || []) {
          if (!keys.has(lg)) problems.push(`t=${f}: ${v.key} 的 parallelogram.leg='${lg}' 不在矢量列表里 [${[...keys]}]`);
        }
      }

      for (const [fn, arr] of [
        ['markers', m.markers ? m.markers(s, c) : []],
        ['segments', m.segments ? m.segments(s, c) : []],
      ]) {
        if (!Array.isArray(arr)) { problems.push(`t=${f}: ${fn} 不是数组`); continue; }
        for (let i = 0; i < arr.length; i++) {
          const g = arr[i];
          if (!g) { problems.push(`t=${f}: ${fn}[${i}] 是 undefined`); continue; }
          if (fn === 'markers') {
            // pos 可省略 —— 引擎按物理原点处理（中心天体、转轴天然在原点）
            if (!g.pos && g.radiusPhys == null) problems.push(`t=${f}: markers[${i}] (key=${g.key}) 既没有 pos 也没有 radiusPhys`);
            if (g.pos && !isFinite(g.pos.x + g.pos.y + g.pos.z)) problems.push(`t=${f}: markers[${i}] (key=${g.key}) 的 pos 非有限值`);
          }
          if (fn === 'segments' && !g.pts) problems.push(`t=${f}: segments[${i}] (key=${g.key}) 没有 pts`);
        }
      }
    }
    const gs = m.guides ? m.guides(c) : [];
    if (!Array.isArray(gs)) problems.push('guides 不是数组');
    for (let i = 0; i < gs.length; i++) {
      if (!gs[i]) { problems.push(`guides[${i}] 是 undefined`); continue; }
      if (!gs[i].pts) problems.push(`guides[${i}] (key=${gs[i].key}) 没有 pts`);
    }
    const rd = m.readingsOf ? m.readingsOf(m.sampleAt(0, p, d), c) : null;
    if (rd && (typeof rd !== 'object' || Array.isArray(rd))) problems.push('readingsOf 应返回 {key: 文本} 对象');
    // 读数面板声明的每个 key 都必须有对应值，否则界面上会出现空白行
    if (rd) {
      const miss = m.readings.filter(r => rd[r.key] === undefined).map(r => r.key);
      if (miss.length) problems.push(`readingsOf 缺字段: ${miss.join(', ')}`);
    }

    if (problems.length) {
      bad++;
      console.log(`  ✗ ${ps.id.padEnd(12)} ${problems.slice(0, 6).join('\n                 ')}`);
    } else {
      console.log(`  ✓ ${ps.id}`);
    }
  }
}

console.log(`\n${'─'.repeat(46)}\n  ${bad === 0 ? '全部预设的渲染钩子自洽' : `${bad} 个预设有问题`}\n${'─'.repeat(46)}`);
process.exit(bad === 0 ? 0 : 1);
