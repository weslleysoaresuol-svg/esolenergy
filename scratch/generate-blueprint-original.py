import os
import math
from PIL import Image, ImageDraw, ImageFont

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
        
        # Text label
        text_pos = (dim_start[0] - 85, (dim_start[1] + dim_end[1]) // 2 - 8)
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
        
        # Text label
        text_pos = ((dim_start[0] + dim_end[0]) // 2 - 35, dim_start[1] - 18)
        draw.text(text_pos, text, font=font, fill=color)

def generate():
    print("Gerando cotas diretamente na imagem original...")
    
    # 1. Carregar imagem original (1024x682)
    img = Image.open("src/assets/esol-logo-original.png").convert("RGBA")
    
    # Criar um canvas maior para colocar o cabeçalho e margens para as cotas laterais
    # Novo canvas: 1200 x 800, fundo branco
    canvas_w, canvas_h = 1200, 800
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
    
    # Posicionar imagem original centralizada
    dx = (canvas_w - img.width) // 2   # 88
    dy = (canvas_h - img.height) // 2  # 59
    canvas.paste(img, (dx, dy), img)
    
    draw = ImageDraw.Draw(canvas)
    
    # Fontes
    try:
        font_cota = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 14)
        font_title = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 22)
    except:
        font_cota = ImageFont.load_default()
        font_title = ImageFont.load_default()
        
    cota_color = (255, 60, 0, 255) # Vermelho vivo
    guias_color = (150, 150, 150, 180) # Cinza suave
    
    # --- MEDIÇÕES REAIS DA IMAGEM ORIGINAL (com offset dx, dy) ---
    # ESOL: Y de 170+dy a 342+dy
    # ENERGY: Y de 374+dy a 424+dy
    # Slogan: Y de 456+dy a 496+dy
    
    # Linhas guias horizontais
    y_guia_esol_top = 170 + dy
    y_guia_esol_bot = 342 + dy
    y_guia_energy_top = 374 + dy
    y_guia_energy_bot = 424 + dy
    y_guia_slogan_top = 456 + dy
    y_guia_slogan_bot = 496 + dy
    
    x_logo_left = 156 + dx
    x_logo_right = 885 + dx
    
    # Desenhar linhas guias pontilhadas
    for y_val in [y_guia_esol_top, y_guia_esol_bot, y_guia_energy_top, y_guia_energy_bot, y_guia_slogan_top, y_guia_slogan_bot]:
        draw.line([(50, y_val), (1150, y_val)], fill=guias_color, width=1)
        
    # --- COTAS VERTICAIS ---
    # Altura do ESOL (172px)
    draw_dimension(draw, (x_logo_left, y_guia_esol_top), (x_logo_left, y_guia_esol_bot), "172 px", font_cota, cota_color, offset=80, is_vertical=True)
    
    # Espaço ESOL -> ENERGY (32px)
    draw_dimension(draw, (x_logo_left, y_guia_esol_bot), (x_logo_left, y_guia_energy_top), "32 px", font_cota, cota_color, offset=50, is_vertical=True)
    
    # Altura do ENERGY (50px)
    draw_dimension(draw, (x_logo_left, y_guia_energy_top), (x_logo_left, y_guia_energy_bot), "50 px", font_cota, cota_color, offset=80, is_vertical=True)
    
    # Espaço ENERGY -> Slogan (32px)
    draw_dimension(draw, (x_logo_left, y_guia_energy_bot), (x_logo_left, y_guia_slogan_top), "32 px", font_cota, cota_color, offset=50, is_vertical=True)
    
    # Altura do Slogan (40px)
    draw_dimension(draw, (x_logo_left, y_guia_slogan_top), (x_logo_left, y_guia_slogan_bot), "40 px", font_cota, cota_color, offset=80, is_vertical=True)
    
    # --- COTAS HORIZONTAIS ---
    # Largura total (729px)
    draw_dimension(draw, (x_logo_left, y_guia_slogan_bot), (x_logo_right, y_guia_slogan_bot), "LARGURA TOTAL = 729 px", font_cota, cota_color, offset=40, is_vertical=False)
    
    # Largura de cada letra do ESOL (contornando os bounding boxes)
    # E: X=156 a 344 (188px)
    # S: X=330 a 528 (198px)
    # O (Sun): X=525 a 728 (203px)
    # L: X=728 a 885 (157px)
    draw_dimension(draw, (156+dx, y_guia_esol_top), (344+dx, y_guia_esol_top), "E = 188px", font_cota, cota_color, offset=-30, is_vertical=False)
    draw_dimension(draw, (330+dx, y_guia_esol_top), (528+dx, y_guia_esol_top), "S = 198px", font_cota, cota_color, offset=-60, is_vertical=False)
    draw_dimension(draw, (525+dx, y_guia_esol_top), (728+dx, y_guia_esol_top), "O = 203px", font_cota, cota_color, offset=-30, is_vertical=False)
    draw_dimension(draw, (728+dx, y_guia_esol_top), (885+dx, y_guia_esol_top), "L = 157px", font_cota, cota_color, offset=-60, is_vertical=False)
    
    # --- ÂNGULO DE INCLINAÇÃO (SLANT) ---
    # Ângulo medido na haste esquerda do E
    x_base = 156 + dx
    y_base = y_guia_esol_bot
    x_top = 156 + dx + 42 # 172 * tan(13.76) = 42
    y_top = y_guia_esol_top
    
    draw.line([(x_base, y_base), (x_base, y_top - 20)], fill=(100, 100, 100, 255), width=1) # vertical guia
    draw.arc([x_base - 40, y_base - 40, x_base + 40, y_base + 40], start=270, end=270+14, fill=cota_color, width=2)
    draw.text((x_base + 12, y_base - 60), "13.76\u00b0", font=font_cota, fill=cota_color)
    
    # Espessura das hastes (Neo Sans = 44px na vertical, Eurostile = 5.5px)
    draw.text((156+dx + 60, y_guia_esol_top + 80), "Espessura Haste: 44px (ESOL)", font=font_cota, fill=cota_color)
    draw.text((310+dx, y_guia_energy_top + 15), "Haste: 5.5px (ENERGY)", font=font_cota, fill=cota_color)
    
    # Título do Diagrama
    draw.text((50, 20), "DIAGRAMA DE COTAS GEOM\u00c9TRICAS DA LOGO ORIGINAL ESOL ENERGY", font=font_title, fill=(0, 16, 70, 255))
    draw.text((50, 50), "Valores extra\u00eddos diretamente da an\u00e1lise pixel-a-pixel da imagem original.", font=font_cota, fill=(100, 100, 100, 255))
    
    # Salvar
    dest_path = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/esol-logo-blueprint-original.png"
    canvas.save(dest_path)
    print("Blueprint original gerado com sucesso!")

if __name__ == "__main__":
    generate()
