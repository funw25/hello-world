# -*- coding: utf-8 -*-
"""DESIGN.md -> DESIGN.html

零依赖 Markdown + LaTeX 子集渲染器，面向本项目文档的实际语法子集。
不引入 KaTeX / MathJax：交付物要求 file:// 离线可用、零外部引用。

用法（在 physviz/ 下）：
    python scripts/md2html.py            # 读 ../DESIGN.md，写 ../DESIGN.html
    python scripts/md2html.py <src.md>   # 指定源文件

覆盖的语法子集（超出部分会被显式标红为 .tex-raw，不会静默丢失）：
    块级  #~#### 标题、--- 分隔线、| 表格 |、- / 1. 列表、> 引用、``` 围栏代码
    行内  **粗**  *斜*  `代码`  $行内公式$  $$块级公式$$
    数学  \\frac \\tfrac \\sqrt \\left..\\right \\mathbf \\mathrm \\text
          \\theta 等希腊字母，\\times \\cdot \\le \\to \\Longrightarrow 等符号
          ^ _ 上下标（相邻的上下标自动堆叠）、\\hat \\dot \\ddot \\bar \\vec
          \\begin{aligned}..\\end{aligned}
    插图  ![图 3-1 标题](fig:键)  —— 键由 doc_figures.py 提供，渲染为内联矢量图

版式
    封面页由文首的 h1 / h2 / 「项目-内容」表自动生成；「目录」小节由标题树
    自动展开为三级带锚点目录；正文每章前分页，便于直接打印或导出 PDF。
"""
import re
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent          # physviz/scripts
_ROOT = _HERE.parent.parent                      # 工作区根目录
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else _ROOT / "DESIGN.md"
OUT = SRC.with_suffix(".html")

sys.dont_write_bytecode = True      # 不为 doc_figures 留 __pycache__，保持源码目录干净
sys.path.insert(0, str(_HERE))
from doc_figures import FIGURES, FIG_LABELS      # noqa: E402

# ---------------------------------------------------------------- LaTeX

GREEK = {
    "alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ε",
    "varepsilon": "ε", "zeta": "ζ", "eta": "η", "theta": "θ", "vartheta": "ϑ",
    "iota": "ι", "kappa": "κ", "lambda": "λ", "mu": "μ", "nu": "ν", "xi": "ξ",
    "pi": "π", "rho": "ρ", "sigma": "σ", "tau": "τ", "upsilon": "υ",
    "phi": "φ", "varphi": "φ", "chi": "χ", "psi": "ψ", "omega": "ω",
    "Gamma": "Γ", "Delta": "Δ", "Theta": "Θ", "Lambda": "Λ", "Xi": "Ξ",
    "Pi": "Π", "Sigma": "Σ", "Upsilon": "Υ", "Phi": "Φ", "Psi": "Ψ",
    "Omega": "Ω",
}

SYM = {
    "times": "×", "cdot": "·", "div": "÷", "pm": "±", "mp": "∓",
    "le": "≤", "leq": "≤", "ge": "≥", "geq": "≥", "ne": "≠", "neq": "≠",
    "approx": "≈", "equiv": "≡", "sim": "∼", "simeq": "≃", "propto": "∝",
    "to": "→", "rightarrow": "→", "longrightarrow": "⟶",
    "leftarrow": "←", "Rightarrow": "⇒", "Longrightarrow": "⟹",
    "leftrightarrow": "↔", "Leftrightarrow": "⇔",
    "infty": "∞", "perp": "⊥", "parallel": "∥", "oplus": "⊕", "otimes": "⊗",
    "checkmark": "✓", "sum": "Σ", "prod": "Π", "int": "∫", "oint": "∮",
    "partial": "∂", "nabla": "∇", "ell": "ℓ", "hbar": "ℏ", "circ": "∘",
    "degree": "°", "angle": "∠", "in": "∈", "notin": "∉", "subset": "⊂",
    "cup": "∪", "cap": "∩", "forall": "∀", "exists": "∃", "emptyset": "∅",
    "ll": "≪", "gg": "≫", "star": "⋆", "ast": "∗", "dagger": "†",
    "lvert": "|", "rvert": "|", "vert": "|", "lVert": "‖", "rVert": "‖",
    "langle": "⟨", "rangle": "⟩", "qquad": "\u2003\u2003", "quad": "\u2003",
    "bigl": "", "bigr": "", "Bigl": "", "Bigr": "", "big": "", "Big": "",
}

OPNAMES = {
    "sin", "cos", "tan", "cot", "sec", "csc", "arcsin", "arccos", "arctan",
    "sinh", "cosh", "tanh", "ln", "log", "lg", "exp", "max", "min", "sup",
    "inf", "lim", "det", "gcd", "mod", "bmod",
}

WRAP1 = {
    "mathbf", "boldsymbol", "bm", "pmb", "mathrm", "textrm", "text",
    "mathit", "textit", "mathsf", "mathtt", "operatorname", "mbox",
}

ACCENT = {
    "hat": "\u0302", "widehat": "\u0302", "check": "\u030C",
    "dot": "\u0307", "ddot": "\u0308", "bar": "\u0304",
    "overline": "\u0304", "vec": "\u20D7", "tilde": "\u0303",
    "widetilde": "\u0303", "breve": "\u0306",
}

FRACS = {"frac", "dfrac", "tfrac", "cfrac"}

ESC = {"&": "&amp;", "<": "&lt;", ">": "&gt;"}


def _esc(s):
    return "".join(ESC.get(c, c) for c in s)


def _group(s, i):
    """从 s[i] 读一个参数组，返回 (内容, 新下标)。"""
    n = len(s)
    while i < n and s[i] == " ":
        i += 1
    if i >= n:
        return "", i
    if s[i] == "{":
        depth = 0
        j = i
        while j < n:
            if s[j] == "\\":
                j += 2
                continue
            if s[j] == "{":
                depth += 1
            elif s[j] == "}":
                depth -= 1
                if depth == 0:
                    return s[i + 1:j], j + 1
            j += 1
        return s[i + 1:], n
    if s[i] == "\\":
        m = re.match(r"\\([a-zA-Z]+)", s[i:])
        if m:
            return s[i:i + 1 + len(m.group(1))], i + 1 + len(m.group(1))
        return s[i:i + 2], i + 2
    return s[i], i + 1


def math(s):
    """渲染一段数学源码为 HTML（无 $ 定界符）。"""
    s = s.strip()
    m = re.match(r"\\begin\{(\w+)\}([\s\S]*?)\\end\{\1\}$", s)
    if m:
        rows = re.split(r"\\\\", m.group(2))
        lines = [math(r.replace("&", "")) for r in rows if r.strip()]
        return '<div class="aligned">' + "<br>".join(lines) + "</div>"
    return _m(s)


def _m(s):
    out = []
    dstack = []
    i = 0
    n = len(s)
    while i < n:
        c = s[i]
        if c == "\\":
            if i + 1 < n and not s[i + 1].isalpha():
                k = s[i + 1]
                i += 2
                if k == ",":
                    out.append("\u2009")
                elif k == ";":
                    out.append("\u2002")
                elif k == "!":
                    out.append("")
                elif k == " ":
                    out.append("\u00a0")
                elif k in "{}%&$#_":
                    out.append(_esc(k))
                else:
                    out.append(_esc(k))
                continue
            m = re.match(r"\\([a-zA-Z]+)", s[i:])
            if not m:
                out.append("\\")
                i += 1
                continue
            name = m.group(1)
            i += 1 + len(name)
            if name in ("left", "right"):
                j = i
                while j < n and s[j] == " ":
                    j += 1
                d = s[j] if j < n else ""
                if name == "left":
                    seg = s[j:]
                    rp = seg.find("\\right")
                    inner = seg[:rp] if rp >= 0 else seg
                    big = bool(re.search(
                        r"\\(?:[tdc]?frac|sqrt|sum|int|prod)", inner))
                    dstack.append(big)
                else:
                    big = dstack.pop() if dstack else False
                if d in ("", "."):
                    i = j
                    continue
                i = j + 1
                out.append('<span class="dlg big">%s</span>' % _esc(d) if big
                           else _esc(d))
                continue
            html, i = _cmd(name, s, i)
            out.append(html)
            continue
        if c in "^_":
            i += 1
            arg1, i = _group(s, i)
            j = i
            while j < n and s[j] == " ":
                j += 1
            if j < n and s[j] in "^_" and s[j] != c:
                other = s[j]
                j += 1
                arg2, j = _group(s, j)
                i = j
                sup = arg2 if c == "_" else arg1
                sub = arg1 if c == "_" else arg2
                out.append('<span class="ss"><sup>%s</sup><sub>%s</sub></span>'
                           % (_m(sup), _m(sub)))
            else:
                tag = "sup" if c == "^" else "sub"
                out.append("<%s>%s</%s>" % (tag, _m(arg1), tag))
            continue
        if c == " ":
            out.append(" ")
            i += 1
            continue
        if c == "-":
            out.append("\u2212")
            i += 1
            continue
        if c == "'":
            out.append("\u2032")
            i += 1
            continue
        if c == "~":
            out.append("\u00a0")
            i += 1
            continue
        out.append(_esc(c))
        i += 1
    return "".join(out)


def _cmd(name, s, i):
    if name in WRAP1:
        arg, i = _group(s, i)
        inner = _m(arg)
        if name in ("mathbf", "boldsymbol", "bm", "pmb"):
            return "<b>%s</b>" % inner, i
        if name in ("text", "textrm"):
            return '<span class="txt">%s</span>' % inner, i
        return '<span class="rm">%s</span>' % inner, i
    if name in FRACS:
        a, i = _group(s, i)
        b, i = _group(s, i)
        cls = "frac small" if name == "tfrac" else "frac"
        return ('<span class="%s"><span class="fn">%s</span>'
                '<span class="fd">%s</span></span>'
                % (cls, _m(a), _m(b))), i
    if name == "sqrt":
        a, i = _group(s, i)
        return ('<span class="sqrt"><span class="rad">√</span>'
                '<span class="radicand">%s</span></span>' % _m(a)), i
    if name in ACCENT:
        a, i = _group(s, i)
        return _m(a) + ACCENT[name], i
    if name in ("left", "right"):
        return "", i
    if name in ("bigl", "bigr", "Bigl", "Bigr", "big", "Big", "biggl", "biggr"):
        return "", i
    if name in OPNAMES:
        return '<span class="op">%s</span>' % name, i
    if name in GREEK:
        return GREEK[name], i
    if name in SYM:
        return SYM[name], i
    # 未识别命令：原样保留并显式标注，便于人工核查
    return '<span class="tex-raw">\\%s</span>' % name, i


# ---------------------------------------------------------------- Markdown

TOKEN = "\u0002"
FIG_RE = re.compile(r"!\[([^\]]*)\]\(fig:([A-Za-z0-9_-]+)\)")


def pre_extract(text):
    """抽出围栏代码块与数学公式，替换为占位符。"""
    store = []

    def put(html):
        store.append(html)
        return "%s%d%s" % (TOKEN, len(store) - 1, TOKEN)

    def fence(m):
        lang = m.group(1).strip()
        body = m.group(2)
        cls = ' class="code lang-%s"' % lang if lang else ' class="code"'
        return put("<pre%s><code>%s</code></pre>" % (cls, _esc(body.rstrip("\n"))))

    text = re.sub(r"```(\w*)\r?\n([\s\S]*?)```", fence, text)

    def blk(m):
        return put('<div class="math-display">%s</div>' % math(m.group(1)))

    text = re.sub(r"\$\$([\s\S]+?)\$\$", blk, text)

    def inl(m):
        return put('<span class="math">%s</span>' % math(m.group(1)))

    text = re.sub(r"(?<!\$)\$([^$\n]+?)\$(?!\$)", inl, text)
    return text, store


def restore(html, store):
    return re.sub(TOKEN + r"(\d+)" + TOKEN, lambda m: store[int(m.group(1))], html)


def _curly(t):
    """把正文直双引号成对转成中文弯引号；配不成对的整段保持原样。"""
    n = t.count('"')
    if n == 0 or n % 2:
        return t
    out = []
    opening = True
    for ch in t:
        if ch == '"':
            out.append("\u201c" if opening else "\u201d")
            opening = not opening
        else:
            out.append(ch)
    return "".join(out)


def inline(text):
    """行内元素：转义 -> 隔离行内代码 -> 弯引号 -> 日期不折行 -> 加粗 -> 斜体。"""
    t = _esc(text)
    codes = []

    def grab(m):
        codes.append(m.group(1))
        return "\u0003%d\u0003" % (len(codes) - 1)

    t = re.sub(r"`([^`]+)`", grab, t)
    t = _curly(t)
    t = re.sub(r"(?<![\w>])(\d{4}-\d{2}-\d{2})(?![\w<])",
               r'<span class="nb">\1</span>', t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<!\*)\*([^*\n]+?)\*(?!\*)", r"<i>\1</i>", t)
    t = re.sub("\u0003" + r"(\d+)" + "\u0003",
               lambda m: "<code>%s</code>" % codes[int(m.group(1))], t)
    return t


def slugify(text):
    t = re.sub(r"<[^>]+>", "", text)
    t = t.strip()
    m = re.match(r"^第\s*(\d+)\s*章", t)
    if m:
        return "ch%s" % m.group(1)
    m = re.match(r"^附录\s*([A-Z])", t)
    if m:
        return "apx-%s" % m.group(1)
    m = re.match(r"^(\d+(?:\.\d+)+)", t)
    if m:
        return "s" + m.group(1).replace(".", "-")
    m = re.match(r"^(\d+)\.(\d+)", t)
    if m:
        return "s%s-%s" % (m.group(1), m.group(2))
    return "h-" + re.sub(r"[^\w\u4e00-\u9fff]+", "-", t)[:40].strip("-")


def blocks(text):
    """切分为块序列。"""
    lines = text.split("\n")
    out = []
    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i]
        s = raw.rstrip()
        if not s.strip():
            i += 1
            continue
        # 占位符独占一行（代码块 / 块级公式）
        if re.fullmatch(TOKEN + r"\d+" + TOKEN, s.strip()):
            out.append(("raw", s.strip()))
            i += 1
            continue
        if s.strip() == "---" or re.fullmatch(r"-{3,}", s.strip()):
            out.append(("hr", ""))
            i += 1
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", s)
        if m:
            out.append(("h%d" % len(m.group(1)), m.group(2).strip()))
            i += 1
            continue
        if s.lstrip().startswith(">"):
            buf = []
            while i < n and lines[i].lstrip().startswith(">"):
                buf.append(lines[i].lstrip()[1:].strip())
                i += 1
            out.append(("quote", buf))
            continue
        if s.startswith("|"):
            buf = []
            while i < n and lines[i].rstrip().startswith("|"):
                buf.append(lines[i].rstrip())
                i += 1
            out.append(("table", buf))
            continue
        if re.match(r"^\s*[-*]\s+", s):
            buf = []
            while i < n and re.match(r"^\s*[-*]\s+", lines[i].rstrip()):
                buf.append(re.sub(r"^\s*[-*]\s+", "", lines[i].rstrip()))
                i += 1
            out.append(("ul", buf))
            continue
        if re.match(r"^\s*\d+\.\s+", s):
            buf = []
            while i < n and re.match(r"^\s*\d+\.\s+", lines[i].rstrip()):
                buf.append(re.sub(r"^\s*\d+\.\s+", "", lines[i].rstrip()))
                i += 1
            out.append(("ol", buf))
            continue
        m = FIG_RE.fullmatch(s.strip())
        if m:
            out.append(("fig", (m.group(1), m.group(2))))
            i += 1
            continue
        # 段落
        buf = [s]
        i += 1
        while i < n:
            nxt = lines[i].rstrip()
            if not nxt.strip():
                break
            if re.match(r"^\s*([-*]\s+|\d+\.\s+|#{1,6}\s+|\||>)", nxt):
                break
            if nxt.strip() == "---":
                break
            if FIG_RE.fullmatch(nxt.strip()):
                break
            if re.fullmatch(TOKEN + r"\d+" + TOKEN, nxt.strip()):
                break
            buf.append(nxt)
            i += 1
        out.append(("p", buf))
    return out


def parse_table(rows):
    cells = []
    for r in rows:
        r = r.strip()
        if r.startswith("|"):
            r = r[1:]
        if r.endswith("|"):
            r = r[:-1]
        cells.append([c.strip() for c in r.split("|")])
    if len(cells) >= 2 and all(re.fullmatch(r":?-{2,}:?", c) for c in cells[1]):
        head = cells[0]
        body = cells[2:]
        aligns = []
        for c in cells[1]:
            if c.startswith(":") and c.endswith(":"):
                aligns.append("center")
            elif c.endswith(":"):
                aligns.append("right")
            else:
                aligns.append("left")
    else:
        head = None
        body = cells
        aligns = None
    return head, body, aligns


def is_head(kind):
    return len(kind) == 2 and kind[0] == "h" and kind[1].isdigit()


REPORT = {}          # 渲染过程记录，供 main() 自检

CH_RE = re.compile(r"^第\s*\d+\s*章")
APX_RE = re.compile(r"^附录\s*[A-Z]")
SEC2_RE = re.compile(r"^\d+\.\d+\s")
SEC3_RE = re.compile(r"^\d+\.\d+\.\d+\s")


def _plain(payload):
    return re.sub(r"[*`]", "", payload).strip()


def build_cover(blks):
    """用文首的 h1 / h2 / 「项目-内容」表生成封面。返回 (html, 已消费下标集合)。"""
    title = sub = None
    meta = None
    used = set()
    for i, (kind, payload) in enumerate(blks):
        if is_head(kind) and int(kind[1]) == 1 and title is None:
            title = _plain(payload)
            used.add(i)
            continue
        if is_head(kind) and int(kind[1]) == 2 and title is not None and sub is None:
            sub = _plain(payload)
            used.add(i)
            continue
        if kind == "table" and sub is not None:
            head, body, _ = parse_table(payload)
            if head == ["项目", "内容"]:
                meta = [(r + ["", ""])[:2] for r in body]
                used.add(i)
            break
    info = dict((a, b) for a, b in (meta or []))
    rows = "".join('<tr><th>%s</th><td>%s</td></tr>' % (inline(a), inline(b))
                   for a, b in (meta or []))
    return ("".join([
        '<section class="cover" id="cover">',
        '<div class="cover-top"><span>%s</span><span>%s</span></div>'
        % (info.get("文档编号", ""), info.get("版本", "")),
        '<div class="cover-mid">',
        '<h1 class="cover-title">%s</h1>' % inline(title or ""),
        '<div class="cover-sub">%s</div>' % inline(sub or ""),
        '<div class="cover-line"></div>',
        '</div>',
        '<table class="cover-meta"><tbody>%s</tbody></table>' % rows,
        '<div class="cover-foot">本文档为自包含 HTML：零外部引用、可离线阅读，'
        '亦可直接打印或导出 PDF（正文含 6 幅矢量插图）。</div>',
        '</section>',
    ]), used)


def build_toc(seq):
    """按标题树展开三级目录。seq = [(kind, payload, sid), ...]。"""
    nodes = []
    for kind, payload, sid in seq:
        lvl = int(kind[1])
        t = _plain(payload)
        if lvl == 1 and (CH_RE.match(t) or APX_RE.match(t)):
            nodes.append({"lvl": 1, "t": t, "sid": sid, "kids": []})
        elif t == "摘要":
            nodes.append({"lvl": 1, "t": t, "sid": sid, "kids": []})
        elif lvl == 2 and SEC2_RE.match(t):
            nodes.append({"lvl": 2, "t": t, "sid": sid, "kids": []})
        elif lvl == 3 and SEC3_RE.match(t):
            nodes.append({"lvl": 3, "t": t, "sid": sid, "kids": []})

    root = []
    stack = [(0, root)]
    for n in nodes:
        while stack[-1][0] >= n["lvl"]:
            stack.pop()
        node = {"lvl": n["lvl"], "t": n["t"], "sid": n["sid"], "kids": []}
        stack[-1][1].append(node)
        stack.append((n["lvl"], node["kids"]))

    def emit(ns):
        out = []
        for n in ns:
            out.append('<li class="toc-l%d"><a href="#%s">%s</a>'
                       % (n["lvl"], n["sid"], inline(n["t"])))
            if n["kids"]:
                out.append("<ol>%s</ol>" % emit(n["kids"]))
            out.append("</li>")
        return "".join(out)

    REPORT["toc_count"] = len(nodes)
    return '<nav class="toc"><ol>%s</ol></nav>' % emit(root)


def render(blks):
    # 先收集标题 -> id（按块下标索引，封面消费掉的块同样占用下标，
    # 否则其后每个标题都会拿到前一个标题的 id —— 锚点整体错位）
    ids = {}
    sid_of = {}
    seq = []
    for bi, (kind, payload) in enumerate(blks):
        if is_head(kind):
            txt = _plain(payload)
            sid = slugify(payload)
            base = sid
            k = 2
            while sid in ids:
                sid = "%s-%d" % (base, k)
                k += 1
            ids[txt] = sid
            sid_of[bi] = sid
            seq.append((kind, payload, sid))

    cover, cover_used = build_cover(blks)
    toc = build_toc(seq)

    html = [cover]
    in_toc = False
    fig_used = []
    for bi, (kind, payload) in enumerate(blks):
        if bi in cover_used:
            continue
        if is_head(kind):
            lvl = int(kind[1])
            sid = sid_of[bi]
            txt = _plain(payload)
            html.append('<h%d id="%s">%s</h%d>' % (lvl, sid, inline(payload), lvl))
            in_toc = (txt == "目录")
            continue
        if kind == "hr":
            html.append("<hr>")
            in_toc = False
            continue
        if kind == "p":
            html.append("<p>%s</p>" % inline(" ".join(payload)))
            continue
        if kind == "raw":
            html.append(payload)
            continue
        if kind == "quote":
            html.append("<blockquote>%s</blockquote>"
                        % "<br>".join(inline(x) for x in payload))
            continue
        if kind == "fig":
            cap, key = payload
            if key not in FIGURES:
                raise SystemExit("!! 未定义的插图键: fig:%s" % key)
            if key in fig_used:
                raise SystemExit("!! 插图重复引用: fig:%s" % key)
            fig_used.append(key)
            html.append('<figure class="fig" id="fig-%s">%s'
                        '<figcaption>%s</figcaption></figure>'
                        % (key, FIGURES[key](), inline(cap)))
            continue
        if kind == "ul":
            if in_toc:
                html.append(toc)
                in_toc = False
                continue
            html.append("<ul>%s</ul>"
                        % "".join("<li>%s</li>" % inline(x) for x in payload))
            continue
        if kind == "ol":
            html.append("<ol>%s</ol>"
                        % "".join("<li>%s</li>" % inline(x) for x in payload))
            continue
        if kind == "table":
            head, body, aligns = parse_table(payload)
            width = max(len(r) for r in ([head] if head else []) + body)
            cls = ' class="docinfo"' if width == 2 and head == ["项目", "内容"] else ""
            out = ["<table%s>" % cls]
            if head:
                out.append("<thead><tr>"
                           + "".join("<th>%s</th>" % inline(c) for c in head)
                           + "</tr></thead>")
            out.append("<tbody>")
            for r in body:
                r = (r + [""] * width)[:width]
                out.append("<tr>" + "".join("<td>%s</td>" % inline(c) for c in r)
                           + "</tr>")
            out.append("</tbody></table>")
            html.append("".join(out))
            continue
    REPORT["figs"] = fig_used
    return "".join(html)


CSS = """
:root{
  --ink:#1a1a1a; --ink-2:#3d3d3d; --ink-3:#6b6b6b;
  --bg:#ffffff; --bg-2:#f7f7f5; --bg-3:#f0f0ec;
  --line:#d8d8d2; --line-2:#c2c2ba;
  --accent:#8a1f1f; --accent-2:#b03434;
  --code-bg:#f4f4f0; --code-ink:#8a1f1f;
  --fig-line:#d8d8d2; --fig-line2:#b4b4ac;
  --fig-fill:#f7f7f5; --fig-fill-2:#f0f0ec; --fig-fill-3:#eef4ee;
  --fig-1:#2c5f8a; --fig-2:#9c2b2b; --fig-3:#2f6b3f; --fig-4:#8a6a1f; --fig-5:#5b3f80;
  --serif:"Source Han Serif SC","Noto Serif CJK SC","Songti SC",SimSun,"Times New Roman",serif;
  --sans:"Source Han Sans SC","Noto Sans CJK SC","Microsoft YaHei","PingFang SC",-apple-system,Segoe UI,sans-serif;
  --mono:"Cascadia Mono",Consolas,"SF Mono",Menlo,monospace;
}
@media (prefers-color-scheme: dark){
  :root{
    --ink:#e8e6e1; --ink-2:#c9c6c0; --ink-3:#9a968f;
    --bg:#16161a; --bg-2:#1d1d22; --bg-3:#25252b;
    --line:#33333c; --line-2:#45454f;
    --accent:#e08585; --accent-2:#f0a0a0;
    --code-bg:#232329; --code-ink:#e8a0a0;
    --fig-line:#33333c; --fig-line2:#5a5a66;
    --fig-fill:#1f1f26; --fig-fill-2:#26262e; --fig-fill-3:#1d2a1f;
    --fig-1:#7fb3dd; --fig-2:#e88b8b; --fig-3:#8cc79a; --fig-4:#d9bb72; --fig-5:#b9a0dd;
  }
}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{
  margin:0; background:var(--bg); color:var(--ink);
  font-family:var(--serif); font-size:16.5px; line-height:1.85;
  text-align:justify; word-wrap:break-word;
}
.page{max-width:860px; margin:0 auto; padding:56px 40px 96px}
h1,h2,h3,h4{font-family:var(--sans); line-height:1.4; text-align:left;
  font-weight:700; margin:2.2em 0 .8em}
h1{font-size:1.72em; color:var(--ink); padding-bottom:.35em;
  border-bottom:2.5px solid var(--accent); margin-top:2.6em}
h1:first-of-type{margin-top:0}
h2{font-size:1.32em; color:var(--ink); padding-left:.6em;
  border-left:5px solid var(--accent)}
h3{font-size:1.12em; color:var(--ink-2); margin-top:1.9em}
h4{font-size:1em; color:var(--ink-2); margin-top:1.6em}
h2+h3,h3+h4{margin-top:1em}
p{margin:.95em 0}
strong,b{font-weight:700; color:var(--ink)}
em,i{font-style:italic}
hr{border:0; height:1px; background:var(--line); margin:2.6em 0}
a{color:var(--accent-2); text-decoration:none; border-bottom:1px solid transparent}
a:hover{border-bottom-color:var(--accent-2)}
ul,ol{margin:.9em 0; padding-left:1.7em}
li{margin:.4em 0}
li>ul,li>ol{margin:.3em 0}
blockquote{
  margin:1.3em 0; padding:.85em 1.2em; background:var(--bg-2);
  border-left:4px solid var(--accent); color:var(--ink-2);
  font-size:.96em; text-align:left
}
blockquote p{margin:.3em 0}
code{
  font-family:var(--mono); font-size:.875em; background:var(--code-bg);
  color:var(--code-ink); padding:.12em .38em; border-radius:3px;
  white-space:nowrap
}
.nb{white-space:nowrap}
pre.code{
  font-family:var(--mono); font-size:.83em; line-height:1.65;
  background:var(--bg-2); border:1px solid var(--line); border-left:4px solid var(--line-2);
  border-radius:5px; padding:1em 1.2em; overflow-x:auto; margin:1.3em 0;
  text-align:left
}
pre.code code{background:none; color:var(--ink-2); padding:0; white-space:pre;
  font-size:1em}
table{
  width:100%; border-collapse:collapse; margin:1.4em 0; font-size:.92em;
  font-family:var(--sans); line-height:1.6
}
th,td{border:1px solid var(--line); padding:.55em .75em; text-align:left;
  vertical-align:top}
th{background:var(--bg-3); font-weight:700; white-space:nowrap}
tbody tr:nth-child(even){background:var(--bg-2)}
table.docinfo{border:0; margin:1.6em 0 2.2em}
table.docinfo th,table.docinfo td{border:0; padding:.3em .9em .3em 0}
table.docinfo th{background:none; color:var(--ink-3); font-weight:400;
  white-space:nowrap; width:6.5em}
table.docinfo tbody tr:nth-child(even){background:none}
/* ---- 数学 ---- */
.math, .math-display{font-family:var(--serif); font-style:normal}
.math{white-space:nowrap}
.math-display{
  margin:1.4em 0; padding:.95em 1em; background:var(--bg-2);
  border-radius:5px; text-align:center; overflow-x:auto; line-height:2.1
}
.math-display .aligned{display:inline-block; text-align:left; line-height:2.1}
.frac{display:inline-flex; flex-direction:column; vertical-align:middle;
  text-align:center; margin:0 .18em; line-height:1.25; font-size:.98em}
.frac>.fn{border-bottom:1.2px solid currentColor; padding:0 .3em}
.frac>.fd{padding:0 .3em}
.frac.small{font-size:.8em}
.dlg.big{display:inline-block; transform:scaleY(2.05); transform-origin:center;
  font-size:1.02em; line-height:1; margin:0 .04em}
.sqrt{white-space:nowrap}
.sqrt>.rad{font-size:1.12em; margin-right:-.02em}
.sqrt>.radicand{border-top:1.1px solid currentColor; padding:0 .16em}
.op{font-style:normal; padding-right:.12em}
.rm{font-style:normal}
.txt{font-style:normal; padding:0 .1em}
.tex-raw{color:var(--accent-2); font-weight:700}
sup,sub{font-size:.72em; line-height:0}
.ss{display:inline-block; font-size:.72em; line-height:1.08; text-align:left;
  vertical-align:-0.34em; margin:0 .02em}
.ss>sup,.ss>sub{display:block; font-size:1em; line-height:1.08;
  vertical-align:baseline}
/* ---- 封面 ---- */
.cover{
  border-top:3px solid var(--accent); padding-top:22px;
  margin:0 0 3em; min-height:86vh; display:flex; flex-direction:column
}
.cover-top{
  display:flex; justify-content:space-between; font-family:var(--sans);
  font-size:.82em; color:var(--ink-3); letter-spacing:.08em
}
.cover-mid{margin:auto 0; padding:2.2em 0}
.cover-title{
  font-family:var(--sans); font-size:2.5em; line-height:1.24; font-weight:700;
  color:var(--ink); border:0; padding:0; margin:0; text-align:left
}
.cover-sub{
  font-family:var(--sans); font-size:1.42em; color:var(--accent);
  margin-top:.5em; letter-spacing:.14em
}
.cover-line{height:1px; background:var(--line-2); margin:1.6em 0 0}
.cover-meta{
  width:auto; margin:0 0 1.4em; font-size:.9em; border:0
}
.cover-meta th,.cover-meta td{border:0; padding:.32em .9em .32em 0;
  background:none; white-space:nowrap; vertical-align:top}
.cover-meta th{color:var(--ink-3); font-weight:400; width:7em}
.cover-meta tr:nth-child(even){background:none}
.cover-foot{
  font-family:var(--sans); font-size:.82em; color:var(--ink-3);
  border-top:1px solid var(--line); padding-top:.9em
}
/* ---- 目录 ---- */
.toc{font-family:var(--sans); font-size:.93em; line-height:1.7; margin:1.2em 0 2em}
.toc ol{list-style:none; margin:0; padding-left:0}
.toc ol ol{padding-left:1.5em}
.toc li{margin:.1em 0}
.toc a{color:var(--ink-2); text-decoration:none; border-bottom:1px solid transparent}
.toc a:hover{color:var(--accent-2); border-bottom-color:var(--accent-2)}
.toc-l1>a{font-weight:700; color:var(--ink); font-size:1.02em}
.toc li.toc-l1{margin-top:.55em}
.toc-l3>a{color:var(--ink-3); font-size:.95em}
/* ---- 插图 ---- */
figure.fig{margin:1.7em 0 1.9em; page-break-inside:avoid; break-inside:avoid}
figure.fig .figsvg{
  width:100%; height:auto; display:block; background:var(--bg);
  border:1px solid var(--line); border-radius:8px; padding:2px
}
figure.fig figcaption{
  margin-top:.65em; font-family:var(--sans); font-size:.86em; color:var(--ink-3);
  text-align:center; line-height:1.55
}
@page{size:A4; margin:18mm 16mm}
@media print{
  :root{--bg:#fff;--bg-2:#fafafa;--bg-3:#f2f2f2;--ink:#000;--ink-2:#222}
  body{font-size:10.5pt; line-height:1.6}
  .page{max-width:none; padding:0}
  .cover{page-break-after:always; min-height:0; height:235mm;
    border-top-width:2px; padding-top:14px}
  .cover-mid{padding:0; margin-top:70mm}
  .cover-title{font-size:26pt}
  .cover-sub{font-size:15pt}
  .cover-foot{position:absolute; bottom:0; left:0; right:0}
  .cover{position:relative}
  h1{page-break-before:always; page-break-after:avoid; font-size:15pt}
  h2,h3{page-break-after:avoid}
  pre.code,table,blockquote,.math-display,figure.fig{page-break-inside:avoid}
  .toc{page-break-after:always}
  .toc a{color:#000; border:0}
  a{color:#000; border:0}
  figure.fig .figsvg{border-color:#bbb}
}
@media (max-width:700px){
  .page{padding:28px 18px 64px}
  body{font-size:16px}
  table{font-size:.86em}
  th,td{padding:.45em .5em}
}
"""


def main():
    raw = open(SRC, "rb").read().decode("utf-16")
    text = raw.replace("\r\n", "\n")
    masked, store = pre_extract(text)
    blks = blocks(masked)
    body = restore(render(blks), store)

    title = "悟理 PhysViz 课堂演示平台 · 技术设计说明书"
    doc = (
        '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        '<title>%s</title>\n<style>%s</style>\n</head>\n<body>\n'
        '<div class="page">\n%s\n</div>\n</body>\n</html>\n'
    ) % (title, CSS, body)

    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(doc)

    # ---- 自检 ----
    problems = []
    leftover = re.findall(r"\\[a-zA-Z]{2,}", body)
    if leftover:
        problems.append("残留 LaTeX 命令: %s" % sorted(set(leftover))[:12])
    if TOKEN in body:
        problems.append("残留占位符")
    if "$" in body:
        problems.append("残留 $ 定界符")
    if "**" in body:
        problems.append("残留 ** 加粗标记")
    if re.search(r"<span class=\"tex-raw\">", body):
        problems.append("存在未识别命令（见 tex-raw）")
    # 正文（排除代码块与数学渲染）应无直双引号；代码块内的引号属原样保留
    prose = re.sub(r"<pre[\s\S]*?</pre>", "", body)
    prose = re.sub(r'<span class="math">[\s\S]*?</span>', "", prose)
    prose = re.sub(r'<div class="math-display">[\s\S]*?</div>', "", prose)
    text_only = re.sub(r"<[^>]+>", "", prose)
    if '"' in text_only:
        problems.append("正文仍残留 %d 个直双引号" % text_only.count('"'))
    if body.count("\u201c") != body.count("\u201d"):
        problems.append("弯引号配对不齐: %d vs %d"
                        % (body.count("\u201c"), body.count("\u201d")))
    # 封面
    if '<section class="cover"' not in body:
        problems.append("封面缺失")
    if 'class="cover-title"' not in body:
        problems.append("封面标题缺失")
    # 目录：条数、锚点可达性，以及「锚点文字 == 目标标题文字」
    toc_pairs = re.findall(r'<li class="toc-l\d"><a href="#([^"]+)">([^<]+)</a>', body)
    heads = dict(re.findall(r'<h[1-6] id="([^"]+)">([\s\S]*?)</h[1-6]>', body))
    if not toc_pairs:
        problems.append("目录为空")
    dead = [a for a, _ in toc_pairs if a not in heads]
    if dead:
        problems.append("目录存在死锚点 %d 个: %s" % (len(dead), dead[:6]))
    wrong = []
    for aid, atxt in toc_pairs:
        htxt = re.sub(r"<[^>]+>", "", heads.get(aid, ""))
        if re.sub(r"\s+", "", htxt) != re.sub(r"\s+", "", atxt):
            wrong.append("%s → %s" % (aid, htxt[:18]))
    if wrong:
        problems.append("目录锚点错位 %d 处: %s" % (len(wrong), wrong[:4]))
    # 插图：键集合、条数、图号顺序
    figs = REPORT.get("figs", [])
    if set(figs) != set(FIGURES):
        problems.append("插图引用与实现不一致: 引用 %s / 实现 %s"
                        % (sorted(figs), sorted(FIGURES)))
    caps = re.findall(r'<figcaption>(图\s*\d+-\d+)', body)
    if len(caps) != len(figs):
        problems.append("图题数量 %d 与插图数量 %d 不符" % (len(caps), len(figs)))
    for key, cap in zip(figs, caps):
        want = FIG_LABELS.get(key, "")
        if want and want.replace(" ", "") != cap.replace(" ", ""):
            problems.append("图号不符: fig:%s 标为 %s，应为 %s" % (key, cap, want))
    order = [float(re.sub(r"图\s*", "", c).replace("-", ".")) for c in caps]
    if order != sorted(order):
        problems.append("图号顺序非递增: %s" % caps)

    print("输出: %s" % OUT)
    print("字符数: %d" % len(doc))
    print("块数: %d  标题: %d  表格: %d  代码块: %d"
          % (len(blks),
             sum(1 for k, _ in blks if is_head(k)),
             sum(1 for k, _ in blks if k == "table"),
             body.count("<pre class=")))
    print("块级公式: %d  行内公式: %d"
          % (body.count('class="math-display"'), body.count('class="math"')))
    print("封面: %s  目录条目: %d  插图: %d"
          % ("有" if '<section class="cover"' in body else "无",
             REPORT.get("toc_count", 0), len(figs)))
    if problems:
        print("!! 自检问题:")
        for p in problems:
            print("   -", p)
    else:
        print("自检: 通过（无残留标记）")
    return 0 if not problems else 1


if __name__ == "__main__":
    sys.exit(main())
