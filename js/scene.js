/* All motion is procedural, uses a paused scene clock, and has no videos. */
AFRAME.registerComponent('storybook', {
 init() {
  this.clock=0; this.active=false; this.animators=[]; this.resources=[];
  this.el.addEventListener('targetFound',()=>{this.active=true;window.gardenTracking?.(true);});
  this.el.addEventListener('targetLost',()=>{this.active=false;window.gardenTracking?.(false);});
  this.ready=this.build().catch(error=>{window.gardenError?.(error);throw error;});
 },
 async build() {
  const T=AFRAME.THREE, C=GARDEN_CONFIG;
  const response=await fetch('js/assets.json');if(!response.ok)throw Error('Die Texturliste fehlt.');
  this.manifest=await response.json();this.textures={};
  const keys=['boden','oma_erbse','bein_links','bein_rechts','rollator','rad',
   'gras_hinten_links','gras_hinten_mitte','gras_hinten_rechts',
   ...Object.keys(this.manifest).filter(k=>k.includes('_part')),
   ...['blau','gelb','rosa'].flatMap(c=>[1,2].map(n=>`schmetterling_${c}_${n}`))];
  const loader=new T.TextureLoader();
  await Promise.all(keys.map(async key=>{
   const tex=await loader.loadAsync(this.manifest[key].src);tex.colorSpace=T.SRGBColorSpace;
   tex.anisotropy=Math.min(4,this.el.sceneEl.renderer.capabilities.getMaxAnisotropy());
   this.textures[key]=tex;this.resources.push(tex);
  }));
  const root=new T.Group();root.rotation.x=Math.PI/2;this.el.setObject3D('garden',root);this.root=root;
  const group=(parent,pos)=>{const g=new T.Group();g.position.set(...pos);parent.add(g);return g;};
  const shadowSources=[];
  const sprite=(key,height,parent,pos=[0,0,0],width)=>{
   const info=this.manifest[key];const geo=new T.PlaneGeometry(width||height*info.width/info.height,height);
   // Alpha cutouts write depth, so back layers cannot show through opaque illustrations.
   const mat=new T.MeshBasicMaterial({map:this.textures[key],side:T.DoubleSide,alphaTest:0.18,transparent:false,depthWrite:true,toneMapped:false});
   const mesh=new T.Mesh(geo,mat);mesh.position.set(...pos);parent.add(mesh);this.resources.push(geo,mat);
   if(['oma_erbse','bein_links','bein_rechts','rollator','rad'].includes(key))shadowSources.push({key,mesh,width:width||height*info.width/info.height,height});
   return mesh;
  };
  const ground=sprite('boden',C.groundSize,root,[0,0.001,0],C.groundSize);ground.rotation.x=-Math.PI/2;
  const character=group(root,C.character.position);
  const S=C.character.scale, baseline=C.character.baseline;
  const sourcePosition=key=>{
   const [l,t,r,b]=this.manifest[key].bounds;
   return [((l+r)/2-C.character.originX)*S,(baseline-(t+b)/2)*S,0];
  };
  const bodyBounds=this.manifest.oma_erbse.bounds;
  const body=sprite('oma_erbse',(bodyBounds[3]-bodyBounds[1])*S,character,sourcePosition('oma_erbse'));
  // Avoid coplanar hand/handle fragments competing in the depth buffer.
  // Both still share the same character plane, with only a paper-thickness offset.
  body.position.z=C.grandma.surfaceOffset;
  const bodyY=body.position.y;
  const legs=['bein_links','bein_rechts'].map((key,i)=>{
   const [l,t,r,b]=this.manifest[key].bounds;
   // Original hip spacing; extend each leg to the shared ground baseline.
   const x=((l+r)/2-C.character.originX)*S;
   const height=(baseline-t)*S;
   const pivot=group(character,[x,height,-0.001]);
   sprite(key,height,pivot,[0,-height/2,0],(r-l)*S);
   return {pivot,phase:i*Math.PI};
  });
  this.animators.push(t=>{
   body.position.y=bodyY+C.grandma.bob*Math.sin(t*C.grandma.speed*2);
   legs.forEach(({pivot,phase})=>{pivot.rotation.x=C.grandma.legSwing*Math.sin(t*C.grandma.speed+phase);});
  });
  const walkerBounds=this.manifest.rollator.bounds;
  const walkerPosition=sourcePosition('rollator');
  const walker=group(character,[walkerPosition[0],0,C.walker.depthOffset]);
  sprite('rollator',(walkerBounds[3]-walkerBounds[1])*S,walker,[0,walkerPosition[1],0]);
  const walkerCentre=(walkerBounds[0]+walkerBounds[2])/2;
  C.walker.wheelMounts.forEach(mount=>{
   const x=(mount.x-walkerCentre)*S;
   // The lower rod end meets the upper part of the tyre; rear tyres are
   // genuinely behind the opaque frame/bag, not just rendered darker.
   const y=(baseline-mount.y)*S-C.walker.wheelDiameter*0.12;
   const z=mount.front?C.walker.wheelDepth:-C.walker.wheelDepth;
   const wheel=sprite('rad',C.walker.wheelDiameter,walker,[x,y,z],C.walker.wheelDiameter);
   this.animators.push(t=>{wheel.rotation.z=-(t*C.walker.wheelSpeed)%(Math.PI*2);});
  });
  const plant=(key,pos,height,phase)=>{
   const pivot=group(root,pos);sprite(key,height,pivot,[0,height/2,0]);
   this.animators.push(t=>{pivot.rotation.z=C.wind.amplitude*Math.sin(t*C.wind.speed+phase);pivot.rotation.x=0.022*Math.sin(t*C.wind.speed*0.7+phase);});
  };
  // Interleave flowers and grasses across each depth band rather than
  // concentrating the original drawing's plants around the outer edges.
  const bands=[['gras_hinten_links','gras_hinten_mitte','gras_hinten_rechts'],
   ['gras_rechts_hinten_2','gras_mitte','blumen_1'],
   ['gras_vordere_mitte','blumen_2'],['blumen_3','gras_vorne']];
  let plantIndex=0;
  bands.forEach(sources=>{
   const entries=Object.entries(this.manifest).filter(([key])=>{
    const source=key.replace(/_part\d+$/,'');
    return sources.includes(source)&&(key.includes('_part')||!Object.keys(this.manifest).some(k=>k.startsWith(source+'_part')));
   }).sort((a,b)=>(a[1].bounds[0]+a[1].bounds[2])-(b[1].bounds[0]+b[1].bounds[2]));
   entries.forEach(([key,info],i)=>{
    const [l,t,r,b]=info.bounds, n=C.plants.sourceWidth;
    const source=key.replace(/_part\d+$/,'');
    const x=entries.length===1?0:-C.plants.halfWidth+2*C.plants.halfWidth*i/(entries.length-1);
    const depth=C.plants.depths[source]+((i%3)-1)*C.plants.depthSpread;
    plant(key,[x,C.plants.groundHeight,depth],(b-t)/n*C.plants.heightScale,plantIndex++*1.73);
   });
  });
  // Soft silhouette projections onto the card, independent of camera direction.
  // These lightweight decals follow the character motion; no shadow-map pass.
  const shadowGroup=group(root,[0,C.shadows.height,0]);shadowGroup.name='character-shadows';
  const projection=new T.Matrix4().set(1,0,0,0, 0,0,0,0, 0,-C.shadows.length,1,0, 0,0,0,1);
  const inverseRoot=new T.Matrix4(),local=new T.Matrix4();
  const shadowPairs=shadowSources.map(source=>{
   const info=this.manifest[source.key];
   const material=new T.ShaderMaterial({
    uniforms:{map:{value:this.textures[source.key]},opacity:{value:C.shadows.opacity},
     texel:{value:new T.Vector2(C.shadows.softness/info.width,C.shadows.softness/info.height)}},
    vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`uniform sampler2D map;uniform float opacity;uniform vec2 texel;varying vec2 vUv;
     float a(vec2 p){if(p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0)return 0.0;return texture2D(map,p).a;}
     void main(){float alpha=a(vUv)*4.0;
      alpha+=2.0*(a(vUv+vec2(texel.x,0.0))+a(vUv-vec2(texel.x,0.0))+a(vUv+vec2(0.0,texel.y))+a(vUv-vec2(0.0,texel.y)));
      alpha+=a(vUv+texel)+a(vUv-texel)+a(vUv+vec2(texel.x,-texel.y))+a(vUv+vec2(-texel.x,texel.y));
      gl_FragColor=vec4(0.08,0.12,0.06,alpha*opacity/16.0);}`,
    transparent:true,depthWrite:false,depthTest:true,side:T.DoubleSide,toneMapped:false});
   const mesh=new T.Mesh(source.mesh.geometry,material);mesh.matrixAutoUpdate=false;mesh.frustumCulled=false;
   shadowGroup.add(mesh);this.resources.push(material);return {source:source.mesh,shadow:mesh};
  });
  const updateShadows=()=>{
   root.updateWorldMatrix(true,true);inverseRoot.copy(root.matrixWorld).invert();
   shadowPairs.forEach(({source,shadow})=>{
    local.multiplyMatrices(inverseRoot,source.matrixWorld);
    shadow.matrix.multiplyMatrices(projection,local);shadow.matrixWorldNeedsUpdate=true;
   });
  };
  updateShadows();this.animators.push(updateShadows);
  const clouds=Object.keys(this.manifest).filter(k=>k.startsWith('wolken_part'));
  C.clouds.forEach((pos,i)=>{const cloud=sprite(clouds[i%clouds.length],(i?0.08:0.105)*C.cloudScale,root,pos);this.animators.push(t=>{cloud.position.x=pos[0]+0.018*Math.sin(t*0.3+i);cloud.position.y=pos[1]+0.007*Math.sin(t*0.6+i);});});
  ['blau','gelb','rosa'].forEach((color,i)=>{
   const pivot=group(root,[0,0,0]);
   // Equal canvases on screen avoid a vertical jump when switching wing poses.
   const frames=[1,2].map(n=>sprite(`schmetterling_${color}_${n}`,0.058,pivot));
   this.animators.push(t=>{const a=t*C.butterflies.speed+i*2.094;
    pivot.position.set(0.34*Math.sin(a),0.38+0.13*Math.sin(a*2+i),0.28*Math.cos(a));
    pivot.rotation.z=0.20*Math.sin(a+0.7);pivot.rotation.y=0.30*Math.sin(a);
    const frame=Math.floor(t*C.butterflies.flapsPerSecond*2+i)%2;frames.forEach((m,n)=>m.visible=n===frame);
   });
  });
  this.el.emit('garden-ready');
 },
 tick(time,delta) {if(!this.active||document.hidden)return;this.clock+=Math.min(delta,50)/1000;this.animators.forEach(fn=>fn(this.clock));},
 remove(){this.resources.forEach(r=>r.dispose());this.el.removeObject3D('garden');}
});
