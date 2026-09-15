# -*- coding: utf-8 -*-
"""DESIGN.md 正文插图的矢量图生成器。

约定
----
* 每幅图是一个自包含的 `<svg>` 片段：无外部引用、无位图、无字体依赖。
* 颜色一律写成 `var(--fig-*)`，由 DESIGN.html 的样式表提供，
  因此深色 / 浅色两套配色与印刷稿自动一致，图里不出现硬编码色值。
* 曲线坐标由本模块计算（摆线族、正弦、抛物线），不手描点位；
  每个坐标点都经 `_inside()` 断言落在所属面板内，越界即抛错 —— 不靠肉眼。

用法
----
    python scripts/doc_figures.py            # 写出 shots/_fig/ 预览页，供人眼复核
    from doc_figures import FIGURES          # md2html.py 取用
"""
from __future__ import annotations

import math
from pathlib import Path

# 色令牌（全部来自文档样式表）
INK = "var(--ink)"
INK2 = "var(--ink-2)"
INK3 = "var(--ink-3)"
LINE = "var(--fig-line)"
LINE2 = "var(--fig-line2)"
FILL = "var(--fig-fill)"
FILL2 = "var(--fig-fill-2)"
FILL3 = "var(--fig-fill-3)"
C1 = "var(--fig-1)"      # 蓝：轨迹 / 主量
C2 = "var(--fig-2)"      # 红：力 / 警示 / 拦截
C3 = "var(--fig-3)"      # 绿：可测 / 通过
C4 = "var(--fig-4)"      # 琥珀：参数 / 辅助
C5 = "var(--fig-5)"      # 紫：分量

FS = 'font-family="var(--sans)"'


# ------------------------------------------------------------------ 基元
def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def txt(x, y, s, size=12.5, fill=INK, anchor="start", weight="400",
        mono=False, ls=None, op=None):
    a = ' text-anchor="%s"' % anchor if anchor != "start" else ""
    fam = 'font-family="var(--mono)"' if mono else FS
    st = "font-weight:%s;" % weight
    if ls:
        st += "letter-spacing:%s;" % ls
    if op:
        st += "opacity:%s;" % op
    return ('<text x="%.1f" y="%.1f" %s %s font-size="%s" style="fill:%s;%s">%s</text>'
            % (x, y, fam, a, size, fill, st, esc(s)))


def rect(x, y, w, h, fill=FILL, stroke=LINE, rx=6, sw=1.2, dash=None):
    d = ' stroke-dasharray="%s"' % dash if dash else ""
    return ('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" rx="%s" '
            'style="fill:%s;stroke:%s;stroke-width:%s"%s/>'
            % (x, y, w, h, rx, fill, stroke, sw, d))


def line(x1, y1, x2, y2, stroke=LINE2, sw=1.2, dash=None, cap="butt"):
    d = ' stroke-dasharray="%s"' % dash if dash else ""
    return ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" '
            'style="stroke:%s;stroke-width:%s;stroke-linecap:%s"%s/>'
            % (x1, y1, x2, y2, stroke, sw, cap, d))


def arrow(x1, y1, x2, y2, stroke=LINE2, sw=1.3, head=7.0):
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1.0
    ux, uy = dx / L, dy / L
    bx, by = x2 - ux * head, y2 - uy * head
    px, py = -uy, ux
    hw = head * 0.42
    p = [(x2, y2), (bx + px * hw, by + py * hw), (bx - px * hw, by - py * hw)]
    pts = " ".join("%.1f,%.1f" % q for q in p)
    return (line(x1, y1, bx, by, stroke, sw, cap="round")
            + '<polygon points="%s" style="fill:%s"/>' % (pts, stroke))


def path(pts, stroke=C1, sw=2.0, fill="none", dash=None, op=None):
    d = "M " + " L ".join("%.2f %.2f" % p for p in pts)
    s = ('style="fill:%s;stroke:%s;stroke-width:%s;stroke-linejoin:round;'
         'stroke-linecap:round' % (fill, stroke, sw))
    if dash:
        s += ";stroke-dasharray:%s" % dash
    if op:
        s += ";opacity:%s" % op
    return '<path d="%s"%s/>' % (d, s + '"')


def dot(x, y, r=3.4, fill=C2):
    return ('<circle cx="%.1f" cy="%.1f" r="%s" style="fill:%s"/>'
            % (x, y, r, fill))


def circle(x, y, r, stroke=LINE2, sw=1.2, fill="none", dash=None):
    d = ' stroke-dasharray="%s"' % dash if dash else ""
    return ('<circle cx="%.1f" cy="%.1f" r="%.1f" style="fill:%s;stroke:%s;'
            'stroke-width:%s"%s/>' % (x, y, r, fill, stroke, sw, d))


def svg(w, h, body, label):
    return ('<svg viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg" '
            'role="img" aria-label="%s" class="figsvg">%s</svg>'
            % (w, h, esc(label), body))


def chip(x, y, w, h, text, fill=FILL, stroke=LINE, color=INK, size=12, rx=4,
         weight="400"):
    return (rect(x, y, w, h, fill, stroke, rx=rx, sw=1.1)
            + txt(x + w / 2, y + h / 2 + size * 0.36, text, size, color,
                  anchor="middle", weight=weight))


def _inside(pts, box, what):
    """断言全部坐标落在 box=(x0,y0,x1,y1) 内。越界即抛错。"""
    x0, y0, x1, y1 = box
    for x, y in pts:
        if not (x0 - 0.01 <= x <= x1 + 0.01 and y0 - 0.01 <= y <= y1 + 0.01):
            raise AssertionError("%s 越界: (%.1f, %.1f) 不在 %s 内"
                                 % (what, x, y, box))
    return pts


# ------------------------------------------------------------------ 图 3-1 分层架构
def fig_arch():
    W, H = 760, 400
    o = []
    o.append(txt(30, 48, "依赖方向", 11.5, INK3, anchor="middle"))
    o.append(arrow(30, 58, 30, 356, LINE2, 1.4))

    rows = [
        ("教学编排层", "预设例题库 · 对比演示 · 空间标注 · 场景分享",
         "src/models/*.js · src/main.js", "浏览器", C4),
        ("交互层", "参数面板 · 时间轴 · 图层开关 · 视角按钮 · 读数栏",
         "src/main.js", "浏览器", C4),
        ("模型注册表", "10 个模型，每个 = 一个模型文件 + 注册表一行",
         "src/core/registry.js", "Node 可测", C3),
        ("仿真内核", "解析解采样 · 单位量纲 · 虚拟时间 · 尺度归一化",
         "src/physics.js", "Node 可测", C3),
        ("渲染层", "场景与相机 · 矢量叠加 · 轨迹留痕 · 坐标架",
         "src/core/kit.js · theme.js", "浏览器", C4),
    ]
    x0, bw, bh, gap = 62, 470, 48, 16
    y = 56
    o.append(rect(x0 - 14, y + 2 * (bh + gap) - 9, bw + 28 + 176,
                  2 * bh + gap + 18, fill="none", stroke=LINE2, rx=8, sw=1.1,
                  dash="6 4"))
    for i, (name, duty, impl, badge, bcol) in enumerate(rows):
        yy = y + i * (bh + gap)
        o.append(rect(x0, yy, bw, bh, FILL if i % 2 == 0 else FILL2, LINE, rx=6))
        o.append(txt(x0 + 16, yy + 21, name, 13.5, INK, weight="700"))
        o.append(txt(x0 + 130, yy + 21, duty, 11.5, INK2))
        o.append(txt(x0 + 16, yy + 39, impl, 11, INK3, mono=True))
        o.append(chip(x0 + bw + 16, yy + 11, 76, 26, badge,
                      FILL2 if bcol == C4 else FILL3, bcol, bcol, 11.5))
    o.append(txt(x0, 394, "虚线范围为可脱离浏览器运行、由 Node 直接单元测试的部分。",
                 11.5, INK3))
    return svg(W, H, "".join(o), "五层分层架构、依赖方向与可测试边界")


# ------------------------------------------------------------------ 图 4-1 约束→决策
def fig_decision():
    W, H = 760, 424
    o = []
    colw, gap = 212, 52
    xs = [10, 10 + colw + gap, 10 + 2 * (colw + gap)]
    for x, t in zip(xs, ["源头约束（2.2 节）", "关键技术决策（第 4 章）",
                         "直接后果 / 代价"]):
        o.append(txt(x, 40, t, 12, INK3, weight="700", ls="0.04em"))
        o.append(line(x, 48, x + colw, 48, LINE, 1))

    rows = [
        ("时间轴可任意跳转 /\n倒放 / 改参即时重算",
         "4.1 解析解优先\n状态 = (params, t) 纯函数",
         "4.2 不引入通用刚体引擎\n（只给数值解，与需求冲突）"),
        ("教室网络可能完全不可用\n投影最低 1024×768",
         "4.3 单文件交付\n零外部引用、file:// 即开",
         "放弃 React + R3F\n界面改为声明式生成"),
        ("矢量分解要能当直角\n三角形直接读出",
         "4.4 正交相机 +\n课本插图切面默认视角",
         "三维纵深感弱于透视投影\n以可读性换纵深"),
        ("跨约 13 个数量级\nnm – 10⁷ m",
         "4.5 尺度归一化\n渲染缩放与物理量解耦",
         "渲染层与物理层必须严格隔离\n读数恒为真实 SI 值"),
        ("微观时间尺度极小\n回旋周期约 71 ps",
         "4.6 两套播放速度语义\n周期 / 秒 与 轨迹 / 秒",
         "stride 与默认速度须分别验证\n（见 8.4 案例三）"),
    ]
    ch, pitch = 58, 68
    for i, (a, b, c) in enumerate(rows):
        y = 58 + i * pitch
        for j, (cell, col) in enumerate([(a, FILL), (b, FILL2), (c, FILL)]):
            o.append(rect(xs[j], y, colw, ch, col, LINE, rx=6))
            for k, ln in enumerate(cell.split("\n")):
                o.append(txt(xs[j] + 12, y + 22 + k * 17, ln,
                             12 if j == 1 else 11.5,
                             INK if (j == 1 and k == 0) else INK2,
                             weight="700" if (j == 1 and k == 0) else "400"))
        yc = y + ch / 2
        o.append(arrow(xs[0] + colw + 8, yc, xs[1] - 8, yc, LINE2, 1.3))
        o.append(arrow(xs[1] + colw + 8, yc, xs[2] - 8, yc, LINE2, 1.3))
    return svg(W, H, "".join(o), "从环境约束到关键技术决策的推导关系")


# ------------------------------------------------------------------ 图 5-1 两套速度语义
def fig_time():
    W, H = 760, 362
    o = []
    x0, x1 = 78, 700

    def panel(top, title, sub, cyc):
        out = [rect(10, top, 740, 140, FILL, LINE, rx=8)]
        out.append(txt(28, top + 24, title, 13, INK, weight="700"))
        out.append(txt(28, top + 42, sub, 11.5, INK2))
        base = top + 93
        if cyc:
            pts = [(x0 + (x1 - x0) * i / 240,
                    base - 22 * math.sin(2 * math.pi * 3 * i / 240))
                   for i in range(241)]
            _inside(pts, (x0, top + 68, x1, top + 118), "fig:time 周期曲线")
            for k in range(4):
                gx = x0 + (x1 - x0) * k / 3
                out.append(line(gx, top + 66, gx, top + 120, LINE2, 1, dash="4 4"))
                out.append(txt(gx, top + 62, ["0", "T", "2T", "3T"][k], 10.5,
                               INK3, anchor="middle"))
            out.append(path(pts, C1, 2.0))
            out.append(txt(x0, top + 134, "stride = 一个周期 T", 11, C1,
                           weight="700"))
            out.append(txt(x1, top + 134, "滑块读数：1.20 周期 / 秒", 11, INK2,
                           anchor="end"))
        else:
            pts = [(x0 + (x1 - x0) * i / 240,
                    top + 70 + 48 * (i / 240) ** 2) for i in range(241)]
            _inside(pts, (x0, top + 66, x1, top + 122), "fig:time 非周期曲线")
            for gx, lab in ((x0, "0"), (x1, "t_end")):
                out.append(line(gx, top + 66, gx, top + 124, LINE2, 1, dash="4 4"))
                out.append(txt(gx, top + 62, lab, 10.5, INK3,
                               anchor="middle" if gx == x0 else "end"))
            out.append(path(pts, C1, 2.0))
            out.append(dot(x0, top + 70, 3.2, C1))
            out.append(dot(x1, top + 118, 3.2, C1))
            out.append(txt(x0, top + 134, "stride = 整条轨迹 t_end", 11, C1,
                           weight="700"))
            out.append(txt(x1, top + 134, "滑块读数：全程 10.0 s", 11, INK2,
                           anchor="end"))
        return "".join(out)

    o.append(panel(10, "有周期模型",
                   "单摆 · 天体运动 · 圆周运动 · 圆锥摆 · 简谐运动 · 回旋加速器",
                   True))
    o.append(panel(158, "无周期模型", "平抛 / 斜抛 · 电场偏转 · 弹性碰撞", False))
    o.append(rect(10, 306, 740, 46, FILL3, C3, rx=6, sw=1.1))
    o.append(txt(24, 324, "共同判据：整条轨迹的墙上时间约 10 s"
                          "（第七层断言区间 2–120 s）", 11.5, C3, weight="700"))
    o.append(txt(24, 343, "反面教训：非周期模型若误用 secondsPerCycle"
                          "（恒为 1），每秒绕行约 200 万圈", 11.5, C2))
    return svg(W, H, "".join(o), "周期模型与非周期模型的播放速度语义")


# ------------------------------------------------------------------ 图 6-1 摆线族
def fig_cycloid():
    W, H = 760, 212
    o = []
    pw, ph, py = 236, 146, 50
    panels = [
        (0.6, "k = 0.6", "短幅摆线", "波浪形，不回头", C1),
        (1.0, "k = 1.0", "标准摆线", "出现尖点，尖点处速率恰为零", C2),
        (1.6, "k = 1.6", "长幅摆线", "出现套环（轨迹自交）", C5),
    ]
    for pi, (k, klab, name, note, col) in enumerate(panels):
        px = 10 + pi * (pw + 8)
        o.append(rect(px, py, pw, ph, FILL, LINE, rx=8))
        o.append(txt(px + 14, py + 22, klab, 12.5, col, weight="700"))
        o.append(txt(px + 68, py + 22, name, 12.5, INK))
        # 轨迹：x = R(θ − k sinθ)，y = R·k(1 − cosθ)，θ ∈ [0, 4π]（两个周期）
        N = 720
        raw = [(th - k * math.sin(th), k * (1 - math.cos(th)))
               for th in (4 * math.pi * i / N for i in range(N + 1))]
        xs = [p[0] for p in raw]
        ys = [p[1] for p in raw]
        sx, sy = max(xs) - min(xs), max(ys) - min(ys)
        bx0, by0 = px + 18, py + 34          # 曲线可用区左上角
        bw, bh = pw - 36, ph - 56
        s = min(bw / sx, bh / sy)
        ox = bx0 - min(xs) * s
        oy = by0 + (bh + sy * s) / 2         # 数据 y=0 落在可用区下沿
        pts = [(ox + a * s, oy - b * s) for a, b in raw]   # 屏幕 y 向下，故取负
        _inside(pts, (bx0, by0, bx0 + bw, by0 + bh), "fig:cycloid k=%s" % k)
        cy = oy - k * s                      # 漂移中心线
        o.append(line(px + 14, cy, px + pw - 14, cy, LINE2, 1, dash="4 4"))
        o.append(path(pts, col, 1.8))
        if k != 0.6:
            cx, cyy = pts[N // 2]            # θ = 2π：尖点 / 套环所在的最低点
            o.append(circle(cx, cyy, 7.0, col, 1.2, "none", dash="3 3"))
            o.append(txt(cx, cyy + 17, "尖点 v = 0" if k == 1.0 else "套环",
                         10.5, col, anchor="middle"))
        o.append(txt(px + 14, py + ph - 12, note, 10.5, INK2))
    o.append(txt(10, 32, "虚线为漂移中心线；三条曲线各为两个周期内的轨迹，"
                         "按统一比例缩放以对齐画幅。", 11, INK3))
    return svg(W, H, "".join(o), "摆线族的三种形态")


# ------------------------------------------------------------------ 图 6-2 极板几何
def fig_plates():
    W, H = 760, 312
    o = []

    def panel(px, title, hit):
        out = [rect(px, 40, 360, 228, FILL, LINE, rx=8)]
        out.append(txt(px + 14, 62, title, 12.5, INK, weight="700"))
        plx0, plx1 = px + 46, px + 268
        ymid, half = 150, 36
        scr = px + 330
        # 屏
        out.append(line(scr, ymid - 34, scr, ymid + 60, LINE2, 1.4))
        out.append(txt(scr + 6, ymid - 40, "屏", 10.5, INK3))
        # 极板
        out.append(line(plx0, ymid - half, plx1, ymid - half, INK2, 2.4))
        out.append(line(plx0, ymid + half, plx1, ymid + half, INK2, 2.4))
        out.append(txt(plx1 + 6, ymid - half + 4, "＋", 11, INK3))
        out.append(txt(plx1 + 6, ymid + half + 4, "－", 11, INK3))
        # 入射段
        out.append(path([(plx0 - 14, ymid), (plx0, ymid)], C1, 1.9))
        pts = [(plx0 + (plx1 - plx0) * i / 60,
                ymid + (26 if not hit else 52) * (i / 60) ** 2) for i in range(61)]
        if not hit:
            out.append(path(pts, C1, 1.9))
            xe, ye = pts[-1]
            out.append(path([(xe, ye), (scr, ymid + 48)], C1, 1.9))
            out.append(dot(xe, ye, 3.2, C1))
            out.append(line(plx1, ymid, plx1, ye, C2, 1))
            for gy in (ymid, ye):
                out.append(line(plx1 - 4, gy, plx1 + 4, gy, C2, 1))
            out.append(txt(plx1 + 9, ymid + 18, "y_m", 11, C2, weight="700"))
            out.append(txt(px + 14, 258, "v₀ 垂直射入，板内为类平抛", 10.5, INK2))
        else:
            keep = [p for p in pts if p[1] <= ymid + half]
            rest = [p for p in pts if p[1] > ymid + half]
            out.append(path(keep, C1, 1.9))
            out.append(path([keep[-1]] + rest, C1, 1.5, dash="5 4", op="0.5"))
            out.append(dot(keep[-1][0], ymid + half, 4.0, C2))
            out.append(txt(keep[-1][0] + 12, ymid + half + 17, "撞击点", 10.5, C2,
                           weight="700"))
            out.append(txt(px + 14, 258, "板内即撞上，飞不出去（被吸收）", 10.5, INK2))
        # 板长 L 尺寸线
        dy = ymid + half + 30
        out.append(line(plx0, dy, plx1, dy, LINE2, 1))
        for gx in (plx0, plx1):
            out.append(line(gx, dy - 5, gx, dy + 5, LINE2, 1))
        out.append(txt((plx0 + plx1) / 2, dy + 15, "板长 L", 10.5, INK3,
                       anchor="middle"))
        # 板间距 d 尺寸线
        dx = plx0 - 26
        out.append(line(dx, ymid - half, dx, ymid + half, LINE2, 1))
        for gy in (ymid - half, ymid + half):
            out.append(line(dx - 5, gy, dx + 5, gy, LINE2, 1))
        out.append(txt(dx, ymid - half - 9, "d", 10.5, INK3, anchor="middle"))
        return "".join(out)

    o.append(panel(10, "正常出板：t_end = 2L / v₀", False))
    o.append(panel(390, "打在极板上：t_end = t_hit", True))
    o.append(txt(10, 292, "t_hit = √(2·(d/2) / |a|)　　hit = t_hit < t₁　　"
                          "撞板后 sampleAt 停在撞击点、速度归零；"
                          "虚线为若不撞板的假想延长线。", 11, INK3))
    return svg(W, H, "".join(o), "电场偏转的极板几何与撞板判据")


# ------------------------------------------------------------------ 图 8-1 质量体系
def fig_qa():
    W, H = 760, 424
    o = []
    o.append(txt(10, 30, "七层验证体系（成本由低到高）", 12, INK3, weight="700"))
    o.append(arrow(30, 44, 30, 392, LINE2, 1.3))
    o.append(txt(30, 410, "成本", 11, INK3, anchor="middle"))

    x0, w1, w2, w3 = 46, 196, 238, 236
    y, rh, gap = 62, 40, 8
    for cx, t in ((x0 + 12, "层 / 实现脚本"),
                  (x0 + w1 + 12, "验证对象"),
                  (x0 + w1 + w2 + 12, "拦截的缺陷类型")):
        o.append(txt(cx, y - 8, t, 11, INK3, weight="700", ls="0.04em"))
    rows = [
        ("① 物理单元测试", "scripts/test-physics.mjs",
         "代码 vs 公式（192 条断言）", "解析解 · 守恒律 · 符号约定 · 退化情形", C3),
        ("② 渲染钩子探针", "scripts/probe-vectors.mjs",
         "接口自洽性（key 唯一、引用存在）", "钩子 key 拼写错误 → 画面空白", C3),
        ("③ 无头浏览器冒烟", "scripts/smoke.mjs",
         "真实运行环境（52 个预设）", "error / warn / 读数未填充", C3),
        ("④ 像素级核对", "截图 + 读回图像",
         "画面实际内容", "换色是否生效 · 线条遮挡关系", C4),
        ("⑤ 参数量级体检", "check-framing / check-magnitude",
         "参数是否物理合理、装饰是否可见", "量级失配 → 画面缩成一条竖线（案例一）", C4),
        ("⑥ 文案一致性审计", "scripts/audit-copy.mjs",
         "文案 vs 代码算出的特征量", "文案承诺、模型不做（案例二）", C4),
        ("⑦ 动画速度体检", "test-physics.mjs（第七层）",
         "整条轨迹的墙上时间 2–120 s", "速度语义混用 → 画面频闪（案例三）", C2),
    ]
    for i, (name, impl, target, catches, col) in enumerate(rows):
        yy = y + i * (rh + gap)
        o.append(rect(x0, yy, w1 + w2 + w3, rh, FILL if i % 2 == 0 else FILL2,
                      LINE, rx=5))
        o.append(txt(x0 + 12, yy + 18, name, 12.5, INK, weight="700"))
        o.append(txt(x0 + 12, yy + 32, impl, 10, INK3, mono=True))
        o.append(line(x0 + w1, yy + 6, x0 + w1, yy + rh - 6, LINE, 1))
        o.append(txt(x0 + w1 + 12, yy + 24, target, 11.5, INK2))
        o.append(line(x0 + w1 + w2, yy + 6, x0 + w1 + w2, yy + rh - 6, LINE, 1))
        o.append(txt(x0 + w1 + w2 + 12, yy + 24, catches, 11, col))
    return svg(W, H, "".join(o), "七层质量保证体系及其验证对象")


FIGURES = {
    "arch": fig_arch,
    "decision": fig_decision,
    "time": fig_time,
    "cycloid": fig_cycloid,
    "plates": fig_plates,
    "qa": fig_qa,
}

# 供自检：插图键 -> 期望的图号标题（与 DESIGN.md 中的 ![图 N-M ...](fig:key) 对应）
FIG_LABELS = {
    "arch": "图 3-1", "decision": "图 4-1", "time": "图 5-1",
    "cycloid": "图 6-1", "plates": "图 6-2", "qa": "图 8-1",
}


# ------------------------------------------------------------------ 预览
PREVIEW_CSS = """
:root{
  --ink:#1a1a1a; --ink-2:#3d3d3d; --ink-3:#6b6b6b;
  --bg:#fff; --fig-line:#d8d8d2; --fig-line2:#b4b4ac;
  --fig-fill:#f7f7f5; --fig-fill-2:#f0f0ec; --fig-fill-3:#eef4ee;
  --accent:#8a1f1f; --accent-2:#b03434;
  --fig-1:#2c5f8a; --fig-2:#9c2b2b; --fig-3:#2f6b3f; --fig-4:#8a6a1f; --fig-5:#5b3f80;
  --sans:"Microsoft YaHei","PingFang SC",-apple-system,Segoe UI,sans-serif;
  --mono:Consolas,"Cascadia Mono",Menlo,monospace;
}
@media (prefers-color-scheme: dark){
  :root{
    --ink:#e8e6e1; --ink-2:#c9c6c0; --ink-3:#9a968f;
    --bg:#16161a; --fig-line:#3a3a44; --fig-line2:#5a5a66;
    --fig-fill:#1f1f26; --fig-fill-2:#26262e; --fig-fill-3:#1d2a1f;
    --accent:#e08585; --accent-2:#f0a0a0;
    --fig-1:#7fb3dd; --fig-2:#e88b8b; --fig-3:#8cc79a; --fig-4:#d9bb72; --fig-5:#b9a0dd;
  }
}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans)}
.wrap{max-width:860px;margin:0 auto;padding:32px 24px 64px}
h2{font-size:15px;margin:34px 0 8px}
.figsvg{width:100%;height:auto;display:block;background:var(--bg)}
"""


def main():
    here = Path(__file__).resolve().parent
    out = here.parent / "shots" / "_fig"
    out.mkdir(parents=True, exist_ok=True)
    head = ('<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">'
            '<title>插图预览</title><style>%s</style></head><body>'
            '<div class="wrap">' % PREVIEW_CSS)
    parts = []
    for key, fn in FIGURES.items():
        s = fn()
        (out / ("%s.svg" % key)).write_text(s, encoding="utf-8")
        (out / ("one-%s.html" % key)).write_text(head + s + "</div></body></html>",
                                                encoding="utf-8")
        parts.append("<h2>fig:%s　%s</h2>%s" % (key, FIG_LABELS[key], s))
        print("  %-9s %s  %6d 字符" % (key, FIG_LABELS[key], len(s)))
    (out / "preview.html").write_text(head + "".join(parts) + "</div></body></html>",
                                      encoding="utf-8")
    print("写出 %d 幅插图 -> %s" % (len(FIGURES), out))


if __name__ == "__main__":
    main()
