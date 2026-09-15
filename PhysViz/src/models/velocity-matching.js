/* ============================================================
   模型 · 配速法（带电粒子在正交匀强电磁场中的运动）
   ------------------------------------------------------------
   物理约定：
     B = (0, 0, B)        磁场沿 +z
     E = (0, E, 0)        电场沿 +y，且 E ⊥ B
     v_d = (E × B)/B² = (E/B, 0, 0)   漂移速度沿 +x

   状态是 (params, t) 的纯函数 —— 无累积状态，所以时间轴可任意跳转。

   模型接口见 src/core/registry.js 的注释。
   所有渲染钩子拿到的是同一个 ctx 上下文对象：
     ctx = { t, p, d, traj, wpts, C, lw, N, EPS }
   钩子返回的坐标一律是**物理坐标**，由引擎统一做尺度归一化。
   ============================================================ */

import * as THREE from 'three';
import { PARTICLES, N, EPS, snap, snapRel, rad, sampleLoop, fmt } from '../physics.js';

const B_FLOOR = 1e-4;   // B 的安全下限（UI 实际限制在 0.02 T，这里只防 NaN）

/* ------------------------------------------------------------
   派生量
   ------------------------------------------------------------ */
function derive(p) {
  const { q, m } = PARTICLES[p.particle];
  const E = p.E;
  const B = Math.max(p.B, B_FLOOR);

  const vd = new THREE.Vector3(E / B, 0, 0);

  const th = rad(p.theta), ph = rad(p.phi);
  const sn = snap(Math.sin(th)), cs = snap(Math.cos(th));
  const cp = snap(Math.cos(ph)), sp = snap(Math.sin(ph));
  const v0 = new THREE.Vector3(p.v0 * sn * cp, p.v0 * sn * sp, p.v0 * cs);

  const vp = v0.clone().sub(vd);                 // v' = v₀ − v_d
  const omega = (q * B) / m;                     // 有符号回旋角频率
  const wAbs = Math.abs(omega);
  const T = (2 * Math.PI) / wAbs;
  const vPerp = Math.hypot(vp.x, vp.y);
  const vPar = vp.z;
  const r = vPerp / wAbs;
  const vdMag = vd.length();
  const k = vdMag > EPS ? vPerp / vdMag : Infinity;
  const vRef = Math.hypot(vdMag + vPerp, vPar) || 1;

  return { q, m, E, B, vd, v0, vp, omega, wAbs, T, vPerp, vPar, r, vdMag, k, vRef };
}

/* ------------------------------------------------------------
   解析解：给定时刻 t 直接求状态

   v'_⊥ 满足  dv'/dt = (q/m) v' × B
   解得旋转： v'_x(t) =  v'_x0 cos ωt + v'_y0 sin ωt
              v'_y(t) = −v'_x0 sin ωt + v'_y0 cos ωt
   积分得位移：
              x'(t) = [ v'_x0 sin ωt + v'_y0 (1 − cos ωt) ] / ω
              y'(t) = [ v'_x0 (cos ωt − 1) + v'_y0 sin ωt ] / ω
   平行分量无受力： z'(t) = v'_z0 · t
   ------------------------------------------------------------ */
function sampleAt(t, p, d) {
  const w = d.omega;
  const vpx = d.vp.x, vpy = d.vp.y;
  let xp, yp, vx, vy;

  if (Math.abs(w) < EPS) {
    xp = vpx * t; yp = vpy * t; vx = vpx; vy = vpy;
  } else {
    const s = Math.sin(w * t), c = Math.cos(w * t);
    xp = (vpx * s + vpy * (1 - c)) / w;
    yp = (vpx * (c - 1) + vpy * s) / w;
    vx = vpx * c + vpy * s;
    vy = -vpx * s + vpy * c;
  }

  const pos = new THREE.Vector3(d.vd.x * t + xp, yp, d.vp.z * t);
  const vel = new THREE.Vector3(d.vd.x + vx, vy, d.vp.z);
  // a = (q/m)(E + v×B)，其中 v×B = (v_y B, −v_x B, 0)
  const acc = new THREE.Vector3(
    (d.q / d.m) * vel.y * d.B,
    (d.q / d.m) * (d.E - vel.x * d.B),
    0,
  );
  return { pos, vel, acc };
}

function buildTrajectory(p, d) {
  const tEnd = p.periods * d.T;
  return { pts: sampleLoop(t => sampleAt(t, p, d).pos, tEnd), tEnd };
}

/* 摆线形态判据。注意三个退化情形：
     E = 0   → v_d = 0，k 在物理上无定义，此时是纯匀速圆周
     v′ = 0  → 无圆周分量，轨迹是直线
     θ = 0   → 不是直线！v_d 始终垂直于 B，垂直面内仍是摆线，
               只是叠加了沿 B 的匀速运动。 */
function shapeName(d) {
  if (d.vdMag < 1e-9) return d.vPerp < 1e-9 ? '静止' : '匀速圆周';
  if (d.vPerp < 1e-9) return '直线';
  if (d.k < 0.985) return '短幅摆线';
  if (d.k < 1.015) return '标准摆线（尖点）';
  return '长幅摆线（套环）';
}

/* ------------------------------------------------------------
   参数 / 图层 / 读数
   ------------------------------------------------------------ */
const params = [
  { key: 'particle', type: 'select', label: '粒子', options: Object.entries(PARTICLES).map(([v, o]) => ({ v, t: o.label })) },
  { key: 'E',       label: '电场强度',    sym: 'E',  unit: 'V/m', min: 0,    max: 5000, step: 10, digits: 0 },
  { key: 'B',       label: '磁感应强度',  sym: 'B',  unit: 'T',   min: 0.02, max: 2,    map: 'log', digits: 3 },
  { key: 'v0',      label: '初速度大小',  sym: 'v₀', unit: 'm/s', min: 0,    max: 2e7,  map: 'quad', digits: 0 },
  { key: 'theta',   label: 'v₀ 与 B 夹角', sym: 'θ', unit: '°',   min: 0,    max: 180, step: 1, digits: 0 },
  { key: 'phi',     label: '垂直面方位角', sym: 'φ', unit: '°',   min: 0,    max: 360, step: 1, digits: 0 },
  { key: 'periods', label: '显示周期数',  sym: 'n',  unit: '',    min: 1,    max: 6,   step: 1, digits: 0 },
];

/* on: false 表示默认关掉。默认只开"讲主线要用到"的图层，
   否则第一眼看过去信息过载 —— 老师可以按需打开。 */
const layers = [
  { key: 'traj',   label: '完整轨迹' },
  { key: 'trail',  label: '已走过的轨迹' },
  { key: 'vel',    label: '速度分解 v / v_d / v′' },
  { key: 'bField', label: '磁场线 B（沿 z）' },
  { key: 'eField', label: '电场线 E（沿 y）' },
  { key: 'force',  label: '受力分析 F / qE', on: false },
  { key: 'proj',   label: '坐标平面投影', on: false },
  { key: 'center', label: '圆周运动中心', on: false },
  { key: 'axes',   label: '坐标轴' },
];

const readings = [
  { key: 't',     label: '时间 t' },
  { key: 'cyc',   label: '已过周期' },
  { key: 'speed', label: '速率 |v|' },
  { key: 'vd',    label: '漂移速度 v<sub>d</sub>', sep: true },
  { key: 'vp',    label: '圆周分量 v′' },
  { key: 'r',     label: '回旋半径 r' },
  { key: 'T',     label: '回旋周期 T' },
  { key: 'k',     label: '摆线参数 k = v′/v<sub>d</sub>', hi: true, sep: true },
  { key: 'shape', label: '轨迹形态', hi: true },
  { key: 'vmax',  label: '最大速率' },
];

/* ------------------------------------------------------------
   预设例题
   ------------------------------------------------------------ */
const presets = [
  {
    id: 'classic', title: '电子初速为零', view: 'top', cmp: 'b',
    note: '初速度为零的电子射入正交电磁场 —— 最经典的摆线场景。',
    q: '先猜：轨迹长什么样？再看尖点处，粒子的速度是多少？为什么？',
    params: { particle: 'electron', E: 300, B: 0.5, v0: 0, theta: 90, phi: 180, periods: 3 },
  },
  {
    id: 'selector', title: '速度选择器', view: 'top',
    note: 'v₀ = E/B 时，电场力与磁场力恰好抵消，粒子沿直线穿过。',
    q: '为什么只有 v₀ = E/B 这一个速度能直线穿过？换成别的速度会怎样？',
    params: { particle: 'proton', E: 300, B: 0.5, v0: 600, theta: 90, phi: 0, periods: 3 },
  },
  {
    // cmp：和「电子初速为零」同属一个对比组，两者共用同一把尺子和同一个画幅。
    // 所以"B 加倍 → 轨迹缩到 1/4"在画面上是真实可见的；
    // 若各自归一化，大小差异会被完全抹平，这个预设就白做了。
    id: 'bigB', title: 'B 加倍', view: 'top', cmp: 'b',
    note: '其余不变，只把磁感应强度加倍。轨迹明显变小 —— 因为 r = mE/(qB²) ∝ 1/B²。画幅与「电子初速为零」共用，大小差别是真实的。',
    q: '先猜：把 B 加倍，轨迹会怎么变？周期变了吗？半径变成原来的几分之几？',
    params: { particle: 'electron', E: 300, B: 1.0, v0: 0, theta: 90, phi: 180, periods: 3 },
  },
  {
    id: 'helix', title: '三维螺旋摆线', view: 'iso',
    note: 'v₀ 与 B 成 60° —— 运动跑出了平面，这是 2D 画不出来的画面。',
    q: '为什么轨迹跑到平面外去了？沿 B 方向的那个分运动是什么？',
    params: { particle: 'electron', E: 300, B: 0.5, v0: 300, theta: 60, phi: 180, periods: 3 },
  },
  {
    id: 'noE', title: '只有磁场', view: 'top',
    note: 'E = 0 时配速法退化 —— 回到最朴素的匀速圆周运动。',
    q: '电场为零，退化成了什么运动？周期公式还成立吗？',
    params: { particle: 'electron', E: 0, B: 0.5, v0: 8e6, theta: 90, phi: 0, periods: 1 },
  },
  {
    id: 'proton', title: '换成质子', view: 'top',
    // 质子半径是电子的 1836 倍，超出任何画幅能同时容纳的范围，
    // 所以这里不能锁尺度，只能自适应；大小差异请引导到右侧读数去看。
    note: '同样条件下，质子比电子重约 1836 倍。r = mv/(qB)，所以半径反而大得多：<b>12.5 μm</b> 对电子的 <b>6.82 nm</b>，相差 1836 倍。画幅已自动缩放，这个差别要看右侧读数，不是看画面。',
    q: '为什么同样条件下，质子的半径大这么多？半径到底跟哪些量成正比？',
    params: { particle: 'proton', E: 300, B: 0.5, v0: 0, theta: 90, phi: 180, periods: 3 },
  },
];

/* ------------------------------------------------------------
   渲染声明
   ------------------------------------------------------------ */

/* 矢量：v 由 v_d 与 v′ 合成，所以在 v 上挂一个虚线平行四边形 */
function vectors(s, ctx) {
  const { d, C } = ctx;
  const F = new THREE.Vector3().crossVectors(s.vel, new THREE.Vector3(0, 0, d.B)).multiplyScalar(d.q);
  const qE = new THREE.Vector3(0, d.q * d.E, 0);
  const fRef = Math.max(F.length(), qE.length(), EPS);
  return [
    { key: 'v',  label: 'v',  color: C.v,  layer: 'vel', vec: s.vel, ref: d.vRef, radius: 0.026,
      parallelogram: { legs: ['vd', 'vp'], tip: 'v' } },
    { key: 'vd', label: 'v<sub>d</sub>', color: C.vd, layer: 'vel', vec: d.vd, ref: d.vRef, radius: 0.026 },
    { key: 'vp', label: 'v′', color: C.vp, layer: 'vel', vec: d.vp, ref: d.vRef, radius: 0.026 },
    { key: 'F',  label: 'F',  color: C.F,  layer: 'force', vec: F,  ref: fRef, radius: 0.024 },
    { key: 'qE', label: 'qE', color: C.qE, layer: 'force', vec: qE, ref: fRef, radius: 0.024 },
  ];
}

/* 圆周运动中心轨迹：圆心 = 位置 + a·(r/|a|) */
function guides(ctx) {
  const { p, d, C } = ctx;
  const pts = [];
  for (let i = 0; i < N; i += 4) {
    const t = (ctx.traj.tEnd * i) / (N - 1);
    const s = sampleAt(t, p, d);
    const al = s.acc.length();
    if (!(al > EPS)) continue;
    pts.push(s.pos.clone().addScaledVector(s.acc, d.r / al));
  }
  if (pts.length < 2) return [];
  return [{ key: 'center', layer: 'center', color: C.center, width: ctx.lw.guide, pts }];
}

/* 场：B 沿 +z、E 沿 +y，两者都是匀强场 */
function fields(ctx) {
  const { d, C } = ctx;
  const out = [{
    key: 'bField', layer: 'bField', color: C.bLine,
    dir: new THREE.Vector3(0, 0, 1),
    spacing: 152, thick: 0.85, head: 2.3, headL: 8,
  }];
  if (d.E > 1e-6) {
    out.push({
      key: 'eField', layer: 'eField', color: C.eLine,
      dir: new THREE.Vector3(0, 1, 0),
      spacing: 210, thick: 0.95, head: 2.6, headL: 9,
    });
  }
  return out;
}

function readingsOf(s, ctx) {
  const { t, d } = ctx;
  return {
    t: fmt(t, 's'),
    cyc: (t / d.T).toFixed(2) + ' 个',
    /* 尖点处速率应精确为 0（v′ 与 v_d 恰好抵消）。
       残渣 ~2.6e-12 m/s 会被 fmt 放大成 "速率 2.57 pm/s"。 */
    speed: fmt(snapRel(s.vel.length(), d.vRef), 'm/s'),
    vd: fmt(d.vdMag, 'm/s'),
    vp: fmt(Math.hypot(d.vPerp, d.vPar), 'm/s'),
    r: fmt(d.r, 'm'),
    T: fmt(d.T, 's'),
    k: isFinite(d.k) ? d.k.toFixed(3) : '—',
    shape: shapeName(d),
    vmax: fmt(d.vRef, 'm/s'),
  };
}

function hint(ctx) {
  const { d } = ctx;
  return `回旋周期 T = 2πm/(qB) = <b>${fmt(d.T, 's')}</b>，`
    + `回旋半径 r = v′/ω = <b>${fmt(d.r, 'm')}</b>。`
    + `漂移速度 v<sub>d</sub> = E/B = <b>${fmt(d.vdMag, 'm/s')}</b>。`;
}

export default {
  id: 'velocity-matching',
  name: '配速法',
  tagline: '正交匀强电磁场中的摆线族',

  params, layers, readings, presets,
  views: {
    top:   { az: -90, el: 90, label: '俯视图' },
    iso:   { az: -62, el: 30, label: '轴测图' },
    // 前视必须正对（el = 0）：留 2° 倾角会把很长的 x 轴斜漏到竖直方向，
    // 摆线看起来变成一把扇形而不是干净的一条侧视线。
    front: { az: 180, el: 0, label: '前视图' },
  },
  defaultView: 'top',

  derive, sampleAt, buildTrajectory, shapeName, readingsOf, vectors, guides, fields, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '回旋周期', secondaryUnit: 's',
      secondsPerCycle: d.T, label: 'T', cyclic: true, jumpSeconds: d.T,
    };
  },
};
