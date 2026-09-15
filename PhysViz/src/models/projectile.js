/* ============================================================
   模型 · 平抛 / 斜抛运动
   ------------------------------------------------------------
   高考里最高频的一类题：给初速度、给高度、问落点与飞行时间。

   这里把"平抛"和"斜抛"统一成同一个模型 ——
   抛射角 α = 0 就是平抛，α > 0 就是斜抛，α = 90 退化成竖直上抛。
   加一个方位角 φ 之后轨迹跑出平面，成为真正的三维斜抛
   （这正是 3D 版本比黑板上的二维图多出来的东西）。

   坐标约定：
     y 轴竖直向上，重力沿 −y
     φ 是初速度在水平面（xz 平面）内与 +x 的夹角
   ============================================================ */

import * as THREE from 'three';
import { N, EPS, snap, snapRel, rad, sampleLoop, fmt, fmtTime, clamp } from '../physics.js';

function derive(p) {
  const a = rad(p.alpha), ph = rad(p.phi);
  const ca = snap(Math.cos(a)), sa = snap(Math.sin(a));
  const cp = snap(Math.cos(ph)), sp = snap(Math.sin(ph));

  const vx = p.v0 * ca * cp;         // 水平分量（沿 x）
  const vz = p.v0 * ca * sp;         // 水平分量（沿 z）
  const vy0 = p.v0 * sa;             // 竖直分量
  const g = Math.max(p.g, 1e-6);

  // 落地时刻：解 h₀ + v_y0 t − ½ g t² = 0，取正根
  const disc = Math.sqrt(vy0 * vy0 + 2 * g * p.h0);
  const tEnd = Math.max((vy0 + disc) / g, 1e-6);

  const tApex = clamp(vy0 / g, 0, tEnd);
  const hApex = p.h0 + (vy0 * vy0) / (2 * g);

  const xEnd = vx * tEnd, zEnd = vz * tEnd;
  const range = Math.hypot(xEnd, zEnd);          // 水平射程（斜抛时是斜向的，取模长）

  const vRef = Math.max(p.v0, Math.sqrt(vy0 * vy0 + 2 * g * p.h0)) || 1;

  return {
    vx, vy0, vz, g, tEnd, tApex, hApex, xEnd, zEnd, range, vRef,
    vh: Math.hypot(vx, vz),                      // 水平分速大小（恒定）
    deg: p.alpha,
  };
}

function sampleAt(t, p, d) {
  const pos = new THREE.Vector3(
    d.vx * t,
    p.h0 + d.vy0 * t - 0.5 * d.g * t * t,
    d.vz * t,
  );
  const vel = new THREE.Vector3(d.vx, d.vy0 - d.g * t, d.vz);
  const acc = new THREE.Vector3(0, -d.g, 0);
  return { pos, vel, acc };
}

function buildTrajectory(p, d) {
  return { pts: sampleLoop(t => sampleAt(t, p, d).pos, d.tEnd), tEnd: d.tEnd };
}

const params = [
  { key: 'v0',    label: '初速度大小', sym: 'v₀', unit: 'm/s', min: 1,   max: 80, step: 1, digits: 0 },
  { key: 'alpha', label: '抛射角',     sym: 'α',  unit: '°',   min: 0,   max: 90, step: 1, digits: 0 },
  { key: 'phi',   label: '水平方位角', sym: 'φ',  unit: '°',   min: 0,   max: 360, step: 1, digits: 0 },
  { key: 'h0',    label: '抛出点高度', sym: 'h₀', unit: 'm',   min: 0,   max: 60, step: 0.5, digits: 1 },
  { key: 'g',     label: '重力加速度', sym: 'g',  unit: 'm/s²', min: 1.6, max: 25, step: 0.02, digits: 2 },
];

const layers = [
  { key: 'traj',   label: '完整轨迹' },
  { key: 'trail',  label: '已走过的轨迹' },
  { key: 'vel',    label: '速度分解 v / vₓ / v_y' },
  { key: 'gField', label: '重力场 g（沿 −y）' },
  { key: 'aux',    label: '最高点 / 落点辅助线' },
  { key: 'proj',   label: '坐标平面投影', on: false },
  { key: 'axes',   label: '坐标轴' },
];

const readings = [
  { key: 't',     label: '时间 t' },
  { key: 'h',     label: '当前高度 y' },
  { key: 'x',     label: '水平位移' },
  { key: 'vx',    label: '水平分速 v<sub>h</sub>', sep: true },
  { key: 'vy',    label: '竖直分速 v<sub>y</sub>' },
  { key: 'speed', label: '速率 |v|' },
  { key: 'ang',   label: '速度与水平夹角' },
  { key: 'H',     label: '最大高度 H', hi: true, sep: true },
  { key: 'R',     label: '水平射程 R', hi: true },
  { key: 'tf',    label: '飞行时间 t<sub>f</sub>', hi: true },
];

const presets = [
  {
    id: 'flat', title: '平抛运动', view: 'face',
    note: '最经典的平抛：从 h₀ 高处以水平初速度抛出。<b>竖直方向是自由落体，水平方向是匀速直线</b>，两者互不干扰。',
    q: '先猜：飞行时间由什么决定？跟初速度大小有关系吗？',
    params: { v0: 20, alpha: 0, phi: 0, h0: 20, g: 9.8 },
  },
  {
    id: 'oblique', title: '斜抛运动', view: 'face',
    note: 'α = 45° 时射程最大（无空气阻力）。轨迹是一条完整的抛物线。',
    q: '为什么 45° 射程最大？改成 30° 和 60°，射程谁大？',
    params: { v0: 30, alpha: 45, phi: 0, h0: 0, g: 9.8 },
  },
  {
    id: 'high', title: '高台平抛', view: 'face',
    note: '只把抛出点抬高到 45 m，初速度反而更小 —— 但飞行时间变长了。',
    q: '高度加倍，飞行时间变成原来的几倍？为什么不是 2 倍？',
    params: { v0: 15, alpha: 0, phi: 0, h0: 45, g: 9.8 },
  },
  {
    // scaleRef：沿用地球平抛的尺度。月球上 g 只有 1/6，
    // 同样条件下射程变成 2.47 倍 —— 这个差别必须能在画面上真实看见。
    id: 'moon', title: '月球上的平抛', view: 'face', scaleRef: 'flat',
    note: '把 g 换成月球表面的 1.62 m/s²，其余全不变。飞行时间变成 2.47 倍，射程也变成 2.47 倍。画幅沿用地球那组的尺度，所以大小差别是真实的。',
    q: '在月球上做同一个平抛实验，落点会远多少倍？为什么恰好是这个倍数？',
    params: { v0: 20, alpha: 0, phi: 0, h0: 20, g: 1.62 },
  },
  {
    id: 'spatial', title: '三维斜抛', view: 'iso',
    note: '给一个水平方位角 φ = 40°，抛体跑出了竖直平面。这是黑板上画不出来、必须用 3D 才看得见的画面。',
    q: '轨迹还是一个平面图形吗？它落在哪个平面上？',
    params: { v0: 30, alpha: 45, phi: 40, h0: 0, g: 9.8 },
  },
  {
    id: 'vertical', title: '竖直上抛', view: 'front',
    note: 'α = 90° 的退化情形：水平分速为零，轨迹缩成一条竖直线段。',
    q: '退化成什么运动了？上升到最高点用的时间，和落回来用的时间一样吗？',
    params: { v0: 20, alpha: 90, phi: 0, h0: 0, g: 9.8 },
  },
];

/* ---------- 渲染声明 ---------- */

function vectors(s, ctx) {
  const { d, C } = ctx;
  const vh = new THREE.Vector3(d.vx, 0, d.vz);      // 水平分量（大小恒定）
  const vy = new THREE.Vector3(0, s.vel.y, 0);      // 竖直分量
  return [
    { key: 'v',  label: 'v',  color: C.v, layer: 'vel', vec: s.vel, ref: d.vRef, radius: 0.026,
      parallelogram: { legs: ['vx', 'vy'], tip: 'v' } },
    { key: 'vx', label: 'v<sub>h</sub>', color: C.vd, layer: 'vel', vec: vh, ref: d.vRef, radius: 0.024 },
    { key: 'vy', label: 'v<sub>y</sub>', color: C.vp, layer: 'vel', vec: vy, ref: d.vRef, radius: 0.024 },
  ];
}

function markers(s, ctx) {
  const { p, d, C } = ctx;
  return [
    { key: 'mkStart', layer: 'aux', color: C.origin, radius: 6, pos: new THREE.Vector3(0, p.h0, 0) },
    { key: 'mkApex',  layer: 'aux', color: C.center, radius: 7,
      pos: new THREE.Vector3(d.vx * d.tApex, d.hApex, d.vz * d.tApex) },
    { key: 'mkEnd',   layer: 'aux', color: C.F, radius: 7,
      pos: new THREE.Vector3(d.xEnd, 0, d.zEnd) },
  ];
}

/* 最高点水平参考线 + 落点竖直参考线：
   学生要看的两个量（H 与 R）正好是这两条线的长度。 */
function guides(ctx) {
  const { d, C, p } = ctx;
  const apex = new THREE.Vector3(d.vx * d.tApex, d.hApex, d.vz * d.tApex);
  const end = new THREE.Vector3(d.xEnd, 0, d.zEnd);
  const ground = new THREE.Vector3(0, 0, 0);
  return [
    { key: 'gApex', layer: 'aux', color: C.aux, width: ctx.lw.guide,
      pts: [new THREE.Vector3(0, d.hApex, 0), apex] },
    { key: 'gRange', layer: 'aux', color: C.aux, width: ctx.lw.guide,
      pts: [ground, end] },
  ];
}

function fields(ctx) {
  const { d, C } = ctx;
  return [{
    key: 'gField', layer: 'gField', color: C.gLine, label: 'g',
    dir: new THREE.Vector3(0, -1, 0),
    spacing: 230, thick: 0.95, head: 2.6, headL: 10,
  }];
}

function readingsOf(s, ctx) {
  const { t, d, p } = ctx;
  /* 两个"该为零"的位置：落地瞬间 y = 0、最高点 v_y = 0（竖直上抛的顶点
     速率也归零）。残渣 ~3.6e-15 不过归零会被 fmt 显示成 "3.55 fm/s"。 */
  const vy = snapRel(s.vel.y, d.vRef);
  const ang = Math.atan2(vy, Math.hypot(d.vx, d.vz)) * 180 / Math.PI;
  const h = snapRel(s.pos.y, Math.max(d.hApex, 1e-3));
  return {
    t: fmtTime(t),
    h: fmt(h, 'm'),
    x: fmt(Math.hypot(s.pos.x, s.pos.z), 'm'),
    vx: fmt(d.vh, 'm/s'),
    vy: fmt(vy, 'm/s'),
    speed: fmt(snapRel(s.vel.length(), d.vRef), 'm/s'),
    ang: ang.toFixed(1) + '°',
    H: fmt(d.hApex, 'm'),
    R: fmt(d.range, 'm'),
    tf: fmtTime(d.tEnd),
  };
}

function hint(ctx) {
  const { d, p } = ctx;
  const tFall = Math.sqrt(2 * p.h0 / d.g);
  return `飞行时间 t<sub>f</sub> = (v₀sinα + √(v₀²sin²α + 2gh₀))/g = <b>${fmtTime(d.tEnd)}</b>；`
    + `水平射程 R = v₀cosα·t<sub>f</sub> = <b>${fmt(d.range, 'm')}</b>；`
    + `最大高度 H = h₀ + v₀²sin²α/(2g) = <b>${fmt(d.hApex, 'm')}</b>。`
    + `纯下落时间 √(2h₀/g) = ${fmtTime(tFall)}。`;
}

export default {
  id: 'projectile',
  name: '平抛 / 斜抛',
  tagline: '抛体运动：水平匀速 + 竖直匀变速',
  layerTip: '速度分解里的 <b>v<sub>h</sub></b> 始终水平且大小不变，'
    + '<b>v<sub>y</sub></b> 竖直且均匀变化 —— 虚线框是它们的平行四边形。',

  params, layers, readings, presets,
  views: {
    face:  { az: -90, el: 90, label: '正视图' },
    iso:   { az: -62, el: 24, label: '轴测图' },
    front: { az: 180, el: 0, label: '前视图' },
    side:  { az: -90, el: 4, label: '侧视图' },
    top:   { az: -90, el: 90, label: '俯视图' },
  },
  defaultView: 'face',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, guides, fields, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '秒', secondaryUnit: 's',
      secondsPerCycle: 1, label: 's', cyclic: false,
      jumpSeconds: d.tEnd / 6,
    };
  },
};
