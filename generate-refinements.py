import os

def refine_logos():
    input_path = "src/assets/esol-logo.svg"
    negative_path = "src/assets/esol-logo-negative.svg"
    
    if not os.path.exists(input_path):
        print(f"ERROR: Logo SVG nao encontrada em: {input_path}")
        return
        
    print("Reading esol-logo.svg...")
    with open(input_path, "r", encoding="utf-8") as f:
        svg_content = f.read()
        
    # 1. Adicionar geometricPrecision na logo principal para suavizar as bordas
    # Modifica a tag <svg para incluir as propriedades de renderizacao geometricPrecision
    refined_svg = svg_content.replace(
        '<svg xmlns="http://www.w3.org/2000/svg"',
        '<svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"'
    )
    
    with open(input_path, "w", encoding="utf-8") as f:
        f.write(refined_svg)
    print("SUCCESS: geometricPrecision adicionado a esol-logo.svg")
    
    # 2. Gerar a logo negativa premium (texto branco/prata + sol amarelo)
    negative_svg = refined_svg.replace(
        ".esol-navy { fill: #001046; }",
        ".esol-navy { fill: #FFFFFF; }"
    ).replace(
        ".esol-gray { fill: #6B7280; }",
        ".esol-gray { fill: #E5E7EB; }"
    )
    
    with open(negative_path, "w", encoding="utf-8") as f:
        f.write(negative_svg)
    print(f"SUCCESS: Logo negativa premium criada em: {negative_path}")

if __name__ == "__main__":
    refine_logos()
