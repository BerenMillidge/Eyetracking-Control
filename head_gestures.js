
 	var gestureListElem;
 	var gestureList = {
 		// a simple container function for this implementing simple behaviour!
 		list: [],
 		maxLength: 5,
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


 	};

 	function getGestureListString(gestureList) {
 		var s = "";
 		for (var i = 0; i< gestureList.length; i++){
 			s+= gestureList[i];
 		}
 		return s;
 	}

 	var Head = {
		prevX : screen.width * 0.5,
		prevY : screen.wdith * 0.5,
		lr : 0.5,
		gestureXThreshold: 50,
		gestureYThreshold: 50,

		x : screen.width * 0.5,
		y : screen.width * 0.5,

		waverage: function(x,y) {
			Head.x = Head.lr * x + (1 - Head.lr) * Head.prevX;
			Head.y = Head.lr* y + (1-Head.lr) * Head.prevY;
		},

		update: function() {
			// update the head position from the thing
			var x = xLabs.getConfig("state.head.x");
			var y = xLabs.getConfig("state.head.y");
			var adjustedX = (screen.width * 0.5) - (x * 300);
			var adjustedY = ( screen.height * 0.5 ) + ( y * 300 );
			Head.waverage(adjustedX, adjustedY);
			Head.prevX = adjustedX;
			Head.prevY = adjustedY;

		},
		detectGesture: function(newX, newY) {
			var diffx = newX - Head.prevX;
			var diffy = newY - Head.prevY;
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


		}
	};

	function onXlabsReady(){		
		window.addEventListener("beforeunload", function() {
			xLabs.setConfig("system.mode", "off"); // switch of xlabs before unlading
		});

		xLabs.setConfig("calibration.clear", "1"); 
		xLabs.setConfig("system.mode", "head");
		xLabs.setConfig( "browser.canvas.paintHeadPose", "0" );
		gestureListElem = document.getElementById("gesture-list"); // get a reference to the gesture list elem!
		// setup style for gesture list elem
		gestureListElem.style.color = "red";
		gestureListElem.style.margin = "5px";
		gestureListElem.style.fontWeight = "bold";
		gestureListElem.style.fontSize = "42";
	}

	function onXlabslUpdate() {
		//var x = xLabs.getConfig("state.head.x");
		//var y = xLabs.getConfig("state.head.y");
		//var adjustedX = (screen.width * 0.5) - (x * 300);
		//var adjustedY = ( screen.height * 0.5 ) + ( y * 300 );
		Head.update();
		var gesture = Head.detectGesture(Head.x, Head.y);

		var style = "rgba( 255, 0, 0, 0.4 )";
		var radius = 15;
		Canvas.clear();
		Canvas.context.beginPath();
	    Canvas.context.lineCap = "round";
	    Canvas.context.lineWidth = 2;
	    Canvas.context.strokeStyle = style;
	    Canvas.context.arc( Head.x, Head.y, radius, 0, 2 * Math.PI, false);
	    Canvas.context.stroke();


		if (gesture) {
			gestureList.add(gesture);
			// set the text content of the list
			gestureListElem.textContent = gestureList.toString();
		}

	}

	xLabs.setup(onXlabsReady, onXlabslUpdate, null, ApiKey);
