/* 把 dist/index.html 复制一份并注入错误陷阱，用来在无头环境里看到 JS 报错。
   生产文件不受影响。用法：
     node scripts/make-err-harness.mjs
     chrome --headless=new ... --dump-dom "file:///.../shots/_err.html?model=orbit"
   陷阱会捕获 error / unhandledrejection / console.error / console.warn。
   warn 也抓 —— 因为渲染层的"降级跳过"通常只发 warn，
   不抓的话就会出现"画面看着正常、其实某条辅助线悄悄没了"的假通过。 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8');

const TRAP = `
<div id="__err" style="position:fixed;left:0;bottom:0;z-index:9999;background:#fee;color:#900;
  font:12px monospace;padding:6px;max-width:100%;white-space:pre-wrap"></div>
<div id="__warn" style="position:fixed;left:0;bottom:120px;z-index:9999;background:#ffd;color:#770;
  font:12px monospace;padding:6px;max-width:100%;white-space:pre-wrap"></div>
<div id="__diag" style="display:none"></div>
<script>
window.__errs = []; window.__warns = [];
function __err(m){
  window.__errs.push(m);
  var el = document.getElementById('__err');
  if (el) el.textContent = window.__errs.join('\\n\\n');
  document.title = 'ERR:' + m.slice(0, 200);
}
function __warn(m){
  window.__warns.push(m);
  var el = document.getElementById('__warn');
  if (el) el.textContent = 'WARN x' + window.__warns.length + '\\n' + window.__warns.join('\\n\\n');
}
window.addEventListener('error', function(e){
  __err((e.message||'') + ' @ ' + (e.filename||'') + ':' + (e.lineno||'') + '\\n' + ((e.error&&e.error.stack)||''));
});
window.addEventListener('unhandledrejection', function(e){
  __err('unhandledrejection: ' + ((e.reason&&e.reason.stack)||e.reason));
});
var __ce = console.error, __cw = console.warn;
console.error = function(){ __ce.apply(console, arguments); __err('console.error: ' + Array.prototype.join.call(arguments,' ')); };
console.warn  = function(){ __cw.apply(console, arguments); __warn(Array.prototype.join.call(arguments,' ')); };

/* 取景诊断：等页面稳定后把"内容占画幅的比例"等数字写进 #__diag，
   截图脚本读它就能自动发现"轨迹缩成一小坨"这类问题。

   另外支持 ?_applytheme=<id>：页面稳定后再调一次 applyTheme ——
   走的是和"点主题按钮"完全相同的代码路径。
   只用 ?theme= 验证是不够的：那条路径在 switchModel 之前跑，
   和用户点按钮时（模型早就初始化好了）不是同一个上下文。 */
function __diag(){
  var p = window.physviz;
  if (!p) { document.getElementById('__diag').textContent = 'no-physviz'; return; }
  var qs = new URLSearchParams(location.search);
  var at = qs.get('_applytheme');
  if (at) { try { p.applyTheme(at); } catch (e) { __err('applyTheme(' + at + ') 抛错: ' + (e.stack || e)); } }
  var f = p.fill();
  var ts = p.trajSpan();
  document.getElementById('__diag').textContent = JSON.stringify({
    model: p.modelId, preset: p.presetId, view: p.view.key, theme: at || null,
    fill: f ? { w: +f.w.toFixed(3), h: +f.h.toFixed(3), max: +f.max.toFixed(3) } : null,
    span: ts ? { w: +ts.w.toFixed(4), h: +ts.h.toFixed(4) } : null,
    camera: p.camera, bounds: p.bounds, traj: p.trajCount,
  });
}
var __n = 0;
var __t = setInterval(function(){ __n++; if (window.physviz || __n > 40) { clearInterval(__t); __diag(); } }, 60);
</script>
`;

const out = html.replace('<body>', '<body>' + TRAP);
if (!existsSync(resolve(root, 'shots'))) mkdirSync(resolve(root, 'shots'));
writeFileSync(resolve(root, 'shots/_err.html'), out);
console.log('✓ shots/_err.html');
