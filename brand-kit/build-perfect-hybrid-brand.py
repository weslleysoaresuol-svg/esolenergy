import os
import re
import xml.etree.ElementTree as ET
import vtracer

def build_hybrid_svgs():
    print("Iniciando reconstrução híbrida de alta fidelidade...")
    input_png = "src/assets/esol-logo.png"
    tmp_svg = "brand-kit/tmp_raw_vtracer.svg"
    
    # Passo 1: Vetorização VTracer (Splines Reais de Bézier)
    vtracer.convert_image_to_svg_py(
        input_png,
        tmp_svg,
        colormode='color',
        hierarchical='stacked',
        mode='spline',
        filter_speckle=10,
        color_precision=8,
        layer_difference=16,
        corner_threshold=60,
        length_threshold=4.0,
        max_iterations=10,
        splice_threshold=45,
        path_precision=3
    )
    print("VTracer spline generation complete.")

    # Passo 2: Parse and Clean the XML
    ET.register_namespace('', "http://www.w3.org/2000/svg")
    tree = ET.parse(tmp_svg)
    root = tree.getroot()
    
    # Remove the large background rect if vtracer added it (usually the first element with size matching viewport)
    # Background is often #FAFAFA or #FFFFFF or #E0E1E1 in Vtracer if not transparent.
    # In esol-logo.png it is transparent, but Vtracer might see checkerboard or make a solid bg.
    
    # We will identify paths by their translation.
    # vtracer puts paths like: <path d="..." transform="translate(x,y)" fill="#HEX"/>
    
    paths_to_remove = []
    navy_paths = []
    yellow_paths = []
    energy_paths = []
    
    for path in root.findall('{http://www.w3.org/2000/svg}path'):
        fill = path.get('fill', '').upper()
        transform = path.get('transform', '')
        
        # Check if background
        if fill in ['#FAFAFA', '#FFFFFF', '#000000', '#E0E1E1', '#E5E5E5']:
            paths_to_remove.append(path)
            continue
            
        # Extract Y from transform="translate(x,y)"
        y_val = 0
        x_val = 0
        m = re.search(r'translate\(([^,]+),([^)]+)\)', transform)
        if m:
            x_val = float(m.group(1))
            y_val = float(m.group(2))
            
        # Classify by color or position
        # Navy: #001F5C or similar
        # Yellow: #FFC107 or similar
        # Grey: #475569 or similar
        
        # We delete all grey paths that are below Y=400 (which is the Tagline)
        # Original image is 1024x682. Tagline is at bottom.
        
        # Convert colors (vtracer might output slightly off colors)
        def hex_to_rgb(h):
            h = h.lstrip('#')
            if len(h) != 6: return (0,0,0)
            return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
            
        rgb = hex_to_rgb(fill)
        r, g, b = rgb
        
        if r < 80 and g < 80 and b > 40: # Navy
            path.set('fill', '#001F5C')
            navy_paths.append(path)
        elif r > 180 and g > 130 and b < 100: # Yellow
            path.set('fill', '#FFC107')
            yellow_paths.append(path)
        else: # Grey
            path.set('fill', '#475569')
            if y_val > 400: # Tagline paths!
                paths_to_remove.append(path)
            else:
                energy_paths.append(path)

    for p in paths_to_remove:
        root.remove(p)
        
    print(f"Removed {len(paths_to_remove)} paths (background + dirty tagline).")
    
    # Passo 3: Injetar a Tagline em Texto Nativo
    # Add Google Fonts style
    defs = ET.Element('{http://www.w3.org/2000/svg}defs')
    style = ET.Element('{http://www.w3.org/2000/svg}style')
    style.text = """
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap');
      .tagline {
        font-family: 'Montserrat', sans-serif;
        font-weight: 500;
        font-size: 38px;
        letter-spacing: 2px;
      }
    """
    defs.append(style)
    root.insert(0, defs)
    
    text_elem = ET.Element('{http://www.w3.org/2000/svg}text')
    text_elem.set('x', '110')
    text_elem.set('y', '545')
    text_elem.set('fill', '#475569')
    text_elem.set('class', 'tagline')
    text_elem.text = "Deixe o sol trabalhar por voc\u00ea."
    root.append(text_elem)
    
    # Salvar Horizontal SVG
    os.makedirs("public/brand-kit/1. Web-SVG", exist_ok=True)
    os.makedirs("src/assets", exist_ok=True)
    
    tree.write("public/brand-kit/1. Web-SVG/esol-logo-horizontal.svg", encoding="utf-8", xml_declaration=True)
    tree.write("src/assets/esol-logo.svg", encoding="utf-8", xml_declaration=True)
    
    # Gerar Horizontal Negativa
    for p in navy_paths: p.set('fill', '#FFFFFF')
    for p in energy_paths: p.set('fill', '#FFFFFF')
    text_elem.set('fill', '#FFFFFF')
    
    tree.write("public/brand-kit/1. Web-SVG/esol-logo-horizontal-negative.svg", encoding="utf-8", xml_declaration=True)
    tree.write("src/assets/esol-logo-negative.svg", encoding="utf-8", xml_declaration=True)
    
    # Gerar Brandmark (Apenas o Sol)
    root_bm = ET.Element('{http://www.w3.org/2000/svg}svg', attrib={'viewBox': '370 0 250 250', 'width': '100%', 'height': '100%', 'xmlns': 'http://www.w3.org/2000/svg'})
    # As the original logo is 1024x682 and the O is centered around X=400..600 Y=0..200
    for yp in yellow_paths:
        p_copy = ET.fromstring(ET.tostring(yp))
        root_bm.append(p_copy)
        
    tree_bm = ET.ElementTree(root_bm)
    tree_bm.write("public/brand-kit/1. Web-SVG/esol-logo-brandmark.svg", encoding="utf-8", xml_declaration=True)
    
    # Brandmark White
    for yp in root_bm.findall('{http://www.w3.org/2000/svg}path'):
        yp.set('fill', '#FFFFFF')
    tree_bm.write("public/brand-kit/1. Web-SVG/esol-logo-brandmark-white.svg", encoding="utf-8", xml_declaration=True)
    
    # Cleanup temp file
    os.remove(tmp_svg)
    print("All precise Hybrid SVGs generated successfully!")

if __name__ == "__main__":
    build_hybrid_svgs()
