from PIL import Image, ImageDraw
from pathlib import Path
out=Path('/mnt/data/kakare_shibata_rebuild_v4/images')
out.mkdir(parents=True, exist_ok=True)

# SNES-like limited palette
INK=(24,20,18,255); BLACK=(18,16,15,255); DARK=(46,37,33,255)
RED=(132,35,30,255); RED2=(188,54,40,255); CRIMSON=(101,27,25,255)
GOLD=(218,172,73,255); GOLD2=(244,211,128,255)
SKIN=(224,171,126,255); SKIN2=(244,201,151,255)
WHITE=(234,225,205,255); FUR=(205,199,185,255); FUR2=(151,148,140,255)
BLUE=(43,76,121,255); BLUE2=(66,110,166,255); NAVY=(29,48,82,255)
GRAY=(118,112,103,255); STEEL=(196,202,203,255); GREEN=(67,103,64,255)
BROWN=(105,67,43,255); TAN=(143,93,57,255)


def save(name, drawfn, size=(40,40)):
    im=Image.new('RGBA', size, (0,0,0,0)); d=ImageDraw.Draw(im); drawfn(d); im.save(out/name)


def shibata_base(d, step=False):
    # ground shadow
    d.ellipse((7,33,31,37), fill=(0,0,0,70))
    # legs / hakama
    if step:
        d.rectangle((11,28,15,35), fill=BLACK); d.rectangle((24,27,28,34), fill=BLACK)
        d.rectangle((9,34,15,36), fill=DARK); d.rectangle((25,33,31,35), fill=DARK)
    else:
        d.rectangle((12,28,16,35), fill=BLACK); d.rectangle((23,28,27,35), fill=BLACK)
        d.rectangle((10,34,16,36), fill=DARK); d.rectangle((23,34,29,36), fill=DARK)
    # red kusazuri skirt
    d.rectangle((9,24,30,29), fill=CRIMSON)
    d.rectangle((10,27,14,31), fill=RED); d.rectangle((17,27,21,31), fill=RED); d.rectangle((24,27,28,31), fill=RED)
    # broad torso black armor
    d.rectangle((10,14,29,25), fill=INK)
    d.rectangle((12,16,27,18), fill=RED)
    d.rectangle((12,20,27,22), fill=RED)
    d.rectangle((13,14,26,15), fill=GOLD)
    d.rectangle((18,14,20,25), fill=(72,52,43,255))
    # oversized fur shoulder mantle = signature silhouette
    d.rectangle((5,13,11,22), fill=FUR2); d.rectangle((6,11,12,19), fill=FUR)
    d.rectangle((28,13,34,22), fill=FUR2); d.rectangle((27,11,33,19), fill=FUR)
    d.rectangle((7,12,9,14), fill=WHITE); d.rectangle((30,12,32,14), fill=WHITE)
    # arms
    d.rectangle((7,18,10,27), fill=RED); d.rectangle((29,18,32,27), fill=RED)
    d.rectangle((7,25,10,28), fill=SKIN); d.rectangle((29,25,32,28), fill=SKIN)
    # neck / face
    d.rectangle((16,8,23,14), fill=SKIN)
    d.rectangle((14,7,25,12), fill=SKIN2)
    # hair / helmet
    d.rectangle((13,4,26,8), fill=INK)
    d.rectangle((15,2,24,5), fill=BLACK)
    d.rectangle((17,0,22,3), fill=BLACK)
    # strong brows and beard
    d.rectangle((15,8,17,9), fill=BLACK); d.rectangle((22,8,24,9), fill=BLACK)
    d.rectangle((17,11,22,13), fill=BLACK)
    d.rectangle((15,10,16,12), fill=BLACK); d.rectangle((23,10,24,12), fill=BLACK)
    d.rectangle((18,13,21,15), fill=BLACK)
    # kabuto crest / gold horns
    d.rectangle((18,1,21,3), fill=GOLD)
    d.line((18,2,14,0), fill=GOLD2, width=1); d.line((21,2,25,0), fill=GOLD2, width=1)
    # huge blade at right
    d.line((31,26,37,7), fill=BROWN, width=2)
    d.line((32,25,38,8), fill=STEEL, width=2)
    d.polygon([(35,8),(38,6),(39,8),(37,12)], fill=STEEL)
    # gold knot / emblem
    d.rectangle((18,17,21,20), fill=GOLD)


def shibata(d): shibata_base(d, False)
def shibata_walk(d): shibata_base(d, True)


def enemy(d):
    d.ellipse((8,31,29,35), fill=(0,0,0,55))
    d.rectangle((11,26,15,34), fill=DARK); d.rectangle((23,26,27,34), fill=DARK)
    d.rectangle((10,15,29,27), fill=(88,47,41,255))
    d.rectangle((11,17,28,19), fill=(120,56,44,255))
    d.rectangle((12,8,26,14), fill=SKIN)
    d.rectangle((10,6,28,10), fill=(64,63,64,255))
    d.rectangle((14,3,24,7), fill=(52,52,55,255))
    d.rectangle((18,1,21,4), fill=RED2)
    d.rectangle((13,10,15,11), fill=BLACK); d.rectangle((23,10,25,11), fill=BLACK)
    d.rectangle((8,18,11,27), fill=(99,46,39,255)); d.rectangle((28,18,31,27), fill=(99,46,39,255))
    d.line((30,24,36,10), fill=BROWN, width=2); d.line((31,23,37,9), fill=STEEL, width=1)


def spear(d):
    enemy(d)
    d.line((31,30,34,1), fill=(213,205,185,255), width=2)
    d.polygon([(32,3),(35,0),(36,4)], fill=STEEL)
    d.rectangle((30,17,34,19), fill=SKIN)


def ally(d):
    d.ellipse((8,31,29,35), fill=(0,0,0,55))
    d.rectangle((11,26,15,34), fill=NAVY); d.rectangle((23,26,27,34), fill=NAVY)
    d.rectangle((10,15,29,27), fill=BLUE)
    d.rectangle((12,17,27,19), fill=BLUE2)
    d.rectangle((12,8,26,14), fill=SKIN)
    d.rectangle((10,6,28,10), fill=INK)
    d.rectangle((14,3,24,7), fill=BLACK)
    d.rectangle((18,1,21,4), fill=GOLD)
    d.rectangle((13,10,15,11), fill=BLACK); d.rectangle((23,10,25,11), fill=BLACK)
    d.rectangle((8,18,11,27), fill=BLUE2); d.rectangle((28,18,31,27), fill=BLUE2)
    d.line((30,24,36,10), fill=BROWN, width=2); d.line((31,23,37,9), fill=STEEL, width=1)
    d.rectangle((17,20,21,23), fill=WHITE)


def jar(d):
    d.ellipse((7,30,33,34), fill=(0,0,0,55))
    d.rectangle((15,3,24,5), fill=BROWN)
    d.rectangle((12,5,27,9), fill=TAN)
    d.rectangle((8,10,31,29), fill=(51,85,140,255))
    d.rectangle((6,14,9,25), fill=(70,112,170,255)); d.rectangle((30,14,33,25), fill=(70,112,170,255))
    d.rectangle((10,11,29,14), fill=(76,120,181,255)); d.rectangle((10,27,29,30), fill=(35,64,107,255))
    # white wave pattern
    d.rectangle((12,17,15,24), fill=(169,201,226,255)); d.rectangle((18,15,21,22), fill=(190,216,234,255)); d.rectangle((24,18,27,25), fill=(169,201,226,255))
    d.rectangle((13,17,20,18), fill=(203,224,239,255)); d.rectangle((20,22,27,23), fill=(203,224,239,255))


def heal(d):
    d.ellipse((10,29,29,33), fill=(0,0,0,45)); d.rectangle((10,14,29,28), fill=WHITE); d.rectangle((13,9,26,14), fill=WHITE); d.rectangle((16,6,23,9), fill=GREEN); d.rectangle((14,20,25,22), fill=RED2)


def banner(d):
    d.rectangle((5,3,7,37), fill=(192,181,157,255)); d.rectangle((7,6,32,24), fill=RED); d.rectangle((10,9,29,21), fill=INK)
    d.rectangle((18,10,21,20), fill=GOLD); d.rectangle((15,14,24,17), fill=GOLD)


def fire(d):
    d.polygon([(20,2),(29,14),(26,30),(18,36),(9,29),(11,18)], fill=RED2)
    d.polygon([(20,9),(26,18),(22,31),(14,27),(16,17)], fill=GOLD)
    d.polygon([(20,15),(23,22),(20,29),(17,24)], fill=(255,239,158,255))


def castle(d):
    d.rectangle((4,20,35,38), fill=(85,82,77,255)); d.rectangle((7,13,32,22), fill=(201,194,181,255)); d.rectangle((11,6,28,14), fill=(224,217,203,255))
    d.polygon([(5,13),(34,13),(30,8),(9,8)], fill=INK); d.polygon([(9,6),(30,6),(26,1),(13,1)], fill=INK)
    d.rectangle((18,27,22,38), fill=DARK); d.rectangle((10,23,13,27), fill=BLACK); d.rectangle((27,23,30,27), fill=BLACK)


def slash(d):
    d.arc((2,2,38,38), 300, 70, fill=(255,210,93,255), width=4); d.arc((5,5,35,35), 300, 70, fill=(255,255,239,240), width=2)
    d.rectangle((31,9,35,11), fill=(255,235,160,220)); d.rectangle((34,14,37,16), fill=(255,235,160,180))

for n,fn in [('shibata.png',shibata),('shibata_walk.png',shibata_walk),('enemy.png',enemy),('spearman.png',spear),('ally.png',ally),('jar.png',jar),('heal.png',heal),('banner.png',banner),('fire.png',fire),('castle.png',castle),('slash.png',slash)]:
    save(n,fn)

# terrain 16x16
def tile(name, base, flecks):
    im=Image.new('RGBA',(16,16),base); d=ImageDraw.Draw(im)
    for x,y,c in flecks: d.rectangle((x,y,x+1,y+1), fill=c)
    im.save(out/name)

tile('ground.png',(64,57,38,255),[(2,3,(85,77,46,255)),(11,6,(45,43,31,255)),(7,13,(86,74,43,255)),(14,2,(49,45,29,255)),(4,9,(73,70,40,255))])
tile('stone.png',(64,64,61,255),[(2,2,(88,87,83,255)),(10,3,(49,49,47,255)),(6,11,(94,92,87,255)),(13,13,(45,45,43,255)),(3,14,(75,74,70,255))])

# Make a small transparent sprite preview grid
names=['shibata','shibata_walk','ally','enemy','spearman','jar','heal','banner','fire','castle','slash']
preview=Image.new('RGBA',(480,100),(31,27,23,255))
for i,n in enumerate(names):
    im=Image.open(out/f'{n}.png')
    x=8+i*42; y=14
    preview.alpha_composite(im,(x,y))
preview.save('/mnt/data/kakare_shibata_rebuild_v4/sprite_preview.png')
