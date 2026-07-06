import os
from PIL import Image

def build_brand_kit_pngs():
    input_path = "src/assets/esol-logo-transparent.png"
    output_dir = "public/brand-kit/2. Imagens-PNG"
    
    if not os.path.exists(input_path):
        print(f"ERROR: Logo master nao encontrada em: {input_path}")
        return
        
    os.makedirs(output_dir, exist_ok=True)
    print("Loading and upscaling cropped logo 4x for extreme PNG nitidity...")
    original_img = Image.open(input_path).convert("RGBA")
    orig_w, orig_h = original_img.size
    
    scale = 4
    width = orig_w * scale
    height = orig_h * scale
    img = original_img.resize((width, height), Image.Resampling.LANCZOS)
    
    threshold_esol = 230 * scale
    threshold_energy = 340 * scale
    
    # ── 1. ESOL Stacked Colorido ──
    img_stacked = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            if a > 40:
                if y <= threshold_esol:
                    is_yellow = (r > 160 and g > 110 and b < 110)
                    if is_yellow:
                        img_stacked.putpixel((x, y), (255, 193, 7, a)) # Solar Yellow (#FFC107)
                    else:
                        img_stacked.putpixel((x, y), (0, 31, 92, a)) # Navy Royal (#001F5C)
                else:
                    img_stacked.putpixel((x, y), (71, 85, 105, a)) # Slate Gray (#475569)
    img_stacked.save(os.path.join(output_dir, "esol-logo-stacked.png"), "PNG")
    
    # ── 2. ESOL Stacked Negativo ──
    img_stacked_neg = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            if a > 40:
                if y <= threshold_esol:
                    is_yellow = (r > 160 and g > 110 and b < 110)
                    if is_yellow:
                        img_stacked_neg.putpixel((x, y), (255, 193, 7, a))
                    else:
                        img_stacked_neg.putpixel((x, y), (255, 255, 255, a))
                else:
                    img_stacked_neg.putpixel((x, y), (229, 231, 235, a)) # Silver Gray (#E5E7EB)
    img_stacked_neg.save(os.path.join(output_dir, "esol-logo-stacked-negative.png"), "PNG")
    
    # Mapeamento de pixels baseado em Y-range
    navy_pixels = []
    yellow_pixels = []
    energy_pixels = []
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            if a > 40:
                if y <= threshold_esol:
                    is_yellow = (r > 160 and g > 110 and b < 110)
                    if is_yellow:
                        yellow_pixels.append((x, y))
                    else:
                        navy_pixels.append((x, y))
                elif threshold_esol < y <= threshold_energy:
                    energy_pixels.append((x, y))
                    
    def get_bbox(pixels):
        if not pixels:
            return (0, 0, 0, 0)
        xs = [p[0] for p in pixels]
        ys = [p[1] for p in pixels]
        return (min(xs), min(ys), max(xs), max(ys))

    navy_bbox = get_bbox(navy_pixels)
    yellow_bbox = get_bbox(yellow_pixels)
    energy_bbox = get_bbox(energy_pixels)
    
    # ── 3. ESOL Brandmark (Sol Centrado 512x512) ──
    sx, sy, sx2, sy2 = yellow_bbox
    sun_w = (sx2 - sx) + 1
    sun_h = (sy2 - sy) + 1
    sun_crop = img.crop((sx, sy, sx2 + 1, sy2 + 1))
    
    sun_crop_color = Image.new("RGBA", (sun_w, sun_h), (0, 0, 0, 0))
    for y in range(sun_h):
        for x in range(sun_w):
            r, g, b, a = sun_crop.getpixel((x, y))
            if a > 0:
                sun_crop_color.putpixel((x, y), (255, 193, 7, a))
    
    def create_brandmark_png(filename, recolor_white=False):
        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        scale_factor = 400.0 / max(sun_w, sun_h)
        new_w = int(sun_w * scale_factor)
        new_h = int(sun_h * scale_factor)
        
        resized_sun = sun_crop_color.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        if recolor_white:
            for y in range(new_h):
                for x in range(new_w):
                    r, g, b, a = resized_sun.getpixel((x, y))
                    if a > 0:
                        resized_sun.putpixel((x, y), (255, 255, 255, a))
                        
        px = (512 - new_w) // 2
        py = (512 - new_h) // 2
        canvas.paste(resized_sun, (px, py), resized_sun)
        canvas.save(os.path.join(output_dir, filename), "PNG")
        
    create_brandmark_png("esol-logo-brandmark.png", False)
    create_brandmark_png("esol-logo-brandmark-white.png", True)

    # ── 4. ESOL Horizontal ──
    esol_pixels = navy_pixels + yellow_pixels
    ex, ey, ex2, ey2 = get_bbox(esol_pixels)
    esol_w = (ex2 - ex) + 1
    esol_h = (ey2 - ey) + 1
    
    en_x, en_y, en_x2, en_y2 = energy_bbox
    energy_w = (en_x2 - en_x) + 1
    energy_h = (en_y2 - en_y) + 1
    
    esol_crop = img.crop((ex, ey, ex2 + 1, ey2 + 1))
    energy_crop = img.crop((en_x, en_y, en_x2 + 1, en_y2 + 1))
    
    gap = 40 * scale
    total_w = esol_w + gap + energy_w
    total_h = max(esol_h, energy_h) + 10
    
    vertical_offset_energy = (total_h - energy_h) // 2
    vertical_offset_esol = (total_h - esol_h) // 2
    
    def save_horizontal_png(filename, is_negative):
        canvas = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
        
        esol_block = Image.new("RGBA", (esol_w, esol_h), (0, 0, 0, 0))
        for y in range(esol_h):
            for x in range(esol_w):
                r, g, b, a = esol_crop.getpixel((x, y))
                if a > 40:
                    is_yellow = (r > 160 and g > 110 and b < 110)
                    if is_yellow:
                        esol_block.putpixel((x, y), (255, 193, 7, a))
                    elif is_negative:
                        esol_block.putpixel((x, y), (255, 255, 255, a))
                    else:
                        esol_block.putpixel((x, y), (0, 31, 92, a))
        canvas.paste(esol_block, (0, vertical_offset_esol), esol_block)
        
        energy_block = Image.new("RGBA", (energy_w, energy_h), (0, 0, 0, 0))
        for y in range(energy_h):
            for x in range(energy_w):
                r, g, b, a = energy_crop.getpixel((x, y))
                if a > 40:
                    if is_negative:
                        energy_block.putpixel((x, y), (229, 231, 235, a))
                    else:
                        energy_block.putpixel((x, y), (71, 85, 105, a))
        canvas.paste(energy_block, (esol_w + gap, vertical_offset_energy), energy_block)
        canvas.save(os.path.join(output_dir, filename), "PNG")

    save_horizontal_png("esol-logo-horizontal.png", False)
    save_horizontal_png("esol-logo-horizontal-negative.png", True)
    print("SUCCESS: 6 PNGs built in high resolution inside public/brand-kit/2. Imagens-PNG/")

if __name__ == "__main__":
    build_brand_kit_pngs()
