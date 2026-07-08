import cv2
import numpy as np
import os
import math

def get_signed_area(pts):
    area = 0.0
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        area += x1 * y2 - x2 * y1
    return 0.5 * area

def is_segment_straight(points, tolerance=1.0):
    P0 = points[0]
    P3 = points[-1]
    n = len(points)
    if n <= 2:
        return True
    v = P3 - P0
    v_norm = np.linalg.norm(v)
    if v_norm < 1e-5:
        return True
    distances = np.abs(np.cross(points - P0, v)) / v_norm
    return np.max(distances) <= tolerance

def fit_bezier(points, error_threshold=1.0):
    P0 = points[0]
    P3 = points[-1]
    n = len(points)
    if n <= 2:
        return [("L", P3)]
        
    # Chord length parameterization
    dists = np.linalg.norm(points[1:] - points[:-1], axis=1)
    chord_lengths = np.concatenate(([0], np.cumsum(dists)))
    total_len = chord_lengths[-1]
    if total_len < 1e-5:
        return [("L", P3)]
    t = chord_lengths / total_len
    
    # B(t) = (1-t)^3 * P0 + 3(1-t)^2*t * P1 + 3(1-t)*t^2 * P2 + t^3 * P3
    A = 3 * (1 - t)**2 * t
    B = 3 * (1 - t) * t**2
    C = points - ((1 - t)**3)[:, None] * P0 - (t**3)[:, None] * P3
    
    M = np.column_stack((A, B))
    
    # Solve least squares for X and Y coordinates
    P1_x, P2_x = np.linalg.lstsq(M, C[:, 0], rcond=None)[0]
    P1_y, P2_y = np.linalg.lstsq(M, C[:, 1], rcond=None)[0]
    
    P1 = np.array([P1_x, P1_y])
    P2 = np.array([P2_x, P2_y])
    
    # Calculate fitted points and maximum error
    t_col = t[:, None]
    fitted = (1-t_col)**3 * P0 + 3*(1-t_col)**2*t_col * P1 + 3*(1-t_col)*t_col**2 * P2 + t_col**3 * P3
    errors = np.linalg.norm(points - fitted, axis=1)
    max_error = np.max(errors)
    
    if max_error <= error_threshold:
        return [("C", P1, P2, P3)]
    else:
        # Split at point of maximum error
        split_idx = np.argmax(errors)
        if split_idx == 0 or split_idx == n - 1:
            split_idx = n // 2
        left_curve = fit_bezier(points[:split_idx+1], error_threshold)
        right_curve = fit_bezier(points[split_idx:], error_threshold)
        return left_curve + right_curve

def smooth_segment(points, window_size=5):
    n = len(points)
    if n <= 2:
        return points
    smoothed = np.copy(points)
    # Leave start and end points untouched to preserve sharp corners
    for i in range(1, n - 1):
        start_idx = max(0, i - window_size // 2)
        end_idx = min(n, i + window_size // 2 + 1)
        smoothed[i] = np.mean(points[start_idx:end_idx], axis=0)
    return smoothed

def process_contour(contour, straight_tol=1.0, error_tol=1.0):
    pts = contour.reshape(-1, 2)
    n = len(pts)
    if n < 3:
        return ""
        
    # 1. Corner Detection
    k = 3 # Window size
    bend_angles = np.zeros(n)
    for i in range(n):
        p_prev = pts[(i - k) % n]
        p_curr = pts[i]
        p_next = pts[(i + k) % n]
        
        v1 = p_curr - p_prev
        v2 = p_next - p_curr
        
        v1_norm = np.linalg.norm(v1)
        v2_norm = np.linalg.norm(v2)
        if v1_norm < 1e-5 or v2_norm < 1e-5:
            continue
            
        cos_theta = np.dot(v1, v2) / (v1_norm * v2_norm)
        cos_theta = np.clip(cos_theta, -1.0, 1.0)
        bend_angles[i] = math.degrees(math.acos(cos_theta))
        
    # Non-maximum suppression to find corners
    is_corner = np.zeros(n, dtype=bool)
    CORNER_THRESH = 15.0 # Degrees
    for i in range(n):
        if bend_angles[i] < CORNER_THRESH:
            continue
        is_max = True
        for w in range(-k, k + 1):
            idx = (i + w) % n
            if bend_angles[idx] > bend_angles[i]:
                is_max = False
                break
        if is_max:
            is_corner[i] = True
            
    if not np.any(is_corner):
        is_corner[0] = True
        
    # 2. Segment and Fit Curves
    corner_indices = np.where(is_corner)[0]
    num_corners = len(corner_indices)
    
    path_cmds = []
    start_corner_idx = corner_indices[0]
    start_pt = pts[start_corner_idx]
    path_cmds.append(f"M {start_pt[0]:.2f} {start_pt[1]:.2f}")
    
    for i in range(num_corners):
        idx_curr = corner_indices[i]
        idx_next = corner_indices[(i + 1) % num_corners]
        
        if idx_next > idx_curr:
            segment_pts = pts[idx_curr:idx_next + 1]
        else:
            segment_pts = np.concatenate((pts[idx_curr:], pts[:idx_next + 1]))
            
        if len(segment_pts) <= 1:
            continue
            
        # Smooth segment points before classification and fitting
        segment_pts = smooth_segment(segment_pts, window_size=5)
            
        # Check if straight line
        if is_segment_straight(segment_pts, straight_tol):
            end_pt = segment_pts[-1]
            path_cmds.append(f"L {end_pt[0]:.2f} {end_pt[1]:.2f}")
        else:
            curves = fit_bezier(segment_pts, error_tol)
            for cmd in curves:
                if cmd[0] == "L":
                    path_cmds.append(f"L {cmd[1][0]:.2f} {cmd[1][1]:.2f}")
                elif cmd[0] == "C":
                    path_cmds.append(f"C {cmd[1][0]:.2f} {cmd[1][1]:.2f} {cmd[2][0]:.2f} {cmd[2][1]:.2f} {cmd[3][0]:.2f} {cmd[3][1]:.2f}")
                    
    path_cmds.append("Z")
    return " ".join(path_cmds)

def get_perfect_sun_path():
    # Parâmetros ajustados com precisão matemática a partir da logo original
    cx = 619.000
    cy = 249.600
    scale_h = 1.392
    shear = 0.190
    Ri = 50.088
    Ro = 85.854
    d_slit = 6.0
    w_bar = 4.0
    
    k1 = d_slit * math.sqrt(2)
    k2 = -d_slit * math.sqrt(2)
    
    def circle_line_intersect(R, k):
        disc = 2 * R**2 - k**2
        if disc < 0:
            return None
        sqrt_disc = math.sqrt(disc)
        x1 = (-k - sqrt_disc) / 2
        y1 = x1 + k
        x2 = (-k + sqrt_disc) / 2
        y2 = x2 + k
        return (x1, y1), (x2, y2)
        
    out_A1, out_A2 = circle_line_intersect(Ro, k1)
    in_A1, in_A2 = circle_line_intersect(Ri, k1)
    out_B1, out_B2 = circle_line_intersect(Ro, k2)
    in_B1, in_B2 = circle_line_intersect(Ri, k2)
    
    def to_svg(pt):
        x, y = pt
        tx = scale_h * x + shear * y + cx
        ty = y + cy
        return tx, ty
        
    def arc_bezier(R, start_pt, end_pt, clockwise=True):
        def angle(p):
            return math.atan2(p[1], p[0])
            
        a_start = angle(start_pt)
        a_end = angle(end_pt)
        
        if clockwise:
            if a_end >= a_start:
                a_end -= 2 * math.pi
        else:
            if a_end <= a_start:
                a_end += 2 * math.pi
                
        total_angle = a_end - a_start
        n_segs = max(1, math.ceil(abs(total_angle) / (math.pi / 2)))
        step = total_angle / n_segs
        
        cmds = []
        for i in range(n_segs):
            a0 = a_start + i * step
            a1 = a_start + (i + 1) * step
            da = a1 - a0
            alpha = math.sin(da) * (math.sqrt(4 + 3 * math.tan(da/2)**2) - 1) / 3
            
            p0 = (R * math.cos(a0), R * math.sin(a0))
            p3 = (R * math.cos(a1), R * math.sin(a1))
            
            p1 = (p0[0] - alpha * R * math.sin(a0), p0[1] + alpha * R * math.cos(a0))
            p2 = (p3[0] + alpha * R * math.sin(a1), p3[1] - alpha * R * math.cos(a1))
            
            q1 = to_svg(p1)
            q2 = to_svg(p2)
            q3 = to_svg(p3)
            cmds.append(f"C {q1[0]:.2f} {q1[1]:.2f}, {q2[0]:.2f} {q2[1]:.2f}, {q3[0]:.2f} {q3[1]:.2f}")
        return cmds

    # 1. Círculo Interno como Elipse Contínua e Perfeita (Sem cortes para evitar visual quebrado!)
    # Desenhado em 4 segmentos de 90 graus para precisão total de Bezier
    pts_circle = [
        (Ri, 0),
        (0, Ri),
        (-Ri, 0),
        (0, -Ri)
    ]
    q_start = to_svg(pts_circle[0])
    circle_cmds = [f"M {q_start[0]:.2f} {q_start[1]:.2f}"]
    for i in range(4):
        circle_cmds.extend(arc_bezier(Ri, pts_circle[i], pts_circle[(i+1)%4], clockwise=False))
    circle_cmds.append("Z")
    path_inner_circle = " ".join(circle_cmds)

    # 2. Arcos Externos do Sol (C-shapes externos)
    # Arco superior esquerdo
    s_out_left_start = to_svg(out_A1)
    arc_out_left = arc_bezier(Ro, out_A1, out_A2, clockwise=True)
    path_outer_left = f"M {s_out_left_start[0]:.2f} {s_out_left_start[1]:.2f} " + " ".join(arc_out_left)
    
    # Arco inferior direito
    s_out_right_start = to_svg(out_B2)
    arc_out_right = arc_bezier(Ro, out_B2, out_B1, clockwise=True)
    path_outer_right = f"M {s_out_right_start[0]:.2f} {s_out_right_start[1]:.2f} " + " ".join(arc_out_right)

    # 3. Linhas das fendas (slits) que conectam os arcos externos à elipse interna
    pt_out_A1 = to_svg(out_A1)
    pt_in_A1 = to_svg(in_A1)
    pt_out_A2 = to_svg(out_A2)
    pt_in_A2 = to_svg(in_A2)
    pt_out_B1 = to_svg(out_B1)
    pt_in_B1 = to_svg(in_B1)
    pt_out_B2 = to_svg(out_B2)
    pt_in_B2 = to_svg(in_B2)
    
    path_slits = (
        f"M {pt_out_A1[0]:.2f} {pt_out_A1[1]:.2f} L {pt_in_A1[0]:.2f} {pt_in_A1[1]:.2f} "
        f"M {pt_out_A2[0]:.2f} {pt_out_A2[1]:.2f} L {pt_in_A2[0]:.2f} {pt_in_A2[1]:.2f} "
        f"M {pt_out_B1[0]:.2f} {pt_out_B1[1]:.2f} L {pt_in_B1[0]:.2f} {pt_in_B1[1]:.2f} "
        f"M {pt_out_B2[0]:.2f} {pt_out_B2[1]:.2f} L {pt_in_B2[0]:.2f} {pt_in_B2[1]:.2f}"
    )

    # 4. Haste central com notches (dentes) - Desenhada sem cruzar a elipse interna, apenas como arestas
    # Para fundir perfeitamente o visual, conectamos as extremidades da haste diretamente na elipse
    # de forma a formar dois furos D-shaped em vez de desenhar a haste inteira cruzando.
    # Mas como o usuário quer o círculo interno perfeito (sem emendas feias) e a haste dentro,
    # vamos desenhar os dois furos internos D-shaped fechados!
    # Isso une a elipse interna e as bordas da haste perfeitamente, sem nenhuma linha cruzada!
    u_min, u_max = -Ri, Ri
    def uv_to_xy(u, v):
        x = (u - v) / math.sqrt(2)
        y = (u + v) / math.sqrt(2)
        return x, y

    # Furo 1: Inferior esquerdo
    pts_edge_left = [
        uv_to_xy(u_min, w_bar/2),
        uv_to_xy(-Ri * 0.423, w_bar/2),
        uv_to_xy(-Ri * 0.423, Ri * 0.564), # Notch superior
        uv_to_xy(-Ri * 0.282, Ri * 0.564),
        uv_to_xy(-Ri * 0.282, w_bar/2),
        uv_to_xy(u_max, w_bar/2)
    ]
    t_edge_left = [to_svg(pt) for pt in pts_edge_left]
    # Arco interno conectando u_max de volta a u_min (anti-horário)
    arc_hole_left = arc_bezier(Ri, pts_edge_left[-1], pts_edge_left[0], clockwise=False)
    
    path_hole_left = (
        f"M {t_edge_left[0][0]:.2f} {t_edge_left[0][1]:.2f} " +
        " ".join(f"L {pt[0]:.2f} {pt[1]:.2f}" for pt in t_edge_left[1:]) +
        " " + " ".join(arc_hole_left) + " Z"
    )

    # Furo 2: Superior direito
    pts_edge_right = [
        uv_to_xy(u_max, -w_bar/2),
        uv_to_xy(Ri * 0.423, -w_bar/2),
        uv_to_xy(Ri * 0.423, -Ri * 0.564), # Notch inferior
        uv_to_xy(Ri * 0.282, -Ri * 0.564),
        uv_to_xy(Ri * 0.282, -w_bar/2),
        uv_to_xy(u_min, -w_bar/2)
    ]
    t_edge_right = [to_svg(pt) for pt in pts_edge_right]
    # Arco interno conectando u_min de volta a u_max (anti-horário)
    arc_hole_right = arc_bezier(Ri, pts_edge_right[-1], pts_edge_right[0], clockwise=False)
    
    path_hole_right = (
        f"M {t_edge_right[0][0]:.2f} {t_edge_right[0][1]:.2f} " +
        " ".join(f"L {pt[0]:.2f} {pt[1]:.2f}" for pt in t_edge_right[1:]) +
        " " + " ".join(arc_hole_right) + " Z"
    )

    return [
        f'  <!-- Dois Furos D-shaped que formam o círculo interno perfeitamente integrado e contínuo -->',
        f'  <path d="{path_hole_left}" fill="none" stroke="#001F5C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />',
        f'  <path d="{path_hole_right}" fill="none" stroke="#001F5C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />',
        f'  <!-- Arcos externos do Sol -->',
        f'  <path d="{path_outer_left}" fill="none" stroke="#001F5C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />',
        f'  <path d="{path_outer_right}" fill="none" stroke="#001F5C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />',
        f'  <!-- Fendas radiais -->',
        f'  <path d="{path_slits}" fill="none" stroke="#001F5C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />'
    ]

def trace_and_reconstruct_perfect():
    print("Iniciando reconstrução matemática de alta fidelidade...")
    
    # 1. Carregar logo original
    img_path = "src/assets/esol-logo-original.png"
    img = cv2.imread(img_path)
    if img is None:
        print(f"Erro: {img_path} not found.")
        return
        
    h, w, c = img.shape
    print(f"Dimensões originais: {w}x{h}px")
    
    # Upscale 4x com Lanczos para melhorar a precisão dos contornos antes da filtragem
    SCALE = 4
    img_up = cv2.resize(img, (w * SCALE, h * SCALE), interpolation=cv2.INTER_LANCZOS4)
    uh, uw, _ = img_up.shape
    
    # 2. Isolamento de cores (remover checkerboard)
    navy_mask = np.zeros((uh, uw), dtype=np.uint8)
    grey_mask = np.zeros((uh, uw), dtype=np.uint8)
    
    bgr = img_up
    for y in range(uh):
        for x in range(uw):
            b, g, r = bgr[y, x]
            # Navy (E, S, L)
            if r < 80 and g < 100 and b > 70 and (int(b) - int(r)) > 15:
                navy_mask[y, x] = 255
            # Grey (ENERGY)
            elif 60 < r < 180 and 60 < g < 180 and 60 < b < 180 and abs(int(r) - int(g)) < 15 and abs(int(r) - int(b)) < 15:
                grey_mask[y, x] = 255
                
    def smooth_mask(m):
        m = cv2.GaussianBlur(m, (3, 3), 0.8)
        _, thresh = cv2.threshold(m, 127, 255, cv2.THRESH_BINARY)
        return thresh
        
    navy_smooth = smooth_mask(navy_mask)
    grey_smooth = smooth_mask(grey_mask)
    
    # 3. Encontrar contornos com hierarquia (furos)
    def extract_vector_paths(mask, color_hex, stroke_width=2):
        contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        if not contours:
            return []
            
        paths = []
        for i, cnt in enumerate(contours):
            h_info = hierarchy[0][i]
            
            # Se for contorno externo ou furo significativo
            area = cv2.contourArea(cnt)
            orig_area = area / (SCALE * SCALE)
            if orig_area > 10:
                cnt_scaled = cnt.astype(float) / SCALE
                
                # Filtrar tagline/slogan (retirar totalmente da logo contornos abaixo de y=450)
                cy_cnt = np.mean(cnt_scaled[:, 0, 1])
                if cy_cnt > 450:
                    continue
                
                # Processar e reconstruir com retas perfeitas e curvas suaves
                d_path = process_contour(cnt_scaled, straight_tol=0.9, error_tol=0.6)
                if d_path:
                    paths.append(f'  <path d="{d_path}" fill="none" stroke="{color_hex}" stroke-width="{stroke_width}" stroke-linejoin="round" stroke-linecap="round" />')
        return paths

    print("Gerando caminhos para letras E, S, L...")
    navy_paths = extract_vector_paths(navy_smooth, "#001F5C", stroke_width=2)
    
    print("Gerando caminhos para letras de ENERGY...")
    grey_paths = extract_vector_paths(grey_smooth, "#001F5C", stroke_width=2)
    
    print("Gerando o Sol (O) de forma geométrica analítica perfeita...")
    sun_paths = get_perfect_sun_path()
    
    # 4. Montar o SVG
    all_paths = navy_paths + sun_paths + grey_paths
    paths_str = "\n".join(all_paths)
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
{paths_str}
</svg>"""

    out_path = "public/brand-kit/1. Web-SVG/esol-logo-outline.svg"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    temp_path = "public/brand-kit/1. Web-SVG/esol-logo-outline-temp.svg"
    with open(temp_path, "w", encoding="utf-8") as f:
        f.write(svg)
        
    print(f"Reconstrução concluída! SVG salvo em: {out_path}")

if __name__ == "__main__":
    trace_and_reconstruct_perfect()
