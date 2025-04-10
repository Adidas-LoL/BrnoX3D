import * as THREE from './three.js/build/three.module.js';
import { OrbitControls } from './three.js/src/extras/OrbitControls.js';
import { GLTFLoader } from './three.js/src/loaders/GLTFLoader.js';

//=========================================================================================================================================================
//==================================================================HTML FUNCTIONS======================================================================
//=========================================================================================================================================================
var resetCamera = true;

/*function restartButton() {
    resetCamera = false;  //sets variable that checks if the camera is locked or not

};
restartButton();*/



//=========================================================================================================================================================
//==================================================================ThreeJS FUNCTIONS===================================================================
//=========================================================================================================================================================

function main() {
//camera
    const canvas = document.querySelector( '#c' );
	  const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	  const fov = 45;
	  const aspect = 2; // the canvas default
	  const near = 0.1;
	  const far = 100;
	  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	  camera.position.set( 0, 10, 20 );    camera.position.z = 2;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color( 'cyan' );
    renderer.render(scene, camera);
  
//light
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
    
    const controls = new OrbitControls(camera, renderer.domElement);

//instances
    //calculate camera fov
    function frameArea( sizeToFitOnScreen, boxSize, boxCenter, camera ) {

      const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
      const halfFovY = THREE.MathUtils.degToRad( camera.fov * .5 );
      const distance = halfSizeToFitOnScreen / Math.tan( halfFovY );
      // compute a unit vector that points in the direction the camera is now
      // from the center of the box
      const direction = ( new THREE.Vector3() ).subVectors( camera.position, boxCenter ).normalize();
  
      // move the camera to a position distance units way from the center
      // in whatever direction the camera was from the center already
      camera.position.copy( direction.multiplyScalar( distance ).add( boxCenter ) );
  
      // pick some near and far values for the frustum that
      // will contain the box.
      camera.near = boxSize / 1000;
      camera.far = boxSize * 1000;
  
      camera.updateProjectionMatrix();
    }

    function followCamera(obj){
      camera.position.x = obj.position.x + 5;
      camera.position.y = obj.position.y + 20;
      camera.position.z = obj.position.z + 10;
      camera.lookAt(obj.position);
      console.log("test");
    };
  
    //map-----------
    //--------------
    {
      //load
    const gltfLoader = new GLTFLoader();
		gltfLoader.load( './webmap.gltf', ( gltf ) => {
		const map = gltf.scene;
		scene.add( map )

      //calculate camera fov, so it doesn't get buggy
      const box = new THREE.Box3().setFromObject( map );
      const boxSize = box.getSize( new THREE.Vector3() ).length();
			const boxCenter = box.getCenter( new THREE.Vector3() );

			// set the camera to frame the box
			frameArea( boxSize * 1.2, boxSize, boxCenter, camera );

			// update the Trackball controls to handle the new size
			controls.maxDistance = boxSize;
			controls.target.copy( boxCenter );
			controls.update();}
    )};

  //car model
  {
  const gltfLoader = new GLTFLoader();
		gltfLoader.load( './car.glb', ( gltf ) => {
		const car = gltf.scene;
    let size = 0.001;
    car.scale.set(size, size, size);
    car.position.y = 0.04;
		scene.add( car )
    console.log("Car rotation:", car.rotation);

  //--------------------------------------------------------
  //controls of car
  //--------------------------------------------------------
  let keysPressed = {};
  let maxspeed = 0.25;
  let acceleration = 0.005;  //  a
  let deacceleration = 0.05; // -a
  let velocity = 0;         // momentalni rychlost
  const rotationSpeed = 0.087222; //rychlost otaceni (v radianech "3.14/36" )

  document.addEventListener("keydown", function (event) {
    keysPressed[event.key] = true;
  });
  
  document.addEventListener("keyup", function (event) {
    keysPressed[event.key] = false;
  });
  
  function updateCarPosition() { 
    
  
    // Pohyb vpřed
    if (keysPressed["w"]) {
      if (velocity < maxspeed) {
      velocity += acceleration;
    }
    }
  
    // Pohyb zpět
    if (keysPressed["s"]) {
      if (velocity > -maxspeed) {
        velocity -= acceleration;
      }
    }
    if (velocity > deacceleration || velocity < -deacceleration) { //checkuje jestli je mozne se otocit (aby se neotacel na miste)
    // Otočení vpravo
    if (keysPressed["d"]) {
      car.rotation.y -= rotationSpeed;
    }
    
    // Otočení vlevo
    if (keysPressed["a"]) {
      car.rotation.y += rotationSpeed;
    }
    };
    //deakcelerace
    if (!keysPressed["w"] && !keysPressed["s"]) {
      if (velocity > 0) {
        velocity -= deacceleration;
        if (velocity < 0) velocity = 0;
      };

      if (velocity < 0) {
        velocity += deacceleration;
        if (velocity > 0) velocity = 0;
      };
    };
    
    car.position.x += velocity * Math.cos(car.rotation.y); //pocitani jak se auto pohybuje v souradnicovem prostoru
    car.position.z -= velocity * Math.sin(car.rotation.y);
   /* if (resetCamera === true) {
      followCamera(car);
    }*/
  }
  
  function gameLoop() {
    updateCarPosition();
    requestAnimationFrame(gameLoop);
    
  }
  gameLoop();

  })};














//canvas
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
      }


    function render(time) {
        time *= 0.001;  // convert time to seconds

        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
       
        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);



}


main();
