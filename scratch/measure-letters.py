from PIL import Image
import numpy as np
import cv2

def measure_letters():
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    # Isolate logo pixels
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = (diff > 30).astype(np.uint8) * 255
    
    # Crop ESOL line (Y from 170 to 342)
    esol_line = mask[170:342, :]
    
    # Find contours on ESOL line
    contours, _ = cv2.findContours(esol_line, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Get bounding boxes
    bboxes = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w > 10 and h > 10:
            bboxes.append((x, y, w, h))
            
    # Sort from left to right
    bboxes.sort(key=lambda b: b[0])
    
    print("ESOL Letters Bounding Boxes:")
    for i, b in enumerate(bboxes):
        print(f"Letter {i} (bbox): X={b[0]}, Y={170+b[1]} (W={b[2]}, H={b[3]})")
        
    # Spacing between letters
    for i in range(len(bboxes)-1):
        gap = bboxes[i+1][0] - (bboxes[i][0] + bboxes[i][2])
        print(f"Gap between Letter {i} and {i+1}: {gap}px")
        
if __name__ == "__main__":
    measure_letters()
