#!/usr/bin/env python3
"""
Copy width, height, x, y from a reference data file to a target JSON file.

Usage:
  python scripts/copy_positional_params.py reference.py target.json

The reference file should define a variable `data` as in setpospuzzledata.py.
The target file should be a JSON file with a similar structure.
For each element in target['pages'][0]['elements'],
copy width, height, x, y from the corresponding element in reference['pages'][0]['elements'][i % N].
"""
import sys, json, importlib.util

if len(sys.argv) != 2:
    print("Usage: python scripts/copy_positional_params.py target.json")
    sys.exit(1)

target_path = sys.argv[1]

# Load reference data (as Python file with 'data' variable)
ref_data = {
  "pages": [
    {
      "duration": 25,
      "elements": [
        {
          "type": "module",
          "src": "modules/positional_shadow_match",
          "background": "bg.png",
          "elements": [
            {
              "shadow_image": "3t.mask.png",
              "reveal_image": "3t.png",
              "audio_tts": "3.mp3",
              "width": 497,
              "height": 278,
              "x": -56,
              "y": 507,
              "text": "Leghorn Chicken"
            },
            {
              "shadow_image": "1t.mask.png",
              "reveal_image": "1t.png",
              "audio_tts": "1.mp3",
              "width": 1379,
              "height": 772,
              "x": -102,
              "y": 368,
              "text": "Holstein Cow"
            },
            {
              "shadow_image": "2t.mask.png",
              "reveal_image": "2t.png",
              "audio_tts": "2.mp3",
              "width": 692,
              "height": 387,
              "x": 1388,
              "y": 395,
              "text": "Duroc Pig"
            },
            {
              "shadow_image": "4t.mask.png",
              "reveal_image": "4t.png",
              "audio_tts": "4.mp3",
              "width": 515,
              "height": 288,
              "x": 809,
              "y": 546,
              "text": "Suffolk Sheep"
            },
            {
              "shadow_image": "5t.mask.png",
              "reveal_image": "5t.png",
              "audio_tts": "5.mp3",
              "width": 848,
              "height": 490,
              "x": 964,
              "y": 589,
              "text": "Alpine Goat"
            }
          ]
        }
      ]
    },
    {
      "duration": 25,
      "elements": [
        {
          "type": "module",
          "src": "modules/positional_shadow_match",
          "background": "bg.png",
          "elements": [
            {
              "shadow_image": "6t.mask.png",
              "reveal_image": "6t.png",
              "audio_tts": "6.mp3",
              "width": 1547,
              "height": 870,
              "x": 343,
              "y": 337,
              "text": "Percheron Horse"
            },
            {
              "shadow_image": "7t.mask.png",
              "reveal_image": "7t.png",
              "audio_tts": "7.mp3",
              "width": 1186,
              "height": 667,
              "x": 108,
              "y": 540,
              "text": "Khaki Campbell Duck"
            },
            {
              "shadow_image": "8t.mask.png",
              "reveal_image": "8t.png",
              "audio_tts": "8.mp3",
              "width": 857,
              "height": 482,
              "x": -156,
              "y": 674,
              "text": "Flemish Giant Rabbit"
            },
            {
              "shadow_image": "9t.mask.png",
              "reveal_image": "9t.png",
              "audio_tts": "9.mp3",
              "width": 1186,
              "height": 667,
              "x": 1060,
              "y": 540,
              "text": "Narragansett Turkey"
            },
            {
              "shadow_image": "10t.mask.png",
              "reveal_image": "10t.png",
              "audio_tts": "10.mp3",
              "width": 1186,
              "height": 667,
              "x": -292,
              "y": 281,
              "text": "Jersey Cow"
            }
          ]
        }
      ]
    },
    {
      "duration": 25,
      "elements": [
        {
          "type": "module",
          "src": "modules/positional_shadow_match",
          "background": "bg.png",
          "elements": [
            {
              "shadow_image": "11t.mask.png",
              "reveal_image": "11t.png",
              "audio_tts": "11.mp3",
              "width": 987,
              "height": 555,
              "x": -194,
              "y": 382,
              "text": "Berkshire Pig"
            },
            {
              "shadow_image": "12t.mask.png",
              "reveal_image": "12t.png",
              "audio_tts": "12.mp3",
              "width": 542,
              "height": 305,
              "x": 1062,
              "y": 73,
              "text": "Rhode Island Red"
            },
            {
              "shadow_image": "13t.mask.png",
              "reveal_image": "13t.png",
              "audio_tts": "13.mp3",
              "width": 1186,
              "height": 667,
              "x": 108,
              "y": 540,
              "text": "Hampshire Sheep"
            },
            {
              "shadow_image": "14t.mask.png",
              "reveal_image": "14t.png",
              "audio_tts": "14.mp3",
              "width": 1186,
              "height": 667,
              "x": 511,
              "y": 412,
              "text": "Boer Goat"
            },
            {
              "shadow_image": "15t.mask.png",
              "reveal_image": "15t.png",
              "audio_tts": "15.mp3",
              "width": 1549,
              "height": 871,
              "x": 898,
              "y": 360,
              "text": "Clydesdale Horse"
            }
          ]
        }
      ]
    }
  ]
}



# Load target JSON
target_data = json.load(open(target_path))

ref_pages = ref_data['pages']
num_ref_pages = len(ref_pages)
tgt_pages = target_data['pages']

for i, tgt_page in enumerate(tgt_pages):
    ref_page = ref_pages[i % num_ref_pages]
    ref_elems = ref_page['elements']
    tgt_elems = tgt_page['elements']
    num_ref_elems = len(ref_elems)
    for j, tgt_elem in enumerate(tgt_elems):
        ref_elem = ref_elems[j % num_ref_elems]
        # If this is a module with sub-elements, copy for each sub-element
        if 'elements' in tgt_elem and 'elements' in ref_elem:
            ref_sub_elems = ref_elem['elements']
            tgt_sub_elems = tgt_elem['elements']
            num_ref_sub_elems = len(ref_sub_elems)
            for k, tgt_sub_elem in enumerate(tgt_sub_elems):
                ref_sub_elem = ref_sub_elems[k % num_ref_sub_elems]
                for key in ['width', 'height', 'x', 'y']:
                    tgt_sub_elem[key] = ref_sub_elem[key]
                    print(f"Copying {key} from ref_sub_elem[{k % num_ref_sub_elems}][{key}] = {ref_sub_elem[key]} to tgt_pages[{i}]['elements'][{j}]['elements'][{k}][{key}]")
        else:
            for key in ['width', 'height', 'x', 'y']:
                tgt_elem[key] = ref_elem[key]
                print(f"Copying {key} from ref_elem[{j % num_ref_elems}][{key}] = {ref_elem[key]} to tgt_pages[{i}]['elements'][{j}][{key}]")

with open(target_path, 'w') as f:
    json.dump(target_data, f, indent=2)
    print(f"Updated {target_path}")
