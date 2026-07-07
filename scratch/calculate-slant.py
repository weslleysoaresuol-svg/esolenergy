from PIL import Image
import numpy as np

def calculate():
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    # Isolate logo pixels
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = diff > 30
    
    # Crop letter E (X from 156 to 250, Y from 170 to 342)
    E_mask = mask[170:342, 156:250]
    
    # For each row, find the first pixel (left edge of E)
    h_E, w_E = E_mask.shape
    left_coords = []
    
    for y in range(h_E):
        cols = np.where(E_mask[y, :])[0]
        if len(cols) > 0:
            left_coords.append((cols[0], y))
            
    # Fit a line x = m*y + c
    x = np.array([p[0] for p in left_coords])
    y = np.array([p[1] for p in left_coords])
    
    # We want to fit x as a function of y: x = a*y + b
    # Since y increases downwards, we calculate dx/dy
    a, b = np.polyfit(y, x, 1)
    
    # The slant angle in degrees:
    # tan(theta) = a (note that y is downwards, so a positive a means it slants rightwards as we go down?
    # Wait, in standard math, y goes up. Here y goes down, so:
    # If a is positive, it means as y increases (moves down), x increases (moves right).
    # So the top is at y=0 (x is smaller) and the bottom is at y=h (x is larger).
    # This means the letter is slanted to the left!
    # Wait, look at the logo: it slants to the right!
    # If it slants to the right, then the top (y=0) should be shifted right (larger x) and the bottom (y=h) should be shifted left (smaller x).
    # So as y increases (goes down), x should decrease (moves left).
    # Thus 'a' should be negative!
    # Let's check:
    angle = np.degrees(np.arctan(abs(a)))
    print(f"Slope (dx/dy): {a}")
    print(f"Calculated Slant Angle: {angle:.2f} degrees")

if __name__ == "__main__":
    calculate()
