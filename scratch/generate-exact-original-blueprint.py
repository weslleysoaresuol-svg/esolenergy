import os
import math
from PIL import Image, ImageDraw, ImageFont
import numpy as np

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

def draw_dimension(draw, start, end, text, font, color, offset=20, is_vertical=False, text_on_left=True):
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    
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
        
        if text_on_left:
            text_pos = (dim_start[0] - 65, (dim_start[1] + dim_end[1]) // 2 - 8)
        else:
            text_pos = (dim_start[0] + 10, (dim_start[1] + dim_end[1]) // 2 - 8)
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
        
        text_pos = ((dim_start[0] + dim_end[0]) // 2 - 25, dim_start[1] - 18)
        draw.text(text_pos, text, font=font, fill=color)

def generate_original_measured():
    print("Gerando imagem de cotagem direta na logo original (sem desinclinação)...")
    
    # 1. Carregar imagem original (1024x682)
    orig = Image.open("src/assets/esol-logo-original.png").convert("RGBA")
    
    # Criar um canvas com margens extras para desenhar as cotas detalhadas
    # Canvas: 1300 x 850, fundo branco
    canvas_w, canvas_h = 1300, 850
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
    
    dx = (canvas_w - orig.width) // 2   # 138
    dy = (canvas_h - orig.height) // 2  # 84
    canvas.paste(orig, (dx, dy), orig)
    
    draw = ImageDraw.Draw(canvas)
    
    # Fontes
    try:
        font_cota = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 13)
        font_title = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 22)
    except:
        font_cota = ImageFont.load_default()
        font_title = ImageFont.load_default()
        
    cota_color = (255, 60, 0, 255) # Vermelho
    ref_color = (0, 150, 255, 255) # Azul de referência
    line_color = (180, 180, 180, 255)
    
    # --- COTAGEM DIRETAMENTE NAS LETRAS SLANTED (ORIGINAIS) ---
    # ESOL vertical range: Y=170+dy a 342+dy
    y_top = 170 + dy
    y_bot = 342 + dy
    
    # Letra E: X=156+dx a 344+dx
    # Desenhar cotas específicas do E
    # 1. Largura total do E (188px)
    draw_dimension(draw, (156+dx, y_top), (344+dx, y_top), "188 px", font_cota, cota_color, offset=-35, is_vertical=False)
    # 2. Espessura da haste vertical (44px)
    # Haste está inclinada, o deslocamento horizontal do topo para a base é de 42px
    # No meio (Y=256+dy), a haste começa em X=156+dx + 21 = 177+dx
    draw_dimension(draw, (177+dx, 256+dy), (177+dx+44, 256+dy), "44px", font_cota, cota_color, offset=-15, is_vertical=False)
    # 3. Comprimento dos braços (comprimento horizontal do braço superior = 144px)
    # Do X da haste ao X final: 177+dx+44 = 221+dx, e termina em 344+dx no topo (Y=174+dy, haste começa em X=156+dx+42=198+dx)
    # Comprimento horizontal do braço sup = 344 - 198 = 146px
    draw_dimension(draw, (198+dx, y_top + 4), (344+dx, y_top + 4), "146 px", font_cota, cota_color, offset=15, is_vertical=False)
    # 4. Altura do braço superior (32px)
    draw_dimension(draw, (344+dx, y_top), (344+dx, y_top+32), "32 px", font_cota, cota_color, offset=-25, is_vertical=True, text_on_left=False)
    
    # Letra S: X=330+dx a 528+dx
    # 1. Largura total do S (198px)
    draw_dimension(draw, (330+dx, y_top), (528+dx, y_top), "198 px", font_cota, cota_color, offset=-70, is_vertical=False)
    # 2. Espessura da curva central (44px)
    draw.text((370+dx, 260+dy), "Haste: 44px", font=font_cota, fill=cota_color)
    
    # Letra O / SOL: X=525+dx a 728+dx
    # 1. Largura total do Sol (203px)
    draw_dimension(draw, (525+dx, y_top), (728+dx, y_top), "203 px", font_cota, cota_color, offset=-35, is_vertical=False)
    # 2. Espessura da borda amarela (44px)
    # Borda externa X=525+dx a borda interna X=525+dx+44 = 569+dx
    draw_dimension(draw, (525+dx, 256+dy), (569+dx, 256+dy), "44px", font_cota, cota_color, offset=15, is_vertical=False)
    # 3. Espaço do corte diagonal do Sol (12px)
    # Desenhar seta apontando para o corte diagonal
    draw_arrow(draw, (626+dx - 30, 256+dy + 30), (626+dx, 256+dy), cota_color)
    draw.text((626+dx - 80, 256+dy + 35), "Corte: 12px (45°)", font=font_cota, fill=cota_color)
    
    # Letra L: X=728+dx a 885+dx
    # 1. Largura total do L (157px)
    draw_dimension(draw, (728+dx, y_top), (885+dx, y_top), "157 px", font_cota, cota_color, offset=-70, is_vertical=False)
    # 2. Haste vertical do L (44px)
    # No meio (Y=256+dy), a haste começa em X=728+dx + 21 = 749+dx
    draw_dimension(draw, (749+dx, 256+dy), (749+dx+44, 256+dy), "44px", font_cota, cota_color, offset=-15, is_vertical=False)
    # 3. Braço da base horizontal (118px)
    draw_dimension(draw, (767+dx, y_bot), (885+dx, y_bot), "118 px", font_cota, cota_color, offset=-20, is_vertical=False)
    
    # --- COTAS DE ALTURAS GLOBAIS DO ESOL E ENERGY ---
    # Altura do ESOL (172px)
    draw_dimension(draw, (156+dx, y_top), (156+dx, y_bot), "H_esol = 172 px", font_cota, cota_color, offset=90, is_vertical=True)
    # Vão vertical (32px)
    draw_dimension(draw, (156+dx, y_bot), (156+dx, 374+dy), "32 px", font_cota, cota_color, offset=50, is_vertical=True)
    # Altura do ENERGY (50px)
    draw_dimension(draw, (156+dx, 374+dy), (156+dx, 424+dy), "h_energy = 50 px", font_cota, cota_color, offset=90, is_vertical=True)
    
    # --- DETALHE DO ENERGY ---
    # Vamos colocar uma cota na haste vertical do E do ENERGY (5.5px)
    draw_dimension(draw, (196+dx, 395+dy), (201.5+dx, 395+dy), "5.5px", font_cota, cota_color, offset=-15, is_vertical=False)
    # E uma cota na largura do N (76px)
    draw_dimension(draw, (303+dx, 376+dy), (379+dx, 376+dy), "76 px", font_cota, cota_color, offset=-20, is_vertical=False)
    
    # Título do Mapeamento Direto
    draw.text((50, 30), "MEDIÇÃO DIRETA E EXATA NA IMAGEM DA LOGO ORIGINAL", font=font_title, fill=(10, 16, 70, 255))
    draw.text((50, 65), "Sem recriações ou fontes externas. Cotas de pixels reais de cada haste, braço e vão desenhados na logo.", font=font_cota, fill=(100, 100, 100, 255))
    
    # Salvar
    dest_path = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/esol-logo-original-measured.png"
    canvas.save(dest_path)
    print("Cotas sobre a imagem da logo original geradas com sucesso!")

if __name__ == "__main__":
    generate_original_measured()
