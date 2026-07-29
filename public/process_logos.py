import os
from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # If the pixel is very close to white, make it transparent
        if item[0] > 235 and item[1] > 235 and item[2] > 235:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, 'PNG')
    print(f"Created transparent logo at {output_path}")

def make_favicon(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    # Save as ICO file with standard icon sizes
    img.save(output_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Created favicon at {output_path}")

if __name__ == "__main__":
    public_dir = os.path.dirname(os.path.abspath(__file__))
    input_logo = os.path.join(public_dir, "logo.jpg")
    output_logo = os.path.join(public_dir, "logo-transparent.png")
    
    app_dir = os.path.join(os.path.dirname(public_dir), "src", "app")
    output_favicon = os.path.join(app_dir, "favicon.ico")
    
    # 1. Remove background
    remove_background(input_logo, output_logo)
    
    # 2. Make favicon
    make_favicon(input_logo, output_favicon)
