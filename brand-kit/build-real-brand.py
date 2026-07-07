import os
import math
from fontTools.ttLib import TTFont
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
from fontTools.pens.cu2quPen import Cu2QuPen

def build_real_brand():
    print("Iniciando reconstrução tipográfica profissional via injeção de glifos reais...")
    
    neo_path = "brand-kit/temp-fonts/NeoSansMedium.ttf"
    euro_path = "brand-kit/temp-fonts/EurostileBold.ttf"
    
    if not os.path.exists(neo_path) or not os.path.exists(euro_path):
        print("Erro: Fontes originais não encontradas em temp-fonts.")
        return
        
    font_neo = TTFont(neo_path)
    font_euro = TTFont(euro_path)
    
    glyph_set_neo = font_neo.getGlyphSet()
    glyph_set_euro = font_euro.getGlyphSet()
    
    # transformações de slant (13.76 graus) e escala
    t_neo = Transform(1.28, 0, 0.245, 1, 0, 0)
    t_euro = Transform(1.35, 0, 0.245, 1, 0, 0)
    
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
    svg_paths = {}
    
    glyphs[".notdef"] = TTGlyphPen(None).glyph()
    metrics[".notdef"] = (500, 0)
    glyphs["space"] = TTGlyphPen(None).glyph()
    metrics["space"] = (300, 0)
    
    def process_glyph(char, glyph_set, src_name, transform_matrix, scale_w, is_cubic=False):
        tt_pen = TTGlyphPen(glyph_set)
        if is_cubic:
            target_pen = Cu2QuPen(tt_pen, max_err=2, reverse_direction=True)
        else:
            target_pen = tt_pen
            
        trans_pen = TransformPen(target_pen, transform_matrix)
        glyph_set[src_name].draw(trans_pen)
        glyphs[char] = tt_pen.glyph()
        
        orig_w = glyph_set[src_name].width
        aw = int(orig_w * scale_w)
        metrics[char] = (aw, 0)
        
        svg_pen = SVGPathPen(glyph_set)
        trans_svg_pen = TransformPen(svg_pen, transform_matrix)
        glyph_set[src_name].draw(trans_svg_pen)
        svg_paths[char] = svg_pen.getCommands()
        
        return aw

    # Gerar glifos de ESOL (Neo Sans Medium)
    aw_E = process_glyph("E", glyph_set_neo, "E", t_neo, 1.28)
    aw_S = process_glyph("S", glyph_set_neo, "S", t_neo, 1.28)
    aw_O = process_glyph("O", glyph_set_neo, "O", t_neo, 1.28)
    aw_L = process_glyph("L", glyph_set_neo, "L", t_neo, 1.28)
    
    # Gerar glifos de ENERGY (Eurostile Bold)
    aw_e = process_glyph("e", glyph_set_euro, "E", t_euro, 1.35, is_cubic=True)
    aw_s = process_glyph("s", glyph_set_euro, "S", t_euro, 1.35, is_cubic=True)
    aw_o = process_glyph("o", glyph_set_euro, "O", t_euro, 1.35, is_cubic=True)
    aw_l = process_glyph("l", glyph_set_euro, "L", t_euro, 1.35, is_cubic=True)
    aw_n = process_glyph("n", glyph_set_euro, "N", t_euro, 1.35, is_cubic=True)
    aw_r = process_glyph("r", glyph_set_euro, "R", t_euro, 1.35, is_cubic=True)
    aw_g = process_glyph("g", glyph_set_euro, "G", t_euro, 1.35, is_cubic=True)
    aw_y = process_glyph("y", glyph_set_euro, "Y", t_euro, 1.35, is_cubic=True)
    
    # Compilar a fonte
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    
    name_strings = {
        "familyName": "EsolDisplay",
        "styleName": "Regular",
        "uniqueFontIdentifier": "EsolDisplay-Regular:2.0.0",
        "fullName": "EsolDisplay-Regular",
        "psName": "EsolDisplay-Regular",
        "version": "Version 2.000"
    }
    fb.setupNameTable(name_strings)
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, sxHeight=400, sCapHeight=700)
    fb.setupPost()
    
    fb.save("public/fonts/EsolDisplay-Regular.ttf")
    print("Fonte TTF compilada.")
    
    try:
        font = TTFont("public/fonts/EsolDisplay-Regular.ttf")
        font.flavor = "woff2"
        font.save("public/fonts/EsolDisplay-Regular.woff2")
    except Exception as e:
        print(f"Erro ao gerar WOFF2: {e}")

    # --- GERAR OS VETORES SVG DO LOGOTIPO ---
    # Layout ESOL
    k_esol = 40
    esol_pos = [0, aw_E - k_esol, (aw_E - k_esol) + (aw_S - k_esol), (aw_E - k_esol) + (aw_S - k_esol) + (aw_O - k_esol)]
    w_esol_total = esol_pos[-1] + aw_L
    
    # Layout ENERGY justificado matematicamente sob o ESOL considerando o scale(0.29)
    # Largura alvo do ENERGY dentro do grupo é w_esol_total / 0.29
    scale_energy = 0.29
    w_target_energy = w_esol_total / scale_energy
    
    energy_letters = ["e", "n", "e", "r", "g", "y"]
    energy_aws = {"e": aw_e, "n": aw_n, "r": aw_r, "g": aw_g, "y": aw_y}
    w_energy_letters_sum = sum(energy_aws[c] for c in energy_letters)
    
    gap_energy = (w_target_energy - w_energy_letters_sum) / 5
    
    energy_pos = []
    curr_x = 0
    for c in energy_letters:
        energy_pos.append(curr_x)
        curr_x += energy_aws[c] + gap_energy
        
    esol_paths = f'  <g fill="#001F5C">\\n'
    for i, c in enumerate(["E", "S", "O", "L"]):
        esol_paths += f'    <path d="{svg_paths[c]}" transform="translate({esol_pos[i]}, 0)" />' + "\\n"
    esol_paths += "  </g>\\n"
    
    energy_paths = f'  <g fill="#475569">\\n'
    for i, c in enumerate(energy_letters):
        energy_paths += f'    <path d="{svg_paths[c]}" transform="translate({energy_pos[i]}, 0)" />' + "\\n"
    energy_paths += "  </g>\\n"
    
    # Sem slogan no logotipo final
    margin = 150
    view_w = int(w_esol_total + 2 * margin)
    view_h = 1200 # ESOL em 750, ENERGY baseline em 1079
    dx = margin
    
    svg_horiz = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w} {view_h}" width="100%" height="100%">
  <!-- ESOL (Neo Sans) -->
  <g transform="translate({dx}, 750) scale(1, -1)">
{esol_paths}
  </g>
  <!-- ENERGY (Eurostile, justificado de ponta a ponta) -->
  <g transform="translate({dx}, 1079) scale(1, -1) scale({scale_energy})">
{energy_paths}
  </g>
</svg>"""

    svg_horiz_neg = svg_horiz.replace('#001F5C', '#FFFFFF').replace('#475569', '#FFFFFF')

    # Brandmark
    bm_svg_pen = SVGPathPen(None)
    make_brandmark(bm_svg_pen, is_svg=True, cap_h=1000)
    brandmark_d = bm_svg_pen.getCommands()
    
    brandmark_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <path d="{brandmark_d}" fill="#FFB300" />
</svg>"""
    brandmark_svg_white = brandmark_svg.replace('#FFB300', '#FFFFFF')

    # Stacked
    dx_st = (2400 - w_esol_total) / 2
    stacked_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 2300" width="100%" height="100%">
  <!-- Brandmark (Sol) no topo -->
  <g transform="translate(1200, 500) scale(1, -1) translate(-500, -500)">
    <path d="{brandmark_d}" fill="#FFB300" />
  </g>
  <!-- ESOL -->
  <g transform="translate({dx_st}, 1450) scale(1, -1)">
{esol_paths}
  </g>
  <!-- ENERGY -->
  <g transform="translate({dx_st}, 1780) scale(1, -1) scale({scale_energy})">
{energy_paths}
  </g>
</svg>"""

    stacked_svg_neg = stacked_svg.replace('#001F5C', '#FFFFFF').replace('#475569', '#FFFFFF').replace('#FFB300', '#FFFFFF')

    # Salvar
    with open("public/brand-kit/1. Web-SVG/esol-logo-horizontal.svg", "w", encoding="utf-8") as f: f.write(svg_horiz)
    with open("src/assets/esol-logo.svg", "w", encoding="utf-8") as f: f.write(svg_horiz)
    
    with open("public/brand-kit/1. Web-SVG/esol-logo-horizontal-negative.svg", "w", encoding="utf-8") as f: f.write(svg_horiz_neg)
    with open("src/assets/esol-logo-negative.svg", "w", encoding="utf-8") as f: f.write(svg_horiz_neg)
    
    with open("public/brand-kit/1. Web-SVG/esol-logo-stacked.svg", "w", encoding="utf-8") as f: f.write(stacked_svg)
    with open("public/brand-kit/1. Web-SVG/esol-logo-stacked-negative.svg", "w", encoding="utf-8") as f: f.write(stacked_svg_neg)
    
    with open("public/brand-kit/1. Web-SVG/esol-logo-brandmark.svg", "w", encoding="utf-8") as f: f.write(brandmark_svg)
    with open("public/brand-kit/1. Web-SVG/esol-logo-brandmark-white.svg", "w", encoding="utf-8") as f: f.write(brandmark_svg_white)
    
    print("Logos atualizados (sem slogan).")

# Desenho do sol cortado
def make_sun_half(pen, Ro, Ri, d, is_top, is_svg=False, cap_h=1000):
    sign = 1 if is_top else -1
    theta1 = math.asin(d / Ro)
    theta2 = math.pi - theta1
    theta3 = math.asin(d / Ri)
    theta4 = math.pi - theta3
    
    alpha = math.pi / 4
    
    def rot_trans(x, y):
        xr = x * math.cos(alpha) - y * math.sin(alpha)
        yr = x * math.sin(alpha) + y * math.cos(alpha)
        cx, cy = 500, 500
        return cx + xr, cy + yr

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
    make_sun_half(pen, 350, 190, 30, True, is_svg, cap_h)
    make_sun_half(pen, 350, 190, 30, False, is_svg, cap_h)

def add_quadratic_rotated_arc(pen, cx, cy, r, theta1, theta2, alpha, is_svg=False, cap_h=700):
    segments = math.ceil(abs(theta2 - theta1) / (math.pi / 4))
    dt = (theta2 - theta1) / segments
    
    def rot_trans(x, y):
        xr = x * math.cos(alpha) - y * math.sin(alpha)
        yr = x * math.sin(alpha) + y * math.cos(alpha)
        cx_c, cy_c = 500, 500
        return cx_c + xr, cy_c + yr
        
    for i in range(segments):
        t1 = theta1 + i * dt
        t2 = t1 + dt
        p1 = (cx + r * math.cos(t1), cy + r * math.sin(t1))
        p2 = (cx + r * math.cos(t2), cy + r * math.sin(t2))
        
        t_mid = (t1 + t2) / 2
        r_cp = r / math.cos(dt / 2)
        cp = (cx + r_cp * math.cos(t_mid), cy + r_cp * math.sin(t_mid))
        
        pen.qCurveTo(rot_trans(*cp), rot_trans(*p2))

if __name__ == "__main__":
    build_real_brand()
