import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont

def reconstruct_logo():
    output_path = "src/assets/esol-logo-transparent.png"
    font_dir = "brand-kit/temp-fonts"
    
    os.makedirs(font_dir, exist_ok=True)
    
    # 1. Downloads de fontes oficiais e publicas
    fonts = {
        "NeoSansMedium": "https://raw.githubusercontent.com/ottz0/swd-portfolio/master/dist/assets/fonts/Neo%20Sans%20Std%20Medium.ttf",
        "EurostileBold": "https://github.com/aaron-m/Font-Awesome/raw/master/src/main/resources/fonts/EurostileBold.ttf",
        "MontserratRegular": "https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Regular.ttf"
    }
    
    for name, url in fonts.items():
        dest = os.path.join(font_dir, f"{name}.ttf")
        if not os.path.exists(dest):
            print(f"Downloading font: {name}...")
            try:
                urllib.request.urlretrieve(url.replace(" ", "%20"), dest)
                print(f"Downloaded {name}.ttf successfully.")
            except Exception as e:
                print(f"Error downloading {name}: {e}")
                return

    # 2. Carregar original para recortar o Sol de forma limpa e transparente
    print("Isolating the golden sun from the original logo...")
    orig = Image.open("src/assets/esol-logo.png").convert("RGB")
    w, h = orig.size
    
    # Encontrar os pixels amarelos do sol
    yellow_pixels = []
    for y in range(h):
        for x in range(w):
            r, g, b = orig.getpixel((x, y))
            is_yellow = (r > 180 and g > 130 and b < 100)
            if is_yellow:
                yellow_pixels.append((x, y))
                
    if not yellow_pixels:
        print("ERROR: Golden sun pixels not found.")
        return
        
    xs = [p[0] for p in yellow_pixels]
    ys = [p[1] for p in yellow_pixels]
    sun_bbox = (min(xs), min(ys), max(xs), max(ys))
    
    # Crop do sol transparente
    sun_w = sun_bbox[2] - sun_bbox[0] + 1
    sun_h = sun_bbox[3] - sun_bbox[1] + 1
    sun_transparent = Image.new("RGBA", (sun_w, sun_h), (0, 0, 0, 0))
    
    for sy in range(sun_h):
        for sx in range(sun_w):
            x_orig = sun_bbox[0] + sx
            y_orig = sun_bbox[1] + sy
            r, g, b = orig.getpixel((x_orig, y_orig))
            is_yellow = (r > 160 and g > 110 and b < 110)
            if is_yellow:
                sun_transparent.putpixel((sx, sy), (255, 193, 7, 255))
                
    # ── Criar o Canvas Master Reconstruído ──
    # Para ter altíssima nitidez, desenharemos em um canvas gigante (3600 x 1400)
    canvas_w = 3600
    canvas_h = 1400
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    
    # Carregar fontes com resolução proporcional
    font_esol_base = ImageFont.truetype(os.path.join(font_dir, "NeoSansMedium.ttf"), 360)
    font_energy_base = ImageFont.truetype(os.path.join(font_dir, "EurostileBold.ttf"), 90)
    font_tagline = ImageFont.truetype(os.path.join(font_dir, "MontserratRegular.ttf"), 75)
    
    # Cores Oficiais Harmonizadas
    navy_color = (0, 31, 92, 255)     # #001F5C (Navy Royal)
    gray_color = (71, 85, 105, 255)   # #475569 (Slate Gray)
    
    # Matriz de transformação Affine para fazer o Extended Italic:
    # Sx = 1.28 (Escala horizontal para estender a largura)
    # Kx = 0.22 (Skew horizontal para inclinar Italic em 12.5 graus)
    Sx = 1.28
    Kx = 0.22
    a = 1.0 / Sx
    b = -Kx / Sx
    c = 0
    d = 0
    e = 1.0
    f = 0
    affine_matrix = (a, b, c, d, e, f)
    
    # 3. Renderizar a palavra "ES" (Faux Bold preservando cantos retos e pontas planas!)
    temp_es = Image.new("RGBA", (1500, 600), (0, 0, 0, 0))
    draw_es = ImageDraw.Draw(temp_es)
    
    # Faux Bold com offsets na horizontal e vertical
    for dx in range(-16, 17):
        for dy in range(-7, 8):
            draw_es.text((100 + dx, 100 + dy), "ES", font=font_esol_base, fill=navy_color)
            
    transformed_es = temp_es.transform((1500, 600), Image.Transform.AFFINE, affine_matrix, resample=Image.Resampling.BICUBIC)
    es_bbox = transformed_es.getbbox()
    canvas.paste(transformed_es, (200, 100), transformed_es)
    
    # 4. Redimensionar o Sol e posicionar
    es_real_w = es_bbox[2] - es_bbox[0]
    es_real_h = es_bbox[3] - es_bbox[1]
    
    # Altura ideal do sol: aproximadamente 95% da altura de "ES"
    sun_target_h = int(es_real_h * 0.95)
    sun_aspect = sun_transparent.width / sun_transparent.height
    sun_target_w = int(sun_target_h * sun_aspect)
    
    # Escalar o sol com Lanczos
    sun_resized = sun_transparent.resize((sun_target_w, sun_target_h), Image.Resampling.LANCZOS)
                
    # Posicionar o sol logo após a letra "S"
    sun_x = 200 + es_bbox[0] + es_real_w + 30
    sun_y = 100 + es_bbox[1] + (es_real_h - sun_target_h) // 2 + 5
    canvas.paste(sun_resized, (sun_x, sun_y), sun_resized)
    
    # 5. Desenhar a letra "L" (Faux Bold preservando cantos retos e pontas planas!)
    temp_l = Image.new("RGBA", (800, 600), (0, 0, 0, 0))
    draw_l = ImageDraw.Draw(temp_l)
    
    for dx in range(-16, 17):
        for dy in range(-7, 8):
            draw_l.text((50 + dx, 100 + dy), "L", font=font_esol_base, fill=navy_color)
            
    transformed_l = temp_l.transform((800, 600), Image.Transform.AFFINE, affine_matrix, resample=Image.Resampling.BICUBIC)
    l_bbox = transformed_l.getbbox()
    
    l_x_pos = sun_x + sun_target_w + 30 - l_bbox[0]
    canvas.paste(transformed_l, (l_x_pos, 100), transformed_l)
    
    # Encontrar os limites da primeira linha toda
    line1_end_x = l_x_pos + l_bbox[2]
    line1_center = 200 + es_bbox[0] + (line1_end_x - (200 + es_bbox[0])) // 2
    
    # 6. Desenhar a palavra "ENERGY" (usando Eurostile Bold + Faux Bold)
    energy_text = "ENERGY"
    temp_energy = Image.new("RGBA", (2500, 300), (0, 0, 0, 0))
    draw_energy = ImageDraw.Draw(temp_energy)
    
    # Para o Eurostile Bold, a escala horizontal de ENERGY na logo original e de 1.35
    # Aplicaremos o Extended na transformacao Affine
    Sx_energy = 1.35
    affine_matrix_energy = (1.0 / Sx_energy, -Kx / Sx_energy, 0, 0, 1.0, 0)
    
    tracking_gap = 40
    cursor_x = 100
    for char in energy_text:
        # Faux Bold para a palavra ENERGY (dx: -3..3, dy: -1..1 para manter os cantos perfeitamente vivos!)
        for dx in range(-3, 4):
            for dy in range(-1, 2):
                draw_energy.text((cursor_x + dx, 50 + dy), char, font=font_energy_base, fill=gray_color)
                
        c_w = draw_energy.textbbox((0, 0), char, font=font_energy_base)[2]
        cursor_x += c_w + tracking_gap
        
    transformed_energy = temp_energy.transform((2500, 300), Image.Transform.AFFINE, affine_matrix_energy, resample=Image.Resampling.BICUBIC)
    energy_bbox = transformed_energy.getbbox()
    energy_real_w = energy_bbox[2] - energy_bbox[0]
    
    # Centralizar ENERGY
    energy_x = line1_center - (energy_real_w // 2) - energy_bbox[0]
    energy_y = 100 + l_bbox[3] + 90
    canvas.paste(transformed_energy, (energy_x, energy_y), transformed_energy)
    
    # 7. Desenhar a tagline "Deixe o sol trabalhar por você." (Montserrat Regular)
    tagline_text = "Deixe o sol trabalhar por você."
    temp_tagline = Image.new("RGBA", (2500, 200), (0, 0, 0, 0))
    draw_tag = ImageDraw.Draw(temp_tagline)
    draw_tag.text((100, 50), tagline_text, font=font_tagline, fill=gray_color)
    
    tag_bbox = temp_tagline.getbbox()
    tag_real_w = tag_bbox[2] - tag_bbox[0]
    
    tag_x = line1_center - (tag_real_w // 2) - tag_bbox[0]
    tag_y = energy_y + energy_bbox[3] + 45
    canvas.paste(temp_tagline, (tag_x, tag_y), temp_tagline)
    
    # ── 8. Fazer o Crop Final e Salvar ──
    bbox = canvas.getbbox()
    if bbox:
        padding = 30
        crop_box = (
            max(0, bbox[0] - padding),
            max(0, bbox[1] - padding),
            min(canvas_w, bbox[2] + padding),
            min(canvas_h, bbox[3] + padding)
        )
        final_logo = canvas.crop(crop_box)
        
        prod_w = 1100
        prod_h = int(prod_w * (final_logo.height / final_logo.width))
        prod_logo = final_logo.resize((prod_w, prod_h), Image.Resampling.LANCZOS)
        
        prod_logo.save(output_path, "PNG")
        print(f"SUCCESS: Master logo reconstruida com Neo Sans + Eurostile real e salva em: {output_path} ({prod_w}x{prod_h}px)")
    else:
        print("ERROR: Falha ao recortar o canvas reconstruido.")

if __name__ == "__main__":
    reconstruct_logo()
