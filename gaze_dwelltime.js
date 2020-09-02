

var env;
GazeDwellTime = function(){
	this.dwellTime = 1000;
	this.objects = [];
	this.maxObjectLength = 400;
	this.maxObjectHeight=400;
	this.maxObjectSpeed= 20;
	this.objectStationaryProbability = 0.5;
	this.previousUpdateTime= Date.now();

	this.gazeCatchment = 100;
	this.currentlyHovered = null;
	this.previouslyHovered= null;
	this.dwellTimeBegun = false;
	this.dwellTimeStartTime = Date.now();
	this.currentDwellTime = Date.now();
};

GazeDwellTime.prototype.init  = function(num_random) {
	for (var i = 0; i< num_random; i++){
		this.addRandomObject();
	}
	console.log(screen.width);
	console.log('logging init objects!');
	console.log(this.objects);

};

GazeDwellTime.prototype.addRandomObject = function() {
	var objectSpeed;
	if (Math.random() > this.objectStationaryProbability) {
		objectSpeed = Math.random() * this.maxObjectSpeed
	} else {
		objectSpeed = 0;
	}
	var dirX;
	var dirY; 
	// get direction!
	if (objectSpeed > 0){
	var up = Math.random() > 0.5;
	var left = Math.random() > 0.5; 
	var dirfrac = Math.random();
	if (left === true) {
		dirX = dirfrac;
	} else {
		dirX = -1 * dirfrac;
	}
	if (up === true) {
		dirY = 1 - dirfrac;
	} else {
		dirY = -1 * (1 - dirfrac);
	}
	}

	dirX = dirX || 0;
	dirY = dirY || 0;

	this.addObject(
		Math.random() * screen.width,
		Math.random() * screen.height,
		Math.random() * this.maxObjectLength,
		Math.random() * this.maxObjectHeight,
		objectSpeed,
		dirX,
		dirY
		 );
	return;
};

GazeDwellTime.prototype.addObject = function(x,y,h,w,sp, dirx, diry) {
	var obj = new GazeDwellTime.object();
	console.log(x);
	obj.x = x;
	obj.y = y;
	obj.height = h;
	obj.width = w;
	obj.speed = sp;
	obj.selected = false;
	obj.dirx = dirx;
	obj.diry = diry;
	obj.id = this.objects.length +1;
	console.log(obj.x);
	this.objects.push(obj);
	console.log(obj);
	return obj;
};

GazeDwellTime.prototype.update = function() {
	console.log("in update function");
	console.log(this.previousUpdateTime);
	if (!this.previousUpdateTime) {
		console.log("setting previous update time!");
		this.previousUpdateTime = Date.now();

	}
	Canvas.clear(); 
	console.log('objects');
	console.log(this.objects);
	for (var i = 0; i<this.objects.length; i++){
		var obj = this.objects[i];
		console.log('in object loop update');
		console.log(obj);
		obj.update();
		obj.render();
	}
	Gaze.update();
	Gaze.render();
	this.previousUpdateTime = Date.now();
	this.getHoveredObject();
	if (this.previouslyHovered === this.currentlyHovered){
		if (!this.dwellTimeBegun) {
			this.dwellTimeBegun = true;
			this.dwellTimeStartTime = Date.now();
		} else {
			this.currentDwellTime = Date.now();
			var diff = this.currentDwellTime - this.dwellTimeStartTime;
			if (diff >= this.dwellTime) {
				this.dwellTimeBegun = false;
				// select object
				this.objects.forEach(function(obj){
					if (obj.id === this.currentlyHovered) {
						obj.isSelected();
						//select the object
					}
				})
			}
		}
	} else {
		this.dwellTimeBegun = false;
	}
	if (this.checkVictory()) {
		alert("You won! All objects are selected!");
	}
	return;
};


GazeDwellTime.prototype.onClick = function(e) {
	if (xLabs.documentOffsetReady()) {
		this.renderClick(xLabs.scr2docX(e.screenX), xLabs.scr2docY(e.screenY));
	}
	return;
};

GazeDwellTime.prototype.renderClick = function(x,y) {
	return; 
	// TODO
};

GazeDwellTime.prototype.checkVictory = function() {
	this.objects.forEach(function(obj){
		if (obj.selected ===false) {
			return false;
		}
	})
	return false;
};

GazeDwellTime.prototype.getHoveredObject = function() {
	this.objects.forEach(function(obj){
		var id = obj.isGazeHovered();
		if (id) {
			this.previouslyHovered = this.currentlyHovered;
			this.currentlyHovered = id;
		}
	});
	GazeDwellTime.previouslyHovered = GazeDwellTime.currentlyHovered;
	GazeDwellTime.currentlyHovered = null;
};

GazeDwellTime.object = function() {
	this.x = null;
	this.y = null;
	this.height = null;
	this.width = null;
	this.speed = null;
	this.dirx = null;
	this.diry = null;
	this.selected=false;
	this.id = null;
};

GazeDwellTime.object.prototype.update= function() {
	
	//var timeDiff = now - env.previousUpdateTime;
	this.x += this.dirx * this.speed;
	this.y += this.diry * this.speed; 
	if (this.x <0) {
		this.x = screen.width;
	}
	if (this.x > screen.width){
		this.x = 0;
	}
	if (this.y < 0){
		this.y = screen.height;
	}
	if(this.y > screen.height){
		this.y = 0;
	}


};

// render objects as rectangles
GazeDwellTime.object.prototype.render = function() {
	Canvas.context.beginPath();
	Canvas.context.rect(this.x - 0.5*this.width, this.y - 0.5*this.height, this.width, this.height);
	if (this.selected ===true) {
		Canvas.context.strokeStyle = "rgba(0,255,0,1)";
	} else {
		Canvas.context.strokeStyle = "rgba(255,0,0,1)";
	}
	Canvas.context.stroke();
	Canvas.context.closePath();
};

GazeDwellTime.object.prototype.isSelected = function() {

	this.selected = !this.selected;
	//TODO
};

GazeDwellTime.object.prototype.isGazeHovered = function() {
	// check if x and y are within gaze selection
	if (Gaze.xCanvas  <= this.x + GazeDwellTime.gazeCatchment
		&& Gaze.xCanvas >= this.x - GazeDwellTime.gazeCatchment 
		&& Gaze.yCanvas <= this.y + GazeDwellTime.gazeCatchment
		&& Gaze.yCanvas >= this.y - GazeDwellTime.gazeCatchment) {
		return this.id;
	}
	return null;
};

var Gaze = {

  gazeMinSize : 90,
  gazeMaxScreenFrac : 0.5,
  maxConfidence : 8.0, 
  available : false,

  // Gaze
  xMeasuredSmoothed : 0.0,
  yMeasuredSmoothed : 0.0,
  xSmoothed : 0.0,
  ySmoothed : 0.0,
  cSmoothed : 0.0, 
  
  xyLearningRate : 0.25,
  cLearningRate : 0.05,

  timeDwelled: Date.now(),
  timeMovedOverObject: null,
  xCanvas : null,
  yCanvas : null,

  update : function() {
    Gaze.available = false;
    var trackingSuspended = parseInt( xLabs.getConfig( "state.trackingSuspended" ) );
    var calibrationStatus = parseInt( xLabs.getConfig( "calibration.status" ) );

    if( ( calibrationStatus == 0 ) || ( trackingSuspended == 1 ) ) {
      //console.log( "cs: "+calibrationStatus + " ts="+trackingSuspended );
      return;
    }

    Gaze.available = true;

    var xMeasured = parseFloat( xLabs.getConfig( "state.gaze.measured.x" ) ); // screen coords
    var yMeasured = parseFloat( xLabs.getConfig( "state.gaze.measured.y" ) ); // screen coords
    var xEstimate = parseFloat( xLabs.getConfig( "state.gaze.estimate.x" ) ); // screen coords
    var yEstimate = parseFloat( xLabs.getConfig( "state.gaze.estimate.y" ) ); // screen coords
    var c = parseFloat( xLabs.getConfig( "state.calibration.confidence" ) ); 

    xEstimate = Math.max( 0, Math.min( screen. width-1, xEstimate ) );
    yEstimate = Math.max( 0, Math.min( screen.height-1, yEstimate ) );

    // condition c into a continuous unit value
    if( c > Gaze.maxConfidence ) {
      c = Gaze.maxConfidence;
    }
    if( c < 0 ) c = Gaze.maxConfidence;
    var cUnit = c / Gaze.maxConfidence;

    // smooth these measurements
    if( isNaN( Gaze.xSmoothed         ) ) Gaze.xSmoothed = screen.width * 0.5;
    if( isNaN( Gaze.ySmoothed         ) ) Gaze.ySmoothed = screen.height * 0.5;
    if( isNaN( Gaze.xMeasuredSmoothed ) ) Gaze.xMeasuredSmoothed = screen.width * 0.5;
    if( isNaN( Gaze.yMeasuredSmoothed ) ) Gaze.yMeasuredSmoothed = screen.height * 0.5;
    
    Gaze.xMeasuredSmoothed = Util.lerp( Gaze.xMeasuredSmoothed, xMeasured, Gaze.xyLearningRate );
    Gaze.yMeasuredSmoothed = Util.lerp( Gaze.yMeasuredSmoothed, yMeasured, Gaze.xyLearningRate );
    Gaze.xSmoothed = Util.lerp( Gaze.xSmoothed, xEstimate, Gaze.xyLearningRate );
    Gaze.ySmoothed = Util.lerp( Gaze.ySmoothed, yEstimate, Gaze.xyLearningRate );
    Gaze.cSmoothed = Util.lerp( Gaze.cSmoothed, cUnit, Gaze.cLearningRate );
    var xyCanvas = xLabs.scr2doc( Gaze.xSmoothed, Gaze.ySmoothed );
    Gaze.xCanvas = xyCanvas.x; 
    Gaze.yCanvas = xyCanvas.y;
  },
 
  render : function() {
    var gazeMaxSize = screen.height * Gaze.gazeMaxScreenFrac;
    var radiusRange = gazeMaxSize - Gaze.gazeMinSize;
    var radius = ( radiusRange * Gaze.cSmoothed ) + Gaze.gazeMinSize;

    var xyCanvas = xLabs.scr2doc( Gaze.xSmoothed, Gaze.ySmoothed );
    var xCanvas = xyCanvas.x; 
    var yCanvas = xyCanvas.y;
    
    var style = "rgba( 255, 0, 0, 0.4 )";

    Canvas.context.beginPath();
    Canvas.context.lineCap = "round";
    Canvas.context.lineWidth = 8;
    Canvas.context.strokeStyle = style;
    Canvas.context.arc( Gaze.xCanvas, Gaze.yCanvas, radius, 0, 2 * Math.PI, false);
    Canvas.context.stroke();

    // also render the dwell time
    if (GazeDwellTime.dwellTimeBegun) {
    	// render the dwell time circle!
    	Canvas.context.beginPath();
    	var angle_frac = Math.PI * 2 * (towards_dwell_time/dwellTime);
		// draw the circle
		Canvas.context.arc(adjustedX,adjustedY, 5, angle_frac, Math.PI * 2, true);
		Canvas.context.stroke();
		Canvas.context.strokeStyle='rgb(0,255,255)';
		Canvas.context.closePath();
    }
  }

};

function onXlabsReady() {
    window.addEventListener( "beforeunload", function() {
        xLabs.setConfig( "system.mode", "off" );
    });

    xLabs.setConfig( "calibration.clear", "1" );
    xLabs.setConfig( "system.mode", "learning" );
    xLabs.setConfig( "browser.canvas.paintLearning", "0" );

  	env = new GazeDwellTime();
  	env.init(10);
  	if (xLabs.documentOffsetReady()){
  	//env.update();
  }
  	//env.update();
};

function onXlabsUpdate() {
	env.update();
};



xLabs.setup( onXlabsReady, onXlabsUpdate, null, ApiKey );
