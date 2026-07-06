import os
import urllib.request
from PIL import Image, ImageDraw, ImageFont

def download_with_fallbacks(url_list, dest_path):
    for url in url_list:
        try:
            print(f"Trying download from: {url}")
            urllib.request.urlretrieve(url, dest_path)
            print(f"Success! Downloaded to {dest_path}")
            return True
        except Exception as e:
            print(f"Failed download from {url}: {e}")
    return False

def reconstruct_logo():
    input_path = "src/assets/esol-logo-transparent.png"
    output_path = "src/assets/esol-logo-transparent.png" # Sobrescreve o master
    font_dir = "brand-kit/temp-fonts"
    
    if not os.path.exists(input_path):
        print(f"ERROR: Logo transparente nao encontrada em: {input_path}")
        return
        
    os.makedirs(font_dir, exist_ok=True)
    
    # Lista de URLs candidatas para garantir que encontremos os TTFs do Librestile (Eurostile Clone)
    fonts_urls = {
        "LibrestileOblique": [
            "https://raw.githubusercontent.com/ocelothe/librestile/master/LibrestileExtBoldOblique.ttf",
            "https://raw.githubusercontent.com/ocelothe/librestile/main/LibrestileExtBoldOblique.ttf",
            "https://raw.githubusercontent.com/ocelothe/librestile/master/fonts/ttf/LibrestileExtBoldOblique.ttf",
            "https://github.com/ocelothe/librestile/raw/master/LibrestileExtBoldOblique.ttf?raw=true"
        ],
        "LibrestileBold": [
            "https://raw.githubusercontent.com/ocelothe/librestile/master/LibrestileExtBold.ttf",
            "https://raw.githubusercontent.com/ocelothe/librestile/main/LibrestileExtBold.ttf",
            "https://raw.githubusercontent.com/ocelothe/librestile/master/fonts/ttf/LibrestileExtBold.ttf",
            "https://github.com/ocelothe/librestile/raw/master/LibrestileExtBold.ttf?raw=true"
        ],
        "MontserratRegular": [
            "https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Regular.ttf",
            "https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Regular.ttf"
        ]
    }
    
    for name, urls in fonts_urls.items():
        dest = os.path.join(font_dir, f"{name}.ttf")
        if not os.path.exists(dest):
            success = download_with_fallbacks(urls, dest)
            if not success:
                print(f"CRITICAL ERROR: Nao foi possivel baixar a fonte {name}")
                return

    # 2. Carregar a logo original para isolar o Sol Dourado
    print("Loading original logo to isolate the golden sun...")
    orig = Image.open(input_path).convert("RGBA")
    orig_w, orig_h = orig.size
    
    # Encontrar pixels amarelos do sol na logo original
    yellow_pixels = []
    for y in range(orig_h):
        for x in range(orig_w):
            r, g, b, a = orig.getpixel((x, y))
            if a > 50:
                is_yellow = (r > 160 and g > 110 and b < 110)
                if is_yellow:
                    yellow_pixels.append((x, y))
                    
    if not yellow_pixels:
        print("ERROR: Nao foi possivel isolar os pixels do Sol.")
        return
        
    xs = [p[0] for p in yellow_pixels]
    ys = [p[1] for p in yellow_pixels]
    sun_bbox = (min(xs), min(ys), max(xs), max(ys))
    
    # Recortar o sol original
    sun_crop = orig.crop((sun_bbox[0], sun_bbox[1], sun_bbox[2] + 1, sun_bbox[3] + 1))
    
    # ── Criar o Canvas Master Reconstruído ──
    # Para ter altissima nitidez, desenharemos em um canvas gigante (3600 x 1400)
    canvas_w = 3600
    canvas_h = 1400
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    # Carregar fontes com resolucao de Eurostile
    font_esol = ImageFont.truetype(os.path.join(font_dir, "LibrestileOblique.ttf"), 380)
    font_energy = ImageFont.truetype(os.path.join(font_dir, "LibrestileOblique.ttf"), 95)
    font_tagline = ImageFont.truetype(os.path.join(font_dir, "MontserratRegular.ttf"), 75)
    
    # Cores Oficiais Harmonizadas
    navy_color = (0, 31, 92, 255)     # #001F5C
    yellow_color = (255, 193, 7, 255)  # #FFC107
    gray_color = (71, 85, 105, 255)   # #475569 (Slate Gray)
    
    # 3. Desenhar a palavra "ES"
    es_x = 350
    es_y = 200
    draw.text((es_x, es_y), "ES", font=font_esol, fill=navy_color)
    
    es_bbox = draw.textbbox((es_x, es_y), "ES", font=font_esol)
    es_w = es_bbox[2] - es_bbox[0]
    es_h = es_bbox[3] - es_bbox[1]
    
    # 4. Redimensionar o Sol e posicionar
    sun_target_h = int(es_h * 0.95)
    sun_aspect = sun_crop.width / sun_crop.height
    sun_target_w = int(sun_target_h * sun_aspect)
    
    # Escalar o sol com Lanczos
    sun_resized = sun_crop.resize((sun_target_w, sun_target_h), Image.Resampling.LANCZOS)
    
    # Repintar os pixels do sol
    for sy_pixel in range(sun_target_h):
        for sx_pixel in range(sun_target_w):
            r, g, b, a = sun_resized.getpixel((sx_pixel, sy_pixel))
            if a > 50:
                sun_resized.putpixel((sx_pixel, sy_pixel), (255, 193, 7, a))
                
    # Posicionar o sol logo apos a letra "S"
    sun_x = es_bbox[2] + 25
    sun_y = es_bbox[1] + (es_h - sun_target_h) // 2 + 10
    
    canvas.paste(sun_resized, (sun_x, sun_y), sun_resized)
    
    # 5. Desenhar a letra "L"
    l_x = sun_x + sun_target_w + 35
    draw.text((l_x, es_y), "L", font=font_esol, fill=navy_color)
    
    # Encontrar os limites da primeira linha toda
    l_bbox = draw.textbbox((l_x, es_y), "L", font=font_esol)
    line1_w = l_bbox[2] - es_bbox[0]
    line1_center = es_bbox[0] + (line1_w // 2)
    
    # 6. Desenhar a palavra "ENERGY"
    energy_text = "ENERGY"
    char_widths = [draw.textbbox((0, 0), c, font=font_energy)[2] for c in energy_text]
    tracking_gap = 48
    total_energy_w = sum(char_widths) + (tracking_gap * (len(energy_text) - 1))
    
    # Centralizar ENERGY
    energy_x_start = line1_center - (total_energy_w // 2)
    energy_y = l_bbox[3] + 110
    
    cursor_x = energy_x_start
    for char in energy_text:
        draw.text((cursor_x, energy_y), char, font=font_energy, fill=gray_color)
        c_bbox = draw.textbbox((0, 0), char, font=font_energy)
        c_w = c_bbox[2] - c_bbox[0]
        cursor_x += c_w + tracking_gap
        
    energy_end_y = energy_y + font_energy.getbbox("E")[3]
    
    # 7. Desenhar a tagline "Deixe o sol trabalhar por você."
    tagline_text = "Deixe o sol trabalhar por você."
    tagline_bbox = draw.textbbox((0, 0), tagline_text, font=font_tagline)
    tagline_w = tagline_bbox[2] - tagline_bbox[0]
    
    tagline_x = line1_center - (tagline_w // 2)
    tagline_y = energy_end_y + 120
    draw.text((tagline_x, tagline_y), tagline_text, font=font_tagline, fill=gray_color)
    
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
        print(f"SUCCESS: Master logo reconstruida com Eurostile (Librestile) e salva em: {output_path} ({prod_w}x{prod_h}px)")
    else:
        print("ERROR: Falha ao recortar o canvas reconstruido.")

if __name__ == "__main__":
    reconstruct_logo()
