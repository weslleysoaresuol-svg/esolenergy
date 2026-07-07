import os
import math
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

class PILPen(BasePen):
    def __init__(self, draw, dx, dy, scale_x, scale_y, color, width=2):
        super().__init__(None)
        self.draw = draw
        self.dx = dx
        self.dy = dy
        self.scale_x = scale_x
        self.scale_y = scale_y
        self.color = color
        self.width = width
        self.curr_pt = None
        self.points = []
        
    def _moveTo(self, pt):
        self.curr_pt = (self.dx + pt[0] * self.scale_x, self.dy - pt[1] * self.scale_y)
        self.points = [self.curr_pt]
        
    def _lineTo(self, pt):
        end_pt = (self.dx + pt[0] * self.scale_x, self.dy - pt[1] * self.scale_y)
        self.draw.line([self.curr_pt, end_pt], fill=self.color, width=self.width)
        self.curr_pt = end_pt
        self.points.append(self.curr_pt)
        
    def _qCurveToOne(self, pt1, pt2):
        p0 = self.curr_pt
        p1 = (self.dx + pt1[0] * self.scale_x, self.dy - pt1[1] * self.scale_y)
        p2 = (self.dx + pt2[0] * self.scale_x, self.dy - pt2[1] * self.scale_y)
        
        num_steps = 15
        curve_pts = []
        for i in range(num_steps + 1):
            t = i / num_steps
            x = (1-t)**2 * p0[0] + 2*(1-t)*t * p1[0] + t**2 * p2[0]
            y = (1-t)**2 * p0[1] + 2*(1-t)*t * p1[1] + t**2 * p2[1]
            curve_pts.append((x, y))
            
        for i in range(len(curve_pts) - 1):
            self.draw.line([curve_pts[i], curve_pts[i+1]], fill=self.color, width=self.width)
            
        self.curr_pt = p2
        self.points.append(self.curr_pt)
        
    def _curveToOne(self, pt1, pt2, pt3):
        p0 = self.curr_pt
        p1 = (self.dx + pt1[0] * self.scale_x, self.dy - pt1[1] * self.scale_y)
        p2 = (self.dx + pt2[0] * self.scale_x, self.dy - pt2[1] * self.scale_y)
        p3 = (self.dx + pt3[0] * self.scale_x, self.dy - pt3[1] * self.scale_y)
        
        num_steps = 15
        curve_pts = []
        for i in range(num_steps + 1):
            t = i / num_steps
            x = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
            y = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
            curve_pts.append((x, y))
            
        for i in range(len(curve_pts) - 1):
            self.draw.line([curve_pts[i], curve_pts[i+1]], fill=self.color, width=self.width)
            
        self.curr_pt = p3
        self.points.append(self.curr_pt)
        
    def _closePath(self):
        if len(self.points) > 0:
            self.draw.line([self.curr_pt, self.points[0]], fill=self.color, width=self.width)

def draw_arrow(draw, start, end, color, width=1, arrow_size=6):
    draw.line([start, end], fill=color, width=width)
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    angle = math.atan2(dy, dx)
    p1 = (end[0] - arrow_size * math.cos(angle - math.pi/6),
          end[1] - arrow_size * math.sin(angle - math.pi/6))
    p2 = (end[0] - arrow_size * math.cos(angle + math.pi/6),
          end[1] - arrow_size * math.sin(angle + math.pi/6))
    draw.line([end, p1], fill=color, width=width)
    draw.line([end, p2], fill=color, width=width)

def draw_dimension(draw, start, end, text, font, color, offset=20, is_vertical=False):
    if is_vertical:
        ext_start1 = (start[0], start[1])
        ext_end1 = (start[0] - offset, start[1])
        ext_start2 = (end[0], end[1])
        ext_end2 = (end[0] - offset, end[1])
        
        dim_start = (start[0] - offset + 5, start[1])
        dim_end = (end[0] - offset + 5, end[1])
        
        draw.line([ext_start1, ext_end1], fill=color, width=1)
        draw.line([ext_start2, ext_end2], fill=color, width=1)
        
        draw_arrow(draw, dim_start, dim_end, color, width=1)
        draw_arrow(draw, dim_end, dim_start, color, width=1)
        
        text_pos = (dim_start[0] - 105, (dim_start[1] + dim_end[1]) // 2 - 10)
        draw.text(text_pos, text, font=font, fill=color)
    else:
        ext_start1 = (start[0], start[1])
        ext_end1 = (start[0], start[1] + offset)
        ext_start2 = (end[0], end[1])
        ext_end2 = (end[0], end[1] + offset)
        
        dim_start = (start[0], start[1] + offset - 5)
        dim_end = (end[0], end[1] + offset - 5)
        
        draw.line([ext_start1, ext_end1], fill=color, width=1)
        draw.line([ext_start2, ext_end2], fill=color, width=1)
        
        draw_arrow(draw, dim_start, dim_end, color, width=1)
        draw_arrow(draw, dim_end, dim_start, color, width=1)
        
        text_pos = ((dim_start[0] + dim_end[0]) // 2 - 40, dim_start[1] - 25)
        draw.text(text_pos, text, font=font, fill=color)

def generate_blueprint():
    print("Gerando Blueprint com cotas reais...")
    
    neo_path = "brand-kit/temp-fonts/NeoSansMedium.ttf"
    euro_path = "brand-kit/temp-fonts/EurostileBold.ttf"
    
    font_neo = TTFont(neo_path)
    font_euro = TTFont(euro_path)
    
    glyph_set_neo = font_neo.getGlyphSet()
    glyph_set_euro = font_euro.getGlyphSet()
    
    # transformações afins originais
    t_neo = Transform(1.28, 0, 0.245, 1, 0, 0)
    t_euro = Transform(1.35, 0, 0.245, 1, 0, 0)
    
    # Obter advance widths
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
    energy_letters_full = ["E", "N", "E", "R", "G", "Y"]
    energy_aws = {"e": aw_e, "n": aw_n, "r": aw_r, "g": aw_g, "y": aw_y}
    w_energy_sum = sum(energy_aws[c] for c in energy_letters)
    gap_energy = (w_target_energy - w_energy_sum) / 5
    
    energy_pos = []
    curr_x = 0
    for c in energy_letters:
        energy_pos.append(curr_x)
        curr_x += energy_aws[c] + gap_energy
        
    # Criar imagem do blueprint
    bp_w, bp_h = 1600, 950
    bp = Image.new("RGB", (bp_w, bp_h), (11, 19, 41)) # Azul escuro de blueprint
    draw = ImageDraw.Draw(bp)
    
    # Grid de fundo
    grid_color = (20, 35, 70)
    for x in range(0, bp_w, 50):
        draw.line([(x, 0), (x, bp_h)], fill=grid_color, width=1)
    for y in range(0, bp_h, 50):
        draw.line([(0, y), (bp_w, y)], fill=grid_color, width=1)
        
    # Centralização do logo na imagem
    # Vamos converter as coordenadas do SVG (UPM) para coordenadas do blueprint (escala 0.4)
    scale_bp = 0.4
    dx = (bp_w - w_esol_total * scale_bp) / 2
    dy_esol = 450  # Baseline do ESOL no blueprint
    
    # Desenhar os glifos de ESOL em formato de contorno fino
    cyan_color = (0, 229, 255)
    
    # E
    pen_E = PILPen(draw, dx + esol_pos[0]*scale_bp, dy_esol, scale_bp*1.28, scale_bp, cyan_color, width=2)
    glyph_set_neo["E"].draw(pen_E)
    
    # S
    pen_S = PILPen(draw, dx + esol_pos[1]*scale_bp, dy_esol, scale_bp*1.28, scale_bp, cyan_color, width=2)
    glyph_set_neo["S"].draw(pen_S)
    
    # O (Neo Sans normal)
    pen_O = PILPen(draw, dx + esol_pos[2]*scale_bp, dy_esol, scale_bp*1.28, scale_bp, cyan_color, width=2)
    glyph_set_neo["O"].draw(pen_O)
    
    # L
    pen_L = PILPen(draw, dx + esol_pos[3]*scale_bp, dy_esol, scale_bp*1.28, scale_bp, cyan_color, width=2)
    glyph_set_neo["L"].draw(pen_L)
    
    # Desenhar os glifos de ENERGY em formato de contorno fino
    dy_energy = dy_esol + 126 * scale_bp + 700 * scale_bp * scale_energy # Baseline do ENERGY
    
    for i, c in enumerate(energy_letters):
        src_char = energy_letters_full[i]
        pen_c = PILPen(draw, dx + energy_pos[i]*scale_bp*scale_energy, dy_energy, scale_bp*scale_energy*1.35, scale_bp*scale_energy, cyan_color, width=2)
        glyph_set_euro[src_char].draw(pen_c)
        
    # Desenhar as linhas de cota em Laranja
    cota_color = (255, 145, 0)
    
    try:
        font_cota = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 16)
        font_title = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 24)
    except:
        font_cota = ImageFont.load_default()
        font_title = ImageFont.load_default()
        
    # 1. Altura do ESOL (Baseline dy_esol a dy_esol - 700*scale_bp)
    h_esol_top = dy_esol - 700 * scale_bp
    draw_dimension(draw, (int(dx - 30), int(dy_esol)), (int(dx - 30), int(h_esol_top)), "H_esol = 700 U (Caps)", font_cota, cota_color, offset=60, is_vertical=True)
    
    # 2. Espaçamento vertical entre ESOL e ENERGY (dy_esol a dy_esol + 126*scale_bp)
    draw_dimension(draw, (int(dx - 30), int(dy_esol + 126 * scale_bp)), (int(dx - 30), int(dy_esol)), "Espacamento = 126 U", font_cota, cota_color, offset=60, is_vertical=True)
    
    # 3. Altura do ENERGY (dy_esol + 126*scale_bp a dy_esol + 126*scale_bp + 203*scale_bp)
    h_energy_top = dy_esol + 126 * scale_bp
    h_energy_bot = dy_esol + 126 * scale_bp + 203 * scale_bp
    draw_dimension(draw, (int(dx - 30), int(h_energy_bot)), (int(dx - 30), int(h_energy_top)), "h_energy = 203 U", font_cota, cota_color, offset=60, is_vertical=True)
    
    # 4. Largura total
    w_total_bp = w_esol_total * scale_bp
    draw_dimension(draw, (int(dx), int(h_energy_bot + 40)), (int(dx + w_total_bp), int(h_energy_bot + 40)), f"LARGURA TOTAL = {int(w_esol_total)} U (Justificado)", font_cota, cota_color, offset=40, is_vertical=False)
    
    # 5. Indicação de Inclinação (Slant)
    # Linha guia na vertical do canto esquerdo do E
    x_e_base = dx
    y_e_base = dy_esol
    x_e_top = dx + 700 * scale_bp * 0.245
    y_e_top = dy_esol - 700 * scale_bp
    
    draw.line([(x_e_base, y_e_base), (x_e_base, y_e_top - 30)], fill=(120, 120, 120), width=1) # Linha vertical
    draw.line([(x_e_base, y_e_base), (x_e_top + 40, y_e_top - 10)], fill=cota_color, width=2) # Linha inclinada
    
    # Arco do ângulo
    draw.arc([x_e_base - 50, y_e_base - 50, x_e_base + 50, y_e_base + 50], start=270, end=270 + 14, fill=cota_color, width=2)
    draw.text((x_e_base + 15, y_e_base - 80), "Slant: 13.76\u00b0 (tan=0.245)", font=font_cota, fill=cota_color)
    
    # Título do Blueprint
    draw.text((50, 40), "ESOL ENERGY - BLUEPRINT GEOM\u00c9TRICO DOS CONTORNOS REAIS", font=font_title, fill=(255, 255, 255))
    draw.text((50, 80), "Fontes: Neo Sans Std Medium + Eurostile Bold | Justificado | Sem Slogan | 1 U = 1 Unidade da Fonte (UPM)", font=font_cota, fill=(180, 180, 180))
    
    # Salvar
    dest_path = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/esol-logo-blueprint.png"
    bp.save(dest_path)
    print("Blueprint geométrica gerada com sucesso!")

if __name__ == "__main__":
    generate_blueprint()
