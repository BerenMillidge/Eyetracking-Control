 	var targetElem;

 	Array.prototype.last = function() {
 		return this[this.length-1];
 	};

 	function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};


var Target = {
 	x: screen.width * 0.5,
 	y: screen.height * 0.5,
 	maxR: screen.width - 100,
 	maxL: 100,
 	stepSize: 10,

 	updatePosition: function() {
 		if (Target.x >= Target.maxR) {
 			Target.x = Target.maxL;
 			Target.y = screen.height * 0.5;
 		} else {
 			Target.x += Target.stepSize;
 			Target.y += Math.random(); 
 		}

 	},
 	draw: function() { 			
 		Canvas.context.beginPath();
	    Canvas.context.lineCap = "round";
	    Canvas.context.lineWidth = 2;
	    Canvas.context.strokeStyle = "rgb(0,0,255)";
	    Canvas.context.arc( Target.x, Target.y, 10, 0, 2 * Math.PI, false);
	    Canvas.context.stroke();

 	},

 	update: function() {
 		Target.updatePosition();
 		Target.draw();

 	},

 };
 	
 var Gaze = {

	  gazeMinSize : 90,
	  gazeMaxScreenFrac : 0.5,
	  maxConfidence : 8.0, // for simplePoly: 8.0, for compoundPoly: 10.0,
	  available : false,

	  // Gaze
	  xMeasuredSmoothed : 0.0,
	  yMeasuredSmoothed : 0.0,
	  xSmoothed : 0.0,
	  ySmoothed : 0.0,
	  cSmoothed : 0.0, 
	  
	  xyLearningRate : 0.25,
	  cLearningRate : 0.05,

	  // now also update the dwell time
	  timeDwelled: Date.now(),
	  timeMovedOverObject: null,
	  xCanvas : null,
	  yCanvas : null,

	  prevXSmoothed: null,
	  prevYSmoothed: null

	  update : function() {
	    Gaze.available = false;
	    var trackingSuspended = parseInt( xLabs.getConfig( "state.trackingSuspended" ) );
	    var calibrationStatus = parseInt( xLabs.getConfig( "calibration.status" ) );

	    if( ( calibrationStatus == 0 ) || ( trackingSuspended == 1 ) ) {
	      //console.log( "cs: "+calibrationStatus + " ts="+trackingSuspended );
	      return;
	    }

	    Gaze.available = true

	   	//save the previous ones
	   	Gaze.prevXSmoothed = Gaze.xSmoothed;
	   	Gaze.prevYSmoothed = Gaze.ySmoothed;

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
}

var Coordinates = {
 	headX : [],
 	headY : [],
 	targetX : [],
 	targetY : [],

 	windowSize: 15,
 	counter: 0,
 	correlationThresholdX: 0.9,
 	correlationThresholdY: 0.9,
 	distanceThreshold: 100,
 	increment: function() {
 		if (Coordinates.counter >= Coordinates.windowSize) {
 			Coordinates.counter = 0;
 		}
 		Coordinates.counter +=1;
 	},
 	add: function(hx, hy, tx, ty) {
 		if (Coordinates.headX.length < Coordinates.windowSize) {
 			Coordinates.headX.push(hx);
 			Coordinates.headY.push(hy);
 			Coordinates.targetX.push(tx);
 			Coordinates.targetY.push(ty);
 		} else {
 			Coordinates.headX[Coordinates.counter] = hx;
 			Coordinates.headY[Coordinates.counter] = hy;
 			Coordinates.targetX[Coordinates.counter] = tx;
 			Coordinates.targetY[Coordinates.counter] = ty;
 			Coordinates.increment();
 		}
 	},
 	getMean: function(l) {
 		return l.reduce(function(pre, cur){
 			return pre += cur;
 		}, 0) / l.length;
 	},
 	getSx: function(l, mu) {
 		if (!mu) {
 			mu = Coordinates.getMean(l);
 		}
 		return Math.sqrt(( 1/(l.length - 1)) * l.reduce(function(pre, cur){
 			return pre += Math.pow((cur-mu), 2);
 		}, 1))
 	},
 	
 	getSxProper: function(l, mu){
 		if (!mu){
 			mu = Coordinates.getMean(l);
 		}
 		total = 0;
 		for (var i = 0; i< l.length; i++){
 			console.log("list item: " + l[i] + " and mean " + mu);
 			total += Math.pow((l[i] - mu), 2);
 		}
 		if (total === 0) {
 			total = 1e-10;
 		}
 		console.log("sx total: " + total);
 		total = total * (1/(l.length-1));
 		console.log("sx total after division: " + total);
 		var res =  Math.sqrt(total);
 		console.log("Sx proper res: " + res);
 		return res;

 	},
 	getSumXY: function(l1, l2) {
 		var total =0;
 		for (var i = 0; i< l1.length; i++){
 			total += l1[i] * l2[i];
 		}
 		return total;
 	},
 	getNumerator: function(l1, l2, mu1, mu2) {
 		total = 0
 		for (var i = 0; i< l1.length; i++){
 			total += (l1[i] - mu1) * (l2[i] - mu2);
 		}
 		return total;
 	},
 	getStd: function(l, mu){
 		total = 0;
 		for (var i = 0; i<l.length; i++){
 			total += Math.pow((l[i] - mu), 2);
 		}
 		return Math.sqrt(total);
 	},

 	getR: function(l1, l2) {
 		var mul1 = Coordinates.getMean(l1);
 		var mul2 = Coordinates.getMean(l2);
 		console.log("mu 1" + mul1);
 		var std2 = Coordinates.getStd(l2, mul2);
 		var numerator = Coordinates.getNumerator(l1,l2,mul1, mul2);
 		console.log("R numerator: " + numerator);
 		var denomenator = std1 * std2;
 		return numerator / denomenator;
 	},

 	isWithinDistance: function() {
 		var diffx = Math.abs(Coordinates.headX.last() - Coordinates.targetX.last());
 		var diffy = Math.abs(Coordinates.headY.last() - Coordinates.targetY.last());
 		if (diffx < Coordinates.distanceThreshold && diffy < Coordinates.distanceThreshold) {
 			return true;
 		}
 		return false;
 	},


 	isFollowing: function() {
 		if (Coordinates.isWithinDistance()) {
	 		RX = Coordinates.getR(Coordinates.headX, Coordinates.targetX);
	 		RY = Coordinates.getR(Coordinates.headY, Coordinates.targetY);
	 		if (RX >=Coordinates.correlationThresholdX && RY>=Coordinates.correlationThresholdY) {
	 			return true;
	 		}
	 		return false;
	 	}
 	},
};

 	function onXlabsReady(){		
		window.addEventListener("beforeunload", function() {
			xLabs.setConfig("system.mode", "off"); // switch of xlabs before unloading
		});

		xLabs.setConfig("calibration.clear", "1"); 
		xLabs.setConfig("system.mode", "learning");
		xLabs.setConfig( "browser.canvas.paintHeadPose", "0" );
		targetElem = document.getElementById("target"); 
	}


	function onXlabslUpdate() {
		//var x = xLabs.getConfig("state.head.x");
		//var y = xLabs.getConfig("state.head.y");
		//var adjustedX = (screen.width * 0.5) - (x * 300);
		//var adjustedY = ( screen.height * 0.5 ) + ( y * 300 );
		Gaze.update();
		//var gesture = Head.detectGesture(Head.x, Head.y);
		Canvas.clear();
		Target.update();
		Gaze.render();
		Coordinates.add(Gaze.xsmoothed, Gaze.ysmoothed, Target.x, Target.y);
		var following = Coordinates.isFollowing();
		if (following) {
			debounce(alert("Smooth pursuit successful!"), 250);
		}
	}

	xLabs.setup(onXlabsReady, onXlabslUpdate, null, ApiKey);