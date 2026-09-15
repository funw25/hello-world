/* ============================================================
   模型 · 简谐运动（参考圆法）
   ------------------------------------------------------------
   弹簧振子的位移是 x = A·cos(ωt + φ₀)。

   黑板上讲简谐运动，最难说清的是"为什么它是正弦的"。
   参考圆法把这件事变得可视：让一个参考点 P 在半径 A 的圆上
   做匀速圆周运动，P 在直径上的投影就是简谐运动。

   于是三个量一眼看出对应关系：
     P 的位置 在 x 轴上的投影  =  振子的位移 x
     P 的速度（切向）的 x 分量  =  振子的速度 v
     P 的加速度（指向圆心）的 x 分量 = 振子的加速度 a = −ω²x

   这正好解释了"a 与 x 成正比、方向相反"这条结论的几何来源。

   坐标约定：
     参考圆在 xy 平面，圆心在原点，半径 A
     振子沿 x 轴振动，平衡位置在原点
     弹簧从 x = −(A+0.3) 处的墙连到振子
   ============================================================ */

import * as THREE from 'three';
import { EPS, rad, snap, snapRel, sampleLoop, fmt, fmtTime } from '../physics.js';

const WALL_GAP = 0.3;      // 墙到最大位移处的固定间隙

function derive(p) {
  const k = Math.max(p.k, 1e-6), m = Math.max(p.m, 1e-6);
  const omega = Math.sqrt(k / m);
  const T = (2 * Math.PI) / omega;
  const phi = rad(p.phi0);
  const x0 = p.A * snap(Math.cos(phi));      // 初位移
  const v0 = -p.A * omega * snap(Math.sin(phi)); // 初速度
  const E = 0.5 * k * p.A * p.A;             // 总机械能（= 最大弹性势能）
  const vMax = p.A * omega;
  const aMax = p.A * omega * omega;
  return { k, m, omega, T, phi, x0, v0, E, vMax, aMax, wallX: -(p.A + WALL_GAP) };
}

function sampleAt(t, p, d) {
  const a = d.omega * t + d.phi;
  const ca = Math.cos(a), sa = Math.sin(a);
  // 参考点 P：在圆上做匀速圆周运动
  const pos = new THREE.Vector3(p.A * ca, p.A * sa, 0);
  // 参考点速度：切向，大小 Aω
  const vel = new THREE.Vector3(-d.vMax * sa, d.vMax * ca, 0);
  // 参考点加速度：指向圆心，大小 Aω²
  const acc = new THREE.Vector3(-d.aMax * ca, -d.aMax * sa, 0);
  return { pos, vel, acc };
}

function buildTrajectory(p, d) {
  const tEnd = p.turns * d.T;
  return { pts: sampleLoop(t => sampleAt(t, p, d).pos, tEnd), tEnd };
}

/* 振子位置：参考点在 x 轴上的投影 */
function bobOf(s) { return new THREE.Vector3(s.pos.x, 0, 0); }

const params = [
  { key: 'A',     label: '振幅',       sym: 'A',  unit: 'm',    min: 0.05, max: 0.8, step: 0.01, digits: 2 },
  { key: 'k',     label: '劲度系数',   sym: 'k',  unit: 'N/m',  min: 1,    max: 200, map: 'log', digits: 1 },
  { key: 'm',     label: '振子质量',   sym: 'm',  unit: 'kg',   min: 0.05, max: 5,   map: 'log', digits: 2 },
  { key: 'phi0',  label: '初相角',     sym: 'φ₀', unit: '°',    min: 0,    max: 360, step: 1, digits: 0 },
  { key: 'turns', label: '显示周期数', sym: 'n',  unit: '',     min: 1,    max: 6,   step: 1, digits: 0 },
];

const layers = [
  { key: 'traj',   label: '参考圆（参考点轨迹）' },
  { key: 'trail',  label: '已走过的轨迹' },
  { key: 'vel',    label: '速度 v / vₓ（投影）' },
  { key: 'acc',    label: '加速度 a / aₓ（投影）' },
  { key: 'aux',    label: '弹簧、投影线、平衡位置' },
  { key: 'proj',   label: '坐标平面投影', on: false },
  { key: 'axes',   label: '坐标轴' },
];

const readings = [
  { key: 't',   label: '时间 t' },
  { key: 'cyc', label: '已过周期' },
  { key: 'T',   label: '周期 T = 2π√(m/k)', hi: true },
  { key: 'f',   label: '频率 f = 1/T', hi: true },
  { key: 'x',   label: '位移 x', sep: true },
  { key: 'v',   label: '速度 v' },
  { key: 'a',   label: '加速度 a = −ω²x', hi: true },
  { key: 'F',   label: '弹力 F = −kx' },
  { key: 'Ek',  label: '动能 E<sub>k</sub>', sep: true },
  { key: 'Ep',  label: '弹性势能 E<sub>p</sub>' },
  { key: 'E',   label: '总机械能 E' },
];

const presets = [
  {
    id: 'base', title: '简谐运动', view: 'iso', cmp: 'shm',
    note: '最朴素的弹簧振子。参考点 P 在圆上匀速转，它在 x 轴上的投影就是振子。',
    q: '先猜：振幅加倍，周期会变吗？',
    params: { A: 0.3, k: 20, m: 0.5, phi0: 0, turns: 3 },
  },
  {
    id: 'amp2', title: '振幅加倍', view: 'iso', cmp: 'shm',
    note: '<b>关键结论</b>：振幅加倍，周期<b>完全不变</b>。因为 T = 2π√(m/k) 里没有 A。变大的只有最大速度、最大加速度和总能量。画幅与基准预设共用，大小差别是真实的。',
    q: '振幅变大了，为什么振子来回一趟的时间没变？什么变大了？',
    params: { A: 0.6, k: 20, m: 0.5, phi0: 0, turns: 3 },
  },
  {
    id: 'mass2', title: '质量加倍', view: 'iso',
    note: '振子质量加倍 → 周期变成 √2 ≈ 1.41 倍。因为 T ∝ √m。',
    q: '质量变成 2 倍，周期为什么只变成 1.41 倍？',
    params: { A: 0.3, k: 20, m: 1.0, phi0: 0, turns: 3 },
  },
  {
    id: 'k2', title: '劲度系数加倍', view: 'iso',
    note: '弹簧变硬一倍 → 周期变成 1/√2 ≈ 0.71 倍。因为 T ∝ 1/√k。',
    q: '弹簧越硬，振得越快还是越慢？为什么？',
    params: { A: 0.3, k: 40, m: 0.5, phi0: 0, turns: 3 },
  },
  {
    id: 'fromEq', title: '从平衡位置出发', view: 'iso',
    note: '初相角 90° —— 振子从平衡位置出发，此时位移为零但速度最大。',
    q: '从平衡位置出发时，速度和加速度各是多少？加速度为什么是零？',
    params: { A: 0.3, k: 20, m: 0.5, phi0: 90, turns: 3 },
  },
  {
    id: 'negAmp', title: '从负最大位移出发', view: 'iso',
    note: '初相角 180° —— 从负方向的最大位移出发，速度和位移的符号关系与预设 1 完全相反。',
    q: '初相角不同，周期变了吗？变的到底是什么？',
    params: { A: 0.3, k: 20, m: 0.5, phi0: 180, turns: 3 },
  },
];

/* ---------- 渲染声明 ---------- */

function vectors(s, ctx) {
  const { d, C } = ctx;
  const bob = bobOf(s);
  const vx = new THREE.Vector3(s.vel.x, 0, 0);        // 振子的速度 = 参考点速度的 x 分量
  const ax = new THREE.Vector3(s.acc.x, 0, 0);        // 振子的加速度 = 参考点加速度的 x 分量
  return [
    { key: 'vP', label: 'v',  color: C.v,  layer: 'vel', vec: s.vel, ref: d.vMax, radius: 0.026 },
    { key: 'vQ', label: 'vₓ', color: C.vd, layer: 'vel', vec: vx, ref: d.vMax, radius: 0.022, anchor: bob },
    { key: 'aP', label: 'a',  color: C.F,  layer: 'acc', vec: s.acc, ref: d.aMax, radius: 0.024 },
    { key: 'aQ', label: 'aₓ', color: C.F,  layer: 'acc', vec: ax, ref: d.aMax, radius: 0.022, anchor: bob },
  ];
}

function markers(s, ctx) {
  const { d, C, p } = ctx;
  const bob = bobOf(s);
  return [
    { key: 'mkBob', layer: 'aux', color: C.marker, radius: 7.5, pos: bob, depthTest: false, order: 997 },
    { key: 'mkEq',  layer: 'aux', color: C.center, radius: 5, pos: new THREE.Vector3(0, 0, 0) },
    { key: 'mkWall', layer: 'aux', color: C.axis, radius: 5, pos: new THREE.Vector3(d.wallX, 0, 0) },
  ];
}

/* 弹簧画成螺旋线：从墙到振子，圈数固定，长度随振子伸缩。
   螺旋放在 xy 平面里，和参考圆同面 —— 教科书就是这么画的。 */
function springPts(x0, x1, coils, amp) {
  const n = coils * 16;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const x = x0 + (x1 - x0) * f;
    // 两端各留 12% 做直线段，中间才是螺旋
    const env = f < 0.12 || f > 0.88 ? 0 : 1;
    pts.push(new THREE.Vector3(x, Math.sin(f * coils * Math.PI * 2) * amp * env, 0));
  }
  return pts;
}

function segments(s, ctx) {
  const { d, C, p } = ctx;
  const bob = bobOf(s);
  return [
    { key: 'spring', layer: 'aux', color: C.marker,
      pts: springPts(d.wallX, bob.x, 9, Math.min(0.06, p.A * 0.22)) },
    // 投影线：参考点 P 竖直落到 x 轴上的振子 —— 这条线就是"参考圆法"的核心
    { key: 'projline', layer: 'aux', color: C.center, dashed: true,
      pts: [s.pos.clone(), bob] },
  ];
}

/* 墙 + 平衡位置刻度：给出空间参照 */
function guides(ctx) {
  const { d, C, p } = ctx;
  const hh = p.A * 0.9;
  const out = [{
    key: 'wall', layer: 'aux', color: C.axis, width: ctx.lw.guide,
    pts: [new THREE.Vector3(d.wallX, -hh, 0), new THREE.Vector3(d.wallX, hh, 0)],
  }];
  return out;
}

function readingsOf(s, ctx) {
  const { t, d, p } = ctx;
  /* 三个量都过一遍相对归零：t = nT 时振子应精确回到初态（v = 0、a = 0），
     t = nT/4 时 x = 0；不过归零的话，cos(π/2) 的残渣会被 fmt 放大成
     "位移 x=-0.29 fm"、"速度 v=1.39 fm/s"、"弹力 F=5.88 fN"。 */
  const x = snapRel(s.pos.x, p.A);
  const v = snapRel(s.vel.x, d.vMax);
  const a = snapRel(s.acc.x, d.aMax);
  const F = -d.k * x;
  const Ek = 0.5 * d.m * v * v;
  const Ep = 0.5 * d.k * x * x;
  return {
    t: fmtTime(t),
    cyc: (t / d.T).toFixed(2) + ' 个',
    T: fmt(d.T, 's'),
    f: fmt(1 / d.T, 'Hz'),
    x: fmt(x, 'm'),
    v: fmt(v, 'm/s'),
    a: fmt(a, 'm/s²'),
    F: fmt(F, 'N'),
    Ek: fmt(Ek, 'J'),
    Ep: fmt(Ep, 'J'),
    E: fmt(Ek + Ep, 'J'),
  };
}

function hint(ctx) {
  const { d, p } = ctx;
  return `ω = √(k/m) = <b>${fmt(d.omega, 'rad/s')}</b>，T = 2π√(m/k) = <b>${fmt(d.T, 's')}</b>，`
    + `总机械能 E = ½kA² = <b>${fmt(d.E, 'J')}</b>（恒定）。`
    + `最大速度 v<sub>max</sub> = Aω = ${fmt(d.vMax, 'm/s')}，最大加速度 a<sub>max</sub> = Aω² = ${fmt(d.aMax, 'm/s²')}。`;
}

export default {
  id: 'shm',
  name: '简谐运动',
  tagline: '参考圆法：匀速圆周运动在直径上的投影',
  layerTip: '参考点 <b>P</b> 在圆上匀速转，它在 x 轴上的投影就是振子。'
    + '虚线是投影线；<b>vₓ</b> 与 <b>aₓ</b> 分别是 P 的速度、加速度在 x 方向的分量。',

  params, layers, readings, presets,
  views: {
    iso:   { az: -62, el: 26, label: '轴测图' },
    front: { az: 180, el: 0, label: '正对圆面（正视）' },
    top:   { az: -90, el: 90, label: '俯视图' },
  },
  defaultView: 'iso',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, segments, guides, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '振动周期', secondaryUnit: 's',
      secondsPerCycle: d.T, label: 'T', cyclic: true, jumpSeconds: d.T,
    };
  },
};
