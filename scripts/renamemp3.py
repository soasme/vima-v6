#!/usr/bin/env python3
"""
Rename all .mp3 files in a directory to 1.mp3, 2.mp3, ... sorted by name.
Usage:
  python scripts/renamemp3.py [directory]
If no directory is given, uses /tmp.
"""
import os
import sys

dir_path = "/tmp" if len(sys.argv) < 2 else sys.argv[1]

mp3_files = [f for f in os.listdir(dir_path) if f.lower().endswith('.mp3')]
mp3_files.sort()

for idx, filename in enumerate(mp3_files, 1):
    old_path = os.path.join(dir_path, filename)
    new_name = f"{idx}.mp3"
    new_path = os.path.join(dir_path, new_name)
    if old_path != new_path:
        print(f"Renaming {old_path} → {new_path}")
        os.rename(old_path, new_path)
    else:
        print(f"Skipping {old_path}, already named correctly.")
