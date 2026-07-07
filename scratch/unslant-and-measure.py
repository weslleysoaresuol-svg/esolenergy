import os
import math
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def measure_unslanted():
    print("Iniciando escaneamento com desinclinação matemática (unslanting)...")
    
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = diff > 30
    
    # Parâmetros de inclinação
    slant_tan = 0.245  # dx/dy
    
    # 1. Desinclinar a imagem inteira para medição retilínea precisa
    h_img, w_img = mask.shape
    unslanted_mask = np.zeros_like(mask)
    
    for y in range(h_img):
        # Deslocamento x baseado na altura em relação à base de ESOL (Y=342)
        # Para Y > 342 (ENERGY), usamos a base do ENERGY (Y=424)
        if y < 343:
            dx_slant = int((342 - y) * slant_tan)
        else:
            dx_slant = int((424 - y) * slant_tan)
            
        for x in range(w_img):
            new_x = x - dx_slant
            if 0 <= new_x < w_img:
                unslanted_mask[y, new_x] = mask[y, x]
                
    # 2. Medir cada caractere desinclinado
    # ESOL Bounding Boxes desinclinadas (Y de 170 a 342)
    esol_un_line = unslanted_mask[170:342, :]
    col_sums = np.sum(esol_un_line, axis=0)
    
    # Achar limites horizontais das letras
    letters_x = []
    in_letter = False
    start_x = 0
    for x in range(len(col_sums)):
        if col_sums[x] > 0 and not in_letter:
            start_x = x
            in_letter = True
        elif col_sums[x] == 0 and in_letter:
            letters_x.append((start_x, x - 1))
            in_letter = False
            
    print("ESOL Letras Desinclinadas:")
    for idx, (x1, x2) in enumerate(letters_x):
        char_mask = esol_un_line[:, x1:x2+1]
        ch, cw = char_mask.shape
        print(f"Letra {idx} desinclinada: X={x1} a {x2} (Largura = {cw}px, Altura = {ch}px)")
        
        # Se for a Letra E (índice 0), vamos analisar as espessuras dos traços horizontais e verticais
        if idx == 0:
            # Espessura da haste vertical (média dos primeiros pixels sólidos)
            # Medindo a haste na metade da altura
            row = ch // 2
            run_x = np.where(char_mask[row, :])[0]
            if len(run_x) > 0:
                print(f"  Espessura Haste Vertical (E): {run_x[-1] - run_x[0] + 1}px")
            
            # Espessura dos 3 braços horizontais (tirando uma fatia na vertical na direita do E)
            slice_y = char_mask[:, cw - 20]
            runs_y = []
            cur_run = slice_y[0]
            run_len = 1
            run_start = 0
            for y in range(1, ch):
                if slice_y[y] == cur_run:
                    run_len += 1
                else:
                    runs_y.append((cur_run, run_start, run_len))
                    cur_run = slice_y[y]
                    run_start = y
                    run_len = 1
            runs_y.append((cur_run, run_start, run_len))
            
            print("  Estrutura Vertical do E (Braços e Vãos):")
            for val, start, length in runs_y:
                state = "Braço" if val else "Vão"
                print(f"    {state}: Y={170+start} a {170+start+length-1} (Altura = {length}px)")

if __name__ == "__main__":
    measure_unslanted()
