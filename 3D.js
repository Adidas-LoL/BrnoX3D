import * as THREE from './three.js/build/three.module.js';
import { OrbitControls } from './three.js/src/extras/OrbitControls.js';
import { GLTFLoader } from './three.js/src/loaders/GLTFLoader.js';

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

//box
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    renderer.render(scene, camera);
//light
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
    
    const controls = new OrbitControls(camera, renderer.domElement);

//instances
  //floor
    {
      const planeSize = 40;
  
      const loader = new THREE.TextureLoader();
      const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      const repeats = planeSize / 2;
      texture.repeat.set( repeats, repeats );
  
      const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
      const planeMat = new THREE.MeshPhongMaterial( {
        map: texture,
        side: THREE.DoubleSide,
      } );
      const mesh = new THREE.Mesh( planeGeo, planeMat );
      mesh.rotation.x = Math.PI * - .5;
      scene.add( mesh );
  
    }
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
      camera.near = boxSize / 100;
      camera.far = boxSize * 100;
  
      camera.updateProjectionMatrix();
  
      // point the camera to look at the center of the box
      camera.lookAt( boxCenter.x, boxCenter.y, boxCenter.z );
  
    }
    //map
    {
      //load
    const gltfLoader = new GLTFLoader();
		gltfLoader.load( './webmap.gltf', ( gltf ) => {
		const root = gltf.scene;
		scene.add( root )
      //camera
      const box = new THREE.Box3().setFromObject( root );
      const boxSize = box.getSize( new THREE.Vector3() ).length();
			const boxCenter = box.getCenter( new THREE.Vector3() );

			// set the camera to frame the box
			frameArea( boxSize * 1.2, boxSize, boxCenter, camera );

			// update the Trackball controls to handle the new size
			controls.maxDistance = boxSize * 10;
			controls.target.copy( boxCenter );
			controls.update();}
    
  );
  
  };
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
        
        cube.rotation.x = time;
        cube.rotation.y = time;
       
        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);

      
}

main();