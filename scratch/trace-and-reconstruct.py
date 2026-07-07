import os
import math
import numpy as np
import cv2
from PIL import Image

def contour_to_svg_path(contour):
    path = []
    for i, pt in enumerate(contour):
        x, y = pt[0]
        if i == 0:
            path.append(f"M{x:.1f} {y:.1f}")
        else:
            path.append(f"L{x:.1f} {y:.1f}")
    path.append("Z")
    return " ".join(path)

def trace_and_reconstruct():
    print("Iniciando vetorização analítica direta da logo original...")
    
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = (diff > 30).astype(np.uint8) * 255
    
    # Parâmetros de inclinação medidos
    slant_tan = 0.245
    
    # Vamos criar um dicionário de caminhos SVG vetorizados
    svg_paths = {}
    
    # 1. Vetorizar E
    # Bounding box original do E: X=156 a 344, Y=174 a 340
    E_crop = mask[174:340, 156:344]
    contours_E, _ = cv2.findContours(E_crop, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # Pegar o maior contorno
    c_E = max(contours_E, key=cv2.contourArea)
    # Simplificar com approxPolyDP para linhas retas perfeitas
    # Epsilon de 1.5 a 2.0 remove todo o serrilhado de pixel e gera retas perfeitas
    approx_E = cv2.approxPolyDP(c_E, 1.8, True)
    
    # Aplicar o offset de posicionamento original (156, 174)
    approx_E[:, 0, 0] += 156
    approx_E[:, 0, 1] += 174
    svg_paths["E"] = contour_to_svg_path(approx_E)
    print(f"Letra E vetorizada com {len(approx_E)} pontos.")
    
    # 2. Vetorizar S
    # Bounding box do S: X=330 a 528, Y=174 a 340
    S_crop = mask[174:340, 330:528]
    contours_S, _ = cv2.findContours(S_crop, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c_S = max(contours_S, key=cv2.contourArea)
    approx_S = cv2.approxPolyDP(c_S, 0.8, True) # Epsilon menor para manter a curva suave
    approx_S[:, 0, 0] += 330
    approx_S[:, 0, 1] += 174
    svg_paths["S"] = contour_to_svg_path(approx_S)
    print(f"Letra S vetorizada com {len(approx_S)} pontos.")
    
    # 3. Construir O (Normal) como uma Elipse Rotacionada Real (Rotated Ellipse)
    # Ajustando ao centro real da logo (620.1, 251.9) com os diâmetros exatos (206px x 173.6px)
    cx_o, cy_o = 620.1, 251.9
    rx_out, ry_out = 103.0, 86.8
    rx_in, ry_in = 103.0 - 44.0, 86.8 - 44.0
    
    def make_rotated_ellipse_path(cx, cy, rx, ry, angle_deg):
        pts = []
        num_pts = 120
        angle_rad = math.radians(angle_deg)
        cos_a = math.cos(angle_rad)
        sin_a = math.sin(angle_rad)
        for i in range(num_pts):
            theta = i * 2 * math.pi / num_pts
            x = rx * math.cos(theta)
            y = ry * math.sin(theta)
            # Rotação anti-horária/horária em Y-down
            x_rot = x * cos_a - y * sin_a
            y_rot = x * sin_a + y * cos_a
            pts.append(f"{cx + x_rot:.1f} {cy + y_rot:.1f}")
        return "M " + " L ".join(pts) + " Z"
        
    path_O_out = make_rotated_ellipse_path(cx_o, cy_o, rx_out, ry_out, 13.76)
    path_O_in = make_rotated_ellipse_path(cx_o, cy_o, rx_in, ry_in, 13.76)
    svg_paths["O"] = path_O_out + " " + path_O_in
    print("Letra O (Normal) construída via elipse rotacionada de alta precisão.")
    
    # 4. Vetorizar L
    # Bounding box do L: X=728 a 885, Y=174 a 340
    L_crop = mask[174:340, 728:885]
    contours_L, _ = cv2.findContours(L_crop, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c_L = max(contours_L, key=cv2.contourArea)
    approx_L = cv2.approxPolyDP(c_L, 1.8, True)
    approx_L[:, 0, 0] += 728
    approx_L[:, 0, 1] += 174
    svg_paths["L"] = contour_to_svg_path(approx_L)
    print(f"Letra L vetorizada com {len(approx_L)} pontos.")
    
    # 5. Vetorizar ENERGY (E, N, E, R, G, Y)
    energy_letters = ["e", "n", "e2", "r", "g", "y"]
    energy_bboxes = [
        (196, 376, 258, 423),  # E
        (303, 376, 379, 423),  # N
        (432, 376, 493, 423),  # E
        (541, 376, 608, 423),  # R
        (658, 374, 725, 424),  # G
        (774, 376, 837, 423)   # Y
    ]
    
    for idx, (x1, y1, x2, y2) in enumerate(energy_bboxes):
        letra_crop = mask[y1:y2, x1:x2]
        contours, _ = cv2.findContours(letra_crop, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        path_segments = []
        for c_letra in contours:
            if cv2.contourArea(c_letra) > 1: # Capturar até contornos bem pequenos das letras do ENERGY
                approx = cv2.approxPolyDP(c_letra, 0.5, True)
                approx[:, 0, 0] += x1
                approx[:, 0, 1] += y1
                path_segments.append(contour_to_svg_path(approx))
                
        svg_paths[energy_letters[idx]] = " ".join(path_segments)
        print(f"ENERGY Letra '{energy_chars_name(idx)}' vetorizada com {len(contours)} contornos.")
        
    # --- SALVAR O NOVO LOGOTIPO VETORIAL TRACED ---
    # Sem slogan, sem cores internas, apenas o contorno de largura 2px
    esol_paths = ""
    for c in ["E", "S", "O", "L"]:
        esol_paths += f'  <path d="{svg_paths[c]}" />\n'
        
    energy_paths = ""
    for c in energy_letters:
        energy_paths += f'  <path d="{svg_paths[c]}" />\n'
        
    # Usaremos viewBox="0 0 1024 682" (tamanho da imagem original)
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 682" width="100%" height="100%">
  <!-- ESOL (Contornos Traced) -->
  <g fill="none" stroke="#001F5C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
{esol_paths}
  </g>
  <!-- ENERGY (Contornos Traced) -->
  <g fill="none" stroke="#475569" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
{energy_paths}
  </g>
</svg>"""

    with open("public/brand-kit/1. Web-SVG/esol-logo-outline-temp.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("SVG contornado gerado a partir do rastreamento direto!")

def energy_chars_name(idx):
    chars = ["E", "N", "E", "R", "G", "Y"]
    return chars[idx]

if __name__ == "__main__":
    trace_and_reconstruct()
