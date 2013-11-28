var container;

var camera, goPro, currentCamera, scene, renderer, dirLight, hemiLight;

var flamingo, woman;

var morphs = [];

var stepAngle = Math.PI / 18;

var speed = 1;

var clock = new THREE.Clock;

var loader = new THREE.JSONLoader();
loadflamingo();

function loadflamingo() {

    loader.load("models/pink/flamingo.js", function(geometry) {
        createFlamingo(geometry);
        loadWoman();
    });
}

function loadWoman() {

    loader.load(/*"models/Girl/girl.js"*/"models/Elexis/elexis.js"/*"models/pink/flamingo.js"*/, function(geometry, materials) {
        createWoman(geometry, materials);
        init();
        animate();
    });
}


function createWoman(geometry, materials) {

    woman = new THREE.MorphAnimMesh(geometry, new THREE.MeshFaceMaterial(materials));
    //woman.castShadow = true;
    woman.receiveShadow = true;
    woman.position.set(0, 0, 0);
    woman.scale.set(3, 3, 3);
    woman.rotation.x = -Math.PI / 2;

}

function createFlamingo(geometry) {
    
    
    morphColorsToFaceColors( geometry );
    geometry.computeMorphNormals();

    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 20, morphTargets: true, morphNormals: true, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );
    flamingo = new THREE.MorphAnimMesh( geometry, material );

    flamingo.duration = 1000;

    flamingo.castShadow = true;
    flamingo.receiveShadow = true;

    morphs.push( flamingo );
    
    flamingo.position.set(0, 40, 60);
    flamingo.scale.set(0.5, 0.5, 0.5);

}

function init() {

    container = document.getElementById('container');

    // Cameras
    goPro = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 4000);
    goPro.position.x = -50;
    goPro.position.y = 50;
    goPro.position.z = -400;

    flamingo.add(goPro);
    goPro.lookAt(flamingo.position);

    camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.x = 0;
    camera.position.y = 50;
    camera.position.z = 400;

    currentCamera = camera;

    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 1, 5000);
    scene.fog.color.setHSL(0.6, 0, 1);

    // flamingo
    scene.add(flamingo);

    // woman
    scene.add(woman);

    // LIGHTS

    hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 500, 0);
    scene.add(hemiLight);

    //

    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(50);
    scene.add(dirLight);

    dirLight.castShadow = true;

    dirLight.shadowMapWidth = 2048;
    dirLight.shadowMapHeight = 2048;

    var d = 50;

    dirLight.shadowCameraLeft = -d;
    dirLight.shadowCameraRight = d;
    dirLight.shadowCameraTop = d;
    dirLight.shadowCameraBottom = -d;

    dirLight.shadowCameraFar = 3500;
    dirLight.shadowBias = -0.0001;
    dirLight.shadowDarkness = 0.35;
    //dirLight.shadowCameraVisible = true;

    // GROUND

    var groundGeo = new THREE.PlaneGeometry(10000, 10000);
    var groundMat = new THREE.MeshPhongMaterial({ambient: 0xffffff, color: 0xffffff, specular: 0x050505});
    groundMat.color.setHSL(0.095, 1, 0.75);

    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -33;
    scene.add(ground);

    ground.receiveShadow = true;

    // SKYDOME

    var vertexShader = document.getElementById('vertexShader').textContent;
    var fragmentShader = document.getElementById('fragmentShader').textContent;
    var uniforms = {
        topColor: {type: "c", value: new THREE.Color(0x0077ff)},
        bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
        offset: {type: "f", value: 33},
        exponent: {type: "f", value: 0.6}
    }
    uniforms.topColor.value.copy(hemiLight.color);

    scene.fog.color.copy(uniforms.bottomColor.value);

    var skyGeo = new THREE.SphereGeometry(4000, 32, 15);
    var skyMat = new THREE.ShaderMaterial({vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide});

    var sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);


    // RENDERER

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    renderer.setClearColor( scene.fog.color, 1 );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;

    renderer.shadowMapEnabled = true;
    renderer.shadowMapCullFace = THREE.CullFaceBack;


    //

    window.addEventListener('resize', onWindowResize, false);

}
function morphColorsToFaceColors( geometry ) {

        if ( geometry.morphColors && geometry.morphColors.length ) {

                var colorMap = geometry.morphColors[ 0 ];

                for ( var i = 0; i < colorMap.colors.length; i ++ ) {

                        geometry.faces[ i ].color = colorMap.colors[ i ];

                }

        }

}

function onWindowResize() {

    goPro.aspect = window.innerWidth / window.innerHeight;
    goPro.updateProjectionMatrix();

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate() {
    requestAnimationFrame(animate);
    render();

}

function render() {

    flamingo.translateOnAxis(new THREE.Vector3(0, 0, 1), speed / 10);

    var delta = clock.getDelta();

    //controls.update();

    for (var i = 0; i < morphs.length; i++) {

        flamingo = morphs[ i ];
        flamingo.updateAnimation(1000 * delta);

    }

    camera.lookAt(flamingo.position);
    renderer.render(scene, currentCamera);

}

window.onkeydown = function(e) {

    var code = e.keyCode ? e.keyCode : e.which;

    if (code == 83) { // s
        if (currentCamera === camera) {
            currentCamera = goPro;
        } else {
            currentCamera = camera;
        }
    }
    if (code == 65) { // a
        speed += 0.1;
    } else if (code === 38) { //up key
        //flamingo.translateOnAxis( new THREE.Vector3( 0, 0, 1 ), 10 );
        flamingo.rotateOnAxis(new THREE.Vector3(1, 0, 0), stepAngle);
    } else if (code === 40) { //down key
        //flamingo.translateOnAxis( new THREE.Vector3( 0, 0, 1 ), -10 );
        flamingo.rotateOnAxis(new THREE.Vector3(1, 0, 0), -stepAngle);
    } else if (code === 37) { //left key
        flamingo.rotateOnAxis(new THREE.Vector3(0, 0, 1), -stepAngle);
    } else if (code === 39) { //right key
        flamingo.rotateOnAxis(new THREE.Vector3(0, 0, 1), stepAngle);
    }

};