/* 探针：每个模型、每个预设的轨迹落在哪个平面？
   用途 —— 决定"教科书常用切面"该选 xy / xz / yz 中的哪一个。
   判据：轨迹在三个方向上的跨度，跨度最小的那个方向就是平面的法向。 */
import * as THREE from 'three';
import { MODELS } from '../src/core/registry.js';

const AX = ['x', 'y', 'z'];
for (const M of MODELS) {
  const rows = [];
  const presets = M.presets && M.presets.length ? M.presets : [{ id: '-', params: null }];
  for (const pre of presets) {
    const p = {};
    for (const def of M.params) p[def.key] = def.min;
    Object.assign(p, pre.params || {});
    const d = M.derive(p);
    const traj = M.buildTrajectory(p, d);
    const box = new THREE.Box3().setFromPoints(traj.pts);
    const s = box.getSize(new THREE.Vector3());
    const arr = [s.x, s.y, s.z];
    const order = arr.map((v, i) => [v, AX[i]]).sort((a, b) => a[0] - b[0]);
    const thin = order[0];
    const big = order[2][0];
    const flat = big > 0 && thin[0] / big < 0.02;
    rows.push(`${(pre.id || '-').padEnd(12)} 跨度 ${arr.map(v => v.toExponential(2)).join('  ')}  → 法向 ${thin[1]}${flat ? '  【平面】' : '  (非平面!)'}`);
  }
  console.log(`\n===== ${M.id}  ${M.name}`);
  console.log(rows.join('\n'));
  console.log(`  现 defaultView = ${M.defaultView}  →`, JSON.stringify(M.views[M.defaultView]));
}
