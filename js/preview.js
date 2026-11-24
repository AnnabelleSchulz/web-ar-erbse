/* Camera-free preview only. No controls or camera transforms are applied in AR. */
window.createGardenPreview = (scene,camera) => {
 const canvas=scene.canvas;
 const target=new AFRAME.THREE.Vector3(0,0.28,0);
 const defaults={yaw:0,pitch:0.52,distance:1.65};
 const state={...defaults}, pointers=new Map(), listeners=[];
 let pinchDistance=0;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 // Keep the camera within the front arc (75 degrees to either side).
 const maxYaw=75*Math.PI/180;
 const update=()=>{
  state.yaw=clamp(state.yaw,-maxYaw,maxYaw);
  state.pitch=clamp(state.pitch,0.08,1.4);state.distance=clamp(state.distance,0.85,3.4);
  const r=state.distance*Math.cos(state.pitch);
  camera.object3D.position.set(target.x+r*Math.sin(state.yaw),target.y+state.distance*Math.sin(state.pitch),target.z+r*Math.cos(state.yaw));
  camera.object3D.updateMatrixWorld(true);
  camera.getObject3D('camera').lookAt(target);
 };
 const on=(el,name,fn,options)=>{el.addEventListener(name,fn,options);listeners.push(()=>el.removeEventListener(name,fn,options));};
 const separation=()=>{const [a,b]=[...pointers.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;};
 canvas.style.touchAction='none';canvas.style.cursor='grab';canvas.tabIndex=0;
 canvas.setAttribute('aria-label','Drehbare Wiesenwelt: ziehen oder Pfeiltasten zum Drehen, Mausrad oder zwei Finger zum Zoomen, Taste R zum Zurücksetzen.');
 const reset=document.createElement('button');reset.id='preview-reset';reset.textContent='Ansicht zurücksetzen';document.body.append(reset);
 on(reset,'click',()=>{Object.assign(state,defaults);update();});
 on(canvas,'pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});pinchDistance=separation();canvas.style.cursor='grabbing';
 });
 on(canvas,'pointermove',e=>{
  const previous=pointers.get(e.pointerId);if(!previous)return;
  e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===1){state.yaw-=(e.clientX-previous.x)*0.007;state.pitch+=(e.clientY-previous.y)*0.006;}
  else{const distance=separation();if(pinchDistance>0&&distance>0)state.distance*=pinchDistance/distance;pinchDistance=distance;}
  update();
 });
 const release=e=>{pointers.delete(e.pointerId);pinchDistance=separation();if(!pointers.size)canvas.style.cursor='grab';};
 on(canvas,'pointerup',release);on(canvas,'pointercancel',release);on(canvas,'lostpointercapture',release);
 on(canvas,'wheel',e=>{e.preventDefault();const unit=e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1;state.distance*=Math.exp(clamp(e.deltaY*unit,-300,300)*0.0015);update();},{passive:false});
 on(canvas,'keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','r','R'].includes(e.key))return;
  e.preventDefault();
  if(e.key==='ArrowLeft')state.yaw-=0.12;if(e.key==='ArrowRight')state.yaw+=0.12;
  if(e.key==='ArrowUp')state.pitch+=0.08;if(e.key==='ArrowDown')state.pitch-=0.08;
  if(e.key==='+'||e.key==='=')state.distance*=0.9;if(e.key==='-')state.distance*=1.1;
  if(e.key.toLowerCase()==='r')Object.assign(state,defaults);update();
 });
 update();
 return {dispose(){listeners.forEach(remove=>remove());pointers.clear();reset.remove();canvas.style.touchAction='';canvas.style.cursor='';}};
};
