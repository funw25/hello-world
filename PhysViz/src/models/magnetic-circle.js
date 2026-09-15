/* ============================================================
   模型 · 带电粒子在匀强磁场中的匀速圆周运动
   ------------------------------------------------------------
   高考最常考的一类：垂直射入匀强磁场的带电粒子做匀速圆周运动。
   三个必背结论都在这里看得见：

     r = mv/(qB)        —— 半径跟速率成正比、跟磁感应强度成反比
     T = 2πm/(qB)       —— 周期与速率、半径都无关（这是最容易错的一点）
     ω = qB/m           —— 角频率只由 q/m 和 B 决定

   与「配速法」的区别：配速法有电场、有漂移，轨迹是摆线；
   这里只有磁场，轨迹是圆（或螺旋），重点是**圆心与半径的几何构造**：
   半径矢量始终垂直于速度，洛伦兹力永远指向圆心。
   ============================================================ */

import * as THREE from 'three';
import { PARTICLES, N, EPS, snap, rad, sampleLoop, fmt, fmtTime } from '../physics.js';

const B_FLOOR = 1e-4;

function derive(p) {
  const { q, m } = PARTICLES[p.particle];
  const B = Math.max(p.B, B_FLOOR);

  const th = rad(p.theta), ph = rad(p.phi);
  const sn = snap(Math.sin(th)), cs = snap(Math.cos(th));
  const cp = snap(Math.cos(ph)), sp = snap(Math.sin(ph));

  // 初速度分解：垂直于 B 的分量（做圆周）+ 平行于 B 的分量（做匀速）
  const vPerp = new THREE.Vector3(p.v0 * sn * cp, p.v0 * sn * sp, 0);
  const vPar = p.v0 * cs;

  const omega = (q * B) / m;              // 有符号回旋角频率，符号决定绕行方向
  const wAbs = Math.abs(omega);
  const T = (2 * Math.PI) / wAbs;
  const r = vPerp.length() / wAbs;        // = mv⊥/(|q|B)
  const pitch = Math.abs(vPar) * T;       // 螺距（θ = 90° 时为 0）
  const vRef = p.v0 || 1;

  return { q, m, B, vPerp, vPar, omega, wAbs, T, r, pitch, vRef, vMag: p.v0 };
}

function sampleAt(t, p, d) {
  const w = d.omega;
  const px = d.vPerp.x, py = d.vPerp.y;
  const s = Math.sin(w * t), c = Math.cos(w * t);

  const x = (px * s + py * (1 - c)) / w;
  const y = (px * (c - 1) + py * s) / w;
  const vx = px * c + py * s;
  const vy = -px * s + py * c;

  const pos = new THREE.Vector3(x, y, d.vPar * t);
  const vel = new THREE.Vector3(vx, vy, d.vPar);
  // 洛伦兹力 a = (q/m) v × B，B 沿 +z
  const acc = new THREE.Vector3((d.q / d.m) * vel.y * d.B, -(d.q / d.m) * vel.x * d.B, 0);
  return { pos, vel, acc };
}

function buildTrajectory(p, d) {
  const tEnd = p.turns * d.T;
  return { pts: sampleLoop(t => sampleAt(t, p, d).pos, tEnd), tEnd };
}

/* 圆心（引导中心）：c = pos + (1/ω)·(v_y, −v_x, 0)
   验证：t = 0 时 c = (v⊥y/ω, −v⊥x/ω, 0)，|c| = v⊥/|ω| = r ✓ */
function centerOf(s, d) {
  return new THREE.Vector3(
    s.pos.x + s.vel.y / d.omega,
    s.pos.y - s.vel.x / d.omega,
    s.pos.z,
  );
}

const params = [
  { key: 'particle', type: 'select', label: '粒子', options: Object.entries(PARTICLES).map(([v, o]) => ({ v, t: o.label })) },
  { key: 'B',     label: '磁感应强度',   sym: 'B',  unit: 'T',   min: 0.02, max: 2,   map: 'log', digits: 3 },
  { key: 'v0',    label: '初速度大小',   sym: 'v₀', unit: 'm/s', min: 1e4,  max: 2e7, map: 'quad', digits: 0 },
  { key: 'theta', label: 'v₀ 与 B 夹角', sym: 'θ',  unit: '°',   min: 0,    max: 90,  step: 1, digits: 0 },
  { key: 'phi',   label: '垂直面方位角', sym: 'φ',  unit: '°',   min: 0,    max: 360, step: 1, digits: 0 },
  { key: 'turns', label: '显示圈数',     sym: 'n',  unit: '',    min: 1,    max: 6,   step: 1, digits: 0 },
];

const layers = [
  { key: 'traj',   label: '完整轨迹' },
  { key: 'trail',  label: '已走过的轨迹' },
  { key: 'vel',    label: '速度分解 v / v⊥ / v∥' },
  { key: 'radius', label: '圆心与半径矢量 r' },
  { key: 'force',  label: '洛伦兹力 F = qvB', on: false },
  { key: 'bField', label: '磁场线 B（沿 z）' },
  { key: 'proj',   label: '坐标平面投影', on: false },
  { key: 'axes',   label: '坐标轴' },
];

const readings = [
  { key: 't',    label: '时间 t' },
  { key: 'cyc',  label: '已过周期' },
  { key: 'v',    label: '速率 |v|' },
  { key: 'vperp', label: '垂直分量 v⊥', sep: true },
  { key: 'vpar', label: '平行分量 v∥' },
  { key: 'r',    label: '回旋半径 r', hi: true },
  { key: 'T',    label: '回旋周期 T', hi: true },
  { key: 'om',   label: '角频率 ω', sep: true },
  { key: 'ac',   label: '向心加速度 a' },
  { key: 'F',    label: '洛伦兹力 F' },
  { key: 'pitch', label: '螺距 h' },
];

const presets = [
  {
    id: 'electron', title: '电子圆周运动', view: 'top', cmp: 'size',
    note: '电子垂直射入匀强磁场，做匀速圆周运动。r = mv/(qB)，T = 2πm/(qB)。',
    q: '先猜：把初速度加倍，半径变几倍？周期变吗？',
    params: { particle: 'electron', B: 0.5, v0: 8e5, theta: 90, phi: 0, turns: 2 },
  },
  {
    id: 'bigB', title: 'B 加倍', view: 'top', cmp: 'size',
    note: '磁感应强度加倍。半径减半（r ∝ 1/B），周期也减半（T ∝ 1/B）。画幅与基准预设共用，大小差别是真实的。',
    q: '为什么 B 加倍时，半径和周期都减半，而不是只有半径变？',
    params: { particle: 'electron', B: 1.0, v0: 8e5, theta: 90, phi: 0, turns: 2 },
  },
  {
    id: 'v2', title: 'v₀ 加倍', view: 'top', cmp: 'size',
    note: '<b>最重要的考点</b>：初速度加倍 → 半径加倍，但<b>周期完全不变</b>。因为 T = 2πm/(qB) 里根本没有 v。',
    q: '速率变大了，转一圈要花的时间为什么反而没变？',
    params: { particle: 'electron', B: 0.5, v0: 1.6e6, theta: 90, phi: 0, turns: 2 },
  },
  {
    id: 'proton', title: '换成质子', view: 'top',
    // 质子半径是电子的 1836 倍，超出任何画幅能同时容纳的范围，
    // 所以这里不能锁尺度，只能自适应；大小差异请引导到右侧读数去看。
    note: '同样条件下质子比电子重 1836 倍，半径也是 1836 倍、周期也是 1836 倍。画幅已自动缩放，这个差别要看右侧读数，不是看画面。',
    q: '为什么质量变大，半径和周期会同比例变大？这两个公式里 m 的位置一样吗？',
    params: { particle: 'proton', B: 0.5, v0: 8e5, theta: 90, phi: 0, turns: 2 },
  },
  {
    id: 'helix', title: '螺旋线', view: 'iso',
    note: 'θ = 60° 时速度有了沿 B 的分量。垂直分量画圆、平行分量匀速前进，合成一条螺旋线。',
    q: '螺距由什么决定？如果 θ 变成 90°，螺距是多少？',
    params: { particle: 'electron', B: 0.5, v0: 8e5, theta: 60, phi: 0, turns: 3 },
  },
  {
    id: 'reverse', title: '正电荷反向绕行', view: 'top',
    note: '换成 α 粒子（带正电），其余条件不变。洛伦兹力方向反过来，绕行方向也反过来 —— 这是判断正负电荷的标准方法。',
    q: '怎么只看轨迹的绕行方向，就判断出粒子带的是正电还是负电？',
    params: { particle: 'alpha', B: 0.5, v0: 8e5, theta: 90, phi: 0, turns: 2 },
  },
];

/* ---------- 渲染声明 ---------- */

function vectors(s, ctx) {
  const { d, C } = ctx;
  const c = centerOf(s, d);
  const R = s.pos.clone().sub(c);                       // 半径矢量：圆心 → 粒子
  const vPerp = new THREE.Vector3(s.vel.x, s.vel.y, 0);  // 速度的垂直分量（在转）
  const vPar = new THREE.Vector3(0, 0, s.vel.z);
  const F = new THREE.Vector3()
    .crossVectors(s.vel, new THREE.Vector3(0, 0, d.B)).multiplyScalar(d.q);
  return [
    { key: 'v',  label: 'v',  color: C.v,  layer: 'vel', vec: s.vel, ref: d.vRef, radius: 0.026,
      parallelogram: { legs: ['vperp', 'vpar'], tip: 'v' } },
    { key: 'vperp', label: 'v⊥', color: C.vd, layer: 'vel', vec: vPerp, ref: d.vRef, radius: 0.024 },
    { key: 'vpar',  label: 'v∥', color: C.vp, layer: 'vel', vec: vPar, ref: d.vRef, radius: 0.024 },
    // 半径矢量的长度参考取 r 本身 —— 这样它永远是满长箭头，能直接看出半径没变
    { key: 'R', label: 'r', color: C.Nrm, layer: 'radius', vec: R, ref: d.r, radius: 0.022 },
    { key: 'F', label: 'F', color: C.F, layer: 'force', vec: F, ref: Math.max(F.length(), EPS), radius: 0.024 },
  ];
}

function markers(s, ctx) {
  const { d, C } = ctx;
  return [{
    key: 'mkCenter', layer: 'radius', color: C.center, radius: 6.5,
    pos: centerOf(s, d), depthTest: false, order: 996,
  }];
}

function fields(ctx) {
  const { C } = ctx;
  return [{
    key: 'bField', layer: 'bField', color: C.bLine, label: 'B',
    dir: new THREE.Vector3(0, 0, 1),
    spacing: 152, thick: 0.85, head: 2.3, headL: 8,
  }];
}

function readingsOf(s, ctx) {
  const { t, d } = ctx;
  const F = d.q * d.B * Math.hypot(s.vel.x, s.vel.y);
  const ac = d.wAbs * d.wAbs * d.r;
  return {
    t: fmtTime(t),
    cyc: (t / d.T).toFixed(2) + ' 个',
    v: fmt(s.vel.length(), 'm/s'),
    vperp: fmt(Math.hypot(d.vPerp.x, d.vPerp.y), 'm/s'),
    vpar: fmt(d.vPar, 'm/s'),
    r: fmt(d.r, 'm'),
    T: fmt(d.T, 's'),
    om: fmt(d.wAbs, 'rad/s'),
    ac: fmt(ac, 'm/s²'),
    F: fmt(F, 'N'),
    pitch: fmt(d.pitch, 'm'),
  };
}

function hint(ctx) {
  const { d } = ctx;
  const dir = d.omega > 0 ? '逆时针（q > 0）' : '顺时针（q < 0）';
  return `r = mv⊥/(qB) = <b>${fmt(d.r, 'm')}</b>，T = 2πm/(qB) = <b>${fmt(d.T, 's')}</b>`
    + `（<b>与速率无关</b>），ω = qB/m = ${fmt(d.wAbs, 'rad/s')}。`
    + `俯视时绕行方向为 <b>${dir}</b>。`;
}

export default {
  id: 'magnetic-circle',
  name: '磁场中的圆周运动',
  tagline: '洛伦兹力提供向心力：r = mv/(qB)，T = 2πm/(qB)',
  layerTip: '半径矢量 <b>r</b> 与速度 <b>v</b> 始终垂直 —— 这是确定圆心的几何依据：'
    + '过粒子作 v 的垂线，截取 r 的长度就是圆心。',

  params, layers, readings, presets,
  views: {
    top:   { az: -90, el: 90, label: '俯视图' },
    iso:   { az: -62, el: 26, label: '轴测图' },
    front: { az: 180, el: 0, label: '前视图' },
  },
  defaultView: 'top',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, fields, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '回旋周期', secondaryUnit: 's',
      secondsPerCycle: d.T, label: 'T', cyclic: true, jumpSeconds: d.T,
    };
  },
};
