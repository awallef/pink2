/***
 *    __________.__        __    
 *    \______   \__| ____ |  | __
 *     |     ___/  |/    \|  |/ /
 *     |    |   |  |   |  \    < 
 *     |____|   |__|___|  /__|_ \
 *                      \/     \/
 *
 * 
 *  Pink it my friend!
 *  
 *
 */
(function(scope) {
    
    if (null == scope)
        scope = window;

    // if the global app namespace already exists, turn back now
    if (scope.app)
    {
        return;
    }
    
    /***
    *      ___ ___         .__                       
    *     /   |   \   ____ |  | ______   ___________ 
    *    /    ~    \_/ __ \|  | \____ \_/ __ \_  __ \
    *    \    Y    /\  ___/|  |_|  |_> >  ___/|  | \/
    *     \___|_  /  \___  >____/   __/ \___  >__|   
    *           \/       \/     |__|        \/       
    */
    function Helper()
    {      
    }
    
    Helper.morphColorsToFaceColors = function( geometry )
    {
        if ( geometry.morphColors && geometry.morphColors.length ) {
            var colorMap = geometry.morphColors[ 0 ];
            for ( var i = 0; i < colorMap.colors.length; i ++ ) {
                geometry.faces[ i ].color = colorMap.colors[ i ];
            }
        }
    };
    
    /***
    *    _________                __                .__  .__                
    *    \_   ___ \  ____   _____/  |________  ____ |  | |  |   ___________ 
    *    /    \  \/ /  _ \ /    \   __\_  __ \/  _ \|  | |  | _/ __ \_  __ \
    *    \     \___(  <_> )   |  \  |  |  | \(  <_> )  |_|  |_\  ___/|  | \/
    *     \______  /\____/|___|  /__|  |__|   \____/|____/____/\___  >__|   
    *            \/            \/                                  \/       
    */
    var Process = {
        INIT : 'INIT'
    };
    
    var Notification = {
        LOAD_3D_MODEL           : 'LOAD_3D_MODEL',
        CREATE_FLAMINGO         : 'CREATE_FLAMINGO',
        CREATE_PERSON           : 'CREATE_PERSON',
        CREATE_SCENE            : 'CREATE_SCENE',
        START_RENDERER          : 'START_RENDERER',
        LOOP                    : 'LOOP'
    };
    
    /* Loop
    *******************************************/
    function Loop( note )
    {
        better.AbstractCommand.call(this, note );
    };

    Loop.prototype = new better.AbstractCommand;
    Loop.prototype.constructor = Loop;
    
    Loop.prototype.execute = function( notification )
    {    
        // retrieve All needed objects
        var mediator = this.facade.retrieveMediator( Mediator.RENDER );
        var rendering = mediator.viewComponent;
        mediator = this.facade.retrieveMediator( Mediator.FLAMINGO );
        var flamingo = mediator.viewComponent;

        // look at flamingo
        rendering.camera.lookAt( flamingo );
        
        // animate flamingo
        var delta = rendering.clock.getDelta();
        flamingo.updateAnimation(1000 * delta);
        
        // render!
        rendering.renderer.render(rendering.scene, rendering.currentCamera);
        
    };
    
    /* Start Render
    *******************************************/
    function StartRenderer( note )
    {
        better.AbstractCommand.call(this, note );
    };

    StartRenderer.prototype = new better.AbstractCommand;
    StartRenderer.prototype.constructor = StartRenderer;
    
    StartRenderer.prototype.execute = function( notification )
    {    
       this.facade.startAnimationFrameJob( Notification.LOOP );
       this.nextCommand();
    };
    
    /* Load 3D JSON Model
    *******************************************/
    function Load3DModel( note )
    {
        better.AbstractCommand.call(this, note );
    };

    Load3DModel.prototype = new better.AbstractCommand;
    Load3DModel.prototype.constructor = Load3DModel;
    
    Load3DModel.prototype.execute = function( notification )
    {    
       
       if( !notification.body.models )
           alert( 'Load3DModel ( command ) : Array "models" of Notification\'s body is either empty or not set');
       
        var model = notification.body.models.shift();
        var loader = new THREE.JSONLoader();
        var instance = this;
        loader.load( model , function(geometry, materials) { 
            
            instance.notification.body.geometry = geometry;
            instance.notification.body.materials = materials;
            instance.nextCommand();
            
        } );
    };
    
    /* Create Scene Lights etc
    *******************************************/
    function SceneCreation( note )
    {
        better.AbstractCommand.call(this, note );
    };

    SceneCreation.prototype = new better.AbstractCommand;
    SceneCreation.prototype.constructor = SceneCreation;
    
    SceneCreation.prototype.execute = function( notification )
    {    
        // container
        var container = document.getElementById('container');
        
        // Rendering
        var mediator = this.facade.retrieveMediator( Mediator.RENDER );
        var rendering = mediator.viewComponent;
        
        // Flamingo
        mediator = this.facade.retrieveMediator( Mediator.FLAMINGO );
        var flamingo = mediator.viewComponent;
        
        // Person
        mediator = this.facade.retrieveMediator( Mediator.PERSON );
        var person = mediator.viewComponent;
        
        // Cameras
        var goPro = rendering.goPro;
        goPro.position.x = -50;
        goPro.position.y = 50;
        goPro.position.z = -400;

        flamingo.add(goPro);
        goPro.lookAt(flamingo.position);

        var camera = rendering.camera;
        camera.position.x = 0;
        camera.position.y = 50;
        camera.position.z = 400;

        // Scene
        var scene = rendering.scene;
        scene.fog = new THREE.Fog(0xffffff, 1, 5000);
        scene.fog.color.setHSL(0.6, 0, 1);

        // flamingo
        scene.add(flamingo);

        // person
        scene.add(person);

        // LIGHTS

        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 500, 0);
        scene.add(hemiLight);

        //

        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
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

        var renderer = rendering.renderer;
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        renderer.setClearColor( scene.fog.color, 1 );

        renderer.gammaInput = true;
        renderer.gammaOutput = true;
        renderer.physicallyBasedShading = true;

        renderer.shadowMapEnabled = true;
        renderer.shadowMapCullFace = THREE.CullFaceBack; 
        
        this.nextCommand();
    };
    
    /***
    *    ____   ____.__               
    *    \   \ /   /|__| ______  _  __
    *     \   Y   / |  |/ __ \ \/ \/ /
    *      \     /  |  \  ___/\     / 
    *       \___/   |__|\___  >\/\_/  
    *                       \/        
    */
    
    var Mediator = {
        FLAMINGO            : 'FLAMINGO',
        PERSON              : 'PERSON',
        RENDER              : 'RENDER',
        START_RENDER        : 'START_RENDER',
        TOOGLE_CAMERA       : 'TOOGLE_CAMERA'
    };
    
    /* Flamingo
    *******************************************/
    function Flamingo( mediatorName, viewComponent )
    {
        better.AbstractMediator.call(this, mediatorName, viewComponent );
    };

    Flamingo.prototype = new better.AbstractMediator;
    Flamingo.prototype.constructor = Flamingo;

    Flamingo.prototype.listNotificationInterests = function ()
    {
        return [Notification.CREATE_FLAMINGO];
    };

    Flamingo.prototype.handleNotification = function (notification)
    {
        if( notification.name == Notification.CREATE_FLAMINGO )
        {
            this.create( notification.body.geometry, notification.body.materials );
            this.facade.nextCommand( notification );
        }       
    };

    Flamingo.prototype.create = function ( geometry, materials )
    {
        Helper.morphColorsToFaceColors( geometry );
        geometry.computeMorphNormals();
        
        var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 20, morphTargets: true, morphNormals: true, vertexColors: THREE.FaceColors, shading: THREE.FlatShading } );
        this.viewComponent = new THREE.MorphAnimMesh( geometry, material );
        this.viewComponent.duration = 1000;
        this.viewComponent.castShadow = true;
        this.viewComponent.receiveShadow = true;
        this.viewComponent.position.set(0, 40, 60);
        this.viewComponent.scale.set(0.5, 0.5, 0.5);
    };
    
    /* Person
    *******************************************/
    function Person( mediatorName, viewComponent )
    {
        better.AbstractMediator.call(this, mediatorName, viewComponent );
    };

    Person.prototype = new better.AbstractMediator;
    Person.prototype.constructor = Person;

    Person.prototype.listNotificationInterests = function ()
    {
        return [ Notification.CREATE_PERSON ];
    };

    Person.prototype.handleNotification = function (notification)
    {
        if( notification.name == Notification.CREATE_PERSON )
        {
            this.create( notification.body.geometry, notification.body.materials );
            this.facade.nextCommand( notification );
        }    
    };

    Person.prototype.create = function ( geometry, materials )
    {
        this.viewComponent = new THREE.MorphAnimMesh(geometry, new THREE.MeshFaceMaterial(materials));
        this.viewComponent.castShadow = true;
        this.viewComponent.receiveShadow = true;
        this.viewComponent.position.set(0, 0, 0);
        this.viewComponent.scale.set(3, 3, 3);
        this.viewComponent.rotation.x = -Math.PI / 2;
    };
    
    /* Scene
    *******************************************/
    function Render( mediatorName, viewComponent )
    {
        better.AbstractMediator.call(this, mediatorName, viewComponent );
    };

    Render.prototype = new better.AbstractMediator;
    Render.prototype.constructor = Render;

    Render.prototype.listNotificationInterests = function ()
    {
        return [
            Notification.TOOGLE_CAMERA
        ];
    };

    Render.prototype.handleNotification = function (notification)
    {
        switch( notification.name )
        {
            case Notification.TOOGLE_CAMERA:
                this.viewComponent.toogleCamera();
                break;
        }
    };
    
    /***
    *    _________                                                    __          
    *    \_   ___ \  ____   _____ ______   ____   ____   ____   _____/  |_  ______
    *    /    \  \/ /  _ \ /     \\____ \ /  _ \ /    \_/ __ \ /    \   __\/  ___/
    *    \     \___(  <_> )  Y Y  \  |_> >  <_> )   |  \  ___/|   |  \  |  \___ \ 
    *     \______  /\____/|__|_|  /   __/ \____/|___|  /\___  >___|  /__| /____  >
    *            \/             \/|__|               \/     \/     \/          \/ 
    */
    
    /* Rendering
    *******************************************/
    function Rendering(  )
    {    
        this.clock          = new THREE.Clock;
        this.scene          = new THREE.Scene();
        this.renderer       = new THREE.WebGLRenderer( { antialias: true } );
        this.camera         = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 4000);
        this.goPro          = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 4000);
        this.currentCamera  = this.goPro;
    };

    Rendering.prototype.constructor = Rendering;
    Rendering.prototype.scene = null;
    Rendering.prototype.renderer = null;
    Rendering.prototype.camera = null;
    Rendering.prototype.goPro = null;
    Rendering.prototype.currentCamera = null;
    
    Rendering.prototype.toogleCamera = function()
    {
        this.currentCamera = ( this.currentCamera === this.camera )? this.goPro : this.camera;
    };
    
    /***
    *    ___________                         .___      
    *    \_   _____/____    ____ _____     __| _/____  
    *     |    __) \__  \ _/ ___\\__  \   / __ |/ __ \ 
    *     |     \   / __ \\  \___ / __ \_/ /_/ \  ___/ 
    *     \___  /  (____  /\___  >____  /\____ |\___  >
    *         \/        \/     \/     \/      \/    \/ 
    */
    
    function Facade()
    {
        better.AbstractFacade.call(this, null);
    }

    for (n in better.AbstractFacade.prototype) {
        Facade.prototype[n] = better.AbstractFacade.prototype[n];
    }

    Facade.prototype.constructor = Facade;
    
    Facade.prototype.initMediators = function(configObject)
    {
        better.log('init mediators');
        this.registerMediator( new Flamingo( Mediator.FLAMINGO , null ) );
        this.registerMediator( new Person( Mediator.PERSON , null ) );
        this.registerMediator( new Render( Mediator.RENDER , new Rendering() ) );
    };
    
    Facade.prototype.initCommands = function(configObject)
    {
        better.log('init commands');
        this.registerCommand( Notification.LOAD_3D_MODEL, Load3DModel );
        this.registerCommand( Notification.CREATE_SCENE, SceneCreation );
        this.registerCommand( Notification.START_RENDERER, StartRenderer );
        this.registerCommand( Notification.LOOP, Loop );
    };
    
    Facade.prototype.initProcesses = function(configObject)
    {
        better.log('init processes');
        this.registerProcess( Process.INIT, [
            
            Notification.LOAD_3D_MODEL,
            Notification.CREATE_FLAMINGO,
            Notification.LOAD_3D_MODEL,
            Notification.CREATE_PERSON,
            Notification.CREATE_SCENE,
            Notification.START_RENDERER
            
        ]);
    };
    
    Facade.prototype.initSequences = function(configObject)
    {
        this.registerAnimationFrameJob( Notification.LOOP, new better.Notification( Notification.LOOP, {} ) );
    };
    
    Facade.prototype.bootstrap = function()
    {
        this.goTo(  Process.INIT, { 
            models : [
                "models/pink/flamingo.js",
                "models/Girl/girl.js"
            ]
        } );
    };

    scope.Pink = Facade;

})(this); // the 'this' parameter will resolve to global scope in all environments

var pink = new Pink();
pink.init();