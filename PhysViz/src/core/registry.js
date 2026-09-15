/* ============================================================
   模型注册表
   ------------------------------------------------------------
   加一个新模型 = 写一个 models/*.js + 这里加一行。
   UI 一行都不用改。

   ------------------------------------------------------------------
   一个 PhysicsModel 的形状
   ------------------------------------------------------------------
   {
     id, name, tagline, layerTip,

     params:   ParamDef[]     参数滑块
     layers:   LayerDef[]     图层开关（on:false 表示默认关闭）
     readings: ReadingDef[]   右侧实时读数
     presets:  Preset[]       预设例题（cmp 相同的预设共用一套尺度与画幅）
     views:    { key: {az, el, label} }
     defaultView: string

     // ---- 纯物理，必须不碰 DOM ----
     derive(p)                  → d      派生量
     sampleAt(t, p, d)          → { pos, vel, acc }   必须是 (t) 的纯函数
     buildTrajectory(p, d)      → { pts, tEnd }
     timeScale(p, d)            → { primaryUnit, secondaryUnit,
                                    secondsPerCycle, label, cyclic, jumpSeconds }
     readingsOf(s, ctx)         → { key: 显示字符串 }
     shapeName(d)               → string | undefined

     // ---- 渲染声明，全部可选 ----
     vectors(s, ctx)   → [{ key, label, color, layer, vec, ref, radius,
                            anchor?, parallelogram? }]
     markers(s, ctx)   → [{ key, layer, color, radius?, radiusPhys?, pos,
                            depthTest?, order? }]
     segments(s, ctx)  → [{ key, layer, color, dashed?, pts }]   每帧重算
     guides(ctx)       → [{ key, layer, color, width?, pts }]    参数变化时重算
     fields(ctx)       → [{ key, layer, color, label?, dir,
                            spacing, thick, head, headL }]
     hint(ctx)         → string

   ------------------------------------------------------------------
   ctx = { t, p, d, traj, wpts, C, lw, N, EPS, s }
     C  当前主题的 3D 调色板（hex 数字）
     lw 当前主题的线宽表
   ------------------------------------------------------------------
   钩子返回的一切坐标都是**物理坐标**，尺度归一化由引擎统一处理。
   ------------------------------------------------------------------
   ============================================================ */

import velocityMatching from '../models/velocity-matching.js';
import projectile from '../models/projectile.js';
import magneticCircle from '../models/magnetic-circle.js';
import conicalPendulum from '../models/conical-pendulum.js';
import shm from '../models/shm.js';
import orbit from '../models/orbit.js';
import electricDeflection from '../models/electric-deflection.js';
import pendulum from '../models/pendulum.js';
import cyclotron from '../models/cyclotron.js';
import collision from '../models/collision.js';

export const MODELS = [
  velocityMatching,
  projectile,
  magneticCircle,
  conicalPendulum,
  shm,
  orbit,
  electricDeflection,
  pendulum,
  cyclotron,
  collision,
];

export function modelById(id) {
  return MODELS.find(m => m.id === id) || MODELS[0];
}
