from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/optimized'
OUT.mkdir(exist_ok=True)
manifest={}
for path in sorted((ROOT/'assets').glob('*.PNG')):
 im=Image.open(path).convert('RGBA')
 box=im.getchannel('A').point(lambda a:255 if a>12 else 0).getbbox()
 key=path.stem.replace(' ','_')
 crop=im.crop(box)
 crop.thumbnail((1536,1536) if key=='boden' else (768,768),Image.Resampling.LANCZOS)
 if key!='boden': crop=ImageOps.expand(crop,border=2,fill=(0,0,0,0))
 crop.save(OUT/(key+'.png'),optimize=True)
 manifest[key]={'src':'assets/optimized/'+key+'.png','width':crop.width,'height':crop.height,'bounds':box}
(ROOT/'js/assets.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
sheet=Image.new('RGB',(1000,1230),'#dddaca');d=ImageDraw.Draw(sheet)
for i,(key,item) in enumerate(manifest.items()):
 im=Image.open(ROOT/item['src']);im.thumbnail((185,170));xy=(i%5*200,i//5*205);sheet.paste(im,xy,im);d.text((xy[0],xy[1]+175),key,fill='black')
sheet.save(ROOT.parent/'cropped-contact.jpg')
print('Prepared',len(manifest),'textures')
# Separate disconnected plants/clouds so every cutout can stand on the ground.
from PIL import ImageFilter
for key in ['blumen_1','blumen_2','blumen_3','wolken','gras_mitte','gras_rechts_hinten_2','gras_vordere_mitte','gras_vorne','oma_erbse','bein_links','bein rechts','rollator','rad']:
 im=Image.open(ROOT/'assets'/(key+'.PNG')).convert('RGBA')
 mask=im.getchannel('A').resize((750,750)).point(lambda a:255 if a>24 else 0).filter(ImageFilter.MaxFilter(9))
 pixels=mask.load(); seen=set(); boxes=[]
 for y in range(750):
  for x in range(750):
   if not pixels[x,y] or (x,y) in seen: continue
   stack=[(x,y)];seen.add((x,y));xs=[];ys=[]
   while stack:
    a,b=stack.pop();xs.append(a);ys.append(b)
    for c,d in [(a-1,b),(a+1,b),(a,b-1),(a,b+1)]:
     if 0<=c<750 and 0<=d<750 and pixels[c,d] and (c,d) not in seen:seen.add((c,d));stack.append((c,d))
   if len(xs)>25:boxes.append((min(xs)*4,min(ys)*4,min(3000,(max(xs)+1)*4),min(3000,(max(ys)+1)*4)))
 for i,box in enumerate(boxes):
  crop=im.crop(box);b=crop.getchannel('A').getbbox();crop=crop.crop(b);crop.thumbnail((512,512));crop=ImageOps.expand(crop,border=2,fill=(0,0,0,0));name=f'{key.replace(chr(32),chr(95))}_part{i}';crop.save(OUT/(name+'.png'),optimize=True);manifest[name]={'src':'assets/optimized/'+name+'.png','width':crop.width,'height':crop.height,'bounds':[box[0]+b[0],box[1]+b[1],box[0]+b[2],box[1]+b[3]]}
(ROOT/'js/assets.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print('Including isolated cutouts:',len(manifest))

# Ignore isolated export specks when extracting character parts and the wheel.
for key in ['oma_erbse','bein_links','bein_rechts','rollator','rad']:
 parts=[v for k,v in manifest.items() if k.startswith(key+'_part')]
 if parts:
  best=max(parts,key=lambda v:(v['bounds'][2]-v['bounds'][0])*(v['bounds'][3]-v['bounds'][1]))
  manifest[key]=dict(best)
(ROOT/'js/assets.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')

