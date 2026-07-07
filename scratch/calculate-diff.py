import os
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
import numpy as np

class PILMaskPen(BasePen):
    def __init__(self, draw, dx, dy, scale_x, scale_y):
        super().__init__(None)
        self.draw = draw
        self.dx = dx
        self.dy = dy
        self.scale_x = scale_x
        self.scale_y = scale_y
        self.curr_pt = None
        self.points = []
        
    def _moveTo(self, pt):
        self.curr_pt = (self.dx + pt[0] * self.scale_x, self.dy - pt[1] * self.scale_y)
        self.points = [self.curr_pt]
        
    def _lineTo(self, pt):
        end_pt = (self.dx + pt[0] * self.scale_x, self.dy - pt[1] * self.scale_y)
        self.draw.line([self.curr_pt, end_pt], fill=255, width=1)
        self.curr_pt = end_pt
        self.points.append(self.curr_pt)
        
    def _qCurveToOne(self, pt1, pt2):
        p0 = self.curr_pt
        p1 = (self.dx + pt1[0] * self.scale_x, self.dy - pt1[1] * self.scale_y)
        p2 = (self.dx + pt2[0] * self.scale_x, self.dy - pt2[1] * self.scale_y)
        num_steps = 20
        curve_pts = []
        for i in range(num_steps + 1):
            t = i / num_steps
            x = (1-t)**2 * p0[0] + 2*(1-t)*t * p1[0] + t**2 * p2[0]
            y = (1-t)**2 * p0[1] + 2*(1-t)*t * p1[1] + t**2 * p2[1]
            curve_pts.append((x, y))
        for i in range(len(curve_pts) - 1):
            self.draw.line([curve_pts[i], curve_pts[i+1]], fill=255, width=1)
        self.curr_pt = p2
        self.points.append(self.curr_pt)
        
    def _curveToOne(self, pt1, pt2, pt3):
        p0 = self.curr_pt
        p1 = (self.dx + pt1[0] * self.scale_x, self.dy - pt1[1] * self.scale_y)
        p2 = (self.dx + pt2[0] * self.scale_x, self.dy - pt2[1] * self.scale_y)
        p3 = (self.dx + pt3[0] * self.scale_x, self.dy - pt3[1] * self.scale_y)
        num_steps = 20
        curve_pts = []
        for i in range(num_steps + 1):
            t = i / num_steps
            x = (1-t)**3 * p0[0] + 3*(1-t)**2*t * p1[0] + 3*(1-t)*t**2 * p2[0] + t**3 * p3[0]
            y = (1-t)**3 * p0[1] + 3*(1-t)**2*t * p1[1] + 3*(1-t)*t**2 * p2[1] + t**3 * p3[1]
            curve_pts.append((x, y))
        for i in range(len(curve_pts) - 1):
            self.draw.line([curve_pts[i], curve_pts[i+1]], fill=255, width=1)
        self.curr_pt = p3
        self.points.append(self.curr_pt)
        
    def _closePath(self):
        if len(self.points) > 0:
            self.draw.line([self.curr_pt, self.points[0]], fill=255, width=1)

def calculate_diff():
    # Load original image
    orig = Image.open("src/assets/esol-logo-original.png").convert("RGBA")
    
    # Check E
    # crop box for E in the image is (156, 174, 344, 340) -> Width=188, Height=166
    crop_E = orig.crop((156, 174, 344, 340))
    # Convert crop to mask (1 for non-white)
    rgb_E = np.array(crop_E.convert("RGB"))
    bg_color = rgb_E[0, 0, :]
    diff_E = np.sum(np.abs(rgb_E.astype(np.int32) - bg_color), axis=2)
    mask_E_original = diff_E > 30
    
    # Render Neo Sans Medium E using the exact transform
    font_neo = TTFont("brand-kit/temp-fonts/NeoSansMedium.ttf")
    glyph_set = font_neo.getGlyphSet()
    
    # We want to draw E in a mask of size (188, 166)
    # The height is 166px. UPM height is 700 units.
    # So scale is 166 / 700 = 0.237.
    # Wait, the slant shift:
    # A point at y=0 is translated.
    # Let's find the optimal horizontal offset (dx) and scales to match!
    # We can try all offsets to find the best match (minimum difference)!
    best_diff = 1.0
    best_dx = 0
    best_scale_x = 0
    best_scale_y = 0
    best_slant = 0
    
    h_m, w_m = mask_E_original.shape
    
    # Grid search for exact parameters of E
    for scale_y_val in np.linspace(0.22, 0.25, 10):
        for scale_x_val in np.linspace(scale_y_val * 1.15, scale_y_val * 1.35, 10):
            for slant_val in np.linspace(0.22, 0.27, 10):
                for dx_val in range(-30, 30):
                    # Render font glyph on a black mask
                    test_img = Image.new("L", (w_m, h_m), 0)
                    test_draw = ImageDraw.Draw(test_img)
                    
                    # We render E. Baseline in UPM is at y=0.
                    # In our crop, the bottom of the E is at the bottom of the crop (y = h_m).
                    # So baseline on canvas is h_m - bottom_margin?
                    # Let's say baseline is at h_m (since E has no descender).
                    # But wait, does the glyph have space below baseline?
                    # Yes, glyphs can have spacing. In Neo Sans, E starts at y=0.
                    # So baseline is at h_m.
                    # Translate to dx_val, h_m.
                    t_matrix = Transform(scale_x_val, 0, slant_val * scale_y_val, scale_y_val, dx_val, h_m)
                    
                    # Let's draw the outline
                    pen = PILMaskPen(test_draw, dx_val, h_m, scale_x_val, scale_y_val)
                    glyph_set["E"].draw(TransformPen(pen, Transform(1, 0, slant_val, 1, 0, 0)))
                    
                    # Flood fill the inside of the letter to get a solid mask
                    # E has no holes, so we can flood fill from the center of E
                    # E is located roughly in the middle. Let's find a solid pixel in the original mask
                    # and flood fill from there.
                    mask_data = np.array(test_img)
                    # We can use cv2.drawContours with fill to draw it solid!
                    # Actually, if we use TTGlyphPen or similar we can compile it, but here we can just do:
                    # Let's draw it using cv2 from the paths!
                    # Wait, is there an easier way?
                    # Yes, cv2.fillPoly!
                    # Let's write a Pen that collects points and calls cv2.fillPoly!
                    pass

if __name__ == "__main__":
    calculate_diff()
