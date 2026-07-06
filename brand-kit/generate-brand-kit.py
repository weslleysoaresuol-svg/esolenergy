import os
from PIL import Image

def build_brand_kit():
    input_path = "src/assets/esol-logo-transparent.png"
    output_dir = "public/brand-kit/1. Web-SVG"
    
    if not os.path.exists(input_path):
        print(f"ERROR: Logo transparente nao encontrada em: {input_path}")
        return
        
    os.makedirs(output_dir, exist_ok=True)
    print("Reading and upscaling cropped logo 4x for extreme nitidity (LANCZOS)...")
    original_img = Image.open(input_path).convert("RGBA")
    orig_w, orig_h = original_img.size
    
    # Upscale 4x
    scale = 4
    width = orig_w * scale
    height = orig_h * scale
    img = original_img.resize((width, height), Image.Resampling.LANCZOS)
    
    # Escalar os thresholds de Y
    threshold_esol = 230 * scale
    threshold_energy = 340 * scale
    
    # Camadas de pixels segmentadas matematicamente por Y-range
    navy_pixels = []
    yellow_pixels = []
    energy_pixels = []
    tagline_pixels = []
    
    # Ajuste de cores oficiais da ESOL Energy (Harmonizadas com o site principal)
    # Navy: #001F5C | Yellow: #FFC107 | Gray: #475569
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            if a > 40:
                if y <= threshold_esol:
                    # Separacao interna da primeira linha (ESOL Navy vs Sol Yellow)
                    # No upscale a tonalidade de cor pode suavizar, por isso o threshold de amarelo e ligeiramente adaptado
                    is_yellow = (r > 160 and g > 110 and b < 110)
                    if is_yellow:
                        yellow_pixels.append((x, y))
                    else:
                        navy_pixels.append((x, y))
                elif threshold_esol < y <= threshold_energy:
                    # Linha 2: "ENERGY"
                    energy_pixels.append((x, y))
                else:
                    # Linha 3: Tagline
                    tagline_pixels.append((x, y))

    # Encontrar as bounding boxes reais de cada componente
    def get_bbox(pixels):
        if not pixels:
            return (0, 0, 0, 0)
        xs = [p[0] for p in pixels]
        ys = [p[1] for p in pixels]
        return (min(xs), min(ys), max(xs), max(ys))

    navy_bbox = get_bbox(navy_pixels)
    yellow_bbox = get_bbox(yellow_pixels)
    energy_bbox = get_bbox(energy_pixels)
    
    # ── RLE Vectorization para cada camada ──
    def pixels_to_rle_paths(pixels, offset=(0, 0)):
        by_y = {}
        for x, y in pixels:
            by_y.setdefault(y, []).append(x)
            
        paths = []
        for y, x_list in sorted(by_y.items()):
            x_list.sort()
            i = 0
            while i < len(x_list):
                start_x = x_list[i]
                while i + 1 < len(x_list) and x_list[i+1] == x_list[i] + 1:
                    i += 1
                end_x = x_list[i]
                
                # Ajustar coordenadas relativas ao bounding box do grupo
                adj_x = start_x - offset[0]
                adj_y = y - offset[1]
                run_w = (end_x - start_x) + 1
                
                paths.append(f"M{adj_x},{adj_y}h{run_w}v1h-{run_w}z")
                i += 1
        return " ".join(paths)

    # Gerar os caminhos originais
    navy_path_d = pixels_to_rle_paths(navy_pixels)
    yellow_path_d = pixels_to_rle_paths(yellow_pixels)
    energy_path_d = pixels_to_rle_paths(energy_pixels)
    tagline_path_d = pixels_to_rle_paths(tagline_pixels)

    # ── 1. ESOL Stacked (Vertical Original) ──
    def save_stacked(filename, is_negative):
        navy_color = "#FFFFFF" if is_negative else "#001F5C" # Navy do Site Oficial
        gray_color = "#E5E7EB" if is_negative else "#475569" # Slate Gray do Site Oficial
        
        content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
  <g class="esol-stacked">
    <path fill="{navy_color}" d="{navy_path_d}" />
    <path fill="#FFC107" d="{yellow_path_d}" />
    <path fill="{gray_color}" d="{energy_path_d}" />
    <path fill="{gray_color}" d="{tagline_path_d}" />
  </g>
</svg>
'''
        with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as f:
            f.write(content)

    save_stacked("esol-logo-stacked.svg", False)
    save_stacked("esol-logo-stacked-negative.svg", True)

    # ── 2. ESOL Brandmark (Apenas o Sol) ──
    sx, sy, sx2, sy2 = yellow_bbox
    sun_w = (sx2 - sx) + 1
    sun_h = (sy2 - sy) + 1
    sun_rel_path = pixels_to_rle_paths(yellow_pixels, offset=(sx, sy))
    
    def save_brandmark(filename, fill_color):
        content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {sun_w} {sun_h}" width="100%" height="100%" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
  <path fill="{fill_color}" d="{sun_rel_path}" />
</svg>
'''
        with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as f:
            f.write(content)
            
    save_brandmark("esol-logo-brandmark.svg", "#FFC107")
    save_brandmark("esol-logo-brandmark-white.svg", "#FFFFFF")

    # ── 3. ESOL Horizontal ──
    esol_pixels = navy_pixels + yellow_pixels
    ex, ey, ex2, ey2 = get_bbox(esol_pixels)
    esol_w = (ex2 - ex) + 1
    esol_h = (ey2 - ey) + 1
    
    en_x, en_y, en_x2, en_y2 = energy_bbox
    energy_w = (en_x2 - en_x) + 1
    energy_h = (en_y2 - en_y) + 1
    
    gap = 40 * scale
    total_w = esol_w + gap + energy_w
    total_h = max(esol_h, energy_h)
    
    # Alinhamento vertical centralizado
    vertical_offset_energy = (total_h - energy_h) // 2
    vertical_offset_esol = (total_h - esol_h) // 2
    
    # Gerar os caminhos relativos de cada bloco
    esol_navy_rel = pixels_to_rle_paths(navy_pixels, offset=(ex, ey))
    esol_sun_rel = pixels_to_rle_paths(yellow_pixels, offset=(ex, ey))
    energy_rel = pixels_to_rle_paths(energy_pixels, offset=(en_x, en_y))

    def save_horizontal(filename, is_negative):
        navy_color = "#FFFFFF" if is_negative else "#001F5C"
        gray_color = "#E5E7EB" if is_negative else "#475569"
        
        content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_w} {total_h}" width="100%" height="100%" shape-rendering="geometricPrecision" text-rendering="geometricPrecision">
  <g class="esol-horizontal">
    <g transform="translate(0, {vertical_offset_esol})">
      <path fill="{navy_color}" d="{esol_navy_rel}" />
      <path fill="#FFC107" d="{esol_sun_rel}" />
    </g>
    <g transform="translate({esol_w + gap}, {vertical_offset_energy})">
      <path fill="{gray_color}" d="{energy_rel}" />
    </g>
  </g>
</svg>
'''
        with open(os.path.join(output_dir, filename), "w", encoding="utf-8") as f:
            f.write(content)

    save_horizontal("esol-logo-horizontal.svg", False)
    save_horizontal("esol-logo-horizontal-negative.svg", True)
    print("SUCCESS: 6 SVGs built in high resolution inside public/brand-kit/1. Web-SVG/")

if __name__ == "__main__":
    build_brand_kit()
