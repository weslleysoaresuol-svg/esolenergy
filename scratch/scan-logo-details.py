from PIL import Image
import numpy as np

def scan_e():
    img = Image.open("src/assets/esol-logo-original.png")
    rgb = np.array(img.convert("RGB"))
    bg_color = rgb[0, 0, :]
    
    diff = np.sum(np.abs(rgb.astype(np.int32) - bg_color), axis=2)
    mask = diff > 30
    
    # E is in Y: 174 to 340, X: 156 to 344
    E_mask = mask[174:340, 156:344]
    h, w = E_mask.shape
    
    # We want to scan the horizontal arms.
    # Let's take a vertical slice near the right edge of E (e.g. x = w - 20)
    col_idx = w - 20
    slice_y = E_mask[:, col_idx]
    
    # Find runs of 1s and 0s
    runs = []
    current_run = slice_y[0]
    run_len = 1
    run_start = 0
    
    for y in range(1, h):
        if slice_y[y] == current_run:
            run_len += 1
        else:
            runs.append((current_run, run_start, run_len))
            current_run = slice_y[y]
            run_start = y
            run_len = 1
    runs.append((current_run, run_start, run_len))
    
    print("E Vertical Slice Runs at X =", 156 + col_idx)
    for run_val, start, length in runs:
        state = "SOLID (Arm)" if run_val else "GAP"
        print(f"  {state}: Y={174+start} to {174+start+length-1} (Height = {length}px)")

    # Let's measure stem thickness:
    # Take a horizontal slice near the middle of E's height (e.g. y = h // 2, which is Y = 174 + 83 = 257)
    # But wait, the letter is slanted, so the stem is shifted.
    # At Y = 257, let's find the horizontal run of the stem.
    # The stem is the left-most solid part of the E.
    row_idx = h // 2
    slice_x = E_mask[row_idx, :]
    
    runs_x = []
    current_run_x = slice_x[0]
    run_len_x = 1
    run_start_x = 0
    for x in range(1, w):
        if slice_x[x] == current_run_x:
            run_len_x += 1
        else:
            runs_x.append((current_run_x, run_start_x, run_len_x))
            current_run_x = slice_x[x]
            run_start_x = x
            run_len_x = 1
    runs_x.append((current_run_x, run_start_x, run_len_x))
    
    print("\nE Horizontal Slice Runs at Y =", 174 + row_idx)
    for run_val, start, length in runs_x:
        state = "SOLID" if run_val else "GAP"
        print(f"  {state}: X={156+start} to {156+start+length-1} (Width = {length}px)")

if __name__ == "__main__":
    scan_e()
