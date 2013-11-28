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
    
    var Command = {
        LOAD_3D_MODEL           : 'LOAD_3D_MODEL',
        CREATE_FLAMINGO         : 'CREATE_FLAMINGO'
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
        better.log( notification.body.models );
        var loader = new THREE.JSONLoader();
        var instance = this;
        loader.load( model , function(geometry, materials) { 
            
            instance.notification.body.geometry = geometry;
            instance.notification.body.materials = materials;
            instance.nextCommand();
            
        } );
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
        FLAMINGO           : 'FLAMINGO' 
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
        return [better.Event.responsiveEvent.REFRESH];
    };

    Flamingo.prototype.handleNotification = function (notification)
    {
        if( notification.name == better.Event.responsiveEvent.REFRESH )
            this.viewComponent.trigger( 'resize' );
    };

    Flamingo.prototype.create = function ( geometry, material )
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
        this.registerMediator( new ResponsiveMediator( ResponsiveMediator.NAME, window ) );
    };
    
    Facade.prototype.initCommands = function(configObject)
    {
        better.log('init commands');
        this.registerCommand( Command.LOAD_3D_MODEL, Load3DModel );
    };
    
    Facade.prototype.initProcesses = function(configObject)
    {
        
        better.log('init processes');
        
        this.goTo( Command.LOAD_3D_MODEL, { 
            models : [
                "models/pink/flamingo.js",
                "models/Elexis/elexis.js"
            ]
        } );
    };

    scope.Pink = Facade;

})(this); // the 'this' parameter will resolve to global scope in all environments

var pink = new Pink();
pink.init({});