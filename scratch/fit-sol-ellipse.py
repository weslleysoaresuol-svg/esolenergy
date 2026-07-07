import cv2
from PIL import Image
import numpy as np

def fit_ellipse():
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = (diff > 30).astype(np.uint8) * 255
    
    # Crop the Sun O region (X from 525 to 728, Y from 170 to 342)
    sol_crop = mask[170:342, 525:728]
    
    # Find contours in this region
    contours, _ = cv2.findContours(sol_crop, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Combine all contours in this region (in case it finds multiple pieces of the Sun)
    all_pts = np.vstack(contours)
    
    # Fit rotated ellipse
    (cx, cy), (d1, d2), angle = cv2.fitEllipse(all_pts)
    
    print("Fitted Ellipse for the Sun O:")
    print(f"  Center: ({cx + 525:.2f}, {cy + 170:.2f})")
    print(f"  Axes (Diameter 1, Diameter 2): ({d1:.2f}, {d2:.2f})")
    print(f"  Rotation Angle: {angle:.2f} degrees")

if __name__ == "__main__":
    fit_ellipse()
