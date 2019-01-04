"use strict";

/* Get or create the application global variable */
var App = App || {};

var ParticleSystem = function() {

    // setup the pointer to the scope 'this' variable
    var self = this;

    // data container
    var data = [];

    // scene graph group for the particle system
    var sceneObject = new THREE.Group();

    // bounds of the data
    var bounds = {};

    var XYBox = document.getElementById("plotCheckXY");
    var XZBox = document.getElementById("plotCheckXZ");

    //
    /* Create the Particle System: */
    //
    var cloudParticles;

    self.createParticleSystem = function() 
    {
        var cloudGeometry = new THREE.Geometry();

        /* Material */
        var cloudMaterial = new THREE.PointsMaterial ( { 
            size: (0.1, 1, 0.2), 
            vertexColors: THREE.VertexColors
        } );

        /* Colors */
        var pointColors = [];

        // Get the min and max concentration values of the current data set
        var maxConcentration = d3.max(data, function(d) {return d.concentration});
        var minConcentration = d3.min(data, function(d) {return d.concentration});

        var colorScale = d3.scaleLinear()
                        .domain([minConcentration, maxConcentration / 4,maxConcentration / 2, maxConcentration - maxConcentration / 4, maxConcentration])
                        .range(["#000000", "#C91AC9", "#e33b3b", "#d8e309", "#faffb5"]);

        var greyScale = d3.scaleLinear()
                        .domain([minConcentration, maxConcentration])
                        .range(["#262626", "#d6d6d6"]);


        // Go through each particle and apply the color scale if it's contained within the slice
        for (var i = 0; i < data.length; i++)
        {
            if (XYBox.checked)
            {
                if (data[i].Y > sliderValue + dataTolerance || data[i].Y < sliderValue - dataTolerance) {
                    pointColors[i] = new THREE.Color(greyScale(data[i].concentration));
                }
                else {
                    pointColors[i] = new THREE.Color(colorScale(data[i].concentration));
                }
            }
            else
            {
                if (data[i].Z > sliderValue + dataTolerance + bounds.maxY|| data[i].Z < sliderValue - dataTolerance + bounds.maxY) {
                    pointColors[i] = new THREE.Color(greyScale(data[i].concentration));
                }
                else {
                    pointColors[i] = new THREE.Color(colorScale(data[i].concentration));
                }
            }

        }

        // Set the point cloud colors to the ones we just mapped from their concentration
        cloudGeometry.colors = pointColors;

        // Create the point cloud using the previously made geometry and material
        cloudParticles = new THREE.Points (cloudGeometry, cloudMaterial);

        // Go through the data and create a new point on the point cloud of it based on its X, Y, Z values
        for (var i = 0; i < data.length; i++)
        {
            var newVertex = new THREE.Vector3(data[i].X, data[i].Z - bounds.maxZ / 2, data[i].Y);

            cloudGeometry.vertices.push(newVertex);
        }

        // Add the point cloud to our scene
        sceneObject.add(cloudParticles);
    };

    //
    /* Cut Plane*/
    //
    let sliderValue = 0;
    let cutPlane;

    var dataWidth;
    var dataHeight;

    self.createCutPlane = function() 
    {   
        dataWidth  = bounds.maxX - bounds.minX
        dataHeight = bounds.maxY - bounds.minY

        var cutPlaneGeometry;
        if (XYBox.checked) {
            cutPlaneGeometry = new THREE.BoxGeometry(dataWidth + 1, dataHeight + 1, dataTolerance*2);
        } else {
            cutPlaneGeometry = new THREE.BoxGeometry(dataWidth + 1, dataTolerance*2, dataWidth + 1);
        }


        var cutPlaneMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true});
        cutPlane = new THREE.Mesh(cutPlaneGeometry, cutPlaneMaterial);

        sceneObject.add(cutPlane);
        sliderValue = parseFloat(document.getElementById("rangeslider").value);
    }   

    //
    /* Slider Interaction */
    //
    document.getElementById("rangeslider").addEventListener('change', onSliderMove, false);
    function onSliderMove(e)
    {
        var target = (e.target) ? e.target : e.srcElement;

        if (XYBox.checked)
        {
            cutPlane.position.z = target.value;

            sliderValue = parseFloat(target.value);

            svg.selectAll(".point").remove().exit();
            self.createSecondView();
            self.createParticleSystem();

        }
        else
        {
            cutPlane.position.y = target.value;

            sliderValue = parseFloat(target.value);

            svg.selectAll(".point").remove().exit();
            self.createSecondView();
            self.createParticleSystem();
        }
        
    }

    //
    /* Check Box Interaction */
    //
    document.getElementById("plotCheckXY").addEventListener('change', onXYBoxCheck, false);
    function onXYBoxCheck(e)
    {
        if (XYBox.checked)
        {
            XZBox.checked = false;
            cutPlane.geometry = new THREE.BoxGeometry(dataWidth + 1, dataHeight + 1, dataTolerance*2);

            document.getElementById("rangeslider").min = bounds.minX;
            document.getElementById("rangeslider").max = bounds.maxX;

            cutPlane.position.x = 0;
            cutPlane.position.y = 0;
            cutPlane.position.z = 0;

            document.getElementById("rangeslider").value = 0;
            sliderValue = 0;

            svg.selectAll(".point").remove().exit();
            self.createSecondView();
            self.createParticleSystem();
        }
    }

    document.getElementById("plotCheckXZ").addEventListener('change', onXZBoxCheck, false);
    function onXZBoxCheck(e)
    {
        if (XZBox.checked)
        {
            XYBox.checked = false;
            cutPlane.geometry = new THREE.BoxGeometry(dataWidth + 1, dataTolerance*2, dataWidth + 1);

            document.getElementById("rangeslider").min = bounds.minY;
            document.getElementById("rangeslider").max = bounds.maxY;

            cutPlane.position.x = 0;
            cutPlane.position.y = 0;
            cutPlane.position.z = 0;

            document.getElementById("rangeslider").value = 0;
            sliderValue = 0;

            svg.selectAll(".point").remove().exit();
            self.createSecondView();
            self.createParticleSystem();
        }
    }

    //
    /* Second View */
    //
    var dataTolerance = 0.5;
    var WIDTH  = 500;
    var HEIGHT = 500;

    var body = d3.select(".plotDiv");

    var svg = body.append("svg")
                        .attr("width", WIDTH)
                        .attr("height", HEIGHT)
                    .append("g")
                        .attr("width", WIDTH - 10)
                        .attr("height", HEIGHT - 10)
                        .attr("transform", "translate(30, -5)");

    var xAxis, yAxis;

    self.createSecondView = function() 
    {
        console.log("2nd View")

        var maxConcentration = d3.max(data, function(d) {return d.concentration});
        var minConcentration = d3.min(data, function(d) {return d.concentration});

        var maxX = d3.max(data, function(d) {return d.X});
        var maxY = d3.max(data, function(d) {return d.Z});

        var minX = d3.min(data, function(d) {return d.X});
        var minY = d3.min(data, function(d) {return d.Z});

        var colorScale = d3.scaleLinear()
                        .domain([minConcentration, maxConcentration / 4,maxConcentration / 2, maxConcentration - maxConcentration / 4, maxConcentration])
                        .range(["#000000", "#C91AC9", "#e33b3b", "#d8e309", "#faffb5"]);

        var createXYPlot = function()
        {
            xAxis = d3.scaleLinear(1)
                .domain([minX, maxX])
                .range([60, WIDTH - 60]);
            yAxis = d3.scaleLinear(1)
                .domain([minY, maxY])
                .range([HEIGHT - 60, 60]);
            
            svg.append("g")
                .classed("axis", true)
                .attr("transform", "translate("+ 0 +"," + (HEIGHT - 60) + ")")
                .call(d3.axisBottom(xAxis))
                .attr("fill", "white");

            svg.append("g")
            .classed("axis", true)
            .attr("transform", "translate("+ 60 +"," + 0 + ")")
                .call(d3.axisLeft(yAxis))
                .attr("fill", "white");

            let dataSlice = data.filter(d => d.Y <= sliderValue + dataTolerance && d.Y >= sliderValue - dataTolerance);

            let dataBind  = svg.selectAll(".point").data(dataSlice);
            dataBind.exit().remove();

            dataBind.enter()
                .append("circle")
                .classed("point", true)
                .attr("r", 1)
                .attr("cx", function(d) { return xAxis(d.X) })
                .attr("cy", function(d) { return yAxis(d.Z) })
                .attr('fill', function (d)
                {        
                    return colorScale(d.concentration);
                });            
        }

        var createXZPlot = function()
        {
            xAxis = d3.scaleLinear(1)
                .domain([-maxX, maxX])
                .range([60, WIDTH - 60]);
            yAxis = d3.scaleLinear(1)
                .domain([-maxX, maxX])
                .range([HEIGHT - 60, 60]);
            
            svg.append("g")
                .classed("axis", true)
                .attr("transform", "translate("+ 0 +"," + (HEIGHT - 60) + ")")
                .call(d3.axisBottom(xAxis))
                .attr("fill", "white");

            svg.append("g")
            .classed("axis", true)
            .attr("transform", "translate("+ 60 +"," + 0 + ")")
                .call(d3.axisLeft(yAxis))
                .attr("fill", "white");

            let dataSlice = data.filter(d => d.Z <= sliderValue + dataTolerance + bounds.maxY && d.Z >= sliderValue - dataTolerance + bounds.maxY);

            let dataBind  = svg.selectAll(".point").data(dataSlice);
            dataBind.exit().remove();

            dataBind.enter()
                .append("circle")
                .classed("point", true)
                .attr("r", 1)
                .attr("cx", function(d) { return xAxis(d.X) })
                .attr("cy", function(d) { return yAxis(d.Y) })
                .attr('fill', function (d)
                {        
                    return colorScale(d.concentration);
                });            
        }

        if (document.getElementById("plotCheckXY").checked)
        {
            console.log("XY!");
            createXYPlot();
        }
        if (document.getElementById("plotCheckXZ").checked)
        {
            console.log("XZ!");
            createXZPlot();
        }
    }

    // data loading function
    self.loadData = function(file){

        // read the csv file
        d3.csv(file)
        // iterate over the rows of the csv file
            .row(function(d) {

                // get the min bounds
                bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
                bounds.minY = Math.min(bounds.minY || Infinity, d.Points1);
                bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points2);

                // get the max bounds
                bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
                bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points1);
                bounds.maxZ = Math.max(bounds.maxY || -Infinity, d.Points2);

                // add the element to the data collection
                data.push({
                    // concentration density
                    concentration: Number(d.concentration),
                    // Position
                    X: Number(d.Points0),
                    Y: Number(d.Points1),
                    Z: Number(d.Points2),
                    // Velocity
                    U: Number(d.velocity0),
                    V: Number(d.velocity1),
                    W: Number(d.velocity2)
                });
            })
            // when done loading
            .get(function() {
                // draw the containment cylinder

                // create the particle system
                self.createParticleSystem();
                self.createSecondView();
                self.createCutPlane();
            });
    };

    // publicly available functions
    var publiclyAvailable = {

        // load the data and setup the system
        initialize: function(file){
            self.loadData(file);
        },

        // accessor for the particle system
        getParticleSystems : function() {
            return sceneObject;
        }
    };

    return publiclyAvailable;

};