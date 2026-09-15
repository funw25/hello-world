/* ============================================================
   物理层验收用例
   ------------------------------------------------------------
   §1–§9   配速法（对应 DESIGN.md §7.10 / §7.11）
   §10–§14 新增的五个模型
   §28     电场偏转（极板约束 + 量级体检，对应 §7.13）
   §30     单摆（精确解：椭圆函数，对应 §7.14）
   §33–§34 读数显示：零值不得被 SI 前缀放大
   §35     默认播放速度：整条轨迹的墙上时间必须落在合理区间

   所有模型共用同一套接口，所以这里也顺便验证了接口本身：
     derive / sampleAt / buildTrajectory / timeScale
   sampleAt 必须是 (t) 的纯函数 —— 每个新模型都抽查了
   "同一时刻重复求值结果完全一致"（时间轴可任意跳转的地基）。
   ============================================================ */

import {
  PARTICLES, G, M_EARTH, R_EARTH,
  strideSeconds, defaultSpeed, wallClockSeconds, SPEED_MIN, SPEED_MAX,
} from '../src/physics.js';
import vm from '../src/models/velocity-matching.js';
import projectile from '../src/models/projectile.js';
import magnetic from '../src/models/magnetic-circle.js';
import conical from '../src/models/conical-pendulum.js';
import shm from '../src/models/shm.js';
import orbit from '../src/models/orbit.js';
import electricDeflection from '../src/models/electric-deflection.js';
import pendulum from '../src/models/pendulum.js';
import cyclotron from '../src/models/cyclotron.js';
import collision from '../src/models/collision.js';

const { derive, sampleAt, buildTrajectory, shapeName } = vm;

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}${detail ? '  → ' + detail : ''}`); }
}
function section(t) { console.log(`\n${t}`); }
function near(a, b, tol = 1e-9) { return Math.abs(a - b) <= tol * Math.max(Math.abs(b), 1); }

const BASE = { particle: 'electron', E: 300, B: 0.5, v0: 0, theta: 90, phi: 180, periods: 3 };
const P = (over = {}) => ({ ...BASE, ...over });
const S = (t, d, p) => sampleAt(t, p || P(), d);

/* ============================================================
   配速法
   ============================================================ */

section('1. 初速为零 → 尖点处速率必须为 0');
{
  const d = derive(P());
  let worst = 0;
  for (let n = 1; n <= 5; n++) worst = Math.max(worst, S(n * d.T, d).vel.length());
  check('t = nT 处速率 ≈ 0', worst / d.vRef < 1e-12, `最大残留 ${worst.toExponential(2)} m/s`);
  check('t = T/2 处速率 > 0（不是全程静止）', S(d.T / 2, d).vel.length() / d.vRef > 0.5);
}

section('2. 长程平均漂移速度 = v_d = E/B');
{
  const d = derive(P());
  const t = 500 * d.T;
  const mean = S(t, d).pos.clone().sub(S(0, d).pos).divideScalar(t);
  const err = mean.clone().sub(d.vd).length() / d.vdMag;
  check('平均漂移方向与大小均等于 v_d', err < 1e-3,
    `实测 (${mean.x.toFixed(2)}, ${mean.y.toFixed(4)}, ${mean.z.toFixed(4)}) vs (${d.vd.x}, 0, 0)`);
  check('漂移方向为 +x（即 E×B 方向）', Math.abs(mean.y) < d.vdMag * 1e-3);
}

section('3. k = 0（v₀ = v_d）→ 轨迹为直线');
{
  const p = P({ v0: 600, phi: 0 });
  const d = derive(p);
  check('回旋半径 r = 0', Math.abs(d.r) < 1e-18, `r = ${d.r}`);
  check('摆线参数 k = 0', Math.abs(d.k) < 1e-12, `k = ${d.k}`);
  check('形态判为「直线」', shapeName(d) === '直线');
  const { pts } = buildTrajectory(p, d);
  const a = pts[0], b = pts[pts.length - 1];
  const dir = b.clone().sub(a).normalize();
  let maxDev = 0;
  for (const q of pts) {
    const v = q.clone().sub(a);
    maxDev = Math.max(maxDev, v.clone().sub(dir.clone().multiplyScalar(v.dot(dir))).length());
  }
  check('所有采样点严格共线', maxDev < 1e-14, `最大偏离 ${maxDev.toExponential(2)} m`);
  // 回归：θ = 90° 时 Math.cos 的浮点残渣（6.1e-17）曾被乘进 v₀，
  // 让读数把 v′ 显示成 36.7 fm/s —— 看着像有值，其实为零。
  check('v′ 严格为零（θ = 90° 无浮点残渣）', d.vPerp === 0 && d.vPar === 0,
    `vPerp = ${d.vPerp}, vPar = ${d.vPar}`);
}

section('4. 回旋周期 T 与速度无关（T = 2πm/(qB)）');
{
  const ts = [1e5, 1e6, 1e7].map(v => derive(P({ v0: v })).T);
  const spread = (Math.max(...ts) - Math.min(...ts)) / ts[0];
  check('改变 v₀ 大小，T 不变', spread < 1e-12, `spread = ${spread.toExponential(2)}`);

  const bTs = [0.5, 1.0].map(b => derive(P({ B: b })).T);
  check('B 加倍 → T 减半', Math.abs(bTs[1] / bTs[0] - 0.5) < 1e-12,
    `T(0.5T)=${bTs[0].toExponential(4)}  T(1.0T)=${bTs[1].toExponential(4)}`);
}

section('5. 能量：½m|v(t)|² − ½m|v₀|² = qE·Δy(t)');
{
  // 按系统的特征动能归一化，而不是按局部值 —— 否则在 dKE≈0 的时刻
  // 浮点误差会被放大成 1.0 的假阳性（绝对误差其实只有 ~1e-37 J）
  let worst = 0;
  for (const over of [{}, { theta: 30, v0: 5e5 }, { theta: 55, v0: 2e6 }, { v0: 3e6, phi: 45 }]) {
    const p = P(over);
    const d = derive(p);
    const s0 = S(0, d, p);
    const ke0 = 0.5 * d.m * s0.vel.lengthSq();
    const keScale = 0.5 * d.m * d.vRef * d.vRef;
    for (let i = 1; i <= 40; i++) {
      const s = S((i / 40) * 4 * d.T, d, p);
      const dKE = 0.5 * d.m * s.vel.lengthSq() - ke0;
      const W = d.q * d.E * (s.pos.y - s0.pos.y);
      worst = Math.max(worst, Math.abs(dKE - W) / keScale);
    }
  }
  check('四个参数组合、共 160 个时刻全部成立', worst < 1e-12,
    `最大相对误差（按特征动能归一）${worst.toExponential(2)}`);
}

section('6. 数值安全：极端参数不产生 NaN / Infinity');
{
  const cases = [
    ['B = 0', P({ B: 0 })],
    ['B 为负', P({ B: -1 })],
    ['E = 0', P({ E: 0 })],
    ['v₀ = 0 且 E = 0', P({ E: 0, v0: 0 })],
    ['θ = 0（v₀ ∥ B）', P({ theta: 0, v0: 1e6 })],
    ['θ = 180', P({ theta: 180, v0: 1e6 })],
    ['全部取最大', P({ E: 5000, B: 2, v0: 2e7, periods: 6 })],
  ];
  const bad = [];
  for (const [name, p] of cases) {
    try {
      const d = derive(p);
      // k = v′/v_d 只在 v_d ≠ 0 时有定义；E = 0 时它取 Infinity 是物理上正确的
      const vals = [d.T, d.r, d.vRef, d.vPerp, d.vPar, d.omega, d.vdMag];
      if (vals.some(v => !isFinite(v))) { bad.push(name + '（派生量非有限）'); continue; }
      if (d.vdMag > 1e-9 && !isFinite(d.k)) { bad.push(name + '（k 非有限但 v_d ≠ 0）'); continue; }
      if (Number.isNaN(d.k)) { bad.push(name + '（k 为 NaN）'); continue; }
      const { pts } = buildTrajectory(p, d);
      if (pts.some(q => !isFinite(q.x) || !isFinite(q.y) || !isFinite(q.z))) bad.push(name + '（轨迹含 NaN）');
      for (let i = 0; i <= 20; i++) {
        const s = S((i / 20) * 3 * d.T, d, p);
        if (!isFinite(s.pos.length() + s.vel.length() + s.acc.length())) { bad.push(name + '（采样非有限）'); break; }
      }
    } catch (e) { bad.push(name + '（抛异常：' + e.message + '）'); }
  }
  check('7 组极端参数全部安全', bad.length === 0, bad.join('；'));
  check('E = 0 判为「匀速圆周」而非 NaN', shapeName(derive(P({ E: 0, v0: 1e6 }))) === '匀速圆周');
  check('E = 0 且 v₀ = 0 判为「静止」', shapeName(derive(P({ E: 0, v0: 0 }))) === '静止');
}

section('7. v₀ ∥ B（θ = 0）→ 沿 B 匀速，垂直面内仍是摆线');
{
  const v0z = 1e6;
  const p = P({ theta: 0, v0: v0z });
  const d = derive(p);
  let worst = 0;
  for (let i = 0; i <= 30; i++) {
    const t = (i / 30) * 3 * d.T;
    worst = Math.max(worst, Math.abs(S(t, d, p).pos.z - v0z * t));
  }
  check('z(t) = v₀·t（沿 B 匀速，无加速度）', worst < 1e-18, `最大偏差 ${worst.toExponential(2)} m`);
  check('垂直面内 v′ = −v_d → 仍是标准摆线 k = 1', Math.abs(d.k - 1) < 1e-12, `k = ${d.k}`);
  // 反例校验：θ = 0 时轨迹并不是沿 z 的直线（v_d 始终垂直于 B）
  const xs = [0, 1, 2, 3].map(i => S((i / 3) * 2 * d.T, d, p).pos.x);
  check('轨迹并非沿 z 的直线（x 确有变化）', Math.max(...xs) - Math.min(...xs) > d.r,
    `x 跨度 ${(Math.max(...xs) - Math.min(...xs)).toExponential(2)} m，r = ${d.r.toExponential(2)} m`);
}

section('8. 默认场景典型量级（DESIGN.md §7.11）');
{
  const d = derive(P());
  console.log(`     v_d = ${d.vdMag} m/s          ω = ${d.omega.toExponential(6)} rad/s`);
  console.log(`     T   = ${d.T.toExponential(6)} s     r = ${d.r.toExponential(6)} m`);
  console.log(`     k   = ${d.k.toFixed(6)}             形态 = ${shapeName(d)}`);
  console.log(`     拱高 2r = ${(2 * d.r).toExponential(4)} m`);
  check('v_d = E/B = 600 m/s', Math.abs(d.vdMag - 600) < 1e-9);
  check('T ≈ 71.4 ps（7.14e-11 s）', Math.abs(d.T / 7.14e-11 - 1) < 0.01, `T = ${d.T.toExponential(4)}`);
  check('r ≈ 6.82 nm（6.82e-9 m）', Math.abs(d.r / 6.82e-9 - 1) < 0.01, `r = ${d.r.toExponential(4)}`);
  check('k = 1 → 标准摆线（尖点）', shapeName(d) === '标准摆线（尖点）');
}

section('9. 摆线三态分类判据');
{
  // 要得到 k = v′/v_d，需取 v₀ = (1 + k)·v_d（φ = 0，v₀ 与 v_d 同向）
  const mk = k => derive(P({ v0: (1 + k) * 600, phi: 0 }));
  check('k = 0.5 → 短幅摆线', shapeName(mk(0.5)) === '短幅摆线', `实测 k = ${mk(0.5).k.toFixed(4)}`);
  check('k = 1.0 → 标准摆线', shapeName(mk(1.0)) === '标准摆线（尖点）', `实测 k = ${mk(1.0).k.toFixed(4)}`);
  check('k = 1.8 → 长幅摆线', shapeName(mk(1.8)) === '长幅摆线（套环）', `实测 k = ${mk(1.8).k.toFixed(4)}`);
  check('k = 0 → 直线', shapeName(mk(0)) === '直线');
}

/* ============================================================
   平抛 / 斜抛
   ============================================================ */

section('10. 平抛：水平匀速 + 竖直自由落体');
{
  const p = { v0: 20, alpha: 0, phi: 0, h0: 20, g: 9.8 };
  const d = projectile.derive(p);
  const tf = Math.sqrt(2 * 20 / 9.8);
  check('飞行时间 = √(2h₀/g)', near(d.tEnd, tf, 1e-12), `t_f = ${d.tEnd} vs ${tf}`);
  check('水平射程 = v₀·t_f', near(d.range, 20 * tf, 1e-12), `R = ${d.range}`);

  // 水平分速恒定、竖直分速线性增长
  let worstX = 0, worstY = 0;
  for (let i = 0; i <= 30; i++) {
    const t = (i / 30) * d.tEnd;
    const s = projectile.sampleAt(t, p, d);
    worstX = Math.max(worstX, Math.abs(s.vel.x - 20));
    worstY = Math.max(worstY, Math.abs(s.vel.y - (-9.8 * t)));
  }
  check('水平分速恒为 v₀（与时间无关）', worstX < 1e-12, `最大偏差 ${worstX.toExponential(2)}`);
  check('竖直分速 = −g·t（自由落体）', worstY < 1e-12, `最大偏差 ${worstY.toExponential(2)}`);

  const s = projectile.sampleAt(d.tEnd, p, d);
  check('落地时刻 y ≈ 0', Math.abs(s.pos.y) < 1e-9, `y = ${s.pos.y}`);
}

section('11. 斜抛：45° 射程最大（同一初速度、同一高度）');
{
  const mk = a => {
    const p = { v0: 30, alpha: a, phi: 0, h0: 0, g: 9.8 };
    return projectile.derive(p).range;
  };
  const r45 = mk(45);
  check('45° 射程大于 30° 与 60°', r45 > mk(30) && r45 > mk(60),
    `R30=${mk(30).toFixed(3)}  R45=${r45.toFixed(3)}  R60=${mk(60).toFixed(3)}`);
  check('30° 与 60° 射程相等（互补角）', near(mk(30), mk(60), 1e-12),
    `R30=${mk(30).toFixed(6)}  R60=${mk(60).toFixed(6)}`);
  check('R(45°) = v₀²/g', near(r45, 900 / 9.8, 1e-12), `R = ${r45}`);
}

section('12. 平抛：重力加速度减小时射程按 √ 比例放大');
{
  const mk = g => {
    const p = { v0: 20, alpha: 0, phi: 0, h0: 20, g };
    return projectile.derive(p).range;
  };
  const re = mk(9.8), rm = mk(1.62);
  check('月球射程 / 地球射程 = √(g_地/g_月)', near(rm / re, Math.sqrt(9.8 / 1.62), 1e-12),
    `实测 ${(rm / re).toFixed(4)}，理论 ${Math.sqrt(9.8 / 1.62).toFixed(4)}`);
}

section('13. 竖直上抛（α = 90°）退化情形');
{
  const p = { v0: 20, alpha: 90, phi: 0, h0: 0, g: 9.8 };
  const d = projectile.derive(p);
  let worst = 0;
  for (let i = 0; i <= 20; i++) {
    const t = (i / 20) * d.tEnd;
    const s = projectile.sampleAt(t, p, d);
    worst = Math.max(worst, Math.hypot(s.pos.x, s.pos.z));
  }
  check('水平位移恒为 0（轨迹是竖直线段）', worst < 1e-12, `最大水平偏移 ${worst.toExponential(2)} m`);
  check('飞行时间 = 2v₀/g', near(d.tEnd, 2 * 20 / 9.8, 1e-12), `t_f = ${d.tEnd}`);
  check('最大高度 = v₀²/(2g)', near(d.hApex, 400 / (2 * 9.8), 1e-12), `H = ${d.hApex}`);
}

/* ============================================================
   磁场中的圆周运动
   ============================================================ */

section('14. 磁场圆周：r = mv/(qB)，T = 2πm/(qB)');
{
  const p = { particle: 'electron', B: 0.5, v0: 8e5, theta: 90, phi: 0, turns: 2 };
  const d = magnetic.derive(p);
  const { q, m } = PARTICLES.electron;
  check('r = mv/(qB)', near(d.r, (m * 8e5) / (Math.abs(q) * 0.5), 1e-12), `r = ${d.r}`);
  check('T = 2πm/(qB)', near(d.T, (2 * Math.PI * m) / (Math.abs(q) * 0.5), 1e-12), `T = ${d.T}`);

  // v₀ 加倍 → r 加倍、T 不变（最重要的考点）
  const d2 = magnetic.derive({ ...p, v0: 1.6e6 });
  check('v₀ 加倍 → 半径加倍', near(d2.r / d.r, 2, 1e-12), `比值 ${(d2.r / d.r).toFixed(6)}`);
  check('v₀ 加倍 → 周期不变', near(d2.T, d.T, 1e-12), `T 比值 ${(d2.T / d.T).toFixed(9)}`);

  // B 加倍 → r、T 都减半
  const d3 = magnetic.derive({ ...p, B: 1.0 });
  check('B 加倍 → 半径减半', near(d3.r / d.r, 0.5, 1e-12));
  check('B 加倍 → 周期减半', near(d3.T / d.T, 0.5, 1e-12));
}

section('15. 磁场圆周：圆心恒定、半径恒定、v ⊥ r、F 指向圆心');
{
  const p = { particle: 'electron', B: 0.5, v0: 8e5, theta: 90, phi: 0, turns: 2 };
  const d = magnetic.derive(p);
  let worstR = 0, worstPerp = 0, worstDir = 0, worstCenter = 0;
  const c0 = null;
  let cRef = null;
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * 2 * d.T;
    const s = magnetic.sampleAt(t, p, d);
    // 圆心：c = pos + (v_y, −v_x, 0)/ω
    const c = new (s.pos.constructor)(
      s.pos.x + s.vel.y / d.omega, s.pos.y - s.vel.x / d.omega, s.pos.z);
    if (!cRef) cRef = c.clone();
    worstCenter = Math.max(worstCenter, c.clone().sub(cRef).length() / d.r);

    const R = s.pos.clone().sub(c);
    worstR = Math.max(worstR, Math.abs(R.length() / d.r - 1));
    // v ⊥ r：点积应为零
    worstPerp = Math.max(worstPerp, Math.abs(R.dot(s.vel)) / (d.r * p.v0));
    // 加速度方向应指向圆心
    const aHat = s.acc.clone().normalize();
    const rHat = R.clone().multiplyScalar(-1).normalize();
    worstDir = Math.max(worstDir, aHat.clone().sub(rHat).length());
  }
  check('圆心在整条轨迹上保持不动', worstCenter < 1e-12, `最大相对漂移 ${worstCenter.toExponential(2)}`);
  check('半径处处等于 r', worstR < 1e-12, `最大相对偏差 ${worstR.toExponential(2)}`);
  check('速度始终垂直于半径矢量', worstPerp < 1e-12, `最大 |v·r|/(r·v) = ${worstPerp.toExponential(2)}`);
  check('洛伦兹力始终指向圆心', worstDir < 1e-9, `最大方向偏差 ${worstDir.toExponential(2)}`);
}

section('16. 磁场圆周：纯函数性与数值安全');
{
  const cases = [
    { particle: 'electron', B: 0.02, v0: 1e4, theta: 0, phi: 0, turns: 1 },
    { particle: 'proton', B: 2, v0: 2e7, theta: 90, phi: 359, turns: 3 },
    { particle: 'alpha', B: 0.5, v0: 8e5, theta: 45, phi: 180, turns: 2 },
    { particle: 'electron', B: 0.5, v0: 1e4, theta: 0, phi: 90, turns: 1 },
  ];
  const bad = [];
  for (const p of cases) {
    try {
      const d = magnetic.derive(p);
      if (![d.T, d.r, d.omega, d.pitch].every(isFinite)) { bad.push(JSON.stringify(p) + ' 派生量非有限'); continue; }
      const { pts } = magnetic.buildTrajectory(p, d);
      if (pts.some(q => !isFinite(q.x + q.y + q.z))) bad.push(JSON.stringify(p) + ' 轨迹含 NaN');
      // 纯函数性：同一时刻求两次必须完全相等
      const a = magnetic.sampleAt(0.7 * d.T, p, d);
      const b = magnetic.sampleAt(0.7 * d.T, p, d);
      if (a.pos.distanceTo(b.pos) !== 0 || a.vel.distanceTo(b.vel) !== 0) bad.push(JSON.stringify(p) + ' 非纯函数');
    } catch (e) { bad.push(JSON.stringify(p) + ' 抛异常：' + e.message); }
  }
  check('4 组参数全部安全且保持纯函数', bad.length === 0, bad.join('；'));
  const d = magnetic.derive(cases[3]);
  check('θ = 0（v₀ ∥ B）→ 半径为零、轨迹是直线', d.r < 1e-18 && d.pitch > 0,
    `r = ${d.r}，螺距 = ${d.pitch.toExponential(2)}`);
}

/* ============================================================
   圆锥摆
   ============================================================ */

section('17. 圆锥摆：T = 2π√(h/g)，与质量、摆角无直接关系');
{
  const p = { L: 1, theta: 30, m: 0.5, g: 9.8, turns: 3 };
  const d = conical.derive(p);
  check('半径 r = L·sinθ', near(d.r, Math.sin(Math.PI / 6), 1e-12), `r = ${d.r}`);
  check('高度 h = L·cosθ', near(d.h, Math.cos(Math.PI / 6), 1e-12), `h = ${d.h}`);
  check('T = 2π√(h/g)', near(d.T, 2 * Math.PI * Math.sqrt(d.h / 9.8), 1e-12), `T = ${d.T}`);
  check('F向 = mg·tanθ', near(d.Fc, 0.5 * 9.8 * Math.tan(Math.PI / 6), 1e-12), `F向 = ${d.Fc}`);
  check('F绳 = mg/cosθ', near(d.Ft, 0.5 * 9.8 / Math.cos(Math.PI / 6), 1e-12), `F绳 = ${d.Ft}`);
  // 受力三角形：竖直方向 F绳·cosθ = mg，水平方向 F绳·sinθ = F向
  const th = Math.PI / 6;
  check('竖直方向 F绳·cosθ = mg（闭合）', near(d.Ft * Math.cos(th), d.W, 1e-12),
    `F绳·cosθ = ${(d.Ft * Math.cos(th)).toFixed(6)} vs mg = ${d.W.toFixed(6)}`);
  check('水平方向 F绳·sinθ = F向（闭合）', near(d.Ft * Math.sin(th), d.Fc, 1e-12),
    `F绳·sinθ = ${(d.Ft * Math.sin(th)).toFixed(6)} vs F向 = ${d.Fc.toFixed(6)}`);

  // 质量加倍 → 周期不变
  const d2 = conical.derive({ ...p, m: 1.0 });
  check('质量加倍 → 周期不变', near(d2.T, d.T, 1e-12), `T 比值 ${(d2.T / d.T).toFixed(9)}`);
  check('质量加倍 → 绳张力加倍', near(d2.Ft / d.Ft, 2, 1e-12));
}

section('18. 圆锥摆：高度相同则周期相同（与绳长、摆角都无关）');
{
  // L = 1, θ = 30° 与 L = 1.732, θ = 60°，高度都是 0.866
  const a = conical.derive({ L: 1, theta: 30, m: 0.5, g: 9.8, turns: 3 });
  const b = conical.derive({ L: 1.732, theta: 60, m: 0.5, g: 9.8, turns: 3 });
  check('两者高度确实相同', near(b.h / a.h, 1, 1e-3), `h₁ = ${a.h.toFixed(4)}  h₂ = ${b.h.toFixed(4)}`);
  check('高度相同 → 周期相同', near(b.T / a.T, 1, 1e-3), `T₁ = ${a.T.toFixed(4)}  T₂ = ${b.T.toFixed(4)}`);
  check('但半径不同', Math.abs(b.r / a.r - 1) > 0.5, `r₁ = ${a.r.toFixed(4)}  r₂ = ${b.r.toFixed(4)}`);
  // 绳长加倍（摆角不变）→ 周期变成 √2 倍
  const c = conical.derive({ L: 2, theta: 30, m: 0.5, g: 9.8, turns: 3 });
  check('绳长加倍 → 周期变成 √2 倍', near(c.T / a.T, Math.SQRT2, 1e-12), `比值 ${(c.T / a.T).toFixed(6)}`);
}

section('19. 圆锥摆：做的是匀速圆周运动（速率恒定、加速度指向轴）');
{
  const p = { L: 1, theta: 45, m: 0.5, g: 9.8, turns: 3 };
  const d = conical.derive(p);
  let worstSpeed = 0, worstRadial = 0, worstY = 0;
  for (let i = 0; i <= 36; i++) {
    const s = conical.sampleAt((i / 36) * d.T, p, d);
    worstSpeed = Math.max(worstSpeed, Math.abs(s.vel.length() - d.v));
    worstY = Math.max(worstY, Math.abs(s.pos.y));
    // 加速度应指向轴（水平、与位置反向）
    const aHat = s.acc.clone().normalize();
    const rHat = new THREEV(s.pos.x, 0, s.pos.z).normalize().multiplyScalar(-1);
    worstRadial = Math.max(worstRadial, aHat.clone().sub(rHat).length());
  }
  check('速率处处相等', worstSpeed / d.v < 1e-12, `最大相对偏差 ${(worstSpeed / d.v).toExponential(2)}`);
  check('始终在 y = 0 的水平面内', worstY < 1e-12);
  check('加速度始终指向转轴', worstRadial < 1e-9, `最大方向偏差 ${worstRadial.toExponential(2)}`);
}
// 测试里不引 three，用最小实现替代 Vector3 的少数几个方法
function THREEV(x, y, z) {
  return {
    x, y, z,
    normalize() {
      const l = Math.hypot(this.x, this.y, this.z) || 1;
      this.x /= l; this.y /= l; this.z /= l; return this;
    },
    multiplyScalar(k) { this.x *= k; this.y *= k; this.z *= k; return this; },
    clone() { return THREEV(this.x, this.y, this.z); },
    sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; },
    length() { return Math.hypot(this.x, this.y, this.z); },
  };
}

/* ============================================================
   简谐运动
   ============================================================ */

section('20. 简谐运动：a = −ω²x、F = −kx、T = 2π√(m/k)');
{
  const p = { A: 0.3, k: 20, m: 0.5, phi0: 0, turns: 3 };
  const d = shm.derive(p);
  check('ω = √(k/m)', near(d.omega, Math.sqrt(20 / 0.5), 1e-12), `ω = ${d.omega}`);
  check('T = 2π√(m/k)', near(d.T, 2 * Math.PI * Math.sqrt(0.5 / 20), 1e-12), `T = ${d.T}`);

  let worstA = 0, worstX = 0, worstF = 0;
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * 2 * d.T;
    const s = shm.sampleAt(t, p, d);
    const x = s.pos.x;                       // 振子位移 = 参考点在 x 轴上的投影
    worstA = Math.max(worstA, Math.abs(s.acc.x + d.omega * d.omega * x) / d.aMax);
    worstX = Math.max(worstX, Math.abs(x) - p.A);
    // 弹力 F = −kx，加速度 a = F/m —— 两者必须同向
    const F = -p.k * x;
    worstF = Math.max(worstF, Math.abs(F / p.m - s.acc.x) / d.aMax);
  }
  check('a = −ω²x 处处成立', worstA < 1e-12, `最大相对偏差 ${worstA.toExponential(2)}`);
  check('位移始终不超过振幅 A', worstX < 1e-12);
  check('弹力 F = −kx 且 a = F/m 与 a = −ω²x 自洽', worstF < 1e-12,
    `最大相对偏差 ${worstF.toExponential(2)}`);
}

section('21. 简谐运动：能量守恒、振幅不影响周期');
{
  const p = { A: 0.3, k: 20, m: 0.5, phi0: 30, turns: 3 };
  const d = shm.derive(p);
  let worst = 0;
  for (let i = 0; i <= 60; i++) {
    const s = shm.sampleAt((i / 60) * 2 * d.T, p, d);
    const x = s.pos.x, v = s.vel.x;
    const E = 0.5 * 0.5 * v * v + 0.5 * 20 * x * x;
    worst = Math.max(worst, Math.abs(E - d.E) / d.E);
  }
  check('机械能 Ek + Ep 恒定 = ½kA²', worst < 1e-12, `最大相对偏差 ${worst.toExponential(2)}`);

  const d2 = shm.derive({ ...p, A: 0.6 });
  check('振幅加倍 → 周期不变', near(d2.T, d.T, 1e-12), `T 比值 ${(d2.T / d.T).toFixed(9)}`);
  check('振幅加倍 → 总能量变成 4 倍（E ∝ A²）', near(d2.E / d.E, 4, 1e-12), `比值 ${(d2.E / d.E).toFixed(6)}`);
  const d3 = shm.derive({ ...p, m: 1.0 });
  check('质量加倍 → 周期变成 √2 倍', near(d3.T / d.T, Math.SQRT2, 1e-12));
  const d4 = shm.derive({ ...p, k: 40 });
  check('劲度系数加倍 → 周期变成 1/√2', near(d4.T / d.T, 1 / Math.SQRT2, 1e-12));
}

section('22. 简谐运动：参考点与振子的投影关系');
{
  const p = { A: 0.3, k: 20, m: 0.5, phi0: 75, turns: 3 };
  const d = shm.derive(p);
  let worstCirc = 0, worstTan = 0, worstAccMag = 0, worstProjection = 0;
  for (let i = 0; i <= 36; i++) {
    const s = shm.sampleAt((i / 36) * d.T, p, d);
    // 参考点始终在半径 A 的圆上
    worstCirc = Math.max(worstCirc, Math.abs(Math.hypot(s.pos.x, s.pos.y) / p.A - 1));
    // 参考点速度沿切向：v·r = 0
    worstTan = Math.max(worstTan,
      Math.abs((s.vel.x * s.pos.x + s.vel.y * s.pos.y) / (d.vMax * p.A)));
    // 参考点加速度大小恒为 Aω²
    worstAccMag = Math.max(worstAccMag, Math.abs(Math.hypot(s.acc.x, s.acc.y) / d.aMax - 1));
    // 振子位移（x 分量）就等于参考点位置的 x 分量 —— 这正是"投影"二字的含义
    worstProjection = Math.max(worstProjection, Math.abs(s.pos.y) - p.A);
  }
  check('参考点始终在半径 A 的圆上', worstCirc < 1e-12, `最大相对偏差 ${worstCirc.toExponential(2)}`);
  check('参考点速度始终沿切向（v ⊥ r）', worstTan < 1e-12, `最大 |v·r|/(A·v_max) = ${worstTan.toExponential(2)}`);
  check('参考点加速度大小恒为 Aω²', worstAccMag < 1e-12, `最大相对偏差 ${worstAccMag.toExponential(2)}`);

  // 振子速度 = 参考点速度的 x 分量；振子加速度 = 参考点加速度的 x 分量
  let worstVproj = 0;
  for (let i = 0; i <= 36; i++) {
    const s = shm.sampleAt((i / 36) * d.T, p, d);
    const vBob = -p.A * d.omega * Math.sin(d.omega * ((i / 36) * d.T) + d.phi);
    worstVproj = Math.max(worstVproj, Math.abs(s.vel.x - vBob) / d.vMax);
  }
  check('振子速度 = 参考点速度的 x 分量', worstVproj < 1e-12, `最大相对偏差 ${worstVproj.toExponential(2)}`);
}

/* ============================================================
   天体运动
   ============================================================ */

section('23. 圆轨道：v = √(GM/r)，T = 2π√(r³/GM)');
{
  const p = { body: 'earth', h1: 400, h2: 400, incl: 0, turns: 1 };
  const d = orbit.derive(p);
  const r = R_EARTH + 400e3;
  const mu = G * M_EARTH;
  check('a = r（圆轨道）', near(d.a, r, 1e-12), `a = ${d.a}`);
  check('e = 0', Math.abs(d.e) < 1e-15, `e = ${d.e}`);
  check('T = 2π√(r³/GM)', near(d.T, 2 * Math.PI * Math.sqrt(r ** 3 / mu), 1e-12), `T = ${d.T}`);
  check('T ≈ 92 分钟', Math.abs(d.T / 60 / 92.4 - 1) < 0.01, `T = ${(d.T / 60).toFixed(2)} 分钟`);

  let worstV = 0;
  for (let i = 0; i <= 30; i++) {
    const s = orbit.sampleAt((i / 30) * d.T, p, d);
    worstV = Math.max(worstV, Math.abs(s.vel.length() / Math.sqrt(mu / r) - 1));
  }
  check('速率处处 = √(GM/r)', worstV < 1e-12, `最大相对偏差 ${worstV.toExponential(2)}`);
}

section('24. 开普勒第三定律：a³/T² 只与中心天体有关');
{
  const mu = G * M_EARTH;
  const k3 = [];
  for (const h of [400, 20200, 35786]) {
    const d = orbit.derive({ body: 'earth', h1: h, h2: h, incl: 0, turns: 1 });
    k3.push((d.a ** 3) / (d.T ** 2));
  }
  const spread = (Math.max(...k3) - Math.min(...k3)) / k3[0];
  check('三个不同高度的 a³/T² 完全一致', spread < 1e-12, `相对散布 ${spread.toExponential(2)}`);
  check('a³/T² = GM/(4π²)', near(k3[0], mu / (4 * Math.PI ** 2), 1e-12), `实测 ${k3[0].toExponential(6)}`);

  const dm = orbit.derive({ body: 'moon', h1: 100, h2: 100, incl: 0, turns: 1 });
  const k3m = (dm.a ** 3) / (dm.T ** 2);
  check('换成月球，a³/T² 按质量比缩小', near(k3m / k3[0], 7.342e22 / 5.9722e24, 1e-9),
    `比值 ${(k3m / k3[0]).toExponential(6)}`);
}

section('25. 椭圆轨道：开普勒方程、近远地点、面积速度恒定');
{
  const p = { body: 'earth', h1: 400, h2: 35786, incl: 0, turns: 1 };
  const d = orbit.derive(p);
  const r1 = R_EARTH + 400e3, r2 = R_EARTH + 35786e3;
  check('a = (r₁ + r₂)/2', near(d.a, (r1 + r2) / 2, 1e-12));
  check('e = (r₂ − r₁)/(r₂ + r₁)', near(d.e, (r2 - r1) / (r2 + r1), 1e-12), `e = ${d.e}`);

  // 距离始终落在 [r₁, r₂] 内，且两端都被取到
  let mn = Infinity, mx = -Infinity;
  for (let i = 0; i <= 2000; i++) {
    const s = orbit.sampleAt((i / 2000) * d.T, p, d);
    const r = s.pos.length();
    mn = Math.min(mn, r); mx = Math.max(mx, r);
  }
  check('近地点距离 = r₁', near(mn, r1, 1e-9), `实测 ${mn.toExponential(6)} vs ${r1.toExponential(6)}`);
  check('远地点距离 = r₂', near(mx, r2, 1e-9), `实测 ${mx.toExponential(6)} vs ${r2.toExponential(6)}`);

  // 开普勒第二定律：面积速度恒定（用角动量 |r × v|/2 检验）
  let worstL = 0;
  const L0 = null;
  let Lref = null;
  for (let i = 0; i <= 100; i++) {
    const s = orbit.sampleAt((i / 100) * d.T, p, d);
    const L = 0.5 * Math.abs(s.pos.x * s.vel.y - s.pos.y * s.vel.x);
    if (Lref == null) Lref = L;
    worstL = Math.max(worstL, Math.abs(L / Lref - 1));
  }
  check('面积速度 dA/dt 处处相等', worstL < 1e-9, `最大相对偏差 ${worstL.toExponential(2)}`);

  // 机械能：½v² − GM/r = −GM/(2a)
  let worstE = 0;
  const mu = G * M_EARTH;
  for (let i = 0; i <= 100; i++) {
    const s = orbit.sampleAt((i / 100) * d.T, p, d);
    const E = 0.5 * s.vel.lengthSq() - mu / s.pos.length();
    worstE = Math.max(worstE, Math.abs(E + mu / (2 * d.a)) / (mu / (2 * d.a)));
  }
  check('机械能 = −GM/(2a) 处处成立', worstE < 1e-9, `最大相对偏差 ${worstE.toExponential(2)}`);

  // 近地点最快、远地点最慢
  const vPeri = orbit.sampleAt(0, p, d).vel.length();
  const vApo = orbit.sampleAt(d.T / 2, p, d).vel.length();
  check('近地点速率 > 远地点速率', vPeri > vApo, `v近 = ${vPeri.toFixed(1)}  v远 = ${vApo.toFixed(1)} m/s`);
  check('近地点速率 = √(GM(2/r₁ − 1/a))', near(vPeri, Math.sqrt(mu * (2 / r1 - 1 / d.a)), 1e-9));
}

section('26. 天体：轨道倾角只改朝向，不改周期与形状');
{
  const base = { body: 'earth', h1: 800, h2: 800, turns: 1 };
  const d0 = orbit.derive({ ...base, incl: 0 });
  const d60 = orbit.derive({ ...base, incl: 60 });
  check('倾角改变不影响周期', near(d60.T, d0.T, 1e-15), `T 比值 ${(d60.T / d0.T).toFixed(12)}`);
  check('倾角改变不影响半长轴', near(d60.a, d0.a, 1e-15));

  let maxZ0 = 0, maxZ60 = 0;
  for (let i = 0; i <= 60; i++) {
    maxZ0 = Math.max(maxZ0, Math.abs(orbit.sampleAt((i / 60) * d0.T, { ...base, incl: 0 }, d0).pos.z));
    maxZ60 = Math.max(maxZ60, Math.abs(orbit.sampleAt((i / 60) * d60.T, { ...base, incl: 60 }, d60).pos.z));
  }
  check('倾角 0 时轨迹严格在 xy 平面内', maxZ0 < 1e-9, `最大 |z| = ${maxZ0.toExponential(2)}`);
  check('倾角 60 时轨迹确实离开该平面', maxZ60 > d60.a * 0.5, `最大 |z| = ${(maxZ60 / d60.a).toFixed(4)}·a`);
}

section('27. 天体：开普勒方程求解器的正确性');
{
  // 从解出的位置反推偏近点角 E，再检验 M = E − e·sinE 是否成立。
  // 用倾角 0，这样位置就在 xy 平面里，可以直接取 atan2 得到真近点角 ν。
  const p = { body: 'earth', h1: 400, h2: 35786, incl: 0, turns: 1 };
  const d = orbit.derive(p);
  let worst = 0;
  for (let i = 1; i < 200; i++) {
    const t = (i / 200) * d.T;
    const s = orbit.sampleAt(t, p, d);
    const nu = Math.atan2(s.pos.y, s.pos.x);
    // tan(E/2) = √((1−e)/(1+e))·tan(ν/2)
    const E = 2 * Math.atan(Math.sqrt((1 - d.e) / (1 + d.e)) * Math.tan(nu / 2));
    const M = E - d.e * Math.sin(E);
    // 与 n·t 比，模 2π 后取最小差
    let diff = ((M - d.n * t) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    worst = Math.max(worst, Math.abs(diff));
  }
  check('M = E − e·sinE 在整条轨道上成立', worst < 1e-9, `最大残差 ${worst.toExponential(2)} rad`);

  // r = a(1 − e·cosE) 的等价形式：p = a(1−e²)，r = p/(1 + e·cosν)
  const pSemi = d.a * (1 - d.e * d.e);
  let worstR = 0;
  for (let i = 0; i <= 100; i++) {
    const s = orbit.sampleAt((i / 100) * d.T, p, d);
    const r = s.pos.length();
    const nu = Math.atan2(s.pos.y, s.pos.x);
    worstR = Math.max(worstR, Math.abs(r / (pSemi / (1 + d.e * Math.cos(nu))) - 1));
  }
  check('圆锥曲线方程 r = p/(1 + e·cosν) 成立', worstR < 1e-9, `最大相对偏差 ${worstR.toExponential(2)}`);
}

/* ============================================================
   电场偏转（示波器）
   ============================================================ */

section('28. 电场偏转：板间类平抛，出板后匀速直线');
{
  const p = { particle: 'electron', v0: 1e7, E: 2000, L: 0.05, gap: 0.01 };
  const d = electricDeflection.derive(p);
  const { q, m } = PARTICLES.electron;
  // 板间：y = ½(qE/m)(t)²，出射偏转 yₘ = ½(qE/m)(L/v0)²
  const yTheo = 0.5 * (q * p.E / m) * (p.L / p.v0) ** 2;
  check('出射偏转 yₘ = ½(qE/m)(L/v₀)²', near(d.yExit, yTheo, 1e-9),
    `实测 ${d.yExit.toExponential(4)} vs ${yTheo.toExponential(4)}`);
  // 出板后不再加速：a = 0
  const sOut = electricDeflection.sampleAt(1.5 * d.t1, p, d);
  check('出板后竖直加速度为 0', Math.abs(sOut.acc.y) < 1e-15, `a_y = ${sOut.acc.y}`);
  // 板内水平分速恒定
  const sIn = electricDeflection.sampleAt(0.5 * d.t1, p, d);
  check('板内水平分速恒为 v₀', near(sIn.vel.x, p.v0, 1e-9));
  // 无电场 → 直线（y 恒为 0）
  const d0 = electricDeflection.derive({ ...p, E: 0 });
  let maxY = 0;
  for (let i = 0; i <= 40; i++) maxY = Math.max(maxY, Math.abs(electricDeflection.sampleAt(i / 40 * d0.tEnd, { ...p, E: 0 }, d0).pos.y));
  check('E = 0 时轨迹为直线（y 恒 0）', maxY < 1e-20, `max|y| = ${maxY.toExponential(2)}`);
}

/* 这一组是本轮"电场偏转整块卡住"的回归测试。
   根因：预设参数物理上离谱（板长 0.5 m 配 v₀=2e6，yₘ 达到 11 m，
   而板间距只有 0.1 m）→ 轨迹纵向跨度是极板几何的 330 倍 →
   fitWorld 把极板压成 5.7% 画幅宽的竖条，整个模型看起来"卡死"。
   教训：模型测试不能只验公式，必须验"结果在物理上是不是合理量级"。 */
section('28b. 电场偏转：极板约束、量级与取景健康度（回归）');
{
  for (const ps of electricDeflection.presets) {
    const d = electricDeflection.derive(ps.params);
    const tag = ps.id;

    // ① 偏转量不得超过板间距的一半（否则就是"穿过极板飞走了"，非物理）
    check(`[${tag}] 偏转量在极板内 |yₘ| ≤ d/2`, Math.abs(d.yExit) <= d.half + 1e-12,
      `|yₘ| = ${(Math.abs(d.yExit) * 1e3).toFixed(4)} mm, d/2 = ${(d.half * 1e3).toFixed(3)} mm`);

    // ② 全轨迹（含出板后直线段）纵向跨度不应比板间距大一两个数量级 ——
    //    否则渲染层取景一定会崩
    const tr = electricDeflection.buildTrajectory(ps.params, d);
    let ymin = Infinity, ymax = -Infinity;
    for (const pt of tr.pts) { if (pt.y < ymin) ymin = pt.y; if (pt.y > ymax) ymax = pt.y; }
    const spanRatio = (ymax - ymin) / d.gap;
    check(`[${tag}] 纵向跨度 ≤ 3× 板间距`, spanRatio <= 3,
      `跨度/间距 = ${spanRatio.toFixed(3)}`);

    // ③ 轨迹点必须按时间单调推进（折点加密后不能乱序）
    let mono = true;
    for (let i = 1; i < tr.pts.length; i++) {
      if (tr.pts[i].x < tr.pts[i - 1].x - 1e-12) { mono = false; break; }
    }
    check(`[${tag}] 轨迹点序单调（x 不倒退）`, mono, '');

    // ④ 撞板时轨迹终点必须正好落在板面上
    if (d.hit) {
      const last = tr.pts[tr.pts.length - 1];
      check(`[${tag}] 撞板终点落在板面 y = ±d/2`, near(Math.abs(last.y), d.half, 1e-12),
        `终点 y = ${(last.y * 1e3).toFixed(4)} mm`);
      check(`[${tag}] 撞板后不再前进（tEnd = tHit）`, near(d.tEnd, d.tHit, 1e-15), '');
    } else {
      check(`[${tag}] 未撞板时 tEnd = 2L/v₀`, near(d.tEnd, 2 * d.L / d.v0, 1e-15), '');
    }
  }

  // ⑤ 撞板阈值：E 增大到临界值以上应当发生撞板，以下不撞
  const base = { particle: 'electron', v0: 1e7, L: 0.05, gap: 0.01 };
  const Emax = (base.gap / 2) * 2 * PARTICLES.electron.m * base.v0 ** 2
    / (Math.abs(PARTICLES.electron.q) * base.L ** 2);
  const below = electricDeflection.derive({ ...base, E: Emax * 0.9 });
  const above = electricDeflection.derive({ ...base, E: Emax * 1.1 });
  check('E < E_crit 不撞板', !below.hit, `E_crit = ${Emax.toFixed(1)} V/m`);
  check('E > E_crit 撞板', above.hit, `E_crit = ${Emax.toFixed(1)} V/m`);
}

section('29. 电场偏转：电子下偏、质子上偏（q 的符号）');
{
  // 用各自预设的参数：质子要慢得多的入射速度 + 强得多的电场才看得见偏转
  const pe = { particle: 'electron', v0: 1e7, E: 2000, L: 0.05, gap: 0.01 };
  const pp = { particle: 'proton', v0: 1e6, E: 2e4, L: 0.05, gap: 0.01 };
  const de = electricDeflection.derive(pe);
  const dp = electricDeflection.derive(pp);
  check('电子向 −y 偏转（q<0）', de.yExit < 0, `yₘ = ${(de.yExit * 1e3).toFixed(3)} mm`);
  check('质子向 +y 偏转（q>0）', dp.yExit > 0, `yₘ = ${(dp.yExit * 1e3).toFixed(3)} mm`);
  // 偏转量 ∝ |q|/m · E/v₀²；电子的 |q|/m 比质子大 1836 倍
  const ratio = Math.abs(de.yExit) / Math.abs(dp.yExit);
  check('同样偏转量级下电子 ∝ |q|/m 更大', ratio > 1,
    `|yₑ|/|yₚ| = ${ratio.toFixed(3)}`);
}

/* ============================================================
   单摆
   ============================================================ */

section('30. 单摆（精确解）：T = 4K(k)/ω，小角度才退化为 2π√(L/g)');
{
  const T0of = (L, g) => 2 * Math.PI * Math.sqrt(L / g);
  const mk = (over) => ({ L: 1, theta0: 30, g: 9.8, m: 0.5, turns: 3, ...over });

  /* 级数展开（独立于椭圆函数实现的第三方参照）：
     T/T₀ = Σₙ [ (2n)! / (2^{2n}(n!)²) ]² · sin^{2n}(θ₀/2) */
  const seriesRatio = (th0) => {
    const s2 = Math.sin(th0 / 2) ** 2;
    let total = 1, term = 1;
    for (let n = 1; n <= 40; n++) {
      term *= s2 * ((2 * n - 1) / (2 * n)) ** 2;
      total += term;
    }
    return total;
  };

  // ① 小角度极限：θ₀ = 5° 时精确解必须收敛到 2π√(L/g)
  const d5 = pendulum.derive(mk({ theta0: 5 }));
  check('θ₀ = 5°：T 与 2π√(L/g) 相差 < 0.05%',
    Math.abs(d5.T / T0of(1, 9.8) - 1) < 5e-4,
    `T = ${d5.T.toFixed(6)}  T₀ = ${T0of(1, 9.8).toFixed(6)}`);

  // ② 精确周期 vs 级数展开（全角度范围）
  let worstSeries = 0;
  for (const deg of [10, 20, 30, 45, 60, 70, 80, 89]) {
    const d = pendulum.derive(mk({ theta0: deg }));
    const r = d.T / d.T0;
    worstSeries = Math.max(worstSeries, Math.abs(r - seriesRatio(deg * Math.PI / 180)));
  }
  check('T/T₀ 与级数展开一致（|Δ| < 1e-9）', worstSeries < 1e-9,
    `最大偏差 ${worstSeries.toExponential(2)}`);

  // ③ 教科书参照值（独立查表）
  for (const [deg, ref] of [[30, 1.0174], [60, 1.0732], [90, 1.1803]]) {
    const d = pendulum.derive(mk({ theta0: deg }));
    check(`T(${deg}°)/T₀ = ${ref}（教科书值）`, near(d.T / d.T0, ref, 5e-4),
      `实测 ${(d.T / d.T0).toFixed(4)}`);
  }

  // ④ 单调性：θ₀ 越大周期越长 —— 这条正是"大角度"预设要讲的事
  let mono = true, prev = 0;
  for (let deg = 5; deg <= 80; deg += 5) {
    const T = pendulum.derive(mk({ theta0: deg })).T;
    if (T <= prev) mono = false;
    prev = T;
  }
  check('周期随摆角单调增大（等时性只是近似）', mono);

  // ⑤ 初始条件与半周期
  const d70 = pendulum.derive(mk({ theta0: 70 }));
  const deg0 = Math.atan2(pendulum.sampleAt(0, mk({ theta0: 70 }), d70).pos.x,
    -pendulum.sampleAt(0, mk({ theta0: 70 }), d70).pos.y) * 180 / Math.PI;
  check('θ(0) = θ₀', near(deg0, 70, 1e-9), `θ(0) = ${deg0.toFixed(9)}°`);
  const half = pendulum.sampleAt(d70.T / 2, mk({ theta0: 70 }), d70);
  const degHalf = Math.atan2(half.pos.x, -half.pos.y) * 180 / Math.PI;
  check('θ(T/2) = −θ₀', near(degHalf, -70, 1e-9), `θ(T/2) = ${degHalf.toFixed(9)}°`);

  /* ⑥ 运动方程 θ'' = −ω₀²sinθ 与径向 v²/L。
     把笛卡尔加速度投到切向/径向 —— 这两条同时成立说明
     位置、速度、加速度三者自洽（不只是位置对）。 */
  let worstTan = 0, worstRad = 0;
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * d70.T;
    const s = pendulum.sampleAt(t, mk({ theta0: 70 }), d70);
    const th = Math.atan2(s.pos.x, -s.pos.y);
    const tan = s.acc.x * Math.cos(th) + s.acc.y * Math.sin(th);          // 切向
    const rad = s.acc.x * -Math.sin(th) + s.acc.y * Math.cos(th);         // 指向悬点
    worstTan = Math.max(worstTan, Math.abs(tan - -d70.g * Math.sin(th)));
    worstRad = Math.max(worstRad, Math.abs(rad - s.vel.length() ** 2 / d70.L));
  }
  check('切向加速度 = −g·sinθ（运动方程成立）', worstTan < 1e-9,
    `最大偏差 ${worstTan.toExponential(2)} m/s²`);
  check('径向加速度 = v²/L（向心关系成立）', worstRad < 1e-9,
    `最大偏差 ${worstRad.toExponential(2)} m/s²`);

  // ⑦ 能量守恒：E = ½v² + gL(1−cosθ)
  const E0 = d70.g * d70.L * (1 - Math.cos(d70.th0));
  let worstE = 0;
  for (let i = 0; i <= 200; i++) {
    const s = pendulum.sampleAt((i / 200) * d70.T, mk({ theta0: 70 }), d70);
    const th = Math.atan2(s.pos.x, -s.pos.y);
    worstE = Math.max(worstE, Math.abs(0.5 * s.vel.length() ** 2 + d70.g * d70.L * (1 - Math.cos(th)) - E0));
  }
  check('机械能守恒（相对漂移 < 1e-12）', worstE / E0 < 1e-12, `最大漂移 ${worstE.toExponential(2)} J`);

  // ⑧ 最低点速率 = √(2gL(1−cosθ₀))，且与 d.vRef 一致（箭头缩放基准）
  check('vRef = √(2gL(1−cosθ₀))', near(d70.vRef, Math.sqrt(2 * d70.g * d70.L * (1 - Math.cos(d70.th0))), 1e-12),
    `vRef = ${d70.vRef.toFixed(6)}`);
  let vMax = 0;
  for (let i = 0; i <= 2000; i++) vMax = Math.max(vMax, pendulum.sampleAt((i / 2000) * d70.T, mk({ theta0: 70 }), d70).vel.length());
  check('轨迹上实测最大速率 = vRef', near(vMax, d70.vRef, 1e-6), `实测 ${vMax.toFixed(6)}`);

  // ⑨ 与质量无关、与摆长 √2、纯函数性、平面内
  check('质量加倍 → 周期不变', near(pendulum.derive(mk({ m: 1 })).T, pendulum.derive(mk()).T, 1e-12));
  check('摆长加倍 → 周期 √2 倍', near(pendulum.derive(mk({ L: 2 })).T / pendulum.derive(mk()).T, Math.SQRT2, 1e-12));
  const pp = mk({ theta0: 70 });
  const sA = pendulum.sampleAt(0.37 * d70.T, pp, d70), sB = pendulum.sampleAt(0.37 * d70.T, pp, d70);
  check('同一时刻重复求值完全一致', sA.pos.distanceTo(sB.pos) === 0);
  let maxZ = 0;
  for (let i = 0; i <= 60; i++) maxZ = Math.max(maxZ, Math.abs(pendulum.sampleAt(i / 60 * d70.T, pp, d70).pos.z));
  check('运动始终在竖直平面内（z = 0）', maxZ < 1e-15, `max|z| = ${maxZ.toExponential(2)}`);

  // ⑩ 极端摆角不产生 NaN
  let bad = false;
  try {
    const pe = mk({ theta0: 80, L: 3, g: 25 });
    const de = pendulum.derive(pe);
    if (!isFinite(de.T) || de.T <= 0) bad = true;
    for (let i = 0; i <= 100; i++) {
      const s = pendulum.sampleAt((i / 100) * de.T, pe, de);
      if (!isFinite(s.pos.x) || !isFinite(s.vel.length())) bad = true;
    }
  } catch (e) { bad = true; }
  check('极端参数（80°/L=3/g=25）不产生 NaN', !bad);

  /* ⑪ 独立数值积分交叉验证：RK4 积分 θ'' = −ω₀²sinθ，与椭圆函数解逐点对照。
     这是**不依赖椭圆函数实现**的第三方证据 —— 前面 ② ③ 用的级数展开虽然
     也是独立公式，但毕竟同属"解析族"。RK4 只认运动方程本身。 */
  {
    const p = mk({ theta0: 70 });
    const d = pendulum.derive(p);
    const h = d.T / 20000;
    const f = (y) => [y[1], -d.w * d.w * Math.sin(y[0])];
    let th = d.th0, om = 0, worst = 0;
    for (let i = 1; i <= 40000; i++) {
      const k1 = f([th, om]);
      const k2 = f([th + h / 2 * k1[0], om + h / 2 * k1[1]]);
      const k3 = f([th + h / 2 * k2[0], om + h / 2 * k2[1]]);
      const k4 = f([th + h * k3[0], om + h * k3[1]]);
      th += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      om += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      const s = pendulum.sampleAt(i * h, p, d);
      worst = Math.max(worst, Math.abs(th - Math.atan2(s.pos.x, -s.pos.y)));
    }
    check('与独立 RK4 积分逐点一致（2 个周期，|Δθ| < 1e-9）', worst < 1e-9,
      `最大偏差 ${worst.toExponential(2)} rad`);
  }
}

/* ============================================================
   回旋加速器
   ============================================================ */

section('31. 回旋加速器：ω = qB/m 与半径无关，半径 ∝ √(能量)');
{
  const p = { particle: 'proton', B: 0.5, V: 1000, v0: 1e5, turns: 3 };
  const d = cyclotron.derive(p);
  const { q, m } = PARTICLES.proton;
  check('ω = |q|B/m', near(d.omega, Math.abs(q) * p.B / m, 1e-12), `ω = ${d.omega}`);
  check('T = 2πm/(|q|B)', near(d.T, 2 * Math.PI * m / (Math.abs(q) * p.B), 1e-12));
  // 半径随 t 单调增大（螺旋外扩）
  const r0 = Math.hypot(cyclotron.sampleAt(0.1 * d.T, p, d).pos.x, cyclotron.sampleAt(0.1 * d.T, p, d).pos.y);
  const r1 = Math.hypot(cyclotron.sampleAt(0.9 * d.tEnd, p, d).pos.x, cyclotron.sampleAt(0.9 * d.tEnd, p, d).pos.y);
  check('半径随时间外扩（rₑₙ𝒹 > rₛₜₐᵣₜ）', r1 > r0 * 1.5, `r₀ = ${r0.toExponential(3)}  r₁ = ${r1.toExponential(3)}`);
  // 角频率不随半径变：角位置对 t 的导数 ≈ ω
  const sA = cyclotron.sampleAt(0.3 * d.T, p, d);
  const sB = cyclotron.sampleAt(0.31 * d.T, p, d);
  const angRate = Math.atan2(sB.pos.y, sB.pos.x) - Math.atan2(sA.pos.y, sA.pos.x);
  check('角速度 ≈ ω（与当前半径无关）', near(angRate / (0.01 * d.T), d.omega, 1e-2),
    `实测 ${(angRate / (0.01 * d.T)).toExponential(4)} vs ${d.omega.toExponential(4)}`);
  // B 加倍 → ω 加倍、半径减半
  const d2 = cyclotron.derive({ ...p, B: 1.0 });
  check('B 加倍 → 回旋频率加倍', near(d2.omega / d.omega, 2, 1e-12));
}

/* ============================================================
   弹性碰撞
   ============================================================ */

section('32. 弹性碰撞：动量与动能守恒，等质量交换速度');
{
  // 等质量、球2 静止：碰后球1 停、球2 以 u1 前进
  const p = { m1: 1, m2: 1, u1: 3, u2: 0, x0: 1.5 };
  const d = collision.derive(p);
  check('碰后球1 速度 ≈ 0', near(d.v1, 0, 1e-12), `v₁' = ${d.v1}`);
  check('碰后球2 速度 = u₁（速度交换）', near(d.v2, p.u1, 1e-12), `v₂' = ${d.v2}`);
  check('系统动量守恒', near(d.P1, d.P0, 1e-12), `P: ${d.P0} → ${d.P1}`);
  check('系统动能守恒', near(d.K1, d.K0, 1e-12), `K: ${d.K0} → ${d.K1}`);

  // 任意质量：动量与动能均守恒
  const p2 = { m1: 4, m2: 1, u1: 3, u2: -1, x0: 1.5 };
  const d2 = collision.derive(p2);
  check('任意质量下动量守恒', near(d2.P1, d2.P0, 1e-12));
  check('任意质量下动能守恒', near(d2.K1, d2.K0, 1e-12));

  // 碰撞后两球位置：球2 在碰撞点之后沿 v2 前进
  const s1 = collision.sampleAt(d.t_c * 1.5, p, d);
  check('碰后球1 从接触点球心 x1c 出发', near(s1.pos.x, d.x1c + d.v1 * (d.t_c * 0.5), 1e-9),
    `x₁ = ${s1.pos.x.toFixed(4)}`);

  /* 有限半径接触几何：两球是实体，不能互相穿透。
     最小球心距必须恰好等于 R₁ + R₂（表面相切），发生在 t = t_c。
     注意：不能用固定步长扫 t 去取 min —— t_c 一般不是步长的整数倍，
     扫描会"跨过"接触点，取到略大的值。直接解析判定：
     ① t_c 处恰为相切；② t_c 两侧单调分离（碰前接近、碰后远离）。 */
  const gap = (t) => (t <= d.t_c ? (d.u2 * t) - (-d.d0 + d.u1 * t)
                                 : (d.x2c + d.v2 * (t - d.t_c)) - (d.x1c + d.v1 * (t - d.t_c)));
  const touchGap = gap(d.t_c);
  const preGap = gap(d.t_c - 1e-4), postGap = gap(d.t_c + 1e-4);
  check('两球表面相切不穿透（t_c 处球心距 = R₁+R₂）',
    near(touchGap, d.R1 + d.R2, 1e-9),
    `gap(t_c) = ${touchGap.toFixed(9)} vs R₁+R₂ = ${(d.R1 + d.R2).toFixed(9)}`);
  check('接触点即最小球心距（碰前逼近、碰后远离）',
    preGap > touchGap && postGap > touchGap,
    `碰前 ${preGap.toFixed(6)} > t_c ${touchGap.toFixed(6)} < 碰后 ${postGap.toFixed(6)}`);
  check('碰后两球再不接触（球心距单调增）',
    gap(d.tEnd) > gap(d.t_c + 0.1 * (d.tEnd - d.t_c)), '');
  check('t=0 时两球恰好相切放置（球心距 = d₀）',
    near(gap(0), d.d0, 1e-12) && near(d.d0, d.X0 + d.R1 + d.R2, 1e-12),
    `d₀ = ${d.d0.toFixed(4)}`);
  check('半径 ∝ m^(1/3)（同密度假设）',
    near(d.R1 / d.R2, Math.cbrt(p.m1 / p.m2), 1e-12),
    `R₁/R₂ = ${(d.R1 / d.R2).toFixed(4)}`);

  // 数值安全：极端参数不产生 NaN
  let bad = false;
  try {
    const dd = collision.derive({ m1: 0.1, m2: 5, u1: -5, u2: 5, x0: 0.2 });
    const { pts } = collision.buildTrajectory({ m1: 0.1, m2: 5, u1: -5, u2: 5, x0: 0.2 }, dd);
    if (pts.some(q => !isFinite(q.x))) bad = true;
  } catch (e) { bad = true; }
  check('极端相向碰撞不产生 NaN', !bad);
}

/* ============================================================
   读数显示：零值不能被 SI 前缀放大
   ============================================================ */

section('33. 该为零的读数必须显示 0（回归：曾被放大成 fm/s、fN）');
{
  /* 解析解在 t = nT / 落地瞬间 / 摆线尖点处应当精确为零，
     但 cos(ω·nT) 只留得下 ~1e-16 的浮点残渣。fmt 会按 SI 前缀把它
     放大成 "1.39 fm/s"、"5.88 fN"、"2.57 pm/s" —— 屏幕上看着像有值。
     这些位置一律要显示成 "0 <单位>"。 */
  const rd = (mod, p, t) => {
    const d = mod.derive(p);
    const s = mod.sampleAt(t, p, d);
    return mod.readingsOf(s, { t, p, d, s });
  };

  // ① 简谐运动：t = nT 处回到最大位移 → 速度、动能归零
  const shmP = { A: 0.3, k: 20, m: 0.5, phi0: 0, turns: 3 };
  const shmT = shm.derive(shmP).T;
  {
    const r = rd(shm, shmP, 3 * shmT);
    check('shm t=3T：速度 v = 0 m/s', r.v === '0 m/s', `实得 "${r.v}"`);
    check('shm t=3T：动能 Ek = 0 J', r.Ek === '0 J', `实得 "${r.Ek}"`);
    check('shm t=3T：位移仍为最大位移 300 mm', r.x === '300 mm', `实得 "${r.x}"`);
    check('shm t=3T：机械能不变 900 mJ', r.E === '900 mJ', `实得 "${r.E}"`);
  }
  // ② 简谐运动：t = T/4 处过平衡位置 → 位移、弹力、弹性势能归零
  {
    const r = rd(shm, shmP, shmT / 4);
    check('shm t=T/4：位移 x = 0 m', r.x === '0 m', `实得 "${r.x}"`);
    check('shm t=T/4：弹力 F = 0 N', r.F === '0 N', `实得 "${r.F}"`);
    check('shm t=T/4：弹性势能 Ep = 0 J', r.Ep === '0 J', `实得 "${r.Ep}"`);
  }
  // ③ 简谐运动：从平衡位置出发（φ₀=90°）→ t=0 时位移/加速度/弹力为零
  {
    const r = rd(shm, { ...shmP, phi0: 90 }, 0);
    check('shm φ₀=90° t=0：位移 x = 0 m', r.x === '0 m', `实得 "${r.x}"`);
    check('shm φ₀=90° t=0：加速度 a = 0 m/s²', r.a === '0 m/s²', `实得 "${r.a}"`);
    check('shm φ₀=90° t=0：弹力 F = 0 N', r.F === '0 N', `实得 "${r.F}"`);
  }
  // ④ 单摆：两端（t = nT）速率为零
  {
    const p = { L: 1, theta0: 10, g: 9.8, m: 0.5, turns: 3 };
    const r = rd(pendulum, p, 3 * pendulum.derive(p).T);
    check('pendulum t=3T：速率 |v| = 0 m/s', r.speed === '0 m/s', `实得 "${r.speed}"`);
  }
  // ⑤ 平抛：落地瞬间高度为零
  {
    const p = { v0: 20, alpha: 0, phi: 0, h0: 20, g: 9.8 };
    const d = projectile.derive(p);
    const r = rd(projectile, p, d.tEnd);
    check('projectile 落地：高度 y = 0 m', r.h === '0 m', `实得 "${r.h}"`);
    check('projectile 落地：水平射程与 H 仍在', r.R === '40.4 m' && r.H === '20.0 m', `实得 R=${r.R} H=${r.H}`);
  }
  // ⑥ 配速法：摆线尖点处速率为零
  {
    const r = rd(vm, P(), 3 * derive(P()).T);
    check('velocity-matching 尖点：速率 |v| = 0 m/s', r.speed === '0 m/s', `实得 "${r.speed}"`);
    check('velocity-matching 尖点：圆周分量 v′ 仍为 600 m/s', r.vp === '600 m/s', `实得 "${r.vp}"`);
  }
  // ⑦ 竖直上抛：最高点竖直分速与速率都为零（t = t_apex）
  {
    const p = { v0: 20, alpha: 90, phi: 0, h0: 0, g: 9.8 };
    const d = projectile.derive(p);
    const r = rd(projectile, p, d.tApex);
    check('projectile 最高点：竖直分速 v_y = 0 m/s', r.vy === '0 m/s', `实得 "${r.vy}"`);
    check('projectile 最高点：速率 |v| = 0 m/s（纯竖直）', r.speed === '0 m/s', `实得 "${r.speed}"`);
    check('projectile 最高点：高度 = 最大高度 20.4 m', r.h === '20.4 m', `实得 "${r.h}"`);
  }
}

section('34. 全模型扫描：没有读数把"零"显示成飞级以下的单位');
{
  /* 允许清单：这两个量本身就在飞焦/飞牛量级，是真实值不是残渣。 */
  const TINY_OK = { cyclotron: ['K'], 'magnetic-circle': ['F'] };
  const suspicious = /^-?[1-9]\d*(?:\.\d+)?\s+(?:f|a|z|y)/;
  const models = [vm, projectile, magnetic, conical, shm, orbit, electricDeflection, pendulum, cyclotron, collision];
  const hits = [];
  for (const mod of models) {
    const ok = TINY_OK[mod.id] || [];
    for (const ps of mod.presets ?? []) {
      const p = ps.params;
      const d = mod.derive(p);
      const traj = mod.buildTrajectory(p, d);
      for (const t of [0, traj.tEnd * 0.5, traj.tEnd]) {
        const s = mod.sampleAt(t, p, d);
        const r = mod.readingsOf(s, { t, p, d, s });
        for (const rr of mod.readings) {
          if (ok.includes(rr.key)) continue;
          const v = String(r[rr.key]);
          if (suspicious.test(v)) hits.push(`${mod.id}/${ps.id} t=${t.toPrecision(3)} ${rr.key}="${v}"`);
        }
      }
    }
  }
  check(`全部模型 × 预设的读数无异常小单位（扫 ${models.length} 个模型）`,
    hits.length === 0, hits.slice(0, 8).join(' ; '));
}

/* ============================================================
   §35 默认播放速度 —— "电场偏转频闪"的回归测试

   事故：电场偏转的 tEnd 只有 1e-8 s，而 resetSpeedToDefault 当初对
   非周期模型用了 tEnd / secondsPerCycle（secondsPerCycle 恒为 1），
   算出 1e-9 被 clamp 抬到下限 0.02 —— 主循环每秒推进 0.02 s，
   等于把 1e-8 s 的轨迹每秒绕 200 万圈，画面看起来就是"频闪"。

   这类 bug 数值断言全绿、无 error/warn、取景也正常，前面五层都拦不住。
   唯一能拦住的判据是：**整条轨迹的墙上时间**必须是个正常人能看的数。
   ============================================================ */
section('35. 默认播放速度：整条轨迹的墙上时间必须落在合理区间');
{
  const models = [vm, projectile, magnetic, conical, shm, orbit, electricDeflection, pendulum, cyclotron, collision];
  const WALL_MIN = 2, WALL_MAX = 120;      // 秒：默认速度下"整条轨迹走完"的墙上时间
  const bad = [];
  let n = 0;
  for (const mod of models) {
    for (const ps of mod.presets ?? []) {
      const p = ps.params;
      const d = mod.derive(p);
      const traj = mod.buildTrajectory(p, d);
      const ts = mod.timeScale(p, d);
      const speed = defaultSpeed(ts, traj.tEnd);
      const wall = wallClockSeconds(ts, traj.tEnd, speed);
      n++;
      const stride = strideSeconds(ts, traj.tEnd);
      /* 语义自检：周期模型的步长必须是一个周期，非周期模型必须是整条轨迹。
         电场偏转的 tEnd ≈ 1e-8 s 而 stride 若是 1，这里立刻爆。 */
      const strideOK = ts.cyclic
        ? Math.abs(stride - ts.secondsPerCycle) < 1e-12
        : Math.abs(stride - traj.tEnd) < 1e-18;
      if (!(wall >= WALL_MIN && wall <= WALL_MAX) || !strideOK) {
        bad.push(`${mod.id}/${ps.id} tEnd=${traj.tEnd.toExponential(2)}s stride=${stride.toExponential(2)} `
          + `speed=${speed.toFixed(3)} 全程=${wall.toFixed(2)}s${strideOK ? '' : ' [步长语义错]'}`);
      }
    }
  }
  check(`全部 ${n} 个预设：默认速度下整条轨迹 ${WALL_MIN}–${WALL_MAX} 秒走完`,
    bad.length === 0, bad.slice(0, 8).join(' ; '));

  // 单独钉死电场偏转（事故现场）：必须约 10 秒走完，而不是 5e-7 秒
  {
    const p = electricDeflection.presets[1].params;      // 示波器偏转
    const d = electricDeflection.derive(p);
    const traj = electricDeflection.buildTrajectory(p, d);
    const ts = electricDeflection.timeScale(p, d);
    const speed = defaultSpeed(ts, traj.tEnd);
    const wall = wallClockSeconds(ts, traj.tEnd, speed);
    check(`electric-deflection 示波器：整条轨迹 ${wall.toFixed(1)} s 走完（≈10 s）`,
      wall > 5 && wall < 20, `实得 ${wall.toFixed(3)} s`);
    check('electric-deflection 示波器：tEnd 是纳秒量级（说明确实需要非周期步长）',
      traj.tEnd > 1e-9 && traj.tEnd < 1e-7, `实得 ${traj.tEnd.toExponential(3)} s`);
    check('electric-deflection 步长 = tEnd 而不是 1',
      strideSeconds(ts, traj.tEnd) === traj.tEnd, '步长取错了 → 会频闪');
  }

  // 非周期模型的默认速度必须是 1/10（0.1 条轨迹/秒），与 tEnd 大小无关
  {
    const cases = [
      ['electric-deflection', electricDeflection, electricDeflection.presets[1].params],
      ['projectile', projectile, projectile.presets[0].params],
      ['collision', collision, collision.presets[0].params],
    ];
    for (const [name, mod, p] of cases) {
      const d = mod.derive(p);
      const traj = mod.buildTrajectory(p, d);
      const s = defaultSpeed(mod.timeScale(p, d), traj.tEnd);
      check(`${name} 默认速度恒为 0.1（非周期模型与 tEnd 无关）`,
        Math.abs(s - 0.1) < 1e-12, `实得 ${s}`);
    }
  }

  // 滑块区间与 clamp 边界必须一致
  check('SPEED_MIN / SPEED_MAX 与滑块区间一致（0.02 / 6）',
    SPEED_MIN === 0.02 && SPEED_MAX === 6, `${SPEED_MIN} / ${SPEED_MAX}`);
}

/* ---------- 汇总 ---------- */
console.log(`\n${'─'.repeat(46)}`);
console.log(`  通过 ${pass}  失败 ${fail}`);
console.log('─'.repeat(46));
process.exit(fail === 0 ? 0 : 1);
