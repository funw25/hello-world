/* ============================================================
   配色主题
   ------------------------------------------------------------
   三套都是浅底 —— 刻意不做深色主题：
   DESIGN.md §8.3 明确写了"不用深色背景（投影仪黑位差，深色会糊成一片）"。
   教室里投影仪的黑位普遍很差，深色主题在真实课堂上会变成一团。

   主题同时作用于三处，缺一处就会出现"界面变了但画面没变"，等于没换：
     1. css   —— 界面（顶栏、侧栏、时间轴）
     2. scene —— 3D 场景里的每条线、每个箭头、每根场线
     3. bg    —— 3D 画布的背景色（渲染器 clearColor + #stage）
     4. lw    —— 线宽

   ------------------------------------------------------------------
   配色哲学（2026-09-13 重做）
   ------------------------------------------------------------------
   1. **多色活泼**：不同语义用不同色相（轨迹=天蓝、速度=青绿、分量=紫/橙、
      力=珊瑚、中心=玫红…），一眼能分清"这是哪个量"，而不是一片蓝。
   2. **降饱和**：所有颜色都往灰里收一档，亮而不刺眼、久看不累。
      旧的纯蓝/纯红/深近黑是"脏、暗沉"的来源，已全部换掉。
   3. **正红/正蓝/正黄留给老师批注**（见 main.js 的 INK_COLORS）：
      模型线条一律不用纯色，这样老师在画面上画的圈/线才是全场最抢眼的。
   4. **场线要淡**：磁场线/电场线会铺满整个画幅，一旦饱和度高就会把画面
      搅"脏"。所以 bLine/eLine 用极淡的同色相，只做空间参照，不抢戏。

   三套用**不同的主导色相**拉开，保证点了按钮画面真的会变：

     课堂 classroom  白底 · 多色 · 粗线 · 主色=天蓝   → 投影仪，最后一排也看清
     论文 paper      白底 · 近灰阶 · 细线 · 主色=黑灰 → 截图进课件/论文，印刷友好
     柔和 soft       浅灰底 · 低饱和 · 中线 · 主色=青 → 学生课后久看不累

   "论文"刻意做成近乎灰阶：期刊插图多为黑白印刷，靠颜色区分曲线的图印出来就废了，
   所以只留一个柔砖红作为唯一的彩色强调。
   ============================================================ */

export const THEMES = [
  {
    id: 'classroom',
    name: '课堂',
    note: '白底、多色、粗线、主色天蓝。默认，为教室投影仪准备。所有颜色降饱和，亮而不刺眼。',
    bg: 0xffffff,
    css: {
      '--bg': '#ffffff', '--panel': '#fbfcfd', '--line': '#e6e9ed',
      '--text': '#2b3440', '--muted': '#78828f', '--faint': '#a4abb5',
      '--accent': '#2f74b8', '--accent-soft': '#e8f0fa', '--warn': '#b57324',
      '--hint-bg': '#fffdf6', '--hint-line': '#efe2c2',
    },
    scene: {
      // 轨迹：天蓝家族（主色）
      traj: 0x2f86d0, trajDim: 0xb6d2ea, focus: 0x1f6cb4, trail: 0x2878bc,
      // 速度=青绿 · 分量=紫/橙
      v: 0x18a884, vd: 0x7d6ec4, vp: 0xd99538,
      // 力=珊瑚（非正红）· 电场力=金 · 重力=蓝灰 · 张力同力
      F: 0xdc7a72, qE: 0xc79a2c, g: 0x849db8, T: 0xdc7a72, Nrm: 0x2f86d0, Tan: 0x18a884,
      // 场线：淡，只做参照
      bLine: 0xb6d0e8, eLine: 0xdfcb98, gLine: 0xb8c9d6,
      grid: 0xe4ebf2, axis: 0x7b91a6, proj: 0xd2dde6,
      center: 0xd2799f, aux: 0x9fb0c0,
      particle: 0x24404e, body: 0xe4eaf0, origin: 0xd4883a, marker: 0x24404e,
    },
    lw: { traj: 3.2, trail: 3.6, focus: 3.4, guide: 2.4, seg: 2.6 },
  },
  {
    id: 'paper',
    name: '论文',
    note: '近灰阶、细线、纯白底。期刊插图多为黑白印刷，靠颜色区分曲线的图印出来就废了，所以这里只留一个柔砖红作为唯一彩色强调。',
    bg: 0xffffff,
    css: {
      '--bg': '#ffffff', '--panel': '#ffffff', '--line': '#dedede',
      '--text': '#1c1c1c', '--muted': '#636363', '--faint': '#9a9a9a',
      '--accent': '#3d5a6b', '--accent-soft': '#eef1f3', '--warn': '#9a4340',
      '--hint-bg': '#fafafa', '--hint-line': '#dedede',
    },
    scene: {
      // 轨迹：浅灰 → 深灰；"正在走的那一段"最深，视线焦点才明确
      traj: 0x3d3d3d, trajDim: 0xd2d2d2, focus: 0x151515, trail: 0x262626,
      // 矢量：靠深浅区分而不是靠色相，印刷成黑白仍然分得开
      v: 0x4a4a4a, vd: 0x767676, vp: 0x9e9e9e,
      F: 0xac4a45, qE: 0x6e6e6e, g: 0x6e6e6e, T: 0xac4a45, Nrm: 0x767676, Tan: 0x4a4a4a,
      bLine: 0xd2d2d2, eLine: 0xb4b4b4, gLine: 0xc2c2c2,
      grid: 0xf0f0f0, axis: 0x5e5e5e, proj: 0xe6e6e6,
      center: 0x848484, aux: 0xbebebe,
      particle: 0x242424, body: 0xe4e4e6, origin: 0x767676, marker: 0x333333,
    },
    lw: { traj: 1.9, trail: 2.3, focus: 2.1, guide: 1.3, seg: 1.5 },
  },
  {
    id: 'soft',
    name: '柔和',
    note: '浅灰底、低饱和、中等线宽、主色青。长时间看不累，适合学生自己课后拖。',
    bg: 0xf4f6f8,
    css: {
      '--bg': '#f4f6f8', '--panel': '#ffffff', '--line': '#e6eaee',
      '--text': '#3a424b', '--muted': '#7d868f', '--faint': '#aab1b8',
      '--accent': '#3f8b83', '--accent-soft': '#e6f2f0', '--warn': '#b0721f',
      '--hint-bg': '#ffffff', '--hint-line': '#e6eaee',
    },
    scene: {
      // 主色青绿家族
      traj: 0x2f9b90, trajDim: 0xa8dcd5, focus: 0x237a72, trail: 0x2b827a,
      // 速度=蓝 · 分量=紫/橙
      v: 0x2f8bb0, vd: 0x7d6ec4, vp: 0xc4832f,
      F: 0xc4666a, qE: 0xba8f2f, g: 0x7e98ac, T: 0xc4666a, Nrm: 0x2f8bb0, Tan: 0x2f9b90,
      bLine: 0xb4cdd8, eLine: 0xdcc898, gLine: 0xb0bfc8,
      grid: 0xe6eaee, axis: 0x8296a4, proj: 0xd8e0e6,
      center: 0xc47fa0, aux: 0xa8b4bd,
      particle: 0x2a4650, body: 0xd8e4e6, origin: 0xc4832f, marker: 0x2a4650,
    },
    lw: { traj: 2.8, trail: 3.2, focus: 3, guide: 2, seg: 2.2 },
  },
];

export function themeById(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

/* 把主题写进 CSS 变量。--canvas-bg 是 3D 画布的背景，
   和 --bg 分开 —— 面板底色和画面底色在"柔和"主题里是不一样的。 */
export function applyThemeCss(theme) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(theme.css)) root.style.setProperty(k, v);
  root.style.setProperty('--canvas-bg', hexStr(theme.bg));
}

/* 十六进制数字 → '#rrggbb'，给 canvas 2D 用 */
export function hexStr(n) {
  return '#' + n.toString(16).padStart(6, '0');
}
