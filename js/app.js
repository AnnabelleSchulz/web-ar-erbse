(() => {
 const $=id=>document.getElementById(id);
 const preview=new URLSearchParams(location.search).get('preview')==='1';
 let scene,anchor,previewControls,running=false,starting=false;
 window.gardenError=error=>{
  console.error(error);$('error').hidden=false;$('welcome').hidden=true;$('guide').hidden=true;
  const name=error?.name;
  $('error-text').textContent=name==='NotAllowedError'?'Bitte erlaube den Kamerazugriff in den Browsereinstellungen und lade die Seite neu.':name==='NotFoundError'?'Es wurde keine verfügbare Kamera gefunden.':error?.message||'Die Kamera oder das Tracking konnte nicht gestartet werden. Prüfe die Kameraberechtigung und öffne die Seite über HTTPS.';
 };
 window.gardenTracking=found=>{
  if(!running||preview)return;
  $('status').textContent=found?'Omas Wiese ist erwacht.':'Karte suchen · Kamera langsam bewegen';
  $('guide').hidden=found;
 };
 if(!window.AFRAME||!AFRAME.components['mindar-image']){gardenError(Error('A-Frame oder MindAR konnte nicht geladen werden. Prüfe deine Internetverbindung und ob die CDN-Adressen erreichbar sind.'));return;}
 scene=document.createElement('a-scene');
 scene.setAttribute('renderer','antialias: true; alpha: true; colorManagement: true; precision: highp');
 scene.setAttribute('vr-mode-ui','enabled: false');scene.setAttribute('device-orientation-permission-ui','enabled: false');
 if(!preview){
  const t=GARDEN_CONFIG.tracking;
  scene.setAttribute('mindar-image',`imageTargetSrc: targets.mind; autoStart: false; uiLoading: no; uiScanning: no; uiError: no; maxTrack: 1; filterMinCF: ${t.filterMinCF}; filterBeta: ${t.filterBeta}; warmupTolerance: ${t.warmupTolerance}; missTolerance: ${t.missTolerance}`);
 }
 const camera=document.createElement('a-camera');camera.setAttribute('look-controls','enabled: false');camera.setAttribute('wasd-controls','enabled: false');
 camera.setAttribute('position',preview?'0 0.15 1.7':'0 0 0');scene.append(camera);
 scene.addEventListener('loaded',()=>{
  scene.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
  anchor=document.createElement('a-entity');
  if(preview){anchor.setAttribute('rotation','-90 0 0');}
  else anchor.setAttribute('mindar-image-target',`targetIndex: ${GARDEN_CONFIG.targetIndex}`);
  anchor.addEventListener('garden-ready',()=>{
   $('start').disabled=false;$('start').textContent='Wiesenwelt entdecken';
   if(preview){$('welcome').hidden=true;$('hud').hidden=false;$('status').textContent='Ziehen: drehen · Scrollen / Pinch: zoomen';$('stop').textContent='Zur AR-Kamera';document.body.classList.add('preview');anchor.components.storybook.active=true;running=true;previewControls=window.createGardenPreview(scene,camera);}
  });
  anchor.setAttribute('storybook','');scene.append(anchor);
 }, {once:true});
 scene.addEventListener('arError',()=>gardenError(Error('Kamerastart fehlgeschlagen. Prüfe Berechtigung und HTTPS-Verbindung.')));
 document.body.append(scene);
 $('start').addEventListener('click',async()=>{
  if(starting||running)return;
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){gardenError(Error('Die Kamera benötigt HTTPS (z. B. GitHub Pages) oder localhost. Direktes Öffnen der HTML-Datei genügt nicht.'));return;}
  starting=true;$('start').disabled=true;$('start').textContent='Kamera wird gestartet …';
  try{
   await scene.systems['mindar-image-system'].start();
   running=true;document.body.classList.add('ar');$('welcome').hidden=true;$('hud').hidden=false;
   gardenTracking(anchor.components.storybook.active);
  }catch(e){scene.systems['mindar-image-system']?.stop();gardenError(e);}
  finally{starting=false;$('start').disabled=false;}
 });
 const stop=()=>{if(!running)return;running=false;anchor.components.storybook.active=false;if(!preview)scene.systems['mindar-image-system'].stop();};
 $('stop').addEventListener('click',()=>{stop();location.href=location.pathname;});
 document.addEventListener('visibilitychange',()=>{
  if(!running||preview)return;
  const system=scene.systems['mindar-image-system'];
  if(document.hidden)system.pause();else system.unpause();
 });
 window.addEventListener('pagehide',()=>{previewControls?.dispose();stop();});
})();


