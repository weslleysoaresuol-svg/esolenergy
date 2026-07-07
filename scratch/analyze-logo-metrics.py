import cv2
import numpy as np

def analyze():
    # Load image
    img = cv2.imread('src/assets/esol-logo.png', cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Image not found")
        return
        
    # Extract alpha channel if exists, else convert to grayscale and threshold
    if img.shape[2] == 4:
        mask = img[:, :, 3]
    else:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
        
    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Sort contours by x position
    bounding_boxes = [cv2.boundingRect(c) for c in contours]
    contours_with_boxes = zip(contours, bounding_boxes)
    contours_with_boxes = sorted(contours_with_boxes, key=lambda b: b[1][0])
    
    print("Detected components sorted by X position:")
    for i, (c, b) in enumerate(contours_with_boxes):
        x, y, w, h = b
        area = cv2.contourArea(c)
        if area > 100: # Filter noise
            print(f"Component {i}: X={x}, Y={y}, W={w}, H={h}, Area={area}")
            
if __name__ == "__main__":
    analyze()
