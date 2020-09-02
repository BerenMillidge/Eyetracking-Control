
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
 			// just do a simple horizontal transmission with repeat

 		},
 		draw: function() { 			/*
 			Canvas.context.beginPath();
 			Canvas.context.moveTo(Target.x-25, Target.Y-25);
 			Canvas.context.lineTo(Target.X-25, Target.y+50);
 			Canvas.context.lineTo(Target.X + 25, Target.Y+25);
 			Canvas.context.lineTo(Target.x-25, Target.Y-25);
 			Canvas.context.closePath();
 			Canvas.context.fill();
 			*/
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
 				//console.log("sx proper total: " + total);
 				console.log("list item: " + l[i] + " and mean " + mu);
 				total += Math.pow((l[i] - mu), 2);
 			}
 			if (total === 0) {
 				//for numerical stability try this
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
 			//var sxl1 = Coordinates.getSxProper(l1, mul1);
 			//var sxl2 = Coordinates.getSxProper(l2, mul2);
 			//var numerator = Coordinates.getSumXY(l1,l2) - (l1.length * mul1 * mul2);
 			var std1 = Coordinates.getStd(l1, mul1);
 			var std2 = Coordinates.getStd(l2, mul2);
 			var numerator = Coordinates.getNumerator(l1,l2,mul1, mul2);
 			console.log("R numerator: " + numerator);
 			//var denomenator = (l1.length - 1) * sxl1 * sxl2;
 			var denomenator = std1 * std2;
 			return numerator / denomenator;

 		},

 		// also check to make sure the head position is within a distance threshold
 		isWithinDistance: function() {
 			//console.log("head x" + Coordinates.headX);
 			//console.log("target x " + Coordinates.tagetY);
 			var diffx = Math.abs(Coordinates.headX.last() - Coordinates.targetX.last());
 			var diffy = Math.abs(Coordinates.headY.last() - Coordinates.targetY.last());
 			//console.log("diffx: " + diffx);
 			//console.log("diffy: " + diffy);
 			if (diffx < Coordinates.distanceThreshold && diffy < Coordinates.distanceThreshold) {
 				return true;
 			}
 			return false;
 		},


 		isFollowing: function() {
 			if (Coordinates.isWithinDistance()) {
 				console.log("heady: " + Coordinates.headY);
 				console.log("targety: " + Coordinates.targetY);
	 			RX = Coordinates.getR(Coordinates.headX, Coordinates.targetX);
	 			RY = Coordinates.getR(Coordinates.headY, Coordinates.targetY);
	 			console.log("X correlation: " + RX.toString());
	 			console.log("Y correlation: " + RY.toString());
	 			if (RX >=Coordinates.correlationThresholdX && RY>=Coordinates.correlationThresholdY) {
	 				return true;
	 			}
	 			return false;
	 		}
 		},
 	};

 	function onXlabsReady(){		
		window.addEventListener("beforeunload", function() {
			xLabs.setConfig("system.mode", "off"); // switch of xlabs before unlading
		});

		xLabs.setConfig("calibration.clear", "1"); 
		xLabs.setConfig("system.mode", "head");
		xLabs.setConfig( "browser.canvas.paintHeadPose", "0" );
		targetElem = document.getElementById("target"); 
	}

	function animateHeadTrace() {
		// this just gives you the standard head trace
		var style = "rgba( 255, 0, 0, 0.4 )";
		var radius = 15;
		Canvas.context.beginPath();
	    Canvas.context.lineCap = "round";
	    Canvas.context.lineWidth = 2;
	    Canvas.context.strokeStyle = style;
	    Canvas.context.arc( Head.x, Head.y, radius, 0, 2 * Math.PI, false);
	    Canvas.context.stroke();
	}



	function onXlabslUpdate() {
		//var x = xLabs.getConfig("state.head.x");
		//var y = xLabs.getConfig("state.head.y");
		//var adjustedX = (screen.width * 0.5) - (x * 300);
		//var adjustedY = ( screen.height * 0.5 ) + ( y * 300 );
		Head.update();
		//var gesture = Head.detectGesture(Head.x, Head.y);
		Canvas.clear();
		Target.update();
		animateHeadTrace();
		Coordinates.add(Head.x, Head.y, Target.x, Target.y);
		var following = Coordinates.isFollowing();
		if (following) {
			debounce(alert("Smooth pursuit successful!"), 250);
		}
	}

	xLabs.setup(onXlabsReady, onXlabslUpdate, null, ApiKey);