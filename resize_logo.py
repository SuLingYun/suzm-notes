from PIL import Image
import numpy as np

source = '/workspace/小弥渡网站logo生成 10.png'
img = Image.open(source).convert('RGBA')
w, h = img.size
arr = np.array(img)
non_white_mask = (arr[:,:,0] < 240) | (arr[:,:,1] < 240) | (arr[:,:,2] < 240)

# Find total content bounds
ys_all, xs_all = np.where(non_white_mask[:990, :])
all_y_min, all_y_max = ys_all.min(), ys_all.max()
print(f"Total content: y=[{all_y_min}, {all_y_max}]")

# Icon region: x=200-900 (almost square, ~0.99 ratio)
icon_x1, icon_x2 = 200, 900
icon_region = non_white_mask[all_y_min:all_y_max, icon_x1:icon_x2]
iy, ix = np.where(icon_region)
icon_content_x1 = icon_x1 + ix.min()
icon_content_x2 = icon_x1 + ix.max()
icon_content_y1 = all_y_min + iy.min()
icon_content_y2 = all_y_min + iy.max()
icon_w = icon_content_x2 - icon_content_x1
icon_h = icon_content_y2 - icon_content_y1
print(f"Icon content: x=[{icon_content_x1},{icon_content_x2}], y=[{icon_content_y1},{icon_content_y2}]")
print(f"Icon size: {icon_w}x{icon_h}, ratio={icon_w/icon_h:.2f}")

# Make square canvas with padding
padding = 40
side = max(icon_w, icon_h) + padding * 2
cx = (icon_content_x1 + icon_content_x2) // 2
cy = (icon_content_y1 + icon_content_y2) // 2
sq_x1 = cx - side // 2
sq_y1 = cy - side // 2
sq_x2 = sq_x1 + side
sq_y2 = sq_y1 + side

# Crop the square icon region
icon_square = img.crop((sq_x1, sq_y1, sq_x2, sq_y2))
print(f"Square icon crop: {side}x{side}")

# Make background transparent
icon_arr = np.array(icon_square)
r, g, b, a = icon_arr[:,:,0], icon_arr[:,:,1], icon_arr[:,:,2], icon_arr[:,:,3]
white_mask = (r > 235) & (g > 235) & (b > 235)
icon_arr[white_mask] = [255, 255, 255, 0]

icon_final = Image.fromarray(icon_arr, 'RGBA')

# Resize to 64x64 for favicon
favicon = icon_final.resize((64, 64), Image.Resampling.LANCZOS)

# Also make a larger version too (128x128) for high-DPI
favicon_128 = icon_final.resize((128, 128), Image.Resampling.LANCZOS)

# Save favicon
favicon.save('/workspace/favicon.png')
favicon.save('/workspace/docs/public/favicon.png')
print("Saved favicon.png (64x64, square icon-only, transparent bg)")

# Also regenerate full logos as before (with text version for nav bar)
# Full logo: crop watermark first
crop_bottom = 1049
img_cropped = img.crop((0, 0, w, crop_bottom))
arr_cropped = np.array(img_cropped)
r2, g2, b2, a2 = arr_cropped[:,:,0], arr_cropped[:,:,1], arr_cropped[:,:,2], arr_cropped[:,:,3]
white_mask2 = (r2 > 235) & (g2 > 235) & (b2 > 235)
arr_cropped[white_mask2] = [255, 255, 255, 0]
img_light_full = Image.fromarray(arr_cropped, 'RGBA')
new_w = int(120 * (w / crop_bottom))
img_light_resized = img_light_full.resize((new_w, 120), Image.Resampling.LANCZOS)

# Dark version
arr_dark = arr_cropped.copy()
non_transparent_dark = arr_dark[:,:,3] > 0
dr, dg, db = arr_dark[:,:,0], arr_dark[:,:,1], arr_dark[:,:,2]
dark_mask = non_transparent_dark & (dr.astype(int) + dg.astype(int) + db.astype(int) < 300)
for c in range(3):
    channel = arr_dark[:,:,c].astype(float)
    light_val = [96, 165, 250][c]
    channel[dark_mask] = channel[dark_mask] * 0.3 + light_val * 0.7
    arr_dark[:,:,c] = channel.astype(np.uint8)
img_dark_full = Image.fromarray(arr_dark, 'RGBA')
img_dark_resized = img_dark_full.resize((new_w, 120), Image.Resampling.LANCZOS)

img_light_resized.save('/workspace/logo-light.png')
img_light_resized.save('/workspace/docs/public/logo-light.png')
img_dark_resized.save('/workspace/logo-dark.png')
img_dark_resized.save('/workspace/docs/public/logo-dark.png')
print(f"Saved logo-light.png / logo-dark.png ({new_w}x120)")

print("\nAll done! Favicon is now icon-only (square), nav logos have text.")
