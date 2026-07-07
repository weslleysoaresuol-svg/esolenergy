import cv2
from PIL import Image
import numpy as np

def scan_details():
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = (diff > 30).astype(np.uint8) * 255
    
    # Recortar o O original (Sol)
    sol_crop = mask[170:342, 525:728].copy()
    
    # Salvar a máscara pura do Sol para visualizarmos
    cv2.imwrite("C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/esol-logo-details-scan.png", sol_crop)
    
    # Preencher o rasgo diagonal de 45°
    # O rasgo fica no quadrante inferior direito. No recorte de 172x203,
    # vamos desenhar linhas brancas espessas para fechar o rasgo diagonal.
    # Coordenadas aproximadas do rasgo no crop: de (140, 110) a (190, 160)
    # Vamos preencher desenhando linhas brancas
    filled_sol = sol_crop.copy()
    cv2.line(filled_sol, (130, 100), (195, 165), 255, 20)
    
    # Salvar a imagem com o rasgo fechado
    cv2.imwrite("C:/Users/wesll/.gemini/antigravity-ide/brain/31fb6ffb-176c-4451-80ba-b3b29c2ddcff/esol-logo-details-scan-pure.png", filled_sol)
    
    # Achar contornos na imagem preenchida
    contours, _ = cv2.findContours(filled_sol, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    print(f"Encontrados {len(contours)} contornos no Sol preenchido:")
    for idx, c in enumerate(contours):
        area = cv2.contourArea(c)
        print(f"  Contorno {idx}: Área = {area:.1f} | Pontos = {len(c)}")

if __name__ == "__main__":
    scan_details()
