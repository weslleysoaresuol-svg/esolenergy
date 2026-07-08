"""
Gera o SVG de outline da logo ESOL Energy com contornos matemáticos perfeitos.

Abordagem:
- Letras E, S, L: glifos Bezier nativos do NeoSans Medium (perfeito, sem tremidos)
- Sol (O): elipse desenhada como curvas Bezier cúbicas perfeitas (sem usar comandos de arco SVG A, evitando bugs de renderização)
- Haste central do Sol: desenhada como duas arestas abertas que tocam os círculos interno e externo sem cruzamento de linhas
- ENERGY: glifos Bezier nativos do Eurostile Bold (perfeito, sem tremidos)
- Sem o slogan "deixe o sol trabalhar por voce" (conforme instrução do usuário)
- Spacing e posicionamento calibrados com precisão pixel a partir da logo original
"""
import os
import math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform


class ExplicitSVGPathPen(SVGPathPen):
    def _lineTo(self, pt):
        x, y = pt
        if x == self._lastX and y == self._lastY:
            return
        self._commands.append(f"L{self._ntos(x)} {self._ntos(y)}")
        self._lastCommand = "L"
        self._lastX, self._lastY = pt


def build_outline_brand():
    print("Gerando nova logo em formato Outline (contornos matemáticos perfeitos e sem slogan)...")
    
    neo_path = "brand-kit/temp-fonts/NeoSansMedium.ttf"
    euro_path = "brand-kit/temp-fonts/EurostileBold.ttf"
    
    if not os.path.exists(neo_path) or not os.path.exists(euro_path):
        # Fallback para execução relativa
        neo_path = "../brand-kit/temp-fonts/NeoSansMedium.ttf"
        euro_path = "../brand-kit/temp-fonts/EurostileBold.ttf"
        if not os.path.exists(neo_path):
            raise FileNotFoundError("Fontes não encontradas! Verifique o diretório de execução.")
            
    font_neo = TTFont(neo_path)
    font_euro = TTFont(euro_path)
    glyph_set_neo = font_neo.getGlyphSet()
    glyph_set_euro = font_euro.getGlyphSet()
    
    # ---------------------------------------------------------------
    # 1. Transformações e dimensões no espaço de design
    # ---------------------------------------------------------------
    scale_h = 1.28
    shear = 0.245
    t_neo = Transform(scale_h, 0, shear, 1, 0, 0)
    
    scale_euro_h = 1.35
    t_euro = Transform(scale_euro_h, 0, shear, 1, 0, 0)
    
    # Extrair glifos nativos de E, S, L
    def get_glyph_path(char, transform_matrix):
        svg_pen = ExplicitSVGPathPen(glyph_set_neo)
        trans_pen = TransformPen(svg_pen, transform_matrix)
        glyph_set_neo[char].draw(trans_pen)
        return svg_pen.getCommands()
        
    path_E = get_glyph_path("E", t_neo)
    path_S = get_glyph_path("S", t_neo)
    path_L = get_glyph_path("L", t_neo)
    
    # Offsets altamente calibrados da logo original (borda a borda, sem overlaps)
    dx_E = -94.0
    dx_S = 694.9
    dx_Sun = 1550.9
    dx_L = 2494.2
    
    # Centro do Sol (O) no espaço local antes do slant
    cx_local = 340.0
    cy_local = 380.1
    
    # Parâmetros geométricos do Sol (bater com a proporção da logo original)
    Ro = 362.65
    Ri = 177.15
    d_slit = 25.3
    w_bar = 16.8
    
    k1 = d_slit * math.sqrt(2)
    k2 = -d_slit * math.sqrt(2)
    
    # Interseção do círculo de raio R com a reta y = x + k
    def circle_line_intersect(R, k):
        disc = 2 * R**2 - k**2
        if disc < 0:
            return None
        sqrt_disc = math.sqrt(disc)
        x1 = (-k - sqrt_disc) / 2
        y1 = x1 + k
        x2 = (-k + sqrt_disc) / 2
        y2 = x2 + k
        return (x1, y1), (x2, y2)
        
    out_A1, out_A2 = circle_line_intersect(Ro, k1)
    in_A1, in_A2 = circle_line_intersect(Ri, k1)
    out_B1, out_B2 = circle_line_intersect(Ro, k2)
    in_B1, in_B2 = circle_line_intersect(Ri, k2)
    
    # Função para mapear pontos do espaço local (centro 0,0) para o SVG absoluto (slant/scale)
    def to_svg(pt):
        x, y = pt
        x_abs = cx_local + x
        y_abs = cy_local + y
        tx = scale_h * x_abs + shear * y_abs
        ty = y_abs
        return tx, ty
        
    def arc_bezier(R, start_pt, end_pt, clockwise=True):
        """
        Aproxima um arco de círculo (raio R) de start_pt a end_pt usando Bézier cúbico.
        Garante suavidade matemática de nível G1/G2 sem descontinuidades.
        """
        def angle(p):
            return math.atan2(p[1], p[0])
            
        a_start = angle(start_pt)
        a_end = angle(end_pt)
        
        if clockwise:
            if a_end >= a_start:
                a_end -= 2 * math.pi
        else:
            if a_end <= a_start:
                a_end += 2 * math.pi
                
        total_angle = a_end - a_start
        n_segs = max(1, math.ceil(abs(total_angle) / (math.pi / 2)))
        step = total_angle / n_segs
        
        cmds = []
        for i in range(n_segs):
            a0 = a_start + i * step
            a1 = a_start + (i + 1) * step
            da = a1 - a0
            alpha = math.sin(da) * (math.sqrt(4 + 3 * math.tan(da/2)**2) - 1) / 3
            
            p0 = (R * math.cos(a0), R * math.sin(a0))
            p3 = (R * math.cos(a1), R * math.sin(a1))
            
            p1 = (p0[0] - alpha * R * math.sin(a0), p0[1] + alpha * R * math.cos(a0))
            p2 = (p3[0] + alpha * R * math.sin(a1), p3[1] - alpha * R * math.cos(a1))
            
            q1 = to_svg(p1)
            q2 = to_svg(p2)
            q3 = to_svg(p3)
            cmds.append(f"C {q1[0]:.2f} {q1[1]:.2f}, {q2[0]:.2f} {q2[1]:.2f}, {q3[0]:.2f} {q3[1]:.2f}")
        return cmds

    # C-shape superior esquerda
    s_out_left = to_svg(out_A1)
    arc_out_left = arc_bezier(Ro, out_A1, out_A2, clockwise=True)
    s_in_left = to_svg(in_A2)
    arc_in_left = arc_bezier(Ri, in_A2, in_A1, clockwise=False)
    
    path_sun_left = (
        f"M {s_out_left[0]:.2f} {s_out_left[1]:.2f} " +
        " ".join(arc_out_left) +
        f" L {s_in_left[0]:.2f} {s_in_left[1]:.2f} " +
        " ".join(arc_in_left) +
        " Z"
    )
    
    # C-shape inferior direita
    s_out_right = to_svg(out_B2)
    arc_out_right = arc_bezier(Ro, out_B2, out_B1, clockwise=True)
    s_in_right = to_svg(in_B1)
    arc_in_right = arc_bezier(Ri, in_B1, in_B2, clockwise=False)
    
    path_sun_right = (
        f"M {s_out_right[0]:.2f} {s_out_right[1]:.2f} " +
        " ".join(arc_out_right) +
        f" L {s_in_right[0]:.2f} {s_in_right[1]:.2f} " +
        " ".join(arc_in_right) +
        " Z"
    )
    
    # Haste central com notches (dentes) - desenhada como duas arestas abertas
    # que se conectam exatamente no círculo interno (Ri) para evitar qualquer cruzamento de linhas!
    u_min, u_max = -Ri, Ri
    
    def uv_to_xy(u, v):
        # Rotação de 45 graus
        x = (u - v) / math.sqrt(2)
        y = (u + v) / math.sqrt(2)
        return x, y
        
    k_ray_left = (w_bar / 2) * math.sqrt(2)
    k_ray_right = -(w_bar / 2) * math.sqrt(2)
    
    # Intersecções exatas com o círculo interno Ri
    intersect_left = circle_line_intersect(Ri, k_ray_left)
    intersect_right = circle_line_intersect(Ri, k_ray_right)
    
    # Menor X é bottom-left, maior X é top-right
    pt_left_start_local = intersect_left[0]
    pt_left_end_local = intersect_left[1]
    pt_right_start_local = intersect_right[0]
    pt_right_end_local = intersect_right[1]
    
    # Mapear para coordenadas SVG
    pt_left_start_svg = to_svg(pt_left_start_local)
    pt_left_end_svg = to_svg(pt_left_end_local)
    pt_right_start_svg = to_svg(pt_right_start_local)
    pt_right_end_svg = to_svg(pt_right_end_local)
    
    # Aresta esquerda (notch superior)
    pts_edge_left = [
        pt_left_start_svg,
        to_svg(uv_to_xy(-75.0, w_bar/2)),
        to_svg(uv_to_xy(-75.0, 100.0)),
        to_svg(uv_to_xy(-50.0, 100.0)),
        to_svg(uv_to_xy(-50.0, w_bar/2)),
        pt_left_end_svg
    ]
    path_ray_left = f"M {pts_edge_left[0][0]:.2f} {pts_edge_left[0][1]:.2f} " + " ".join(f"L {pt[0]:.2f} {pt[1]:.2f}" for pt in pts_edge_left[1:])
    
    # Aresta direita (notch inferior)
    pts_edge_right = [
        pt_right_end_svg,
        to_svg(uv_to_xy(75.0, -w_bar/2)),
        to_svg(uv_to_xy(75.0, -100.0)),
        to_svg(uv_to_xy(50.0, -100.0)),
        to_svg(uv_to_xy(50.0, -w_bar/2)),
        pt_right_start_svg
    ]
    path_ray_right = f"M {pts_edge_right[0][0]:.2f} {pts_edge_right[0][1]:.2f} " + " ".join(f"L {pt[0]:.2f} {pt[1]:.2f}" for pt in pts_edge_right[1:])
    
    # Unir as partes do Sol (agora sem linhas cruzando a elipse interna!)
    path_sun = path_sun_left + " " + path_sun_right + " " + path_ray_left + " " + path_ray_right
    
    # ---------------------------------------------------------------
    # 2. Letras de ENERGY (Eurostile Bold)
    # ---------------------------------------------------------------
    esol_total_w = 3311.1
    scale_energy = 0.29
    w_target_energy = esol_total_w / scale_energy
    
    energy_letters = ["E", "N", "E", "R", "G", "Y"]
    
    def get_euro_path(char):
        svg_pen = ExplicitSVGPathPen(glyph_set_euro)
        trans_pen = TransformPen(svg_pen, t_euro)
        glyph_set_euro[char].draw(trans_pen)
        return svg_pen.getCommands()
        
    euro_paths = {c: get_euro_path(c) for c in set(energy_letters)}
    euro_aws = {c: int(glyph_set_euro[c].width * scale_euro_h) for c in set(energy_letters)}
    
    w_energy_sum = sum(euro_aws[c] for c in energy_letters)
    gap_energy = (w_target_energy - w_energy_sum) / 5
    
    energy_pos = []
    curr_x = 0
    for c in energy_letters:
        energy_pos.append(curr_x)
        curr_x += euro_aws[c] + gap_energy
        
    # ---------------------------------------------------------------
    # 3. Montagem do SVG final
    # ---------------------------------------------------------------
    esol_elements = [
        f'    <path d="{path_E}" transform="translate({dx_E}, 0)" />',
        f'    <path d="{path_S}" transform="translate({dx_S}, 0)" />',
        f'    <path d="{path_sun}" transform="translate({dx_Sun}, 0)" />',
        f'    <path d="{path_L}" transform="translate({dx_L}, 0)" />'
    ]
    esol_paths_str = "\n".join(esol_elements)
    
    energy_elements = [
        f'    <path d="{euro_paths[c]}" transform="translate({energy_pos[i]}, 0)" />'
        for i, c in enumerate(energy_letters)
    ]
    energy_paths_str = "\n".join(energy_elements)
    
    margin_x = 100
    margin_y = 60
    gap_rows = 60
    
    view_w = int(esol_total_w + 2 * margin_x)
    cap_esol = 759    # NeoSans yMax + |yMin| = 751 + 8
    cap_euro = int(scale_energy * 750)
    view_h = margin_y + cap_esol + gap_rows + cap_euro + margin_y
    dx = margin_x
    
    Y_esol = margin_y + cap_esol
    Y_energy = Y_esol + gap_rows + cap_euro
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w} {view_h}" width="100%" height="100%">
  <!-- ESOL (Outline perfeito de curvas Bezier nativas) -->
  <g transform="translate({dx}, {Y_esol}) scale(1, -1)" 
     fill="none" stroke="#001F5C" stroke-width="12" 
     stroke-linejoin="round" stroke-linecap="round">
{esol_paths_str}
  </g>
  <!-- ENERGY (Outline perfeito de curvas Bezier nativas) -->
  <g transform="translate({dx}, {Y_energy}) scale(1, -1) scale({scale_energy})" 
     fill="none" stroke="#475569" stroke-width="40" 
     stroke-linejoin="round" stroke-linecap="round">
{energy_paths_str}
  </g>
</svg>"""

    # Salva o outline definitivo oficial
    out_path = "public/brand-kit/1. Web-SVG/esol-logo-outline.svg"
    # Cria diretório caso não exista
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    # Também atualiza a temp
    temp_path = "public/brand-kit/1. Web-SVG/esol-logo-outline-temp.svg"
    with open(temp_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    print(f"Outline final com linhas matemáticas, spacing calibrado e sem slogan salvo em: {out_path}")
    print(f"viewBox: 0 0 {view_w} {view_h}")
    print("Vetor Outline oficial gerado com sucesso!")


if __name__ == "__main__":
    build_outline_brand()
