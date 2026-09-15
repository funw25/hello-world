"""三套配色主题的像素级对比。

输入：shots/theme_<id>.png（由 scripts/theme-check.mjs 生成）。
输出：每张图 3D 画布区域的颜色统计，以及两两之间的差异像素比例。

为什么需要它：主题换色是"看着好像差不多"的重灾区 ——
按钮高亮了、CSS 变量改了，但 3D 材质的颜色没跟着变，
肉眼扫一眼很容易漏掉。数像素骗不了人。
"""
import sys, zlib, struct, json
from collections import Counter


def read_png(path):
    d = open(path, 'rb').read()
    assert d[:8] == b'\x89PNG\r\n\x1a\n', path
    i, idat, w, h, ct = 8, b'', 0, 0, 0
    while i < len(d):
        ln = struct.unpack('>I', d[i:i + 4])[0]
        typ = d[i + 4:i + 8]
        body = d[i + 8:i + 8 + ln]
        if typ == b'IHDR':
            w, h, _bd, ct = struct.unpack('>IIBB', body[:10])
        elif typ == b'IDAT':
            idat += body
        i += 12 + ln
    raw = zlib.decompress(idat)
    ch = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ct]
    stride = w * ch
    out = bytearray()
    prev = bytearray(stride)
    pos = 0
    for _y in range(h):
        f = raw[pos]
        pos += 1
        line = bytearray(raw[pos:pos + stride])
        pos += stride
        for x in range(stride):
            a = line[x - ch] if x >= ch else 0
            b = prev[x]
            c = prev[x - ch] if x >= ch else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                pp = a + b - c
                pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        out += line
        prev = line
    return w, h, ch, bytes(out)


# 只统计中间的 3D 画布：避开左侧参数面板和右侧图层面板
X0, X1 = 0.20, 0.66
Y0, Y1 = 0.08, 0.92


def region(w, h, ch, px):
    for y in range(int(h * Y0), int(h * Y1), 2):
        for x in range(int(w * X0), int(w * X1), 2):
            o = (y * w + x) * ch
            yield o, px[o], px[o + 1], px[o + 2]


def main(paths):
    imgs = {}
    for p in paths:
        key = p.replace('\\', '/').split('theme_')[-1].replace('.png', '')
        imgs[key] = read_png(p)

    report = {}
    for key, (w, h, ch, px) in imgs.items():
        cnt, ink, tot = Counter(), 0, 0
        for _o, r, g, b in region(w, h, ch, px):
            cnt[(r, g, b)] += 1
            tot += 1
            if not (r > 244 and g > 244 and b > 244):
                ink += 1
        report[key] = {
            'size': f'{w}x{h}',
            'distinct_colors': len(cnt),
            'non_white_ratio': round(ink / tot, 4),
            'top_colors': [{'rgb': list(c), 'n': n} for c, n in cnt.most_common(6)],
        }
    print(json.dumps(report, indent=1, ensure_ascii=False))

    keys = list(imgs.keys())
    w0, h0, ch0, px0 = imgs[keys[0]]
    print()
    for key in keys[1:]:
        w, h, ch, px = imgs[key]
        if (w, h, ch) != (w0, h0, ch0):
            print(f'{keys[0]} vs {key}: 尺寸不一致，跳过')
            continue
        diff = tot = 0
        # 只统计"底色像素"之外的部分 ——
        # 整体差异很容易被一大片背景色变化刷高，
        # 但老师真正要分辨的是轨迹、矢量、场线这些**内容**的颜色。
        ink = ink_diff = 0
        for o, r, g, b in region(w, h, ch, px):
            tot += 1
            changed = abs(px0[o] - r) + abs(px0[o + 1] - g) + abs(px0[o + 2] - b) > 12
            if changed:
                diff += 1
            # 基准图里这一像素是"有东西"的（离白底够远）
            if abs(px0[o] - 255) + abs(px0[o + 1] - 255) + abs(px0[o + 2] - 255) > 30:
                ink += 1
                if changed:
                    ink_diff += 1
        print(f'{keys[0]} vs {key}: 画面区 {diff / tot:.1%} 像素不同'
              f'（其中"内容像素" {ink_diff / ink:.1%} 变了，内容像素占 {ink / tot:.1%}）')


if __name__ == '__main__':
    main(sys.argv[1:])
