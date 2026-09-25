"""Turn raw Techstars logos into square 256px tiles for the demo.

Each logo is trimmed to its content, then either kept as a full-bleed tile
(logos that already sit on a solid colour square), padded onto white, or,
for wide wordmarks, reduced to the icon part. Run from the data/ folder:

    python3 build_logos.py
"""
import json
import os

from PIL import Image, ImageChops, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "logos_raw")
OUT = os.path.join(HERE, "..", "src", "assets", "logos")
SIZE = 256

# id -> raw file slug
CHOSEN = {
    # portfolio
    "sourcery": "sourcery-ai", "ekei": "ekei", "buildstash": "buildstash", "i-flow": "i-flow",
    "granter": "granter-ai", "motics": "motics-technologies", "siftyml": "siftyml", "complok": "complok",
    "rhenari": "rhenari", "harvest": "harvest", "hylosense": "hylosense", "avido": "avido-ai",
    # deal flow
    "papr": "papr", "stemma": "stemma-ai", "fopsai": "fopsai-ltd", "insaio": "insaio",
    "linesight": "linesight", "auxilius": "auxilius-ai", "indora": "indora", "alethica": "alethica",
    "vocations": "vocations", "fintalo": "fintalo", "litlyx": "litlyx", "wattshift": "wattshift",
    "1cp": "1-cp", "legaleaze": "legaleaze-technologies", "humbrela": "humbrela", "gild": "gild",
    "crosscheck": "crosscheck", "safetybolt": "safety-bolt", "arcus": "arcus-health-limited",
}

# Hand overrides after reviewing the contact sheet.
# mode: "bleed" keeps the solid tile, "pad" pads onto white, "icon-left"/"icon-top" keeps
# the first cluster, "crop" uses a manual box in fractions of the trimmed image.
OVERRIDES: dict[str, dict] = {
    "stemma": {"mode": "icon-top"},
    "auxilius": {"mode": "icon-top"},
    "arcus": {"mode": "icon-top"},
    "1cp": {"mode": "icon-top"},
    "insaio": {"mode": "crop", "box": (0, 0, 0.26, 1)},
    "alethica": {"mode": "bleed-icon"},
    "humbrela": {"mode": "bleed-icon"},
}


def find_raw(slug):
    for f in os.listdir(RAW):
        if os.path.splitext(f)[0] == slug:
            return os.path.join(RAW, f)
    raise FileNotFoundError(slug)


def flatten(img):
    """RGBA on white, so transparent logos behave like white-background ones."""
    img = img.convert("RGBA")
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    bg.alpha_composite(img)
    return bg.convert("RGB")


def corner_colour(img):
    w, h = img.size
    pts = [(1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2)]
    cols = [img.getpixel(p) for p in pts]
    return cols


def close(a, b, tol=24):
    return all(abs(x - y) <= tol for x, y in zip(a, b))


def trim(img, bg):
    diff = ImageChops.difference(img, Image.new("RGB", img.size, bg))
    diff = diff.convert("L").point(lambda v: 255 if v > 28 else 0)
    box = diff.getbbox()
    return img.crop(box) if box else img


def mask(img, bg):
    diff = ImageChops.difference(img, Image.new("RGB", img.size, bg))
    return diff.convert("L").point(lambda v: 255 if v > 28 else 0)


def segments(profile, min_gap):
    """Runs of non-empty entries in a 1-D profile, merging gaps smaller than min_gap."""
    runs, start, gap = [], None, 0
    for i, v in enumerate(profile):
        if v:
            if start is None:
                start = i
            gap = 0
            end = i
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                runs.append((start, end + 1))
                start, gap = None, 0
    if start is not None:
        runs.append((start, end + 1))
    return runs


def first_cluster(img, bg, axis):
    m = mask(img, bg)
    w, h = m.size
    px = m.load()
    if axis == "x":
        prof = [any(px[x, y] for y in range(h)) for x in range(w)]
        runs = segments(prof, max(3, w // 60))
        if len(runs) < 2:
            return None
        a, b = runs[0]
        part = img.crop((a, 0, b, h))
    else:
        prof = [any(px[x, y] for x in range(w)) for y in range(h)]
        runs = segments(prof, max(3, h // 40))
        if len(runs) < 2:
            return None
        a, b = runs[0]
        part = img.crop((0, a, w, b))
    return trim(part, bg)


def pad_square(img, bg, margin=0.16):
    w, h = img.size
    side = int(max(w, h) / (1 - 2 * margin))
    tile = Image.new("RGB", (side, side), bg)
    tile.paste(img, ((side - w) // 2, (side - h) // 2))
    return tile.resize((SIZE, SIZE), Image.LANCZOS)


def cover_square(img):
    w, h = img.size
    side = min(w, h)
    box = ((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2)
    return img.crop(box).resize((SIZE, SIZE), Image.LANCZOS)


def process(cid, slug):
    src = Image.open(find_raw(slug))
    img = flatten(src)
    o = OVERRIDES.get(cid, {})
    corners = corner_colour(img)
    solid = all(close(c, corners[0]) for c in corners)
    bg = corners[0] if solid else (255, 255, 255)
    is_white_bg = close(bg, (255, 255, 255), 30)
    mode = o.get("mode")

    if mode is None:
        if solid and not is_white_bg:
            mode = "bleed"
        else:
            t = trim(img, (255, 255, 255))
            ar = t.size[0] / t.size[1]
            mode = "pad" if ar <= 1.9 else "icon-left"

    if mode == "bleed-icon":
        part = first_cluster(trim(img, bg), bg, "x")
        if part is not None:
            return pad_square(part, bg, o.get("margin", 0.24)), mode, bg
        mode = "bleed"
    if mode == "bleed":
        w, h = img.size
        tile = cover_square(img) if 0.8 <= w / h <= 1.25 else pad_square(trim(img, bg), bg, 0.12)
        return tile, mode, bg

    white = (255, 255, 255)
    t = trim(img, white)
    if mode == "crop":
        x0, y0, x1, y1 = o["box"]
        w, h = t.size
        t = trim(t.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h))), white)
        return pad_square(t, white, o.get("margin", 0.16)), mode, white
    if mode in ("icon-left", "icon-top"):
        part = first_cluster(t, white, "x" if mode == "icon-left" else "y")
        if part is not None and 0.45 <= part.size[0] / part.size[1] <= 1.9:
            return pad_square(part, white, o.get("margin", 0.16)), mode, white
        mode = "pad-wide"
    return pad_square(t, white, o.get("margin", 0.16 if mode == "pad" else 0.08)), mode, white


def main():
    os.makedirs(OUT, exist_ok=True)
    report = {}
    for cid, slug in CHOSEN.items():
        tile, mode, bg = process(cid, slug)
        tile.save(os.path.join(OUT, f"{cid}.png"), optimize=True)
        report[cid] = {"mode": mode, "bleed": mode.startswith("bleed"), "bg": "#%02x%02x%02x" % tuple(bg[:3])}
    with open(os.path.join(HERE, "logo_report.json"), "w") as f:
        json.dump(report, f, indent=1)
    meta = {k: {"bleed": v["bleed"], "bg": v["bg"]} for k, v in report.items()}
    with open(os.path.join(HERE, "..", "src", "data", "logo-meta.json"), "w") as f:
        json.dump(meta, f, indent=1)

    # contact sheet for review
    cols, cell = 8, 150
    ids = list(CHOSEN)
    rows = (len(ids) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 22)), (228, 230, 234))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
    except OSError:
        font = ImageFont.load_default()
    for i, cid in enumerate(ids):
        x, y = (i % cols) * cell, (i // cols) * (cell + 22)
        tile = Image.open(os.path.join(OUT, f"{cid}.png")).resize((cell - 30, cell - 30))
        sheet.paste(tile, (x + 15, y + 10))
        small = Image.open(os.path.join(OUT, f"{cid}.png")).resize((32, 32))
        sheet.paste(small, (x + cell - 44, y + cell - 18))
        draw.text((x + 15, y + cell - 14), f"{cid} · {report[cid]['mode']}", fill=(0, 0, 0), font=font)
    sheet.save(os.path.join(HERE, "logo_sheet.png"))
    print(json.dumps(report))


if __name__ == "__main__":
    main()
