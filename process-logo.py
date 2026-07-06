import os
from PIL import Image

def make_logo_transparent():
    input_path = "src/assets/esol-logo.png"
    output_path = "src/assets/esol-logo-transparent.png"
    
    if not os.path.exists(input_path):
        print(f"ERROR: Arquivo original nao encontrado em: {input_path}")
        return
        
    print(f"Reading original logo from: {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Se os pixels forem muito próximos do branco (valores de R, G, B > 240)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0)) # Torna 100% transparente
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"SUCCESS: Logo transparente gerada em: {output_path}")

if __name__ == "__main__":
    make_logo_transparent()
