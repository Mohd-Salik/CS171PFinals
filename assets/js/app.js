document.addEventListener( 'keypress', onDocumentKeyPress, false );
document.addEventListener( 'click', onDocumentKeyPress, false );

// global variable
let textureOcean = new THREE.TextureLoader().load("assets/textures/water.jpg");
let cloudTexture = new THREE.TextureLoader().load("assets/textures/cloud.png");
let materialOcean = new THREE.MeshPhongMaterial( { map: textureOcean, shininess: 100, transparent: true} );
let materialOceanHorizon = new THREE.MeshLambertMaterial( { map: textureOcean} );
materialOcean.opacity = 0.8;

let ambient, directionalLight, orangeLight, redLight, oceanLight;
let controls, scene, camera, renderer, composer;
let meshWater, meshWaterHorizon, sun, beach, mountains, human;
let light, lightHelper;

let cloudParticles = [];
let waterRising = true;
let waterCounter = 0;
let rotationCounter = 0.01;

// load lights
function loadLights(){
   ambient = new THREE.AmbientLight(0x555555, 1.5);
   orangeLight = new THREE.PointLight(0xff8c00,50,200,1.7);
   orangeLight.position.set(98, 43, -176);
   blueLight = new THREE.PointLight(0xffa07a,10,280,1.7);
   blueLight.position.set(120, 66, -50);
   redLight = new THREE.PointLight(0xff6347,50,250,1.7);
   redLight.position.set(98, 76, 74);
   oceanLight = new THREE.SpotLight(0xff4500,1.5);
   oceanLight.position.set(90, 240, -22);
   oceanLight.target.position.set(48, 0, 400);
   lightHelper2 = new THREE.PointLightHelper(orangeLight);
   scene.add(ambient, orangeLight, blueLight, redLight, oceanLight, oceanLight.target, lightHelper2);
}

function init(){
   scene = new THREE.Scene();
   // scene.fog = new THREE.Fog(0x000000, 10, 4000);
   camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 5000 );
   camera.position.set(0, 20, 700);

   //background skybox
   let backgroundMaterialArray = [];
   for (var i = 0; i < 6; i++)
   backgroundMaterialArray.push( new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load('assets/textures/background.jpg'),
      side: THREE.BackSide
   }));
   let backgroundBox = new THREE.Mesh(
      new THREE.CubeGeometry( 3000, 1500, 1500 ), 
      new THREE.MeshFaceMaterial( backgroundMaterialArray )
   );
   scene.add(backgroundBox);
   backgroundBox.position.y = 600;
   backgroundBox.position.z = 200;

   //ring clouds - (quantity, size, radius, spacing, x_fill, y_fill, z_fill, rotation, opacity)
   newCloud(20, 100, 40, 40, 100, 30, -280, 0.4, 0.9);
   newCloud(50, 80, 80, 30, 100, 30, -240, 0.8, 0.9);
   newCloud(100, 60, 100, 10, 110, 50, -220, 0.8, 0.9);
   newCloud(150, 100, 150, 30, 90, 60, -120, 0.8, 0.9);
   newCloud(150, 150, 220, 30, 70, 80, -10, 0.8, 0.5);
   newCloud(100, 200, 320, 30, 50, 150, 100, 0.8, 0.4);
   newCloud(100, 250, 350, 30, 20, 200, 300, 0.8, 0.3);

   //flat clouds - (size, x_spacing, y_spacing, x_fill, y_fill, z_fill)
   newCloudFilling(150, 300, 30, -80, -80, 50, 0.7);
   newCloudFilling(250, 500, 30, -200, -100, 250, 0.7);
   newCloudFilling(150, 200, 80, -200, 10, 20, 0.3);
   newCloudFilling(150, 200, 80, 250, 10, 20, 0.4);
   newCloudFilling(150, 100, 80, -210, -20, 200, 0.3);

   //ocean
   meshWater = new THREE.Mesh( new THREE.BoxBufferGeometry(800, 300, 50), materialOcean);
   meshWater.rotation.x -= Math.PI / 2;
   meshWater.position.set(312, -34, 482);
   meshWater.receiveShadow = true;
   meshWaterHorizon = new THREE.Mesh( new THREE.BoxBufferGeometry(900, 100, 50), materialOceanHorizon);
   meshWaterHorizon.rotation.x -= Math.PI / 2;
   meshWaterHorizon.position.set(-2, -32, 374);
   meshWaterHorizon.rotation.x = -1.47;
   meshWaterHorizon.receiveShadow = true;
   scene.add(meshWaterHorizon, meshWater);

   //sun geometry
   let sunObject = new THREE.TextureLoader().load("assets/textures/sun.jpg", function(loadsun){
      let sunGeometry = new THREE.SphereBufferGeometry(30, 12, 8);
      let sunMaterial = new THREE.MeshPhongMaterial({map: loadsun, transparent: true});
      sunMaterial.opacity  = 0.8;
      sun = new THREE.Mesh(sunGeometry, sunMaterial);
      sun.castShadow = true; sun.receiveShadow = true;
      sun.position.set(126, 65, -238);
      scene.add(sun);
   });   

   //impot 3d models
   let loader = new THREE.GLTFLoader();
   loader.load( 'assets/models/beach/scene.gltf', function ( gltf ) {
      scene.add( gltf.scene );
      beach = gltf.scene;
      gltf.scene.scale.set(20, 20, 20);
      gltf.scene.position.set(-86, 45, 594);
      gltf.scene.rotation.y = -4.98;
      gltf.scene.rotation.z -2.7;
      gltf.scene.castShadow = true; gltf.scene.receiveShadow = true;
   }, undefined, function ( error ) {
      console.error( error );
   } );
   loader.load( 'assets/models/beach/scene.gltf', function ( gltf ) {
      scene.add( gltf.scene );
      mountains = gltf.scene;
      gltf.scene.scale.set(100, 100, 100);
      gltf.scene.position.set(-628, 261, 48);
      gltf.scene.rotation.y = -4.98;
      gltf.scene.rotation.x = 6.79;
   }, undefined, function ( error ) {
      console.error( error );
   } );
   loader.load( 'assets/models/human/scene.gltf', function ( gltf ) {
      scene.add( gltf.scene );
      human = gltf.scene;
      gltf.scene.scale.set(2, 2, 2);
      gltf.scene.position.set(-52, 34, 554);
      gltf.scene.rotation.y = 3.38;
   }, undefined, function ( error ) {
      console.error( error );
   } );

   loadLights();
   loadRenderer();
   initPost();
   animate();
}

// function to animate put movements here
function animate(){
   controls.update();
   cloudParticles.forEach(p => {
      p.rotation.z -=0.006;
   });
   animateWater();
   composer.render();
   // renderer.render(scene, camera);
   requestAnimationFrame(animate);
}

//water animation
function animateWater(){
   if (meshWater.position.x == -82){meshWater.position.x = 310;}
   meshWater.position.x -= 1;
   if (waterRising == true){
      if (waterCounter == 50){
         meshWater.position.y += 0.03;
         waterCounter = 0;
         waterRising = false;
      }
      else{
         meshWater.position.y += 0.03;
         waterCounter++;
      }
   }
   else if (waterRising == false){
      if (waterCounter == 50){
         meshWater.position.y -= 0.03;
         waterCounter = 0;
         waterRising = true;
      }
      else{
         meshWater.position.y -= 0.03;
         waterCounter++;
      }
   }
}

//load post processing
function initPost(){
   const bloom = new POSTPROCESSING.BloomEffect({
      blendFunction: POSTPROCESSING.BlendFunction.COLOR_DODGE,
      kernelSize: POSTPROCESSING.KernelSize.SMALL,
      luminanceSmoothing: 2,
      luminanceThreshold: 0.35,
      useLuminanceFilter: false
   });
   bloom.blendMode.opacity.value = 1.5;
   let effects = new POSTPROCESSING.EffectPass(camera, bloom);
   effects.renderToScreen = true;
   composer = new POSTPROCESSING.EffectComposer(renderer);
   composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));
   composer.addPass(effects);
}

//function for creating ring clouds
function newCloud(quantity, size, radius, spacing, x_fill, y_fill, z_fill, rotation, opacity){
   for(let p=0; p<quantity; p++) {
      let cloudMaterial = new THREE.MeshLambertMaterial({map: cloudTexture, transparent: true});
      let cloudObject = new THREE.Mesh(new THREE.PlaneBufferGeometry(size, size), cloudMaterial);
      cloudObject.position.set(
         (Math.random() * spacing) + (Math.sin(rotationCounter) * radius) + x_fill,
         (Math.random() * spacing) + (Math.cos(rotationCounter) * radius) + y_fill,
         Math.random() * 50 + z_fill
      );
      rotationCounter += rotation;
      cloudObject.material.opacity = opacity;
      cloudObject.rotation.z = Math.random()*20;
      cloudParticles.push(cloudObject);
      scene.add(cloudObject);
   }
}

// function for creating flat clouds
function newCloudFilling(size, x_spacing, y_spacing, x_fill, y_fill, z_fill, opacity){
   for(let p=0; p<20; p++) {
      let cloudMaterial = new THREE.MeshLambertMaterial({map: cloudTexture, transparent: true});
      let cloudObject = new THREE.Mesh(new THREE.PlaneBufferGeometry(size, size), cloudMaterial);
      cloudObject.position.set(
         (Math.random() * x_spacing) + x_fill,
         (Math.random() * y_spacing) + y_fill,
         Math.random() * 50 + z_fill
      );
      rotationCounter += 0.8;
      cloudObject.material.opacity = opacity;
      cloudObject.rotation.z = Math.random()*20;
      cloudParticles.push(cloudObject);
      scene.add(cloudObject);
   }
}

// renderer options
function loadRenderer(){
   renderer = new THREE.WebGLRenderer();
   renderer.setSize( window.innerWidth, window.innerHeight );
   renderer.shadowMap.enabled = true;
   renderer.shadowMap.type = THREE.BasicShadowMap;
   document.body.appendChild(renderer.domElement);
   lightHelper2.update();
   controls = new THREE.OrbitControls (camera, renderer.domElement);
   controls.target.set( 0, 20, 0);
}

// default keypress function
function onDocumentKeyPress(event){
   var keyCode = event.which;
   console.log(keyCode);
   if (keyCode == 114){camera.position.set(0, 20, 700);}
}

window.onload = init;
