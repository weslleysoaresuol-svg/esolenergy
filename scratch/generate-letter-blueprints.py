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

def draw_dim_line(draw, p1, p2, text, font, color, offset=15, is_vertical=False):
    # Simple dimension line with small arrows and text
    draw_arrow(draw, p1, p2, color, width=1)
    draw_arrow(draw, p2, p1, color, width=1)
    
    # Text position
    mx = (p1[0] + p2[0]) // 2
    my = (p1[1] + p2[1]) // 2
    if is_vertical:
        draw.text((mx - offset, my - 8), text, font=font, fill=color)
    else:
        draw.text((mx - 20, my - offset), text, font=font, fill=color)

def generate_details():
    print("Gerando pranchas de detalhes individuais das letras...")
    
    neo_path = "brand-kit/temp-fonts/NeoSansMedium.ttf"
    euro_path = "brand-kit/temp-fonts/EurostileBold.ttf"
    
    font_neo = TTFont(neo_path)
    font_euro = TTFont(euro_path)
    
    glyph_set_neo = font_neo.getGlyphSet()
    glyph_set_euro = font_euro.getGlyphSet()
    
    # transformações de slant (13.76 graus) e escala
    t_neo = Transform(1.28, 0, 0.245, 1, 0, 0)
    t_euro = Transform(1.35, 0, 0.245, 1, 0, 0)
    
    # Criar imagem
    w_canvas, h_canvas = 1800, 1100
    bp = Image.new("RGB", (w_canvas, h_canvas), (11, 19, 41)) # Fundo blueprint
    draw = ImageDraw.Draw(bp)
    
    # Grid de fundo
    grid_color = (18, 30, 60)
    for x in range(0, w_canvas, 50):
        draw.line([(x, 0), (x, h_canvas)], fill=grid_color, width=1)
    for y in range(0, h_canvas, 50):
        draw.line([(0, y), (w_canvas, y)], fill=grid_color, width=1)
        
    # Fontes
    try:
        font_label = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 14)
        font_title = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 22)
        font_header = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 18)
    except:
        font_label = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_header = ImageFont.load_default()
        
    cyan = (0, 229, 255)
    orange = (255, 145, 0)
    white = (255, 255, 255)
    
    # --- CABEÇALHO ---
    draw.text((50, 30), "PRANCHA DETALHADA GEOMÉTRICA DE CADA LETRA (ESOL ENERGY)", font=font_title, fill=white)
    draw.text((50, 75), "Contornos matemáticos das fontes legítimas com escala horizontal e slant (inclinação) de 13.76° aplicados.", font=font_label, fill=(180, 180, 180))
    
    # --- LINHA 1: ESOL (Neo Sans Std Medium) ---
    # 4 colunas de 400px de largura
    x_coords_esol = [100, 500, 900, 1300]
    y_esol = 420 # baseline
    scale_esol = 0.35 # Escala local para caber no grid
    
    letters_esol = ["E", "S", "O", "L"]
    
    for idx, c in enumerate(letters_esol):
        cx = x_coords_esol[idx]
        draw.rectangle([cx, 150, cx+350, 480], outline=(30, 50, 100), width=1)
        draw.text((cx + 15, 160), f"LETRA '{c}' (Neo Sans Medium)", font=font_header, fill=white)
        
        # Desenhar letra
        pen = PILPen(draw, cx + 50, y_esol, scale_esol*1.28, scale_esol, cyan, width=2)
        glyph_set_neo[c].draw(pen)
        
        # Altura (Caps = 700 U -> no canvas 245 px)
        draw_dim_line(draw, (cx + 30, y_esol), (cx + 30, y_esol - int(700*scale_esol)), "700 U", font_label, orange, is_vertical=True)
        
        # Largura da letra
        aw = int(glyph_set_neo[c].width * 1.28)
        draw_dim_line(draw, (cx + 50, y_esol + 30), (cx + 50 + int(aw*scale_esol), y_esol + 30), f"{aw} U", font_label, orange, is_vertical=False)
        
        # Hastes e detalhes específicos
        if c == "E":
            draw.text((cx + 150, 220), "Espessura Haste: 110 U", font=font_label, fill=orange)
            draw.text((cx + 150, 245), "Braço Sup: 500 U", font=font_label, fill=orange)
            draw.text((cx + 150, 270), "Braço Mid: 420 U", font=font_label, fill=orange)
            draw.text((cx + 150, 295), "Braço Inf: 530 U", font=font_label, fill=orange)
        elif c == "S":
            draw.text((cx + 150, 220), "Curva Sup: R=195 U", font=font_label, fill=orange)
            draw.text((cx + 150, 245), "Haste Central: 110 U", font=font_label, fill=orange)
            draw.text((cx + 150, 270), "Suavização: Curvas Bézier", font=font_label, fill=orange)
        elif c == "O":
            draw.text((cx + 150, 220), "Haste Horizontal: 105 U", font=font_label, fill=orange)
            draw.text((cx + 150, 245), "Haste Vertical: 110 U", font=font_label, fill=orange)
            draw.text((cx + 150, 270), "Geometria: Squircle Elíptico", font=font_label, fill=orange)
        elif c == "L":
            draw.text((cx + 150, 220), "Haste Vertical: 110 U", font=font_label, fill=orange)
            draw.text((cx + 150, 245), "Braço Base: 500 U", font=font_label, fill=orange)
            draw.text((cx + 150, 270), "Base Vertical: 110 U", font=font_label, fill=orange)
            
    # --- LINHA 2: ENERGY (Eurostile Bold) ---
    # 5 colunas de 300px de largura
    x_coords_energy = [80, 420, 760, 1100, 1440]
    y_energy = 950 # baseline
    scale_energy_local = 0.40 # Escala local
    
    letters_energy = ["E", "N", "R", "G", "Y"]
    
    for idx, c in enumerate(letters_energy):
        cx = x_coords_energy[idx]
        draw.rectangle([cx, 550, cx+300, 1020], outline=(30, 50, 100), width=1)
        draw.text((cx + 15, 560), f"LETRA '{c}' (Eurostile)", font=font_header, fill=white)
        
        # Desenhar letra
        pen = PILPen(draw, cx + 40, y_energy, scale_energy_local*1.35, scale_energy_local, cyan, width=2)
        glyph_set_euro[c].draw(pen)
        
        # Altura (Caps = 750 U -> no canvas 300 px)
        draw_dim_line(draw, (cx + 25, y_energy), (cx + 25, y_energy - int(750*scale_energy_local)), "750 U", font_label, orange, is_vertical=True)
        
        # Largura
        aw = int(glyph_set_euro[c].width * 1.35)
        draw_dim_line(draw, (cx + 40, y_energy + 25), (cx + 40 + int(aw*scale_energy_local), y_energy + 25), f"{aw} U", font_label, orange, is_vertical=False)
        
        # Detalhes
        if c == "E":
            draw.text((cx + 150, 620), "Haste: 180 U", font=font_label, fill=orange)
            draw.text((cx + 150, 645), "Geometria Quadrada", font=font_label, fill=orange)
        elif c == "N":
            draw.text((cx + 150, 620), "Diagonal: 180 U", font=font_label, fill=orange)
            draw.text((cx + 150, 645), "Hastes Vert: 150 U", font=font_label, fill=orange)
        elif c == "R":
            draw.text((cx + 150, 620), "Haste: 180 U", font=font_label, fill=orange)
            draw.text((cx + 150, 645), "Diagonal: 160 U", font=font_label, fill=orange)
        elif c == "G":
            draw.text((cx + 150, 620), "Traço Curvo: 170 U", font=font_label, fill=orange)
            draw.text((cx + 150, 645), "Gola: 180 U", font=font_label, fill=orange)
        elif c == "Y":
            draw.text((cx + 150, 620), "Haste Base: 180 U", font=font_label, fill=orange)
            draw.text((cx + 150, 645), "Braços: 160 U", font=font_label, fill=orange)
            
    # Salvar
    dest_path = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/esol-logo-details.png"
    bp.save(dest_path)
    print("Prancha de detalhes individuais gerada com sucesso!")

if __name__ == "__main__":
    generate_details()
