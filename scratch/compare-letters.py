import os
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
import numpy as np

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

def compare():
    print("Iniciando comparação visual detalhada...")
    orig = Image.open("src/assets/esol-logo-original.png").convert("RGBA")
    
    # Recortar E, S, L do original
    crop_E = orig.crop((156, 174, 344, 340))
    crop_S = orig.crop((330, 174, 528, 340))
    crop_L = orig.crop((728, 174, 885, 340))
    
    # Criar imagem para renderizar as fontes de Neo Sans Std Medium com a mesma escala e inclinação
    font_neo = TTFont("brand-kit/temp-fonts/NeoSansMedium.ttf")
    glyph_set = font_neo.getGlyphSet()
    
    # Vamos gerar imagens de comparação
    # Canvas de 1200 x 800
    comp = Image.new("RGBA", (1200, 800), (255, 255, 255, 255))
    draw = ImageDraw.Draw(comp)
    
    # Desenhar grid para análise
    for x in range(0, 1200, 50):
        draw.line([(x, 0), (x, 800)], fill=(220, 220, 220), width=1)
    for y in range(0, 800, 50):
        draw.line([(0, y), (1200, y)], fill=(220, 220, 220), width=1)
        
    # Paste os recortes originais na linha de cima (Y=100)
    comp.paste(crop_E, (100, 100), crop_E)
    comp.paste(crop_S, (450, 100), crop_S)
    comp.paste(crop_L, (800, 100), crop_L)
    
    draw.text((100, 70), "E ORIGINAL", fill=(0, 0, 0))
    draw.text((450, 70), "S ORIGINAL", fill=(0, 0, 0))
    draw.text((800, 70), "L ORIGINAL", fill=(0, 0, 0))
    
    # Desenhar as fontes com a inclinação e a escala que usamos (na linha de baixo, Y=550)
    # E
    draw.text((100, 420), "E DA FONTE (NEO SANS MEDIUM COM NOSSO SLANT/SCALE)", fill=(0, 0, 0))
    # Para o E da fonte, vamos desenhar o outline em azul
    # Vamos usar scale_x = 0.35 * 1.28 = 0.448, scale_y = 0.35, dy = 550
    # Mas wait, qual a escala exata da imagem original?
    # A altura original é 166px. A altura da fonte é 700 U.
    # Então a escala y exata da imagem é 166 / 700 = 0.237!
    # E a escala x é 0.237 * 1.28 = 0.303!
    # Vamos usar essa escala exata para comparar!
    scale_y = 166 / 700
    scale_x = scale_y * 1.28
    
    pen_E = PILPen(draw, 100, 100 + 450, scale_x, scale_y, (0, 0, 255), width=2)
    glyph_set["E"].draw(TransformPen(pen_E, Transform(1, 0, 0.245, 1, 0, 0)))
    
    # S
    draw.text((450, 420), "S DA FONTE", fill=(0, 0, 0))
    pen_S = PILPen(draw, 450, 100 + 450, scale_x, scale_y, (0, 0, 255), width=2)
    glyph_set["S"].draw(TransformPen(pen_S, Transform(1, 0, 0.245, 1, 0, 0)))
    
    # L
    draw.text((800, 420), "L DA FONTE", fill=(0, 0, 0))
    pen_L = PILPen(draw, 800, 100 + 450, scale_x, scale_y, (0, 0, 255), width=2)
    glyph_set["L"].draw(TransformPen(pen_L, Transform(1, 0, 0.245, 1, 0, 0)))
    
    # Salvar para ver a diferença
    dest_path = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/comparison.png"
    comp.save(dest_path)
    print("Imagem de comparação gerada!")

if __name__ == "__main__":
    compare()
