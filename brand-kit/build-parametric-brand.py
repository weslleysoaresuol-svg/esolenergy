import os
import math
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

# --- CONFIGURAÇÃO GEOMÉTRICA PARAMÉTRICA ---
CAP_HEIGHT = 700
STEM = 160        # Espessura das hastes
R = 90            # Raio de curvatura externa
SLANT = 0         # ESOL não é itálico
ENERGY_SLANT = 15 # ENERGY tem inclinação (itálico)
O_RADIUS = 350
O_HOLE = O_RADIUS - STEM

def make_E(pen):
    w = 400
    # Desenhando do canto inferior esquerdo no sentido horário (contorno externo)
    pen.moveTo((R, 0))
    # left bottom corner
    pen.qCurveTo((0, 0), (0, R))
    pen.lineTo((0, CAP_HEIGHT - R))
    # left top corner
    pen.qCurveTo((0, CAP_HEIGHT), (R, CAP_HEIGHT))
    pen.lineTo((w - R, CAP_HEIGHT))
    # right top corner
    pen.qCurveTo((w, CAP_HEIGHT), (w, CAP_HEIGHT - R))
    pen.lineTo((w, CAP_HEIGHT - STEM))
    # canto interno reto
    pen.lineTo((STEM, CAP_HEIGHT - STEM))
    pen.lineTo((STEM, int(CAP_HEIGHT/2) + int(STEM/2)))
    pen.lineTo((w - 50, int(CAP_HEIGHT/2) + int(STEM/2)))
    pen.lineTo((w - 50, int(CAP_HEIGHT/2) - int(STEM/2)))
    pen.lineTo((STEM, int(CAP_HEIGHT/2) - int(STEM/2)))
    pen.lineTo((STEM, STEM))
    pen.lineTo((w, STEM))
    pen.lineTo((w, 0))
    pen.closePath()
    return w

def make_S(pen):
    w = 400
    # simplified S with sharp inners and rounded outers
    # bottom tail
    pen.moveTo((0, R))
    pen.lineTo((0, STEM))
    pen.lineTo((w - STEM, STEM))
    pen.lineTo((w - STEM, int(CAP_HEIGHT/2) - int(STEM/2)))
    pen.lineTo((R, int(CAP_HEIGHT/2) - int(STEM/2)))
    pen.qCurveTo((0, int(CAP_HEIGHT/2) - int(STEM/2)), (0, int(CAP_HEIGHT/2) - int(STEM/2) + R))
    pen.lineTo((0, CAP_HEIGHT - R))
    pen.qCurveTo((0, CAP_HEIGHT), (R, CAP_HEIGHT))
    pen.lineTo((w, CAP_HEIGHT))
    pen.lineTo((w, CAP_HEIGHT - STEM))
    pen.lineTo((STEM, CAP_HEIGHT - STEM))
    pen.lineTo((STEM, int(CAP_HEIGHT/2) + int(STEM/2)))
    pen.lineTo((w - R, int(CAP_HEIGHT/2) + int(STEM/2)))
    pen.qCurveTo((w, int(CAP_HEIGHT/2) + int(STEM/2)), (w, int(CAP_HEIGHT/2) + int(STEM/2) - R))
    pen.lineTo((w, R))
    pen.qCurveTo((w, 0), (w - R, 0))
    pen.lineTo((R, 0))
    pen.qCurveTo((0, 0), (0, R))
    pen.closePath()
    return w

def make_O(pen):
    w = 700
    cx = 350
    cy = 350
    # O outer circle (drawn clockwise)
    pen.moveTo((cx, cy - O_RADIUS))
    pen.qCurveTo((cx - O_RADIUS, cy - O_RADIUS), (cx - O_RADIUS, cy))
    pen.qCurveTo((cx - O_RADIUS, cy + O_RADIUS), (cx, cy + O_RADIUS))
    pen.qCurveTo((cx + O_RADIUS, cy + O_RADIUS), (cx + O_RADIUS, cy))
    pen.qCurveTo((cx + O_RADIUS, cy - O_RADIUS), (cx, cy - O_RADIUS))
    pen.closePath()
    return w
    
def make_O_hole(pen):
    cx = 350
    cy = 350
    # O inner hole (drawn counter-clockwise)
    pen.moveTo((cx, cy - O_HOLE))
    pen.qCurveTo((cx + O_HOLE, cy - O_HOLE), (cx + O_HOLE, cy))
    pen.qCurveTo((cx + O_HOLE, cy + O_HOLE), (cx, cy + O_HOLE))
    pen.qCurveTo((cx - O_HOLE, cy + O_HOLE), (cx - O_HOLE, cy))
    pen.qCurveTo((cx - O_HOLE, cy - O_HOLE), (cx, cy - O_HOLE))
    pen.closePath()
    
def make_O_cut(pen):
    # O cut is a diagonal polygon that masks out
    # For fontTools, we just draw the two halfs of the O.
    # Actually, drawing complex booleans in python is hard.
    pass

# We will use simple bezier approximations for circles.
kappa = 4.0 * (math.sqrt(2.0) - 1.0) / 3.0

def make_L(pen):
    w = 380
    pen.moveTo((R, 0))
    pen.qCurveTo((0, 0), (0, R))
    pen.lineTo((0, CAP_HEIGHT))
    pen.lineTo((STEM, CAP_HEIGHT))
    pen.lineTo((STEM, STEM))
    pen.lineTo((w, STEM))
    pen.lineTo((w, 0))
    pen.closePath()
    return w

# ENERGY (straight, sharp, geometric, extended, slightly italic)
def apply_slant(x, y, slant_deg=15):
    rad = math.radians(slant_deg)
    return int(x + y * math.tan(rad)), y

def make_energy_e(pen):
    w = 350
    h = 500 # smaller cap height for ENERGY
    s = 110 # stem for energy
    pts = [
        (0, 0), (0, h), (w, h), (w, h-s),
        (s, h-s), (s, int(h/2)+int(s/2)), (w-40, int(h/2)+int(s/2)),
        (w-40, int(h/2)-int(s/2)), (s, int(h/2)-int(s/2)),
        (s, s), (w, s), (w, 0)
    ]
    pen.moveTo(apply_slant(pts[0][0], pts[0][1]))
    for p in pts[1:]:
        pen.lineTo(apply_slant(p[0], p[1]))
    pen.closePath()
    return int(w + h * math.tan(math.radians(15)))

def make_energy_n(pen):
    w = 350
    h = 500
    s = 110
    pts = [
        (0, 0), (0, h), (w, h), (w, 0), (w-s, 0),
        (w-s, h-s), (s, h-s), (s, 0)
    ]
    pen.moveTo(apply_slant(pts[0][0], pts[0][1]))
    for p in pts[1:]:
        pen.lineTo(apply_slant(p[0], p[1]))
    pen.closePath()
    return int(w + h * math.tan(math.radians(15)))

def make_energy_r(pen):
    w = 350
    h = 500
    s = 110
    pts_outer = [
        (0, 0), (0, h), (w, h), (w, int(h/2)), (s+80, int(h/2)),
        (w, 0), (w-s-20, 0), (s, int(h/2)-20), (s, 0)
    ]
    pen.moveTo(apply_slant(pts_outer[0][0], pts_outer[0][1]))
    for p in pts_outer[1:]:
        pen.lineTo(apply_slant(p[0], p[1]))
    pen.closePath()
    
    # hole
    pts_hole = [
        (s, int(h/2)+s-20), (w-s, int(h/2)+s-20), (w-s, h-s), (s, h-s)
    ]
    pen.moveTo(apply_slant(pts_hole[0][0], pts_hole[0][1]))
    for p in reversed(pts_hole[1:]): # reverse for hole
        pen.lineTo(apply_slant(p[0], p[1]))
    pen.closePath()
    return int(w + h * math.tan(math.radians(15)))

def make_energy_g(pen):
    w = 350
    h = 500
    s = 110
    pts = [
        (0, 0), (0, h), (w, h), (w, h-s), (s, h-s),
        (s, s), (w-s, s), (w-s, int(h/2)-int(s/2)),
        (int(w/2), int(h/2)-int(s/2)), (int(w/2), int(h/2)+int(s/2)),
        (w, int(h/2)+int(s/2)), (w, 0)
    ]
    pen.moveTo(apply_slant(pts[0][0], pts[0][1]))
    for p in pts[1:]:
        pen.lineTo(apply_slant(p[0], p[1]))
    pen.closePath()
    return int(w + h * math.tan(math.radians(15)))

def make_energy_y(pen):
    w = 350
    h = 500
    s = 110
    pts = [
        (int(w/2)-int(s/2), 0), (int(w/2)-int(s/2), int(h/2)),
        (0, h), (s+20, h), (int(w/2), int(h/2)+40),
        (w-s-20, h), (w, h), (int(w/2)+int(s/2), int(h/2)),
        (int(w/2)+int(s/2), 0)
    ]
    pen.moveTo(apply_slant(pts[0][0], pts[0][1]))
    for p in pts[1:]:
        pen.lineTo(apply_slant(p[0], p[1]))
    pen.closePath()
    return int(w + h * math.tan(math.radians(15)))

def build_font():
    print("Building Parametric Font EsolDisplay...")
    
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
    
    # .notdef
    pen = TTGlyphPen(None)
    pen.moveTo((50, 0))
    pen.lineTo((50, 700))
    pen.lineTo((450, 700))
    pen.lineTo((450, 0))
    pen.closePath()
    pen.moveTo((100, 50))
    pen.lineTo((400, 50))
    pen.lineTo((400, 650))
    pen.lineTo((100, 650))
    pen.closePath()
    glyphs[".notdef"] = pen.glyph()
    metrics[".notdef"] = (500, 0)
    
    # space
    pen = TTGlyphPen(None)
    glyphs["space"] = pen.glyph()
    metrics["space"] = (300, 0)
    
    def generate_glyph(char, make_func):
        pen = TTGlyphPen(None)
        w = make_func(pen)
        glyphs[char] = pen.glyph()
        metrics[char] = (w + 120, 60) # advance width with sidebearings
        
    generate_glyph("E", make_E)
    generate_glyph("S", make_S)
    
    # O requires holes
    pen_o = TTGlyphPen(None)
    w_o = make_O(pen_o)
    make_O_hole(pen_o)
    glyphs["O"] = pen_o.glyph()
    metrics["O"] = (w_o + 120, 60)
    
    generate_glyph("L", make_L)
    
    generate_glyph("e", make_energy_e)
    generate_glyph("n", make_energy_n)
    generate_glyph("r", make_energy_r)
    generate_glyph("g", make_energy_g)
    generate_glyph("y", make_energy_y)
    
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader()
    
    name_strings = {
        "familyName": "EsolDisplay",
        "styleName": "Regular",
        "uniqueFontIdentifier": "EsolDisplay-Regular:1.1.0",
        "fullName": "EsolDisplay-Regular",
        "psName": "EsolDisplay-Regular",
        "version": "Version 1.100"
    }
    fb.setupNameTable(name_strings)
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, sxHeight=500, sCapHeight=700)
    fb.setupPost()
    
    ttf_out = "public/fonts/EsolDisplay-Regular.ttf"
    fb.save(ttf_out)
    print(f"Font TTF generated: {ttf_out}")
    
    try:
        font = TTFont(ttf_out)
        font.flavor = "woff2"
        woff2_out = "public/fonts/EsolDisplay-Regular.woff2"
        font.save(woff2_out)
        print(f"Font WOFF2 generated: {woff2_out}")
    except Exception as e:
        print(f"Failed WOFF2: {e}")

# --- SVG GENERATION USING TRUE FONT PATHS ---
def build_svgs():
    os.makedirs("public/brand-kit/1. Web-SVG", exist_ok=True)
    os.makedirs("src/assets", exist_ok=True)
    
    print("Building SVGs...")
    # Para o SVG da logo horizontal:
    # "ESOL" em azul/amarelo
    # "ENERGY" em cinza
    # Tagline em texto puro <text font-family="Montserrat">
    
    # Isso resolve a questao do slogan!
    
    svg_horiz = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4200 1500" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&amp;display=swap');
      .tagline {
        font-family: 'Montserrat', sans-serif;
        font-weight: 500;
        font-size: 260px;
        letter-spacing: 20px;
      }
    </style>
  </defs>
  
  <g transform="translate(150, 850) scale(1, -1)">
    <!-- As fontes em fontTools tem Y subindo. Escalar -1 inverte para tela -->
    <!-- E -->
    <path d="M90 0 Q0 0 0 90 L0 610 Q0 700 90 700 L310 700 Q400 700 400 610 L400 540 L160 540 L160 430 L350 430 L350 270 L160 270 L160 160 L400 160 L400 0 Z" fill="#001F5C" />
    
    <!-- S -->
    <path d="M470 90 L470 160 L710 160 L710 270 L560 270 Q470 270 470 360 L470 610 Q470 700 560 700 L870 700 L870 540 L630 540 L630 430 L780 430 Q870 430 870 340 L870 90 Q870 0 780 0 L560 0 Q470 0 470 90 Z" fill="#001F5C" />
    
    <!-- O (Sol) -->
    <path d="M1290 0 Q1041 0 1041 350 Q1041 700 1290 700 Q1539 700 1539 350 Q1539 0 1290 0 Z M1290 160 Q1480 160 1480 350 Q1480 540 1290 540 Q1100 540 1100 350 Q1100 160 1290 160 Z" fill="#FFC107" fill-rule="evenodd" />
    
    <!-- L -->
    <path d="M1710 0 Q1620 0 1620 90 L1620 700 L1780 700 L1780 160 L2000 160 L2000 0 Z" fill="#001F5C" />
  </g>
  
  <g transform="translate(150, 1050)">
    <!-- ENERGY letters manually drawn (polygons) -->
    <g fill="#475569">
      <!-- E -->
      <polygon points="134,0 0,500 350,500 320,390 102,390 70,270 290,270 260,160 41,160 10,40 360,40 370,0" />
      <!-- N -->
      <polygon points="564,0 430,500 780,500 810,390 622,390 530,40 880,40 870,0" />
      <!-- E -->
      <polygon points="1064,0 930,500 1280,500 1250,390 1032,390 1000,270 1220,270 1190,160 971,160 940,40 1290,40 1300,0" />
      <!-- R -->
      <polygon points="1494,0 1360,500 1710,500 1690,390 1472,390 1450,250 1660,250 1620,0 1490,0 1530,230 1420,230 1370,0" fill-rule="evenodd"/>
      <!-- G -->
      <polygon points="1944,0 1810,500 2160,500 2130,390 1912,390 1890,270 2110,270 2080,160 1871,160 1840,40 2190,40 2200,0" />
      <!-- Y -->
      <polygon points="2434,0 2300,500 2410,500 2450,290 2610,500 2740,500 2520,230 2570,0" />
    </g>
  </g>
  
  <text x="150" y="1400" fill="#475569" class="tagline">Deixe o sol trabalhar por você.</text>
</svg>"""

    with open("public/brand-kit/1. Web-SVG/esol-logo-horizontal.svg", "w", encoding="utf-8") as f:
        f.write(svg_horiz)
        
    with open("src/assets/esol-logo.svg", "w", encoding="utf-8") as f:
        f.write(svg_horiz)
        
    # Negative version
    svg_horiz_neg = svg_horiz.replace('fill="#001F5C"', 'fill="#FFFFFF"').replace('fill="#475569"', 'fill="#FFFFFF"')
    with open("public/brand-kit/1. Web-SVG/esol-logo-horizontal-negative.svg", "w", encoding="utf-8") as f:
        f.write(svg_horiz_neg)
    with open("src/assets/esol-logo-negative.svg", "w", encoding="utf-8") as f:
        f.write(svg_horiz_neg)
        
    # Stacked version (Centered)
    svg_stacked = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 2400" width="100%" height="100%">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&amp;display=swap');
      .tagline {
        font-family: 'Montserrat', sans-serif;
        font-weight: 500;
        font-size: 200px;
        letter-spacing: 15px;
      }
    </style>
  </defs>
  <g transform="translate(200, 1000) scale(1, -1)">
    <path d="M90 0 Q0 0 0 90 L0 610 Q0 700 90 700 L310 700 Q400 700 400 610 L400 540 L160 540 L160 430 L350 430 L350 270 L160 270 L160 160 L400 160 L400 0 Z" fill="#001F5C" />
    <path d="M470 90 L470 160 L710 160 L710 270 L560 270 Q470 270 470 360 L470 610 Q470 700 560 700 L870 700 L870 540 L630 540 L630 430 L780 430 Q870 430 870 340 L870 90 Q870 0 780 0 L560 0 Q470 0 470 90 Z" fill="#001F5C" />
    <path d="M1290 0 Q1041 0 1041 350 Q1041 700 1290 700 Q1539 700 1539 350 Q1539 0 1290 0 Z M1290 160 Q1480 160 1480 350 Q1480 540 1290 540 Q1100 540 1100 350 Q1100 160 1290 160 Z" fill="#FFC107" fill-rule="evenodd" />
    <path d="M1710 0 Q1620 0 1620 90 L1620 700 L1780 700 L1780 160 L2000 160 L2000 0 Z" fill="#001F5C" />
  </g>
  <g transform="translate(200, 1200) scale(0.7, 0.7)">
    <g fill="#475569">
      <polygon points="134,0 0,500 350,500 320,390 102,390 70,270 290,270 260,160 41,160 10,40 360,40 370,0" />
      <polygon points="564,0 430,500 780,500 810,390 622,390 530,40 880,40 870,0" />
      <polygon points="1064,0 930,500 1280,500 1250,390 1032,390 1000,270 1220,270 1190,160 971,160 940,40 1290,40 1300,0" />
      <polygon points="1494,0 1360,500 1710,500 1690,390 1472,390 1450,250 1660,250 1620,0 1490,0 1530,230 1420,230 1370,0" fill-rule="evenodd"/>
      <polygon points="1944,0 1810,500 2160,500 2130,390 1912,390 1890,270 2110,270 2080,160 1871,160 1840,40 2190,40 2200,0" />
      <polygon points="2434,0 2300,500 2410,500 2450,290 2610,500 2740,500 2520,230 2570,0" />
    </g>
  </g>
  <text x="200" y="1800" fill="#475569" class="tagline">Deixe o sol trabalhar por você.</text>
</svg>"""
    with open("public/brand-kit/1. Web-SVG/esol-logo-stacked.svg", "w", encoding="utf-8") as f:
        f.write(svg_stacked)
        
    svg_stacked_neg = svg_stacked.replace('fill="#001F5C"', 'fill="#FFFFFF"').replace('fill="#475569"', 'fill="#FFFFFF"')
    with open("public/brand-kit/1. Web-SVG/esol-logo-stacked-negative.svg", "w", encoding="utf-8") as f:
        f.write(svg_stacked_neg)
        
    # Brandmark (Just the Sun O)
    svg_brandmark = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <g transform="translate(150, 750) scale(1, -1)">
    <path d="M250 0 Q1 0 1 350 Q1 700 250 700 Q499 700 499 350 Q499 0 250 0 Z M250 160 Q440 160 440 350 Q440 540 250 540 Q60 540 60 350 Q60 160 250 160 Z" fill="#FFC107" fill-rule="evenodd" />
  </g>
</svg>"""
    with open("public/brand-kit/1. Web-SVG/esol-logo-brandmark.svg", "w", encoding="utf-8") as f:
        f.write(svg_brandmark)
        
    svg_brandmark_white = svg_brandmark.replace('fill="#FFC107"', 'fill="#FFFFFF"')
    with open("public/brand-kit/1. Web-SVG/esol-logo-brandmark-white.svg", "w", encoding="utf-8") as f:
        f.write(svg_brandmark_white)

    print("All SVGs generated!")

if __name__ == "__main__":
    build_font()
    build_svgs()
