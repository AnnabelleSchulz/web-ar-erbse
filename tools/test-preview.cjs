const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
class Element{
 constructor(){this.listeners={};this.style={};this.clientHeight=800;}
 addEventListener(k,f){(this.listeners[k]??=[]).push(f);}
 removeEventListener(k,f){this.listeners[k]=this.listeners[k].filter(x=>x!==f);}
 setAttribute(){}focus(){}setPointerCapture(){}remove(){this.removed=true;}
 emit(k,data={}){this.listeners[k]?.forEach(f=>f({preventDefault(){},pointerType:'touch',...data}));}
}
let reset;const canvas=new Element(), position={set(x,y,z){Object.assign(this,{x,y,z});}};
const camera={object3D:{position,updateMatrixWorld(){}},getObject3D(){return {lookAt(t){assert.equal(t.y,0.28);}};}};
const ctx={window:{},document:{createElement(){return reset=new Element();},body:{append(){}}},AFRAME:{THREE:{Vector3:class{constructor(x,y,z){Object.assign(this,{x,y,z});}}}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('js/preview.js','utf8'),ctx);
const controls=ctx.window.createGardenPreview({canvas},camera);
const distance=()=>Math.hypot(position.x,position.y-0.28,position.z);
assert.ok(Math.abs(distance()-1.65)<1e-9);
canvas.emit('pointerdown',{pointerId:1,clientX:100,clientY:100});
canvas.emit('pointermove',{pointerId:1,clientX:200,clientY:140});assert.notEqual(position.x,0);
canvas.emit('pointerdown',{pointerId:2,clientX:300,clientY:140});
const before=distance();canvas.emit('pointermove',{pointerId:2,clientX:400,clientY:140});assert.ok(distance()<before);
canvas.emit('pointercancel',{pointerId:1});canvas.emit('pointerup',{pointerId:2});
canvas.emit('wheel',{deltaY:100000,deltaMode:0});assert.ok(distance()<=3.4+1e-9);
canvas.emit('keydown',{key:'r'});assert.ok(Math.abs(distance()-1.65)<1e-9);assert.equal(position.x,0);
canvas.emit('keydown',{key:'ArrowRight'});assert.notEqual(position.x,0);reset.emit('click');assert.equal(position.x,0);
// Large drags and repeated key presses must never orbit behind the scene.
canvas.emit('pointerdown',{pointerId:3,clientX:0,clientY:0});
canvas.emit('pointermove',{pointerId:3,clientX:10000,clientY:0});
assert.ok(Math.abs(Math.atan2(position.x,position.z)+75*Math.PI/180)<1e-9);
canvas.emit('pointermove',{pointerId:3,clientX:9990,clientY:0});
assert.ok(Math.atan2(position.x,position.z)>-75*Math.PI/180);
canvas.emit('pointerup',{pointerId:3});
for(let i=0;i<100;i++)canvas.emit('keydown',{key:'ArrowRight'});
assert.ok(Math.abs(Math.atan2(position.x,position.z)-75*Math.PI/180)<1e-9);
assert.ok(position.z>0);
reset.emit('click');assert.equal(position.x,0);
controls.dispose();assert.ok(reset.removed);assert.ok(Object.values(canvas.listeners).every(a=>a.length===0));
console.log('PASS: orbit drag, touch pinch, zoom limits, front-only orbit limits, keyboard, reset and event cleanup.');
