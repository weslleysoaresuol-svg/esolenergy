import os
from PIL import Image

def vectorize_logo():
    input_path = "src/assets/esol-logo-transparent.png"
    output_path = "src/assets/esol-logo.svg"
    
    if not os.path.exists(input_path):
        print(f"ERROR: Logo transparente nao encontrada em: {input_path}")
        return
        
    print("Vectorizing transparent logo...")
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    
    # Listas de caminhos por categoria de cor
    navy_runs = []
    yellow_runs = []
    gray_runs = []
    
    for y in range(height):
        x = 0
        while x < width:
            r, g, b, a = img.getpixel((x, y))
            if a > 50: # Pixel nao transparente
                start_x = x
                # Classificar a cor do pixel
                # Amarelo/Dourado: Alto R e G, baixo B (ex: #FFC107)
                is_yellow = (r > 180 and g > 130 and b < 100)
                # Cinza: R, G, B proximos e na faixa media (ex: #6B7280)
                is_gray = (abs(r - g) < 25 and abs(r - b) < 25 and 100 <= r <= 180)
                
                # Agrupar pixels da mesma classe na linha
                while x < width:
                    pr, pg, pb, pa = img.getpixel((x, y))
                    if pa <= 50:
                        break
                    p_yellow = (pr > 180 and pg > 130 and pb < 100)
                    p_gray = (abs(pr - pg) < 25 and abs(pr - pb) < 25 and 100 <= pr <= 180)
                    
                    if is_yellow != p_yellow or is_gray != p_gray:
                        break
                    x += 1
                
                end_x = x
                run_length = end_x - start_x
                # Adicionar retangulo de vetor
                rect_str = f"M{start_x},{y}h{run_length}v1h-{run_length}z"
                if is_yellow:
                    yellow_runs.append(rect_str)
                elif is_gray:
                    gray_runs.append(rect_str)
                else:
                    navy_runs.append(rect_str)
            else:
                x += 1
                
    # Gerar o arquivo SVG com classes CSS para controle dinamico de cores
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
  <style>
    .esol-navy {{ fill: #001046; }}
    .esol-yellow {{ fill: #FFC107; }}
    .esol-gray {{ fill: #6B7280; }}
    
    /* Regras dinamicas para modo escuro ou marcas especificas */
    .theme-dark .esol-navy {{ fill: #FFFFFF; }}
    .theme-dark .esol-gray {{ fill: #E5E7EB; }}
  </style>
  <g class="esol-logo-group">
    <path class="esol-navy" d="{" ".join(navy_runs)}" />
    <path class="esol-yellow" d="{" ".join(yellow_runs)}" />
    <path class="esol-gray" d="{" ".join(gray_runs)}" />
  </g>
</svg>
'''
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
        
    print(f"SUCCESS: Logo vetorizada gerada em: {output_path}")

if __name__ == "__main__":
    vectorize_logo()
