"""
This script renames files that were downloaded from midjourney and rename them based on the filenames in the prompt.
Assume the MidJourney prompt always starts with a filename like "1.png", "2b.png", etc.
"""
import os
import sys
import re

# Configuration
directory = "/tmp" if len(sys.argv) < 2 else sys.argv[1]

# Loop through all files in the directory
for filename in os.listdir(directory):
    if filename.endswith(".png"):
        # Use regex to extract the target filename (e.g., 1.png or 1b.png)
        match = re.match(r"[a-zA-Z0-9]+_(([a-zA-Z0-9]+_?\w*\.png))", filename)
        if match:
            new_name = match.group(1)
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_name)
            print(f"Renaming {old_path} → {new_path}")
            os.rename(old_path, new_path)
        else:
            print(f"skipping {filename}.")