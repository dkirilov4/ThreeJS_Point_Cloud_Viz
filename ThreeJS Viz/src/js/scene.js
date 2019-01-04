"use strict";

/* Get or create the application global variable */
var App = App || {};

/* Create the scene class */
var Scene = function(options) {


    var HEIGHT = window.innerHeight;
    var WIDTH = window.innerWidth;
    var windowHalfX = WIDTH / 2;
    var windowHalfY = HEIGHT / 2;
    
    var mouseX = 0; 
    var mouseY = 0;

    var onMouseDownPosition = new THREE.Vector2();
    var isMouseDown = false;
    var theta = 45, onMouseDownTheta = 45, phi = 60, onMouseDownPhi = 60, radious = 20;

    // setup the pointer to the scope 'this' variable
    var self = this;

    // scale the width and height to the screen size
    var width = d3.select('.particleDiv').node().clientWidth;
    var height = width * 0.85;

    // create the scene
    self.scene = new THREE.Scene();

    // setup the camera
    self.camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 1000 );
    self.camera.position.set(0,2,20);
    self.camera.lookAt(0,0,0);

    // Add a directional light to show off the objects
    var light = new THREE.DirectionalLight( 0xffffff, 1.5);
    // Position the light out from the scene, pointing at the origin
    light.position.set(0,2,20);
    light.lookAt(0,0,0);

    // add the light to the camera and the camera to the scene
    self.camera.add(light);
    self.scene.add(self.camera);

    // create the renderer
    self.renderer = new THREE.WebGLRenderer({alpha: true});
    // set the size and append it to the document
    self.renderer.setSize( width, height );
    document.getElementById(options.container).appendChild( self.renderer.domElement );
    self.renderer.setClearColor(0x000000, 0);
    /* Event Listeners */

    /* Reize */
    //window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        self.camera.aspect = window.innerWidth / window.innerHeight;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    document.addEventListener('contextmenu', onDocumentRightClickDown, false);
    function onDocumentRightClickDown(e)
    {
        e.preventDefault();
        isMouseDown = true;

        onMouseDownTheta = theta;
        onMouseDownPhi = phi;
        onMouseDownPosition.x = e.clientX;
        onMouseDownPosition.y = e.clientY;
        return false;
    }

    document.addEventListener('mouseup', onDocumentMouseUp, false);
    function onDocumentMouseUp(e) {

        //e.preventDefault();

        isMouseDown = false;

        onMouseDownPosition.x = e.clientX - onMouseDownPosition.x;
        onMouseDownPosition.y = e.clientY - onMouseDownPosition.y;
    }

    /* Rotation*/
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    function onDocumentMouseMove(e) {

        //e.preventDefault();
        if ( isMouseDown ) {

            theta = - ( ( event.clientX - onMouseDownPosition.x ) * 0.5 ) + onMouseDownTheta;
            phi = ( ( event.clientY - onMouseDownPosition.y ) * 0.5 ) + onMouseDownPhi;

            phi = Math.min( 180, Math.max( 0, phi ) );

            self.camera.position.x = radious * Math.sin( theta * Math.PI / 360 )
                                * Math.cos( phi * Math.PI / 360 );
            self.camera.position.y = radious * Math.sin( phi * Math.PI / 360 );
            self.camera.position.z = radious * Math.cos( theta * Math.PI / 360 )
                                * Math.cos( phi * Math.PI / 360 );
            self.camera.updateMatrix();

        }
    }

    document.addEventListener('mousewheel', onDocumentMouseWheel, false);
    function onDocumentMouseWheel(e) {
        
        radious -= e.wheelDeltaY / 100;

        self.camera.position.x = radious * Math.sin (theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
        self.camera.position.y = radious * Math.sin(phi * Math.PI / 360);
        self.camera.position.z = radious * Math.cos (theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
        self.camera.updateMatrix();
    }

    self.public =  {


        resize: function() {

        },

        addObject: function(obj) {
            self.scene.add( obj );
        },

        render: function() {

            var time = Date.now() * 0.00005;

            for (var i = 0; i < self.scene.children.length; i++) {

                var object = self.scene.children[i];

                if (object instanceof THREE.PointCloud) {
                    object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
            }

            self.camera.lookAt(self.scene.position);
            

            requestAnimationFrame( self.public.render );
            self.renderer.render( self.scene, self.camera );
            
        }

    };

    return self.public;
};

