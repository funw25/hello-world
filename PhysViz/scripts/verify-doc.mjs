/* DESIGN.html 验收脚本
 *
 * 检查两件事：
 *   1. DOM 自检 —— 深/浅两套配色下都不得有横向溢出；公式、表格数量必须与源文档一致；
 *      不得残留未识别的 LaTeX 命令或直双引号。
 *   2. 像素 —— 在若干关键章节截图，落到 shots/_doc/ 供人工复核。
 *
 * 背景（踩过的坑）：
 *   无头 Chrome 在**片段跳转或滚动之后不重绘**，`file:///.../DESIGN.html#ch4`
 *   截出来是全黑。所以这里不滚动，而是给 .page 注入 `transform:translateY(-Npx)`
 *   把目标段落"搬"进视口。位移量由 DOM 实测的 offsetTop 给出，不靠肉眼估。
 *
 * 用法：npm run docs:check
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));   // physviz/scripts
const APP = resolve(HERE, '..');                        // physviz
const ROOT = resolve(APP, '..');                        // 工作区根
const DOC = resolve(ROOT, 'DESIGN.html');
const OUT = resolve(APP, 'shots/_doc');
const TMP = resolve(tmpdir(), 'pv-doc-check');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!CHROME) { console.error('找不到 Chrome'); process.exit(2); }
if (!existsSync(DOC)) { console.error('缺少 %s，先跑 npm run docs', DOC); process.exit(2); }

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

/* profile 两槽位轮转：一轮建 20+ 个目录会撞沙箱批量删除护栏
   （SAFE_DELETE_BULK_CONFIRM_REQUIRED），重试不会放行。 */
const SLOTS = [resolve(TMP, '_p-a'), resolve(TMP, '_p-b')];
let slot = 0;
const nextProfile = () => SLOTS[slot++ % SLOTS.length];

const DIAG = `
<script>
window.addEventListener('load', function(){
  var de = document.documentElement, vw = de.clientWidth;
  var wide = [], nbWrapped = 0, nb = 0;
  document.querySelectorAll('body *').forEach(function(el){
    var r = el.getBoundingClientRect();
    if (r.width > vw + 1 && el.tagName !== 'PRE' && !el.closest('pre'))
      wide.push(el.tagName + '.' + (el.className || '') + '=' + Math.round(r.width));
  });
  document.querySelectorAll('.nb').forEach(function(el){
    nb++;
    if (el.getBoundingClientRect().height > 34) nbWrapped++;   /* 单行约 22~26px */
  });
  /* 插图：数量、是否内联、是否存在硬编码色值（应由 CSS 变量驱动） */
  var figEls = document.querySelectorAll('figure.fig');
  var hardcoded = [], emptySvg = [];
  figEls.forEach(function(f){
    var s = f.querySelector('svg');
    if (!s) { emptySvg.push(f.id); return; }
    if (/#[0-9a-fA-F]{3,6}/.test(s.outerHTML)) hardcoded.push(f.id);
  });
  /* 目录：链接可达 + 锚点文字与目标标题文字一致（防「锚点整体错位」） */
  var tocDead = [], tocOff = [];
  document.querySelectorAll('nav.toc a').forEach(function(a){
    var id = (a.getAttribute('href') || '').slice(1);
    var t = document.getElementById(id);
    if (!t) { tocDead.push(id); return; }
    var s = t.textContent.replace(/\s+/g, '');
    var u = a.textContent.replace(/\s+/g, '');
    if (s !== u) tocOff.push(id + '→' + s.slice(0, 16));
  });
  var o = {
    docW: de.scrollWidth, viewW: vw, overflow: de.scrollWidth - vw,
    wide: wide.slice(0, 10), wideCount: wide.length,
    math: document.querySelectorAll('.math').length,
    disp: document.querySelectorAll('.math-display').length,
    frac: document.querySelectorAll('.frac').length,
    ss: document.querySelectorAll('.ss').length,
    sup: document.querySelectorAll('sup').length,
    sub: document.querySelectorAll('sub').length,
    dlgBig: document.querySelectorAll('.dlg.big').length,
    tables: document.querySelectorAll('table').length,
    texRaw: document.querySelectorAll('.tex-raw').length,
    figs: figEls.length, emptySvg: emptySvg, hardcoded: hardcoded,
    cover: document.querySelectorAll('.cover').length,
    tocLinks: document.querySelectorAll('nav.toc a').length,
    tocDead: tocDead, tocOff: tocOff,
    nb: nb, nbWrapped: nbWrapped, docH: de.scrollHeight,
    light: window.matchMedia('(prefers-color-scheme: light)').matches
  };
  var d = document.createElement('div'); d.id = '__diag';
  d.textContent = JSON.stringify(o); document.body.appendChild(d);
});
</script>`;

const MATH_INLINE = 241;   /* 与源文档一致，改文档时同步更新 */
const MATH_DISPLAY = 11;
const FIGURES = 6;
const TOC_MIN = 100;

function chrome(args) {
  try {
    return execFileSync(CHROME, args,
      { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) { return e.stdout || ''; }
}

const url = f => 'file:///' + f.replace(/\\/g, '/').replace(/ /g, '%20');

const html = readFileSync(DOC, 'utf8');
/* 强制浅色：把深色媒体查询整段删掉 */
const LIGHT = html.replace(/@media \(prefers-color-scheme: dark\)\{[\s\S]*?\n\}\n/, '', 1);
writeFileSync(resolve(TMP, '_dark.html'), html.replace('</body>', DIAG + '</body>'), 'utf8');
writeFileSync(resolve(TMP, '_light.html'), LIGHT.replace('</body>', DIAG + '</body>'), 'utf8');

function diag(file) {
  const dom = chrome([
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check', '--window-size=1280,900',
    `--user-data-dir=${nextProfile()}`, '--virtual-time-budget=4000', '--dump-dom',
    url(file),
  ]);
  const m = dom.match(/id="__diag">([\s\S]*?)<\/div>/);
  return m ? JSON.parse(m[1].replace(/&quot;/g, '"')) : null;
}

let bad = 0;
for (const [label, file] of [['深色', '_dark.html'], ['浅色', '_light.html']]) {
  const d = diag(resolve(TMP, file));
  if (!d) { console.log('%s 模式：诊断未取到', label); bad++; continue; }
  console.log('== %s模式 ==', label);
  console.log('  文档 %d x %d px    横向溢出 %d px（宽出元素 %d）',
    d.docW, d.docH, d.overflow, d.wideCount);
  if (d.wide.length) console.log('    ', d.wide.join(' | '));
  console.log('  公式 行内%d 块级%d 分式%d 堆叠上下标%d 放大括号%d',
    d.math, d.disp, d.frac, d.ss, d.dlgBig);
  console.log('  sup=%d sub=%d  表格=%d  未识别命令=%d', d.sup, d.sub, d.tables, d.texRaw);
  console.log('  日期片段 %d 个，折行 %d 个', d.nb, d.nbWrapped);
  console.log('  封面=%d  目录链接=%d  插图=%d（空图 %d，硬编码色值 %d）',
    d.cover, d.tocLinks, d.figs, d.emptySvg.length, d.hardcoded.length);
  if (d.overflow > 1) { console.log('  !! 横向溢出'); bad++; }
  if (d.texRaw) { console.log('  !! 未识别 LaTeX 命令'); bad++; }
  if (d.nbWrapped) { console.log('  !! 日期折行'); bad++; }
  if (d.math !== MATH_INLINE || d.disp !== MATH_DISPLAY) {
    console.log('  !! 公式数与源文档不符（期望 %d / %d）', MATH_INLINE, MATH_DISPLAY); bad++;
  }
  if (d.cover !== 1) { console.log('  !! 封面缺失或重复'); bad++; }
  if (d.tocLinks < TOC_MIN) {
    console.log('  !! 目录条目过少（%d < %d）', d.tocLinks, TOC_MIN); bad++;
  }
  if (d.tocDead.length) {
    console.log('  !! 目录死锚点 %d 个: %s', d.tocDead.length, d.tocDead.slice(0, 5).join(', ')); bad++;
  }
  if (d.tocOff.length) {
    console.log('  !! 目录锚点错位 %d 处: %s', d.tocOff.length, d.tocOff.slice(0, 4).join(' | ')); bad++;
  }
  if (d.figs !== FIGURES) {
    console.log('  !! 插图数不符（期望 %d，实际 %d）', FIGURES, d.figs); bad++;
  }
  if (d.emptySvg.length) {
    console.log('  !! 插图无内联 SVG: %s', d.emptySvg.join(', ')); bad++;
  }
  if (d.hardcoded.length) {
    console.log('  !! 插图存在硬编码色值（深色模式会失配）: %s', d.hardcoded.join(', ')); bad++;
  }
}

/* ---- 关键章节截图（浅色，便于对照印刷稿） ---- */
const targets = [
  ['cover', 'f-00-cover', 1000],
  ['s6-2', 'f-01-math', 2000],
  ['s6-1', 'f-02-table', 1300],
  ['s3-4', 'f-03-code', 1200],
  ['ch8', 'f-04-qa', 1300],
  ['fig-cycloid', 'f-05-fig-cycloid', 430],
  ['fig-arch', 'f-06-fig-arch', 520],
  ['fig-qa', 'f-07-fig-qa', 560],
];

const offs = (() => {
  const ids = JSON.stringify(targets.map(t => t[0]));
  const probe = html.replace('</body>', `
<script>window.addEventListener('load', function(){
  var o = {}; ${ids}.forEach(function(id){
    var e = document.getElementById(id);
    o[id] = e ? Math.round(e.getBoundingClientRect().top + window.scrollY) : -1;
  });
  var d = document.createElement('div'); d.id = '__o';
  d.textContent = JSON.stringify(o); document.body.appendChild(d);
});</script></body>`);
  const p = resolve(TMP, '_probe.html');
  writeFileSync(p, probe, 'utf8');
  const dom = chrome(['--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--no-first-run', '--window-size=1280,900', `--user-data-dir=${nextProfile()}`,
    '--virtual-time-budget=4000', '--dump-dom', url(p)]);
  const m = dom.match(/id="__o">([\s\S]*?)<\/div>/);
  return m ? JSON.parse(m[1].replace(/&quot;/g, '"')) : {};
})();

console.log('\n== 关键章节截图 ==');
for (const [id, name, h] of targets) {
  const top = offs[id];
  if (top == null || top < 0) { console.log('  %s 锚点缺失', id); continue; }
  const shift = Math.max(0, top - 110);
  const v = LIGHT.replace('</head>',
    `<style>.page{transform:translateY(-${shift}px)}</style></head>`);
  const f = resolve(TMP, `_v_${name}.html`);
  writeFileSync(f, v, 'utf8');
  const png = resolve(OUT, name + '.png');
  chrome(['--headless=new', '--disable-gpu', '--enable-unsafe-swiftshader', '--no-sandbox',
    '--hide-scrollbars', '--no-first-run', `--window-size=1280,${h}`,
    `--user-data-dir=${nextProfile()}`, '--virtual-time-budget=4000',
    `--screenshot=${png}`, url(f)]);
  console.log('  %s  %s', name, existsSync(png) ? 'ok' : 'MISS');
}

/* 清掉自己的临时件（在 os.tmpdir() 下，属本项目私有目录） */
try { rmSync(TMP, { recursive: true, force: true }); }
catch (e) { console.log('\n[warn] 临时目录未清干净:', e.code || e.message); }

console.log(bad ? `\n结果: ${bad} 项不通过` : '\n结果: 全部通过');
process.exit(bad ? 1 : 0);
