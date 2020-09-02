var gestureList = document.getElementById("gesture-list");
var gestureTarget = document.getElementById("gesture-target");
var resultText = document.getElementById("result-text");
var percentageSuccess = document.getElementById("percent-success");



var Game = {
	difficulty: 1,
	numSuccesses: 0,
	numFailures: 0,
	successesToNextLevel: 5,
	numSequentialSuccesses: 0,
	nextGameTimeout: 200,
	gestureTarget: null,

	init: function() {
		Game.again();
		//setup first run of game loop
	},

	victory: function() {
		resultText.innerHtml = "Success!";
		resultText.style.color = "green";
		numSuccesses +=1
		Game.updatePercentages();
		Game.numSequentialSuccesses +=1
		if (Game.numSequentialSuccesses >= Game.successesToNextLevel){
			Game.numSequentialSuccesses = 0;
			Game.difficulty +=1

		}
		setTimeout(function(){
			Game.again();
		},Game.nextGameTimeout);

	},

	defeat: function() {
		resultText.innerHtml = "Failed!";
		resultText.style.color = "red";
		numFailures +=1
		Game.updatePercentages();
		Game.numSequentialSuccesses = 0;

		setTimeout(function(){
			Game.again();
		},Game.nextGameTimeout);

	},

	updatePercentages: function() {
		var percent = (numSuccesses / (numSuccesses + numFailures)) * 100;
		percentageSuccess.innerHtml = percent.toString();
	},

	again: function() {
		gestureList.clear();
		gestureList.maxLength = Game.difficulty;
		Game.gestureTarget = Game.initializeGestureTarget();
		gestureTarget.innerHtml = Game.gestureTarget;
		Game.numSequentialSuccesses = 0;

	},
	initializeGestureTarget: function() {
		s =  "";
		for (var i = 0; i<Game.difficulty; i++){
			s+= randomGesture();
		}
		return s;
	},
	mainLoop: function() {
		Gaze.update();
		Gaze.render();
		var gesture = Gaze.detectGesture();
		if (gesture){
			gestureList.add(gesture);
			if (gestureList.list.length >= gestureList.maxLength) {
				if(Game.gestureTarget === gestureList.toString()) {
					Game.victory();
				} else {
					Game.defeat();
				}
			}
		}
	},

}

function getGestureTarget(){
	return gestureTarget.innerHtml.toString();
}


var gestureList = {
 		list: [],
 		maxLength: difficulty,
 		counter: 0,

 		add: function(gesture) {
 			if (gestureList.list.length < gestureList.maxLength){
 				gestureList.list.push(gesture);
 			} else {
 				gestureList.list[gestureList.counter] = gesture;
 				gestureList.increment();
 			}

 		},

 		increment: function() {
 			if (gestureList.counter >=5){
 				gestureList.counter = 0;
 			} else {
 				gestureList.counter +=1;
 			}
 		},


 		toString: function() {
	 		var s = "";
	 		for (var i = 0; i< gestureList.list.length; i++){
	 			s+= gestureList.list[i]
	 		}
	 		return s;
 		},
 		clear: function() {
 			gestureList.list = [];
 			gestureList.counter = 0;
 		},


 };

 function getGestureListString(gestureList) {
 		var s = "";
 		for (var i = 0; i< gestureList.length; i++){
 			s+= gestureList[i];
 		}
 		return s;
 }

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
  },

  detectGesture: function() {
	var diffx = Gaze.xSmoothed - Gaze.prevXSmoothed;
	var diffy = Gaze.ySmoothed - Gaze.prevYSmoothed;
	console.log("diffx");
	console.log(diffx);
	console.log("diffy");
	console.log(diffy);

	if (diffx >= Head.gestureXThreshold && diffy >= Head.gestureYThreshold) {
		return "A";
	}
	if (diffx >= Head.gestureXThreshold && diffy <= -1 * Head.gestureYThreshold) {
		return "B";
	}
	if (diffx <= -1 * Head.gestureXThreshold && diffy >= Head.gestureYThreshold) {
		return "C";
	}
	if (diffx <= -1 * Head.gestureXThreshold && diffy <= -1 * Head.gestureYThreshold) {
		return "D";
	}

	if (diffx >= Head.gestureXThreshold) {
		return "R";
	}
	if (diffx <= -1 * Head.gestureXThreshold) {
		return "L";
	}
	if (diffy >= Head.gestureYThreshold) {
		return "U";
	}
	if (diffy <= -1 * Head.gestureYThreshold) {
		return "D"
	}
	else {
		return null;
	}	


  },

};

function onXlabsReady() {
    window.addEventListener( "beforeunload", function() {
        xLabs.setConfig( "system.mode", "off" );
    });

    xLabs.setConfig( "calibration.clear", "1" ); // this also clears the memory buffer
    xLabs.setConfig( "system.mode", "learning" );
    xLabs.setConfig( "browser.canvas.paintLearning", "0" );

  	Game.init();
};

function onXlabsUpdate() {
	Game.mainLoop();
};



xLabs.setup( onXlabsReady, onXlabsUpdate, null, ApiKey );