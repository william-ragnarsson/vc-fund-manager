"""Render Associate's tab icons into public/: favicon.ico (16, 32 and 48px) and
apple-touch-icon.png (180px, for iPhone home screens).

The drawing is the 24-unit grid of src/app/AssociateMark.tsx. The favicon uses the
bolder strokes of the inline SVG icon in index.html; the home-screen icon uses the
mark as is. Shapes are drawn 64x oversize and box-filtered down, the same pixel
coverage a browser renders. Run from the data/ folder:

    python3 build_icons.py
"""
import io
import math
import os
import struct

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public")
INK = (31, 36, 48)  # --color-text
WHITE = (255, 255, 255)

# frame: the rounded square's inset, stroke and corner radius; peak: the A's stroke; dot: its radius
TAB = {"inset": 1.2, "frame": 2.4, "rx": 5.3, "peak": 2.6, "dot": 1.6}   # index.html's SVG icon
MARK = {"inset": 1.0, "frame": 2.0, "rx": 5.5, "peak": 2.25, "dot": 1.6}  # AssociateMark.tsx
PEAK = [(6, 17.5), (12, 6.5), (18, 17.5)]
DOT = (12, 14.9)


def draw_mark(draw, scale, ox, oy, g):
    """Draw the mark at `scale` px per unit, with the grid's origin at (ox, oy)."""
    def at(x, y):
        return ox + x * scale, oy + y * scale

    def box(x0, y0, x1, y1):
        (a, b), (c, d) = at(x0, y0), at(x1, y1)
        return [a, b, c - 1, d - 1]

    # A centred stroke on a rounded square: the outer square (radius + half the stroke),
    # then the white inside (radius - half the stroke).
    i, half, rx = g["inset"], g["frame"] / 2, g["rx"]
    draw.rounded_rectangle(box(i - half, i - half, 24 - i + half, 24 - i + half), radius=(rx + half) * scale, fill=INK)
    draw.rounded_rectangle(box(i + half, i + half, 24 - i - half, 24 - i - half), radius=(rx - half) * scale, fill=WHITE)

    # The peak, with round caps and joins: each leg as a band, a disc at every point.
    h = g["peak"] / 2
    for (x0, y0), (x1, y1) in zip(PEAK, PEAK[1:]):
        length = math.hypot(x1 - x0, y1 - y0)
        nx, ny = -(y1 - y0) / length * h, (x1 - x0) / length * h
        draw.polygon([at(x0 + nx, y0 + ny), at(x1 + nx, y1 + ny), at(x1 - nx, y1 - ny), at(x0 - nx, y0 - ny)], fill=INK)
    for x, y in PEAK:
        draw.ellipse(box(x - h, y - h, x + h, y + h), fill=INK)

    r = g["dot"]
    draw.ellipse(box(DOT[0] - r, DOT[1] - r, DOT[0] + r, DOT[1] + r), fill=INK)


def tab_icon(size):
    # 1536 = 24 units at 64px, and divides evenly by 16, 32 and 48. The transparent
    # corners carry the ink colour so the anti-aliased edge doesn't darken.
    big = Image.new("RGBA", (1536, 1536), INK + (0,))
    draw_mark(ImageDraw.Draw(big), 64, 0, 0, TAB)
    return big.resize((size, size), Image.BOX)


def touch_icon():
    # iOS rounds the corners itself, so the canvas is solid white, with the mark
    # 120px wide in the middle (5px per unit), drawn 16x oversize.
    k = 16
    big = Image.new("RGB", (180 * k, 180 * k), WHITE)
    draw_mark(ImageDraw.Draw(big), 5 * k, 30 * k, 30 * k, MARK)
    return big.resize((180, 180), Image.BOX)


def write_ico(images, path):
    """An .ico holding each image as a PNG, which every current browser reads."""
    pngs = []
    for im in images:
        buf = io.BytesIO()
        im.save(buf, "PNG", optimize=True)
        pngs.append(buf.getvalue())
    entries, offset = b"", 6 + 16 * len(images)
    for im, png in zip(images, pngs):
        entries += struct.pack("<BBBBHHII", im.width % 256, im.height % 256, 0, 0, 1, 32, len(png), offset)
        offset += len(png)
    with open(path, "wb") as f:
        f.write(struct.pack("<HHH", 0, 1, len(images)) + entries + b"".join(pngs))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    write_ico([tab_icon(n) for n in (16, 32, 48)], os.path.join(OUT, "favicon.ico"))
    touch_icon().save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)
    print("wrote public/favicon.ico and public/apple-touch-icon.png")
