#!/usr/bin/env python3
import os
import sys
import glob
import shutil
import re
from pathlib import Path
from rembg import remove
from PIL import Image

def remove_background(input_path):
    """Remove background from a single image file."""
    try:
        # Read input image
        with open(input_path, 'rb') as input_file:
            input_data = input_file.read()
        
        # Remove background
        output_data = remove(input_data)
        
        # Create backup of original file
        backup_path = str(input_path).replace('.png', '.backup.png')
        shutil.copy2(input_path, backup_path)
        print(f"Backed up: {input_path} -> {backup_path}")
        
        # Save the result with background removed
        with open(input_path, 'wb') as output_file:
            output_file.write(output_data)
        
        print(f"Processed: {input_path}")
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}")
        return False
    
    return True

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/removebg.py /path/to/dir/*.png")
        print("Example: python scripts/removebg.py public/farm-finger-family/*.png")
        sys.exit(1)
    
    # Get all PNG files from command line arguments (bash will expand *)
    png_files = sys.argv[1:]
    
    # Filter to only PNG files and skip backup files and \d+b.png files
    png_files = [f for f in png_files if f.lower().endswith('.png') and '.backup.png' not in f and not re.search(r'\d+b\.png$', os.path.basename(f))]
    
    if not png_files:
        print("No PNG files found in arguments")
        sys.exit(1)
    
    print(f"Found {len(png_files)} PNG files to process...")
    
    success_count = 0
    for png_file in png_files:
        if remove_background(png_file):
            success_count += 1
    
    print(f"\nCompleted: {success_count}/{len(png_files)} files processed successfully")

if __name__ == "__main__":
    main()