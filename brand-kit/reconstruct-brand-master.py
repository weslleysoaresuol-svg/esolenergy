import os
from PIL import Image, ImageFilter

def reconstruct_original():
    input_path = "src/assets/esol-logo.png"
    output_path = "src/assets/esol-logo-transparent.png"
    
    if not os.path.exists(input_path):
        print(f"ERROR: Logo original nao encontrada em: {input_path}")
        return
        
    print("Loading original logo with baked checkerboard...")
    img = Image.open(input_path).convert("RGB")
    
    # Bounding box refinado da logo original (1024x682)
    xmin, ymin, xmax, ymax = 156, 168, 885, 497
    crop_w = xmax - xmin + 1
    crop_h = ymax - ymin + 1
    
    # 1. Recortar a logo firmemente
    logo_cropped = img.crop((xmin, ymin, xmax + 1, ymax + 1))
    
    # 2. Upscale 4x para gerar uma matriz de alta definicao (2920 x 1320)
    scale = 4
    width = crop_w * scale
    height = crop_h * scale
    print(f"Upscaling logo 4x to {width}x{height} (LANCZOS)...")
    img_large = logo_cropped.resize((width, height), Image.Resampling.LANCZOS)
    
    # 3. Gerar mascara binaria limpa removendo o fundo quadriculado fake
    mask = Image.new("L", (width, height), 0)
    for y in range(height):
        for x in range(width):
            r, g, b = img_large.getpixel((x, y))
            # Identificar pixels claros neutros do quadriculado
            is_bg = (r > 238 and g > 238 and b > 238) and (abs(r - g) < 10 and abs(g - b) < 10 and abs(r - b) < 10)
            if not is_bg:
                mask.putpixel((x, y), 255)
                
    # 4. Suavizar as bordas da mascara binaria com Blur + Threshold
    # Isso elimina qualquer serrilhado de pixel herdado do quadriculado original, gerando contornos lisos
    mask_blurred = mask.filter(ImageFilter.GaussianBlur(radius=2.0))
    mask_smoothed = mask_blurred.point(lambda p: 255 if p > 128 else 0)
    
    # 5. Criar a nova imagem master transparente com cores corporativas oficiais do site
    # Navy: #001F5C (0, 31, 92) | Yellow: #FFC107 (255, 193, 7) | Gray: #475569 (71, 85, 105)
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    
    # Coordenadas relativas escaladas
    threshold_esol = 190 * scale
    threshold_energy = 270 * scale
    
    # X-range do Sol Dourado original relativo ao crop (escala 4x)
    sun_xmin = 369 * scale
    sun_xmax = 570 * scale
    
    for y in range(height):
        for x in range(width):
            m_val = mask_smoothed.getpixel((x, y))
            if m_val == 255:
                # Colorir dependendo do Y-range (linhas) e X-range (sol)
                if y <= threshold_esol:
                    # Linha 1: ESOL
                    if sun_xmin <= x <= sun_xmax:
                        # Sol Dourado
                        canvas.putpixel((x, y), (255, 193, 7, 255))
                    else:
                        # Letras ES e L
                        canvas.putpixel((x, y), (0, 31, 92, 255))
                elif threshold_esol < y <= threshold_energy:
                    # Linha 2: ENERGY
                    canvas.putpixel((x, y), (71, 85, 105, 255))
                else:
                    # Linha 3: Tagline
                    canvas.putpixel((x, y), (71, 85, 105, 255))
                    
    # Salvar a nova master transparente em alta definicao
    canvas.save(output_path, "PNG")
    print(f"SUCCESS: Master original restaurada com bordas lisas em: {output_path} ({width}x{height}px)")

if __name__ == "__main__":
    reconstruct_original()
