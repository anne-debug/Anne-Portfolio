"""Dark-page copy of a see-through picture: dark ink that sits straight on the
transparent background (labels, captions, arrows) is turned light. Anything
inside a solid body (a phone screen, a white card) is left alone."""
import sys, numpy as np
from PIL import Image, ImageFilter

def body_mask(alpha, k):
    op = alpha.point(lambda a: 255 if a > 200 else 0)
    small = op.filter(ImageFilter.MinFilter(k))       # erode: thin strokes vanish
    return small.filter(ImageFilter.MaxFilter(k + 6))  # grow back, a little past the edge

def solidify(im, k):
    """Large see-through tints (callout boxes, chart quadrants) were drawn to sit
    on a white page: lay them on white so they keep the colour they were given.
    Soft black shadows are left see-through."""
    a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    L = (rgb.max(-1) + rgb.min(-1)) / 510
    tint = ((al > 50) & (al < 250) & (L > 0.25)) | (al >= 250)
    m = Image.fromarray((tint * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(k)).filter(ImageFilter.MaxFilter(k))
    reg = (np.asarray(m) > 0) & (al > 50) & (al < 250) & (L > 0.25)
    t = (al / 255)[..., None]
    comp = rgb * t + 255 * (1 - t)
    a[..., :3] = np.where(reg[..., None], comp, rgb)
    a[..., 3] = np.where(reg, 255, al)
    return Image.fromarray(a.round().astype(np.uint8), "RGBA")

def halo(im, r=5, colour=(232, 230, 226)):
    al = im.getchannel("A").point(lambda v: 255 if v > 120 else 0)
    rim = al.filter(ImageFilter.MaxFilter(2 * r + 1)).filter(ImageFilter.GaussianBlur(0.8))
    base = Image.new("RGBA", im.size, colour + (0,)); base.putalpha(rim)
    return Image.alpha_composite(base, im)

def fill_white(im, r=5, close=4):
    """Line drawings (Anne, 2026-11-16): the figure is filled white inside its
    outline, so it reads as a white sticker with black ink on the dark page.
    Gaps up to `close` px in the outline are bridged before filling."""
    from PIL import ImageDraw, ImageOps
    ink = im.getchannel("A").point(lambda v: 255 if v > 120 else 0)
    grown = ink.filter(ImageFilter.MaxFilter(2 * close + 1))
    pad = ImageOps.expand(grown, 1, 0)
    # figures cropped at the bottom edge (a torso, a coat) count as closed there:
    # a band along the bottom blocks the fill while it spreads, then is taken out
    band = max(4, im.height // 50)
    pad.paste(255, (0, pad.height - 1 - band, pad.width, pad.height))
    ImageDraw.floodfill(pad, (0, 0), 128)          # everything reachable from outside
    outside = pad.crop((1, 1, pad.width - 1, pad.height - 1)).point(lambda v: 255 if v == 128 else 0)
    inside = ImageOps.invert(outside).filter(ImageFilter.MinFilter(2 * close + 1))
    # in the band, keep white only straight below filled body above it
    import numpy as np
    m = np.asarray(inside).copy()
    edge = m[-band - 1] > 0
    m[-band:] = np.where(edge[None, :], 255, 0)
    inside = Image.fromarray(m)
    white = Image.new("RGBA", im.size, (255, 255, 255, 0)); white.putalpha(inside)
    return halo(Image.alpha_composite(white, im), r)

def character(im, close=4, core=9, ring=7,
              line=(236, 228, 214), fill=(84, 84, 90), dark=(22, 22, 24)):
    """Hand-drawn characters for the dark page (Anne, 2026-11-16): thin ink
    lines become warm off-white, large black areas (hair, skirt, shoes) stay
    near-black with a single off-white edge, and the white inside the figure
    becomes a soft grey. No added rim, no glow, no inversion; pose and line
    work are the original drawing's own."""
    import numpy as np
    from PIL import ImageDraw, ImageOps
    a = np.asarray(im).astype(np.float32) / 255
    rgb, al = a[..., :3], a[..., 3]
    luma = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    d = al * (1 - luma)                                  # how much ink a pixel carries
    ink = Image.fromarray(((d > 0.5) * 255).astype(np.uint8))
    # the figure's inside, as in fill_white: outline gaps bridged, bottom edge closed
    grown = ink.filter(ImageFilter.MaxFilter(2 * close + 1))
    pad = ImageOps.expand(grown, 1, 0)
    band = max(4, im.height // 50)
    pad.paste(255, (0, pad.height - 1 - band, pad.width, pad.height))
    ImageDraw.floodfill(pad, (0, 0), 128)
    inside = np.asarray(pad)[1:-1, 1:-1] != 128
    inside = np.asarray(Image.fromarray((inside * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(2 * close + 1))) > 0
    m = inside.copy(); edge = m[-band - 1]; m[-band:] = edge[None, :]; inside = m
    # solid areas: what survives an opening; their core keeps near-black, the rim is the outline
    thick = ink.filter(ImageFilter.MinFilter(core)).filter(ImageFilter.MaxFilter(core))
    corem = thick.filter(ImageFilter.MinFilter(ring)).filter(ImageFilter.GaussianBlur(0.8))
    coref = np.asarray(corem).astype(np.float32) / 255
    out = np.zeros(a.shape, np.float32)
    f = np.array(fill, np.float32) / 255; k = np.array(dark, np.float32) / 255; w = np.array(line, np.float32) / 255
    base_a = inside.astype(np.float32)
    out[..., :3] = f; out[..., 3] = base_a
    # near-black cores
    out[..., :3] = out[..., :3] * (1 - coref[..., None]) + k * coref[..., None]
    out[..., 3] = np.maximum(out[..., 3], coref)
    # off-white only next to real line work; broad soft shading (a shadow under
    # the chin) darkens the grey instead, so it stays a shadow, not a glow
    near = np.asarray(ink.filter(ImageFilter.MaxFilter(5))).astype(np.float32) / 255
    shade = np.clip(d, 0, 1) * (1 - near) * base_a
    out[..., :3] = out[..., :3] * (1 - 0.7 * shade[..., None])
    # off-white lines over everything else that carries ink
    la = np.clip(d * 1.6, 0, 1) * (1 - coref) * near
    out[..., :3] = out[..., :3] * (1 - la[..., None]) + w * la[..., None]
    out[..., 3] = np.maximum(out[..., 3], la)
    # keep colour in the original (a red cheek, a blue badge) where it was strongly coloured
    sat = rgb.max(-1) - rgb.min(-1)
    keep = (sat > 0.25) & (al > 0.5)
    out[keep, :3] = rgb[keep]; out[keep, 3] = al[keep]
    return Image.fromarray((out * 255).round().astype(np.uint8), "RGBA")

def ink_to_light(path, out, k=15, mode="ink", thresh=0.5, rim=0, grey_only=False):
    im = Image.open(path).convert("RGBA")
    if mode == "halo":
        halo(im, rim or 5).save(out, optimize=True); return 0
    if mode == "character":
        character(im).save(out, optimize=True); return 0
    if mode == "fill":
        fill_white(im, rim or 4).save(out, optimize=True); return 0
    im = solidify(im, k)
    a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3] / 255, a[..., 3]
    mx, mn = rgb.max(-1), rgb.min(-1)
    L = (mx + mn) / 2
    if mode == "invert":
        sel = al > 0
    else:
        body = np.asarray(body_mask(im.getchannel("A"), k)) > 0
        sel = (al > 0) & ~body & (L < thresh)
    if grey_only:
        sel &= (mx - mn) < 0.12
    # flip lightness, keep hue: black to off-white, deep blue to pale blue
    newL = np.clip(0.92 - 0.8 * L, 0, 1)
    scale_dark = np.where(L > 1e-4, newL / np.maximum(L, 1e-4), 0)
    # HSL lightness change done per channel: move each channel so chroma is kept
    C = mx - mn
    S = np.where((L > 0) & (L < 1), C / np.maximum(1 - np.abs(2 * L - 1), 1e-4), 0)
    C2 = (1 - np.abs(2 * newL - 1)) * S
    ratio = np.where(C > 1e-4, C2 / np.maximum(C, 1e-4), 0)
    new = (rgb - L[..., None]) * ratio[..., None] + newL[..., None]
    out_rgb = np.where(sel[..., None], np.clip(new, 0, 1), rgb)
    res = np.dstack([out_rgb * 255, al]).round().astype(np.uint8)
    o = Image.fromarray(res, "RGBA")
    if rim: o = halo(o, rim)
    o.save(out, optimize=True)
    return sel.sum() / max(1, (al > 0).sum())

if __name__ == "__main__":
    print(ink_to_light(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 15, sys.argv[4] if len(sys.argv) > 4 else "ink"))
