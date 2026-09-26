# Blender 4.x script: import the supplied GLB, normalize scene settings,
# and save an editable .blend with a clean lid hinge pivot.
import bpy, os, math
from mathutils import Vector

GLB = os.path.abspath('/mnt/data/trashbuddy_wheelie_bin.glb')
OUT = os.path.abspath('/mnt/data/trashbuddy_wheelie_bin.blend')

# Reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.length_unit = 'MILLIMETERS'
scene.unit_settings.scale_length = 1.0

# Import GLB
bpy.ops.import_scene.gltf(filepath=GLB)

# Normalize names / transforms
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        try:
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        except RuntimeError:
            pass
        obj.select_set(False)

# Locate lid and set a rear-hinge pivot.
lid = bpy.data.objects.get('Lid')
if lid:
    pivot = bpy.data.objects.get('Lid_Hinge_Pivot')
    if not pivot:
        pivot = bpy.data.objects.new('Lid_Hinge_Pivot', None)
        bpy.context.collection.objects.link(pivot)
    pivot.location = (0.0, 0.737 * 0.46, 0.985)
    pivot.rotation_mode = 'XYZ'
    # preserve current lid world transform while parenting
    world = lid.matrix_world.copy()
    lid.parent = pivot
    lid.matrix_world = world
    # Lid now rotates cleanly around the rear hinge.
    pivot.rotation_euler = (0, 0, 0)

# Give useful display names if the GLB importer altered them.
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        if 'Bin_Body' in obj.name:
            obj.name = 'Bin_Body'
        elif obj.name.startswith('Lower_Foot'):
            obj.name = 'Lower_Foot_Lip'
        elif obj.name == 'Lid':
            obj.name = 'Lid'
        elif 'Rear_Axle' in obj.name:
            obj.name = 'Rear_Axle'
        elif 'Wheel_L' in obj.name:
            obj.name = 'Wheel_L'
        elif 'Wheel_R' in obj.name:
            obj.name = 'Wheel_R'
        elif 'DECAL' in obj.name:
            obj.name = 'TrashBuddy_Logo_DECAL__REFERENCE_MARK'

# Scene organization
for c in list(bpy.data.collections):
    if c.name == 'TrashBuddy Bin':
        collection = c
        break
else:
    collection = bpy.data.collections.new('TrashBuddy Bin')
    scene.collection.children.link(collection)

# Save
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('Saved', OUT)
