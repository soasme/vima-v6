import os
import glob
import random
import argparse
from PIL import Image

def parse_args():
    parser = argparse.ArgumentParser(description="Randomly stitch halves of images.")
    parser.add_argument('--stitch-num', type=int, required=True, help='Number of stitches (m)')
    parser.add_argument('--dir', type=str, default='.', help='Directory to scan for images')
    return parser.parse_args()

def get_image_files(directory):
    files = glob.glob(os.path.join(directory, '[0-9]*.png'))
    numbered = []
    for f in files:
        base = os.path.basename(f)
        name, _ = os.path.splitext(base)
        if name.isdigit():
            numbered.append((int(name), f))
    return sorted(numbered)

def delete_stitch_files(directory, num):
    pattern = os.path.join(directory, f'{num}_stitch_*.png')
    for f in glob.glob(pattern):
        os.remove(f)

def split_image(img):
    w, h = img.size
    left = img.crop((0, 0, w // 2, h))
    right = img.crop((w // 2, 0, w, h))
    return left, right

def stitch_halves(left, right):
    w, h = left.size[0] + right.size[0], left.size[1]
    new_img = Image.new('RGBA', (w, h))
    new_img.paste(left, (0, 0))
    new_img.paste(right, (left.size[0], 0))
    return new_img

def main():
    args = parse_args()
    images = get_image_files(args.dir)
    if not images:
        print('No numbered PNG images found.')
        return
    imgs = {num: Image.open(path) for num, path in images}
    nums = [num for num, _ in images]
    prev_lefts = {}
    for idx, num in enumerate(nums):
        delete_stitch_files(args.dir, num)
        img = imgs[num]
        left, right = split_image(img)
        prev_lefts[num] = left
        others = [n for n in nums if n != num]
        # Prepare for interleaved stitching
        # stitch_0: left from previous, right random
        if idx > 0:
            prev_num = nums[idx - 1]
            left_part = prev_lefts[prev_num]
        else:
            left_part = left
        # Track used left and right sources to avoid repeats in this loop
        used_left_srcs = set()
        used_right_srcs = set()
        # Pick right part from a random image not $num
        right_candidates = [n for n in others if n not in used_right_srcs]
        right_src = random.choice(right_candidates) if right_candidates else num
        right_part = split_image(imgs[right_src])[1] if right_src != num else right
        used_right_srcs.add(right_src)
        out_img = stitch_halves(left_part, right_part)
        out_img.save(os.path.join(args.dir, f'{num}_stitch_0.png'))
        # Interleaved: odd i changes left, even i changes right
        for i in range(1, args.stitch_num):
            if i == args.stitch_num - 2:
                # Ensure one part is from $num.png based on sequence
                if i % 2 == 1:
                    # Left from $num.png, right from previous
                    left_i = left
                    right_i = right_part
                    used_left_srcs.add(num)
                else:
                    # Right from $num.png, left from previous
                    left_i = left_part
                    right_i = right
                    used_right_srcs.add(num)
                left_part = left_i
                right_part = right_i
            elif i % 2 == 1:
                # Change left, keep right from previous
                # Pick left from a random image not $num, not the one used for right_part, and not used before
                left_candidates = [n for n in others if n != right_src and n not in used_left_srcs]
                if left_candidates:
                    left_src = random.choice(left_candidates)
                    left_i = split_image(imgs[left_src])[0]
                    used_left_srcs.add(left_src)
                else:
                    left_i = left
                    used_left_srcs.add(num)
                right_i = right_part
                left_part = left_i
            else:
                # Change right, keep left from previous
                # Pick right from a random image not $num, not the one used for left_part, and not used before
                right_candidates = [n for n in others if n != num and n not in used_right_srcs]
                if 'left_src' in locals():
                    right_candidates = [n for n in right_candidates if n != left_src]
                if right_candidates:
                    right_src = random.choice(right_candidates)
                    right_i = split_image(imgs[right_src])[1]
                    used_right_srcs.add(right_src)
                else:
                    right_i = right
                    used_right_srcs.add(num)
                left_i = left_part
                right_part = right_i
            out_img = stitch_halves(left_i, right_i)
            out_img.save(os.path.join(args.dir, f'{num}_stitch_{i}.png'))
        # m: original
        img.save(os.path.join(args.dir, f'{num}_stitch_{args.stitch_num}.png'))

if __name__ == '__main__':
    main()
