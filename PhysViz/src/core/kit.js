/* ============================================================
   场景积木 —— 渲染层的可复用零件
   ------------------------------------------------------------
   这些零件只关心"怎么画"，不知道任何具体模型。
   模型通过声明（矢量 / 标记 / 线段 / 参考线 / 场）来使用它们。
   ============================================================ */

import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { EPS } from '../physics.js';

export const UP = new THREE.Vector3(0, 1, 0);

/* 矢量箭头的最大长度（世界单位）。
   长度 ∝ 物理量大小，所以这个常量同时是"参考量取到时箭头多长"。
   它必须固定，不能随内容尺度变 —— 否则「B 加倍」那种要对比
   两个矢量大小的预设就失去了可比性。 */
export const ARROW_LEN = 1.9;

/* Line2 的材质都必须拿到 resolution（屏幕像素），统一登记，
   resize 时一次性刷新，免得漏掉某一条线导致线宽变成 1px。 */
export const lineMats = [];
export function setLineResolution(w, h) {
  for (const m of lineMats) m.resolution.set(w, h);
}

/* Vector3[] → 平铺的 Float32Array */
export function flat(pts) {
  const f = new Float32Array(pts.length * 3);
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    f[i * 3] = p.x; f[i * 3 + 1] = p.y; f[i * 3 + 2] = p.z;
  }
  return f;
}

/* ------------------------------------------------------------
   粗线（Line2）：屏幕空间等宽，投影到教室大屏上也看得清
   ------------------------------------------------------------ */
export class FatLine {
  constructor(color, width = 3) {
    this.mat = new LineMaterial({
      color, linewidth: width, worldUnits: false, transparent: false,
    });
    lineMats.push(this.mat);
    this.geom = new LineGeometry();
    this.obj = new Line2(this.geom, this.mat);
    this.obj.frustumCulled = false;
    this.obj.visible = false;
    this.seg = 0;          // 一共几段
    this._dirty = false;
  }

  /* 换一组点。
     必须先 dispose 再 setPositions：不 dispose 时 LineGeometry 的
     _maxInstanceCount 会停在旧值，新数组更长时会被静默截断。 */
  set(pts) {
    if (!pts || pts.length < 2) { this.obj.visible = false; this.seg = 0; return; }
    this.geom.dispose();
    this.geom.setPositions(flat(pts));
    this.seg = pts.length - 1;
    this.obj.visible = true;
  }

  /* 只画前 n 段（用于"已走过"） */
  show(n) {
    if (this.seg < 1) return;
    this.geom.instanceCount = Math.max(1, Math.min(Math.round(n), this.seg));
  }
  showAll() { if (this.seg >= 1) this.geom.instanceCount = Infinity; }

  color(hex) { this.mat.color.setHex(hex); }
  width(w) { this.mat.linewidth = w; }
  /* 注意：方法名是 setVisible，不是 visible。
     three 的 Object3D 用 `.visible` 布尔属性，若这里也叫 visible，
     调用方一不留神写成 `obj.visible(x)` 就会在裸 Mesh 上炸
     "visible is not a function"。名字错开，混淆就不可能发生。 */
  setVisible(v) { this.obj.visible = v; }
  get isVisible() { return this.obj.visible; }
}

/* ------------------------------------------------------------
   细线（LineSegments）：网格、坐标轴、投影线
   ------------------------------------------------------------ */
export class ThinSegs {
  constructor(color, opts = {}) {
    this.mat = opts.dashed
      ? new THREE.LineDashedMaterial({ color, dashSize: opts.dashSize ?? 0.12, gapSize: opts.gapSize ?? 0.09 })
      : new THREE.LineBasicMaterial({ color });
    this.geom = new THREE.BufferGeometry();
    this.obj = new THREE.LineSegments(this.geom, this.mat);
    this.obj.frustumCulled = false;
  }
  /* 已经是平铺好的 x,y,z 数组（每两个点一段） */
  set(arr) {
    this.geom.dispose();
    this.geom.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    if (this.mat.isLineDashedMaterial) this.obj.computeLineDistances();
  }
  color(hex) { this.mat.color.setHex(hex); }
  /* 注意：方法名是 setVisible，不是 visible。
     three 的 Object3D 用 `.visible` 布尔属性，若这里也叫 visible，
     调用方一不留神写成 `obj.visible(x)` 就会在裸 Mesh 上炸
     "visible is not a function"。名字错开，混淆就不可能发生。 */
  setVisible(v) { this.obj.visible = v; }
}

/* ------------------------------------------------------------
   折线（Line）：绳、弹簧、矢径这类"每帧都要重算"的细折线
   ------------------------------------------------------------ */
export class ThinPath {
  constructor(color, opts = {}) {
    this.mat = opts.dashed
      ? new THREE.LineDashedMaterial({ color, dashSize: opts.dashSize ?? 0.14, gapSize: opts.gapSize ?? 0.10 })
      : new THREE.LineBasicMaterial({ color });
    this.geom = new THREE.BufferGeometry();
    this.obj = new THREE.Line(this.geom, this.mat);
    this.obj.frustumCulled = false;
    this.obj.visible = false;
  }
  set(pts) {
    if (!pts || pts.length < 2) { this.obj.visible = false; return; }
    this.geom.dispose();
    this.geom.setAttribute('position', new THREE.BufferAttribute(flat(pts), 3));
    if (this.mat.isLineDashedMaterial) this.obj.computeLineDistances();
    this.obj.visible = true;
  }
  color(hex) { this.mat.color.setHex(hex); }
  /* 注意：方法名是 setVisible，不是 visible。
     three 的 Object3D 用 `.visible` 布尔属性，若这里也叫 visible，
     调用方一不留神写成 `obj.visible(x)` 就会在裸 Mesh 上炸
     "visible is not a function"。名字错开，混淆就不可能发生。 */
  setVisible(v) { this.obj.visible = v; }
}

/* ------------------------------------------------------------
   矢量箭头：圆柱 + 圆锥，比 ArrowHelper 的 1px 线更清楚，
   而且受光后有明暗，有"实体感"
   ------------------------------------------------------------ */
const SHAFT_GEO = (() => {
  const g = new THREE.CylinderGeometry(1, 1, 1, 10);
  g.translate(0, 0.5, 0);          // 底面挪到原点，方便按长度缩放
  return g;
})();
const HEAD_GEO = (() => {
  const g = new THREE.ConeGeometry(1, 1, 14);
  g.translate(0, 0.5, 0);
  return g;
})();

export class Arrow {
  constructor(scene, color, radius = 0.026) {
    this.radius = radius;
    this.group = new THREE.Group();
    this.mat = new THREE.MeshLambertMaterial({ color });
    this.shaft = new THREE.Mesh(SHAFT_GEO, this.mat);
    this.head = new THREE.Mesh(HEAD_GEO, this.mat);
    this.group.add(this.shaft, this.head);
    this.group.visible = false;
    scene.add(this.group);
  }
  /* origin / vec 都是世界坐标。len 由调用方算好（已经过归一化）。 */
  set(origin, vec, len) {
    const l = vec.length();
    if (!(l > EPS) || !(len > 1e-4)) { this.group.visible = false; return false; }
    const dir = vec.clone().divideScalar(l);
    this.group.visible = true;
    this.group.position.copy(origin);
    this.group.quaternion.setFromUnitVectors(UP, dir);
    const headLen = Math.min(len * 0.34, this.radius * 14);
    const shaftLen = Math.max(len - headLen, len * 0.15);
    const r = this.radius;
    this.shaft.scale.set(r, shaftLen, r);
    this.head.scale.set(r * 2.6, headLen, r * 2.6);
    this.head.position.y = shaftLen;
    return true;
  }
  color(hex) { this.mat.color.setHex(hex); }
  hide() { this.group.visible = false; }
}

/* ------------------------------------------------------------
   标记点：球体。用于振子、悬点、中心天体、近远地点这类"位置提示"。
   按 key 复用同一个 mesh，避免每帧 new。
   ------------------------------------------------------------ */
export class MarkerSet {
  constructor(scene) {
    this.scene = scene;
    this.map = new Map();
    // 提高球体细分：高光斑与明暗过渡更顺滑（中心天体要"鼓"起来，离不开它）。
    // 几何是共享的，所有标记球都受益，代价可忽略。
    this.geo = new THREE.SphereGeometry(1, 48, 32);
  }
  set(key, pos, color, radius, depthTest = true, order = 0, opts = {}) {
    const wantPhong = opts.mat === 'phong';
    let m = this.map.get(key);
    if (!m) {
      const mat = wantPhong
        ? new THREE.MeshPhongMaterial({ color, depthTest, specular: 0x2a2a2a, shininess: 8 })
        : new THREE.MeshLambertMaterial({ color, depthTest });
      m = new THREE.Mesh(this.geo, mat);
      m.renderOrder = order;
      this.scene.add(m);
      this.map.set(key, m);
    } else if (wantPhong !== !!m.material.isMeshPhongMaterial) {
      // 材质类型需要切换（同一 key 一般不会变，这里兜底）
      m.material.dispose();
      m.material = wantPhong
        ? new THREE.MeshPhongMaterial({ color, depthTest, specular: 0x2a2a2a, shininess: 8 })
        : new THREE.MeshLambertMaterial({ color, depthTest });
    }
    m.visible = true;
    m.position.copy(pos);
    // 异向缩放（球体压扁等）：scaleVec 是相对半径的比例；否则各向同性
    if (opts.scaleVec) {
      m.scale.set(
        Math.max(radius * opts.scaleVec.x, 1e-6),
        Math.max(radius * opts.scaleVec.y, 1e-6),
        Math.max(radius * opts.scaleVec.z, 1e-6),
      );
    } else {
      m.scale.setScalar(Math.max(radius, 1e-6));
    }
    m.material.color.setHex(color);
    m.material.depthTest = depthTest;
    // 中心天体（phong）只进 layer 1：只被 bodyLight（随相机走的高光光）+ bodyAmbient
    // 单独照亮，不受全局 HemisphereLight(0.95) 冲淡 —— 于是暗面真暗、亮面真亮，
    // 明暗交界线（终结线）清晰，球体才"鼓"起来、有 3D 感。其它模型都在 layer 0，
    // 完全不受这两盏 layer-1 的光影响。
    if (wantPhong) m.layers.set(1);
    else m.layers.set(0);
    // 半透明（撞击闪光等）：opacity < 1 时开启透明并关闭深度写入，避免互相遮挡发黑
    const op = opts.opacity == null ? 1 : opts.opacity;
    if (op < 1) {
      m.material.transparent = true;
      m.material.opacity = op;
      m.material.depthWrite = false;
      m.material.needsUpdate = true;
    } else if (m.material.transparent) {
      m.material.transparent = false;
      m.material.opacity = 1;
      m.material.depthWrite = true;
      m.material.needsUpdate = true;
    }
    return m;
  }
  hide(key) { const m = this.map.get(key); if (m) m.visible = false; }
  hideAll() { for (const m of this.map.values()) m.visible = false; }
  colorAll(hex) { for (const m of this.map.values()) m.material.color.setHex(hex); }
}

/* ------------------------------------------------------------
   匀强场：沿任意方向铺满可见区域的细圆柱 + 锥头
   ------------------------------------------------------------
   不再用贴在单个平面上的 ⊗ 符号阵列 —— 那种做法有两个毛病：
     1. 只覆盖轨迹附近一小块，放大画面就什么都没有了；
     2. 符号本身是平面图形，从侧面看过去退化成一根根细线。
   改成真正的三维几何体，并且范围跟着相机可见区域走，
   密度按"屏幕像素"给定 —— 于是无论怎么缩放，场都铺满画幅。
   ------------------------------------------------------------ */
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3(), _v5 = new THREE.Vector3();
const _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), _s = new THREE.Vector3();

export class UniformField {
  constructor(scene, color, max = 420) {
    this.max = max;
    this.mat = new THREE.MeshLambertMaterial({ color });
    this.shaft = new THREE.InstancedMesh(SHAFT_GEO, this.mat, max);
    this.head = new THREE.InstancedMesh(HEAD_GEO, this.mat, max);
    this.shaft.frustumCulled = this.head.frustumCulled = false;
    this.shaft.count = this.head.count = 0;
    scene.add(this.shaft, this.head);
    this.last = null;         // 记下最后一次 fill 的参数，供"取箭头尖端"用
  }

  color(hex) { this.mat.color.setHex(hex); }
  setVisible(v) { this.shaft.visible = this.head.visible = v; }
  clear() { this.shaft.count = this.head.count = 0; }

  /* box   : 要铺满的世界 AABB
     dir   : 场方向（会被归一化）
     px    : 函数，像素 → 世界单位
     spacing: 相邻场线的屏幕间距（像素）
     thick/head/headL: 粗细、锥头半径、锥头长度（都是像素） */
  fill({ box, dir, px, spacing = 152, thick = 0.85, head = 2.3, headL = 8 }) {
    const d = _v1.copy(dir);
    if (d.lengthSq() < EPS) { this.clear(); return; }
    d.normalize();

    // 垂直于 d 的一组正交基
    if (Math.abs(d.y) < 0.9) _v2.set(0, 1, 0).cross(d).normalize();
    else _v2.set(1, 0, 0).cross(d).normalize();
    const e1 = _v2.clone();
    const e2 = _v3.crossVectors(d, e1).normalize();

    // 把 AABB 的 8 个角投到 (e1, e2, d) 三轴上，得到真实的覆盖范围
    let a1min = Infinity, a1max = -Infinity;
    let a2min = Infinity, a2max = -Infinity;
    let dmin = Infinity, dmax = -Infinity;
    for (const x of [box.min.x, box.max.x]) {
      for (const y of [box.min.y, box.max.y]) {
        for (const z of [box.min.z, box.max.z]) {
          _v4.set(x, y, z);
          const p1 = _v4.dot(e1), p2 = _v4.dot(e2), pd = _v4.dot(d);
          if (p1 < a1min) a1min = p1; if (p1 > a1max) a1max = p1;
          if (p2 < a2min) a2min = p2; if (p2 > a2max) a2max = p2;
          if (pd < dmin) dmin = pd; if (pd > dmax) dmax = pd;
        }
      }
    }

    const sp = Math.max(px(spacing), 1e-6);
    let n1 = Math.max(1, Math.round((a1max - a1min) / sp));
    let n2 = Math.max(1, Math.round((a2max - a2min) / sp));
    // 数量上限：InstancedMesh 是预分配的，超了会溢出
    while (n1 * n2 > this.max) { if (n1 >= n2) n1--; else n2--; }
    n1 = Math.max(1, n1); n2 = Math.max(1, n2);

    const q = _q.setFromUnitVectors(UP, d);
    const rS = px(thick), rH = px(head), hL = px(headL);
    const len = Math.max((dmax - dmin) * 0.98, px(40));
    const shaftLen = Math.max(len - hL, len * 0.2);
    const step1 = (a1max - a1min) / n1;
    const step2 = (a2max - a2min) / n2;

    let k = 0;
    for (let i = 0; i < n1; i++) {
      for (let j = 0; j < n2; j++) {
        const p1 = a1min + (i + 0.5) * step1;
        const p2 = a2min + (j + 0.5) * step2;
        const base = _v4.set(0, 0, 0).addScaledVector(e1, p1).addScaledVector(e2, p2).addScaledVector(d, dmin);
        this.shaft.setMatrixAt(k, _m.compose(base, q, _s.set(rS, shaftLen, rS)));
        _v5.copy(base).addScaledVector(d, shaftLen);
        this.head.setMatrixAt(k, _m.compose(_v5, q, _s.set(rH, hL, rH)));
        k++;
      }
    }
    this.shaft.count = this.head.count = k;
    this.shaft.instanceMatrix.needsUpdate = true;
    this.head.instanceMatrix.needsUpdate = true;
    this.last = { dir: d.clone(), len, dmin, dmax };
  }
}
