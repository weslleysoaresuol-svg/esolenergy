import os
import math
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

# --- METRICS & PARAMS ---
CAP_HEIGHT = 700
STEM = 160
R = 90
SLANT_DEG = 15
SLANT_TAN = math.tan(math.radians(SLANT_DEG))
KAPPA = 4.0 * (math.sqrt(2.0) - 1.0) / 3.0

E_CAP_HEIGHT = 350
E_STEM = 70

def transform(x, y):
    return x + y * SLANT_TAN, y

def apply_path(pen, pts, curves=None):
    # pts: list of (x,y)
    # curves: dict of index -> (cp1, cp2)  (relative to next point)
    pen.moveTo(transform(*pts[0]))
    for i in range(1, len(pts)):
        p = transform(*pts[i])
        if curves and i in curves:
            cp1 = transform(*curves[i][0])
            cp2 = transform(*curves[i][1])
            pen.qCurveTo(cp1, p) # Note: qCurveTo is quadratic. For SVG we need cubic? TTGlyphPen expects quadratic. 
            # Actually, TTGlyphPen can take exact on-curve and off-curve.
            # But true circles need cubic. TrueType uses quadratic.
            pass
        else:
            pen.lineTo(p)
    pen.closePath()

# Let's write manual TTGlyphPen operations with proper quadratic approximation for curves
def make_O(pen):
    # O outer circle (drawn clockwise)
    w = 600
    cx, cy = w/2, CAP_HEIGHT/2
    rx, ry = w/2, CAP_HEIGHT/2
    # Quadratic approximation of circle (8 points)
    # Actually, simpler: 4 points, 8 control points -> 4 qCurves? No, TTGlyphPen takes multiple off-curve points.
    
    def ellipse_qcurves(px, py, rx, ry, clockwise=True):
        # 8 quadratic segments for a good circle approximation
        # using standard TT curve generation
        kappa_q = 0.4142 # approximate
        pass
        
    # Standard manual drawing for O
    # For a perfect O, we use a classic 8-point quadratic bezier or we can just use simple 4 points if we just want a boxy-O?
    # The user wants "letra O normal".
    
    # Outer
    p0 = (cx, cy - ry)
    p1 = (cx - rx, cy - ry)
    p2 = (cx - rx, cy)
    p3 = (cx - rx, cy + ry)
    p4 = (cx, cy + ry)
    p5 = (cx + rx, cy + ry)
    p6 = (cx + rx, cy)
    p7 = (cx + rx, cy - ry)
    
    pen.moveTo(transform(*p0))
    pen.qCurveTo(transform(*p1), transform(*p2))
    pen.qCurveTo(transform(*p3), transform(*p4))
    pen.qCurveTo(transform(*p5), transform(*p6))
    pen.qCurveTo(transform(*p7), transform(*p0))
    pen.closePath()
    
    # Inner hole (counter-clockwise)
    irx, iry = rx - STEM, ry - STEM
    i0 = (cx, cy - iry)
    i1 = (cx + irx, cy - iry)
    i2 = (cx + irx, cy)
    i3 = (cx + irx, cy + iry)
    i4 = (cx, cy + iry)
    i5 = (cx - irx, cy + iry)
    i6 = (cx - irx, cy)
    i7 = (cx - irx, cy - iry)
    
    pen.moveTo(transform(*i0))
    pen.qCurveTo(transform(*i1), transform(*i2))
    pen.qCurveTo(transform(*i3), transform(*i4))
    pen.qCurveTo(transform(*i5), transform(*i6))
    pen.qCurveTo(transform(*i7), transform(*i0))
    pen.closePath()
    return w

def make_E(pen):
    w = 400
    pen.moveTo(transform(R, 0))
    pen.qCurveTo(transform(0, 0), transform(0, R))
    pen.lineTo(transform(0, CAP_HEIGHT - R))
    pen.qCurveTo(transform(0, CAP_HEIGHT), transform(R, CAP_HEIGHT))
    pen.lineTo(transform(w - R, CAP_HEIGHT))
    pen.qCurveTo(transform(w, CAP_HEIGHT), transform(w, CAP_HEIGHT - R))
    pen.lineTo(transform(w, CAP_HEIGHT - STEM))
    pen.lineTo(transform(STEM, CAP_HEIGHT - STEM))
    pen.lineTo(transform(STEM, int(CAP_HEIGHT/2) + int(STEM/2)))
    pen.lineTo(transform(w - 50, int(CAP_HEIGHT/2) + int(STEM/2)))
    pen.lineTo(transform(w - 50, int(CAP_HEIGHT/2) - int(STEM/2)))
    pen.lineTo(transform(STEM, int(CAP_HEIGHT/2) - int(STEM/2)))
    pen.lineTo(transform(STEM, STEM))
    pen.lineTo(transform(w, STEM))
    pen.lineTo(transform(w, 0))
    pen.closePath()
    return w

def make_S(pen):
    w = 400
    pen.moveTo(transform(0, R))
    pen.lineTo(transform(0, STEM))
    pen.lineTo(transform(w - STEM, STEM))
    pen.lineTo(transform(w - STEM, int(CAP_HEIGHT/2) - int(STEM/2)))
    pen.lineTo(transform(R, int(CAP_HEIGHT/2) - int(STEM/2)))
    pen.qCurveTo(transform(0, int(CAP_HEIGHT/2) - int(STEM/2)), transform(0, int(CAP_HEIGHT/2) - int(STEM/2) + R))
    pen.lineTo(transform(0, CAP_HEIGHT - R))
    pen.qCurveTo(transform(0, CAP_HEIGHT), transform(R, CAP_HEIGHT))
    pen.lineTo(transform(w, CAP_HEIGHT))
    pen.lineTo(transform(w, CAP_HEIGHT - STEM))
    pen.lineTo(transform(STEM, CAP_HEIGHT - STEM))
    pen.lineTo(transform(STEM, int(CAP_HEIGHT/2) + int(STEM/2)))
    pen.lineTo(transform(w - R, int(CAP_HEIGHT/2) + int(STEM/2)))
    pen.qCurveTo(transform(w, int(CAP_HEIGHT/2) + int(STEM/2)), transform(w, int(CAP_HEIGHT/2) + int(STEM/2) - R))
    pen.lineTo(transform(w, R))
    pen.qCurveTo(transform(w, 0), transform(w - R, 0))
    pen.lineTo(transform(R, 0))
    pen.qCurveTo(transform(0, 0), transform(0, R))
    pen.closePath()
    return w

def make_L(pen):
    w = 380
    pen.moveTo(transform(R, 0))
    pen.qCurveTo(transform(0, 0), transform(0, R))
    pen.lineTo(transform(0, CAP_HEIGHT))
    pen.lineTo(transform(STEM, CAP_HEIGHT))
    pen.lineTo(transform(STEM, STEM))
    pen.lineTo(transform(w, STEM))
    pen.lineTo(transform(w, 0))
    pen.closePath()
    return w

# ENERGY (lowercase mapped e, n, r, g, y) -> Smaller scale, straight geometric lines
def make_energy_e(pen):
    w = 300
    h = E_CAP_HEIGHT
    s = E_STEM
    pts = [
        (0, 0), (0, h), (w, h), (w, h-s),
        (s, h-s), (s, int(h/2)+int(s/2)), (w-40, int(h/2)+int(s/2)),
        (w-40, int(h/2)-int(s/2)), (s, int(h/2)-int(s/2)),
        (s, s), (w, s), (w, 0)
    ]
    pen.moveTo(transform(*pts[0]))
    for p in pts[1:]: pen.lineTo(transform(*p))
    pen.closePath()
    return w

def make_energy_n(pen):
    w = 300
    h = E_CAP_HEIGHT
    s = E_STEM
    pts = [
        (0, 0), (0, h), (w, h), (w, 0), (w-s, 0),
        (w-s, h-s), (s, h-s), (s, 0)
    ]
    pen.moveTo(transform(*pts[0]))
    for p in pts[1:]: pen.lineTo(transform(*p))
    pen.closePath()
    return w

def make_energy_r(pen):
    w = 300
    h = E_CAP_HEIGHT
    s = E_STEM
    pts_outer = [
        (0, 0), (0, h), (w, h), (w, int(h/2)), (s+60, int(h/2)),
        (w, 0), (w-s-20, 0), (s, int(h/2)-20), (s, 0)
    ]
    pen.moveTo(transform(*pts_outer[0]))
    for p in pts_outer[1:]: pen.lineTo(transform(*p))
    pen.closePath()
    
    pts_hole = [
        (s, int(h/2)+s-20), (w-s, int(h/2)+s-20), (w-s, h-s), (s, h-s)
    ]
    pen.moveTo(transform(*pts_hole[0]))
    for p in reversed(pts_hole[1:]): pen.lineTo(transform(*p))
    pen.closePath()
    return w

def make_energy_g(pen):
    w = 300
    h = E_CAP_HEIGHT
    s = E_STEM
    pts = [
        (0, 0), (0, h), (w, h), (w, h-s), (s, h-s),
        (s, s), (w-s, s), (w-s, int(h/2)-int(s/2)),
        (int(w/2), int(h/2)-int(s/2)), (int(w/2), int(h/2)+int(s/2)),
        (w, int(h/2)+int(s/2)), (w, 0)
    ]
    pen.moveTo(transform(*pts[0]))
    for p in pts[1:]: pen.lineTo(transform(*p))
    pen.closePath()
    return w

def make_energy_y(pen):
    w = 300
    h = E_CAP_HEIGHT
    s = E_STEM
    pts = [
        (int(w/2)-int(s/2), 0), (int(w/2)-int(s/2), int(h/2)),
        (0, h), (s+20, h), (int(w/2), int(h/2)+40),
        (w-s-20, h), (w, h), (int(w/2)+int(s/2), int(h/2)),
        (int(w/2)+int(s/2), 0)
    ]
    pen.moveTo(transform(*pts[0]))
    for p in pts[1:]: pen.lineTo(transform(*p))
    pen.closePath()
    return w

# ----------------- FONT BUILDER -----------------
def build_font_and_svgs():
    print("Iniciando compilação da fonte paramétrica pura e do SVG...")
    os.makedirs("public/fonts", exist_ok=True)
    
    fb = FontBuilder(1000, isTTF=True)
    glyph_order = [".notdef", "space", "E", "S", "O", "L", "e", "n", "r", "g", "y"]
    fb.setupGlyphOrder(glyph_order)
    
    cmap = {
        32: "space",
        69: "E", 83: "S", 79: "O", 76: "L",
        101: "e", 110: "n", 114: "r", 103: "g", 121: "y"
    }
    fb.setupCharacterMap(cmap)
    
    glyphs = {}
    metrics = {}
    svg_paths = {} # Salvar os paths do SVG em paralelo!
    
    # .notdef e space
    glyphs[".notdef"] = TTGlyphPen(None).glyph()
    metrics[".notdef"] = (500, 0)
    glyphs["space"] = TTGlyphPen(None).glyph()
    metrics["space"] = (300, 0)
    
    def generate(char, make_func):
        # TTF Glyph
        tt_pen = TTGlyphPen(None)
        w = make_func(tt_pen)
        glyphs[char] = tt_pen.glyph()
        
        # Advance Width for font = base width + sidebearings + slant offset compensation
        aw = int(w + (CAP_HEIGHT * SLANT_TAN) + 80)
        metrics[char] = (aw, 40)
        
        # SVG Path
        svg_pen = SVGPathPen(None)
        make_func(svg_pen)
        svg_paths[char] = svg_pen.getCommands()
        
        return aw
        
    aw_E = generate("E", make_E)
    aw_S = generate("S", make_S)
    aw_O = generate("O", make_O)
    aw_L = generate("L", make_L)
    
    aw_e = generate("e", make_energy_e)
    aw_n = generate("n", make_energy_n)
    aw_r = generate("r", make_energy_r)
    aw_g = generate("g", make_energy_g)
    aw_y = generate("y", make_energy_y)
    
    # Export TTF
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    
    name_strings = {
        "familyName": "EsolDisplay",
        "styleName": "Regular",
        "uniqueFontIdentifier": "EsolDisplay-Regular:1.2.0",
        "fullName": "EsolDisplay-Regular",
        "psName": "EsolDisplay-Regular",
        "version": "Version 1.200"
    }
    fb.setupNameTable(name_strings)
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, sxHeight=E_CAP_HEIGHT, sCapHeight=CAP_HEIGHT)
    fb.setupPost()
    
    fb.save("public/fonts/EsolDisplay-Regular.ttf")
    print("Fonte EsolDisplay-Regular.ttf gerada com Sucesso!")
    try:
        font = TTFont("public/fonts/EsolDisplay-Regular.ttf")
        font.flavor = "woff2"
        font.save("public/fonts/EsolDisplay-Regular.woff2")
        print("Fonte EsolDisplay-Regular.woff2 gerada com Sucesso!")
    except Exception as e:
        print(f"Failed WOFF2: {e}")

    # ----------------- SVG BUILDER -----------------
    print("Construindo Logotipos Vetoriais SVG...")
    
    # Layout logic:
    # "ESOL" is placed first.
    # We translate each letter by its advance width (minus kerning).
    kerning_esol = 40
    kerning_energy = 50
    
    def place_word(chars, x_start, y_start, fill, kerning, aws):
        svg_g = f'  <g fill="{fill}">' + "\\n"
        x = x_start
        for c in chars:
            path_d = svg_paths[c]
            svg_g += f'    <path d="{path_d}" transform="translate({x}, {y_start})" />' + "\\n"
            x += aws[c] - kerning
        svg_g += "  </g>\\n"
        return svg_g, x

    # Web-SVG: Horizontal
    esol_aws = {"E": aw_E, "S": aw_S, "O": aw_O, "L": aw_L}
    esol_svg, esol_width = place_word(["E", "S", "O", "L"], 0, 0, "#001F5C", kerning_esol, esol_aws)
    
    energy_aws = {"e": aw_e, "n": aw_n, "e": aw_e, "r": aw_r, "g": aw_g, "y": aw_y}
    # Energy starts slightly shifted to match visual balance
    energy_svg, energy_width = place_word(["e", "n", "e", "r", "g", "y"], 150, -420, "#475569", kerning_energy, energy_aws)
    
    svg_defs = """
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&amp;display=swap');
      .tagline {
        font-family: 'Montserrat', sans-serif;
        font-weight: 500;
        font-size: 150px;
        letter-spacing: 20px;
      }
    </style>
  </defs>"""

    # We use a global transform scale(1, -1) to flip the Y axis (because our python TTF coords are Y-up)
    # The canvas is viewBox="0 0 3000 1500"
    
    svg_horiz = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2800 1600" width="100%" height="100%">
{svg_defs}
  <g transform="translate(150, 1000) scale(1, -1)">
{esol_svg}
{energy_svg}
  </g>
  <text x="150" y="1350" fill="#475569" class="tagline">Deixe o sol trabalhar por voc\u00ea.</text>
</svg>"""

    svg_horiz_neg = svg_horiz.replace('#001F5C', '#FFFFFF').replace('#475569', '#FFFFFF')

    # Brandmark (Normal 'O' in Yellow)
    brandmark_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <g transform="translate(200, 850) scale(1, -1)">
    <path d="{svg_paths['O']}" fill="#FFB300" />
  </g>
</svg>"""
    brandmark_svg_white = brandmark_svg.replace('#FFB300', '#FFFFFF')

    # Stacked
    stacked_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3000 2800" width="100%" height="100%">
{svg_defs}
  <g transform="translate(1200, 1200) scale(1.5, -1.5)">
    <path d="{svg_paths['O']}" fill="#FFB300" transform="translate(-300, 0)" />
  </g>
  <g transform="translate(350, 2000) scale(1, -1)">
{esol_svg}
{energy_svg}
  </g>
  <text x="250" y="2400" fill="#475569" class="tagline" style="font-size: 160px;">Deixe o sol trabalhar por voc\u00ea.</text>
</svg>"""

    stacked_svg_neg = stacked_svg.replace('#001F5C', '#FFFFFF').replace('#475569', '#FFFFFF')

    os.makedirs("public/brand-kit/1. Web-SVG", exist_ok=True)
    os.makedirs("src/assets", exist_ok=True)
    
    with open("public/brand-kit/1. Web-SVG/esol-logo-horizontal.svg", "w", encoding="utf-8") as f: f.write(svg_horiz)
    with open("src/assets/esol-logo.svg", "w", encoding="utf-8") as f: f.write(svg_horiz)
    with open("public/brand-kit/1. Web-SVG/esol-logo-horizontal-negative.svg", "w", encoding="utf-8") as f: f.write(svg_horiz_neg)
    with open("src/assets/esol-logo-negative.svg", "w", encoding="utf-8") as f: f.write(svg_horiz_neg)
    
    with open("public/brand-kit/1. Web-SVG/esol-logo-stacked.svg", "w", encoding="utf-8") as f: f.write(stacked_svg)
    with open("public/brand-kit/1. Web-SVG/esol-logo-stacked-negative.svg", "w", encoding="utf-8") as f: f.write(stacked_svg_neg)
    
    with open("public/brand-kit/1. Web-SVG/esol-logo-brandmark.svg", "w", encoding="utf-8") as f: f.write(brandmark_svg)
    with open("public/brand-kit/1. Web-SVG/esol-logo-brandmark-white.svg", "w", encoding="utf-8") as f: f.write(brandmark_svg_white)
    
    print("Todos os SVGs foram gerados 100% via código matemático! (Adeus vtracer)")

if __name__ == "__main__":
    build_font_and_svgs()
