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

def test_o_traced():
    print("Testando vetorização direta do O...")
    
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = (diff > 30).astype(np.uint8) * 255
    
    # 1. Recortar e preencher a diagonal do Sol O
    sol_crop = mask[170:342, 525:728].copy()
    cv2.line(sol_crop, (130, 100), (195, 165), 255, 20)
    
    # Achar os contornos
    contours, _ = cv2.findContours(sol_crop, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filtrar contornos maiores
    large_contours = [c for c in contours if cv2.contourArea(c) > 100]
    # Classificar por área decrescente (primeiro externo, segundo interno)
    large_contours = sorted(large_contours, key=cv2.contourArea, reverse=True)
    
    print(f"Número de contornos válidos encontrados no Sol O: {len(large_contours)}")
    
    o_paths = []
    for idx, c in enumerate(large_contours[:2]): # Pegar os 2 maiores (externo e interno)
        approx = cv2.approxPolyDP(c, 0.8, True)
        approx[:, 0, 0] += 525
        approx[:, 0, 1] += 170
        o_paths.append(contour_to_svg_path(approx))
        print(f"  Contorno O [{idx}]: {len(approx)} pontos.")
        
    svg_paths_o = " ".join(o_paths)
    
    # Ler outros caminhos de trace-and-reconstruct.py
    # Vamos rodar o trace-and-reconstruct.py, mas modificando a lógica do O para usar este contorno direto!
    print("Vetorização do O com contorno real concluída!")

if __name__ == "__main__":
    test_o_traced()
