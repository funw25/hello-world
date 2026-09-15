/* ============================================================
   模型 · 单摆（精确解）
   ------------------------------------------------------------
   运动方程 θ'' = −ω₀²·sinθ，ω₀ = √(g/L)。

   小角度（θ₀ ≲ 10°）时 sinθ ≈ θ，退化成简谐运动
       θ(t) ≈ θ₀·cos(ω₀t)，  T₀ = 2π√(L/g) 与振幅无关
   —— 这就是教科书说的"单摆等时性"。

   但等时性只是近似。θ₀ 一大，sinθ < θ，回复力"变软"，周期就变长。
   精确解没有初等函数形式，要用雅可比椭圆函数：
       k = sin(θ₀/2)，  k′ = cos(θ₀/2)
       θ(t) = 2·arctan( k·cn(ω₀t, k) / k′ )
       T    = 4K(k)/ω₀        （K 为第一类完全椭圆积分）
   检验：θ₀ = 70° 时 T/T₀ = 1.1021 —— 比小角近似长 10.2%，
   在读数面板上肉眼可见。

   为什么值得上椭圆函数：本模型的预设 2 就是"大角度摆动"，
   文案承诺"大角度周期变长"。若用线性化解，T 恒为 2.01 s，
   画面里根本不发生这件事 —— 文案就成了空话。
   而且线性化解在 70° 下最低点速率偏大 6%，不严格守恒能量。
   精确解让"等时性只在小角度成立"变成画面里真实发生的事。

   坐标约定：
     悬点在原点 (0,0,0)，摆球在竖直平面内摆动；
     摆球位置 (L·sinθ, −L·cosθ, 0)，θ 为偏离竖直方向的角。
   ============================================================ */

import * as THREE from 'three';
import { rad, sampleLoop, fmt, fmtTime, snapRel } from '../physics.js';

/* ------------------------------------------------------------
   雅可比椭圆函数（AGM 下降法，Abramowitz & Stegun 16.4.1）
   ------------------------------------------------------------
   a₀=1, b₀=√(1−k²), c₀=k
   a_{n+1}=(a_n+b_n)/2, b_{n+1}=√(a_n·b_n), c_{n+1}=(a_n−b_n)/2
   振幅：φ_n = 2ⁿ·a_n·u，再回代 φ_{i−1} = ½(φ_i + arcsin((c_i/a_i)·sinφ_i))
   得到 am(u,k)，于是 sn=sinφ, cn=cosφ, dn=√(1−k²sin²φ)。

   k→0 时退化为 am=u、cn=cos u（圆周运动）—— 这正是小角度极限。
   暂存数组放在模块作用域，避免每帧 new（本文件每次采样都要调）。
   ------------------------------------------------------------ */
const AGM_MAX = 26;
const _a = new Float64Array(AGM_MAX);
const _b = new Float64Array(AGM_MAX);
const _c = new Float64Array(AGM_MAX);

/* 第一类完全椭圆积分 K(k) —— 精确周期的系数 */
function ellipK(k) {
  let a = 1, b = Math.sqrt(1 - k * k);
  for (let i = 0; i < AGM_MAX && Math.abs(a - b) > 1e-15; i++) {
    const an = 0.5 * (a + b);
    b = Math.sqrt(a * b);
    a = an;
  }
  return Math.PI / (2 * a);
}

/* 一次算出 sn / cn / dn，返回 [sn, cn, dn] */
function jacobiSCD(u, k) {
  _a[0] = 1; _b[0] = Math.sqrt(1 - k * k); _c[0] = k;
  let n = 0;
  while (Math.abs(_c[n]) > 1e-15 && n < AGM_MAX - 1) {
    _a[n + 1] = 0.5 * (_a[n] + _b[n]);
    _b[n + 1] = Math.sqrt(_a[n] * _b[n]);
    _c[n + 1] = 0.5 * (_a[n] - _b[n]);
    n++;
  }
  let phi = Math.pow(2, n) * _a[n] * u;
  for (let i = n; i > 0; i--) {
    const s = Math.max(-1, Math.min(1, (_c[i] / _a[i]) * Math.sin(phi)));
    phi = 0.5 * (phi + Math.asin(s));
  }
  const s = Math.sin(phi);
  return [s, Math.cos(phi), Math.sqrt(Math.max(0, 1 - k * k * s * s))];
}

function derive(p) {
  const g = Math.max(p.g, 1e-6);
  const L = Math.max(p.L, 1e-4);
  const w = Math.sqrt(g / L);                 // 小角角频率 ω₀ = √(g/L)
  const th0 = rad(p.theta0);
  const k = Math.sin(th0 / 2);                // 椭圆模
  const kp = Math.cos(th0 / 2);               // 补模 k′
  const T0 = (2 * Math.PI) / w;               // 小角近似周期
  const T = (4 * ellipK(k)) / w;              // 精确周期 T = 4K(k)/ω₀
  const vRef = 2 * k * w * L || 1;            // 最低点速率（= √(2gL(1−cosθ₀))）
  return { g, L, w, th0, k, kp, T, T0, vRef };
}

function sampleAt(t, p, d) {
  const [sn, cn, dn] = jacobiSCD(d.w * t, d.k);
  /* 摆角：θ = 2·arctan(k·cn/k′)。
     用 atan2 而不是 atan，k′>0 保证落在 (−π, π) 的正确分支。 */
  const th = 2 * Math.atan2(d.k * cn, d.kp);
  /* 角速度：d/du[2·atan(k·cn/k′)] = −2k·k′·sn/dn（见推导：
     k′²+k²cn² = dn²，恰好约掉一个 dn）。t=0 时 sn=0 → θ′=0，精确。 */
  const thp = (-2 * d.k * d.kp * d.w * sn) / dn;
  /* 角加速度：运动方程本身，精确成立 */
  const thpp = -d.w * d.w * Math.sin(th);
  const x = d.L * Math.sin(th);
  const y = -d.L * Math.cos(th);
  const vx = d.L * Math.cos(th) * thp;
  const vy = d.L * Math.sin(th) * thp;
  const ax = d.L * (-Math.sin(th) * thp * thp + Math.cos(th) * thpp);
  const ay = d.L * (Math.cos(th) * thp * thp + Math.sin(th) * thpp);
  return {
    pos: new THREE.Vector3(x, y, 0),
    vel: new THREE.Vector3(vx, vy, 0),
    acc: new THREE.Vector3(ax, ay, 0),
  };
}

function buildTrajectory(p, d) {
  const tEnd = p.turns * d.T;
  return { pts: sampleLoop(t => sampleAt(t, p, d).pos, tEnd), tEnd };
}

const params = [
  { key: 'L', label: '摆长', sym: 'L', unit: 'm', min: 0.2, max: 3, step: 0.05, digits: 2 },
  { key: 'theta0', label: '初始摆角', sym: 'θ₀', unit: '°', min: 5, max: 80, step: 1, digits: 0 },
  { key: 'g', label: '重力加速度', sym: 'g', unit: 'm/s²', min: 1.6, max: 25, step: 0.02, digits: 2 },
  { key: 'm', label: '摆球质量', sym: 'm', unit: 'kg', min: 0.05, max: 5, map: 'log', digits: 2 },
];

const layers = [
  { key: 'traj', label: '摆动轨迹（圆弧）' },
  { key: 'trail', label: '已走过的轨迹' },
  { key: 'vel', label: '速度 v' },
  { key: 'acc', label: '加速度 a（指向悬点）' },
  { key: 'string', label: '摆线 / 悬点 / 平衡位置' },
  { key: 'proj', label: '坐标平面投影', on: false },
  { key: 'axes', label: '坐标轴' },
];

const readings = [
  { key: 't', label: '时间 t' },
  { key: 'cyc', label: '已过周期' },
  { key: 'T', label: '周期 T（精确解）', hi: true },
  { key: 'theta', label: '当前摆角 θ', sep: true },
  { key: 'speed', label: '速率 |v|' },
  { key: 'a', label: '加速度大小 |a|' },
  { key: 'h', label: '摆球高度（距悬点）', hi: true },
];

const presets = [
  {
    id: 'small', title: '小角度摆动', view: 'swing',
    note: 'θ₀ = 10°：T = 2.011 s，只比小角近似的 2.007 s 长 0.19% —— '
      + '等时性在这个角度下几乎严格成立。',
    q: '改变摆角，周期变吗？（小角度下）',
    params: { L: 1, theta0: 10, g: 9.8, m: 0.5, turns: 3 },
  },
  {
    id: 'large', title: '大角度摆动', view: 'swing',
    note: '<b>等时性只是小角度的近似</b>：θ₀ = 70° 时 T = 2.212 s，比小角近似的 2.007 s '
      + '<b>长 10.2%</b>。摆角越大，周期越长 —— 因为 sinθ < θ，回复力变"软"了。',
    q: '摆角从 10° 增到 70°，周期为什么会变长？变的到底是什么？',
    params: { L: 1, theta0: 70, g: 9.8, m: 0.5, turns: 3 },
  },
  {
    id: 'moon', title: '月球上的单摆', view: 'swing',
    note: 'g 换成 1.62：周期变成 √(9.8/1.62) ≈ 2.46 倍。',
    q: '月球上同一个单摆，周期变成地球几倍？',
    params: { L: 1, theta0: 20, g: 1.62, m: 0.5, turns: 3 },
  },
  {
    id: 'long', title: '加长摆线', view: 'swing',
    note: 'L 加倍 → 周期变成 √2 倍。',
    q: '摆线越长，摆得越快还是越慢？',
    params: { L: 2, theta0: 20, g: 9.8, m: 0.5, turns: 3 },
  },
];

function vectors(s, ctx) {
  const { C } = ctx;
  return [
    { key: 'v', label: 'v', color: C.v, layer: 'vel', vec: s.vel, ref: ctx.d.vRef, radius: 0.026 },
    { key: 'a', label: 'a', color: C.F, layer: 'acc', vec: s.acc, ref: ctx.d.vRef, radius: 0.024 },
  ];
}

function markers(s, ctx) {
  const { C } = ctx;
  return [
    { key: 'mkPivot', layer: 'string', color: C.axis, radius: 6, pos: new THREE.Vector3(0, 0, 0) },
  ];
}

/* 摆线：悬点 → 摆球，每帧重算 */
function segments(s, ctx) {
  const { C } = ctx;
  return [{ key: 'string', layer: 'string', color: C.axis, pts: [new THREE.Vector3(0, 0, 0), s.pos.clone()] }];
}

function guides(ctx) {
  const { d, C } = ctx;
  return [
    { key: 'eq', layer: 'string', color: C.aux, width: ctx.lw.guide * 0.7,
      pts: [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -d.L, 0)] },
  ];
}

function readingsOf(s, ctx) {
  const { t, d } = ctx;
  const th = Math.atan2(s.pos.x, -s.pos.y);
  return {
    t: fmtTime(t),
    cyc: (t / d.T).toFixed(2) + ' 个',
    T: fmt(d.T, 's'),
    theta: (th * 180 / Math.PI).toFixed(1) + '°',
    /* 两端（t = nT）速率应当精确为 0，过一遍相对归零，
       否则会显示成 "2.34 fm/s" 这种看着像有值的残渣。 */
    speed: fmt(snapRel(s.vel.length(), d.vRef), 'm/s'),
    a: fmt(snapRel(s.acc.length(), d.g), 'm/s²'),
    h: fmt(-s.pos.y, 'm'),
  };
}

function hint(ctx) {
  const { d } = ctx;
  const pct = (d.T / d.T0 - 1) * 100;
  const head = `精确周期 T = 4K(k)/ω = <b>${fmt(d.T, 's')}</b>`
    + `（k = sin(θ₀/2) = ${d.k.toFixed(4)}，K 为第一类完全椭圆积分）。`;
  const cmp = pct < 0.5
    ? `小角近似 T₀ = 2π√(L/g) = ${fmt(d.T0, 's')}，与精确值相差不到 0.5% —— 小角度下等时性成立。`
    : `小角近似 T₀ = 2π√(L/g) = ${fmt(d.T0, 's')}，比精确值<b>短 ${pct.toFixed(1)}%</b>`
      + ` —— 摆角越大，周期越长。`;
  return head + cmp + `最低点速率最大 = ${fmt(d.vRef, 'm/s')}，两端为 0。`;
}

export default {
  id: 'pendulum',
  name: '单摆',
  tagline: '单摆：θ 很小时退化为简谐运动',

  layerTip: '<b>摆线</b>从悬点连到摆球；<b>加速度 a</b> 始终指向悬点（含向心与切向分量）。'
    + '平衡位置是竖直虚线。',

  params, layers, readings, presets,
  views: {
    swing: { az: -90, el: 90, label: '摆动面（正视）' },
    iso:   { az: -62, el: 24, label: '轴测图' },
    edge:  { az: 180, el: 0, label: '侧视图' },
  },
  defaultView: 'swing',

  derive, sampleAt, buildTrajectory, readingsOf, vectors, markers, segments, guides, hint,

  timeScale(p, d) {
    return {
      primaryUnit: '周期', secondaryUnit: 's',
      secondsPerCycle: d.T, label: 'T', cyclic: true, jumpSeconds: d.T,
    };
  },
};
