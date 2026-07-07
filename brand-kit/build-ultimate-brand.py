import os
import math
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

# --- CONFIGURAÇÃO GEOMÉTRICA PARAMÉTRICA ---
CAP_HEIGHT = 500  # Altura de cap do ESOL (mais compacto)
STEM = 100        # Espessura das hastes do ESOL
R = 50            # Raio de curvatura das quinas do ESOL
SLANT_DEG = 15    # Inclinação constante de 15 graus
SLANT_TAN = math.tan(math.radians(SLANT_DEG))

E_CAP_HEIGHT = 200  # Altura de cap do ENERGY (escala elegante)
E_STEM = 25         # Espessura fina das hastes do ENERGY
E_R = 25            # Raio de curvatura para o ENERGY (se houver)

def transform_font(x, y, cap_h=None):
    """Transformação para a fonte TTF (Y-up nativo)"""
    return x + y * SLANT_TAN, y

def transform_svg(x, y, cap_h=CAP_HEIGHT):
    """Transformação para o SVG (Y-down nativo)"""
    return x + (cap_h - y) * SLANT_TAN, cap_h - y

def add_quadratic_ellipse_arc(pen, cx, cy, rx, ry, theta1, theta2, is_svg=False, cap_h=CAP_HEIGHT):
    """Gera arcos de elipse matemáticos precisos usando beziers quadráticas"""
    segments = math.ceil(abs(theta2 - theta1) / (math.pi / 4))
    dt = (theta2 - theta1) / segments
    
    trans = transform_svg if is_svg else transform_font
    
    for i in range(segments):
        t1 = theta1 + i * dt
        t2 = t1 + dt
        p1 = (cx + rx * math.cos(t1), cy + ry * math.sin(t1))
        p2 = (cx + rx * math.cos(t2), cy + ry * math.sin(t2))
        
        t_mid = (t1 + t2) / 2
        rx_cp = rx / math.cos(dt / 2)
        ry_cp = ry / math.cos(dt / 2)
        cp = (cx + rx_cp * math.cos(t_mid), cy + ry_cp * math.sin(t_mid))
        
        pen.qCurveTo(trans(*cp, cap_h), trans(*p2, cap_h))

def add_quadratic_rotated_arc(pen, cx, cy, r, theta1, theta2, alpha, is_svg=False, cap_h=700):
    """Gera arcos rotacionados (para o Sol cortado a 45 graus) antes do slant"""
    segments = math.ceil(abs(theta2 - theta1) / (math.pi / 4))
    dt = (theta2 - theta1) / segments
    
    def rot_trans(x, y):
        xr = x * math.cos(alpha) - y * math.sin(alpha)
        yr = x * math.sin(alpha) + y * math.cos(alpha)
        cx_c, cy_c = 500, 500 # centraliza no sol
        return transform_svg(cx_c + xr, cy_c + yr, cap_h) if is_svg else transform_font(cx_c + xr, cy_c + yr)
        
    for i in range(segments):
        t1 = theta1 + i * dt
        t2 = t1 + dt
        p1 = (cx + r * math.cos(t1), cy + r * math.sin(t1))
        p2 = (cx + r * math.cos(t2), cy + r * math.sin(t2))
        
        t_mid = (t1 + t2) / 2
        r_cp = r / math.cos(dt / 2)
        cp = (cx + r_cp * math.cos(t_mid), cy + r_cp * math.sin(t_mid))
        
        pen.qCurveTo(rot_trans(*cp), rot_trans(*p2))

# --- DESENHO DE GLIFOS ---

def make_E(pen, is_svg=False, cap_h=CAP_HEIGHT):
    w = 320
    trans = transform_svg if is_svg else transform_font
    pen.moveTo(trans(R, 0, cap_h))
    pen.qCurveTo(trans(0, 0, cap_h), trans(0, R, cap_h))
    pen.lineTo(trans(0, CAP_HEIGHT - R, cap_h))
    pen.qCurveTo(trans(0, CAP_HEIGHT, cap_h), trans(R, CAP_HEIGHT, cap_h))
    pen.lineTo(trans(w, CAP_HEIGHT, cap_h))
    pen.lineTo(trans(w, CAP_HEIGHT - STEM, cap_h))
    pen.lineTo(trans(STEM, CAP_HEIGHT - STEM, cap_h))
    pen.lineTo(trans(STEM, int(CAP_HEIGHT/2) + int(STEM/2), cap_h))
    pen.lineTo(trans(w - 60, int(CAP_HEIGHT/2) + int(STEM/2), cap_h))
    pen.lineTo(trans(w - 60, int(CAP_HEIGHT/2) - int(STEM/2), cap_h))
    pen.lineTo(trans(STEM, int(CAP_HEIGHT/2) - int(STEM/2), cap_h))
    pen.lineTo(trans(STEM, STEM, cap_h))
    pen.lineTo(trans(w, STEM, cap_h))
    pen.lineTo(trans(w, 0, cap_h))
    pen.closePath()
    return w

def make_S(pen, is_svg=False, cap_h=CAP_HEIGHT):
    w = 320
    trans = transform_svg if is_svg else transform_font
    pen.moveTo(trans(0, R, cap_h))
    pen.lineTo(trans(0, STEM, cap_h))
    pen.lineTo(trans(w - STEM, STEM, cap_h))
    pen.lineTo(trans(w - STEM, int(CAP_HEIGHT/2) - int(STEM/2), cap_h))
    pen.lineTo(trans(R, int(CAP_HEIGHT/2) - int(STEM/2), cap_h))
    pen.qCurveTo(trans(0, int(CAP_HEIGHT/2) - int(STEM/2), cap_h), trans(0, int(CAP_HEIGHT/2) - int(STEM/2) + R, cap_h))
    pen.lineTo(trans(0, CAP_HEIGHT - R, cap_h))
    pen.qCurveTo(trans(0, CAP_HEIGHT, cap_h), trans(R, CAP_HEIGHT, cap_h))
    pen.lineTo(trans(w, CAP_HEIGHT, cap_h))
    pen.lineTo(trans(w, CAP_HEIGHT - STEM, cap_h))
    pen.lineTo(trans(STEM, CAP_HEIGHT - STEM, cap_h))
    pen.lineTo(trans(STEM, int(CAP_HEIGHT/2) + int(STEM/2), cap_h))
    pen.lineTo(trans(w - R, int(CAP_HEIGHT/2) + int(STEM/2), cap_h))
    pen.qCurveTo(trans(w, int(CAP_HEIGHT/2) + int(STEM/2), cap_h), trans(w, int(CAP_HEIGHT/2) + int(STEM/2) - R, cap_h))
    pen.lineTo(trans(w, R, cap_h))
    pen.qCurveTo(trans(w, 0, cap_h), trans(w - R, 0, cap_h))
    pen.lineTo(trans(R, 0, cap_h))
    pen.qCurveTo(trans(0, 0, cap_h), trans(0, R, cap_h))
    pen.closePath()
    return w

def make_O(pen, is_svg=False, cap_h=CAP_HEIGHT):
    w = 420
    cx, cy = w/2, CAP_HEIGHT/2
    rx_out, ry_out = w/2, CAP_HEIGHT/2
    rx_in, ry_in = rx_out - STEM, ry_out - STEM
    trans = transform_svg if is_svg else transform_font
    
    pen.moveTo(trans(cx + rx_out, cy, cap_h))
    add_quadratic_ellipse_arc(pen, cx, cy, rx_out, ry_out, 0, 2*math.pi, is_svg, cap_h)
    pen.closePath()
    
    pen.moveTo(trans(cx + rx_in, cy, cap_h))
    add_quadratic_ellipse_arc(pen, cx, cy, rx_in, ry_in, 2*math.pi, 0, is_svg, cap_h)
    pen.closePath()
    return w

def make_L(pen, is_svg=False, cap_h=CAP_HEIGHT):
    w = 300
    trans = transform_svg if is_svg else transform_font
    pen.moveTo(trans(R, 0, cap_h))
    pen.qCurveTo(trans(0, 0, cap_h), trans(0, R, cap_h))
    pen.lineTo(trans(0, CAP_HEIGHT, cap_h))
    pen.lineTo(trans(STEM, CAP_HEIGHT, cap_h))
    pen.lineTo(trans(STEM, STEM, cap_h))
    pen.lineTo(trans(w, STEM, cap_h))
    pen.lineTo(trans(w, 0, cap_h))
    pen.closePath()
    return w

# --- ENERGY LETRAS (Finas e geométricas) ---

def make_energy_e(pen, is_svg=False, cap_h=E_CAP_HEIGHT):
    w = 160
    h = E_CAP_HEIGHT
    s = E_STEM
    trans = transform_svg if is_svg else transform_font
    pts = [
        (0, 0), (0, h), (w, h), (w, h-s),
        (s, h-s), (s, int(h/2)+int(s/2)), (w-30, int(h/2)+int(s/2)),
        (w-30, int(h/2)-int(s/2)), (s, int(h/2)-int(s/2)),
        (s, s), (w, s), (w, 0)
    ]
    pen.moveTo(trans(*pts[0], cap_h))
    for p in pts[1:]: pen.lineTo(trans(*p, cap_h))
    pen.closePath()
    return w

def make_energy_n(pen, is_svg=False, cap_h=E_CAP_HEIGHT):
    w = 160
    h = E_CAP_HEIGHT
    s = E_STEM
    trans = transform_svg if is_svg else transform_font
    pts = [
        (0, 0), (0, h), (s, h), (w-s, s), (w-s, h), (w, h), (w, 0), (w-s, 0), (s, h-s), (s, 0)
    ]
    pen.moveTo(trans(*pts[0], cap_h))
    for p in pts[1:]: pen.lineTo(trans(*p, cap_h))
    pen.closePath()
    return w

def make_energy_r(pen, is_svg=False, cap_h=E_CAP_HEIGHT):
    w = 160
    h = E_CAP_HEIGHT
    s = E_STEM
    trans = transform_svg if is_svg else transform_font
    pts_outer = [
        (0, 0), (0, h), (w, h), (w, int(h/2)), (s+20, int(h/2)),
        (w, 0), (w-s-10, 0), (s, int(h/2)-10), (s, 0)
    ]
    pen.moveTo(trans(*pts_outer[0], cap_h))
    for p in pts_outer[1:]: pen.lineTo(trans(*p, cap_h))
    pen.closePath()
    
    pts_hole = [
        (s, int(h/2)+20), (w-s, int(h/2)+20), (w-s, h-s), (s, h-s)
    ]
    pen.moveTo(trans(*pts_hole[0], cap_h))
    for p in reversed(pts_hole[1:]): pen.lineTo(trans(*p, cap_h))
    pen.closePath()
    return w

def make_energy_g(pen, is_svg=False, cap_h=E_CAP_HEIGHT):
    w = 160
    h = E_CAP_HEIGHT
    s = E_STEM
    trans = transform_svg if is_svg else transform_font
    pts = [
        (0, 0), (0, h), (w, h), (w, h-s), (s, h-s),
        (s, s), (w-s, s), (w-s, int(h/2)-int(s/2)),
        (int(w/2)+10, int(h/2)-int(s/2)), (int(w/2)+10, int(h/2)+int(s/2)),
        (w, int(h/2)+int(s/2)), (w, 0)
    ]
    pen.moveTo(trans(*pts[0], cap_h))
    for p in pts[1:]: pen.lineTo(trans(*p, cap_h))
    pen.closePath()
    return w

def make_energy_y(pen, is_svg=False, cap_h=E_CAP_HEIGHT):
    w = 160
    h = E_CAP_HEIGHT
    s = E_STEM
    trans = transform_svg if is_svg else transform_font
    pts = [
        (int(w/2)-int(s/2), 0), (int(w/2)-int(s/2), int(h/2)),
        (0, h), (s, h), (int(w/2), int(h/2)+s),
        (w-s, h), (w, h), (int(w/2)+int(s/2), int(h/2)),
        (int(w/2)+int(s/2), 0)
    ]
    pen.moveTo(trans(*pts[0], cap_h))
    for p in pts[1:]: pen.lineTo(trans(*p, cap_h))
    pen.closePath()
    return w

# --- MINÚSCULAS AUXILIARES DO ENERGY (e, s, o, l, n, r, g, y) ---

def make_energy_s(pen, is_svg=False, cap_h=E_CAP_HEIGHT):
    w = 160
    h = E_CAP_HEIGHT
    stem = E_STEM
    r = E_R
    trans = transform_svg if is_svg else transform_font
    pen.moveTo(trans(0, r, cap_h))
    pen.lineTo(trans(0, stem, cap_h))
    pen.lineTo(trans(w - stem, stem, cap_h))
    pen.lineTo(trans(w - stem, int(h/2) - int(stem/2), cap_h))
    pen.lineTo(trans(r, int(h/2) - int(stem/2), cap_h))
    pen.qCurveTo(trans(0, int(h/2) - int(stem/2), cap_h), trans(0, int(h/2) - int(stem/2) + r, cap_h))
    pen.lineTo(trans(0, h - r, cap_h))
    pen.qCurveTo(trans(0, h, cap_h), trans(r, h, cap_h))
    pen.lineTo(trans(w, h, cap_h))
    pen.lineTo(trans(w, h - stem, cap_h))
    pen.lineTo(trans(stem, h - stem, cap_h))
    pen.lineTo(trans(stem, int(h/2) + int(stem/2), cap_h))
    pen.lineTo(trans(w - r, int(h/2) + int(stem/2), cap_h))
    pen.qCurveTo(trans(w, int(h/2) + int(stem/2), cap_h), trans(w, int(h/2) + int(stem/2) - r, cap_h))
    pen.lineTo(trans(w, r, cap_h))
    pen.qCurveTo(trans(w, 0, cap_h), trans(w - r, 0, cap_h))
    pen.lineTo(trans(r, 0, cap_h))
    pen.qCurveTo(trans(0, 0, cap_h), trans(0, r, cap_h))
    pen.closePath()
    return w

def make_energy_o(pen, is_svg=False, cap_h=E_CAP_HEIGHT):
    w = 160
    h = E_CAP_HEIGHT
    cx, cy = w/2, h/2
    rx_out, ry_out = w/2, h/2
    rx_in, ry_in = rx_out - E_STEM, ry_out - E_STEM
    trans = transform_svg if is_svg else transform_font
    
    pen.moveTo(trans(cx + rx_out, cy, cap_h))
    add_quadratic_ellipse_arc(pen, cx, cy, rx_out, ry_out, 0, 2*math.pi, is_svg, cap_h)
    pen.closePath()
    
    pen.moveTo(trans(cx + rx_in, cy, cap_h))
    add_quadratic_ellipse_arc(pen, cx, cy, rx_in, ry_in, 2*math.pi, 0, is_svg, cap_h)
    pen.closePath()
    return w

def make_energy_l(pen, is_svg=False, cap_h=E_CAP_HEIGHT):
    w = 140
    h = E_CAP_HEIGHT
    stem = E_STEM
    r = E_R
    trans = transform_svg if is_svg else transform_font
    pen.moveTo(trans(r, 0, cap_h))
    pen.qCurveTo(trans(0, 0, cap_h), trans(0, r, cap_h))
    pen.lineTo(trans(0, h, cap_h))
    pen.lineTo(trans(stem, h, cap_h))
    pen.lineTo(trans(stem, stem, cap_h))
    pen.lineTo(trans(w, stem, cap_h))
    pen.lineTo(trans(w, 0, cap_h))
    pen.closePath()
    return w

# --- BRANDMARK SÍMBOLO DO SOL CORTADO MATEMÁTICO ---

def make_sun_half(pen, Ro, Ri, d, is_top, is_svg=False, cap_h=1000):
    sign = 1 if is_top else -1
    theta1 = math.asin(d / Ro)
    theta2 = math.pi - theta1
    theta3 = math.asin(d / Ri)
    theta4 = math.pi - theta3
    
    alpha = math.pi / 4 # Inclinação a 45 graus
    
    def rot_trans(x, y):
        # Rotaciona
        xr = x * math.cos(alpha) - y * math.sin(alpha)
        yr = x * math.sin(alpha) + y * math.cos(alpha)
        # Desloca para centralizar no canvas de 1000x1000
        cx, cy = 500, 500
        return transform_svg(cx + xr, cy + yr, cap_h) if is_svg else transform_font(cx + xr, cy + yr)

    ax, ay = -math.sqrt(Ro**2 - d**2), sign * d
    bx, by = math.sqrt(Ro**2 - d**2), sign * d
    cx_pt, cy_pt = math.sqrt(Ri**2 - d**2), sign * d
    dx, dy = -math.sqrt(Ri**2 - d**2), sign * d
    
    if is_top:
        pen.moveTo(rot_trans(ax, ay))
        add_quadratic_rotated_arc(pen, 0, 0, Ro, theta1, theta2, alpha, is_svg, cap_h)
        pen.lineTo(rot_trans(cx_pt, cy_pt))
        add_quadratic_rotated_arc(pen, 0, 0, Ri, theta4, theta3, alpha, is_svg, cap_h)
        pen.closePath()
    else:
        pen.moveTo(rot_trans(bx, by))
        add_quadratic_rotated_arc(pen, 0, 0, Ro, math.pi + theta1, 2*math.pi - theta1, alpha, is_svg, cap_h)
        pen.lineTo(rot_trans(dx, dy))
        add_quadratic_rotated_arc(pen, 0, 0, Ri, 2*math.pi - theta3, math.pi + theta3, alpha, is_svg, cap_h)
        pen.closePath()

def make_brandmark(pen, is_svg=False, cap_h=1000):
    # Sol cortado perfeito: Raio Externo 350, Interno 190, canal de corte 30 (largura 60)
    make_sun_half(pen, 350, 190, 30, True, is_svg, cap_h)
    make_sun_half(pen, 350, 190, 30, False, is_svg, cap_h)

# ----------------- FONT BUILDER -----------------

def build_font_and_svgs():
    print("Iniciando compilação da fonte paramétrica pura...")
    os.makedirs("public/fonts", exist_ok=True)
    
    fb = FontBuilder(1000, isTTF=True)
    glyph_order = [
        ".notdef", "space", 
        "E", "S", "O", "L", 
        "e", "s", "o", "l", "n", "r", "g", "y"
    ]
    fb.setupGlyphOrder(glyph_order)
    
    cmap = {
        32: "space",
        69: "E", 83: "S", 79: "O", 76: "L",
        101: "e", 115: "s", 111: "o", 108: "l", 110: "n", 114: "r", 103: "g", 121: "y"
    }
    fb.setupCharacterMap(cmap)
    
    glyphs = {}
    metrics = {}
    svg_paths = {} # Salvar os paths do SVG em paralelo
    
    # .notdef e space
    glyphs[".notdef"] = TTGlyphPen(None).glyph()
    metrics[".notdef"] = (500, 0)
    glyphs["space"] = TTGlyphPen(None).glyph()
    metrics["space"] = (300, 0)
    
    def generate(char, make_func, cap_h=CAP_HEIGHT):
        # TTF Glyph
        tt_pen = TTGlyphPen(None)
        w = make_func(tt_pen, is_svg=False, cap_h=cap_h)
        glyphs[char] = tt_pen.glyph()
        
        # Advance Width para a fonte (compensando slant)
        aw = int(w + (cap_h * SLANT_TAN) + 60)
        metrics[char] = (aw, 30)
        
        # SVG Path
        svg_pen = SVGPathPen(None)
        make_func(svg_pen, is_svg=True, cap_h=cap_h)
        svg_paths[char] = svg_pen.getCommands()
        
        return aw
        
    aw_E = generate("E", make_E, CAP_HEIGHT)
    aw_S = generate("S", make_S, CAP_HEIGHT)
    aw_O = generate("O", make_O, CAP_HEIGHT)
    aw_L = generate("L", make_L, CAP_HEIGHT)
    
    aw_e = generate("e", make_energy_e, E_CAP_HEIGHT)
    aw_s = generate("s", make_energy_s, E_CAP_HEIGHT)
    aw_o = generate("o", make_energy_o, E_CAP_HEIGHT)
    aw_l = generate("l", make_energy_l, E_CAP_HEIGHT)
    aw_n = generate("n", make_energy_n, E_CAP_HEIGHT)
    aw_r = generate("r", make_energy_r, E_CAP_HEIGHT)
    aw_g = generate("g", make_energy_g, E_CAP_HEIGHT)
    aw_y = generate("y", make_energy_y, E_CAP_HEIGHT)
    
    # Export TTF
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    
    name_strings = {
        "familyName": "EsolDisplay",
        "styleName": "Regular",
        "uniqueFontIdentifier": "EsolDisplay-Regular:1.3.0",
        "fullName": "EsolDisplay-Regular",
        "psName": "EsolDisplay-Regular",
        "version": "Version 1.300"
    }
    fb.setupNameTable(name_strings)
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, sxHeight=E_CAP_HEIGHT, sCapHeight=CAP_HEIGHT)
    fb.setupPost()
    
    fb.save("public/fonts/EsolDisplay-Regular.ttf")
    print("Fonte EsolDisplay-Regular.ttf compilada com sucesso!")
    
    # WOFF2
    try:
        font = TTFont("public/fonts/EsolDisplay-Regular.ttf")
        font.flavor = "woff2"
        font.save("public/fonts/EsolDisplay-Regular.woff2")
        print("Fonte EsolDisplay-Regular.woff2 compilada com sucesso!")
    except Exception as e:
        print(f"Erro ao compilar WOFF2: {e}")

    # ----------------- GERAR OS VETORES SVG DO LOGOTIPO -----------------
    print("Construindo Logotipos Vetoriais SVG...")
    
    # Vamos calcular os offsets horizontais exatos (Kerning perfeito)
    # ESOL (Bold)
    # E (x=0) -> S -> O -> L
    k_esol = 40
    esol_pos = [
        0,
        aw_E - k_esol,
        (aw_E - k_esol) + (aw_S - k_esol),
        (aw_E - k_esol) + (aw_S - k_esol) + (aw_O - k_esol)
    ]
    w_esol_total = esol_pos[-1] + aw_L
    # Adiciona o avanço do slant no final
    w_esol_total += int(CAP_HEIGHT * SLANT_TAN)
    
    # ENERGY (Thin, alinhado e justificado sob o ESOL)
    # Para alinhar com o final de L, a largura do ENERGY deve ser exatamente w_esol_total.
    # Temos 6 letras: E, N, E, R, G, Y
    energy_letters = ["e", "n", "e", "r", "g", "y"]
    energy_aws = {"e": aw_e, "n": aw_n, "r": aw_r, "g": aw_g, "y": aw_y}
    w_energy_letters_sum = sum(energy_aws[c] for c in energy_letters)
    # gap justificado:
    gap_energy = (w_esol_total - w_energy_letters_sum) / 5
    
    energy_pos = []
    curr_x = 0
    for c in energy_letters:
        energy_pos.append(curr_x)
        curr_x += energy_aws[c] + gap_energy
        
    # Construindo tags <g> de caminhos
    esol_paths = f'  <g fill="#001F5C">\\n'
    for i, c in enumerate(["E", "S", "O", "L"]):
        esol_paths += f'    <path d="{svg_paths[c]}" transform="translate({esol_pos[i]}, 0)" />' + "\\n"
    esol_paths += "  </g>\\n"
    
    energy_paths = f'  <g fill="#475569">\\n'
    for i, c in enumerate(energy_letters):
        energy_paths += f'    <path d="{svg_paths[c]}" transform="translate({energy_pos[i]}, 0)" />' + "\\n"
    energy_paths += "  </g>\\n"
    
    # SVG Estilo Central
    svg_defs = """  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&amp;display=swap');
      .tagline {
        font-family: 'Montserrat', sans-serif;
        font-weight: 500;
        font-size: 80px;
        letter-spacing: 14px;
        text-anchor: middle;
      }
    </style>
  </defs>"""

    # Canvas de 2300 x 1600.
    # Centralização:
    dx = (2300 - w_esol_total) / 2
    
    # 1. Horizontal Oficial
    svg_horiz = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2300 1600" width="100%" height="100%">
{svg_defs}
  <g transform="translate({dx}, 200)">
{esol_paths}
  </g>
  <g transform="translate({dx}, 900)">
{energy_paths}
  </g>
  <text x="1150" y="1320" fill="#475569" class="tagline">Deixe o sol trabalhar por voc\u00ea.</text>
</svg>"""

    # 2. Horizontal Negativa
    svg_horiz_neg = svg_horiz.replace('#001F5C', '#FFFFFF').replace('#475569', '#FFFFFF')

    # 3. Brandmark (O Sol Cortado a 45 graus puro)
    # Geramos o path para o Brandmark diretamente no canvas 1000x1000
    bm_svg_pen = SVGPathPen(None)
    make_brandmark(bm_svg_pen, is_svg=True, cap_h=1000)
    brandmark_d = bm_svg_pen.getCommands()
    
    brandmark_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <path d="{brandmark_d}" fill="#FFB300" />
</svg>"""
    brandmark_svg_white = brandmark_svg.replace('#FFB300', '#FFFFFF')

    # 4. Stacked (Símbolo do Sol no topo, ESOL e ENERGY abaixo centralizados)
    # A largura do ESOL é w_esol_total. O canvas tem largura 2400.
    # O Brandmark centralizado no topo: X=1200, Y=150
    # O ESOL centralizado abaixo: dx = (2400 - w_esol_total)/2. Y = 1100
    # O ENERGY centralizado abaixo: dx. Y = 1750
    # Slogan centralizado: X=1200, Y=2200
    dx_st = (2400 - w_esol_total) / 2
    
    stacked_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 2500" width="100%" height="100%">
{svg_defs}
  <!-- Brandmark (Sol) centralizado no topo -->
  <g transform="translate(700, 100) scale(1, 1)">
    <path d="{brandmark_d}" fill="#FFB300" transform="scale(1) translate(-500, -500) translate(500, 500)" />
  </g>
  <g transform="translate({dx_st}, 1250)">
{esol_paths}
  </g>
  <g transform="translate({dx_st}, 1850)">
{energy_paths}
  </g>
  <text x="1200" y="2250" fill="#475569" class="tagline" style="font-size: 85px; letter-spacing: 16px;">Deixe o sol trabalhar por voc\u00ea.</text>
</svg>"""

    stacked_svg_neg = stacked_svg.replace('#001F5C', '#FFFFFF').replace('#475569', '#FFFFFF').replace('#FFB300', '#FFFFFF')

    # Salva todos os arquivos
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
    
    print("Todos os SVGs foram compilados matematicamente com perfeição absoluta!")

if __name__ == "__main__":
    build_font_and_svgs()
