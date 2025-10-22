#!/usr/bin/env python
"""
CLI tool for creating alpha mask PNG files.

Usage:
    python scripts/alphamask.py image.png              # Creates image.mask.png with default settings
    python scripts/alphamask.py *.png                  # Process multiple files
    python scripts/alphamask.py --translucency-mask-color 0,0,0 image.png    # Black for semi-transparent areas
    python scripts/alphamask.py --opacity-mask-color 255,255,255 image.png   # White for opaque areas
    python scripts/alphamask.py --translucency-mask-color "#000000" image.png  # Using hex code
"""

import os
import sys
import glob
import argparse
from pathlib import Path

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import mask_alpha

def parse_color(color_str):
    """Parse color string to RGB tuple."""
    if color_str.startswith('#'):
        # Convert hex color code to RGB
        color_str = color_str.lstrip('#')
        if len(color_str) == 6:
            return tuple(int(color_str[i:i+2], 16) for i in (0, 2, 4))
        else:
            raise ValueError(f"Invalid hex color code: {color_str}")
    else:
        # Parse comma-separated RGB values
        try:
            return tuple(int(x.strip()) for x in color_str.split(','))
        except ValueError:
            raise ValueError(f"Invalid color format: {color_str}. Use comma-separated RGB values (e.g., '255,255,255') or hex code (e.g., '#FFFFFF')")

def main():
    parser = argparse.ArgumentParser(description='Create alpha mask PNG files from input images.')
    parser.add_argument('images', nargs='+', help='Input image file(s) (supports wildcards)')
    parser.add_argument('--transparent-mask-color', type=str, default='255,255,255,0', 
                        help='Color for fully transparent pixels (RGBA format: e.g., "255,255,255,0")')
    parser.add_argument('--translucency-mask-color', type=str, default='0,0,0', 
                        help='Color for semi-transparent pixels (RGB format: e.g., "0,0,0" or hex "#000000")')
    parser.add_argument('--opacity-mask-color', type=str, default='255,255,255', 
                        help='Color for fully opaque pixels (RGB format: e.g., "255,255,255" or hex "#FFFFFF")')
    parser.add_argument('-o', '--output', type=str, 
                        help='Output directory. If not specified, masks are saved next to input files.')
    parser.add_argument('-s', '--suffix', type=str, default='.mask', 
                        help='Suffix to add to output filenames (default: .mask)')
    
    args = parser.parse_args()
    
    # Parse color arguments
    try:
        transparent_parts = args.transparent_mask_color.split(',')
        if len(transparent_parts) == 4:
            transparent_color = tuple(int(x.strip()) for x in transparent_parts)
        else:
            raise ValueError("Transparent mask color must be in RGBA format (e.g., '255,255,255,0')")
        
        translucency_color = parse_color(args.translucency_mask_color)
        opacity_color = parse_color(args.opacity_mask_color)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Expand file wildcards if any
    image_files = []
    for pattern in args.images:
        matches = glob.glob(pattern)
        if matches:
            image_files.extend(matches)
        else:
            image_files.append(pattern)  # Keep even if doesn't match, to show error later
    
    # Process each image
    success_count = 0
    error_count = 0
    
    for image_path in image_files:
        if not os.path.exists(image_path):
            print(f"Error: File not found: {image_path}", file=sys.stderr)
            error_count += 1
            continue
        
        # Determine output path
        if args.output:
            output_dir = args.output
            os.makedirs(output_dir, exist_ok=True)
            base_name = os.path.basename(image_path)
            name_parts = os.path.splitext(base_name)
            output_path = os.path.join(output_dir, f"{name_parts[0]}{args.suffix}{name_parts[1]}")
        else:
            image_path_obj = Path(image_path)
            name_parts = os.path.splitext(image_path)
            output_path = f"{name_parts[0]}{args.suffix}{name_parts[1]}"
        
        try:
            mask_alpha(
                image_path, 
                output_path,
                transparent_mask_color=transparent_color,
                translucency_mask_color=translucency_color,
                opacity_mask_color=opacity_color
            )
            print(f"Created mask: {output_path}")
            success_count += 1
        except Exception as e:
            print(f"Error processing {image_path}: {e}", file=sys.stderr)
            error_count += 1
    
    # Report summary
    print(f"\nProcessed {success_count + error_count} images: {success_count} successful, {error_count} failed.")
    return 0 if error_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
