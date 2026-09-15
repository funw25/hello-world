/* ============================================================
   模型 · 天体运动 / 卫星轨道
   ------------------------------------------------------------
   高考的卫星题基本就是三条：

     1. 万有引力提供向心力：GMm/r² = mv²/r = mω²r = m(4π²/T²)r
     2. 开普勒第三定律：a³/T² = GM/(4π²) —— 与卫星质量无关
     3. 开普勒第二定律：矢径在相等时间内扫过相等面积（面积速度恒定）

   这个模型把椭圆轨道真正解出来：用开普勒方程
        M = E − e·sinE        （M 平近点角，E 偏近点角）
   牛顿迭代解出 E，再换算成真近点角 ν 与矢径 r。

   重要：E 是**对每个 t 独立解出来的**，不依赖历史状态 ——
   所以时间轴依然可以任意跳转、倒放，和解析解一样。
   这是"数值方法"和"累积状态"的区别，前者不破坏架构。
   ============================================================ */

import * as THREE from 'three';
import { N, EPS, G, M_EARTH, R_EARTH, M_MOON, R_MOON, sampleLoop, fmt, fmtTime } from '../physics.js';

const BODIES = {
  earth: { label: '地球', M: M_EARTH, R: R_EARTH, mu: G * M_EARTH },
  moon:  { label: '月球', M: M_MOON,  R: R_MOON,  mu: G * M_MOON },
};

/* 开普勒方程 M = E − e·sinE，牛顿迭代求 E。
   初值取 E₀ = M + e·sinM（对 e < 0.8 收敛很快）。 */
function solveKepler(M, e) {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 60; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    const dE = f / fp;
    E -= dE;
    if (Math.abs(dE) < 1e-13) break;
  }
  return E;
}

function derive(p) {
  const body = BODIES[p.body] || BODIES.earth;
  const r1 = body.R + p.h1 * 1000;        // 近地点距离
  const r2 = body.R + p.h2 * 1000;        // 远地点距离
  const a = (r1 + r2) / 2;                // 半长轴
  const e = (r2 - r1) / (r2 + r1);        // 偏心率
  const n = Math.sqrt(body.mu / (a * a * a));   // 平均角速度
  const T = (2 * Math.PI) / n;
  const inc = (p.incl * Math.PI) / 180;

  // 轨道平面的一组正交基：ê1 在 xy 平面内，ê2 由倾角决定
  const e1 = new THREE.Vector3(1, 0, 0);
  const e2 = new THREE.Vector3(0, Math.cos(inc), Math.sin(inc));

  const vPeri = Math.sqrt(body.mu * (2 / r1 - 1 / a));
  const vApo = Math.sqrt(body.mu * (2 / r2 - 1 / a));
  const areaRate = 0.5 * Math.sqrt(body.mu * a * (1 - e * e));   // 面积速度，恒定

  return {
    body, r1, r2, a, e, n, T, inc, e1, e2, vPeri, vApo, areaRate,
    vRef: Math.max(vPeri, EPS),
  };
}

function sampleAt(t, p, d) {
  const M = ((d.n * t) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  const E = solveKepler(M, d.e);
  const cosE = Math.cos(E), sinE = Math.sin(E);
  const r = d.a * (1 - d.e * cosE);

  // 真近点角
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + d.e) * Math.sin(E / 2),
    Math.sqrt(1 - d.e) * Math.cos(E / 2),
  );

  // 速度：对位置解析求导（比数值差分干净）
  const denom = 1 - d.e * cosE;
  const rdot = d.a * d.e * sinE * (d.n / denom);
  const nudot = d.n * Math.sqrt(1 - d.e * d.e) / (denom * denom);
  const cn = Math.cos(nu), sn = Math.sin(nu);

  const xo = r * cn, yo = r * sn;
  const vxo = rdot * cn - r * nudot * sn;
  const vyo = rdot * sn + r * nudot * cn;

  const pos = d.e1.clone().multiplyScalar(xo).addScaledVector(d.e2, yo);
  const vel = d.e1.clone().multiplyScalar(vxo).addScaledVector(d.e2, vyo);
  // 万有引力加速度：始终指向中心天体
  const acc = pos.clone().multiplyScalar(-d.body.mu / (r * r * r));
  return { pos, vel, acc };
}

function buildTrajectory(p, d) {
  const tEnd = p.turns * d.T;
  return { pts: sampleLoop(t => sampleAt(t, p, d).pos, tEnd), tEnd };
}

/* 近地点 / 远地点位置（用于标记与长轴） */
function apsides(d) {
  return {
    peri: d.e1.clone().multiplyScalar(d.r1),
    apo: d.e1.clone().multiplyScalar(-d.r2),
  };
}

const params = [
  { key: 'body', label: '中心天体', type: 'select', options: Object.entries(BODIES).map(([v, o]) => ({ v, t: o.label })) },
  { key: 'h1',   label: '近地点高度', sym: 'h₁', unit: 'km', min: 100, max: 42000, map: 'log', digits: 0 },
  { key: 'h2',   label: '远地点高度', sym: 'h₂', unit: 'km', min: 100, max: 42000, map: 'log', digits: 0 },
  { key: 'incl', label: '轨道倾角',   sym: 'i',  unit: '°',  min: 0,   max: 90, step: 1, digits: 0 },
  { key: 'turns', label: '显示周期数', sym: 'n', unit: '',   min: 1,   max: 3,  step: 1, digits: 0 },
];

const layers = [
  { key: 'traj',   label: '完整轨道' },
  { key: 'trail',  label: '已走过的轨迹' },
  { key: 'vel',    label: '速度分解 v / v_径向 / v_切向' },
  { key: 'force',  label: '万有引力 F', on: false },
  { key: 'radius', label: '矢径 r 与中心天体' },
  { key: 'aux',    label: '近地点 / 远地点 / 长轴' },
  { key: 'proj',   label: '坐标平面投影', on: false },
  { key: 'axes',   label: '坐标轴' },
];

const readings = [
  { key: 't',     label: '时间 t' },
  { key: 'cyc',   label: '已过周期' },
  { key: 'T',     label: '周期 T', hi: true },
  { key: 'a',     label: '半长轴 a', sep: true },
  { key: 'e',     label: '偏心率 e', hi: true },
  { key: 'r1',    label: '近地点距离 r₁' },
  { key: 'r2',    label: '远地点距离 r₂' },
  { key: 'r',     label: '当前距离 r', sep: true },
  { key: 'v',     label: '当前速率 v' },
  { key: 'area',  label: '面积速度 dA/dt', hi: true },
  { key: 'F',     label: '万有引力 F' },
  { key: 'k3',    label: 'a³/T²（开普勒第三）' },
];

const presets = [
  {
    id: 'leo', title: '近地圆轨道', view: 'iso',
    note: '400 km 高的近地圆轨道，周期约 92 分钟。注意地球画得和轨道几乎一样大 —— 卫星其实飞得很低。',
    q: '先猜：把轨道抬高一倍，周期会变成几倍？',
    params: { body: 'earth', h1: 400, h2: 400, incl: 30, turns: 1 },
  },
  {
    id: 'meo', title: '中圆轨道（GPS）', view: 'iso', cmp: 'high',
    note: '20200 km 高的中圆轨道，周期约 12 小时。画幅与同步轨道共用，可以直接比出高低。',
    q: '轨道半径变成近地轨道的 4 倍，周期变成几倍？为什么不是 4 倍？',
    params: { body: 'earth', h1: 20200, h2: 20200, incl: 55, turns: 1 },
  },
  {
    id: 'geo', title: '地球同步轨道', view: 'iso', cmp: 'high',
    note: '35786 km 高的同步轨道，周期恰好等于地球自转周期 23 小时 56 分。',
    q: '为什么同步卫星必须固定在赤道上空？倾角不为零会怎样？',
    params: { body: 'earth', h1: 35786, h2: 35786, incl: 0, turns: 1 },
  },
  {
    id: 'hohmann', title: '椭圆转移轨道', view: 'iso',
    note: '近地点 400 km、远地点 35786 km 的椭圆轨道 —— 这正是从近地轨道升到同步轨道的霍曼转移轨道。',
    q: '为什么在近地点速度最大、在远地点速度最小？开普勒第二定律怎么解释？',
    params: { body: 'earth', h1: 400, h2: 35786, incl: 28, turns: 1 },
  },
  {
    id: 'inclined', title: '倾斜轨道', view: 'iso',
    note: '轨道倾角 60° —— 轨道平面不再和赤道面重合。这是必须用 3D 才看得出来的东西。',
    q: '倾角改变时，周期会变吗？变的到底是什么？',
    params: { body: 'earth', h1: 800, h2: 800, incl: 60, turns: 1 },
  },
  {
    id: 'moon', title: '绕月轨道', view: 'iso',
    note: '换成月球作中心天体。月球质量只有地球的 1/81，同样的轨道高度周期会长得多。',
    q: '中心天体变轻了，周期为什么变长？周期跟中心天体的什么量有关？',
    params: { body: 'moon', h1: 100, h2: 100, incl: 20, turns: 1 },
  },
];

/* ---------- 渲染声明 ---------- */

function vectors(s, ctx) {
  const { d, C } = ctx;
  const rhat = s.pos.clone().normalize();
  const vr = rhat.clone().multiplyScalar(s.vel.dot(rhat));            // 径向分量
  const vt = s.vel.clone().sub(vr);                                   // 切向分量
  const F = s.acc.clone().multiplyScalar(1);                          // 单位质量上的引力
  const fRef = Math.max(F.length(), EPS);
  return [
    { key: 'v',  label: 'v',  color: C.v, layer: 'vel', vec: s.vel, ref: d.vRef, radius: 0.026,
      parallelogram: { legs: ['vr', 'vt'], tip: 'v' } },
    { key: 'vr', label: 'v<sub>r</sub>', color: C.vd, layer: 'vel', vec: vr, ref: d.vRef, radius: 0.024 },
    { key: 'vt', label: 'v<sub>t</sub>', color: C.vp, layer: 'vel', vec: vt, ref: d.vRef, radius: 0.024 },
    { key: 'F',  label: 'F',  color: C.F,  layer: 'force', vec: F,  ref: fRef, radius: 0.024 },
  ];
}

function markers(s, ctx) {
  const { d, C } = ctx;
  const { peri, apo } = apsides(d);
  return [
    // 中心天体：按真实半径画。近地轨道时它几乎顶到轨道上 —— 这本身就是知识点。
    // mat:'phong' → 用 MeshPhongMaterial，并单独进 layer 1 受「随相机走的柔光」照亮，
    //   于是无论怎么转视角，受光面都朝向观众，出现随视角移动的柔和明暗（3D 感）；
    //   材质是哑光的（低 specular），不再像金属球那样刺眼。
    // opacity<0.5 → 半透明「玻璃球」：能看见球体内部的矢量 —— 关键！重力 F、向心力
    //   都指向球心，若天体不透明，箭头尖端会被球体挡住，等于没画。
    { key: 'mkBody', layer: 'radius', color: C.body, radiusPhys: d.body.R, mat: 'phong', opacity: 0.55 },
    { key: 'mkPeri', layer: 'aux', color: C.v, radius: 6, pos: peri },
    { key: 'mkApo',  layer: 'aux', color: C.F, radius: 6, pos: apo },
  ];
}

/* 矢径：中心天体 → 卫星。开普勒第二定律说的就是它扫过的面积。 */
function segments(s, ctx) {
  const { C } = ctx;
  return [{ key: 'radius', layer: 'radius', color: C.Nrm, dashed: true,
    pts: [new THREE.Vector3(0, 0, 0), s.pos.clone()] }];
}

/* 长轴：过近地点与远地点的直线 */
function guides(ctx) {
  const { d, C } = ctx;
  const { peri, apo } = apsides(d);
  return [{
    key: 'majorAxis', layer: 'aux', color: C.aux, width: ctx.lw.guide,
    pts: [peri.clone().multiplyScalar(1.06), apo.clone().multiplyScalar(1.06)],
  }];
}

function readingsOf(s, ctx) {
  const { t, d } = ctx;
  const r = s.pos.length();
  const F = d.body.mu / (r * r);          // 单位质量的引力加速度
  return {
    t: fmtTime(t),
    cyc: (t / d.T).toFixed(2) + ' 个',
    T: fmtTime(d.T),
    a: fmt(d.a, 'm'),
    e: d.e.toFixed(4),
    r1: fmt(d.r1, 'm'),
    r2: fmt(d.r2, 'm'),
    r: fmt(r, 'm'),
    v: fmt(s.vel.length(), 'm/s'),
    area: fmt(d.areaRate, 'm²/s'),
    F: fmt(F, 'm/s²'),
    k3: fmt((d.a * d.a * d.a) / (d.T * d.T), 'm³/s²'),
  };
}

function hint(ctx) {
  const { d } = ctx;
  const circle = d.e < 1e-6;
  return `GM = ${fmt(d.body.mu, 'm³/s²')}（${d.body.label}）；a = <b>${fmt(d.a, 'm')}</b>，`
    + `e = <b>${d.e.toFixed(4)}</b>，T = <b>${fmtTime(d.T)}</b>。`
    + `近地点 v = ${fmt(d.vPeri, 'm/s')}，远地点 v = ${fmt(d.vApo, 'm/s')}。`
    + (circle ? '当前是圆轨道：r₁ = r₂，速率处处相等。' : '椭圆轨道：近地点最快、远地点最慢，面积速度恒定。')
    + `a³/T² = ${fmt((d.a ** 3) / (d.T ** 2), 'm³/s²')}（开普勒第三定律，只与中心天体有关）。`;
}

export default {
  id: 'orbit',
  name: '天体运动',
  tagline: '万有引力提供向心力：开普勒三定律',
  layerTip: '虚线是<b>矢径 r</b>。开普勒第二定律说的就是它扫过的面积 —— '
    + '近地点扫得快、远地点扫得慢，但单位时间的面积恒定。',

  params, layers, readings, presets,
  views: {
    iso:   { az: -62, el: 30, label: '轴测图' },
    top:   { az: -90, el: 90, label: '俯视图' },
    front: { az: 180, el: 0, label: '前视图' },
  },
  defaultView: 'iso',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, segments, guides, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '轨道周期', secondaryUnit: 's',
      secondsPerCycle: d.T, label: 'T', cyclic: true, jumpSeconds: d.T,
    };
  },
};
