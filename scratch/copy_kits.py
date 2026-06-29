import shutil
import os

origem_dir = r"C:\Users\wesll\.gemini\antigravity-ide\brain\31fb6ffb-176c-4451-80ba-b3b29c2ddcff"
destino_dir = r"d:\Projetos Lovable\Esol Energy\esolenergy\public\kits"

os.makedirs(destino_dir, exist_ok=True)

mapa_copias = {
    "kit_residencial_pequeno_1782699227854.png": "kit-residencial-pequeno.png",
    "kit_residencial_grande_1782699242477.png": "kit-residencial-grande.png",
    "kit_comercial_industrial_1782699255001.png": "kit-comercial-industrial.png",
    "kit_rural_1782699269504.png": "kit-rural.png"
}

print("Iniciando cópia de imagens...")
for arq_orig, arq_dest in mapa_copias.items():
    caminho_orig = os.path.join(origem_dir, arq_orig)
    caminho_dest = os.path.join(destino_dir, arq_dest)
    
    if os.path.exists(caminho_orig):
        try:
            shutil.copy2(caminho_orig, caminho_dest)
            print(f"Copiado com sucesso: {arq_orig} -> {arq_dest}")
        except Exception as e:
            print(f"Erro ao copiar {arq_orig}: {e}")
    else:
        print(f"Arquivo de origem não encontrado: {arq_orig}")

print("Lista de arquivos no destino:")
print(os.listdir(destino_dir))
