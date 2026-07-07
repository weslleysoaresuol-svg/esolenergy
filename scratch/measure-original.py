from PIL import Image
import numpy as np

def measure():
    img = Image.open("src/assets/esol-logo-original.png")
    # Convert to RGB
    rgb = np.array(img.convert("RGB"))
    
    # Get corner pixel as background color
    bg_color = rgb[0, 0, :]
    print(f"Background color detected: {bg_color}")
    
    # Threshold based on difference from background color
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = diff > 30 # Pixel is not background if difference is large
    
    # Find bounding box
    col_sums = np.sum(mask, axis=0)
    row_sums = np.sum(mask, axis=1)
    
    non_zero_cols = np.where(col_sums > 0)[0]
    non_zero_rows = np.where(row_sums > 0)[0]
    
    if len(non_zero_cols) == 0 or len(non_zero_rows) == 0:
        print("No logo detected!")
        return
        
    print(f"Logo bounding box: X={non_zero_cols[0]} to {non_zero_cols[-1]} (W={non_zero_cols[-1]-non_zero_cols[0]}), Y={non_zero_rows[0]} to {non_zero_rows[-1]} (H={non_zero_rows[-1]-non_zero_rows[0]})")
    
    # Find valleys in Y to separate ESOL, ENERGY, and Slogan
    print("Y Profile:")
    for y in range(non_zero_rows[0], non_zero_rows[-1]+1):
        if row_sums[y] == 0:
            print(f"Valley at Y={y}")
            
if __name__ == "__main__":
    measure()
