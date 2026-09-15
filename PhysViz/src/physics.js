/* ============================================================
   悟理 PhysViz — 通用物理工具层
   ------------------------------------------------------------
   这里只放"所有模型都用得上"的东西：常数、格式化、包围盒拟合。
   具体模型的物理放在 src/models/*.js。

   本文件不碰 DOM、不碰渲染，保证能被 Node 直接单测。
   （唯一的外部依赖是 three 的 Vector3 —— 它是纯数学，Node 里也能跑。）
   ============================================================ */

import * as THREE from 'three';

/* 轨迹采样点数。固定值 —— 不随帧率变，
   保证"同一组参数永远得到同一条曲线"，截图与单测才可比。 */
export const N = 1400;
export const EPS = 1e-30;

export const G = 6.67430e-11;                 // 万有引力常量
export const G_EARTH = 9.80665;               // 地球表面重力加速度
export const M_EARTH = 5.9722e24;             // 地球质量
export const R_EARTH = 6.371e6;               // 地球半径
export const M_MOON = 7.342e22;
export const R_MOON = 1.7374e6;

export const PARTICLES = {
  electron: { label: '电子', q: -1.602176634e-19, m: 9.1093837015e-31 },
  proton:   { label: '质子', q:  1.602176634e-19, m: 1.67262192369e-27 },
  alpha:    { label: 'α 粒子', q: 3.204353268e-19, m: 6.6446573357e-27 },
};

/* ------------------------------------------------------------
   视口尺度归一化：真实尺度（可能是 nm，也可能是 10⁷ m）
   → 固定世界尺度。渲染层的私事，绝不回写物理量。
   ------------------------------------------------------------ */
export function fitWorld(pts) {
  const box = new THREE.Box3().setFromPoints(pts);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 1e-18 ? 10 / maxDim : 1;
  return { box, size, center, scale };
}

/* 角度 → 弧度 */
export function rad(d) { return (d * Math.PI) / 180; }

/* 清掉三角函数的浮点残渣。
   Math.cos(Math.PI/2) 是 6.1e-17 而不是 0，乘上 v₀ 之后会让
   "垂直分量"显示成 36.7 fm/s —— 看着像有值，其实是零。
   凡是把 sin/cos 结果乘上物理量的地方都要过一遍。 */
export function snap(x, eps = 1e-12) { return Math.abs(x) < eps ? 0 : x; }

/* 相对归零（★ 2026-09-14）：snap 只管"乘 sin/cos 之前"的系数，
   管不到"解析解在 t = nT 处应当回到初态"这件事 ——
   cos(ω·nT) 只留得下 ~1e-16 的舍入残渣，乘上 A 之后是 1.4e-16 m。
   这个数本身无害，但 fmt 会按 SI 前缀把它放大成 "1.39 fm/s"、
   "5.88 fN" —— 屏幕上看着像"有值"，其实是零。老师会当成 bug。
   凡是"物理上该为零"的读数都过一遍 snapRel，参考尺度 ref 取该量的
   特征值（最大速率、振幅、最高点高度…）。
   阈值 1e-9·ref 远低于任何真实读数（真实值最小也在 ref 的 1e-3 量级）。 */
export function snapRel(x, ref) {
  const r = Math.abs(ref);
  return r > 0 && Math.abs(x) < 1e-9 * r ? 0 : x;
}

export function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

/* ------------------------------------------------------------
   播放速度语义（★ 2026-09-14，修"电场偏转频闪"）
   ------------------------------------------------------------
   主循环是 state.t += dt · speed · stride · dir，
   所以 state.speed 的单位取决于 stride 取什么：

     · 周期模型（ts.cyclic）—— stride = 一个周期 secondsPerCycle，
       speed 的单位是「周期/秒」。老师说"一秒跑两个周期"直接对上。
     · 非周期模型 —— 没有周期可数，stride = 整条轨迹 tEnd，
       speed 的单位是「整条轨迹/秒」。0.1 就是"整条轨迹 10 秒走完"。

   ⚠️ 非周期模型**绝不能**拿 secondsPerCycle（它们恒返回 1）当 stride：
   电场偏转的 tEnd 只有 1e-8 s，1 秒 = 把轨迹绕 1 亿圈 → 画面频闪。
   这两个函数是纯函数，Node 单测直接断言"整条轨迹的墙上时间在合理区间"。
   ------------------------------------------------------------ */
export const SPEED_MIN = 0.02;      // 必须与 index.html 的 #speed 滑块区间一致
export const SPEED_MAX = 6;

export function strideSeconds(ts, tEnd) {
  return ts.cyclic ? Math.max(ts.secondsPerCycle, EPS) : Math.max(tEnd, EPS);
}

/* 默认速度：让整条轨迹大约 dur 秒（默认 10 s）走完 */
export function defaultSpeed(ts, tEnd, dur = 10) {
  if (!ts.cyclic) return clamp(1 / Math.max(dur, EPS), SPEED_MIN, SPEED_MAX);
  const units = tEnd / Math.max(ts.secondsPerCycle, EPS);   // 整条轨迹有几个周期
  return clamp(units / Math.max(dur, EPS), SPEED_MIN, SPEED_MAX);
}

/* 整条轨迹的墙上时间（秒）—— 诊断"频闪"的量：正常在 10 s 上下，
   小到 1e-6 s 就说明每帧都在绕圈。 */
export function wallClockSeconds(ts, tEnd, speed) {
  return tEnd / Math.max(speed * strideSeconds(ts, tEnd), EPS);
}

/* 按固定点数采样一条"位置函数"，得到轨迹点列。
   采样器必须是纯函数 —— 这是"时间轴可任意跳转"的地基。 */
export function sampleLoop(posAt, tEnd, n = N) {
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(posAt((tEnd * i) / (n - 1)));
  return pts;
}

/* ------------------------------------------------------------
   SI 前缀格式化
   ------------------------------------------------------------ */
const PFX = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'μ'], [1e-9, 'n'], [1e-12, 'p']];
export function fmt(v, unit = '') {
  if (v == null || !isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a === 0) return '0 ' + unit;
  let f = 1e-15, p = 'f';
  for (const [fac, sym] of PFX) { if (a >= fac) { f = fac; p = sym; break; } }
  const x = v / f;
  const s = Math.abs(x) >= 100 ? x.toFixed(0) : Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2);
  return s + ' ' + p + unit;
}

/* 时间格式化：优先用工程记法，再兜底到"分:秒" */
export function fmtTime(sec) {
  if (!isFinite(sec)) return '—';
  const a = Math.abs(sec);
  if (a < 1e-3 || a >= 1e5) return fmt(sec, 's');
  if (a < 60) return sec.toFixed(a < 10 ? 2 : 1) + ' s';
  if (a < 3600) {
    const m = Math.floor(sec / 60), s = sec - m * 60;
    return `${m} 分 ${s.toFixed(1)} 秒`;
  }
  const h = Math.floor(sec / 3600), m = Math.round((sec - h * 3600) / 60);
  return `${h} 小时 ${m} 分`;
}

export function fmtDeg(v) {
  if (!isFinite(v)) return '—';
  return v.toFixed(1) + '°';
}

/* 3D 向量 → 屏幕无关的短描述，读数面板用得上 */
export function vlen(v) { return v ? v.length() : 0; }
