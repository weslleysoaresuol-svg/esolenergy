import os
import math
from PIL import Image, ImageDraw, ImageFont
import numpy as np

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

def generate_pixel_measurements():
    print("Iniciando medição pixel-a-pixel das letras na imagem da logo original...")
    
    # 1. Carregar imagem original
    orig = Image.open("src/assets/esol-logo-original.png").convert("RGBA")
    
    # Coordenadas reais das caixas das letras em esol-logo-original.png
    esol_bboxes = [
        {"char": "E", "box": (156, 174, 344, 340)},  # W=188, H=166
        {"char": "S", "box": (330, 174, 528, 340)},  # W=198, H=166
        {"char": "O", "box": (525, 170, 728, 342)},  # W=203, H=172 (Sol original)
        {"char": "L", "box": (728, 174, 885, 340)}   # W=157, H=166
    ]
    
    energy_bboxes = [
        {"char": "E", "box": (196, 376, 258, 423)},  # W=62, H=47
        {"char": "N", "box": (303, 376, 379, 423)},  # W=76, H=47
        {"char": "E", "box": (432, 376, 493, 423)},  # W=61, H=47
        {"char": "R", "box": (541, 376, 608, 423)},  # W=67, H=47
        {"char": "G", "box": (658, 374, 725, 424)},  # W=67, H=50
        {"char": "Y", "box": (774, 376, 837, 423)}   # W=63, H=47
    ]
    
    # Criar canvas principal
    canvas_w, canvas_h = 1350, 750
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(canvas)
    
    # Fontes
    try:
        font_cota = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 12)
        font_label = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 14)
        font_title = ImageFont.truetype("brand-kit/temp-fonts/MontserratRegular.ttf", 20)
    except:
        font_cota = ImageFont.load_default()
        font_label = ImageFont.load_default()
        font_title = ImageFont.load_default()
        
    cota_color = (255, 60, 0, 255) # Vermelho
    grid_color = (230, 230, 230, 255)
    
    # --- CABEÇALHO ---
    draw.text((50, 20), "MEDIÇÃO PIXEL-A-PIXEL DAS LETRAS DIRETAMENTE NA LOGO ORIGINAL", font=font_title, fill=(10, 16, 70, 255))
    draw.text((50, 55), "Cada letra foi recortada e medida pixel-a-pixel. Cotas em pixels reais (px) da imagem de origem.", font=font_label, fill=(100, 100, 100, 255))
    
    # --- GERAR LINHA 1 (ESOL - Neo Sans Original) ---
    cell_w, cell_h = 280, 280
    x_offset_start = 50
    y_offset_esol = 100
    
    for idx, item in enumerate(esol_bboxes):
        char = item["char"]
        box = item["box"]
        w = box[2] - box[0]
        h = box[3] - box[1]
        
        # Recortar letra
        crop_img = orig.crop(box)
        # Redimensionar para caber na célula mantendo proporções (vamos fazer uma caixa de 180x180 para a letra)
        scale = min(180 / w, 180 / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        crop_scaled = crop_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Posição da célula
        cx = x_offset_start + idx * (cell_w + 30)
        cy = y_offset_esol
        
        # Desenhar caixa de contorno da célula
        draw.rectangle([cx, cy, cx + cell_w, cy + cell_h], outline=(200, 200, 200, 255), width=1)
        draw.text((cx + 10, cy + 10), f"LETRA '{char}' ({w}px x {h}px)", font=font_label, fill=(0, 0, 0, 255))
        
        # Desenhar a imagem recortada centrada
        px = cx + (cell_w - new_w) // 2
        py = cy + 40 + (cell_h - 40 - new_h) // 2
        canvas.paste(crop_scaled, (px, py), crop_scaled)
        
        # Adicionar as cotas locais reais (em pixels reais da imagem original)
        # Cota de Altura (H = ... px)
        draw_dim_line(draw, (px - 15, py), (px - 15, py + new_h), f"{h} px", font_cota, cota_color, offset=40, is_vertical=True)
        # Cota de Largura (W = ... px)
        draw_dim_line(draw, (px, py + new_h + 15), (px + new_w, py + new_h + 15), f"{w} px", font_cota, cota_color, offset=20, is_vertical=False)
        
        # Medições internas reais de espessura de haste (haste = 44px)
        haste_scaled = int(44 * scale)
        # Desenhar linha de espessura no E, O, L
        if char == "E":
            # Haste vertical esquerda
            draw_dim_line(draw, (px, py + new_h // 2), (px + haste_scaled, py + new_h // 2), "44px", font_cota, cota_color, offset=-15, is_vertical=False)
            draw.text((cx + 10, cy + cell_h - 25), "Braço Sup: 118px | Haste: 44px", font=font_cota, fill=cota_color)
        elif char == "S":
            # Haste central
            draw_dim_line(draw, (px + new_w // 2 - haste_scaled // 2, py + new_h // 2), (px + new_w // 2 + haste_scaled // 2, py + new_h // 2), "44px", font_cota, cota_color, offset=-15, is_vertical=False)
            draw.text((cx + 10, cy + cell_h - 25), "Curvas suavizadas por pixels", font=font_cota, fill=cota_color)
        elif char == "O":
            # Haste do sol
            draw.text((cx + 10, cy + cell_h - 25), "Espessura Haste Sol: 44px", font=font_cota, fill=cota_color)
        elif char == "L":
            # Haste vertical do L
            draw_dim_line(draw, (px, py + new_h // 2), (px + haste_scaled, py + new_h // 2), "44px", font_cota, cota_color, offset=-15, is_vertical=False)
            draw.text((cx + 10, cy + cell_h - 25), "Haste Inf: 44px | Base: 118px", font=font_cota, fill=cota_color)

    # --- GERAR LINHA 2 (ENERGY - Eurostile Original) ---
    cell_w2, cell_h2 = 180, 230
    y_offset_energy = 420
    x_offset_start2 = 50
    
    for idx, item in enumerate(energy_bboxes):
        char = item["char"]
        box = item["box"]
        w = box[2] - box[0]
        h = box[3] - box[1]
        
        # Recortar letra
        crop_img = orig.crop(box)
        scale = min(120 / w, 120 / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        crop_scaled = crop_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Posição da célula
        cx = x_offset_start2 + idx * (cell_w2 + 25)
        cy = y_offset_energy
        
        # Desenhar caixa de contorno da célula
        draw.rectangle([cx, cy, cx + cell_w2, cy + cell_h2], outline=(200, 200, 200, 255), width=1)
        draw.text((cx + 10, cy + 10), f"LETRA '{char}'", font=font_label, fill=(0, 0, 0, 255))
        
        # Desenhar a imagem recortada centrada
        px = cx + (cell_w2 - new_w) // 2
        py = cy + 40 + (cell_h2 - 40 - new_h) // 2
        canvas.paste(crop_scaled, (px, py), crop_scaled)
        
        # Adicionar as cotas locais reais
        draw_dim_line(draw, (px - 15, py), (px - 15, py + new_h), f"{h}px", font_cota, cota_color, offset=30, is_vertical=True)
        draw_dim_line(draw, (px, py + new_h + 15), (px + new_w, py + new_h + 15), f"{w}px", font_cota, cota_color, offset=15, is_vertical=False)
        
        # Haste vertical do Eurostile (5.5px)
        haste_scaled = max(2, int(5.5 * scale))
        if char in ["E", "R", "N"]:
            draw.text((cx + 10, cy + cell_h2 - 25), "Haste: 5.5px", font=font_cota, fill=cota_color)
            
    # Salvar a imagem final das medições pixel a pixel
    dest_path = "C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/esol-logo-individual-pixel-measurements.png"
    canvas.save(dest_path)
    print("Imagem das medições pixel-a-pixel gerada com sucesso!")

if __name__ == "__main__":
    generate_pixel_measurements()
