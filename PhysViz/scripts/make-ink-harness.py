# -*- coding: utf-8 -*-
"""生成一个只在本地截图用的标注测试页：
把 dist/index.html 复制一份，在 </body> 前注入一段合成 PointerEvent 的脚本，
用来验证「图形模式」的绘制链路（生产文件不受影响）。"""
import io
import os

ROOT = r'C:\Users\fnw\WorkBuddy AI\2026-09-11-19-29-18\physviz'
SRC = os.path.join(ROOT, 'dist', 'index.html')
DST = os.path.join(ROOT, 'shots', '_ink.html')

INJECT = """
<script>
(function () {
  function pe(el, type, x, y, buttons) {
    el.dispatchEvent(new PointerEvent(type, {
      clientX: x, clientY: y, buttons: buttons, button: 0,
      pointerId: 1, isPrimary: true, bubbles: true, cancelable: true,
    }));
  }
  function tool(i) { document.querySelectorAll('#ink-tools .ink-t')[i].click(); }
  function run() {
    var ink = document.getElementById('ink');
    var r = ink.getBoundingClientRect();
    var cx = r.left + r.width * 0.30, cy = r.top + r.height * 0.34;

    // 椭圆：圈住摆线的一个拱
    tool(4);
    pe(ink, 'pointerdown', cx - 88, cy - 52, 1);
    pe(ink, 'pointermove', cx + 88, cy + 52, 1);
    pe(ink, 'pointerup',   cx + 88, cy + 52, 0);

    // 箭头：从右下方指向椭圆
    tool(2);
    pe(ink, 'pointerdown', cx + 190, cy + 150, 1);
    pe(ink, 'pointermove', cx + 96,  cy + 62,  1);
    pe(ink, 'pointerup',   cx + 96,  cy + 62,  0);

    // 自由线：随手画一道下划线
    tool(0);
    pe(ink, 'pointerdown', cx - 150, cy + 150, 1);
    for (var i = 1; i <= 30; i++) {
      pe(ink, 'pointermove', cx - 150 + i * 9, cy + 150 + Math.sin(i / 3) * 12, 1);
    }
    pe(ink, 'pointerup', cx + 120, cy + 150, 0);
  }
  setTimeout(run, 1200);
})();
</script>
"""

html = io.open(SRC, encoding='utf-8').read()
assert html.count('</body>') == 1, 'index.html 里 </body> 不唯一'
html = html.replace('</body>', INJECT + '</body>')
io.open(DST, 'w', encoding='utf-8', newline='').write(html)
print('wrote', DST, os.path.getsize(DST), 'bytes')
