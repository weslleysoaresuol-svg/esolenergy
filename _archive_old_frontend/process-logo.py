import os
from PIL import Image

def make_logo_transparent_and_cropped():
    input_path = "src/assets/esol-logo.png"
    output_path = "src/assets/esol-logo-transparent.png"
    
    if not os.path.exists(input_path):
        print(f"ERROR: Arquivo original nao encontrado em: {input_path}")
        return
        
    print(f"Reading original logo from: {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    # 1. Remover o fundo branco/claro
    new_data = []
    for item in datas:
        # Se os pixels forem muito próximos do branco (valores de R, G, B > 240)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0)) # Torna 100% transparente
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # 2. Fazer o autocrop (remover as margens vazias ao redor do logotipo)
    # getbbox() encontra as coordenadas minimas e maximas de pixels nao transparentes
    bbox = img.getbbox()
    if bbox:
        print(f"Autocropping logo bounding box: {bbox}...")
        img_cropped = img.crop(bbox)
        # Adicionar um pequeno padding de 4px nas laterais para nao cortar a borda dos caracteres
        padding = 4
        new_width = img_cropped.width + (padding * 2)
        new_height = img_cropped.height + (padding * 2)
        
        padded_img = Image.new("RGBA", (new_width, new_height), (255, 255, 255, 0))
        padded_img.paste(img_cropped, (padding, padding))
        padded_img.save(output_path, "PNG")
        print(f"SUCCESS: Logo transparente e recortada gerada em: {output_path}")
    else:
        img.save(output_path, "PNG")
        print(f"SUCCESS: Logo transparente gerada em: {output_path} (sem crop)")

if __name__ == "__main__":
    make_logo_transparent_and_cropped()
