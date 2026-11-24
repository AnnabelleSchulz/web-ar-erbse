/* Units: card width = 1. Coordinates: [right, height, depth]. */
window.GARDEN_CONFIG = {
 targetIndex:0, groundSize:1.015,
 // Common pixel-to-world transform preserves the original hand/grip alignment.
 character:{position:[0,0,0.095],sourceWidth:3000,originX:1500,baseline:2713,scale:0.00030},
 grandma:{surfaceOffset:0.003,bob:0.002,speed:1.7,legSwing:0.13},
 walker:{depthOffset:0.008,wheelDiameter:0.098,wheelDepth:0.009,wheelSpeed:1.15,
  // Endpoints in the original 3000px illustration, front pair first.
  wheelMounts:[{x:1858,y:2520,front:true},{x:2382,y:2450,front:true},
   {x:1465,y:2430,front:true},{x:2184,y:2420,front:false}]},
 shadows:{opacity:0.22,length:0.32,height:0.002,softness:3.0},
 plants:{halfWidth:0.43,depthSpread:0.018,sourceWidth:3000,heightScale:1,groundHeight:0.003,
  // Negative depth = back of the card; positive depth = front.
  depths:{gras_hinten_links:-0.40,gras_hinten_mitte:-0.44,gras_hinten_rechts:-0.37,
   gras_rechts_hinten_2:-0.23,gras_mitte:-0.19,blumen_1:-0.15,
   gras_vordere_mitte:0.14,blumen_2:0.20,blumen_3:0.39,gras_vorne:0.44}},
 wind:{amplitude:0.045,speed:1.1},
 butterflies:{speed:0.42,flapsPerSecond:7},
 // Lower adaptive gain damps positional noise; lower cutoff also damps slow tilt jitter.
 // Trade-off: more lag during camera motion. Validate on iPhone/Safari with the print.
 tracking:{filterMinCF:0.0003,filterBeta:0.01,warmupTolerance:5,missTolerance:8},
 cloudScale:1.70,
 clouds:[[-0.24,0.67,-0.39],[0.29,0.57,-0.42]]
};
