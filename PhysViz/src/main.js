/* ============================================================
   悟理 PhysViz — 引擎
   ------------------------------------------------------------
   这一层完全不知道"配速法"是什么。
   所有模型相关的信息（参数、图层、读数、预设、矢量、场、辅助线）
   都由 src/models/*.js 声明，这里只负责：

     1. 把声明变成 DOM 与 3D 物体
     2. 尺度归一化（物理尺度 → 世界尺度）
     3. 相机、时间轴、标注层、导出

   加一个新模型的成本 = 写一个 model 文件 + 注册表加一行。
   ============================================================ */

import * as THREE from 'three';

import {
  N, EPS, fmt, fmtTime, fitWorld, clamp,
  SPEED_MIN, SPEED_MAX, strideSeconds, defaultSpeed,
} from './physics.js';
import {
  FatLine, ThinSegs, ThinPath, Arrow, MarkerSet, UniformField,
  ARROW_LEN, setLineResolution,
} from './core/kit.js';
import { THEMES, themeById, applyThemeCss, hexStr } from './core/theme.js';
import { MODELS, modelById } from './core/registry.js';

/* ============================ 状态 ============================ */

const state = {
  model: MODELS[0],
  theme: THEMES[0],

  params: {},
  presetIdx: 0,

  d: null, traj: null, ts: null, fit: null,
  bounds: null, contentBox: null, axis: null, axisBase: null,
  decorDepth: 1, camTarget: null,

  t: 0,
  playing: true,
  dir: 1,
  // 每秒推进多少个"主时间单位"（配速法 = 回旋周期，平抛 = 秒）
  speed: 0.5,

  range: { on: false, a: 0.25, b: 0.75 },
  axisShift: new THREE.Vector3(),
  gridGrip: new THREE.Vector3(),   // 网格抓手的世界坐标（buildDecor 里每帧算）
  gridZ: 0,                        // 网格面所在的 z（内容背后）
  ink: { mode: 'off', tool: 'pen', color: '#e60012', strokes: [], live: null },

  layers: {},
  view: { az: -90, el: 90, zoom: 1 },
  viewKey: null,        // 当前视角对应 views 里的哪个 key；手动拖动后置 null
  showHint: true,
  // 对比演示方式：overlay = 同尺度叠加切换；split = 左右实时分屏
  cmpMode: 'overlay',
  // 对比组（preset.cmp）锁定的尺度与中心，null 表示自适应
  scaleOverride: null,
  centerOverride: null,
};

let wpts = [];            // 世界坐标下的轨迹点
let boundsLock = null;    // scaleRef 预设用它锁视野，避免相机自动放大把大小差异抹平
let guideSpecs = [];      // 当前模型的参考线声明
let fieldSpecs = [];      // 当前模型的场声明
let camPan = new THREE.Vector3();   // 双指拖动累计的相机平移（世界坐标），applyCamera 时加到目标上
let cmpPartner = null;              // 分屏对比时的"另一预设"动态对象（轨迹/粒子/标记）

/* ============================ 3D 场景 ============================ */

const canvas = document.getElementById('view');
const stage = document.getElementById('stage');
const labelLayer = document.getElementById('labels');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 1);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
// 相机也要能渲染 layer 1：中心天体（地球）只放在 layer 1，靠 bodyLight + bodyAmbient
// 单独照亮，避免被全局半球光冲平。开这一位，layer 0 的其它物体照常渲染。
camera.layers.enable(1);

/* 光照：圆柱 / 圆锥 / 球体有明暗，才有"实体"感，而不是一片纯色。
   主光方向每帧跟着相机走（见 applyCamera），
   这样无论转到哪个视角，明暗关系都稳定 —— 插图式布光。
   按集显约束：不投影、不后期，只留两盏平行光 + 半球环境光。 */
scene.add(new THREE.HemisphereLight(0xffffff, 0xc4ceda, 0.95));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.60);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.22);
scene.add(keyLight, fillLight);

/* 天体「高光 + 明暗」专用光组：只照放在 layer 1 上的中心天体（见 kit.js MarkerSet）。
   每帧跟着相机走（见 applyCamera），于是无论怎么转视角，受光面始终朝向观众，
   高光与明暗过渡随视角移动 —— 这就是用户要的"有 3D 感、根据看的方向打光"。
   用 layer 1 隔离，其它模型（都在默认 layer 0）完全不受这两盏光影响，不会被动变亮。 */
const bodyLight = new THREE.DirectionalLight(0xffffff, 1.25);
bodyLight.layers.set(1);
scene.add(bodyLight);
// 暗面专用弱环境光（只照 layer 1）：给背光的半球一点灰，而不是死黑；
// 配合 bodyLight 形成清晰终结线，球体才"鼓"起来。
const bodyAmbient = new THREE.AmbientLight(0xffffff, 0.26);
bodyAmbient.layers.set(1);
scene.add(bodyAmbient);

/* ---- 轨迹线 ----
   三条线各司其职：
     trajLine   完整轨迹（区间模式下退成浅灰背景，保留上下文但不抢视线）
     focusLine  选中时间段 [A,B] 的那一段
     trailLine  已走过的部分（区间模式下只从 A 画到当前时刻）
   Line2 用 instanceCount 控制"画多少段"，但没有"从第几段开始"的偏移量 ——
   所以区间段必须单独喂一条几何体。 */
const trajLine  = new FatLine(0xaecbea, 3);
const focusLine = new FatLine(0x185fa5, 3.2);
const trailLine = new FatLine(0x0c447c, 3.4);
// 三条线基本共面，深度相等时后画的胜出 —— 用 renderOrder 固定压盖顺序
focusLine.obj.renderOrder = 1;
trailLine.obj.renderOrder = 2;
scene.add(trajLine.obj, focusLine.obj, trailLine.obj);

/* ---- 虚线辅助（速度平行四边形） ---- */
const helperLine = new ThinSegs(0xb4b2a9, { dashed: true });
scene.add(helperLine.obj);

/* ---- 粒子：关闭深度测试，保证始终画在轨迹与箭头之上 ---- */
const particle = new THREE.Mesh(
  new THREE.SphereGeometry(1, 24, 16),
  new THREE.MeshLambertMaterial({ color: 0x1f2933, depthTest: false }),
);
particle.renderOrder = 999;
scene.add(particle);

/* ---- 网格 / 坐标轴 / 投影线 ---- */
const gridLine   = new ThinSegs(0xe4eaf0);
const axesLine   = new ThinSegs(0x8a9099);
const projLine   = new ThinSegs(0xd7dee6);
scene.add(gridLine.obj, axesLine.obj, projLine.obj);

/* ---- 标记点池（振子、悬点、中心天体、近远地点…） ---- */
const markers = new MarkerSet(scene);

/* ---- 坐标架手柄 ----
   坐标轴与参考网格是**同一个刚体**（下面统称"坐标架"），拖哪个手柄都是整体移动：
     · 原点手柄（小球）—— 抓它挪坐标轴
     · 网格抓手（小方块）—— 抓它挪网格面
   做成两种形状是刻意的：一眼分得清"这是原点"还是"这是网格"，
   而不是两个长得一样、只能靠位置猜的球。 */
const originHandle = new THREE.Mesh(
  new THREE.SphereGeometry(1, 18, 12),
  new THREE.MeshLambertMaterial({ color: 0xd4883a, depthTest: false }),
);
originHandle.renderOrder = 998;
scene.add(originHandle);

const gridGrip = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshLambertMaterial({ color: 0xd4883a, depthTest: false }),
);
gridGrip.renderOrder = 997;
gridGrip.visible = false;
scene.add(gridGrip);

/* ---- 文字标签（HTML 叠加，投影后定位，比 3D 文字清晰） ---- */
const labels = [];
const labelPool = new Map();

function makeLabel(key, html, color) {
  const el = document.createElement('div');
  el.className = 'lbl';
  el.innerHTML = html;
  el.style.color = color;
  el.style.display = 'none';
  labelLayer.appendChild(el);
  // text / color / sx / sy 是给「存图」准备的：HTML 标签是叠加层，不在 WebGL 画布上，
  // 导出 PNG 时只能拿投影后的屏幕坐标手工补画一遍。
  const o = {
    key, el, pos: new THREE.Vector3(), on: false,
    text: html.replace(/<[^>]+>/g, ''), color, sx: 0, sy: 0,
  };
  labels.push(o);
  labelPool.set(key, o);
  return o;
}

/* 引擎自己固定要用的标签 */
const L = {
  x: makeLabel('x', 'x', '#8a9099'),
  y: makeLabel('y', 'y', '#8a9099'),
  z: makeLabel('z', 'z', '#8a9099'),
  O: makeLabel('O', 'O', '#ba7517'),
};
/* 模型声明的矢量标签按 key 现取现建 */
function labelFor(key, html, color) {
  let l = labelPool.get(key);
  if (!l) l = makeLabel(key, html, color);
  if (l.color !== color) { l.color = color; l.el.style.color = color; }
  return l;
}
function hideLabels(keys) {
  for (const k of keys) { const l = labelPool.get(k); if (l) l.on = false; }
}

/* ============================ 上下文 ============================
   模型的所有渲染钩子都拿到同一个 ctx 对象。
   复用同一个对象是为了避免每帧产生垃圾，钩子不许把它存起来。 */
const _ctx = {
  p: null, d: null, traj: null, wpts: null, C: null, lw: null,
  N, EPS, t: 0, s: null,
};
function ctx(s) {
  _ctx.p = state.params;
  _ctx.d = state.d;
  _ctx.traj = state.traj;
  _ctx.wpts = wpts;
  _ctx.C = state.theme.scene;
  _ctx.lw = state.theme.lw;
  _ctx.t = state.t;
  _ctx.s = s || null;
  return _ctx;
}

/* 物理坐标 → 世界坐标 */
const toWorld = (v) => v.clone().sub(state.fit.center).multiplyScalar(state.fit.scale);

/* 物理原点。标记点的 pos 省略时用它（中心天体、转轴这类天然在原点）。
   只读 —— toWorld 内部会 clone，不会改到它。 */
const ORIGIN = new THREE.Vector3(0, 0, 0);

/* ============================ 相机 ============================ */

/* 取景余量。1.025 = 2.5% —— 内容铺满画幅，但不至于把箭头的边缘切掉。
   之前是 3% + 轴端各 6% 的 overhang，两样加起来白白吃掉一圈画幅。 */
const FIT_PAD = 1.025;

function applyCamera() {
  const { az, el, zoom } = state.view;
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;

  const W = stage.clientWidth, H = stage.clientHeight;
  const aspect = W / Math.max(H, 1);
  const b = state.bounds || { hx: 7, hy: 4, hz: 2, cx: 0, cy: 0, cz: 0 };

  // 正交基：r̂ 屏幕右、û 屏幕上、d̂ 指向相机
  const r = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
  const u = new THREE.Vector3(-Math.cos(a) * Math.sin(e), -Math.sin(a) * Math.sin(e), Math.cos(e));
  const dir = new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e));

  let halfR, halfU, c;
  const pts = boundsLock ? null : state.extentPts;

  if (pts && pts.length > 1) {
    /* 直接把每个取景点投到屏幕两轴上取极值 ——
       而不是投影它的 AABB。这个区别很大：
       一条斜着的抛物线，它的 AABB 是个方盒子，盒子的投影比线本身的投影宽一大截，
       按盒子取景就会在斜视角下空出一大圈。按点取景才是真的贴合。 */
    let minR = Infinity, maxR = -Infinity, minU = Infinity, maxU = -Infinity;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const p of pts) {
      const pr = p.x * r.x + p.y * r.y + p.z * r.z;
      const pu = p.x * u.x + p.y * u.y + p.z * u.z;
      if (pr < minR) minR = pr;
      if (pr > maxR) maxR = pr;
      if (pu < minU) minU = pu;
      if (pu > maxU) maxU = pu;
      if (p.x < minX) minX = p.x; else if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; else if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z; else if (p.z > maxZ) maxZ = p.z;
    }
    const midR = (minR + maxR) / 2, midU = (minU + maxU) / 2;
    halfR = Math.max(maxR - midR, midR - minR);
    halfU = Math.max(maxU - midU, midU - minU);
    // 相机目标：先把三维中心放在取景点的 AABB 中心，
    // 再沿 r̂ / û 平移到投影区间的中点 —— 内容就居中，不偏。
    c = new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
    c.addScaledVector(r, midR - c.dot(r)).addScaledVector(u, midU - c.dot(u));
  } else {
    // 对比组（boundsLock）或还没算过取景点时的退路：按 AABB 投影
    halfR = Math.abs(b.hx * r.x) + Math.abs(b.hy * r.y) + Math.abs(b.hz * r.z);
    halfU = Math.abs(b.hx * u.x) + Math.abs(b.hy * u.y) + Math.abs(b.hz * u.z);
    c = new THREE.Vector3(b.cx || 0, b.cy || 0, b.cz || 0);
  }

  c.add(camPan);   // 双指拖动累计的平移：加在取景中心之上，且随旋转一起保留

  const halfH = Math.max(halfU, halfR / aspect) * FIT_PAD / zoom;
  const halfW = halfH * aspect;
  camera.left = -halfW; camera.right = halfW;
  camera.top = halfH;   camera.bottom = -halfH;
  camera.updateProjectionMatrix();

  state.camTarget = c.clone();   // 场的可见范围据此反算，必须和相机保持一致
  camera.position.copy(dir).multiplyScalar(60).add(c);
  camera.up.copy(u);
  camera.lookAt(c);

  // 主光从相机左上方来，明暗关系在任何视角下都稳定
  keyLight.position.copy(c).addScaledVector(dir, 10).addScaledVector(u, 6).addScaledVector(r, -5);
  fillLight.position.copy(c).addScaledVector(dir, 10).addScaledVector(u, -5).addScaledVector(r, 6);
  // 天体高光光：从相机方向、但明显偏上照向中心天体（轨道模型里中心天体就在原点）。
  // 偏上（u 方向 22，相机距约 60）使明暗交界线落在可见盘面的中下处，而不是贴着边缘 ——
  // 这样球体明显"鼓"起来；光随相机走，所以无论怎么转视角受光面都朝向观众。
  bodyLight.position.copy(camera.position).addScaledVector(u, 22);

  setLineResolution(W, H);

  // 场与网格要跟着相机铺满画幅（这是"放大后磁场线不见了"的根治办法）
  buildDecor();
}

/* ---- 自研轨道控制（支持正交相机） ----
   顺带处理坐标轴原点的拖拽：抓中那个小球时拖动平移坐标轴，而不是旋转视角。
   两种意图共用左键，靠"有没有抓中手柄"来区分。 */
const raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();

function ndcOf(ev) {
  const r = canvas.getBoundingClientRect();
  return _ndc.set(
    ((ev.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1,
    -((ev.clientY - r.top) / Math.max(r.height, 1)) * 2 + 1,
  );
}

/* 用屏幕距离判定，而不是真去 raycast 那些小球 / 小方块：
   手柄在屏幕上只有十几像素宽，射线求交太容易脱靶；
   "离投影点够近就算抓住"才符合人的真实预期。
   坐标轴与网格是同一个刚体，两个手柄移动的是同一样东西。 */
const HANDLES = [
  { id: 'origin', r: 20, at: () => (state.axis ? state.axis.o : null) },
  { id: 'grid',   r: 20, at: () => state.gridGrip },
];
function hitHandle(ev) {
  if (!state.layers.axes || !state.axis) return null;
  const rect = canvas.getBoundingClientRect();
  for (const h of HANDLES) {
    const p = h.at();
    if (!p) continue;
    const q = p.clone().project(camera);
    const x = (q.x + 1) / 2 * rect.width, y = (1 - q.y) / 2 * rect.height;
    const dx = ev.clientX - rect.left - x, dy = ev.clientY - rect.top - y;
    if (dx * dx + dy * dy <= h.r * h.r) return h.id;
  }
  return null;
}

function rayOnPlane(ev, plane) {
  raycaster.setFromCamera(ndcOf(ev), camera);
  const out = new THREE.Vector3();
  return raycaster.ray.intersectPlane(plane, out) ? out : null;
}

let drag = null;      // 旋转视角
let axisDrag = null;  // 平移坐标轴
let panActive = false;            // 双指平移画面
let panLast = { x: 0, y: 0 };
const touchPts = new Map();       // 当前按下的触控点（pointerId → {x,y}）

function centroidOf(m) {
  let x = 0, y = 0, n = 0;
  for (const p of m.values()) { x += p.x; y += p.y; n++; }
  return { x: x / n, y: y / n };
}
/* 双指拖动 → 平移相机目标（移动画面）。
   屏幕位移在"屏幕右 r̂ / 屏幕上 û"两轴上投影成世界位移。
   手指右移 → 内容右移 → 相机目标左移（−r̂）；手指下移 → 内容下移 → 目标上移（+û）。 */
function panBy(dx, dy) {
  const { az, el } = state.view;
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  const r = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
  const u = new THREE.Vector3(-Math.cos(a) * Math.sin(e), -Math.sin(a) * Math.sin(e), Math.cos(e));
  const wpp = (camera.top - camera.bottom) / Math.max(stage.clientHeight, 1);
  camPan.addScaledVector(r, -dx * wpp).addScaledVector(u, dy * wpp);
  applyCamera();
}

canvas.addEventListener('pointerdown', ev => {
  try { canvas.setPointerCapture(ev.pointerId); } catch (_) {}
  if (ev.pointerType === 'touch') {
    touchPts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (touchPts.size >= 2) {       // 第二指落下 → 进入双指平移，取消旋转 / 坐标轴拖拽
      drag = null; axisDrag = null;
      panActive = true;
      panLast = centroidOf(touchPts);
      return;
    }
  }
  if (hitHandle(ev)) {
    // 在"过原点、垂直于视线"的平面上拖：屏幕位移和世界位移一一对应，
    // 手感跟直接拖一个平面物体完全一致。
    const n = new THREE.Vector3();
    camera.getWorldDirection(n);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, state.axis.o.clone());
    const start = rayOnPlane(ev, plane);
    if (start) {
      axisDrag = { plane, start, base: state.axisShift.clone() };
      canvas.style.cursor = 'grabbing';
      return;
    }
  }
  drag = { x: ev.clientX, y: ev.clientY };
});

canvas.addEventListener('pointermove', ev => {
  if (ev.pointerType === 'touch' && touchPts.has(ev.pointerId)) {
    touchPts.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  }
  if (panActive && touchPts.size >= 2) {
    const ctr = centroidOf(touchPts);
    panBy(ctr.x - panLast.x, ctr.y - panLast.y);
    panLast = ctr;
    return;
  }
  if (axisDrag) {
    const p = rayOnPlane(ev, axisDrag.plane);
    if (p) {
      // 只挪坐标架、不重算取景 —— 拖动中若重算包围盒，整个画面会跟着跑，根本对不准。
      // 但网格要跟着走（它和坐标轴是同一个刚体），所以这里补一次 buildDecor()。
      state.axisShift.copy(axisDrag.base).add(p.sub(axisDrag.start));
      state.axis = axisLayout(state.contentBox);
      buildAxes();
      buildDecor();
    }
    return;
  }
  if (drag) {
    const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    drag = { x: ev.clientX, y: ev.clientY };
    state.view.az -= dx * 0.42;
    state.view.el = Math.max(-89.9, Math.min(89.9, state.view.el + dy * 0.42));
    setViewButton(null);
    applyCamera();
    return;
  }
  canvas.style.cursor = hitHandle(ev) ? 'grab' : '';
});

function endDrag(ev) {
  drag = null;
  if (axisDrag) { axisDrag = null; canvas.style.cursor = ''; }
  try { canvas.releasePointerCapture(ev.pointerId); } catch (_) {}
}
canvas.addEventListener('pointerup', ev => {
  touchPts.delete(ev.pointerId);
  if (touchPts.size < 2) panActive = false;
  endDrag(ev);
});
canvas.addEventListener('pointercancel', ev => {
  touchPts.delete(ev.pointerId);
  if (touchPts.size < 2) panActive = false;
  endDrag(ev);
});
/* ---- 滚轮 / 触控板双指 ----
   用户要的"双指拖动整幅画面"在触屏上由 pointer 事件实现（见上），
   但**触控板**的双指滑动根本不发 pointer 事件，发的是 wheel ——
   于是帮助卡里写着"双指拖动 = 平移"，实际却在缩放。这里把它补上。

   触控板与鼠标滚轮只能靠特征区分（浏览器不给设备信息）：
     · 触控板双指滑动：高频、deltaY 很小（常带 deltaX），一次手势连发几十个事件
     · 鼠标滚轮：一格一跳，deltaY 约 100
   所以：小跳变 / 带横向分量 → 平移；大跳变 / 行模式 → 缩放。
   手势进行中沿用上一次的判断 —— 触控板快速划动时偶尔会蹦出一个大 delta，
   不粘住的话画面会突然缩放一下。
   再给两条明确的逃生通道：捏合（浏览器合成成 ctrl+wheel）与 Shift+滚轮 → 强制缩放。 */
let wheelMode = null, wheelLastT = 0;
canvas.addEventListener('wheel', ev => {
  ev.preventDefault();
  const now = performance.now();
  const gap = now - wheelLastT;
  wheelLastT = now;
  const dy = ev.deltaY;

  let mode;
  if (ev.ctrlKey || ev.shiftKey || ev.deltaMode !== 0) {
    mode = 'zoom';                                     // 捏合 / Shift 强制 / 行·页模式
  } else if (gap < 140 && wheelMode === 'pan' && Math.abs(dy) < 90) {
    mode = 'pan';                                      // 手势延续
  } else {
    mode = (Math.abs(ev.deltaX) > 0.5 || Math.abs(dy) < 60) ? 'pan' : 'zoom';
  }
  wheelMode = mode;

  if (mode === 'pan') {
    panBy(ev.deltaX, dy);                              // 内容跟着手指走
    return;
  }
  state.view.zoom = Math.max(0.35, Math.min(4, state.view.zoom * (dy > 0 ? 0.92 : 1.086)));
  applyCamera();
}, { passive: false });

/* ============================ 坐标轴布局 ============================ */

/* 坐标轴的几何布局。抽成独立函数，因为包围盒也要算上轴的端点 ——
   否则收紧取景余量之后，轴的末端会被切出画面。
   useShift = false 时忽略用户的拖拽平移，用于取景计算：
   否则把坐标轴拖到画面边上，相机就会跟着缩出去。 */
function axisLayout(box, useShift = true) {
  // 物理原点 (0,0,0) 经过 fit 变换后在渲染世界中的位置
  const o = state.fit.center.clone().multiplyScalar(-state.fit.scale);
  if (useShift) o.add(state.axisShift);
  const span = Math.max(
    box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z, 1e-6,
  );
  // 臂长跟内容自身的高度/纵深走，不要用最大跨度 ——
  // 标准摆线的宽高比是 3π ≈ 9.4，用跨度算出来的 y 轴会比轨迹高好几倍。
  const hgt = box.max.y - box.min.y;
  const dep = box.max.z - box.min.z;
  const arm = Math.min(Math.max(hgt, dep, span * 0.10) * 1.15, span * 0.5);
  const over = span * 0.06;
  return {
    o, arm, over,
    // x 轴贯穿内容；y、z 轴从原点向外伸
    ends: [
      new THREE.Vector3(box.min.x - over, o.y, o.z),
      new THREE.Vector3(box.max.x + over, o.y, o.z),
      new THREE.Vector3(o.x, o.y + arm, o.z),
      new THREE.Vector3(o.x, o.y, o.z + arm),
    ],
  };
}

function computeBounds(pts) {
  const box = new THREE.Box3().setFromPoints(pts);
  const size = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z, 1e-6);
  const pad = span * 0.03;      // 只留 3% 余量，画面才铺得满
  return {
    cx: c.x, cy: c.y, cz: c.z,
    hx: size.x / 2 + pad, hy: size.y / 2 + pad, hz: size.z / 2 + pad,
  };
}

/* 两个画幅取并集。
   对比组（cmp）用它：组内所有预设共用一个画幅，且这个画幅要装得下
   组里最大的那条轨迹 —— 否则大的那条会被裁掉，而裁切是看不见的谎言。 */
function unionBounds(a, b) {
  if (!a) return b;
  if (!b) return a;
  const minx = Math.min(a.cx - a.hx, b.cx - b.hx), maxx = Math.max(a.cx + a.hx, b.cx + b.hx);
  const miny = Math.min(a.cy - a.hy, b.cy - b.hy), maxy = Math.max(a.cy + a.hy, b.cy + b.hy);
  const minz = Math.min(a.cz - a.hz, b.cz - b.hz), maxz = Math.max(a.cz + a.hz, b.cz + b.hz);
  return {
    cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, cz: (minz + maxz) / 2,
    hx: (maxx - minx) / 2, hy: (maxy - miny) / 2, hz: (maxz - minz) / 2,
  };
}

/* ============================ 时间区间 ============================ */

function activeSpan() {
  const te = state.traj ? state.traj.tEnd : 0;
  if (!state.range.on) return [0, te];
  return [state.range.a * te, state.range.b * te];
}

function rangeIdx() {
  const a = state.range.on ? state.range.a : 0;
  const b = state.range.on ? state.range.b : 1;
  const i0 = Math.max(0, Math.min(N - 2, Math.round(a * (N - 1))));
  const i1 = Math.max(i0 + 1, Math.min(N - 1, Math.round(b * (N - 1))));
  return [i0, i1];
}

/* 重建三条轨迹线。
   区间开着时 trailGeom 只装区间内的点 —— 这样"已走过"才能从 A 起算。 */
function refreshLines() {
  if (!wpts.length) return;
  const C = state.theme.scene, lw = state.theme.lw;
  const [i0, i1] = rangeIdx();
  const seg = wpts.slice(i0, i1 + 1);

  trajLine.set(wpts);
  focusLine.set(seg);
  trailLine.set(state.range.on ? seg : wpts);

  // 区间模式下完整轨迹退成浅灰细线：保留上下文，但不跟选中段抢视线
  trajLine.color(state.range.on ? C.trajDim : C.traj);
  trajLine.width(state.range.on ? Math.max(lw.traj - 0.6, 1.4) : lw.traj);
  focusLine.color(C.focus);  focusLine.width(lw.focus);
  trailLine.color(C.trail);  trailLine.width(lw.trail);
  focusLine.setVisible(state.range.on);
}

function clampTime() {
  const [t0, t1] = activeSpan();
  state.t = Math.max(t0, Math.min(t1, state.t));
}

/* ============================ 构建 ============================ */

/* 取景依据 = 轨迹 ∪ 坐标轴端点 ∪ 矢量箭头尖端 ∪ 标记点 ∪ 线段 ∪ 参考线。
   把箭头尖端真正算进来，才能既保证箭头不被切出画面，
   又不用预留一大块永远用不上的死余量（那正是画面显得空的原因）。 */
function collectExtent() {
  const M = state.model, d = state.d, p = state.params;
  const ext = wpts.slice().concat(state.axisBase.ends);
  const stride = Math.max(1, Math.floor(N / 60));
  const c = ctx(null);
  for (let i = 0; i < N; i += stride) {
    const t = (state.traj.tEnd * i) / (N - 1);
    const s = M.sampleAt(t, p, d);
    c.t = t; c.s = s;
    const P = toWorld(s.pos);
    // 主粒子按物理半径渲染时（碰撞模型），球体本身也要算进取景 ——
    // 否则球会被画幅切掉一半，而"球被切掉"看起来像取景错了。
    if (s.headRadiusPhys != null && state.fit) {
      const rr = s.headRadiusPhys * state.fit.scale;
      ext.push(P.clone().add(new THREE.Vector3(rr, 0, 0)), P.clone().add(new THREE.Vector3(-rr, 0, 0)));
      ext.push(P.clone().add(new THREE.Vector3(0, rr, 0)), P.clone().add(new THREE.Vector3(0, -rr, 0)));
    }
    if (M.vectors) {
      for (const spec of M.vectors(s, c)) {
        const l = (spec.vec.length() / Math.max(spec.ref, EPS)) * ARROW_LEN;
        if (!(l > EPS)) continue;
        const A0 = spec.anchor ? toWorld(spec.anchor) : P;
        ext.push(A0.clone().addScaledVector(spec.vec.clone().normalize(), l + ARROW_LEN * 0.2));
      }
    }
    if (M.markers) {
      for (const mk of M.markers(s, c)) {
        const q = toWorld(mk.pos ?? ORIGIN);
        ext.push(q);
        // 真实半径的标记（中心天体）体积很大，必须把球体本身算进取景，
        // 否则地球会被画幅切掉一半
        if (mk.radiusPhys != null) {
          const rr = mk.radiusPhys * state.fit.scale;
          ext.push(q.clone().add(new THREE.Vector3(rr, 0, 0)), q.clone().add(new THREE.Vector3(-rr, 0, 0)));
          ext.push(q.clone().add(new THREE.Vector3(0, rr, 0)), q.clone().add(new THREE.Vector3(0, -rr, 0)));
          ext.push(q.clone().add(new THREE.Vector3(0, 0, rr)), q.clone().add(new THREE.Vector3(0, 0, -rr)));
        }
      }
    }
    if (M.segments) {
      for (const sg of M.segments(s, c)) for (const q of sg.pts) ext.push(toWorld(q));
    }
  }
  for (const g of guideSpecs) for (const q of g.pts) ext.push(toWorld(q));
  c.s = null; c.t = state.t;
  return ext;
}

/* 给"某个预设"算一次完整取景包围盒（轨迹 ∪ 箭头尖端 ∪ 坐标轴 ∪ 标记点），
   算完把全局状态原样还原。

   为什么要这么绕：对比组需要"全组所有成员装饰的并集"当画幅，
   而 collectExtent() 读的是全局 state。与其把 collectExtent 改成一个大参数列表，
   不如临时换一下 state 再换回来 —— 反正是启动/换预设时才算，不在每帧路径上。
   fit 必须一起换：toWorld() 依赖 state.fit。 */
function extentBoundsFor(params, fit) {
  const save = {
    params: state.params, d: state.d, traj: state.traj, fit: state.fit,
    axisBase: state.axisBase, contentBox: state.contentBox, wpts, guideSpecs,
  };
  try {
    const d = state.model.derive(params);
    const traj = state.model.buildTrajectory(params, d);
    const own = fitWorld(traj.pts);
    state.params = params;
    state.d = d;
    state.traj = traj;
    state.fit = fit ? { ...own, scale: fit.scale, center: fit.center } : own;
    wpts = traj.pts.map(toWorld);
    state.contentBox = new THREE.Box3().setFromPoints(wpts);
    state.axisBase = axisLayout(state.contentBox, false);
    // collectExtent 会把参考线的点也算进取景，所以这里也得换成这个预设的参考线。
    // 直接改 guideSpecs 而不调 buildGuides()，避免顺手动了场景里的线。
    guideSpecs = state.model.guides ? state.model.guides(ctx(null)) : [];
    return computeBounds(collectExtent());
  } finally {
    state.params = save.params; state.d = save.d; state.traj = save.traj;
    state.fit = save.fit; state.axisBase = save.axisBase;
    state.contentBox = save.contentBox; wpts = save.wpts;
    guideSpecs = save.guideSpecs;
  }
}

function rebuild(refit = false) {
  const M = state.model, p = state.params;
  state.d = M.derive(p);
  state.traj = M.buildTrajectory(p, state.d);
  state.ts = M.timeScale(p, state.d);

  const remap = () => state.traj.pts.map(toWorld);

  // 尺度锁定：换预设时才重新适配，改单个参数时保持比例不变。
  // 否则「B 加倍」这类预设会被归一化抹平 —— 学生看不到任何变化。
  const own = fitWorld(state.traj.pts);
  if (state.scaleOverride != null) {
    // 用对比组约定的尺度与中心，组内各预设才在同一把尺子下可比
    state.fit = {
      ...own,
      scale: state.scaleOverride,
      center: state.centerOverride || own.center,
    };
  } else if (refit || !state.fit) {
    state.fit = own;
  }
  wpts = remap();

  const b0 = new THREE.Box3().setFromPoints(wpts);
  const half = Math.max(
    Math.abs(b0.min.x), Math.abs(b0.max.x),
    Math.abs(b0.min.y), Math.abs(b0.max.y),
    Math.abs(b0.min.z), Math.abs(b0.max.z),
  );
  // 轨迹长到装不下了才重新适配。但对比组锁了尺度时绝不能重适配 ——
  // 那会把组内的大小关系抹平，这个预设就白做了。
  if (!refit && half > 8 && state.scaleOverride == null) {
    state.fit = fitWorld(state.traj.pts);
    wpts = remap();
    boundsLock = null;
  }

  state.contentBox = new THREE.Box3().setFromPoints(wpts);
  state.axis = axisLayout(state.contentBox);              // 含用户平移，用于绘制
  state.axisBase = axisLayout(state.contentBox, false);   // 不含平移，只用于取景

  buildGuides();
  buildFields();

  const extent = collectExtent();
  const cur = computeBounds(extent);
  // 取景用的那个盒子的原始包围盒（未加 pad），供调试句柄度量"画幅有没有浪费"
  state.extentBox = new THREE.Box3().setFromPoints(extent);
  // 取景点本身也留着：相机直接按这些点投影拟合，比投影它们的 AABB 紧得多
  state.extentPts = extent;
  // 对比组锁了画幅时，取"锁定画幅 ∪ 当前内容" ——
  // 这样既保持尺度真实（大小关系看得出来），又不会有东西被裁到画外。
  state.bounds = boundsLock ? unionBounds(boundsLock, cur) : cur;
  // 可见体要做厚一点，场线才不至于在斜视角下"薄薄一片"
  const bs = state.bounds;
  state.decorDepth = Math.max(bs.hz, Math.max(bs.hx, bs.hy) * 0.55);

  refreshLines();
  clampTime();
  buildAxes();
  buildProjection();
  updateStatic();
  buildDecor();
}

/* ============================ 场与网格 ============================ */

const M4 = new THREE.Matrix4();

/* 当前正交相机可见区域的 AABB（世界坐标） */
function visibleBox() {
  const { az, el } = state.view;
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  const r = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
  const u = new THREE.Vector3(-Math.cos(a) * Math.sin(e), -Math.sin(a) * Math.sin(e), Math.cos(e));
  const d = new THREE.Vector3(Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e));
  const c = state.camTarget || new THREE.Vector3(state.bounds.cx, state.bounds.cy, state.bounds.cz);
  const hw = camera.right, hh = camera.top, dep = state.decorDepth;
  const box = new THREE.Box3();
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    box.expandByPoint(new THREE.Vector3()
      .copy(c).addScaledVector(r, sx * hw).addScaledVector(u, sy * hh).addScaledVector(d, sz * dep));
  }
  return box;
}

const fieldPool = new Map();

function buildFields() {
  if (!state.traj) return;   // 同上：模型未初始化时钩子读不了 ctx.traj
  const specs = state.model.fields ? state.model.fields(ctx(null)) : [];
  const used = new Set();
  for (const f of specs) {
    used.add(f.key);
    let fl = fieldPool.get(f.key);
    if (!fl) { fl = new UniformField(scene, f.color); fieldPool.set(f.key, fl); }
    fl.color(f.color);
    fl._spec = f;
  }
  for (const [k, fl] of fieldPool) if (!used.has(k)) { fl.clear(); fl.setVisible(false); }
  fieldSpecs = specs;
}

function buildDecor() {
  if (!state.bounds || !state.contentBox) return;
  const vb = visibleBox();
  const W = stage.clientWidth, H = stage.clientHeight;
  const wpp = (camera.top - camera.bottom) / Math.max(H, 1);   // 世界单位 / 像素
  const px = (n) => n * wpp;
  const cb = state.contentBox;

  // ---------- 场线 ----------
  const fkeys = new Set();
  for (const f of fieldSpecs) {
    const fl = fieldPool.get(f.key);
    const on = state.layers[f.layer] !== false;
    fl.setVisible(on);
    if (!on) { fl.clear(); continue; }
    fl.fill({
      box: vb, dir: f.dir, px,
      spacing: f.spacing ?? 152, thick: f.thick ?? 0.85,
      head: f.head ?? 2.3, headL: f.headL ?? 8,
    });
    if (f.label) {
      const lb = labelFor('field-' + f.key, f.label, hexStr(f.color));
      lb.on = true;
      lb.pos.set((vb.min.x + vb.max.x) / 2, vb.max.y - px(16), vb.max.z - px(10));
      fkeys.add('field-' + f.key);
    }
  }
  for (const k of labelPool.keys()) {
    if (k.startsWith('field-') && !fkeys.has(k)) labelPool.get(k).on = false;
  }

  // ---------- 参考网格：贴在内容背后的竖直面，给 3D 一个空间参照 ----------
  // 网格与坐标轴是**同一个刚体**（"坐标架"），拖动时一起走 ——
  // 所以栅格线也要按 axisShift 平移，否则拖完网格就和坐标原点错位了。
  const sh = state.axisShift;
  const sp = px(58);
  const zp = cb.min.z - px(2) + sh.z;
  state.gridZ = zp;
  if (state.layers.axes) {
    const g = [];
    const gx = sh.x, gy = sh.y;
    for (let x = Math.ceil((vb.min.x - gx) / sp) * sp + gx; x <= vb.max.x; x += sp)
      g.push(x, vb.min.y, zp, x, vb.max.y, zp);
    for (let y = Math.ceil((vb.min.y - gy) / sp) * sp + gy; y <= vb.max.y; y += sp)
      g.push(vb.min.x, y, zp, vb.max.x, y, zp);
    gridLine.set(g);
  }
  gridLine.setVisible(state.layers.axes !== false);

  // ---------- 网格抓手 ----------
  // 坐在网格面上、离原点一个斜角的位置：老师可以直接抓网格拖动。
  // 位置由坐标架的 arm 推出来，所以缩放 / 换模型都不会跑丢。
  if (state.axis) {
    const arm = state.axis.arm;
    state.gridGrip.set(state.axis.o.x - arm * 0.8, state.axis.o.y - arm * 0.8, zp);
  }
  gridGrip.visible = state.layers.axes !== false;
}

/* 坐标轴画在真实物理原点上（t = 0 时粒子所在处），而不是包围盒的角上。
   原点可被拖走；一旦拖走，标签就从 O 变成 O′，
   提醒学生"这不是物理原点了"，免得读坐标时被误导。 */
function buildAxes() {
  const { o, arm, ends } = state.axis;
  axesLine.set([
    ends[0].x, o.y, o.z, ends[1].x, o.y, o.z,   // x 轴
    o.x, o.y, o.z, o.x, o.y + arm, o.z,         // y 轴
    o.x, o.y, o.z, o.x, o.y, o.z + arm,         // z 轴
  ]);
  originHandle.position.copy(o);

  // 轴标签往外挪一点，挪动量跟内容尺度成比例
  const off = state.bounds.hx * 0.055;
  L.x.pos.set(ends[1].x + off, o.y, o.z);
  L.y.pos.set(o.x, o.y + arm + off, o.z);
  L.z.pos.set(o.x, o.y, o.z + arm + off);

  const shifted = state.axisShift.lengthSq() > 1e-18;
  if (shifted !== L.O._shifted) {
    L.O._shifted = shifted;
    L.O.el.innerHTML = L.O.text = shifted ? 'O′' : 'O';
  }
  L.O.pos.set(o.x - off * 1.1, o.y - off * 1.1, o.z);
}

function buildProjection() {
  const box = new THREE.Box3().setFromPoints(wpts);
  const size = box.getSize(new THREE.Vector3());
  const off = Math.max(size.x, size.y, size.z) * 0.035;
  const planeZ = box.min.z - off;
  const planeY = box.min.y - off;
  const pts = [];
  const step = Math.max(1, Math.floor(wpts.length / 420));
  for (let i = 0; i < wpts.length - step; i += step) {
    const a = wpts[i], b = wpts[i + step];
    pts.push(a.x, a.y, planeZ, b.x, b.y, planeZ);              // xy 平面
    pts.push(a.x, planeY, a.z, b.x, planeY, b.z);              // xz 平面
  }
  projLine.set(pts);
}

/* ============================ 参考线 / 线段 ============================ */

const guidePool = new Map();

function buildGuides() {
  // 模型还没初始化（state.traj 还是 null）时不能问模型要参考线 ——
  // 模型钩子普遍要读 ctx.traj.tEnd，会直接抛。
  // 这个空态真的会走到：启动时先 applyTheme 再 switchModel。
  if (!state.traj) return;
  const specs = state.model.guides ? state.model.guides(ctx(null)) : [];
  const used = new Set();
  for (const g of specs) {
    used.add(g.key);
    let l = guidePool.get(g.key);
    if (!l) { l = new FatLine(g.color, g.width ?? 2); scene.add(l.obj); guidePool.set(g.key, l); }
    l.set(g.pts.map(toWorld));
    l.color(g.color);
    l.width(g.width ?? state.theme.lw.guide);
  }
  for (const [k, l] of guidePool) if (!used.has(k)) l.setVisible(false);
  guideSpecs = specs;
}

const segPool = new Map();

function syncSegs(specs) {
  const used = new Set();
  for (const g of specs) {
    used.add(g.key);
    let l = segPool.get(g.key);
    if (!l) { l = new ThinPath(g.color, { dashed: !!g.dashed }); scene.add(l.obj); segPool.set(g.key, l); }
    l.color(g.color);
    l.set(g.pts.map(toWorld));
    if (g.layer && state.layers[g.layer] === false) l.setVisible(false);
  }
  for (const [k, l] of segPool) if (!used.has(k)) l.setVisible(false);
}

/* ============================ 静态显隐 ============================ */

function updateStatic() {
  trajLine.setVisible(state.layers.traj !== false);
  trailLine.setVisible(state.layers.trail !== false);
  focusLine.setVisible(state.range.on && state.layers.traj !== false);
  axesLine.setVisible(state.layers.axes !== false);
  projLine.setVisible(!!state.layers.proj);
  // originHandle 是裸 THREE.Mesh，.visible 是布尔属性 —— 这里必须用赋值
  originHandle.visible = state.layers.axes !== false;
  L.x.on = L.y.on = L.z.on = L.O.on = state.layers.axes !== false;
  for (const g of guideSpecs) {
    const l = guidePool.get(g.key);
    if (l) l.setVisible(state.layers[g.layer] !== false);
  }
  buildDecor();
}

/* ============================ 每帧 ============================ */

const arrowPool = new Map();
function arrowFor(spec) {
  let a = arrowPool.get(spec.key);
  if (!a) { a = new Arrow(scene, spec.color, spec.radius ?? 0.026); arrowPool.set(spec.key, a); }
  return a;
}

function updateDynamic() {
  const M = state.model, d = state.d;
  const s = M.sampleAt(state.t, state.params, d);
  const c = ctx(s);
  const P = toWorld(s.pos);

  // 粒子大小按"屏幕像素"恒定，不随场景尺度变化
  const wpp = (camera.top - camera.bottom) / Math.max(stage.clientHeight, 1);
  particle.position.copy(P);
  /* 主粒子半径，两种来源：
       headRadiusPhys —— 按**真实物理半径**画（碰撞模型）。球的半径必须与接触几何
                         用同一把尺子，否则"画面上相切"和"物理上相切"对不上，
                         就会出现球穿过球、或两球叠成一个。
       headScale      —— 按屏幕像素恒定大小（其它模型），不随场景尺度变。
     撞击形变（沿碰撞轴压扁）已彻底移除：球是刚体，压扁会让学生以为球被撞软了。 */
  const baseR = s.headRadiusPhys != null
    ? s.headRadiusPhys * state.fit.scale
    : (s.headScale != null ? s.headScale : 1) * 7.5 * wpp;
  particle.scale.setScalar(baseR);
  particle.material.color.setHex(s.headColor != null ? s.headColor : state.theme.scene.particle);
  originHandle.scale.setScalar(6.5 * wpp);
  gridGrip.position.copy(state.gridGrip);
  gridGrip.scale.setScalar(6.0 * wpp);

  // ---- 已走过部分 ----
  if (state.layers.trail !== false) {
    if (state.range.on) {
      // 区间模式下只画 A→t 这一段 —— 区间之外已经不属于"这一次讲解"
      const [i0, i1] = rangeIdx();
      const m = i1 - i0;
      const t0 = state.range.a * state.traj.tEnd;
      const t1 = state.range.b * state.traj.tEnd;
      const f = (state.t - t0) / Math.max(t1 - t0, EPS);
      trailLine.show(f * m);
    } else {
      trailLine.show((state.t / state.traj.tEnd) * (N - 1));
    }
  }

  // ---- 矢量 ----
  // anchor 让矢量可以挂在别的点上（简谐运动里 v、a 挂在振子上，而不是参考点上）
  const specs = M.vectors ? M.vectors(s, c) : [];
  const byKey = new Map();
  const used = new Set();
  let para = null;
  for (const spec of specs) {
    byKey.set(spec.key, spec);
    const A0 = spec.anchor ? toWorld(spec.anchor) : P;
    const a = arrowFor(spec);
    a.color(spec.color);
    const len = (spec.vec.length() / Math.max(spec.ref, EPS)) * ARROW_LEN;
    const ok = state.layers[spec.layer] !== false && a.set(A0, spec.vec, len);
    const lb = labelFor(spec.key, spec.label, hexStr(spec.color));
    if (ok) {
      lb.on = true;
      lb.pos.copy(A0).addScaledVector(spec.vec.clone().normalize(), len + ARROW_LEN * 0.17);
      used.add(spec.key);
    } else lb.on = false;
    if (spec.parallelogram) para = spec;
  }
  for (const [k, a] of arrowPool) if (!used.has(k)) { a.hide(); hideLabels([k]); }

  // ---- 速度平行四边形虚线：两条分矢量尖端 → 合矢量尖端 ----
  // 防御：模型声明 parallelogram.tip / legs 时如果 key 打错字，
  // 这里绝不能整个崩掉 —— 那会表现为"画面全空 + 一行 TypeError"。
  // 取不到就静默跳过虚线，只把问题记到 console。
  // 注意 tip 挂在 para.parallelogram 下面，不是 para 自己身上。
  const tipKey = para ? para.parallelogram.tip : null;
  const diag = tipKey ? byKey.get(tipKey) : null;
  if (para && !diag) {
    console.warn(`[physviz] ${M.id}: 矢量 '${tipKey}' 不在 vectors() 返回的列表里，` +
      `平行四边形虚线已跳过。现有 key: ${[...byKey.keys()].join(', ')}`);
  }
  if (diag) {
    const base = diag.anchor ? toWorld(diag.anchor) : P;
    const dlen = (diag.vec.length() / Math.max(diag.ref, EPS)) * ARROW_LEN;
    const tip = base.clone().addScaledVector(diag.vec.clone().normalize(), dlen);
    const arr = [];
    for (const legKey of para.parallelogram.legs) {
      const leg = byKey.get(legKey);
      if (!leg) continue;
      const llen = (leg.vec.length() / Math.max(leg.ref, EPS)) * ARROW_LEN;
      if (!(llen > EPS)) continue;
      const lBase = leg.anchor ? toWorld(leg.anchor) : P;
      const lt = lBase.clone().addScaledVector(leg.vec.clone().normalize(), llen);
      arr.push(lt.x, lt.y, lt.z, tip.x, tip.y, tip.z);
    }
    helperLine.set(arr);
    helperLine.color(state.theme.scene.aux);
    helperLine.setVisible(arr.length > 0 && state.layers[para.layer] !== false);
  } else {
    helperLine.setVisible(false);
  }

  // ---- 标记点 ----
  // radius 按屏幕像素给（不随缩放变），radiusPhys 按真实物理半径给
  // （中心天体那种必须跟场景一起缩放的用它）
  markers.hideAll();
  if (M.markers) {
    for (const mk of M.markers(s, c)) {
      if (mk.layer && state.layers[mk.layer] === false) continue;
      const rad = mk.radiusPhys != null
        ? mk.radiusPhys * state.fit.scale
        : (mk.radius ?? 7) * wpp;
      // pos 省略时按物理原点处理（中心天体、转轴这类天然就在原点）
      // 异向缩放（球体压扁）/ 半透明（撞击闪光）来自模型声明，原样透传
      markers.set(mk.key, toWorld(mk.pos ?? ORIGIN), mk.color ?? state.theme.scene.marker,
        rad, mk.depthTest !== false, mk.order ?? 0, { scaleVec: mk.scaleVec, opacity: mk.opacity, mat: mk.mat });
    }
  }

  // ---- 线段（绳、弹簧、矢径…） ----
  syncSegs(M.segments ? M.segments(s, c) : []);

  projectLabels();
  updateReadings(s, c);
  updateTimeInfo();
}

function projectLabels() {
  const W = stage.clientWidth, H = stage.clientHeight;
  for (const l of labels) {
    if (!l.on) { l.el.style.display = 'none'; continue; }
    const p = l.pos.clone().project(camera);
    const x = (p.x + 1) / 2 * W, y = (1 - p.y) / 2 * H;
    l.sx = x; l.sy = y;
    if (x < -60 || x > W + 60 || y < -30 || y > H + 30) { l.el.style.display = 'none'; continue; }
    l.el.style.display = '';
    l.el.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
  }
}

/* ============================ 读数 / 参数 / 图层 / 预设面板 ============================ */

const readingEls = {};
const paramEls = {};
let layerEls = [];

function buildReadingsPanel() {
  const box = document.getElementById('readings');
  box.innerHTML = '';
  for (const k of Object.keys(readingEls)) delete readingEls[k];
  for (const def of state.model.readings) {
    const row = document.createElement('div');
    row.className = 'reading' + (def.hi ? ' hi' : '') + (def.sep ? ' sep' : '');
    row.innerHTML = `<span class="k">${def.label}</span><span class="v">—</span>`;
    box.appendChild(row);
    readingEls[def.key] = row.querySelector('.v');
  }
}

function updateReadings(s, c) {
  const vals = state.model.readingsOf(s, c) || {};
  for (const [k, el] of Object.entries(readingEls)) {
    el.textContent = vals[k] ?? '—';
  }
}

/* ---------- 参数面板 ---------- */

function toSlider(def, v) {
  const { min, max, map } = def;
  if (map === 'log') return (Math.log(v / min) / Math.log(max / min)) * 1000;
  if (map === 'quad') return Math.sqrt((v - min) / (max - min)) * 1000;
  return ((v - min) / (max - min)) * 1000;
}
function fromSlider(def, u) {
  const { min, max, map, step } = def;
  let v;
  if (map === 'log') v = min * Math.pow(max / min, u / 1000);
  else if (map === 'quad') v = min + (max - min) * Math.pow(u / 1000, 2);
  else v = min + (max - min) * (u / 1000);
  if (step) v = Math.round(v / step) * step;
  return Math.min(max, Math.max(min, v));
}

function buildParamsPanel() {
  const box = document.getElementById('params');
  box.innerHTML = '';
  for (const k of Object.keys(paramEls)) delete paramEls[k];

  for (const def of state.model.params) {
    const wrap = document.createElement('div');
    wrap.className = 'param';

    if (def.type === 'select') {
      wrap.innerHTML = `<div class="param-head"><span class="param-label">${def.label}</span></div>
        <select>${def.options.map(o => `<option value="${o.v}">${o.t}</option>`).join('')}</select>`;
      const sel = wrap.querySelector('select');
      sel.value = state.params[def.key];
      sel.addEventListener('change', () => {
        state.params[def.key] = sel.value;
        rebuild();
        markCustom();
      });
      paramEls[def.key] = { refresh: () => { sel.value = state.params[def.key]; } };
    } else {
      wrap.innerHTML = `
        <div class="param-head">
          <span class="param-label">${def.label}${def.sym ? `<em>${def.sym}</em>` : ''}</span>
          <span class="param-val"><input type="number" step="any"><i>${def.unit || ''}</i></span>
        </div>
        <input type="range" min="0" max="1000" step="1">`;
      const num = wrap.querySelector('input[type=number]');
      const rng = wrap.querySelector('input[type=range]');

      const show = (v) => { num.value = def.digits === 0 ? String(Math.round(v)) : v.toPrecision(4); };
      const push = (v, fromRange) => {
        state.params[def.key] = v;
        if (!fromRange) rng.value = String(toSlider(def, v));
        show(v);
        rebuild();
        if (def.resetsTime) resetTime();
        markCustom();
      };
      rng.addEventListener('input', () => push(fromSlider(def, +rng.value), true));
      num.addEventListener('change', () => {
        let v = parseFloat(num.value);
        if (!isFinite(v)) v = def.min;
        push(clamp(v, def.min, def.max), false);
      });
      paramEls[def.key] = {
        refresh: () => {
          const v = state.params[def.key];
          rng.value = String(toSlider(def, v));
          show(v);
        },
      };
    }
    box.appendChild(wrap);
  }
}

/* ---------- 图层面板 ---------- */

function buildLayersPanel() {
  const box = document.getElementById('layers');
  box.innerHTML = '';
  layerEls = [];
  for (const def of state.model.layers) {
    const el = document.createElement('label');
    el.className = 'layer' + (state.layers[def.key] ? '' : ' off');
    el.innerHTML = `<input type="checkbox" ${state.layers[def.key] ? 'checked' : ''}><span>${def.label}</span>`;
    const cb = el.querySelector('input');
    cb.addEventListener('change', () => {
      state.layers[def.key] = cb.checked;
      el.classList.toggle('off', !cb.checked);
      updateStatic();
    });
    box.appendChild(el);
    layerEls.push({ def, el, cb });
  }
  const tip = document.createElement('div');
  tip.className = 'side-tip';
  tip.innerHTML = state.model.layerTip
    || '拖动画面里的<b>橙色小球</b>（坐标轴原点）可以挪开整套坐标轴，避免挡住轨迹。拖走之后原点标签会变成 <b>O′</b>。';
  box.after(tip);
}

/* 只把勾选框的勾选状态同步成 state.layers，不重建面板
   （buildLayersPanel 每次都会 box.after(tip)，重建会堆出多个提示块）。
   ?layers= 启动参数用它把 URL 里的图层状态刷到界面上。 */
function syncLayersPanel() {
  for (const { def, el, cb } of layerEls) {
    const on = state.layers[def.key] !== false;
    cb.checked = on;
    el.classList.toggle('off', !on);
  }
}

function toggleLayer(i) {
  const l = layerEls[i];
  if (!l) return;
  state.layers[l.def.key] = !state.layers[l.def.key];
  l.cb.checked = state.layers[l.def.key];
  l.el.classList.toggle('off', !state.layers[l.def.key]);
  updateStatic();
}

/* ---------- 预设 ---------- */

function buildPresetBar() {
  const box = document.getElementById('presets');
  box.innerHTML = '';
  state.model.presets.forEach((ps, i) => {
    const b = document.createElement('button');
    b.className = 'preset';
    b.textContent = ps.title;
    b.addEventListener('click', () => applyPreset(i));
    box.appendChild(b);
  });
}

function markCustom() {
  document.querySelectorAll('.preset').forEach(b => b.classList.remove('on'));
}

/* keepView = true 时保留当前相机，只换参数与画幅。
   点预设按钮、按 ←/→ 换例题都要用预设自带的视角（那正是例题的一部分），
   只有"复位参数""重跑一遍"这类操作才保留相机。 */
function applyPreset(i, keepView) {
  state.presetIdx = i;
  const ps = state.model.presets[i];
  state.params = { ...ps.params };
  for (const def of state.model.params) paramEls[def.key]?.refresh();

  // 换例题 = 换一套讲解：时间段选择和坐标轴平移都该回到默认
  state.range.on = false;
  state.range.a = 0.25; state.range.b = 0.75;
  state.axisShift.set(0, 0, 0);
  camPan.set(0, 0, 0);            // 换例题 = 换一套讲解，平移也回到默认

  boundsLock = null;
  state.scaleOverride = null;
  state.centerOverride = null;
  let locked = false;
  if (ps.cmp) {
    /* 对比组：组内所有预设共用**同一把尺子和同一个画幅**。
       尺度：把全组轨迹点放在一起做一次 fitWorld —— 得到的尺度能装下全组最大那条。
       于是组内最小的那条在画面上就是真的小，大小关系是可验证的。
       画幅：必须取"全组**所有成员**的完整取景包围盒"的并集，不能只锁轨迹。
       只锁轨迹的话，rebuild 里还要 union 上当前成员自己的箭头与坐标轴端点，
       而各成员箭头伸出的长度不同（同一个世界长度，落在大小不同的轨迹上），
       画幅就不一样了 —— 实测「v₀ 加倍」的半径只显示成 1.71 倍而不是 2 倍。
       把装饰也算进锁定画幅之后，unionBounds(boundsLock, cur) 对每个成员都是恒等的，
       画幅真正一致，2 倍就是 2 倍。 */
    const group = state.model.presets.filter(x => x.cmp === ps.cmp);
    const all = [];
    for (const g of group) {
      const gd = state.model.derive(g.params);
      const gt = state.model.buildTrajectory(g.params, gd);
      for (const q of gt.pts) all.push(q);
    }
    if (all.length) {
      const gf = fitWorld(all);
      state.scaleOverride = gf.scale;
      state.centerOverride = gf.center;
      let bl = null;
      for (const g of group) bl = unionBounds(bl, extentBoundsFor(g.params, gf));
      boundsLock = bl || computeBounds(all.map(q => q.clone().sub(gf.center).multiplyScalar(gf.scale)));
      locked = true;
    }
  }
  rebuild(!locked);
  resetTime();
  state.playing = true;
  document.getElementById('btn-play').textContent = '❚❚';
  document.querySelectorAll('.preset').forEach((b, j) => b.classList.toggle('on', j === i));
  updateHint();
  if (!keepView) {
    const key = ps.view || state.model.defaultView;
    const v = state.model.views[key] || state.model.views[state.model.defaultView];
    state.view = { az: v.az, el: v.el, zoom: 1 };
    setViewButton(key);
    applyCamera();
  }

  // 分屏对比：当前预设属于某个 cmp 组就搭一套"另一预设"的动态对象，否则拆掉
  if (state.cmpMode === 'split' && ps.cmp) buildPartnerRig();
  else teardownPartnerRig();
  syncCmpUI();
}

function updateHint() {
  const hint = document.getElementById('hint');
  if (!state.showHint) { hint.style.display = 'none'; return; }
  const ps = state.model.presets[state.presetIdx];
  const extra = state.model.hint ? state.model.hint(ctx(null)) : '';
  hint.style.display = '';
  hint.innerHTML = `<button class="x" title="收起">✕</button>
    <b>${ps.title}</b> · ${ps.note}<br>💡 ${ps.q}`
    + (extra ? `<br><span class="hint-fx">${extra}</span>` : '');
  hint.querySelector('.x').onclick = () => { state.showHint = false; updateHint(); };
}

/* ============================ 模型 / 主题切换 ============================ */

function switchModel(id, keepView) {
  const m = modelById(id);
  state.model = m;
  state.presetIdx = 0;
  state.fit = null;
  state.d = null;
  state.traj = null;
  state.range.on = false;
  state.axisShift.set(0, 0, 0);
  state.ink.strokes.length = 0;
  state.ink.mode = 'off';
  state.ink.live = null;
  boundsLock = null;
  state.scaleOverride = null;
  state.centerOverride = null;
  camPan.set(0, 0, 0);
  teardownPartnerRig();

  state.params = { ...m.presets[0].params };
  state.layers = {};
  for (const def of m.layers) state.layers[def.key] = def.on !== false;

  // 矢量箭头池按 key 复用，换模型时先把旧的收起来
  for (const a of arrowPool.values()) a.hide();
  markers.hideAll();

  buildParamsPanel();
  buildLayersPanel();
  buildReadingsPanel();
  buildPresetBar();
  buildViewButtons();
  buildModelSelect();
  inkRedraw();
  syncInkBar();

  applyPreset(0, keepView);
  // 默认速度：整条轨迹大约 5 秒走完，不管这个模型是纳秒级还是小时级
  resetSpeedToDefault();
  if (keepView) applyCamera();
}

/* 默认展示速度：整条轨迹约 10 秒走完（之前是 5 秒）。用户要求默认再慢一半。
   ⚠️ 具体算法在 physics.js 的 defaultSpeed()（纯函数，单测能断言）——
   这里只负责把它写回 UI。2026-09-14 的"电场偏转频闪"就是因为当初
   在这里对非周期模型用了 tEnd / secondsPerCycle，算出 1e-9 被 clamp
   抬到 0.02，于是每秒把 1e-8 s 的轨迹绕 200 万圈。 */
function resetSpeedToDefault() {
  state.speed = defaultSpeed(state.ts, state.traj.tEnd);
  speedRange.value = String(sliderFromSpeed(state.speed));
  updateSpeedText();
}

function applyTheme(id) {
  const th = themeById(id);
  state.theme = th;
  applyThemeCss(th);

  const C = th.scene, lw = th.lw;
  renderer.setClearColor(th.bg, 1);          // 3D 画布底色也跟着换
  trajLine.width(lw.traj);
  focusLine.width(lw.focus);
  trailLine.width(lw.trail);
  trailLine.color(C.trail);
  focusLine.color(C.focus);
  gridLine.color(C.grid);
  axesLine.color(C.axis);
  projLine.color(C.proj);
  particle.material.color.setHex(C.particle);
  originHandle.material.color.setHex(C.origin);
  markers.colorAll(C.marker);
  L.x.color = L.y.color = L.z.color = hexStr(C.axis);
  L.x.el.style.color = L.y.el.style.color = L.z.el.style.color = hexStr(C.axis);
  L.O.color = hexStr(C.origin);
  L.O.el.style.color = hexStr(C.origin);

  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('on', b.dataset.theme === id));

  // 参考线 / 场的颜色来自模型钩子，重跑一遍才会跟着换色
  buildGuides();
  buildFields();
  refreshLines();
  helperLine.color(state.theme.scene.aux);   // 速度平行四边形虚线也要跟着换色
  updateStatic();
}

/* ============================ 时间控制 ============================ */

const speedRange = document.getElementById('speed');
const speedTxt = document.getElementById('speed-txt');

function speedFromSlider(u) { return SPEED_MIN * Math.pow(SPEED_MAX / SPEED_MIN, u / 1000); }   // 0.02 → 6
function sliderFromSpeed(v) { return (Math.log(v / SPEED_MIN) / Math.log(SPEED_MAX / SPEED_MIN)) * 1000; }

/* 滑块读数。周期模型报「周期/秒」（老师要的是"一秒跑几个周期"）；
   非周期模型报「整条轨迹耗时」—— 报"倍速"是误导：电场偏转整条轨迹才 10 ns，
   说"0.02 倍速"没人能对上，而"全程 10 秒"一眼就懂。 */
function updateSpeedText() {
  const ts = state.ts;
  if (!ts) return;
  speedTxt.textContent = ts.cyclic
    ? `${state.speed.toFixed(2)} ${ts.primaryUnit}/秒`
    : `全程 ${(1 / Math.max(state.speed, EPS)).toFixed(1)} s`;
}

function resetTime() {
  state.t = state.range.on ? state.range.a * state.traj.tEnd : 0;
  state.playing = true;
  document.getElementById('btn-play').textContent = '❚❚';
  paintTimeline();
}

/* ---------- 时间轴：三个可拖柄（A / B / 当前时刻） ----------
   用 div 自绘而不是叠两个 <input type=range>：
   三个柄必须能各自独立命中，叠 range 会互相抢事件。 */
const tl = document.getElementById('tl');
const tlSel = document.getElementById('tl-sel');
const tlA = document.getElementById('tl-a');
const tlB = document.getElementById('tl-b');
const tlT = document.getElementById('tl-t');

function tlFrac(clientX) {
  const r = tl.getBoundingClientRect();
  return Math.max(0, Math.min(1, (clientX - r.left) / Math.max(r.width, 1)));
}

function paintTimeline() {
  if (!state.traj) return;
  tl.classList.toggle('on', state.range.on);
  tlSel.style.left = state.range.a * 100 + '%';
  tlSel.style.width = (state.range.b - state.range.a) * 100 + '%';
  tlA.style.left = state.range.a * 100 + '%';
  tlB.style.left = state.range.b * 100 + '%';
  tlT.style.left = clamp(state.t / state.traj.tEnd, 0, 1) * 100 + '%';
}

function setRange() {
  refreshLines();
  clampTime();
  syncRangeButton();
  paintTimeline();
}

function syncRangeButton() {
  document.getElementById('btn-range').classList.toggle('on', state.range.on);
}

function toggleRange(force) {
  state.range.on = force != null ? force : !state.range.on;
  setRange();
}

let tlDrag = null;
tl.addEventListener('pointerdown', ev => {
  tlDrag = (ev.target.dataset && ev.target.dataset.h) || 't';
  try { tl.setPointerCapture(ev.pointerId); } catch (_) {}
  tlApply(ev);
  ev.preventDefault();
});
tl.addEventListener('pointermove', ev => { if (tlDrag) tlApply(ev); });
function tlEnd(ev) {
  tlDrag = null;
  try { tl.releasePointerCapture(ev.pointerId); } catch (_) {}
}
tl.addEventListener('pointerup', tlEnd);
tl.addEventListener('pointercancel', tlEnd);

function tlApply(ev) {
  const f = tlFrac(ev.clientX);
  if (tlDrag === 'a') {
    state.range.a = Math.min(f, state.range.b - 0.02);
    state.range.on = true;
    setRange();
  } else if (tlDrag === 'b') {
    state.range.b = Math.max(f, state.range.a + 0.02);
    state.range.on = true;
    setRange();
  } else {
    // 拖动当前时刻就暂停 —— 老师要逐帧讲的时候，"自己还在跑"最碍事
    const [t0, t1] = activeSpan();
    state.t = clamp(f * state.traj.tEnd, t0, t1);
    state.playing = false;
    document.getElementById('btn-play').textContent = '▶';
    paintTimeline();
  }
}

speedRange.value = String(sliderFromSpeed(state.speed));
speedRange.addEventListener('input', () => {
  state.speed = speedFromSlider(+speedRange.value);
  updateSpeedText();
});

document.getElementById('btn-play').addEventListener('click', togglePlay);
function togglePlay() {
  state.playing = !state.playing;
  document.getElementById('btn-play').textContent = state.playing ? '❚❚' : '▶';
}
document.getElementById('btn-dir').addEventListener('click', () => {
  state.dir = -state.dir;
  const b = document.getElementById('btn-dir');
  b.textContent = state.dir === 1 ? '正向' : '倒放';
  b.classList.toggle('on', state.dir === -1);
});
document.getElementById('btn-reset').addEventListener('click', () => applyPreset(state.presetIdx, true));
document.getElementById('btn-fit').addEventListener('click', () => {
  rebuild(true);
  state.view.zoom = 1;
  camPan.set(0, 0, 0);   // 适应视图 = 重新填满，平移归零
  applyCamera();
});
document.getElementById('btn-range').addEventListener('click', () => toggleRange());

/* 时间轴信息：主时间单位由模型给，引擎不认识"周期"这两个字 */
function updateTimeInfo() {
  const ts = state.ts;
  const per = Math.max(ts.secondsPerCycle, EPS);
  let s = ts.cyclic
    ? `已过 <b>${(state.t / per).toFixed(2)}</b> 个${ts.primaryUnit} &nbsp;·&nbsp; 真实时间 ${fmtTime(state.t)}`
    : `真实时间 <b>${fmtTime(state.t)}</b>`;
  if (state.range.on) {
    const [t0, t1] = activeSpan();
    // 非周期模型没有"主时间单位"可数，per = 1 会把 1e-9 s 打成 "0.00" ——
    // 直接用 fmtTime 报真实时间（自动带 ns / μs 前缀）。
    s += ts.cyclic
      ? ` &nbsp;·&nbsp; 区间 <b>${(t0 / per).toFixed(2)}–${(t1 / per).toFixed(2)}</b> ${ts.label}`
      : ` &nbsp;·&nbsp; 区间 <b>${fmtTime(t0)}–${fmtTime(t1)}</b>`;
  }
  document.getElementById('tb-info').innerHTML = s;
  paintTimeline();
}

/* ============================ 视角按钮 ============================ */

function buildViewButtons() {
  const box = document.querySelector('.top-right');
  box.querySelectorAll('.vbtn[data-view]').forEach(b => b.remove());
  const anchor = document.getElementById('btn-ink');
  for (const [key, v] of Object.entries(state.model.views)) {
    const b = document.createElement('button');
    b.className = 'vbtn';
    b.dataset.view = key;
    b.textContent = v.label;
    b.addEventListener('click', () => {
      state.view = { az: v.az, el: v.el, zoom: 1 };
      setViewButton(key);
      applyCamera();
    });
    box.insertBefore(b, anchor);
  }
}

function setViewButton(key) {
  state.viewKey = key;
  document.querySelectorAll('.vbtn[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === key));
}

/* ============================ 标注层 ============================
   图形模式刻意做成屏幕空间（HUD），而不是锚进 3D 场景：
   老师在投影上圈重点时，心里想的是"画面这个位置"，不是"空间中那个点"。
   锚进 3D 的话，一转视角圈就变成一条线或者飘走，反而看不清。
   高亮模式则相反 —— 它标的就是轨迹本身，所以直接复用时间区间那套状态，
   和底部时间轴的 A / B 是同一份数据，两边永远同步。
   ============================================================ */

const inkCanvas = document.getElementById('ink');
const inkCtx = inkCanvas.getContext('2d');

// 批注色板：正红 / 正蓝 / 正黄 / 正绿 是"留给老师"的纯色 ——
// 模型线条一律不用这些纯色（见 theme.js 的配色哲学），于是老师在画面上
// 画的圈、线、箭头永远是全场最抢眼的。最后一支深墨色用于写文字说明。
const INK_COLORS = ['#e60012', '#0057ff', '#ffd400', '#00a651', '#1f2933'];
const INK_TOOLS = [
  { k: 'pen',     t: '自由' },
  { k: 'line',    t: '直线' },
  { k: 'arrow',   t: '箭头' },
  { k: 'rect',    t: '矩形' },
  { k: 'ellipse', t: '椭圆' },
];
const INK_W = 3.4;

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const inkModeBtns = {}, inkToolBtns = {}, inkColorBtns = {};

(function buildInkBar() {
  const modes = document.getElementById('ink-modes');
  for (const [k, t] of [['shape', '图形'], ['highlight', '高亮轨迹']]) {
    const b = document.createElement('button');
    b.className = 'ink-t'; b.textContent = t;
    b.onclick = () => setInkMode(k);
    modes.appendChild(b);
    inkModeBtns[k] = b;
  }
  const tools = document.getElementById('ink-tools');
  for (const t of INK_TOOLS) {
    const b = document.createElement('button');
    b.className = 'ink-t'; b.textContent = t.t;
    b.onclick = () => { state.ink.tool = t.k; syncInkBar(); };
    tools.appendChild(b);
    inkToolBtns[t.k] = b;
  }
  const colors = document.getElementById('ink-colors');
  for (const c of INK_COLORS) {
    const b = document.createElement('button');
    b.className = 'ink-sw'; b.style.background = c;
    b.onclick = () => { state.ink.color = c; syncInkBar(); };
    colors.appendChild(b);
    inkColorBtns[c] = b;
  }
})();

function syncInkBar() {
  const on = state.ink.mode !== 'off';
  const shape = state.ink.mode === 'shape';
  document.getElementById('btn-ink').classList.toggle('on', on);
  document.getElementById('inkbar').classList.toggle('on', on);
  // 退出标注后只要还有笔画，画布就继续显示 —— 讲完一圈不该让它凭空消失
  inkCanvas.classList.toggle('show', on || state.ink.strokes.length > 0);
  syncInkLive();
  // 高亮模式用不上画笔工具，把这两排藏起来，免得老师以为能画
  document.getElementById('ink-tools').style.display = shape ? '' : 'none';
  document.getElementById('ink-colors').style.display = shape ? '' : 'none';
  for (const [k, b] of Object.entries(inkModeBtns)) b.classList.toggle('on', state.ink.mode === k);
  for (const [k, b] of Object.entries(inkToolBtns)) b.classList.toggle('on', state.ink.tool === k);
  for (const [c, b] of Object.entries(inkColorBtns)) b.classList.toggle('on', state.ink.color === c);
}

/* 按住 Shift 时把指针事件让给底下的 WebGL 画布 ——
   标注模式下也要能转视角，否则老师得先退出标注才能换个角度看。 */
let shiftHeld = false;
function syncInkLive() {
  inkCanvas.classList.toggle('live', state.ink.mode !== 'off' && !shiftHeld);
}
window.addEventListener('keydown', e => { if (e.key === 'Shift') { shiftHeld = true; syncInkLive(); } });
window.addEventListener('keyup', e => { if (e.key === 'Shift') { shiftHeld = false; syncInkLive(); } });
window.addEventListener('blur', () => { shiftHeld = false; syncInkLive(); });

function setInkMode(m) {
  state.ink.mode = m;
  state.ink.live = null;
  syncInkBar();
}
document.getElementById('btn-ink').addEventListener('click',
  () => setInkMode(state.ink.mode === 'off' ? 'shape' : 'off'));
document.getElementById('ink-exit').addEventListener('click', () => setInkMode('off'));
document.getElementById('ink-undo').addEventListener('click', () => {
  state.ink.strokes.pop();
  inkRedraw(); syncInkBar();
});
document.getElementById('ink-clear').addEventListener('click', () => {
  state.ink.strokes.length = 0;
  inkRedraw(); syncInkBar();
});

function sizeInk() {
  const r = stage.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return;
  const dpr = Math.min(window.devicePixelRatio, 2);
  inkCanvas.width = Math.round(r.width * dpr);
  inkCanvas.height = Math.round(r.height * dpr);
  inkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  inkRedraw();
}

function inkArrow(g, a, b) {
  g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const hl = Math.max(10, g.lineWidth * 3.4);
  g.beginPath();
  g.moveTo(b.x, b.y);
  g.lineTo(b.x - hl * Math.cos(ang - 0.42), b.y - hl * Math.sin(ang - 0.42));
  g.lineTo(b.x - hl * Math.cos(ang + 0.42), b.y - hl * Math.sin(ang + 0.42));
  g.closePath();
  g.fillStyle = g.strokeStyle;
  g.fill();
}

function inkStroke(s) {
  const g = inkCtx, p = s.pts;
  if (!p || p.length < 2) return;
  g.save();
  g.strokeStyle = s.color;
  g.lineWidth = s.width;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (s.tool === 'pen') {
    g.beginPath();
    p.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)));
    g.stroke();
  } else {
    const a = p[0], b = p[p.length - 1];
    if (s.tool === 'line') {
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    } else if (s.tool === 'arrow') {
      inkArrow(g, a, b);
    } else if (s.tool === 'rect') {
      const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
      const w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
      g.fillStyle = hexA(s.color, 0.09);
      g.fillRect(x, y, w, h);
      g.strokeRect(x, y, w, h);
    } else if (s.tool === 'ellipse') {
      g.beginPath();
      g.ellipse((a.x + b.x) / 2, (a.y + b.y) / 2,
        Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2, 0, 0, Math.PI * 2);
      g.fillStyle = hexA(s.color, 0.09);
      g.fill();
      g.stroke();
    }
  }
  g.restore();
}

function inkRedraw() {
  inkCtx.clearRect(0, 0, inkCanvas.clientWidth, inkCanvas.clientHeight);
  for (const s of state.ink.strokes) inkStroke(s);
  if (state.ink.live) inkStroke(state.ink.live);
}

/* ---------- 高亮模式：沿轨迹刷一段 ---------- */
let hiCache = null, hiAnchor = null;

/* 把采样点一次性投影到屏幕。拖动过程中相机不动，
   所以按下时算一次就够 —— 每帧算一遍上千次投影会明显卡顿。 */
function buildHiCache() {
  const r = inkCanvas.getBoundingClientRect();
  const W = r.width, H = r.height;
  const arr = new Float32Array(wpts.length * 2);
  const v = new THREE.Vector3();
  for (let i = 0; i < wpts.length; i++) {
    v.copy(wpts[i]).project(camera);
    arr[i * 2] = (v.x + 1) / 2 * W;
    arr[i * 2 + 1] = (1 - v.y) / 2 * H;
  }
  return arr;
}

function hiPick(p) {
  if (!hiCache) return -1;
  let best = -1, bd = 30 * 30;
  for (let i = 0; i < wpts.length; i++) {
    const dx = hiCache[i * 2] - p.x, dy = hiCache[i * 2 + 1] - p.y;
    const d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

function hiApply(p) {
  const i = hiPick(p);
  if (i < 0) return;
  const f = i / (N - 1);
  if (hiAnchor == null) hiAnchor = f;
  const a = Math.min(hiAnchor, f), b = Math.max(hiAnchor, f);
  state.range.on = true;
  state.range.a = a;
  state.range.b = b;
  if (b - a < 0.012) {                        // 只点了一下：给个最小可讲宽度
    state.range.a = Math.max(0, a - 0.006);
    state.range.b = Math.min(1, state.range.a + 0.012);
  }
  // 粒子跟着手指走 —— 学生能立刻把"轨迹这一段"和"时间轴这一段"对上
  state.t = f * state.traj.tEnd;
  state.playing = false;
  document.getElementById('btn-play').textContent = '▶';
  setRange();
}

function inkPoint(ev) {
  const r = inkCanvas.getBoundingClientRect();
  return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}

inkCanvas.addEventListener('pointerdown', ev => {
  if (state.ink.mode === 'off' || ev.button !== 0) return;
  ev.preventDefault();
  try { inkCanvas.setPointerCapture(ev.pointerId); } catch (_) {}
  const p = inkPoint(ev);
  if (state.ink.mode === 'highlight') {
    hiCache = buildHiCache();
    hiAnchor = null;
    hiApply(p);
  } else {
    state.ink.live = { tool: state.ink.tool, color: state.ink.color, width: INK_W, pts: [p, p] };
    inkRedraw();
  }
});

inkCanvas.addEventListener('pointermove', ev => {
  if (state.ink.mode === 'off') return;
  const p = inkPoint(ev);
  if (state.ink.mode === 'highlight') {
    if (ev.buttons) hiApply(p);
    return;
  }
  const s = state.ink.live;
  if (!s) return;
  if (s.tool === 'pen') {
    const last = s.pts[s.pts.length - 1];
    if ((p.x - last.x) ** 2 + (p.y - last.y) ** 2 < 4) return;   // 抽稀，别让点数涨到几万
    s.pts.push(p);
  } else {
    s.pts[1] = p;
  }
  inkRedraw();
});

function inkEnd(ev) {
  const s = state.ink.live;
  if (s) {
    state.ink.live = null;
    // 只点了一下、没拖动：当误触丢掉，免得留下一个看不见的点
    const first = s.pts[0], last = s.pts[s.pts.length - 1];
    if ((last.x - first.x) ** 2 + (last.y - first.y) ** 2 > 16) state.ink.strokes.push(s);
    inkRedraw();
  }
  hiCache = null;
  try { inkCanvas.releasePointerCapture(ev.pointerId); } catch (_) {}
  syncInkBar();
}
inkCanvas.addEventListener('pointerup', inkEnd);
inkCanvas.addEventListener('pointercancel', inkEnd);

/* ---------- 存图：把这一帧连同标注导成 PNG ----------
   老师真正的下一步动作是"把这张图放进课件"，少了这个按钮，
   标注就只能在屏幕上存在几十秒。 */
document.getElementById('ink-save').addEventListener('click', () => {
  // 必须先同步渲染一帧：WebGL 缓冲区在合成后就被清空了，
  // 不立刻取，toDataURL 拿到的会是一张白图。
  renderer.render(scene, camera);
  const W = inkCanvas.clientWidth, H = inkCanvas.clientHeight;
  const dpr = Math.min(window.devicePixelRatio, 2);
  const out = document.createElement('canvas');
  out.width = Math.round(W * dpr);
  out.height = Math.round(H * dpr);
  const g = out.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = state.theme.css['--bg'];
  g.fillRect(0, 0, W, H);
  g.drawImage(renderer.domElement, 0, 0, W, H);
  g.drawImage(inkCanvas, 0, 0, W, H);

  // 文字标签是 HTML 叠加层，不在 WebGL 画布里 —— 拿投影坐标手工补画一遍
  g.font = '600 14px system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineWidth = 4;
  for (const l of labels) {
    if (!l.on || l.el.style.display === 'none') continue;
    g.strokeStyle = state.theme.css['--bg'];
    g.strokeText(l.text, l.sx, l.sy);
    g.fillStyle = l.color;
    g.fillText(l.text, l.sx, l.sy);
  }
  const a = document.createElement('a');
  a.download = `physviz-${state.model.id}-${state.model.presets[state.presetIdx].id}.png`;
  a.href = out.toDataURL('image/png');
  a.click();
});

sizeInk();
syncInkBar();

/* ============================ 模型 / 主题下拉 ============================ */

function buildModelSelect() {
  const sel = document.getElementById('model-sel');
  sel.innerHTML = MODELS.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  sel.value = state.model.id;
}

document.getElementById('model-sel').addEventListener('change', e => {
  switchModel(e.target.value);
  document.getElementById('model-tag').textContent = state.model.tagline;
});

(function buildThemeBar() {
  const box = document.getElementById('themes');
  for (const t of THEMES) {
    const b = document.createElement('button');
    b.className = 'theme-btn';
    b.dataset.theme = t.id;
    b.textContent = t.name;
    b.title = t.note;
    b.addEventListener('click', () => applyTheme(t.id));
    box.appendChild(b);
  }
})();

/* 对比演示方式：叠加（同尺度切换预设）/ 分屏（左右实时并排）。
   只有当前预设属于某个 cmp 组时才可点；否则置灰。 */
const cmpBox = document.getElementById('cmp');
const cmpSeg = document.getElementById('cmp-seg');
cmpSeg.addEventListener('click', e => {
  const b = e.target.closest('.seg-b');
  if (!b || cmpBox.classList.contains('off')) return;
  setCmpMode(b.dataset.m);
});
function syncCmpUI() {
  const on = !!(state.model.presets[state.presetIdx].cmp);
  cmpBox.classList.toggle('off', !on);
  cmpSeg.querySelectorAll('.seg-b').forEach(b => b.classList.toggle('on', b.dataset.m === state.cmpMode));
}
function setCmpMode(mode) {
  state.cmpMode = mode;
  syncCmpUI();
  if (mode === 'split' && state.model.presets[state.presetIdx].cmp) buildPartnerRig();
  else { teardownPartnerRig(); updateStatic(); }   // 退出分屏要把轴/网格/场显隐复原
  applyCamera();
}

/* ============================ 快捷键 ============================ */

const help = document.getElementById('help');
document.getElementById('btn-help').addEventListener('click', () => help.classList.add('on'));
document.getElementById('btn-help-close').addEventListener('click', () => help.classList.remove('on'));
help.addEventListener('click', e => { if (e.target === help) help.classList.remove('on'); });

/* 跳到第 n 个主时间单位的整数倍。
   非周期模型（平抛）没有"周期"这个概念，就用模型给的 jumpSeconds。 */
function jumpToUnit(n) {
  const step = state.ts.jumpSeconds || state.ts.secondsPerCycle;
  state.t = clamp(n * step, 0, state.traj.tEnd);
  state.playing = false;
  document.getElementById('btn-play').textContent = '▶';
  paintTimeline();
}

window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
    if (e.key === 'Escape') e.target.blur();
    return;
  }
  const step = state.traj.tEnd / 60;
  const n = parseInt(e.key, 10);

  // Shift + 1–9 → 开关图层（低频操作，让出数字键）
  if (e.shiftKey && n >= 1 && n <= 9) {
    e.preventDefault();
    toggleLayer(n - 1);
    return;
  }
  // 1–9 → 跳到第 N 个主时间单位（课堂高频："我们看第 3 个周期"）
  if (!e.shiftKey && n >= 1 && n <= 9) {
    e.preventDefault();
    jumpToUnit(n);
    return;
  }

  switch (e.key) {
    case ' ': e.preventDefault(); togglePlay(); break;
    case 'ArrowLeft':
      e.preventDefault();
      state.t = Math.max(activeSpan()[0], state.t - step);
      state.playing = false; document.getElementById('btn-play').textContent = '▶'; break;
    case 'ArrowRight':
      e.preventDefault();
      state.t = Math.min(activeSpan()[1], state.t + step);
      state.playing = false; document.getElementById('btn-play').textContent = '▶'; break;
    case 'ArrowUp': case 'PageUp':
      e.preventDefault(); applyPreset((state.presetIdx - 1 + state.model.presets.length) % state.model.presets.length); break;
    case 'ArrowDown': case 'PageDown':
      e.preventDefault(); applyPreset((state.presetIdx + 1) % state.model.presets.length); break;
    case 'r': case 'R': applyPreset(state.presetIdx, true); break;
    case 'x': case 'X': toggleRange(); break;
    case 'd': case 'D': setInkMode(state.ink.mode === 'off' ? 'shape' : 'off'); break;
    case 't': case 'T': {
      const i = THEMES.findIndex(t => t.id === state.theme.id);
      applyTheme(THEMES[(i + 1) % THEMES.length].id);
      break;
    }
    case 'm': case 'M': {
      const i = MODELS.findIndex(m => m.id === state.model.id);
      const next = MODELS[(i + 1) % MODELS.length];
      switchModel(next.id);
      document.getElementById('model-sel').value = next.id;
      document.getElementById('model-tag').textContent = next.tagline;
      break;
    }
    case 'v': case 'V': {
      const keys = Object.keys(state.model.views);
      const cur = keys.findIndex(k => document.querySelector(`.vbtn[data-view="${k}"]`)?.classList.contains('on'));
      const nxt = keys[(cur + 1) % keys.length];
      const v = state.model.views[nxt];
      state.view = { az: v.az, el: v.el, zoom: 1 };
      setViewButton(nxt); applyCamera();
      break;
    }
    case 'f': case 'F':
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
      break;
    case 'Escape': help.classList.remove('on'); break;
    default: break;
  }
});

/* ============================ 分屏对比 ============================ */

/* 物理坐标 → 世界坐标，但用指定的 fit（对比预设用自己那把尺子，
   而不是当前预设的 state.fit —— 否则另一预设的轨迹会被错放到当前中心）。 */
function toWorldP(q, fit) { return q.clone().sub(fit.center).multiplyScalar(fit.scale); }

function buildPartnerRig() {
  teardownPartnerRig();
  const ps = state.model.presets[state.presetIdx];
  if (!ps.cmp) return;
  const group = state.model.presets.filter(x => x.cmp === ps.cmp);
  if (group.length < 2) return;
  const idx = group.findIndex(x => x.id === ps.id);
  const partner = group[(idx + 1) % group.length];
  const d = state.model.derive(partner.params);
  const traj = state.model.buildTrajectory(partner.params, d);
  const pf = fitWorld(traj.pts);
  // 和当前预设共用同一把锁定的尺子（scaleOverride），大小关系才可比
  const fit = {
    ...pf,
    scale: state.scaleOverride != null ? state.scaleOverride : pf.scale,
    center: state.centerOverride || pf.center,
  };
  const wpts = traj.pts.map(q => q.clone().sub(fit.center).multiplyScalar(fit.scale));
  const C = state.theme.scene, lw = state.theme.lw;
  const line = new FatLine(C.traj, lw.traj);
  const trail = new FatLine(C.trail, lw.trail);
  scene.add(line.obj, trail.obj);
  line.set(wpts); trail.set(wpts);
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 16),
    new THREE.MeshLambertMaterial({ color: C.particle, depthTest: false }),
  );
  particle.renderOrder = 999; scene.add(particle);
  const markers = new MarkerSet(scene);
  cmpPartner = { params: partner.params, d, wpts, fit, line, trail, particle, markers, model: state.model };
}

function teardownPartnerRig() {
  if (!cmpPartner) return;
  scene.remove(cmpPartner.line.obj, cmpPartner.trail.obj, cmpPartner.particle);
  cmpPartner.line.obj.geometry.dispose();
  cmpPartner.trail.obj.geometry.dispose();
  cmpPartner.particle.geometry.dispose();
  cmpPartner.particle.material.dispose();
  for (const m of cmpPartner.markers.map.values()) { scene.remove(m); m.material.dispose(); }
  cmpPartner = null;
}

/* 每帧更新"另一预设"的粒子与标记（轨迹线只在换预设时建一次）。 */
function updatePartner() {
  if (!cmpPartner) return;
  const { params, d, fit, model, particle, markers } = cmpPartner;
  const s = model.sampleAt(state.t, params, d);
  const wpp = (camera.top - camera.bottom) / Math.max(stage.clientHeight, 1);
  particle.position.copy(toWorldP(s.pos, fit));
  const hs = (s.headScale != null ? s.headScale : 1);
  particle.scale.setScalar(s.headRadiusPhys != null ? s.headRadiusPhys * fit.scale : hs * 7.5 * wpp);
  particle.material.color.setHex(s.headColor != null ? s.headColor : state.theme.scene.particle);
  markers.hideAll();
  if (model.markers) {
    const c2 = { t: state.t, p: params, d, C: state.theme.scene, lw: state.theme.lw, N, EPS, s };
    for (const mk of model.markers(s, c2)) {
      if (mk.layer && state.layers[mk.layer] === false) continue;
      const rad = mk.radiusPhys != null ? mk.radiusPhys * fit.scale : (mk.radius ?? 7) * wpp;
      const wp = mk.pos != null ? toWorldP(mk.pos, fit) : toWorldP(ORIGIN, fit);
      markers.set(mk.key, wp, mk.color ?? state.theme.scene.marker, rad,
        mk.depthTest !== false, mk.order ?? 0, { scaleVec: mk.scaleVec, opacity: mk.opacity, mat: mk.mat });
    }
  }
}

/* 分屏时切换左（当前）/ 右（对比）的显隐。全局装饰两侧都隐藏，只比轨迹本身。
   ⚠️ 这里原先写反了（v 为真时隐藏、v 为假时不管），于是进过一次分屏模式之后，
   主视图的坐标轴、网格与手柄就再也不出现了 —— 而"网格能拖动"正是靠这两个手柄。 */
function setSplitMain(v) {
  trajLine.setVisible(v && state.layers.traj !== false);
  trailLine.setVisible(v && state.layers.trail !== false);
  focusLine.setVisible(v && state.range.on && state.layers.traj !== false);
  particle.visible = v;
  helperLine.setVisible(v);
  for (const a of arrowPool.values()) if (!v) a.hide();
  for (const [, l] of segPool) if (!v) l.setVisible(false);
  if (!v) {
    markers.hideAll();
    gridLine.setVisible(false); axesLine.setVisible(false); projLine.setVisible(false);
    originHandle.visible = false; gridGrip.visible = false;
    L.x.on = L.y.on = L.z.on = L.O.on = false;
    for (const [, fl] of fieldPool) fl.setVisible(false);
  } else {
    // 复原：显隐交回给图层开关
    gridLine.setVisible(state.layers.axes !== false);
    axesLine.setVisible(state.layers.axes !== false);
    projLine.setVisible(!!state.layers.proj);
    originHandle.visible = state.layers.axes !== false;
    gridGrip.visible = state.layers.axes !== false;
    L.x.on = L.y.on = L.z.on = L.O.on = state.layers.axes !== false;
    for (const [, fl] of fieldPool) {
      fl.setVisible(!fl._spec || state.layers[fl._spec.layer] !== false);
    }
  }
}
function setSplitPartner(v) {
  if (!cmpPartner) return;
  cmpPartner.line.setVisible(v && state.layers.traj !== false);
  cmpPartner.trail.setVisible(v && state.layers.trail !== false);
  cmpPartner.particle.visible = v;
  if (!v) cmpPartner.markers.hideAll();
}

function renderFrame() {
  if (state.cmpMode === 'split' && cmpPartner) {
    const W = stage.clientWidth, H = stage.clientHeight;
    const half = Math.floor(W / 2);
    renderer.setScissorTest(true);
    setSplitMain(true); setSplitPartner(false);
    renderer.setViewport(0, 0, half, H); renderer.setScissor(0, 0, half, H);
    renderer.render(scene, camera);
    setSplitMain(false); setSplitPartner(true);
    renderer.setViewport(half, 0, W - half, H); renderer.setScissor(half, 0, W - half, H);
    renderer.render(scene, camera);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
    setSplitMain(true); setSplitPartner(false);   // 复原，供下一帧 / 截图
    labelLayer.style.display = 'none';
  } else {
    renderer.render(scene, camera);
    labelLayer.style.display = '';
  }
}

/* ============================ 尺寸与主循环 ============================ */

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (w === 0 || h === 0) return;
  renderer.setSize(w, h, false);
  applyCamera();
  sizeInk();
}
new ResizeObserver(resize).observe(stage);
window.addEventListener('resize', resize);

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (state.playing && state.traj) {
    // 循环在 [t0, t1] 上做 —— 区间模式开着时，t0 / t1 就是选中的 A / B
    const [t0, t1] = activeSpan();
    const span = Math.max(t1 - t0, EPS);
    /* 步长（每 1 单位 state.speed 对应多少物理秒）由 strideSeconds 给：
       周期模型 —— 一个周期；非周期模型 —— 整条轨迹 tEnd。
       ⚠️ 非周期模型不能拿 secondsPerCycle（恒为 1）当步长，
       否则 tEnd 远小于 1 秒的模型（电场偏转 1e-8 s）每帧绕几百万圈 → 频闪。 */
    const stride = strideSeconds(state.ts, state.traj.tEnd);
    state.t += dt * state.speed * stride * state.dir;
    if (state.t > t1) state.t = t0 + ((state.t - t0) % span);
    if (state.t < t0) state.t = t1 - ((t1 - state.t) % span);
  }

  updateDynamic();
  if (state.cmpMode === 'split' && cmpPartner) updatePartner();
  renderFrame();
  requestAnimationFrame(loop);
}

/* ============================ 启动 ============================ */

const qs = new URLSearchParams(location.search);

// 主题
const wantedTheme = qs.get('theme');
if (wantedTheme) applyTheme(wantedTheme);

// 对比演示方式：?cmp=split 直接以左右分屏启动（链接可携带整套状态进教室）
const wantedCmp = qs.get('cmp');
if (wantedCmp === 'split' || wantedCmp === 'overlay') state.cmpMode = wantedCmp;

// 模型：?model=<id>，默认第一个
const wantedModel = qs.get('model');
const startModel = wantedModel ? modelById(wantedModel) : MODELS[0];
// keepView = false：让默认预设自带的视角生效。
// 例题的"该从哪个角度看"本身就是讲解内容的一部分
// （三维螺旋摆线用俯视看就是一坨平面曲线，必须用等轴视角）。
switchModel(startModel.id, false);

// 预设：?preset=<id>，在模型内部找
const wantedPreset = qs.get('preset');
if (wantedPreset) {
  const i = state.model.presets.findIndex(ps => ps.id === wantedPreset);
  if (i >= 0) applyPreset(i, false);
}

// 视角：?view=<key>
const wantedView = qs.get('view');
if (wantedView && state.model.views[wantedView]) {
  const v = state.model.views[wantedView];
  state.view = { az: v.az, el: v.el, zoom: 1 };
  setViewButton(wantedView);
}

// 图层：?layers=force,radius 打开指定图层（逗号分隔），前缀 - 关闭。
// 例：?layers=force,radius,-proj → 开万有引力 F 与矢径、关投影。
// 老师把"要讲的那张图"连图层开关一起分享出去，进教室打开就是同一个画面。
const wantedLayers = qs.get('layers');
if (wantedLayers) {
  for (const raw of wantedLayers.split(',')) {
    const t = raw.trim();
    if (!t) continue;
    const off = t.startsWith('-');
    const key = off ? t.slice(1) : t;
    if (key in state.layers) state.layers[key] = !off;
  }
  syncLayersPanel();
  updateStatic();
}

// ?range=0.25,0.75 直接把时间段框好；?ink=shape|highlight 直接进标注模式。
// 这样一条链接就能带着"模型 + 预设 + 视角 + 框选 + 标注 + 主题"整套状态进教室。
const wantedRange = qs.get('range');
if (wantedRange) {
  const [a, b] = wantedRange.split(',').map(Number);
  if (isFinite(a) && isFinite(b)) {
    state.range.on = true;
    state.range.a = clamp(a, 0, 1);
    state.range.b = Math.max(state.range.a + 0.01, Math.min(1, b));
    setRange();
  }
}
const wantedInk = qs.get('ink');
if (wantedInk === 'shape' || wantedInk === 'highlight') setInkMode(wantedInk);

// ?t=0.5 把时刻定在轨迹的 50% 处，?pause=1 停住。
// 这两个参数让"截图"和"分享某个瞬间"都变成可复现的 ——
// 否则自动播放会让同一张链接每次打开都停在不同位置。
const wantedT = qs.get('t');
if (wantedT != null && state.traj) {
  const f = clamp(parseFloat(wantedT), 0, 1);
  if (isFinite(f)) state.t = f * state.traj.tEnd;
}
if (qs.get('pause') === '1') {
  state.playing = false;
  document.getElementById('btn-play').textContent = '▶';
}

document.getElementById('model-tag').textContent = state.model.tagline;

/* 只读调试句柄。
   用途一：无头截图脚本可以把它读出来，自动检查"内容占画幅的比例"，
   不用靠肉眼看图猜取景对不对（取景是回归最容易坏、又最难肉眼发现的地方）。
   用途二：课堂上想在控制台里试参数，不用改代码。
   只暴露读接口和几个动作，不暴露可变内部状态。 */
window.physviz = {
  get modelId() { return state.model.id; },
  get presetId() { return state.model.presets[state.presetIdx].id; },
  get view() { return { ...state.view, key: state.viewKey }; },
  get bounds() { return state.bounds ? { ...state.bounds } : null; },
  get contentBox() {
    const b = state.contentBox;
    return b ? { min: b.min.toArray(), max: b.max.toArray() } : null;
  },
  get fit() { return state.fit ? { scale: state.fit.scale, center: state.fit.center.toArray() } : null; },
  get trajCount() { return state.traj ? state.traj.pts.length : 0; },
  /* 当前轨迹本身在画幅里占的比例（不是取景依据，就是轨迹）。
     对比组要靠它验证"大小关系是真的"：
     组内两个成员的这个比值，应该等于它们物理尺寸的比值。
     —— 早先只锁了轨迹尺度、没锁装饰，画幅被各成员自己的箭头撑得不一样，
     实测「v₀ 加倍」的半径只显示成 1.71 倍。有了这个数字就能自动盯住。 */
  trajSpan() {
    if (!wpts.length) return null;
    const a = state.view.az * Math.PI / 180, e = state.view.el * Math.PI / 180;
    const r = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    const u = new THREE.Vector3(-Math.cos(a) * Math.sin(e), -Math.sin(a) * Math.sin(e), Math.cos(e));
    let minR = Infinity, maxR = -Infinity, minU = Infinity, maxU = -Infinity;
    for (const p of wpts) {
      const pr = p.x * r.x + p.y * r.y + p.z * r.z;
      const pu = p.x * u.x + p.y * u.y + p.z * u.z;
      if (pr < minR) minR = pr;
      if (pr > maxR) maxR = pr;
      if (pu < minU) minU = pu;
      if (pu > maxU) maxU = pu;
    }
    const haveW = camera.right - camera.left, haveH = camera.top - camera.bottom;
    return { w: (maxR - minR) / haveW, h: (maxU - minU) / haveH };
  },
  get camera() {
    return { left: camera.left, right: camera.right, top: camera.top, bottom: camera.bottom,
      position: camera.position.toArray(), target: state.camTarget ? state.camTarget.toArray() : null };
  },
  /* 内容在屏幕上占画幅的比例。接近 1 = 铺满；太小说明取景把画布拉太大了。
     量的对象是"取景所依据的那个包围盒"（轨迹 ∪ 箭头尖端 ∪ 坐标轴 ∪ 标记点），
     不是轨迹本身 —— 因为相机本来就是按前者拟合的。
     拿轨迹来量会得出很低的数字，但那个数字没有意义：
     标准摆线的宽高比是 9.4，而画布只有 1.2，纵向的空白是几何决定的，不是 bug。 */
  fill() {
    const pts = state.extentPts, t = state.camTarget, cam = camera;
    if (!pts || !pts.length || !t) return null;
    const a = state.view.az * Math.PI / 180, e = state.view.el * Math.PI / 180;
    const r = new THREE.Vector3(-Math.sin(a), Math.cos(a), 0);
    const u = new THREE.Vector3(-Math.cos(a) * Math.sin(e), -Math.sin(a) * Math.sin(e), Math.cos(e));
    let minR = Infinity, maxR = -Infinity, minU = Infinity, maxU = -Infinity;
    for (const p of pts) {
      const pr = p.x * r.x + p.y * r.y + p.z * r.z;
      const pu = p.x * u.x + p.y * u.y + p.z * u.z;
      if (pr < minR) minR = pr;
      if (pr > maxR) maxR = pr;
      if (pu < minU) minU = pu;
      if (pu > maxU) maxU = pu;
    }
    const tR = t.dot(r), tU = t.dot(u);
    const needW = 2 * Math.max(maxR - tR, tR - minR);
    const needH = 2 * Math.max(maxU - tU, tU - minU);
    const haveW = cam.right - cam.left, haveH = cam.top - cam.bottom;
    const w = needW / haveW, h = needH / haveH;
    return { w, h, max: Math.max(w, h) };
  },
  applyPreset: (i) => applyPreset(i),
  switchModel: (id) => switchModel(id),
  applyTheme: (id) => applyTheme(id),
  jumpToUnit: (n) => jumpToUnit(n),
};

resize();
requestAnimationFrame(loop);
