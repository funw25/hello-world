/* ============================================================
   模型 · 带电粒子在匀强电场中的偏转（示波器原理）
   ------------------------------------------------------------
   高考经典：电子以初速度 v₀ 垂直射入平行板电场，在板间做"类平抛"运动，
   出电场后沿切线做匀速直线运动。偏转角 θ 与偏移量 yₘ 是示波器的核心。

   坐标约定：
     粒子从原点 (0,0,0) 沿 +x 入射；电场 E 沿 +y（电子 q<0 故向 −y 偏转）。
     极板位于 0 ≤ x ≤ L，板间距 gap，板间为匀强电场。
   ============================================================ */

import * as THREE from 'three';
import { PARTICLES, EPS, N, sampleLoop, fmt, fmtTime } from '../physics.js';

const GAP_DEF = 0.10;

function derive(p) {
  const { q, m } = PARTICLES[p.particle];
  const E = Math.max(p.E, 0);
  const a = (q * E) / m;                       // 竖直加速度（带符号）
  const v0 = Math.max(p.v0, 1e-3);
  const L = Math.max(p.L, 1e-4);
  const gap = Math.max(p.gap || GAP_DEF, 1e-4);
  const half = gap / 2;                        // 板间距的一半
  const t1 = L / v0;                           // 穿越板间时间（若无阻挡）
  const yExitIdeal = 0.5 * a * t1 * t1;        // 若无极板，出射时的竖直偏移
  const vyExitIdeal = a * t1;

  /* 撞板判定：粒子从 y = 0 出发，在板内做 y = ½at²。
     当 |y| 达到 half 时打在极板上，此后运动终止（被极板吸收）。
     这一步很关键：不加截断的话，E 一大 y 就能跑到几十米，
     而极板只有 0.1 m —— 轨迹会把画幅撑成一根竖条，整个模型"卡住"。
     tHit 是撞板时刻（撞不上就是 Infinity）。 */
  let tHit = Infinity, yHit = 0;
  if (Math.abs(a) > 1e-30) {
    const t = Math.sqrt(2 * half / Math.abs(a));   // |½at²| = half
    if (t < t1) { tHit = t; yHit = Math.sign(a) * half; }
  }
  const hitPlate = tHit < t1;
  const tExit = hitPlate ? tHit : t1;             // 实际离开板区的时刻
  const yExit = hitPlate ? yHit : yExitIdeal;     // 实际出射偏移
  const vyExit = hitPlate ? a * tHit : vyExitIdeal;
  // 撞板就没有"出板后直线段"了；没撞则再飞一段到 x = 2L
  const tEnd = hitPlate ? tHit : (2 * L) / v0;
  const yEnd = hitPlate ? yExit : yExit + vyExit * (tEnd - t1);
  const vRef = Math.max(v0, Math.hypot(v0, vyExit)) || 1;
  const hit = hitPlate;

  return { q, m, E, a, v0, L, gap, half, t1, tHit, yExit, vyExit, tEnd, yEnd, vRef, hit };
}

function sampleAt(t, p, d) {
  let x, y, vx, vy, ay;
  if (t <= d.t1 && !(d.hit && t >= d.tHit)) {
    // 板内：类平抛（撞板的话，到达 tHit 为止）
    x = d.v0 * t; y = 0.5 * d.a * t * t;
    vx = d.v0; vy = d.a * t; ay = d.a;
  } else if (d.hit && t >= d.tHit) {
    // 已撞板：停在极板上的撞击点，速度归零（被吸收）
    x = d.v0 * d.tHit; y = d.yExit;
    vx = 0; vy = 0; ay = 0;
  } else {
    // 出板后：无外力，沿切线匀速直线
    const dt = t - d.t1;
    x = d.L + d.v0 * dt; y = d.yExit + d.vyExit * dt;
    vx = d.v0; vy = d.vyExit; ay = 0;
  }
  return {
    pos: new THREE.Vector3(x, y, 0),
    vel: new THREE.Vector3(vx, vy, 0),
    acc: new THREE.Vector3(0, ay, 0),
  };
}

function buildTrajectory(p, d) {
  /* 轨迹在 t = t1 处有一个"折点"（板内抛物线 → 板外直线）。
     固定点数均匀采样会在折点两侧各留一点，把折角抹圆。
     做法：先按"板内段 / 板外段"分别均匀采样，各自把端点算准，
     拼起来就天然带一个精确折点 —— 不依赖任何排序或反解。 */
  if (d.hit || !(d.t1 > 0) || !(d.t1 < d.tEnd)) {
    // 撞板：单调一段（到 tHit 为止），均匀采样即可
    return { pts: sampleLoop(t => sampleAt(t, p, d).pos, d.tEnd), tEnd: d.tEnd };
  }
  const NIN = Math.min(N - 1, Math.max(2, Math.round(N * (d.t1 / d.tEnd))));
  const pts = [];
  for (let i = 0; i < NIN; i++) pts.push(sampleAt((d.t1 * i) / (NIN - 1), p, d).pos);   // 含 t=t1 折点
  const NOUT = N - NIN + 1;
  for (let i = 1; i < NOUT; i++) {
    const t = d.t1 + ((d.tEnd - d.t1) * i) / (NOUT - 1);
    pts.push(sampleAt(t, p, d).pos);
  }
  return { pts, tEnd: d.tEnd };
}

const params = [
  { key: 'particle', type: 'select', label: '粒子', options: Object.entries(PARTICLES).map(([v, o]) => ({ v, t: o.label })) },
  { key: 'v0', label: '入射速度', sym: 'v₀', unit: 'm/s', min: 1e5, max: 5e7, map: 'log', digits: 0 },
  { key: 'E', label: '电场强度', sym: 'E', unit: 'V/m', min: 0, max: 5e4, step: 100, digits: 0 },
  { key: 'L', label: '极板长度', sym: 'L', unit: 'm', min: 0.01, max: 0.2, step: 0.005, digits: 3 },
  { key: 'gap', label: '极板间距', sym: 'd', unit: 'm', min: 0.004, max: 0.08, step: 0.001, digits: 3 },
];

const layers = [
  { key: 'traj', label: '完整轨迹' },
  { key: 'trail', label: '已走过的轨迹' },
  { key: 'vel', label: '速度分解 v / vₓ / v_y' },
  { key: 'field', label: '电场 E 与极板', on: true },
  { key: 'aux', label: '出射点 / 屏上落点' },
  { key: 'proj', label: '坐标平面投影', on: false },
  { key: 'axes', label: '坐标轴' },
];

const readings = [
  { key: 't', label: '时间 t' },
  { key: 'x', label: '水平位移 x' },
  { key: 'y', label: '偏转量 y', hi: true, sep: true },
  { key: 'vx', label: '水平分速 vₓ' },
  { key: 'vy', label: '竖直分速 v_y' },
  { key: 'speed', label: '速率 |v|' },
  { key: 'ang', label: '偏转角 θ', hi: true, sep: true },
  { key: 'yExit', label: '板内最大偏转 yₘ', hi: true },
  { key: 'hit', label: '是否撞极板', hi: true },
];

const presets = [
  {
    id: 'noField', title: '无电场 → 直线', view: 'para',
    note: 'E = 0，粒子不受竖直力，沿直线飞出。',
    q: '把电场关掉，轨迹为什么是直线？',
    params: { particle: 'electron', v0: 1e7, E: 0, L: 0.05, gap: 0.01 },
  },
  {
    id: 'scope', title: '示波器偏转', view: 'para',
    note: '电子以 v₀ = 1×10⁷ m/s 垂直进入匀强电场，板间走抛物线，出电场后沿切线飞出。'
      + '偏转 yₘ ≈ 4.4 mm、偏转角约 10° —— 真实示波器的量级。',
    q: '出电场后，粒子为什么不再继续拐弯？',
    params: { particle: 'electron', v0: 1e7, E: 2000, L: 0.05, gap: 0.01 },
  },
  {
    id: 'proton', title: '换成质子', view: 'para',
    note: '质子质量是电子的 1836 倍，同样条件下极难偏转。这里把入射速度降到 1×10⁶ m/s、'
      + '电场加到 2×10⁴ V/m，才看到 <b>向上</b> 偏转 2.4 mm —— 方向与电子相反（q 的符号相反）。',
    q: '为什么质子向上偏、且要达到同样的偏转需要强得多的电场？',
    params: { particle: 'proton', v0: 1e6, E: 2e4, L: 0.05, gap: 0.01 },
  },
  {
    id: 'strong', title: '强电场 → 撞极板', view: 'para',
    note: '把 v₀ 降到 5×10⁶ m/s：按公式算电子本该偏转 35 mm，远超板间距的一半（5 mm），'
      + '所以它在板内就撞上了下极板 —— 这正是示波器不能无限加大偏转电压的原因。',
    q: '电场越大偏转越大 —— 但大到什么程度这个电子就出不了极板了？',
    params: { particle: 'electron', v0: 5e6, E: 4000, L: 0.05, gap: 0.01 },
  },
];

function vectors(s, ctx) {
  const { d, C } = ctx;
  const inside = ctx.t <= d.t1;
  const F = new THREE.Vector3(0, d.q * d.E, 0);   // 电场力
  const out = [
    { key: 'v', label: 'v', color: C.v, layer: 'vel', vec: s.vel, ref: d.vRef, radius: 0.026,
      parallelogram: { legs: ['vx', 'vy'], tip: 'v' } },
    { key: 'vx', label: 'vₓ', color: C.vd, layer: 'vel', vec: new THREE.Vector3(s.vel.x, 0, 0), ref: d.vRef, radius: 0.022 },
    { key: 'vy', label: 'v_y', color: C.vp, layer: 'vel', vec: new THREE.Vector3(0, s.vel.y, 0), ref: d.vRef, radius: 0.022 },
  ];
  if (inside && d.E > 1e-6) {
    out.push({ key: 'F', label: 'F', color: C.F, layer: 'field', vec: F, ref: Math.max(Math.abs(F.y), EPS), radius: 0.024 });
  }
  return out;
}

function markers(s, ctx) {
  const { d, C } = ctx;
  const out = [
    { key: 'mkIn', layer: 'aux', color: C.origin, radius: 6, pos: new THREE.Vector3(0, 0, 0) },
  ];
  if (d.hit) {
    /* 撞板情形：粒子没走到出射面，画"打在极板上的落点"才有意义。
       之前无条件画 x=L / x=2L 两个点，会标出粒子根本没到达的位置 —— 误导。
       撞击点用 C.F（暖色）并加大半径，和"正常出射点"区分开。 */
    out.push({ key: 'mkHit', layer: 'aux', color: C.F, radius: 8,
      pos: new THREE.Vector3(d.v0 * d.tHit, d.yExit, 0) });
  } else {
    out.push({ key: 'mkExit', layer: 'aux', color: C.center, radius: 7,
      pos: new THREE.Vector3(d.L, d.yExit, 0) });
    out.push({ key: 'mkEnd', layer: 'aux', color: C.F, radius: 7,
      pos: new THREE.Vector3(2 * d.L, d.yEnd, 0) });
  }
  return out;
}

function guides(ctx) {
  const { d, C } = ctx;
  const g = [], half = d.half;
  // 上下极板
  g.push({ key: 'plateTop', layer: 'field', color: C.eLine, width: ctx.lw.guide,
    pts: [new THREE.Vector3(0, half, 0), new THREE.Vector3(d.L, half, 0)] });
  g.push({ key: 'plateBot', layer: 'field', color: C.eLine, width: ctx.lw.guide,
    pts: [new THREE.Vector3(0, -half, 0), new THREE.Vector3(d.L, -half, 0)] });
  // 板间电场方向（若干竖直线表示 E 沿 +y）
  if (d.E > 1e-6) {
    const n = 5;
    for (let i = 1; i <= n; i++) {
      const x = (i / (n + 1)) * d.L;
      g.push({ key: 'ef' + i, layer: 'field', color: C.eLine, width: ctx.lw.guide * 0.7,
        pts: [new THREE.Vector3(x, -half * 0.8, 0), new THREE.Vector3(x, half * 0.8, 0)] });
    }
  }
  // 出射处竖直参考线。撞板时粒子根本到不了这里，画了反而像"它该到这儿"，
  // 所以只在能正常飞出时画。
  if (!d.hit) {
    g.push({ key: 'exitLn', layer: 'aux', color: C.aux, width: ctx.lw.guide * 0.7,
      pts: [new THREE.Vector3(d.L, -half, 0), new THREE.Vector3(d.L, half, 0)] });
  }
  return g;
}

function readingsOf(s, ctx) {
  const { t, d } = ctx;
  const ang = Math.atan2(s.vel.y, s.vel.x) * 180 / Math.PI;
  return {
    t: fmtTime(t),
    x: fmt(s.pos.x, 'm'),
    y: fmt(s.pos.y, 'm'),
    vx: fmt(s.vel.x, 'm/s'),
    vy: fmt(s.vel.y, 'm/s'),
    speed: fmt(s.vel.length(), 'm/s'),
    ang: ang.toFixed(2) + '°',
    yExit: fmt(d.yExit, 'm'),
    hit: d.hit ? '是（已打在极板上）' : '否',
  };
}

function hint(ctx) {
  const { d } = ctx;
  const formula = `板间做类平抛：yₘ = ½(qE/m)(L/v₀)²，偏转角 tanθ = qEL/(mv₀²)。`;
  if (d.hit) {
    /* 撞板时不能把 yExit 当"出射偏转"报出去 —— 粒子根本没飞出极板，
       而且这个数也不再等于上面那条公式（公式算的是"无阻挡"的理想值）。
       两个数一起摆出来，学生才看得清"为什么会撞板"。 */
    const ideal = 0.5 * d.a * d.t1 * d.t1;
    return formula
      + ` 本组参数下按公式算的理想出射偏转是 <b>${fmt(ideal, 'm')}</b>，`
      + `已经超过板间距的一半 d/2 = ${fmt(d.half, 'm')} —— `
      + `所以粒子<b>没能飞出极板</b>，在板内 x = ${fmt(d.v0 * d.tHit, 'm')} 处就撞在下极板上`
      + `（实际偏转 ${fmt(d.yExit, 'm')}）。把 E 调小或 v₀ 调大就能让它飞出去。`;
  }
  return formula + ` 出射偏转 yₘ = <b>${fmt(d.yExit, 'm')}</b>。出电场后只受惯性，沿切线匀速飞出。`;
}

export default {
  id: 'electric-deflection',
  name: '电场偏转',
  tagline: '示波器原理：匀强电场中的类平抛偏转',
  layerTip: '板间电场力 <b>F = qE</b> 始终竖直，所以轨迹在板内是抛物线；'
    + '出板后无外力，沿直线飞出。速度分解 <b>vₓ</b> 恒定、<b>v_y</b> 线性增长。',

  params, layers, readings, presets,
  views: {
    para: { az: -90, el: 90, label: '正视图' },
    iso:  { az: -62, el: 24, label: '轴测图' },
    side: { az: 180, el: 0, label: '侧视图' },
  },
  defaultView: 'para',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, guides, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '秒', secondaryUnit: 's',
      secondsPerCycle: 1, label: 's', cyclic: false, jumpSeconds: d.t1,
    };
  },
};
