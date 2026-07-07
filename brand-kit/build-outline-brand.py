import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

class ExplicitSVGPathPen(SVGPathPen):
    def _lineTo(self, pt):
        x, y = pt
        if x == self._lastX and y == self._lastY:
            return
        pts = f"{self._ntos(x)} {self._ntos(y)}"
        self._commands.append("L" + pts)
        self._lastCommand = "L"
        self._lastX, self._lastY = pt

def get_slanted_sun_path():
    import math
    R_out = 362.65
    R_in = 177.15
    c = 35.78
    Cy = 350
    steps = 80
    
    # Half 1 (Top-Left)
    pts_half1 = []
    for i in range(steps + 1):
        theta = math.radians(49.0 + (221.0 - 49.0) * i / steps)
        x = R_out * math.cos(theta)
        y = R_out * math.sin(theta)
        pts_half1.append((x, y + Cy))
        
    for i in range(steps + 1):
        theta = math.radians(216.78 - (216.78 - 53.22) * i / steps)
        x = R_in * math.cos(theta)
        y = R_in * math.sin(theta)
        pts_half1.append((x, y + Cy))
        
    tf_half1 = []
    for x, y in pts_half1:
        tx = 1.28 * x + 0.245 * y
        ty = y
        tf_half1.append((tx, ty))
        
    cmd_half1 = "M" + f"{tf_half1[0][0]:.3f} {tf_half1[0][1]:.3f}"
    for tx, ty in tf_half1[1:]:
        cmd_half1 += f" L {tx:.3f} {ty:.3f}"
    cmd_half1 += " Z"
    
    # Half 2 (Bottom-Right)
    pts_half2 = []
    for i in range(steps + 1):
        theta = math.radians(229.0 + (401.0 - 229.0) * i / steps)
        x = R_out * math.cos(theta)
        y = R_out * math.sin(theta)
        pts_half2.append((x, y + Cy))
        
    for i in range(steps + 1):
        theta = math.radians(36.78 - (36.78 - (-126.78)) * i / steps)
        x = R_in * math.cos(theta)
        y = R_in * math.sin(theta)
        pts_half2.append((x, y + Cy))
        
    tf_half2 = []
    for x, y in pts_half2:
        tx = 1.28 * x + 0.245 * y
        ty = y
        tf_half2.append((tx, ty))
        
    cmd_half2 = "M" + f"{tf_half2[0][0]:.3f} {tf_half2[0][1]:.3f}"
    for tx, ty in tf_half2[1:]:
        cmd_half2 += f" L {tx:.3f} {ty:.3f}"
    cmd_half2 += " Z"
    
    return cmd_half1 + " " + cmd_half2

def build_outline_brand():
    print("Gerando nova logo em formato Outline (contornos matemáticos perfeitos e sem slogan)...")
    
    neo_path = "brand-kit/temp-fonts/NeoSansMedium.ttf"
    euro_path = "brand-kit/temp-fonts/EurostileBold.ttf"
    
    if not os.path.exists(neo_path) or not os.path.exists(euro_path):
        print("Erro: Fontes originais não encontradas.")
        return
        
    font_neo = TTFont(neo_path)
    font_euro = TTFont(euro_path)
    
    glyph_set_neo = font_neo.getGlyphSet()
    glyph_set_euro = font_euro.getGlyphSet()
    
    # transformações de slant (13.76 graus) e escala
    t_neo = Transform(1.28, 0, 0.245, 1, 0, 0)
    t_euro = Transform(1.35, 0, 0.245, 1, 0, 0)
    
    svg_paths = {}
    
    def get_svg_path(glyph_set, src_name, transform_matrix):
        svg_pen = ExplicitSVGPathPen(glyph_set)
        trans_pen = TransformPen(svg_pen, transform_matrix)
        glyph_set[src_name].draw(trans_pen)
        return svg_pen.getCommands()
        
    # Extrair glifos com curvas nativas suavizadas
    svg_paths["E"] = get_svg_path(glyph_set_neo, "E", t_neo)
    svg_paths["S"] = get_svg_path(glyph_set_neo, "S", t_neo)
    svg_paths["O"] = get_slanted_sun_path()
    svg_paths["L"] = get_svg_path(glyph_set_neo, "L", t_neo)
    
    svg_paths["e"] = get_svg_path(glyph_set_euro, "E", t_euro)
    svg_paths["n"] = get_svg_path(glyph_set_euro, "N", t_euro)
    svg_paths["r"] = get_svg_path(glyph_set_euro, "R", t_euro)
    svg_paths["g"] = get_svg_path(glyph_set_euro, "G", t_euro)
    svg_paths["y"] = get_svg_path(glyph_set_euro, "Y", t_euro)
    
    # Calcular larguras proporcionais para o kerning
    aw_E = int(glyph_set_neo["E"].width * 1.28)
    aw_S = int(glyph_set_neo["S"].width * 1.28)
    aw_O = int(glyph_set_neo["O"].width * 1.28)
    aw_L = int(glyph_set_neo["L"].width * 1.28)
    
    aw_e = int(glyph_set_euro["E"].width * 1.35)
    aw_n = int(glyph_set_euro["N"].width * 1.35)
    aw_r = int(glyph_set_euro["R"].width * 1.35)
    aw_g = int(glyph_set_euro["G"].width * 1.35)
    aw_y = int(glyph_set_euro["Y"].width * 1.35)
    
    # Spacing ESOL
    k_esol = 40
    esol_pos = [0, aw_E - k_esol, (aw_E - k_esol) + (aw_S - k_esol), (aw_E - k_esol) + (aw_S - k_esol) + (aw_O - k_esol)]
    w_esol_total = esol_pos[-1] + aw_L
    
    # Spacing ENERGY justificado sob o ESOL
    scale_energy = 0.29
    w_target_energy = w_esol_total / scale_energy
    
    energy_letters = ["e", "n", "e", "r", "g", "y"]
    energy_aws = {"e": aw_e, "n": aw_n, "r": aw_r, "g": aw_g, "y": aw_y}
    w_energy_sum = sum(energy_aws[c] for c in energy_letters)
    gap_energy = (w_target_energy - w_energy_sum) / 5
    
    energy_pos = []
    curr_x = 0
    for c in energy_letters:
        energy_pos.append(curr_x)
        curr_x += energy_aws[c] + gap_energy
        
    # Outlines SVG
    esol_paths = ""
    for i, c in enumerate(["E", "S", "O", "L"]):
        esol_paths += f'    <path d="{svg_paths[c]}" transform="translate({esol_pos[i]}, 0)" />' + "\n"
        
    energy_paths = ""
    for i, c in enumerate(energy_letters):
        energy_paths += f'    <path d="{svg_paths[c]}" transform="translate({energy_pos[i]}, 0)" />' + "\n"
        
    margin = 150
    view_w = int(w_esol_total + 2 * margin)
    view_h = 1200
    dx = margin
    
    # Construir SVG Outline perfeito (stroke-width proporcional: 12 no ESOL, 40 no ENERGY que é reduzido)
    svg_horiz = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w} {view_h}" width="100%" height="100%">
  <!-- ESOL (Outline) -->
  <g transform="translate({dx}, 750) scale(1, -1)" fill="none" stroke="#001F5C" stroke-width="12" stroke-linejoin="round" stroke-linecap="round">
{esol_paths}
  </g>
  <!-- ENERGY (Outline) -->
  <g transform="translate({dx}, 1079) scale(1, -1) scale({scale_energy})" fill="none" stroke="#475569" stroke-width="40" stroke-linejoin="round" stroke-linecap="round">
{energy_paths}
  </g>
</svg>"""

    # Salvar outline oficial
    with open("public/brand-kit/1. Web-SVG/esol-logo-outline-temp.svg", "w", encoding="utf-8") as f:
        f.write(svg_horiz)
        
    print("Vetor Outline temporário gerado com sucesso!")

if __name__ == "__main__":
    build_outline_brand()
