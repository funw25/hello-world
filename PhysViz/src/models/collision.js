/* ============================================================
   模型 · 一维弹性碰撞（动量守恒）
   ------------------------------------------------------------
   高考最高频的动量题：两球在一条直线上碰撞。
   球1（主粒子）从 x = −(Δx + R₁ + R₂) 处以 u₁ 出发，球2 在 x = 0 处、初速 u₂。
   碰撞发生在**两球表面接触**时；弹性碰撞后速度由质量决定：

     v₁' = (m₁−m₂)/(m₁+m₂)·u₁ + 2m₂/(m₁+m₂)·u₂
     v₂' = 2m₁/(m₁+m₂)·u₁ + (m₂−m₁)/(m₁+m₂)·u₂

   最经典的情形 m₁ = m₂、球2 静止：两球"交换速度"。

   ★ 有限半径的接触几何（2026-09-13 重做）
   ------------------------------------------------------------
   早先的写法是"两个质心重合即碰撞"：碰撞瞬间两球心落在同一点，
   画面上两个不透明球体完全重叠 —— 学生看到的是"两球合并成一个、
   又分开"，像幻觉。而且接触前后球心自由穿越，球体互相穿透。

   正确的做法是把半径写进几何：
     球心距 = Δx + R₁ + R₂  (t = 0)  →  R₁ + R₂  (t = t_c)  →  越来越大
   于是两球**最多相切、绝不重叠**，t_c 与"碰撞点"也都从表面接触算起。
   半径用真实物理长度（R ∝ m^(1/3)，同密度假设），渲染层按 radiusPhys
   等比例画出来，画面上的接触与物理上的接触是同一个时刻。

   撞击瞬间不再做任何形变（压扁会让人以为球被撞软了），
   只留一颗半径不到小球 40% 的火花，标出"这里碰上了"。
   ============================================================ */

import * as THREE from 'three';
import { EPS, sampleLoop, fmt, fmtTime } from '../physics.js';

/* 质量 → 视觉：半径 ∝ 质量^(1/3)（同密度假设），颜色随质量由浅变深。
   这样"大球撞小球"一眼就看得出来谁大谁小、谁重谁轻。 */
function massNorm(m) {
  return (Math.log(m) - Math.log(0.1)) / (Math.log(5) - Math.log(0.1));
}
function mix(a, b, t) {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}
/* 轻→重 的球色。重球不再用近黑（0x1f2933 那种）——
   配色规范里"不用近黑"，画面才不发闷。 */
const COL_LIGHT = 0x9fc0da, COL_HEAVY = 0x2f5068;

/* 半径标度：m = 1 kg 的球半径（米）。
   取这个值是为了让球在画面上占画幅的 7%~10% —— 太小读不出"实心球"，
   太大又会让 Δx 很小的预设一开始就贴在一起。 */
const R0 = 0.15;
const rOf = (m) => R0 * Math.cbrt(m);

/* 撞击瞬间的"顿挫感"：以碰撞时刻 t_c 为中心的时间窗，窗内 prox=1，窗外=0。
   纯函数 —— 不依赖任何累积状态，时间轴倒放也成立。
   窗口按整条时间轴的比例取（而不是写死秒数），否则 X0 很小的预设里
   这个窗口会盖住大半条时间轴。 */
function impactProx(t, d) {
  if (!isFinite(d.t_c)) return 0;
  const x = 1 - Math.abs(t - d.t_c) / d.impactW;
  return x > 0 ? x : 0;
}

function derive(p) {
  const m1 = Math.max(p.m1, 1e-6), m2 = Math.max(p.m2, 1e-6);
  const u1 = p.u1, u2 = p.u2;
  const X0 = Math.max(p.x0, 1e-4);
  const M = m1 + m2;

  const R1 = rOf(m1), R2 = rOf(m2);
  const d0 = X0 + R1 + R2;          // t = 0 时的球心距

  // 表面接触时刻：球心距从 d0 缩到 R1+R2 需要走过 Δx
  let t_c = Infinity, x1c = 0, x2c = 0;
  if (u1 > u2) {
    t_c = X0 / (u1 - u2);
    x1c = -d0 + u1 * t_c;           // 接触瞬间 球1 球心
    x2c = x1c + R1 + R2;            // 接触瞬间 球2 球心
  }
  const xTouch = x1c + R1;          // 接触点（两球表面的公共点）

  const v1 = (m1 - m2) / M * u1 + (2 * m2) / M * u2;
  const v2 = (2 * m1) / M * u1 + (m2 - m1) / M * u2;
  const tEnd = (isFinite(t_c) ? t_c : 0)
    + Math.max(X0 / Math.max(Math.abs(v1), Math.abs(v2), 0.1),
               X0 / Math.max(Math.abs(u1), Math.abs(u2), 0.1)) * 1.6;

  const P0 = m1 * u1 + m2 * u2;
  const K0 = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const P1 = m1 * v1 + m2 * v2;
  const K1 = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  const mn1 = massNorm(m1), mn2 = massNorm(m2);     // 0..1 染色

  return { m1, m2, u1, u2, X0, M, d0, R1, R2, Rmin: Math.min(R1, R2),
    t_c, x1c, x2c, xTouch, v1, v2, tEnd, P0, K0, P1, K1, mn1, mn2,
    impactW: Math.min(Math.max(0.07 * tEnd, 0.025), 0.25),
    vRef: Math.max(Math.abs(u1), Math.abs(u2), 1) };
}

/* 球1（主粒子）球心位置；球2 球心位置在 markers/guides 里各自计算 */
function p1At(t, d) {
  if (t <= d.t_c) return -d.d0 + d.u1 * t;
  return d.x1c + d.v1 * (t - d.t_c);
}
function p2At(t, d) {
  if (t <= d.t_c) return d.u2 * t;
  return d.x2c + d.v2 * (t - d.t_c);
}
function sampleAt(t, p, d) {
  const x1 = p1At(t, d);
  const vx = t <= d.t_c ? d.u1 : d.v1;
  return {
    pos: new THREE.Vector3(x1, 0, 0),
    vel: new THREE.Vector3(vx, 0, 0),
    acc: new THREE.Vector3(0, 0, 0),
    // 质量 → 大小/颜色交给渲染层，sampleAt 仍是纯物理。
    // headRadiusPhys：主粒子按真实物理半径画，才能和球2 的接触几何对得上。
    headRadiusPhys: d.R1,
    headColor: mix(COL_LIGHT, COL_HEAVY, d.mn1),
  };
}
function buildTrajectory(p, d) {
  return { pts: sampleLoop(t => new THREE.Vector3(p1At(t, d), 0, 0), d.tEnd), tEnd: d.tEnd };
}

const params = [
  { key: 'm1', label: '球1质量', sym: 'm₁', unit: 'kg', min: 0.1, max: 5, map: 'log', digits: 2 },
  { key: 'm2', label: '球2质量', sym: 'm₂', unit: 'kg', min: 0.1, max: 5, map: 'log', digits: 2 },
  { key: 'u1', label: '球1初速', sym: 'u₁', unit: 'm/s', min: -5, max: 5, step: 0.1, digits: 2 },
  { key: 'u2', label: '球2初速', sym: 'u₂', unit: 'm/s', min: -5, max: 5, step: 0.1, digits: 2 },
  { key: 'x0', label: '初始间距', sym: 'Δx', unit: 'm', min: 0.2, max: 4, step: 0.1, digits: 2 },
];

const layers = [
  { key: 'traj', label: '球1轨迹' },
  { key: 'trail', label: '球1已走过' },
  { key: 'vel', label: '速度 v₁ / v₂' },
  { key: 'ball2', label: '球2（标记 + 预测路径）', on: true },
  { key: 'aux', label: '碰撞点' },
  { key: 'proj', label: '坐标平面投影', on: false },
  { key: 'axes', label: '坐标轴' },
];

const readings = [
  { key: 't', label: '时间 t' },
  { key: 'x1', label: '球1球心 x₁' },
  { key: 'x2', label: '球2球心 x₂', sep: true },
  { key: 'v1', label: '球1速率 v₁' },
  { key: 'v2', label: '球2速率 v₂' },
  { key: 'P', label: '系统总动量 P', hi: true },
  { key: 'K', label: '系统总动能 K', hi: true },
  { key: 'cons', label: '动量/动能', hi: true },
];

const presets = [
  {
    id: 'equal', title: '等质量（速度交换）', view: 'face',
    note: 'm₁ = m₂，球2静止：碰撞后球1停下、球2以球1原速前进 —— 经典"速度交换"。',
    q: '为什么等质量碰撞后，球1会停、球2接走全部速度？',
    params: { m1: 1, m2: 1, u1: 3, u2: 0, x0: 1.5 },
  },
  {
    id: 'heavy', title: '大球撞小球', view: 'face',
    note: 'm₁ ≫ m₂，球2静止：大球几乎不受影响继续前进，小球被高速弹出。',
    q: '轻球被撞后，速度能超过大球原来的速度吗？',
    params: { m1: 4, m2: 1, u1: 3, u2: 0, x0: 1.5 },
  },
  {
    id: 'light', title: '小球撞大球', view: 'face',
    note: 'm₁ ≪ m₂，球2静止：小球反弹回去，大球缓缓前进。',
    q: '小球为什么会被弹回？动量守恒要求大球怎么动？',
    params: { m1: 1, m2: 4, u1: 3, u2: 0, x0: 1.5 },
  },
  {
    id: 'headon', title: '迎面碰撞', view: 'face',
    note: '两球相向运动：撞后各自反向，系统总动量仍守恒。',
    q: '两球相向而来，撞完之后分别往哪边走？',
    params: { m1: 1, m2: 1, u1: 3, u2: -2, x0: 1.5 },
  },
];

function vectors(s, ctx) {
  const { d, C } = ctx;
  const x2 = p2At(ctx.t, d);
  const v2 = ctx.t <= d.t_c ? d.u2 : d.v2;
  return [
    { key: 'v1', label: 'v₁', color: C.v, layer: 'vel', vec: s.vel, ref: d.vRef, radius: 0.026 },
    { key: 'v2', label: 'v₂', color: C.vp, layer: 'vel', vec: new THREE.Vector3(v2, 0, 0), ref: d.vRef, radius: 0.024,
      anchor: new THREE.Vector3(x2, 0, 0) },
  ];
}

function markers(s, ctx) {
  const { d, C } = ctx;
  const x2 = p2At(ctx.t, d);
  const prox = impactProx(ctx.t, d);
  const out = [
    // 球2：半径按真实物理长度画，和球1 的 headRadiusPhys 用同一个标度 ——
    //   于是"两球相切"在画面上就是真的相切，不会重叠。
    //   注意：这里**没有** scaleVec，撞击时不压扁。
    { key: 'mkB2', layer: 'ball2', color: mix(COL_LIGHT, COL_HEAVY, d.mn2),
      radiusPhys: d.R2, pos: new THREE.Vector3(x2, 0, 0) },
    // 碰撞点：一个稳定的中心色小点，标出"碰在哪里"
    { key: 'mkCcore', layer: 'aux', color: C.center, radiusPhys: d.Rmin * 0.13,
      pos: new THREE.Vector3(d.xTouch, 0, 0) },
  ];
  if (isFinite(d.t_c) && prox > 0.02) {
    // 撞击火花：半径不超过小球的 40%，而且只在接触点上闪一下 ——
    //   早先那颗半径接近球、还带外晕的光斑，是"两球合并"错觉的帮凶。
    out.push({
      key: 'mkChalo', layer: 'aux', color: 0xffd54a, depthTest: false, order: 1000,
      radiusPhys: d.Rmin * 0.4 * prox,
      pos: new THREE.Vector3(d.xTouch, 0, 0),
      opacity: 0.9,
    });
  }
  return out;
}

function guides(ctx) {
  const { d, C } = ctx;
  if (!isFinite(d.t_c)) {
    return [{ key: 'p2path', layer: 'ball2', color: C.marker, width: ctx.lw.guide * 0.8,
      pts: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(d.u2 * d.tEnd, 0, 0)] }];
  }
  const pts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(d.x2c, 0, 0),
    new THREE.Vector3(d.x2c + d.v2 * (d.tEnd - d.t_c), 0, 0),
  ];
  return [{ key: 'p2path', layer: 'ball2', color: C.marker, width: ctx.lw.guide * 0.8, pts }];
}

function readingsOf(s, ctx) {
  const { t, d } = ctx;
  const v1 = t <= d.t_c ? d.u1 : d.v1;
  const v2 = t <= d.t_c ? d.u2 : d.v2;
  const P = d.m1 * v1 + d.m2 * v2;
  const K = 0.5 * d.m1 * v1 * v1 + 0.5 * d.m2 * v2 * v2;
  const epsP = 1e-3 * Math.max(Math.abs(d.P0), 1);
  const epsK = 1e-3 * Math.max(Math.abs(d.K0), 1);
  const cP = Math.abs(P - d.P0) < epsP;
  const cK = Math.abs(K - d.K0) < epsK;
  return {
    t: fmtTime(t),
    x1: fmt(s.pos.x, 'm'),
    x2: fmt(p2At(t, d), 'm'),
    v1: fmt(v1, 'm/s'),
    v2: fmt(v2, 'm/s'),
    P: fmt(P, 'kg·m/s'),
    K: fmt(K, 'J'),
    cons: (cP ? '动量守恒' : '动量≠') + ' / ' + (cK ? '动能守恒' : '动能≠'),
  };
}

function hint(ctx) {
  const { d } = ctx;
  return `弹性碰撞中系统<b>动量守恒</b>、<b>机械能守恒</b>。`
    + `碰前 P = ${fmt(d.P0, 'kg·m/s')}，K = ${fmt(d.K0, 'J')}；`
    + `碰后 P = ${fmt(d.P1, 'kg·m/s')}，K = ${fmt(d.K1, 'J')}（应相等）。`;
}

export default {
  id: 'collision',
  name: '弹性碰撞',
  tagline: '一维弹性碰撞：动量与动能守恒',
  layerTip: '球1 是主粒子（带完整轨迹）；<b>球2</b> 以标记 + 预测路径显示。'
    + '两球半径按质量 m<sup>1/3</sup> 给出，碰撞发生在<b>表面相切</b>的那一刻。'
    + 'v₁ / v₂ 两个箭头分别挂在各自球上。',

  params, layers, readings, presets,
  views: {
    face: { az: -90, el: 90, label: '正视图' },
    iso:  { az: -62, el: 24, label: '轴测图' },
    side: { az: 180, el: 0, label: '侧视图' },
  },
  defaultView: 'face',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, guides, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '秒', secondaryUnit: 's',
      secondsPerCycle: 1, label: 's', cyclic: false,
      jumpSeconds: isFinite(d.t_c) ? d.t_c : d.tEnd / 3,
    };
  },
};
