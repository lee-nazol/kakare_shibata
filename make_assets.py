from PIL import Image, ImageDraw
from pathlib import Path

BASE = Path('/mnt/data/kakare_shibata_rebuild_v12')
out = BASE / 'images'
out.mkdir(parents=True, exist_ok=True)

T = (0,0,0,0)
BLACK=(14,12,11,255)
INK=(28,23,21,255)
DARK=(46,39,35,255)
BROWN=(94,63,41,255)
TAN=(170,125,78,255)
RED=(123,30,27,255)
RED2=(169,52,42,255)
RED3=(207,87,63,255)
MAROON=(85,20,21,255)
GOLD=(193,145,60,255)
GOLD2=(234,195,104,255)
GOLD3=(255,224,148,255)
SKIN=(189,134,91,255)
SKIN2=(221,173,125,255)
SKIN3=(244,205,160,255)
FUR=(228,221,205,255)
WHITE=(239,232,219,255)
FUR2=(178,168,151,255)
FUR3=(131,123,111,255)
STEEL=(180,192,201,255)
STEEL2=(227,236,241,255)
BLUE=(42,72,119,255)
BLUE2=(68,108,170,255)
BLUE3=(108,151,216,255)
NAVY=(27,43,78,255)
GREEN=(54,98,55,255)
GREEN2=(82,132,75,255)
SAND=(201,186,163,255)
STONE=(116,112,103,255)
STONE2=(152,146,138,255)
STONE3=(83,79,75,255)
FLAME_R=(199,59,30,255)
FLAME_O=(242,137,42,255)
FLAME_Y=(254,229,130,255)
SHADOW=(0,0,0,60)

S=48

def save(name, drawfn, size=(S,S)):
    im = Image.new('RGBA', size, T)
    d = ImageDraw.Draw(im)
    drawfn(d)
    im.save(out/name)


def px(d, x, y, c): d.rectangle((x,y,x,y), fill=c)
def block(d, x1, y1, x2, y2, c): d.rectangle((x1,y1,x2,y2), fill=c)
def sprite_shadow(d, x1=10, y1=40, x2=37, y2=45): d.ellipse((x1,y1,x2,y2), fill=SHADOW)


def shibata_body(d, step=False):
    sprite_shadow(d, 9, 40, 38, 45)
    if step:
        block(d,15,34,19,43,BLACK); block(d,28,33,32,42,BLACK)
        block(d,13,42,20,45,DARK); block(d,28,41,35,44,DARK)
    else:
        block(d,16,34,20,43,BLACK); block(d,27,34,31,43,BLACK)
        block(d,14,42,21,45,DARK); block(d,26,42,33,45,DARK)
    block(d,13,29,34,35,MAROON)
    for x in (14,20,26,31):
        block(d,x,31,x+3,36,RED2); block(d,x,31,x+3,31,RED3)
    block(d,14,17,33,30,INK)
    block(d,15,18,32,19,GOLD)
    block(d,16,20,31,22,RED2); block(d,16,24,31,26,RED2)
    block(d,18,20,19,30,GOLD2); block(d,22,20,23,30,GOLD2); block(d,26,20,27,30,GOLD2)
    block(d,20,17,27,18,GOLD3)
    block(d,8,16,14,27,FUR3); block(d,9,14,15,25,FUR2); block(d,10,12,16,21,FUR)
    block(d,33,16,39,27,FUR3); block(d,32,14,38,25,FUR2); block(d,31,12,37,21,FUR)
    for p in [(10,15),(12,13),(34,15),(36,13),(11,18),(35,18)]: px(d,*p,FUR)
    block(d,10,22,13,33,RED2); block(d,34,22,37,33,RED2)
    block(d,10,31,13,34,SKIN); block(d,34,31,37,34,SKIN)
    block(d,12,22,13,30,RED3); block(d,34,22,35,30,RED3)
    block(d,20,10,27,16,SKIN2); block(d,18,9,29,13,SKIN3)
    px(d,19,13,SKIN); px(d,28,13,SKIN)
    block(d,18,8,29,10,INK)
    block(d,20,12,27,18,BLACK); block(d,20,16,22,18,BLACK); block(d,25,16,27,18,BLACK)
    block(d,21,11,22,11,BLACK); block(d,25,11,26,11,BLACK); px(d,23,13,RED3)
    block(d,18,5,29,8,INK); block(d,20,3,27,5,BLACK); block(d,21,1,26,3,BLACK); block(d,22,0,25,1,BLACK)
    block(d,22,1,25,3,GOLD)
    for pts in [(22,2,16,0),(25,2,31,0),(22,3,17,4),(25,3,30,4)]: d.line(pts, fill=GOLD2, width=1)
    block(d,14,18,15,28,GOLD2); block(d,32,18,33,28,GOLD2); block(d,17,27,30,28,RED3)
    # long yari / naginata-like weapon
    d.line((35,35,44,9), fill=BROWN, width=2)
    d.line((36,35,45,9), fill=TAN, width=1)
    d.polygon([(42,10),(45,3),(47,10),(44,17)], fill=STEEL2)
    d.polygon([(43,12),(45,6),(46,10),(44,15)], fill=STEEL)
    block(d,35,30,38,32,GOLD2); block(d,35,32,38,35,SKIN)
    d.line((39,18,41,13), fill=RED3, width=1)
    d.rectangle((14,17,33,30), outline=BLACK); d.rectangle((13,29,34,35), outline=BLACK)


def shibata(d): shibata_body(d, False)
def shibata_walk(d): shibata_body(d, True); block(d,8,17,10,22,MAROON)


def common_soldier(d, tunic, tunic_hi, accent, headband, spear=False, ally=False):
    sprite_shadow(d, 11, 39, 36, 44)
    block(d,16,33,20,42,DARK); block(d,27,33,31,42,DARK)
    block(d,14,22,33,34,tunic); block(d,15,23,32,24,tunic_hi); block(d,18,25,29,26,accent)
    block(d,20,14,27,21,SKIN2); block(d,18,12,29,16,INK); block(d,19,10,28,12,BLACK); block(d,22,8,25,10,headband)
    block(d,14,24,16,33,tunic_hi); block(d,31,24,33,33,tunic_hi)
    block(d,19,17,28,21,BLACK); block(d,21,16,22,16,BLACK); block(d,25,16,26,16,BLACK)
    px(d,23,18,SKIN3)
    if spear:
        d.line((32,39,39,8), fill=BROWN, width=2)
        d.line((33,39,40,8), fill=TAN, width=1)
        d.polygon([(38,10),(41,4),(44,10),(40,17)], fill=STEEL2)
        d.polygon([(39,11),(41,6),(42,10),(40,15)], fill=STEEL)
        block(d,30,27,33,30,SKIN)
        d.line((35,17,37,13), fill=RED3, width=1)
    else:
        d.line((32,31,40,16), fill=BROWN, width=2); d.line((33,30,41,15), fill=STEEL, width=2); d.line((33,29,40,16), fill=STEEL2, width=1); d.polygon([(38,16),(41,11),(43,15),(40,19)], fill=STEEL2)
    if ally: block(d,22,26,25,29,WHITE)


def enemy(d): common_soldier(d, (88,48,44,255), (123,66,55,255), RED3, RED2, spear=True, ally=False)
def spear(d): common_soldier(d, (83,45,41,255), (117,63,54,255), RED2, RED2, spear=True, ally=False)
def ally(d): common_soldier(d, BLUE, BLUE2, GOLD2, GOLD, spear=True, ally=True)


def jar(d):
    sprite_shadow(d, 8, 39, 40, 44)
    block(d,18,7,29,9,BROWN); block(d,16,9,31,13,TAN)
    block(d,11,14,36,37,BLUE); block(d,13,15,34,16,BLUE3); block(d,10,18,13,33,BLUE2); block(d,34,18,37,33,BLUE2); block(d,13,35,34,37,NAVY)
    block(d,16,19,18,31,(150,194,236,255)); block(d,21,17,23,28,(194,223,245,255)); block(d,27,20,29,32,(161,201,238,255))
    block(d,16,24,28,25,STEEL2); block(d,18,25,21,27,STEEL2); block(d,22,22,25,24,STEEL2); block(d,25,26,29,27,STEEL2)
    d.rectangle((11,14,36,37), outline=BLACK)


def heal(d):
    sprite_shadow(d, 12, 39, 34, 43)
    block(d,14,19,33,34,FUR); block(d,17,14,30,19,FUR); block(d,20,10,27,14,GREEN2); block(d,18,24,29,26,RED2); block(d,22,20,24,30,RED2)
    d.rectangle((14,19,33,34), outline=BLACK)


def banner(d):
    block(d,8,5,10,43,SAND); block(d,11,8,33,31,BLUE); block(d,13,10,31,13,BLUE3); block(d,14,12,30,27,NAVY)
    block(d,20,14,24,25,GOLD2); block(d,17,18,27,21,GOLD2)
    for x in [13,18,23,28]: d.line((x,31,x,35), fill=TAN, width=1)
    d.rectangle((11,8,33,31), outline=BLACK)


def fire(d):
    d.polygon([(23,4),(33,16),(31,28),(24,41),(14,32),(15,18)], fill=FLAME_R)
    d.polygon([(23,10),(30,19),(27,30),(22,37),(16,29),(18,18)], fill=FLAME_O)
    d.polygon([(23,16),(27,22),(25,31),(21,30),(19,22)], fill=FLAME_Y)
    for p in [(10,28),(36,24),(11,18),(34,31)]: px(d,*p,GOLD3)


def castle(d):
    block(d,5,26,43,45,STONE); block(d,7,28,41,30,STONE2)
    for x in range(7,42,6): d.line((x,26,x,45), fill=STONE3, width=1)
    for y in range(30,46,5): d.line((5,y,43,y), fill=STONE3, width=1)
    block(d,10,18,38,28,SAND); block(d,12,19,36,20,(231,225,214,255))
    for x in (15,23,31): block(d,x,22,x+2,26,INK)
    block(d,15,10,33,19,(232,226,216,255));
    for x in (18,24,29): block(d,x,13,x+2,17,INK)
    d.polygon([(8,18),(40,18),(35,13),(13,13)], fill=INK); d.polygon([(13,10),(35,10),(31,5),(17,5)], fill=INK)
    block(d,22,33,26,45,DARK); d.rectangle((5,26,43,45), outline=BLACK)


def slash(d):
    d.arc((5,7,42,42), 292, 52, fill=GOLD2, width=6); d.arc((8,10,39,39), 292, 52, fill=GOLD3, width=4); d.arc((10,12,37,37), 292, 52, fill=STEEL2, width=2)
    for b in [(31,11,35,13),(34,16,38,18),(36,22,40,24),(28,8,30,9)]: d.rectangle(b, fill=GOLD3)


def portrait(d):
    # 96x96 hero portrait with stronger silhouette and cooler expression
    d.rectangle((0,0,95,95), fill=(23,15,13,255))
    # fiery background
    for tri, col in [([(0,95),(20,58),(30,95)], FLAME_R), ([(10,95),(40,42),(62,95)], FLAME_O), ([(48,95),(70,52),(95,95)], FLAME_R), ([(68,95),(86,34),(95,95)], FLAME_Y)]:
        d.polygon(tri, fill=col)
    d.polygon([(0,12),(18,6),(34,14),(16,22)], fill=(55,38,30,255))
    d.polygon([(95,14),(78,6),(62,14),(80,24)], fill=(55,38,30,255))

    # large fur shoulders
    d.polygon([(6,79),(18,42),(35,28),(33,59),(20,90)], fill=FUR3)
    d.polygon([(0,80),(16,38),(40,26),(36,58),(18,95)], fill=FUR)
    d.polygon([(90,79),(78,42),(61,28),(63,59),(76,90)], fill=FUR3)
    d.polygon([(96,80),(80,38),(56,26),(60,58),(78,95)], fill=FUR)

    # armored torso
    d.polygon([(26,90),(28,48),(42,40),(57,40),(71,48),(72,90)], fill=INK)
    for y in [50,58,66,74]: block(d,30,y,68,y+3,RED2)
    for x in [37,49,61]: block(d,x,48,x+3,84,GOLD2)
    block(d,40,46,58,49,GOLD3)

    # neck and face in 3/4 view
    block(d,38,22,62,48,SKIN2)
    block(d,36,19,64,28,SKIN3)
    # eyes / brows / beard
    block(d,40,29,48,32,BLACK)
    block(d,53,26,60,29,BLACK)
    block(d,44,31,57,52,BLACK)
    block(d,38,12,66,20,INK)
    block(d,40,6,64,14,BLACK)
    block(d,44,2,61,8,BLACK)
    block(d,47,6,58,9,GOLD)
    d.line((47,7,34,1), fill=GOLD2, width=2)
    d.line((58,7,72,2), fill=GOLD2, width=2)
    d.line((49,8,44,14), fill=GOLD3, width=1)
    d.line((56,8,62,14), fill=GOLD3, width=1)
    # stern cheekbone, nose, mouth highlight
    block(d,47,33,50,36,SKIN)
    block(d,49,36,52,38,RED3)
    block(d,51,41,56,43,SKIN)
    # highlight glint in eye
    px(d,56,27,WHITE)

    # diagonal yari in foreground
    d.line((70,94,92,24), fill=BROWN, width=5)
    d.line((72,94,94,24), fill=TAN, width=2)
    d.polygon([(88,26),(95,10),(95,29),(90,42)], fill=STEEL2)
    d.polygon([(89,28),(94,16),(95,25),(91,37)], fill=STEEL)
    d.line((79,48,83,36), fill=RED3, width=1)


def shibata_down(d):
    # fallen / kneeling sprite, 48x48
    d.ellipse((9,38,39,44), fill=SHADOW)
    d.polygon([(10,34),(18,28),(28,26),(34,30),(39,37),(31,40),(20,40)], fill=MAROON)
    block(d,16,25,31,34,INK)
    block(d,15,22,21,31,FUR); block(d,30,22,36,31,FUR)
    block(d,22,16,29,24,SKIN2)
    block(d,20,14,31,18,INK); block(d,22,12,30,14,BLACK)
    block(d,24,19,30,27,BLACK)
    d.line((30,36,44,18), fill=BROWN, width=2)
    d.line((31,36,45,18), fill=TAN, width=1)
    d.polygon([(42,19),(45,14),(47,19),(43,24)], fill=STEEL2)


def tree(d):
    # 48x48 pine-like tree
    block(d,20,30,27,44,BROWN)
    for tri in [([(24,4),(10,20),(38,20)]),([(24,12),(8,28),(40,28)]),([(24,20),(6,36),(42,36)])]:
        d.polygon(tri, fill=GREEN)
    for tri in [([(24,8),(14,20),(34,20)]),([(24,16),(12,28),(36,28)]),([(24,24),(10,36),(38,36)])]:
        d.polygon(tri, fill=GREEN2)
    d.rectangle((20,30,27,44), outline=BLACK)


def palisade(d):
    # wooden barricade
    block(d,3,29,45,33,BROWN)
    for x,h in [(6,8),(12,12),(18,10),(24,13),(30,9),(36,12),(42,8)]:
        d.polygon([(x,33),(x+2,18+h//2),(x+4,33)], fill=TAN)
        d.line((x+2,18+h//2,x+2,40), fill=BROWN, width=1)
    d.line((5,24,44,27), fill=BROWN, width=2)
    d.line((3,32,45,36), fill=BLACK, width=1)


def wall(d):
    # 48x48 castle wall segment
    block(d,2,18,46,45,STONE)
    for y in [18,25,32,39]: d.line((2,y,46,y), fill=STONE3, width=1)
    for x in [2,10,18,26,34,42]: d.line((x,18,x,45), fill=STONE2, width=1)
    # battlements
    for x in range(4,45,8): block(d,x,12,x+4,18,STONE)
    d.rectangle((2,18,46,45), outline=BLACK)


def tile_ground():
    im=Image.new('RGBA',(16,16),(73,61,40,255)); d=ImageDraw.Draw(im)
    patches=[(1,1,(59,50,36,255)),(5,2,(91,79,51,255)),(10,3,(62,56,40,255)),(13,1,(94,83,53,255)),(3,6,(86,74,48,255)),(7,7,(57,51,35,255)),(12,8,(98,84,58,255)),(2,11,(67,61,42,255)),(8,12,(102,91,58,255)),(14,13,(55,48,34,255)),(5,14,(85,74,44,255))]
    for x,y,c in patches: d.rectangle((x,y,x+2,y+1), fill=c)
    for x,y,c in [(2,4,GREEN),(6,10,GREEN2),(11,5,GREEN),(4,13,GREEN2),(9,1,(119,104,71,255)),(15,7,(116,98,61,255))]: d.rectangle((x,y,x,y), fill=c)
    im.save(out/'ground.png')


def tile_stone():
    im=Image.new('RGBA',(16,16),(79,76,71,255)); d=ImageDraw.Draw(im)
    for y in [0,5,10,15]: d.line((0,y,15,y), fill=(64,61,57,255), width=1)
    for x in [0,4,8,12,15]: d.line((x,0,x,15), fill=(95,91,86,255), width=1)
    for x,y in [(1,1),(6,2),(10,1),(3,7),(8,8),(13,6),(2,12),(11,13)]: d.rectangle((x,y,x+1,y), fill=(121,117,111,255))
    im.save(out/'stone.png')


sprite_defs = [
    ('shibata.png', shibata, (48,48)), ('shibata_walk.png', shibata_walk, (48,48)),
    ('enemy.png', enemy, (48,48)), ('spearman.png', spear, (48,48)), ('ally.png', ally, (48,48)),
    ('jar.png', jar, (48,48)), ('heal.png', heal, (48,48)), ('banner.png', banner, (48,48)),
    ('fire.png', fire, (48,48)), ('castle.png', castle, (48,48)), ('slash.png', slash, (48,48)),
    ('portrait.png', portrait, (96,96)), ('shibata_down.png', shibata_down, (48,48)),
    ('tree.png', tree, (48,48)), ('palisade.png', palisade, (48,48)), ('wall.png', wall, (48,48))
]
for name, fn, size in sprite_defs:
    save(name, fn, size)

tile_ground(); tile_stone()

# preview grid
names=['shibata','shibata_walk','ally','enemy','spearman','jar','heal','banner','fire','castle','slash','tree','palisade','wall']
preview=Image.new('RGBA',(len(names)*54+12,80),(29,24,21,255))
for i,n in enumerate(names):
    im=Image.open(out/f'{n}.png').resize((48,48), Image.NEAREST)
    preview.alpha_composite(im,(6+i*54,16))
preview.save(BASE/'sprite_preview.png')
print('assets generated at', out)
