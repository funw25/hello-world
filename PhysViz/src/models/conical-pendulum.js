/* ============================================================
   模型 · 圆锥摆
   ------------------------------------------------------------
   摆球在水平面内做匀速圆周运动，绳扫出一个圆锥面。

   高考最爱考的那个结论藏在这里：

       T = 2π√(h/g)        h 是悬点到圆面的高度

   也就是说，**周期只由高度 h 决定**，跟摆球质量、跟半径、跟摆角
   都没有直接关系 —— 只要 h 一样，周期就一样（预设 4 专门演示这一点）。

   几何约定：
     圆面固定在 y = 0 平面，圆心在原点，半径 r = L·sinθ
     悬点高度 h = L·cosθ
     绳从悬点连到摆球
   ============================================================ */

import * as THREE from 'three';
import { EPS, snap, rad, sampleLoop, fmt, fmtTime } from '../physics.js';

function derive(p) {
  const th = rad(p.theta);
  const st = snap(Math.sin(th)), ct = snap(Math.cos(th));
  const g = Math.max(p.g, 1e-6);

  const r = p.L * st;                 // 圆周半径
  const h = p.L * ct;                 // 悬点到圆面的高度
  const omega = Math.sqrt(g / Math.max(h, 1e-9));   // ω = √(g/h)
  const T = (2 * Math.PI) / omega;
  const v = omega * r;                // 线速度

  const Fc = p.m * g * (st / Math.max(ct, 1e-9));   // 向心力 = mg·tanθ
  const Ft = p.m * g / Math.max(ct, 1e-9);          // 绳张力 = mg/cosθ
  const W = p.m * g;                                 // 重力

  const fRef = Math.max(Ft, EPS);      // 用张力做参考，三个力箭头才互相可比

  return { r, h, omega, T, v, Fc, Ft, W, fRef, st, ct, g };
}

function sampleAt(t, p, d) {
  const a = d.omega * t;
  const pos = new THREE.Vector3(d.r * Math.cos(a), 0, d.r * Math.sin(a));
  const vel = new THREE.Vector3(-d.v * Math.sin(a), 0, d.v * Math.cos(a));
  // 加速度指向圆心（水平），大小 ω²r
  const acc = new THREE.Vector3(-d.omega * d.omega * pos.x, 0, -d.omega * d.omega * pos.z);
  return { pos, vel, acc };
}

function buildTrajectory(p, d) {
  const tEnd = p.turns * d.T;
  return { pts: sampleLoop(t => sampleAt(t, p, d).pos, tEnd), tEnd };
}

const params = [
  { key: 'L',     label: '绳长',       sym: 'L',  unit: 'm',    min: 0.2, max: 3,  step: 0.01, digits: 2 },
  { key: 'theta', label: '摆角（与竖直方向）', sym: 'θ', unit: '°', min: 5, max: 85, step: 1, digits: 0 },
  { key: 'm',     label: '摆球质量',   sym: 'm',  unit: 'kg',   min: 0.05, max: 5, step: 0.01, digits: 2 },
  { key: 'g',     label: '重力加速度', sym: 'g',  unit: 'm/s²', min: 1.6, max: 25, step: 0.02, digits: 2 },
  { key: 'turns', label: '显示圈数',   sym: 'n',  unit: '',     min: 1, max: 6, step: 1, digits: 0 },
];

const layers = [
  { key: 'traj',   label: '完整轨迹（圆）' },
  { key: 'trail',  label: '已走过的轨迹' },
  { key: 'vel',    label: '线速度 v' },
  { key: 'force',  label: '受力分析 mg / F向 / F绳' },
  { key: 'aux',    label: '悬点、绳与转轴' },
  { key: 'gField', label: '重力场 g（沿 −y）', on: false },
  { key: 'proj',   label: '坐标平面投影', on: false },
  { key: 'axes',   label: '坐标轴' },
];

const readings = [
  { key: 't',    label: '时间 t' },
  { key: 'cyc',  label: '已过周期' },
  { key: 'T',    label: '周期 T = 2π√(h/g)', hi: true },
  { key: 'r',    label: '圆周半径 r = L·sinθ', sep: true },
  { key: 'h',    label: '高度 h = L·cosθ', hi: true },
  { key: 'v',    label: '线速度 v' },
  { key: 'om',   label: '角速度 ω' },
  { key: 'n',    label: '转速', sep: true },
  { key: 'Ft',   label: '绳张力 F<sub>绳</sub> = mg/cosθ' },
  { key: 'Fc',   label: '向心力 F<sub>向</sub> = mg·tanθ' },
  { key: 'W',    label: '重力 mg' },
];

const presets = [
  {
    id: 'base', title: '圆锥摆', view: 'iso', cmp: 'swing',
    note: '最朴素的圆锥摆。绳的张力提供向心力，绳扫出一个圆锥面。',
    q: '先猜：摆球质量变大，转一圈的时间会变吗？',
    params: { L: 1, theta: 30, m: 0.5, g: 9.8, turns: 3 },
  },
  {
    id: 'wide', title: '摆角增大到 60°', view: 'iso', cmp: 'swing',
    note: '摆角变大 → 半径变大、高度变小 → 周期变短（T = 2π√(h/g)）。画幅与基准预设共用，大小差别是真实的。',
    q: '摆角变大时，周期为什么反而变短了？',
    params: { L: 1, theta: 60, m: 0.5, g: 9.8, turns: 3 },
  },
  {
    id: 'long', title: '绳长加倍', view: 'iso', cmp: 'swing',
    note: '绳长加倍，摆角不变 → 半径加倍、高度也加倍 → 周期变成 √2 倍（不是 2 倍）。',
    q: '绳长变成 2 倍，周期为什么只变成 1.41 倍？',
    params: { L: 2, theta: 30, m: 0.5, g: 9.8, turns: 3 },
  },
  {
    id: 'sameH', title: '高度相同 → 周期相同', view: 'iso', cmp: 'swing',
    note: '<b>本模型最重要的一条</b>：绳长 1.732 m、摆角 60°，与「圆锥摆」预设（绳长 1 m、摆角 30°）的高度都是 0.866 m —— 所以两者的周期完全相同（都是 1.87 s）。周期只认高度。',
    q: '绳长和摆角都不一样，为什么周期一模一样？',
    params: { L: 1.732, theta: 60, m: 0.5, g: 9.8, turns: 3 },
  },
  {
    id: 'heavy', title: '质量加倍', view: 'iso',
    note: '只把摆球质量加倍。周期<b>完全不变</b>，但绳张力、向心力都跟着变大。',
    q: '质量变大，为什么周期不变？变的是什么？',
    params: { L: 1, theta: 30, m: 1.0, g: 9.8, turns: 3 },
  },
  {
    id: 'moon', title: '月球上的圆锥摆', view: 'iso',
    note: '把 g 换成月球表面的 1.62 m/s²。同样的绳长和摆角，周期变成 √(9.8/1.62) ≈ 2.46 倍。',
    q: '重力变小，为什么周期会变长？周期到底跟 g 的几次方有关？',
    params: { L: 1, theta: 30, m: 0.5, g: 1.62, turns: 3 },
  },
];

/* ---------- 渲染声明 ---------- */

function vectors(s, ctx) {
  const { d, C } = ctx;
  const axis = new THREE.Vector3(-s.pos.x, 0, -s.pos.z).normalize();   // 指向转轴
  const Fc = axis.multiplyScalar(d.Fc);                                 // 向心力（水平）
  const W = new THREE.Vector3(0, -d.W, 0);                              // 重力
  const pivot = new THREE.Vector3(0, d.h, 0);
  const rope = pivot.clone().sub(s.pos).normalize().multiplyScalar(d.Ft); // 绳张力
  return [
    { key: 'v',  label: 'v',  color: C.v,  layer: 'vel', vec: s.vel, ref: d.v, radius: 0.026 },
    // 标准做法：重力 + 绳张力 = 向心力（首尾相接的三角形）
    { key: 'Fc', label: 'F<sub>向</sub>', color: C.F,  layer: 'force', vec: Fc, ref: d.fRef, radius: 0.024,
      parallelogram: { legs: ['W', 'Ft'], tip: 'Fc' } },
    { key: 'W',  label: 'mg', color: C.g,  layer: 'force', vec: W,  ref: d.fRef, radius: 0.024 },
    { key: 'Ft', label: 'F<sub>绳</sub>', color: C.qE, layer: 'force', vec: rope, ref: d.fRef, radius: 0.024 },
  ];
}

function markers(s, ctx) {
  const { d, C } = ctx;
  return [
    { key: 'mkPivot', layer: 'aux', color: C.origin, radius: 6, pos: new THREE.Vector3(0, d.h, 0) },
    { key: 'mkAxis',  layer: 'aux', color: C.axis, radius: 5, pos: new THREE.Vector3(0, 0, 0) },
  ];
}

/* 绳、转轴、半径 —— 每帧跟着摆球动 */
function segments(s, ctx) {
  const { d, C } = ctx;
  const pivot = new THREE.Vector3(0, d.h, 0);
  const out = [{ key: 'rope', layer: 'aux', color: C.marker, pts: [pivot, s.pos.clone()] }];
  // 半径：圆心 → 摆球，虚线，强调"它在做圆周运动"
  out.push({ key: 'radius', layer: 'aux', color: C.center, dashed: true,
    pts: [new THREE.Vector3(0, 0, 0), s.pos.clone()] });
  return out;
}

/* 转轴：从圆面往上到悬点，再往上留一截 */
function guides(ctx) {
  const { d, C } = ctx;
  return [{
    key: 'axis', layer: 'aux', color: C.axis, width: ctx.lw.guide, dashed: true,
    pts: [new THREE.Vector3(0, -0.05 * d.h, 0), new THREE.Vector3(0, d.h * 1.15, 0)],
  }];
}

function fields(ctx) {
  const { C } = ctx;
  return [{
    key: 'gField', layer: 'gField', color: C.gLine, label: 'g',
    dir: new THREE.Vector3(0, -1, 0),
    spacing: 230, thick: 0.95, head: 2.6, headL: 10,
  }];
}

function readingsOf(s, ctx) {
  const { t, d } = ctx;
  return {
    t: fmtTime(t),
    cyc: (t / d.T).toFixed(2) + ' 个',
    T: fmt(d.T, 's'),
    r: fmt(d.r, 'm'),
    h: fmt(d.h, 'm'),
    v: fmt(d.v, 'm/s'),
    om: fmt(d.omega, 'rad/s'),
    n: (1 / d.T).toFixed(2) + ' 转/秒',
    Ft: fmt(d.Ft, 'N'),
    Fc: fmt(d.Fc, 'N'),
    W: fmt(d.W, 'N'),
  };
}

function hint(ctx) {
  const { d } = ctx;
  return `T = 2π√(h/g) = 2π√(<b>${fmt(d.h, 'm')}</b>/<b>${fmt(d.g, 'm/s²')}</b>) = <b>${fmt(d.T, 's')}</b>；`
    + `半径 r = L·sinθ = <b>${fmt(d.r, 'm')}</b>；`
    + `F<sub>向</sub> = mg·tanθ = <b>${fmt(d.Fc, 'N')}</b>，F<sub>绳</sub> = mg/cosθ = <b>${fmt(d.Ft, 'N')}</b>。`
    + `注意 T 里既没有 m 也没有 θ。`;
}

export default {
  id: 'conical-pendulum',
  name: '圆锥摆',
  tagline: '周期只由高度决定：T = 2π√(h/g)',
  layerTip: '受力三角形：<b>mg</b> 与 <b>F绳</b> 首尾相接，合起来正好是水平的 <b>F向</b>。'
    + '虚线是转轴与半径。',

  params, layers, readings, presets,
  views: {
    iso:   { az: -62, el: 22, label: '轴测图' },
    top:   { az: -90, el: 90, label: '俯视图' },
    front: { az: 180, el: 0, label: '前视图' },
  },
  defaultView: 'iso',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, segments, guides, fields, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '振动周期', secondaryUnit: 's',
      secondsPerCycle: d.T, label: 'T', cyclic: true, jumpSeconds: d.T,
    };
  },
};
