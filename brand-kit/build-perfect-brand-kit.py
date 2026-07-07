import os
import cv2
import numpy as np
from PIL import Image, ImageFilter
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

def get_signed_area(pts):
    area = 0.0
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        area += x1 * y2 - x2 * y1
    return 0.5 * area

def build_perfect_brand_kit():
    input_path = "src/assets/esol-logo.png"
    output_svg_dir = "public/brand-kit/1. Web-SVG"
    output_png_dir = "public/brand-kit/2. Imagens-PNG"
    output_fonts_dir = "public/fonts"
    
    os.makedirs(output_svg_dir, exist_ok=True)
    os.makedirs(output_png_dir, exist_ok=True)
    os.makedirs(output_fonts_dir, exist_ok=True)
    
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        return
        
    print("Loading original logo and upscaling 4x for high-definition contour tracing...")
    img = cv2.imread(input_path)
    h, w, c = img.shape
    
    # 4x upscale usando Lanczos
    img_large = cv2.resize(img, (w*4, h*4), interpolation=cv2.INTER_LANCZOS4)
    lh, lw, _ = img_large.shape
    
    print("Isolating color masks for Navy, Yellow, and Grey layers...")
    # Criar mascaras de cor puras para evitar ruido do checkerboard
    navy_mask = np.zeros((lh, lw), dtype=np.uint8)
    yellow_mask = np.zeros((lh, lw), dtype=np.uint8)
    grey_mask = np.zeros((lh, lw), dtype=np.uint8)
    
    # Varredura de pixel
    for y in range(lh):
        for x in range(lw):
            b, g, r = img_large[y, x][:3]
            # Navy (ES, L)
            if r < 80 and g < 80 and b > 40 and b < 140 and (int(b) - int(r)) > 15:
                navy_mask[y, x] = 255
            # Yellow (Sol O)
            elif r > 180 and g > 130 and b < 100:
                yellow_mask[y, x] = 255
            # Grey (ENERGY, Tagline)
            elif 60 < r < 180 and 60 < g < 180 and 60 < b < 180 and abs(int(r) - int(g)) < 12 and abs(int(r) - int(b)) < 12:
                grey_mask[y, x] = 255
                
    # Suavizar as mascaras para remover serrilhados de pixels
    def smooth_mask(m):
        blurred = cv2.GaussianBlur(m, (15, 15), 3.5)
        _, thresh = cv2.threshold(blurred, 120, 255, cv2.THRESH_BINARY)
        return thresh
        
    navy_smooth = smooth_mask(navy_mask)
    yellow_smooth = smooth_mask(yellow_mask)
    grey_smooth = smooth_mask(grey_mask)
    
    # Separar a mascara cinza em ENERGY e Tagline usando o divisor Y = 1750
    energy_mask = np.zeros_like(grey_smooth)
    tagline_mask = np.zeros_like(grey_smooth)
    energy_mask[:1750, :] = grey_smooth[:1750, :]
    tagline_mask[1750:, :] = grey_smooth[1750:, :]
    
    # ── Extrair Contornos com Hierarquia de Furos (RETR_CCOMP) ──
    def get_contour_hierarchy(m, min_area=300):
        contours, hierarchy = cv2.findContours(m, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)
        elements = []
        if not contours:
            return elements
            
        for i, cnt in enumerate(contours):
            h_info = hierarchy[0][i]
            parent = h_info[3]
            if parent == -1: # Contorno externo
                area = cv2.contourArea(cnt)
                if area > min_area:
                    # Simplificar levemente
                    epsilon = 0.5
                    approx = cv2.approxPolyDP(cnt, epsilon, True)
                    
                    x, y, gw, gh = cv2.boundingRect(approx)
                    elements.append({
                        "index": i,
                        "contour": approx,
                        "bbox": [x, y, x + gw, y + gh],
                        "children": []
                    })
                    
        # Associar furos
        for i, cnt in enumerate(contours):
            h_info = hierarchy[0][i]
            parent = h_info[3]
            if parent != -1:
                epsilon = 0.5
                approx = cv2.approxPolyDP(cnt, epsilon, True)
                for parent_elem in elements:
                    if parent_elem["index"] == parent:
                        parent_elem["children"].append(approx)
                        break
        return elements

    print("Extracting clean vector components...")
    navy_elements = get_contour_hierarchy(navy_smooth, min_area=1000)
    yellow_elements = get_contour_hierarchy(yellow_smooth, min_area=1000)
    energy_elements = get_contour_hierarchy(energy_mask, min_area=500)
    tagline_elements = get_contour_hierarchy(tagline_mask, min_area=100)
    
    # Ordenar elementos da esquerda para a direita
    navy_elements.sort(key=lambda item: item["bbox"][0])
    yellow_elements.sort(key=lambda item: item["bbox"][0])
    energy_elements.sort(key=lambda item: item["bbox"][0])
    tagline_elements.sort(key=lambda item: item["bbox"][0])
    
    print(f"Detected: Navy={len(navy_elements)}, Yellow={len(yellow_elements)}, ENERGY={len(energy_elements)}, Tagline={len(tagline_elements)} contours.")
    
    if len(navy_elements) != 3 or len(yellow_elements) != 2 or len(energy_elements) != 6:
        print("ERROR: Component counts do not match original logo structure.")
        return
        
    # ── FUNÇÃO PARA CONVERTER ELEMENTO PARA D-STRING SVG ──
    def element_to_path_d(elem, dx=0, dy=0):
        paths = []
        # Contorno externo
        pts = elem["contour"].reshape(-1, 2)
        if len(pts) >= 3:
            path_str = f"M {pts[0][0] - dx},{pts[0][1] - dy} " + " ".join(f"L {p[0] - dx},{p[1] - dy}" for p in pts[1:]) + " Z"
            paths.append(path_str)
        # Furos
        for child in elem["children"]:
            pts_c = child.reshape(-1, 2)
            if len(pts_c) >= 3:
                # Winding order oposto para furos
                area = get_signed_area(pts_c)
                if area > 0:
                    pts_c = np.flip(pts_c, axis=0)
                path_str = f"M {pts_c[0][0] - dx},{pts_c[0][1] - dy} " + " ".join(f"L {p[0] - dx},{p[1] - dy}" for p in pts_c[1:]) + " Z"
                paths.append(path_str)
        return " ".join(paths)

    # ── 1. GERAR A LOGO HORIZONTAL OFICIAL E HORIZONTAL NEGATIVA ──
    # Encontrar bounding box global da logo horizontal original
    all_bboxes = [g["bbox"] for g in navy_elements + yellow_elements + energy_elements + tagline_elements]
    min_x = min(b[0] for b in all_bboxes)
    min_y = min(b[1] for b in all_bboxes)
    max_x = max(b[2] for b in all_bboxes)
    max_y = max(b[3] for b in all_bboxes)
    
    width_h = max_x - min_x
    height_h = max_y - min_y
    
    # Agrupar paths
    navy_paths = [element_to_path_d(e, min_x, min_y) for e in navy_elements]
    yellow_paths = [element_to_path_d(e, min_x, min_y) for e in yellow_elements]
    energy_paths = [element_to_path_d(e, min_x, min_y) for e in energy_elements]
    tagline_paths = [element_to_path_d(e, min_x, min_y) for e in tagline_elements]
    
    # SVG Horizontal Oficial
    svg_horiz = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width_h} {height_h}" width="100%" height="100%">
  <path d="{" ".join(navy_paths)}" fill="#001F5C" fill-rule="evenodd" />
  <path d="{" ".join(yellow_paths)}" fill="#FFC107" fill-rule="evenodd" />
  <path d="{" ".join(energy_paths)} {" ".join(tagline_paths)}" fill="#475569" fill-rule="evenodd" />
</svg>"""
    with open(os.path.join(output_svg_dir, "esol-logo-horizontal.svg"), "w", encoding="utf-8") as f:
        f.write(svg_horiz)
        
    # SVG Horizontal Negativa
    svg_horiz_neg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width_h} {height_h}" width="100%" height="100%">
  <path d="{" ".join(navy_paths)}" fill="#FFFFFF" fill-rule="evenodd" />
  <path d="{" ".join(yellow_paths)}" fill="#FFC107" fill-rule="evenodd" />
  <path d="{" ".join(energy_paths)} {" ".join(tagline_paths)}" fill="#FFFFFF" fill-rule="evenodd" />
</svg>"""
    with open(os.path.join(output_svg_dir, "esol-logo-horizontal-negative.svg"), "w", encoding="utf-8") as f:
        f.write(svg_horiz_neg)

    # ── 2. GERAR A LOGO VERTICAL / STACKED E VERTICAL NEGATIVA ──
    # Para a logo vertical, vamos organizar os elementos centralizados em uma largura fixa de 3000px
    canvas_w = 3000
    
    # Calcular centro e dimensoes de cada linha
    def get_group_bbox(elems):
        bboxes = [e["bbox"] for e in elems]
        mx1 = min(b[0] for b in bboxes)
        my1 = min(b[1] for b in bboxes)
        mx2 = max(b[2] for b in bboxes)
        my2 = max(b[3] for b in bboxes)
        return mx1, my1, mx2, my2
        
    # Linha 1: ESOL (ES + Sun + L)
    esol_elems = [navy_elements[0], navy_elements[1], yellow_elements[0], yellow_elements[1], navy_elements[2]]
    esol_elems_sorted = sorted(esol_elems, key=lambda item: item["bbox"][0])
    x1_1, y1_1, x2_1, y2_1 = get_group_bbox(esol_elems_sorted)
    w1 = x2_1 - x1_1
    h1 = y2_1 - y1_1
    
    # Linha 2: ENERGY
    x1_2, y1_2, x2_2, y2_2 = get_group_bbox(energy_elements)
    w2 = x2_2 - x1_2
    h2 = y2_2 - y1_2
    
    # Linha 3: Tagline
    x1_3, y1_3, x2_3, y2_3 = get_group_bbox(tagline_elements)
    w3 = x2_3 - x1_3
    h3 = y2_3 - y1_3
    
    # Centralizacao horizontal (sh = shift horizontal)
    sh1 = (canvas_w / 2) - (w1 / 2) - x1_1
    sh2 = (canvas_w / 2) - (w2 / 2) - x1_2
    sh3 = (canvas_w / 2) - (w3 / 2) - x1_3
    
    # Posicionamento vertical (sv = shift vertical)
    margin_top = 100
    gap1 = 120  # entre ESOL e ENERGY
    gap2 = 80   # entre ENERGY e Tagline
    
    sv1 = margin_top - y1_1
    sv2 = margin_top + h1 + gap1 - y1_2
    sv3 = margin_top + h1 + gap1 + h2 + gap2 - y1_3
    
    height_v = margin_top + h1 + gap1 + h2 + gap2 + h3 + 100
    
    # Gerar paths deslocados
    navy_paths_v = [element_to_path_d(e, -sh1, -sv1) for e in navy_elements]
    yellow_paths_v = [element_to_path_d(e, -sh1, -sv1) for e in yellow_elements]
    energy_paths_v = [element_to_path_d(e, -sh2, -sv2) for e in energy_elements]
    tagline_paths_v = [element_to_path_d(e, -sh3, -sv3) for e in tagline_elements]
    
    svg_stacked = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_w} {height_v}" width="100%" height="100%">
  <path d="{" ".join(navy_paths_v)}" fill="#001F5C" fill-rule="evenodd" />
  <path d="{" ".join(yellow_paths_v)}" fill="#FFC107" fill-rule="evenodd" />
  <path d="{" ".join(energy_paths_v)} {" ".join(tagline_paths_v)}" fill="#475569" fill-rule="evenodd" />
</svg>"""
    with open(os.path.join(output_svg_dir, "esol-logo-stacked.svg"), "w", encoding="utf-8") as f:
        f.write(svg_stacked)
        
    svg_stacked_neg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {canvas_w} {height_v}" width="100%" height="100%">
  <path d="{" ".join(navy_paths_v)}" fill="#FFFFFF" fill-rule="evenodd" />
  <path d="{" ".join(yellow_paths_v)}" fill="#FFC107" fill-rule="evenodd" />
  <path d="{" ".join(energy_paths_v)} {" ".join(tagline_paths_v)}" fill="#FFFFFF" fill-rule="evenodd" />
</svg>"""
    with open(os.path.join(output_svg_dir, "esol-logo-stacked-negative.svg"), "w", encoding="utf-8") as f:
        f.write(svg_stacked_neg)

    # ── 3. GERAR O BRANDMARK (SÓ O SOL) ──
    x1_s, y1_s, x2_s, y2_s = get_group_bbox(yellow_elements)
    ws = x2_s - x1_s
    hs = y2_s - y1_s
    
    # Caixa quadrada de 1000px
    box_sz = 1000
    sh_s = (box_sz / 2) - (ws / 2) - x1_s
    sv_s = (box_sz / 2) - (hs / 2) - y1_s
    
    yellow_paths_bm = [element_to_path_d(e, -sh_s, -sv_s) for e in yellow_elements]
    
    svg_bm = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {box_sz} {box_sz}" width="100%" height="100%">
  <path d="{" ".join(yellow_paths_bm)}" fill="#FFC107" fill-rule="evenodd" />
</svg>"""
    with open(os.path.join(output_svg_dir, "esol-logo-brandmark.svg"), "w", encoding="utf-8") as f:
        f.write(svg_bm)
        
    svg_bm_white = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {box_sz} {box_sz}" width="100%" height="100%">
  <path d="{" ".join(yellow_paths_bm)}" fill="#FFFFFF" fill-rule="evenodd" />
</svg>"""
    with open(os.path.join(output_svg_dir, "esol-logo-brandmark-white.svg"), "w", encoding="utf-8") as f:
        f.write(svg_bm_white)

    print("SVGs generated successfully.")

    # ── 4. GERAR OS PNGs DE ALTA RESOLUÇÃO ──
    # Para gerar os PNGs, faremos renderizacao direta de mascara em Pillow
    # Criamos um canvas master RGBA transparente com o tamanho final correto
    def create_png_from_masks(svg_filename, out_png_path, bg_color=(0,0,0,0), scale_down_w=1200):
        # Como o Pillow nao renderiza caminhos SVG complexos nativamente, faremos a composicao
        # direta de imagens usando as mascaras que ja extraimos!
        # Isso garante que as curvas fiquem perfeitamente suaves e corretas.
        
        # Horizontal
        if "horizontal" in svg_filename:
            cw, ch = width_h, height_h
            canvas_png = Image.new("RGBA", (cw, ch), bg_color)
            
            # Cortar as mascaras para a bounding box global min_x, min_y
            crop_box = (min_x, min_y, max_x, max_y)
            navy_cr = Image.fromarray(navy_smooth).crop(crop_box)
            yellow_cr = Image.fromarray(yellow_smooth).crop(crop_box)
            grey_cr = Image.fromarray(grey_smooth).crop(crop_box)
            
            # Escolher cor baseada no tipo de logo (Negativo ou normal)
            is_neg = "negative" in svg_filename
            navy_rgb = (255, 255, 255, 255) if is_neg else (0, 31, 92, 255)
            yellow_rgb = (255, 193, 7, 255) # sempre amarelo solar
            grey_rgb = (255, 255, 255, 255) if is_neg else (71, 85, 105, 255)
            
            # Pintar Navy
            navy_color_img = Image.new("RGBA", (cw, ch), navy_rgb)
            canvas_png = Image.composite(navy_color_img, canvas_png, navy_cr)
            
            # Pintar Yellow
            yellow_color_img = Image.new("RGBA", (cw, ch), yellow_rgb)
            canvas_png = Image.composite(yellow_color_img, canvas_png, yellow_cr)
            
            # Pintar Grey
            grey_color_img = Image.new("RGBA", (cw, ch), grey_rgb)
            canvas_png = Image.composite(grey_color_img, canvas_png, grey_cr)
            
        # Stacked
        elif "stacked" in svg_filename:
            cw, ch = canvas_w, height_v
            canvas_png = Image.new("RGBA", (cw, ch), bg_color)
            
            is_neg = "negative" in svg_filename
            navy_rgb = (255, 255, 255, 255) if is_neg else (0, 31, 92, 255)
            yellow_rgb = (255, 193, 7, 255)
            grey_rgb = (255, 255, 255, 255) if is_neg else (71, 85, 105, 255)
            
            # Linha 1 (ESOL)
            navy_cr = Image.fromarray(navy_smooth)
            yellow_cr = Image.fromarray(yellow_smooth)
            
            # ENERGY
            energy_cr = Image.fromarray(energy_mask)
            # Tagline
            tagline_cr = Image.fromarray(tagline_mask)
            
            # Desenhar Navy deslocado (sh1, sv1)
            temp_navy = Image.new("RGBA", (cw, ch), (0,0,0,0))
            temp_navy_color = Image.new("RGBA", (cw, ch), navy_rgb)
            # Deslocar a mascara
            dx, dy = int(sh1), int(sv1)
            mask_shifted = Image.new("L", (cw, ch), 0)
            mask_shifted.paste(navy_cr, (dx, dy))
            canvas_png = Image.composite(temp_navy_color, canvas_png, mask_shifted)
            
            # Desenhar Yellow deslocado (sh1, sv1)
            temp_yellow_color = Image.new("RGBA", (cw, ch), yellow_rgb)
            mask_shifted_y = Image.new("L", (cw, ch), 0)
            mask_shifted_y.paste(yellow_cr, (dx, dy))
            canvas_png = Image.composite(temp_yellow_color, canvas_png, mask_shifted_y)
            
            # Desenhar ENERGY deslocado (sh2, sv2)
            temp_grey_color = Image.new("RGBA", (cw, ch), grey_rgb)
            mask_shifted_e = Image.new("L", (cw, ch), 0)
            mask_shifted_e.paste(energy_cr, (int(sh2), int(sv2)))
            canvas_png = Image.composite(temp_grey_color, canvas_png, mask_shifted_e)
            
            # Desenhar Tagline deslocado (sh3, sv3)
            mask_shifted_t = Image.new("L", (cw, ch), 0)
            mask_shifted_t.paste(tagline_cr, (int(sh3), int(sv3)))
            canvas_png = Image.composite(temp_grey_color, canvas_png, mask_shifted_t)
            
        # Brandmark
        else:
            cw, ch = box_sz, box_sz
            canvas_png = Image.new("RGBA", (cw, ch), bg_color)
            
            is_white = "white" in svg_filename
            color_rgb = (255, 255, 255, 255) if is_white else (255, 193, 7, 255)
            
            yellow_cr = Image.fromarray(yellow_smooth)
            temp_color = Image.new("RGBA", (cw, ch), color_rgb)
            
            mask_shifted = Image.new("L", (cw, ch), 0)
            mask_shifted.paste(yellow_cr, (int(sh_s), int(sv_s)))
            canvas_png = Image.composite(temp_color, canvas_png, mask_shifted)
            
        # Redimensionar para tamanho final limpo com Lanczos
        final_h = int(scale_down_w * (canvas_png.height / canvas_png.width))
        resized = canvas_png.resize((scale_down_w, final_h), Image.Resampling.LANCZOS)
        resized.save(out_png_path, "PNG")
        print(f"SUCCESS: PNG compiled: {out_png_path}")

    # Build de PNGs
    create_png_from_masks("esol-logo-horizontal.svg", os.path.join(output_png_dir, "esol-logo-horizontal.png"), scale_down_w=1200)
    create_png_from_masks("esol-logo-horizontal-negative.svg", os.path.join(output_png_dir, "esol-logo-horizontal-negative.png"), scale_down_w=1200)
    create_png_from_masks("esol-logo-stacked.svg", os.path.join(output_png_dir, "esol-logo-stacked.png"), scale_down_w=900)
    create_png_from_masks("esol-logo-stacked-negative.svg", os.path.join(output_png_dir, "esol-logo-stacked-negative.png"), scale_down_w=900)
    create_png_from_masks("esol-logo-brandmark.svg", os.path.join(output_png_dir, "esol-logo-brandmark.png"), scale_down_w=512)
    create_png_from_masks("esol-logo-brandmark-white.svg", os.path.join(output_png_dir, "esol-logo-brandmark-white.png"), scale_down_w=512)

    # ── 5. COMPILAR A FONTE CUSTOMIZADA ESOLDISPLAY (.TTF / .WOFF2) ──
    print("Compiling EsolDisplay custom font from perfect letter vectors...")
    
    # Unificar contornos do sol (esquerda e direita)
    sun_contours = []
    for s_elem in yellow_elements:
        sun_contours.append({"contour": s_elem["contour"], "is_hole": False})
        for ch in s_elem["children"]:
            sun_contours.append({"contour": ch, "is_hole": True})
            
    # Criar o mapa de glifos com as letras exatas da logo
    glyph_source = {
        "E": {"bbox": navy_elements[0]["bbox"], "contour_data": [{"contour": navy_elements[0]["contour"], "is_hole": False}] + [{"contour": ch, "is_hole": True} for ch in navy_elements[0]["children"]]},
        "S": {"bbox": navy_elements[1]["bbox"], "contour_data": [{"contour": navy_elements[1]["contour"], "is_hole": False}] + [{"contour": ch, "is_hole": True} for ch in navy_elements[1]["children"]]},
        "O": {"bbox": get_group_bbox(yellow_elements), "contour_data": sun_contours},
        "L": {"bbox": navy_elements[2]["bbox"], "contour_data": [{"contour": navy_elements[2]["contour"], "is_hole": False}] + [{"contour": ch, "is_hole": True} for ch in navy_elements[2]["children"]]},
        # Lowercase extraídos do ENERGY original
        "e": {"bbox": energy_elements[0]["bbox"], "contour_data": [{"contour": energy_elements[0]["contour"], "is_hole": False}] + [{"contour": ch, "is_hole": True} for ch in energy_elements[0]["children"]]},
        "n": {"bbox": energy_elements[1]["bbox"], "contour_data": [{"contour": energy_elements[1]["contour"], "is_hole": False}] + [{"contour": ch, "is_hole": True} for ch in energy_elements[1]["children"]]},
        "r": {"bbox": energy_elements[3]["bbox"], "contour_data": [{"contour": energy_elements[3]["contour"], "is_hole": False}] + [{"contour": ch, "is_hole": True} for ch in energy_elements[3]["children"]]}, # o segundo E e index 2, R e index 3
        "g": {"bbox": energy_elements[4]["bbox"], "contour_data": [{"contour": energy_elements[4]["contour"], "is_hole": False}] + [{"contour": ch, "is_hole": True} for ch in energy_elements[4]["children"]]},
        "y": {"bbox": energy_elements[5]["bbox"], "contour_data": [{"contour": energy_elements[5]["contour"], "is_hole": False}] + [{"contour": ch, "is_hole": True} for ch in energy_elements[5]["children"]]}
    }
    
    em_size = 1000
    fb = FontBuilder(em_size, isTTF=True)
    
    glyph_order = [".notdef", "space"] + list(glyph_source.keys())
    fb.setupGlyphOrder(glyph_order)
    
    cmap = {
        32: "space",
        69: "E", 83: "S", 79: "O", 76: "L",
        101: "e", 110: "n", 114: "r", 103: "g", 121: "y"
    }
    fb.setupCharacterMap(cmap)
    
    glyphs = {}
    # .notdef
    pen = TTGlyphPen(None)
    pen.moveTo((100, 0))
    pen.lineTo((100, 700))
    pen.lineTo((400, 700))
    pen.lineTo((400, 0))
    pen.closePath()
    pen.moveTo((150, 50))
    pen.lineTo((350, 50))
    pen.lineTo((350, 650))
    pen.lineTo((150, 650))
    pen.closePath()
    glyphs[".notdef"] = pen.glyph()
    
    # space
    pen = TTGlyphPen(None)
    glyphs["space"] = pen.glyph()
    
    metrics = {
        ".notdef": (500, 0),
        "space": (300, 0)
    }
    
    # Desenhar os glifos extraídos da geometria original
    for char, g_data in glyph_source.items():
        x1, y1, x2, y2 = g_data["bbox"]
        gw = x2 - x1
        gh = y2 - y1
        
        # Escalar para cap-height = 700
        scale_factor = 700.0 / gh
        
        pen = TTGlyphPen(None)
        
        for cd in g_data["contour_data"]:
            pts = cd["contour"].reshape(-1, 2)
            
            scaled_pts = []
            for px, py in pts:
                fx = int((px - x1) * scale_factor)
                # Inverter Y por conta do sistema de coordenadas de fonte (baseline y=0, cresce para cima)
                fy = int((y2 - py) * scale_factor)
                scaled_pts.append((fx, fy))
                
            if len(scaled_pts) < 3:
                continue
                
            # Forçar winding order correto (Externo = Horario, Furo = Anti-Horario)
            area = get_signed_area(scaled_pts)
            is_hole = cd["is_hole"]
            
            if not is_hole and area > 0:
                scaled_pts.reverse()
            elif is_hole and area < 0:
                scaled_pts.reverse()
                
            pen.moveTo(scaled_pts[0])
            for pt in scaled_pts[1:]:
                pen.lineTo(pt)
            pen.closePath()
            
        glyphs[char] = pen.glyph()
        
        # Calcular largura de avanço com espaçamento lateral proporcional (side bearings)
        advance_width = int(gw * scale_factor + 120)
        metrics[char] = (advance_width, 60)
        
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader()
    
    name_strings = {
        "familyName": "EsolDisplay",
        "styleName": "Regular",
        "uniqueFontIdentifier": "EsolDisplay-Regular:1.0.0",
        "fullName": "EsolDisplay-Regular",
        "psName": "EsolDisplay-Regular",
        "version": "Version 1.000"
    }
    fb.setupNameTable(name_strings)
    fb.setupOS2(sTypoAscender=800, sTypoDescender=-200, sxHeight=500, sCapHeight=700)
    fb.setupPost()
    
    # Salvar TTF
    ttf_out = os.path.join(output_fonts_dir, "EsolDisplay-Regular.ttf")
    fb.save(ttf_out)
    print(f"SUCCESS: EsolDisplay TTF saved to {ttf_out}")
    
    # Salvar WOFF2
    try:
        woff2_out = os.path.join(output_fonts_dir, "EsolDisplay-Regular.woff2")
        from fontTools.ttLib import TTFont
        font = TTFont(ttf_out)
        font.flavor = "woff2"
        font.save(woff2_out)
        print(f"SUCCESS: EsolDisplay WOFF2 saved to {woff2_out}")
    except Exception as e:
        print(f"Failed to compile WOFF2: {e}")

if __name__ == "__main__":
    build_perfect_brand_kit()
