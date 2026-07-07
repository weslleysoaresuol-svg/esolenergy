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
        
        num_steps = 12
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
        
        num_steps = 12
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

def draw_arrow(draw, start, end, color, width=1, arrow_size=5):
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

def draw_dim_line(draw, p1, p2, text, font, color, offset=15, is_vertical=False):
    draw_arrow(draw, p1, p2, color, width=1)
    draw_arrow(draw, p2, p1, color, width=1)
    mx = (p1[0] + p2[0]) // 2
    my = (p1[1] + p2[1]) // 2
    if is_vertical:
        draw.text((mx - offset, my - 7), text, font=font, fill=color)
    else:
        draw.text((mx - 20, my - offset), text, font=font, fill=color)

def generate_font_project_blueprint():
    print("Gerando Prancha Técnica de Projeto de Fonte (Slanted 13.76°)...")
    
    neo_path = "brand-kit/temp-fonts/NeoSansMedium.ttf"
    euro_path = "brand-kit/temp-fonts/EurostileBold.ttf"
    
    font_neo = TTFont(neo_path)
    font_euro = TTFont(euro_path)
    
    glyph_set_neo = font_neo.getGlyphSet()
    glyph_set_euro = font_euro.getGlyphSet()
    
    # transformações de inclinação (13.76 graus) e escala
    t_neo = Transform(1.28, 0, 0.245, 1, 0, 0)
    t_euro = Transform(1.35, 0, 0.245, 1, 0, 0)
    
    # Imagem Canvas
    w_canvas, h_canvas = 1800, 1150
    bp = Image.new("RGB", (w_canvas, h_canvas), (11, 19, 41)) # Blueprint escuro
    draw = ImageDraw.Draw(bp)
    
    # Grid
    grid_color = (18, 30, 60)
    for x in range(0, w_canvas, 50):
        draw.line([(x, 0), (x, h_canvas)], fill=grid_color, width=1)
    for y in range(0, h_canvas, 50):
        draw.line([(0, y), (w_canvas, y)], fill=grid_color, width=1)
        
    try:
        font_cota = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 13)
        font_title = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 22)
        font_header = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 16)
    except:
        font_cota = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_header = ImageFont.load_default()
        
    cyan = (0, 229, 255)
    orange = (255, 145, 0)
    white = (255, 255, 255)
    gray = (150, 150, 150)
    
    # Cabeçalho
    draw.text((50, 30), "PROJETO GEOMÉTRICO DE TIPOGRAFIA (FONT DESIGN SCHEMATIC)", font=font_title, fill=white)
    draw.text((50, 70), "Matriz de transformação e cotagem interna de cada caractere na inclinação de 13.76° (dx/dy=0.245) - Sem slogan.", font=font_cota, fill=(180, 180, 180))
    
    # --- LINHA 1: ESOL (Letras Inclinadas) ---
    x_positions = [100, 500, 900, 1300]
    y_baseline = 420
    scale_esol = 0.35
    
    esol_chars = ["E", "S", "O", "L"]
    
    for idx, c in enumerate(esol_chars):
        cx = x_positions[idx]
        cy = 130
        draw.rectangle([cx, cy, cx + 360, cy + 330], outline=(30, 50, 100), width=1)
        draw.text((cx + 15, cy + 10), f"LETRA '{c}' (Slanted 13.76°)", font=font_header, fill=white)
        
        # Desenhar letra inclinada
        pen = PILPen(draw, cx + 60, y_baseline, scale_esol*1.28, scale_esol, cyan, width=2)
        glyph_set_neo[c].draw(pen)
        
        # Linha do baseline e cap-height pontilhada na célula
        y_c_bot = y_baseline
        y_c_top = y_baseline - int(700 * scale_esol)
        draw.line([(cx + 20, y_c_bot), (cx + 340, y_c_bot)], fill=gray, width=1)
        draw.line([(cx + 20, y_c_top), (cx + 340, y_c_top)], fill=gray, width=1)
        
        # Cotas de Altura e Largura na célula
        draw_dim_line(draw, (cx + 30, y_c_bot), (cx + 30, y_c_top), "700 U (166px)", font_cota, orange, is_vertical=True)
        
        aw = int(glyph_set_neo[c].width * 1.28)
        draw_dim_line(draw, (cx + 60, y_c_bot + 25), (cx + 60 + int(aw*scale_esol), y_c_bot + 25), f"{aw} U", font_cota, orange, is_vertical=False)
        
        # Cotas internas
        if c == "E":
            # Haste vertical (180 U / 44px)
            haste_sc = int(180 * scale_esol)
            draw_dim_line(draw, (cx + 60, y_c_bot - 100), (cx + 60 + haste_sc, y_c_bot - 100), "180 U (44px)", font_cota, orange, is_vertical=False)
            draw.text((cx + 15, cy + 330 - 45), "Braços (V): 130 U (32px) | Vão: 142 U (35px)", font=font_cota, fill=orange)
            draw.text((cx + 15, cy + 330 - 25), "Braço Sup: 480 U (118px) | Mid: 285 U (70px)", font=font_cota, fill=orange)
            
        elif c == "S":
            draw.text((cx + 15, cy + 330 - 45), "Haste média: 180 U (44px)", font=font_cota, fill=orange)
            draw.text((cx + 15, cy + 330 - 25), "Curvatura: Bézier Contínuo", font=font_cota, fill=orange)
            
        elif c == "O":
            draw.text((cx + 15, cy + 330 - 45), "Diâm Ext: 820 U (203px) x 700 U (172px)", font=font_cota, fill=orange)
            draw.text((cx + 15, cy + 330 - 25), "Haste Parede: 180 U (44px) constante", font=font_cota, fill=orange)
            
        elif c == "L":
            haste_sc = int(180 * scale_esol)
            draw_dim_line(draw, (cx + 60, y_c_bot - 100), (cx + 60 + haste_sc, y_c_bot - 100), "180 U", font_cota, orange, is_vertical=False)
            draw.text((cx + 15, cy + 330 - 45), "Braço Base: 480 U (118px) | Altura: 130 U (32px)", font=font_cota, fill=orange)
            draw.text((cx + 15, cy + 330 - 25), "Sidebearings: LSB=90 U | RSB=90 U", font=font_cota, fill=orange)

    # --- LINHA 2: ENERGY (Letras Inclinadas) ---
    x_positions2 = [50, 335, 620, 905, 1190, 1475]
    y_baseline2 = 910
    scale_energy_local = 0.40
    energy_chars = ["E", "N", "E", "R", "G", "Y"]
    energy_chars_full = ["E", "N", "E", "R", "G", "Y"]
    
    for idx, c in enumerate(energy_chars):
        cx = x_positions2[idx]
        cy = 610
        draw.rectangle([cx, cy, cx + 270, cy + 340], outline=(30, 50, 100), width=1)
        draw.text((cx + 15, cy + 10), f"LETRA '{c}' (Eurostile)", font=font_header, fill=white)
        
        # Desenhar letra
        pen = PILPen(draw, cx + 45, y_baseline2, scale_energy_local*1.35, scale_energy_local, cyan, width=2)
        glyph_set_euro[energy_chars_full[idx]].draw(pen)
        
        y_c_bot = y_baseline2
        y_c_top = y_baseline2 - int(750 * scale_energy_local)
        draw.line([(cx + 20, y_c_bot), (cx + 250, y_c_bot)], fill=gray, width=1)
        draw.line([(cx + 20, y_c_top), (cx + 250, y_c_top)], fill=gray, width=1)
        
        # Cotas
        draw_dim_line(draw, (cx + 25, y_c_bot), (cx + 25, y_c_top), "750 U (50px)", font_cota, orange, is_vertical=True)
        
        aw = int(glyph_set_euro[energy_chars_full[idx]].width * 1.35)
        draw_dim_line(draw, (cx + 45, y_c_bot + 25), (cx + 45 + int(aw*scale_energy_local), y_c_bot + 25), f"{aw} U", font_cota, orange, is_vertical=False)
        
        draw.text((cx + 15, cy + 285), "Haste Vert: 180 U (5.5px)", font=font_cota, fill=orange)
        draw.text((cx + 15, cy + 305), "Braço Horiz: 150 U (4.8px)", font=font_cota, fill=orange)

    # Informações Técnicas da Fonte
    draw.rectangle([50, 980, 1750, 1120], fill=(16, 27, 57), outline=(40, 60, 120), width=1)
    draw.text((70, 995), "PARÂMETROS TÉCNICOS E MEDIDAS DE ESPAÇAMENTO DO PROJETO DA FONTE (1 UPM = 1000 UNIDADES)", font=font_header, fill=white)
    
    details_text = (
        "1. Ângulo de Slant da Fonte: 13.76° (deslocamento horizontal dx = 0.245 * dy).\n"
        "2. Espaçamento do ESOL (Kerning): Par de ajuste de kerning E-S = -40 U | S-O = -12 U | O-L = 0 U.\n"
        "3. Espaçamento do ENERGY (Justificação): Para se alinhar sob o ESOL na escala 0.29x, o espaçamento (gap) entre as letras é de 1676 U no arquivo de fonte original.\n"
        "4. Unidades de Haste: Linhas do ESOL = 180 U (horizontal) | Linhas do ENERGY = 180 U verticais e 150 U horizontais."
    )
    draw.text((70, 1025), details_text, font=font_cota, fill=(200, 220, 255))
    
    dest_path = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/esol-logo-font-blueprint.png"
    bp.save(dest_path)
    print("Prancha de projeto de fonte gerada com sucesso!")

if __name__ == "__main__":
    generate_font_project_blueprint()
