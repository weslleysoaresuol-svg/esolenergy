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
    
    # 3. Vetorizar O (Normal) Diretamente do Sol Original Fechando a Diagonal
    # Recortar e preencher a diagonal do Sol O
    sol_crop = mask[170:342, 525:728].copy()
    cv2.line(sol_crop, (130, 100), (195, 165), 255, 20)
    
    # Achar os contornos
    contours_O, _ = cv2.findContours(sol_crop, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    # Pegar os dois contornos maiores (externo e interno)
    large_contours_O = [c for c in contours_O if cv2.contourArea(c) > 100]
    large_contours_O = sorted(large_contours_O, key=cv2.contourArea, reverse=True)
    
    o_paths = []
    for idx, c in enumerate(large_contours_O[:2]):
        approx_O = cv2.approxPolyDP(c, 0.8, True)
        approx_O[:, 0, 0] += 525
        approx_O[:, 0, 1] += 170
        o_paths.append(contour_to_svg_path(approx_O))
        
    svg_paths["O"] = " ".join(o_paths)
    print("Letra O (Normal) vetorizada diretamente a partir do Sol original fechado.")
    
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
