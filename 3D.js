import * as THREE from './three.js/build/three.module.js';
import { OrbitControls } from './three.js/src/extras/OrbitControls.js';
import { GLTFLoader } from './three.js/src/loaders/GLTFLoader.js';
//import * as CANNON from './cannoon/src/cannon.js';
//=========================================================================================================================================================
//==================================================================HTML FUNCTIONS======================================================================
//=========================================================================================================================================================
var resetCamera = true;
let car = null;
/*function restartButton() {
    resetCamera = false;  //sets variable that checks if the camera is locked or not

};
restartButton();*/







function main() {
//=========================================================================================================================================================
//=================================================================CANNON JS FUNCTIONS==================================================================
//=========================================================================================================================================================
/*const world = new window.CANNON.World({
  gravity: new window.CANNON.Vec3(0, -9.82, 0),
});
world.broadphase = new window.CANNON.NaiveBroadphase(); 
world.solver.iterations = 10;*/

//=========================================================================================================================================================
//==================================================================ThreeJS FUNCTIONS===================================================================
//=========================================================================================================================================================
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
		gltfLoader.load( './Brno3D.glb', ( gltf ) => {
		const map = gltf.scene;
    map.traverse((child) => {
      console.log(child.name); // vypíše ti jména všech objektů
  });
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
    //map physics
    /*const groundBody = new window.CANNON.Body({
        mass: 0, // statické těleso (budovy a podlaha)
        shape: new window.CANNON.Box(new window.CANNON.Vec3(50, 1, 50)), // orientační velikost mapy
        position: new window.CANNON.Vec3(0, 0, 0),
      });
    world.addBody(groundBody);*/

  //point class----------
  //----------------
  
  //point variabley (pro pouziti v CSS, pro pridani definuj novy objekt pod class Checkpoint, MUSIS DAT 5 ATRIBUTU [x,y,z, nastav variable na true, nastav variable na false], jinak to crashne)
  let variableA = false;
  let variableB = false;
  let variableC = false;


  //----------------------------------------------------------
  class Checkpoint {
    constructor(x, y, z, onCollide, onExit) {

      //spawn object-------------------
      const geometry = new THREE.ConeGeometry(5, 30, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.set(x, y, z);
      scene.add(this.mesh);

      //declare anonymous func---------
      this.onCollide = onCollide
      this.collided = false;
      this.onExit = onExit;
    }
    
    //check for collision--------------
    checkCollision(target) {
      //if (this.collided) return; 
      const distance = target.position.distanceTo(this.mesh.position);
      const collisionRadius = 10.5;
      if (distance < collisionRadius) {
        this.collided = true;
        console.log("Worked!");
        this.onCollide();

      } else {

        this.collided = false;
        this.onExit();
      }
    }
  }


  let checkpoint1 = new Checkpoint(10, 0, 20, () => {
    variableA = true;
    console.log("Changed A")
  }, () => {
    variableA = false;
  });
  
  let checkpoint2 = new Checkpoint(50, 0, -30, () => {
    variableB = true;
    console.log("Changed B")
  }, () => {
    variableB = false;
  });
  
  let checkpoint3 = new Checkpoint(-15, 0, 60, () => {
    variableC = true;
    console.log("Changed C")
  }, () => {
    variableC = false;
  });
  //only one cone----------------
  /*const coneGeometry = new THREE.ConeGeometry(5, 30, 32); // (polomer zakladu, vyska, segmenty)
  const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  scene.add(cone);
  // cone (point1) position
  cone.position.set(50, 0, -50);*/

  

  //car model-------
  //----------------
  {
  const gltfLoader = new GLTFLoader();
		gltfLoader.load( './helicopter.glb', ( gltf ) => {
		const car = gltf.scene;
    let size = 0.1;
    car.scale.set(size, size, size);
    //car.position.y = 0.04;
    car.position.y = 10;
		scene.add( car )
    console.log("Car rotation:", car.rotation);


  //car physics cannon js
    /*const carBody = new window.CANNON.Body({
      mass: 150, // váha auta
      shape: new window.CANNON.Box(new window.CANNON.Vec3(0.5, 0.25, 1)), // odhadni tvar auta (poloviční rozměry)
      position: new window.CANNON.Vec3(0, 0.5, 0), // startovní pozice
    });
    world.addBody(carBody);*/
  //--------------------------------------------------------
  //controls of car
  //--------------------------------------------------------
  let keysPressed = {};
  let maxspeed = 0.25;
  let acceleration = 0.005;  //  a
  let deacceleration = 0.05; // -a
  let velocity = 0;         // momentalni rychlost
  const rotationSpeed = 0.05; //rychlost otaceni (v radianech "3.14/36" )

  document.addEventListener("keydown", function (event) {
    keysPressed[event.key] = true;
  });
  
  document.addEventListener("keyup", function (event) {
    keysPressed[event.key] = false;
  });
  
  function updateCarPosition() { 
    
  
    // Pohyb vpřed
    if (keysPressed["s"]) {
      if (velocity < maxspeed) {
      velocity += acceleration;
    }
    }
  
    // Pohyb zpět
    if (keysPressed["w"]) {
      if (velocity > -maxspeed) {
        velocity -= acceleration;
      }
    }
    //if (velocity > deacceleration || velocity < -deacceleration) { //checkuje jestli je mozne se otocit (aby se neotacel na miste)
    // Otočení vpravo
    if (keysPressed["d"]) {
      car.rotation.y -= rotationSpeed;
    }
    
    // Otočení vlevo
    if (keysPressed["a"]) {
      car.rotation.y += rotationSpeed;
    }
    //};
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
  
    //helicopter tilt
    const targetTilt = velocity * 2.5;
    car.rotation.z -= (targetTilt + car.rotation.z) * 0.1;
  // -----------------------------
    // Kamera sleduje auto
    camera.position.x = car.position.x + 5;
    camera.position.y = car.position.y + 15;
    camera.position.z = car.position.z + 30;
    camera.lookAt(car.position);
    //checkovani kolizi s pointy
    checkpoint1.checkCollision(car);
    checkpoint2.checkCollision(car);
    checkpoint3.checkCollision(car);
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
