TrashBuddy municipal wheelie-bin model package

Files
- trashbuddy_wheelie_bin.glb : clean web-ready GLB, dimensions in metres (1 Blender unit = 1 m)
- make_trashbuddy_bin_blend.py : Blender 4.x script that imports the GLB, sets Metric/Millimeter units, creates a rear-hinge lid pivot, and saves trashbuddy_wheelie_bin.blend
- municipal_reference_decal.png : extracted white municipal-bin mark from the supplied bin reference, used as a temporary decal because the requested lowercase "trashbuddy" logo artwork was not present in the supplied files
- preview_front.png : front preview
- preview_threequarter.png : three-quarter preview
- trashbuddy_wheelie_bin_preview.scad : simple editable OpenSCAD preview source

Design template
- Nominal body/lid template: 583 mm W x 737 mm D x 1079 mm H
- Wheels: 200 mm OD
- Green UV-stable HDPE look, separate body/lid/wheels/axle/decal objects
- No anthropomorphic/mascot features

Important logo note
The two supplied images contain the green municipal bin reference and a white mascot-style character. Neither contains a lowercase "trashbuddy" wordmark/logo. The model therefore does NOT invent or redraw a TrashBuddy wordmark. A white municipal mark sampled from the actual bin reference is included as a temporary reference decal. Replace that texture with the exact supplied TrashBuddy logo asset when available.

To create the .blend
Open Blender 4.x -> Scripting -> Open make_trashbuddy_bin_blend.py -> Run Script.
The script imports the GLB and writes /mnt/data/trashbuddy_wheelie_bin.blend.
