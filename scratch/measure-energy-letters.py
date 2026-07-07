from PIL import Image
import numpy as np
import cv2

def measure_energy():
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    # Isolate logo
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = (diff > 30).astype(np.uint8) * 255
    
    # Crop ENERGY line (Y from 374 to 424)
    energy_line = mask[374:424, :]
    
    # Find contours
    contours, _ = cv2.findContours(energy_line, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    bboxes = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w > 5 and h > 5:
            bboxes.append((x, y, w, h))
            
    # Sort left to right
    bboxes.sort(key=lambda b: b[0])
    
    print("ENERGY Letters Bounding Boxes:")
    for i, b in enumerate(bboxes):
        print(f"Letter {i} (bbox): X={b[0]}, Y={374+b[1]} (W={b[2]}, H={b[3]})")
        
    for i in range(len(bboxes)-1):
        gap = bboxes[i+1][0] - (bboxes[i][0] + bboxes[i][2])
        print(f"Gap between Letter {i} and {i+1}: {gap}px")

if __name__ == "__main__":
    measure_energy()
