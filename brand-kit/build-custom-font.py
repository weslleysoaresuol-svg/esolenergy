import os
import cv2
import numpy as np
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

def build_font():
    # Carregar a partir do PNG transparente master ja reconstruido com alta nitidez e Faux Bold!
    img_path = "src/assets/esol-logo-transparent.png"
    output_dir = "public/fonts"
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return
        
    print(f"Loading {img_path} and isolating glyphs from alpha channel...")
    # Carregar com IMREAD_UNCHANGED para ler o canal alpha
    img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
    h, w, c = img.shape
    
    # Extrair canal alpha e limiarizar
    alpha = img[:, :, 3]
    _, thresh = cv2.threshold(alpha, 120, 255, cv2.THRESH_BINARY)
    
    # Encontrar contornos
    contours, hierarchy = cv2.findContours(thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)
    
    if not contours:
        print("Error: No contours found in logo.")
        return
        
    print(f"Found {len(contours)} raw contours. Filtering and grouping...")
    
    # Primeiro listamos os contornos externos (parent == -1)
    outer_contours = []
    for i, c_item in enumerate(contours):
        h_info = hierarchy[0][i]
        parent = h_info[3]
        if parent == -1: # Contorno externo
            x, y, gw, gh = cv2.boundingRect(c_item)
            area = cv2.contourArea(c_item)
            # Filtrar ruidos
            if area > 100 and gh > 15:
                outer_contours.append({
                    "index": i,
                    "contour": c_item,
                    "bbox": [x, y, x + gw, y + gh],
                    "children": []
                })
                
    # Adicionar os buracos (filhos) correspondentes
    for i, c_item in enumerate(contours):
        h_info = hierarchy[0][i]
        parent = h_info[3]
        if parent != -1: # E um buraco
            for parent_glyph in outer_contours:
                if parent_glyph["index"] == parent:
                    parent_glyph["children"].append(c_item)
                    break
                    
    print(f"Detected {len(outer_contours)} valid outer glyph elements.")
    
    # Separar por linhas usando Y center do PNG transparente
    # Linha 1 (ESOL): cy < 340
    # Linha 2 (ENERGY): 340 <= cy < 510
    line1 = []
    line2 = []
    
    for g in outer_contours:
        x1, y1, x2, y2 = g["bbox"]
        cy = (y1 + y2) / 2
        if cy < 340:
            line1.append(g)
        elif 340 <= cy < 510:
            line2.append(g)
            
    # Ordenar cada linha da esquerda para a direita (por X1)
    line1.sort(key=lambda item: item["bbox"][0])
    line2.sort(key=lambda item: item["bbox"][0])
    
    print(f"Line 1 (ESOL) raw elements count: {len(line1)}")
    print(f"Line 2 (ENERGY) raw elements count: {len(line2)}")
    
    if len(line1) != 5:
        print(f"Error: Line 1 should have exactly 5 elements (E, S, Sun1, Sun2, L). Found {len(line1)}")
        return
    if len(line2) != 6:
        print(f"Error: Line 2 should have exactly 6 elements (E, N, E, R, G, Y). Found {len(line2)}")
        return
        
    # Consolidar as letras de forma deterministica
    esol_letters = []
    # E
    esol_letters.append({
        "bbox": line1[0]["bbox"],
        "contours": [{"points": line1[0]["contour"], "is_hole": False}] + [{"points": ch, "is_hole": True} for ch in line1[0]["children"]]
    })
    # S
    esol_letters.append({
        "bbox": line1[1]["bbox"],
        "contours": [{"points": line1[1]["contour"], "is_hole": False}] + [{"points": ch, "is_hole": True} for ch in line1[1]["children"]]
    })
    # O (Sun: combina os dois crescentes line1[2] e line1[3])
    sun1 = line1[2]
    sun2 = line1[3]
    min_x = min(sun1["bbox"][0], sun2["bbox"][0])
    min_y = min(sun1["bbox"][1], sun2["bbox"][1])
    max_x = max(sun1["bbox"][2], sun2["bbox"][2])
    max_y = max(sun1["bbox"][3], sun2["bbox"][3])
    sun_contours = []
    sun_contours.append({"points": sun1["contour"], "is_hole": False})
    for ch in sun1["children"]:
        sun_contours.append({"points": ch, "is_hole": True})
    sun_contours.append({"points": sun2["contour"], "is_hole": False})
    for ch in sun2["children"]:
        sun_contours.append({"points": ch, "is_hole": True})
        
    esol_letters.append({
        "bbox": [min_x, min_y, max_x, max_y],
        "contours": sun_contours
    })
    # L
    esol_letters.append({
        "bbox": line1[4]["bbox"],
        "contours": [{"points": line1[4]["contour"], "is_hole": False}] + [{"points": ch, "is_hole": True} for ch in line1[4]["children"]]
    })
    
    # Consolidar letras da linha 2 (ENERGY)
    energy_letters = []
    for g in line2:
        energy_letters.append({
            "bbox": g["bbox"],
            "contours": [{"points": g["contour"], "is_hole": False}] + [{"points": ch, "is_hole": True} for ch in g["children"]]
        })
        
    print(f"Consolidated Line 1 letters: {len(esol_letters)}")
    print(f"Consolidated Line 2 letters: {len(energy_letters)}")
    
    # Criar o mapa de glifos final
    glyph_source = {
        "E": esol_letters[0],
        "S": esol_letters[1],
        "O": esol_letters[2],
        "L": esol_letters[3],
        "e": energy_letters[0],
        "n": energy_letters[1],
        "r": energy_letters[3], # energy_letters[2] e o segundo E
        "g": energy_letters[4],
        "y": energy_letters[5]
    }
    
    # 4. Configurar FontBuilder
    em_size = 1000
    fb = FontBuilder(em_size, isTTF=True)
    
    # Ordem dos glifos
    glyph_order = [".notdef", "space"] + list(glyph_source.keys())
    fb.setupGlyphOrder(glyph_order)
    
    # Mapeamento Unicode
    cmap = {
        32: "space",
        69: "E",
        83: "S",
        79: "O",
        76: "L",
        101: "e",
        110: "n",
        114: "r",
        103: "g",
        121: "y"
    }
    fb.setupCharacterMap(cmap)
    
    glyphs = {}
    
    # 4.1 .notdef
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
    
    # 4.2 space
    pen = TTGlyphPen(None)
    glyphs["space"] = pen.glyph()
    
    metrics = {
        ".notdef": (500, 0),
        "space": (300, 0)
    }
    
    # 4.3 Desenhar os glifos extraidos
    for char, g_data in glyph_source.items():
        x1, y1, x2, y2 = g_data["bbox"]
        gw = x2 - x1
        gh = y2 - y1
        
        scale_factor = 700.0 / gh
        
        pen = TTGlyphPen(None)
        
        for contour in g_data["contours"]:
            pts = contour["points"].reshape(-1, 2)
            
            scaled_pts = []
            for px, py in pts:
                fx = int((px - x1) * scale_factor)
                fy = int((y2 - py) * scale_factor)
                scaled_pts.append((fx, fy))
                
            if len(scaled_pts) < 3:
                continue
                
            # Forçar winding order correto (Externo = Horario, Furo = Anti-Horario)
            area = get_signed_area(scaled_pts)
            is_hole = contour["is_hole"]
            
            if not is_hole and area > 0:
                scaled_pts.reverse()
            elif is_hole and area < 0:
                scaled_pts.reverse()
                
            pen.moveTo(scaled_pts[0])
            for pt in scaled_pts[1:]:
                pen.lineTo(pt)
            pen.closePath()
            
        glyphs[char] = pen.glyph()
        
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
    ttf_out = os.path.join(output_dir, "EsolDisplay-Regular.ttf")
    fb.save(ttf_out)
    print(f"SUCCESS: Custom TTF compiled and saved to {ttf_out}")
    
    # Salvar WOFF2
    try:
        woff2_out = os.path.join(output_dir, "EsolDisplay-Regular.woff2")
        from fontTools.ttLib import TTFont
        font = TTFont(ttf_out)
        font.flavor = "woff2"
        font.save(woff2_out)
        print(f"SUCCESS: Custom WOFF2 compiled and saved to {woff2_out}")
    except Exception as e:
        print(f"Failed to save WOFF2: {e}")

if __name__ == "__main__":
    build_font()
