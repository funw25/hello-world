/* ============================================================
   模型 · 回旋加速器
   ------------------------------------------------------------
   带电粒子在匀强磁场 B 中做圆周运动；每经过一次狭缝（交变电场）被加速一次，
   能量增加 → 回旋半径增大 → 轨迹是不断外扩的螺旋。
   关键性质：回旋角频率 ω = qB/m 与半径、速率无关，所以可以持续加速。

   坐标约定：
     磁场 B 沿 +z；粒子从中心附近出发，在 xy 平面内螺旋外扩。
     半径由能量反推：r(t) = √(2mK)/(qB)，K 随加速次数线性增长。
   ============================================================ */

import * as THREE from 'three';
import { PARTICLES, EPS, sampleLoop, fmt, fmtTime } from '../physics.js';

const B_FLOOR = 1e-4;

function derive(p) {
  const { q, m } = PARTICLES[p.particle];
  const B = Math.max(p.B, B_FLOOR);
  const omega = Math.abs(q * B) / m;            // 回旋角频率（与半径无关）
  const T = (2 * Math.PI) / omega;
  const V = Math.max(p.V, 0);
  const qabs = Math.abs(q);
  const K0 = 0.5 * m * p.v0 * p.v0;
  const gainPerHalf = qabs * V;                 // 每过半圈获得能量 qV
  const tEnd = p.turns * T;
  const nHalf = Math.floor((omega * tEnd) / Math.PI);
  const Kmax = K0 + gainPerHalf * nHalf;
  const rMin = Math.sqrt(2 * m * Math.max(K0, 0)) / (qabs * B);
  const rMax = Math.sqrt(2 * m * Math.max(Kmax, 0)) / (qabs * B);
  const vRef = Math.sqrt(2 * Math.max(Kmax, 1e-30) / m) || 1;
  return { q, m, B, omega, T, V, qabs, K0, gainPerHalf, tEnd, rMin, rMax, vRef };
}

/* 由时间求半径（从能量反推）。K 随半周期数线性增长，封顶于 tEnd。 */
function radiusAt(t, d) {
  const K = d.K0 + d.gainPerHalf * Math.min((d.omega * t) / Math.PI, (d.omega * d.tEnd) / Math.PI);
  return Math.sqrt(2 * d.m * Math.max(K, 0)) / (d.qabs * d.B);
}
function posAt(t, d) {
  const r = radiusAt(t, d);
  const phi = d.omega * t;
  return new THREE.Vector3(r * Math.cos(phi), r * Math.sin(phi), 0);
}

/* 速度 / 加速度用有限差分（保证与位置自洽，且避免解析求导出错） */
function sampleAt(t, p, d) {
  const pos = posAt(t, d);
  const h = Math.max(d.tEnd * 1e-5, 1e-12);
  const pa = posAt(Math.max(t - h, 0), d);
  const pb = posAt(t + h, d);
  const vel = pb.clone().sub(pa).multiplyScalar(1 / (2 * h));
  const acc = pb.clone().add(pa).sub(pos.clone().multiplyScalar(2)).multiplyScalar(1 / (h * h));
  return { pos, vel, acc };
}

function buildTrajectory(p, d) {
  return { pts: sampleLoop(t => posAt(t, d), d.tEnd), tEnd: d.tEnd };
}

const params = [
  { key: 'particle', type: 'select', label: '粒子', options: Object.entries(PARTICLES).map(([v, o]) => ({ v, t: o.label })) },
  { key: 'B', label: '磁感应强度', sym: 'B', unit: 'T', min: 0.02, max: 2, map: 'log', digits: 3 },
  { key: 'V', label: '加速电压', sym: 'V', unit: 'V', min: 0, max: 5000, step: 10, digits: 0 },
  { key: 'v0', label: '注入速度', sym: 'v₀', unit: 'm/s', min: 0, max: 5e6, map: 'quad', digits: 0 },
  { key: 'turns', label: '显示圈数', sym: 'n', unit: '', min: 1, max: 6, step: 1, digits: 0 },
];

const layers = [
  { key: 'traj', label: '螺旋轨迹' },
  { key: 'trail', label: '已走过的轨迹' },
  { key: 'vel', label: '速度 v' },
  { key: 'force', label: '洛伦兹力 F' },
  { key: 'bField', label: '磁场线 B（沿 z）' },
  { key: 'aux', label: '最外圈 / 中心', on: false },
  { key: 'proj', label: '坐标平面投影', on: false },
  { key: 'axes', label: '坐标轴' },
];

const readings = [
  { key: 't', label: '时间 t' },
  { key: 'cyc', label: '已过圈数' },
  { key: 'T', label: '回旋周期 T', hi: true },
  { key: 'r', label: '当前半径 r', hi: true, sep: true },
  { key: 'v', label: '速率 |v|' },
  { key: 'K', label: '动能 K' },
  { key: 'omega', label: '回旋角频率 ω', sep: true },
];

const presets = [
  {
    id: 'spiral', title: '电子回旋', view: 'face',
    note: '电子在匀强磁场中每次过缝被加速，轨迹是不断外扩的螺旋。',
    q: '为什么螺旋越往外越疏？回旋角频率变了吗？',
    params: { particle: 'electron', B: 0.5, V: 1000, v0: 1e5, turns: 3 },
  },
  {
    id: 'proton', title: '质子回旋', view: 'face',
    note: '换成质子：质量大 1836 倍，同样条件下螺旋粗得多、转得慢。',
    q: '为什么质子转得比电子慢这么多？',
    params: { particle: 'proton', B: 0.5, V: 1000, v0: 1e5, turns: 3 },
  },
  {
    id: 'strongB', title: '强磁场', view: 'face',
    note: 'B 加倍 → 回旋频率加倍、半径减半，螺旋更紧。',
    q: '磁场越强，螺旋是更紧还是更松？',
    params: { particle: 'electron', B: 1.0, V: 1000, v0: 1e5, turns: 3 },
  },
  {
    id: 'highV', title: '高加速电压', view: 'face',
    note: 'V 加大 → 每半圈获得能量更多，半径增长更快。',
    q: '加速电压越高，半径增长越快还是越慢？',
    params: { particle: 'electron', B: 0.5, V: 4000, v0: 1e5, turns: 3 },
  },
];

function vectors(s, ctx) {
  const { d, C } = ctx;
  const B = new THREE.Vector3(0, 0, d.B);
  const F = new THREE.Vector3().crossVectors(s.vel, B).multiplyScalar(d.q);
  const fRef = Math.max(F.length(), EPS);
  return [
    { key: 'v', label: 'v', color: C.v, layer: 'vel', vec: s.vel, ref: d.vRef, radius: 0.026 },
    { key: 'F', label: 'F', color: C.F, layer: 'force', vec: F, ref: fRef, radius: 0.024 },
  ];
}

function markers(s, ctx) {
  const { C } = ctx;
  return [{ key: 'mkC', layer: 'aux', color: C.origin, radius: 6, pos: new THREE.Vector3(0, 0, 0) }];
}

function fields(ctx) {
  const { d, C } = ctx;
  return [{ key: 'bField', layer: 'bField', color: C.bLine, dir: new THREE.Vector3(0, 0, 1),
    spacing: 152, thick: 0.85, head: 2.3, headL: 8 }];
}

function guides(ctx) {
  const { d, C } = ctx;
  const n = 64, pts = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(d.rMax * Math.cos(a), d.rMax * Math.sin(a), 0));
  }
  return [{ key: 'maxOrbit', layer: 'aux', color: C.aux, width: ctx.lw.guide * 0.6, pts }];
}

function readingsOf(s, ctx) {
  const { t, d } = ctx;
  const r = Math.hypot(s.pos.x, s.pos.y);
  const K = 0.5 * d.m * s.vel.lengthSq();
  return {
    t: fmtTime(t),
    cyc: (t / d.T).toFixed(2) + ' 圈',
    T: fmt(d.T, 's'),
    r: fmt(r, 'm'),
    v: fmt(s.vel.length(), 'm/s'),
    K: fmt(K, 'J'),
    omega: fmt(d.omega, 'rad/s'),
  };
}

function hint(ctx) {
  const { d } = ctx;
  return `回旋频率 f = qB/(2πm)，<b>与半径、速率无关</b> —— 这正是回旋加速器能持续加速的原因。`
    + `当前半径 r = mv/(qB)，随能量增大而增大；T = 2πm/(qB) = <b>${fmt(d.T, 's')}</b>。`;
}

export default {
  id: 'cyclotron',
  name: '回旋加速器',
  tagline: '匀强磁场中持续加速的螺旋轨迹',
  layerTip: '洛伦兹力 <b>F = qv×B</b> 始终指向圆心，提供向心力；'
    + '每次过狭缝被电场加速，半径随之增大，形成外扩螺旋。',

  params, layers, readings, presets,
  views: {
    face: { az: -90, el: 90, label: '俯视图' },
    iso:  { az: -62, el: 26, label: '轴测图' },
    side: { az: 180, el: 0, label: '侧视图' },
  },
  defaultView: 'face',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, fields, guides, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '回旋周期', secondaryUnit: 's',
      secondsPerCycle: d.T, label: 'T', cyclic: true, jumpSeconds: d.T,
    };
  },
};
