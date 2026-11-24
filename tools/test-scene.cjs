const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let component;
// Minimal affine matrix adapter; rendering/shader compilation needs browser QA.
class Matrix4 {
 constructor(){this.e=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];}
 set(...v){this.e=v;return this;}
 copy(m){this.e=[...m.e];return this;}
 multiplyMatrices(a,b){const out=Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)out[i*4+j]+=a.e[i*4+k]*b.e[k*4+j];this.e=out;return this;}
 invert(){const a=Array.from({length:4},(_,i)=>[...this.e.slice(i*4,i*4+4),...[0,1,2,3].map(j=>+(i===j))]);
  for(let i=0;i<4;i++){let r=i;for(let j=i+1;j<4;j++)if(Math.abs(a[j][i])>Math.abs(a[r][i]))r=j;[a[i],a[r]]=[a[r],a[i]];const d=a[i][i];assert.ok(Math.abs(d)>1e-10);a[i]=a[i].map(v=>v/d);for(let j=0;j<4;j++)if(j!==i){const f=a[j][i];a[j]=a[j].map((v,k)=>v-f*a[i][k]);}}
  this.e=a.flatMap(r=>r.slice(4));return this;}
}
class Node {
 constructor(){this.children=[];this.matrix=new Matrix4();this.matrixWorld=new Matrix4();this.position={x:0,y:0,z:0,set(x,y,z){Object.assign(this,{x,y,z});}};this.rotation={x:0,y:0,z:0};}
 add(n){n.parent=this;this.children.push(n);}
 updateWorldMatrix(parents,children){
  if(parents&&this.parent)this.parent.updateWorldMatrix(true,false);
  if(this.matrixAutoUpdate!==false){
   const {x,y,z}=this.rotation,c=Math.cos,s=Math.sin;
   const rx=new Matrix4().set(1,0,0,0,0,c(x),-s(x),0,0,s(x),c(x),0,0,0,0,1);
   const ry=new Matrix4().set(c(y),0,s(y),0,0,1,0,0,-s(y),0,c(y),0,0,0,0,1);
   const rz=new Matrix4().set(c(z),-s(z),0,0,s(z),c(z),0,0,0,0,1,0,0,0,0,1);
   this.matrix.multiplyMatrices(rx,ry).multiplyMatrices(this.matrix,rz);
   this.matrix.e[3]=this.position.x;this.matrix.e[7]=this.position.y;this.matrix.e[11]=this.position.z;
  }
  if(this.parent)this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);else this.matrixWorld.copy(this.matrix);
  if(children)this.children.forEach(n=>n.updateWorldMatrix(false,true));
 }
}
class Geometry {constructor(w,h){this.width=w;this.height=h;}dispose(){}}
class Material {constructor(options){Object.assign(this,options);}dispose(){}}
class Mesh extends Node {constructor(geometry,material){super();this.geometry=geometry;this.material=material;}}
const textures=[];
const ctx={console,document:{hidden:false},window:{},fetch:async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('js/assets.json','utf8'))}),AFRAME:{registerComponent(n,c){component=c;},THREE:{Matrix4,Vector2:class{constructor(x,y){this.x=x;this.y=y;}},ShaderMaterial:Material,Group:Node,PlaneGeometry:Geometry,MeshBasicMaterial:Material,Mesh,DoubleSide:2,SRGBColorSpace:'srgb',TextureLoader:class{async loadAsync(src){assert.ok(fs.existsSync(src),src);const t={src,dispose(){}};textures.push(t);return t;}}}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('js/config.js','utf8'),ctx);ctx.GARDEN_CONFIG=ctx.window.GARDEN_CONFIG;vm.runInContext(fs.readFileSync('js/scene.js','utf8'),ctx);
const events={};const instance=Object.assign({el:{sceneEl:{renderer:{capabilities:{getMaxAnisotropy:()=>4}}},addEventListener(n,fn){events[n]=fn;},setObject3D(n,o){this.object=o;},removeObject3D(){},emit(){}}},component);
(async()=>{instance.init();await instance.ready;const root=instance.root;assert.equal(root.rotation.x,Math.PI/2);assert.equal(root.children[0].rotation.x,-Math.PI/2);
const meshes=[];function walk(n){if(n instanceof Mesh)meshes.push(n);n.children.forEach(walk);}walk(root);
assert.equal(meshes.filter(m=>m.material.map?.src?.includes('/rad_part')).length,4);
assert.equal(meshes.filter(m=>/bein_(links|rechts)/.test(m.material.map?.src)).length,2);
assert.equal(meshes.filter(m=>/schmetterling_/.test(m.material.map?.src)).length,6);
assert.ok(meshes.filter(m=>m.material.map).every(m=>m.material.depthWrite && !m.material.transparent));
instance.tick(0,16);assert.equal(instance.clock,0);events.targetFound();instance.tick(16,16);assert.ok(instance.clock>0);const t=instance.clock;events.targetLost();instance.tick(32,16);assert.equal(instance.clock,t);events.targetFound();ctx.document.hidden=true;instance.tick(48,16);assert.equal(instance.clock,t);ctx.document.hidden=false;
for(let i=0;i<500;i++)instance.tick(i*16,16);
assert.equal(meshes.filter(m=>/schmetterling_/.test(m.material.map?.src)&&m.visible).length,3);
assert.ok(meshes.every(m=>Object.values(m.position).filter(v=>typeof v==='number').every(Number.isFinite)));
const C=ctx.GARDEN_CONFIG;
const character=root.children[1];
const body=meshes.find(m=>m.material.map?.src?.includes('/oma_erbse_part'));
const frame=meshes.find(m=>m.material.map?.src?.includes('/rollator_part'));
assert.ok(frame.parent.position.z+frame.position.z>body.position.z);
const wheels=meshes.filter(m=>m.material.map?.src?.includes('/rad_part'));
assert.equal(wheels.filter(m=>m.position.z>0).length,3);
assert.equal(wheels.filter(m=>m.position.z<0).length,1);
assert.ok(wheels.every(m=>m.geometry.height===0.098));
assert.ok(wheels.some(m=>Math.abs(m.rotation.z)>1));
const plants=Object.entries(instance.manifest).filter(([k])=>/^blumen_.*_part/.test(k)||/^gras_.*_part/.test(k)||['gras_hinten_links','gras_hinten_mitte','gras_hinten_rechts'].includes(k));
for(const [key,item] of plants){
 const pivot=root.children.find(n=>n.children.some(m=>m.material?.map?.src===item.src));
 assert.ok(pivot,key);const [l,t,r,b]=item.bounds;
 assert.ok(Math.abs(pivot.position.x)<=C.plants.halfWidth+1e-9,key);
 assert.ok(Math.abs(pivot.position.z-C.plants.depths[key.replace(/_part\d+$/,'')])<=C.plants.depthSpread+1e-9,key);
}
const bounds=instance.manifest.rollator.bounds, centre=(bounds[0]+bounds[2])/2;
wheels.forEach((wheel,i)=>{
 const mount=C.walker.wheelMounts[i];
 assert.ok(Math.abs(wheel.position.x-(mount.x-centre)*C.character.scale)<1e-9);
 assert.ok(Math.abs(wheel.position.y-((C.character.baseline-mount.y)*C.character.scale-C.walker.wheelDiameter*0.12))<1e-9);
});
const bands=[['gras_hinten_links','gras_hinten_mitte','gras_hinten_rechts'],['gras_rechts_hinten_2','gras_mitte','blumen_1'],['gras_vordere_mitte','blumen_2'],['blumen_3','gras_vorne']];
for(let i=0;i<bands.length-1;i++)assert.ok(Math.max(...bands[i].map(k=>C.plants.depths[k]))<Math.min(...bands[i+1].map(k=>C.plants.depths[k])));
for(const band of bands){
 const xs=plants.filter(([k])=>band.includes(k.replace(/_part\d+$/,''))).map(([key,item])=>root.children.find(n=>n.children.some(m=>m.material?.map?.src===item.src)).position.x).sort((a,b)=>a-b);
 const step=2*C.plants.halfWidth/(xs.length-1);
 for(let i=1;i<xs.length;i++)assert.ok(Math.abs(xs[i]-xs[i-1]-step)<1e-8);
}
const shadowGroup=root.children.find(n=>n.name==='character-shadows');assert.equal(shadowGroup.children.length,8);
assert.ok(shadowGroup.position.y>root.children[0].position.y);
for(const shadow of shadowGroup.children){
 assert.equal(shadow.material.depthWrite,false);assert.equal(shadow.material.transparent,true);
 assert.ok(shadow.matrix.e.every(Number.isFinite));
 assert.ok(shadow.matrix.e.slice(4,8).every(v=>Math.abs(v)<1e-9));
}
const leftWheel=wheels.reduce((a,b)=>a.position.x<b.position.x?a:b);assert.ok(leftWheel.position.z>0);
console.log('PASS: evenly spaced plant bands, forward walker/left wheel, eight planar animated silhouette shadows.');
console.log(`PASS: ${meshes.length} meshes, four wheels, two legs, six wing frames, target-plane transform, depth, tracking pause/resume, finite animation.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
