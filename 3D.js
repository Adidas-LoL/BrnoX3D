import * as THREE from './three.js/build/three.module.js';
import { OrbitControls } from './three.js/src/extras/OrbitControls.js';
import { GLTFLoader } from './three.js/src/loaders/GLTFLoader.js';
import { AnimationMixer } from './three.js/src/animation/AnimationMixer.js';
//import * as CANNON from './cannoon/src/cannon.js';
//=========================================================================================================================================================
//==================================================================HTML FUNCTIONS======================================================================
//=========================================================================================================================================================
        const sidebar = document.getElementById("sidebar");
        const toggleBtn = document.getElementById("toggle-btn");
        const arrow = toggleBtn.querySelector("i");

        // Funkce pro otevření/zavření panelu
        toggleBtn.addEventListener("click", opensidebar);

        document.addEventListener('keydown', function(event) {
          //detekce stisknutí ,,E"
          if (event.key === 'e' || event.key === 'E') {
            opensidebar();
           }
          });

        function opensidebar() {
            sidebar.classList.toggle("open");

            // Otočení šipky podle stavu panelu
            if (sidebar.classList.contains("open")) {
                arrow.style.transform = "rotate(180deg)";
            } else {
                arrow.style.transform = "rotate(0deg)";
            }
        };
        
//var resetCamera = true;

/*function restartButton() {
    resetCamera = false;  //sets variable that checks if the camera is locked or not
};
restartButton();*/
function startcoords(type) {
  const params = new URLSearchParams(window.location.search);
  const x = parseInt(params.get('x')) || 0;
  const y = parseInt(params.get('y')) || 0;
  if (type === "x"){return x};
  if (type === "y"){return y};
  console.log(`Souřadnice v 3D: x = ${x}, y = ${y}`);
}

//=================================================================CANNON JS FUNCTIONS==================================================================
/*const world = new window.CANNON.World({
  gravity: new window.CANNON.Vec3(0, -9.82, 0),
});
world.broadphase = new window.CANNON.NaiveBroadphase(); 
world.solver.iterations = 10;*/

//=========================================================================================================================================================
//==================================================================ThreeJS FUNCTIONS===================================================================
//=========================================================================================================================================================
let car = null;
let E = null;
const clock = new THREE.Clock();
let mixer;

let currentime = performance.now();
let previoustime = currentime;
let deltaTime = 0;

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

    /*function followCamera(obj){
      camera.position.x = obj.position.x + 5;
      camera.position.y = obj.position.y + 20;
      camera.position.z = obj.position.z + 10;
      camera.lookAt(obj.position);
      //console.log("test");
    };*/
    
  const loader = new THREE.TextureLoader();
    loader.load('./image/sky.jpg', function(texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
  });

    //map-----------
    //--------------
    {
      //load
    const gltfLoader = new GLTFLoader();
		gltfLoader.load( './Brno3D.glb', ( gltf ) => {
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
  let radost = false;
  let albert = false;
  let kaznice = false;
  let teplarny = false;
  let park = false;
  let muzeum = false;
  //----------------------------------------------------------
  class Checkpoint {
    constructor(x, y, z, onCollide, onExit) {

      //spawn object-------------------
      const gltfLoader = new GLTFLoader();
		  gltfLoader.load( './pin.glb', ( gltf ) => {
		  this.mesh = gltf.scene;
      let size = 20;
      this.mesh.scale.set(size, size, size);
      this.mesh.position.set(x, y, z);
		  scene.add( this.mesh )
      });

      //declare anonymous func---------
      this.onCollide = onCollide
      this.collided = false;
      this.onExit = onExit;
    }
    
    //check for collision--------------
    checkCollision(target) {
      //if (this.collided) return; 
      const distance = target.position.distanceTo(this.mesh.position);
      const collisionRadius = 16;
      let uploadContent = false;
      if (distance < collisionRadius) {
        this.collided = true;
        this.onCollide();
        if (E) {
          E.visible = true;
          E.position.set(this.mesh.position.x, 15, this.mesh.position.z);
        }
        if (this.uploadContent === false) { loadcontent(); };
        this.uploadContent = true;
      } else {
        this.uploadContent = false;
        this.collided = false;
        this.onExit();
      }
    }
  }

//radost
  let checkpoint1 = new Checkpoint(-13, 0, -27, () => {
    radost = true;
    //console.log("Changed A")
  }, () => {
    radost = false;
    if (E) E.visible = false;
  });

//albert  
  let checkpoint2 = new Checkpoint(80, 0, -57, () => {
    albert = true;
    //console.log("Changed B")
  }, () => {
    albert = false;
  });

//kaznice  
  let checkpoint3 = new Checkpoint(28, 0, -50, () => {
    kaznice = true;
    //console.log("Changed C")
  }, () => {
    kaznice = false;
  });

//teplarna
  let checkpoint4 = new Checkpoint(20, 0, 0, () => {
    teplarny = true;
  }, () => {
    teplarny = false;
  });
//park
  let checkpoint5 = new Checkpoint(20, 0, -75, () => {
    park = true;
  }, () => {
    park = false;
  });
//muzeum
  let checkpoint6 = new Checkpoint(20, 0, -75, () => {
    muzeum = true;
  }, () => {
    muzeum = false;
  });
  //loads content to the sidebar
  function loadcontent() {
  const img = document.getElementById("sideimage");
  const Title = document.getElementById("Title");
  const placeInfo = document.getElementById("place-info");
  const link = document.getElementById("odkaz");
  if (!img || !Title || !placeInfo) return;

  if (radost === true) {
    Title.textContent = "Divadlo Radost";
    img.src = "./image/Sidebar/radost.png";
    placeInfo.innerHTML = `<strong>Divadlo Radost</strong><br>Divadlo Radost bylo první kino Orania, po silném poškození při druhé světové válce byla budova přestavena na Divadlo radost a od roku 1949 se zde pravidelné představení. \nHlavní specialita divadla jsou loutkové hry ale je zde i pár hraných her, hry jsou hrané pro všechny věkové kategorie takže se může kulturně vzdělat kdokoliv.\nVe všech prostorech divadla jsou vystavovány loutky z produkce divadla za celou svoji životnost.`;
    link.href = "https://divadlo-radost.cz/";
  } else if (albert === true) {
    Title.textContent = "Supermarket Albert";
    img.src = "./image/Sidebar/albert.png";
    placeInfo.innerHTML = `<strong>Supermarket Albert</strong><br>Typický supermarket s nabídkou potravin a domácích potřeb. Nachází se v srdci Cejlu.`;
    link.href = "https://www.ualbertu.cz/obchodni-centrum/detail/190/";
  } else if (kaznice === true) {
    Title.textContent = "Káznice";
    img.src = "./image/Sidebar/kaznice.png";
    placeInfo.innerHTML = `<strong>Káznice</strong><br>Brňenská Káznice, vystavena jako vězení byla poprvé užita jako sirotčinec.\nVystavěna roku 1778 její originální důvod výstavby bylo nařízení dvorského dekretu aby morava měla káznici.\nRoku 1784 byl sirotčinec zrušen a káznice byla užita jako věznice pro nezletilé a byla užívána jako věznice až do sametové revoluce.\nMezi roky 2006-2018 byla budova prázdná a neužitá ale už od roku 2006 byly plány ji přestavět na Divadlo, roku 2012 vyl zorganizován pouliční ghettofest v blízkostvi káznice která se stala pro ghettofest zázemí pro eventy což zvýšilo zájem o budovu.\nOd roku 2018 je káznice užívaná jako dnes, stávající se cejlským centrem kultůry.`;
    link.href = "https://kaznice.art/";
  } else if (teplarny === true) {
    Title.textContent = "Teplárny Brno";
    img.src = "./image/Sidebar/teplarna.png";
    placeInfo.innerHTML = `<strong>Teplárna</strong><br>Téměř sto letá, Plynná Teplárna dodávající teplo a energii po kraji.\nCo více si může člověk přát?`;
    link.href = "https://openhousebrno.cz/cs/spitalka-teplarny-brno";
  } else if (park === true) {
    Title.textContent = "Park Hvězdička";
    img.src = "./image/Sidebar/hvezdicka.png";
    placeInfo.innerHTML = `<strong>Park Hvězdička</strong><br>Park byl vybudován roku 2015 za účelem revitalizace brna.\nMotivem parku je náměstíčko, z něhož vycházejí čtyři chodníky, které místo rozdělují na kvadranty se specifickým využitím (sport, odpočinek na pobytových trávnících, přístupová část). \nV poslední části bylo vybudováno nízkoprahové centrum pro děti a mládež.`;
    link.href = "https://openhousebrno.cz/cs/drom-romske-stredisko-a-hvezdicka-park-eugena-horvatha";
  } else if (muzeum === true) {
    Title.textContent = "Muzeum romské kultury";
    img.src = "./image/Sidebar/muzeum_romske_kultury.png";
    placeInfo.innerHTML = `<strong>Muzeum romské kultury</strong><br>Zalozěno roku 1991 neziskovou organizací iniciativa romských intelektuálů s myšlenkou dokumentace kultury Romů a Sintů po celém světě.\nSbírka obsahuje více než 28000 předmětů.\nMuzeum se originálně snažilo budovat sbírkové fondy na kolekci dokumentů kultury a dějin romů.\nDnes spravuje fondy tradičních řemesel a profesí, typů obydlí, vybavení interiéru, oděvu a šperku, výtvarného umění, písemného materiálu, plakátů a pozvánek, audio, foto a videodokumentace, knihovny, ohlasů kultury Romů.`;
    link.href = "https://www.rommuz.cz/cs/";
  }
}
  //only one cone----------------
  /*const coneGeometry = new THREE.ConeGeometry(5, 30, 32); // (polomer zakladu, vyska, segmenty)
  const coneMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
  const cone = new THREE.Mesh(coneGeometry, coneMaterial);
  scene.add(cone);
  // cone (point1) position
  cone.position.set(50, 0, -50);*/


  //E model-------
  //----------------
  {
  const gltfLoader = new GLTFLoader();
		gltfLoader.load( './E.glb', ( gltf ) => {
		E = gltf.scene;
    let size = 0.5;
    E.scale.set(size, size, size);
    //car.position.y = 0.04;
    E.position.y = 10;
    E.visible = false;
		scene.add( E );
    })};

    // Spin E towards heilcopter
  function Espin(spinobj,target){
      const direction = new THREE.Vector3();
      direction.subVectors(target.position, spinobj.position);
      direction.y = 0; 
      direction.normalize();

      const targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
      spinobj.quaternion.slerp(targetQuaternion, 0.1);
      };

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
    car.position.x = startcoords("x");
    car.position.z = startcoords("y");
		scene.add( car );
    console.log("car position", car.position);
    console.log("Car rotation:", car.rotation);
    

    //animation of car
    mixer = new AnimationMixer(car);
    const clip = THREE.AnimationClip.findByName(gltf.animations, 'Main');
    const action = mixer.clipAction(clip);
    action.play();

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
  const maxspeed = 0.25;
  const acceleration = 0.005;  //  a
  const deacceleration = 0.05; // -a
  let velocity = 0;         // momentalni rychlost
  const rotationSpeed = 0.05; //rychlost otaceni (v radianech "3.14/36" )

  document.addEventListener("keydown", function (event) {
    keysPressed[event.key] = true;
  });
  
  document.addEventListener("keyup", function (event) {
    keysPressed[event.key] = false;
  });
  
  function updateCarPosition(delta) { 
    
  
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
      car.rotation.y -= rotationSpeed * delta;
    }
    
    // Otočení vlevo
    if (keysPressed["a"]) {
      car.rotation.y += rotationSpeed * delta;
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
    
    car.position.x += velocity * Math.cos(car.rotation.y) * delta; //pocitani jak se auto pohybuje v souradnicovem prostoru
    car.position.z -= velocity * Math.sin(car.rotation.y) * delta;
  
    //helicopter tilt
    let targetTilt = velocity * 2.5;
    car.rotation.z -= (targetTilt + car.rotation.z) * 0.1;
  // -----------------------------
    // camera follow
    camera.position.x = car.position.x + 5;
    camera.position.y = car.position.y + 15;
    camera.position.z = car.position.z + 30;
    camera.lookAt(car.position);
    //checkovani kolizi s pointy
    checkpoint1.checkCollision(car);
    checkpoint2.checkCollision(car);
    checkpoint3.checkCollision(car);
    checkpoint4.checkCollision(car);
    checkpoint5.checkCollision(car);
    checkpoint6.checkCollision(car);
    if(E!==null && E.visible && car)  {Espin(E, car)}; //spin E towards helicopter
    //console.log(car.position)
  }




  function gameLoop() {
    currentime = performance.now();
    deltaTime = (currentime - previoustime)/10;
    //console.log(deltaTime);
    updateCarPosition(deltaTime);
    previoustime = currentime;
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
        const deltaTime = clock.getDelta();

        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }
        
        //animation check and loop
        if (mixer) {
          mixer.update(deltaTime);
        }

        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);



}


main();
