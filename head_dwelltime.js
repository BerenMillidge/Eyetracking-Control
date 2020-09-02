	console.log('script working!');
	var head_radius = 30;
	var dwellTime = 5000;
	var canvas;
	var ctx;
	var towards_dwell_time = 0;
	previousSelectionTime = Date.now();
	// select all divs!
	var divs = [document.getElementById("test-div"), document.getElementById("div1"), document.getElementById("div2"), document.getElementById("div3"), document.getElementById("div4")];

	var Head = {
		prevX : screen.width * 0.5,
		prevY : screen.wdith * 0.5,
		lr : 0.5,

		x : screen.width * 0.5,
		y : screen.width * 0.5,
		// this just initializes head!

		waverage: function(x,y) {
			Head.x = Head.lr * x + (1 - Head.lr) * Head.prevX;
			Head.y = Head.lr* y + (1-Head.lr) * Head.prevY;
		},

		update: function() {
			// update the head position
			var x = xLabs.getConfig("state.head.x");
			var y = xLabs.getConfig("state.head.y");
			var adjustedX = (screen.width * 0.5) - (x * 300);
			var adjustedY = ( screen.height * 0.5 ) + ( y * 300 );
			Head.waverage(adjustedX, adjustedY);
			Head.prevX = adjustedX;
			Head.prevY = adjustedY;

		},
	};

	function checkIfWon() {
		var won = true;
		for (var i = 0; i< divs.length; i++) {
			el = divs[i];
			if (el.style.borderColor === "blue") {
				won = false;
			}
		}
		if (won === true) {
			alert("You won! Well done!");
		}
	}

	function onTestDivClick(e) {
		console.log(e);
		//alert("test div clicked!");
		el.style.borderColor="red";
	}

  function click_fn(el, x ,y) {
  	var rect = el.getBoundingClientRect();
  	var xy = {x: x - rect.left, y: y - rect.top};
  	var evt = new MouseEvent('click', {
  		view: window,
  		bubbles: true,
  		cancelable: true
  	});
  	el.dispatchEvent(evt); // this also dispatches a click event!
  }

  function div_click_fn(el,x,y){
  	//alert('div click function called!');
  	console.log(el);
  	// just switch it up
  	if (el.style.borderColor==="red") {
  		el.style.borderColor="blue";
  	}
  	else {
  		el.style.borderColor= "red";
  	}
  	checkIfWon();
  }
	function click_point(x,y, evt_fn) {
		//get element at point
		var el = document.elementFromPoint(x,y);
		console.log(el);
		console.log(el.getAttribute("id"));
		if (! el || el.getAttribute("id") == "canvas") {
			// no element to click
			//alert('Nothing to click');

		}
		else {
			// if no evt function put on
			if (!evt_fn) {
				//default to a click
				console.log('click functoin called!');
				el.click();
			}
			else {
				evt_fn(el, x, y);
			}
		}
	}


	function draw_dwelltime_circle() {
		ctx.beginPath();
		//ctx.clearRect(0,0,canvas.width,canvas.height);
		var angle_frac = Math.PI * 2 * (towards_dwell_time/dwellTime);
		// draw the circle
		ctx.arc(adjustedX,adjustedY, 5, angle_frac, Math.PI * 2, true);
		ctx.stroke();
		ctx.strokeStyle='rgb(0,255,255)';
		ctx.closePath();
	}

	function onXlabsReady(){
		console.log('xlabs ready!');
		window.addEventListener("beforeunload", function() {
			xLabs.setConfig("system.mode", "off"); // switch of xlabs before unloading
		});

		xLabs.setConfig("calibration.clear", "1"); // clears the xlabs calibration
		//xlabs.setConfig("system.mode", "learning"); // set it to eye tracking mode!
		//xLabs.setConfig("browser.canvas.paintLearning","0"); 
		// get the head position
		xLabs.setConfig("system.mode", "head");
		//xLabs.frame.stream.preview(); 
		xLabs.setConfig( "browser.canvas.paintHeadPose", "0" );
		canvas = document.getElementById("canvas");
		canvas.style.width = screen.width;
		canvas.style.height = screen.height;
		canvas.style.border = "red dashed 3px;";
		// try setting this
		//canvas.style.position="fixed";
		if (!canvas.getContext) {
			console.log('canvas not supported!');
		}
		if(canvas.getContext){
			console.log('canvas supported!');
			ctx = canvas.getContext('2d');
		}
		// make canvas nonclickable
		Canvas.setCaptureMouse(undefined); // this hack should stop it from capturing the mouse hopefully
		Canvas.removeClass(Canvas.element, "allow-pointer")

		// set test div on click as a test!
		var testdiv = document.getElementById('test-div');
		testdiv.setAttribute("onClick", onTestDivClick);
		}

	function onXlabsUpdate() {
		var x = xLabs.getConfig("state.head.x");
		var y = xLabs.getConfig("state.head.y");
		var adjustedX = (screen.width * 0.5) - (x * 300);
		var adjustedY = ( screen.height * 0.5 ) + ( y * 300 );
		//console.log('adjusted');
		//console.log(adjustedX);
		//console.log(adjustedY);
		//canvas.style.left = adjustedX - (head_radius + 20);
		//canvas.style.top=adjustedY -( head_radius + 20);
		//console.log(canvas.style.left);
		//console.log(canvas.style.top);
		//just try drawing something
		//ctx.fillRect(50,50,50,50);
		// clear previous
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.beginPath();
		ctx.arc(adjustedX ,adjustedY, 4, 0, Math.PI*2, true);
		ctx.stroke();
		ctx.strokeStyle='rgb(255,0,0)';
		ctx.closePath();

		//try a target just to see if it works
		var target = document.getElementById("target");
		target.style.left = adjustedX;
		target.style.top=adjustedY;
		//console.log('in xlabsl update!');
		//console.log(target.style.left);

		// set up the times here!
		towards_dwell_time = Date.now() - previousSelectionTime;
		if (towards_dwell_time >= dwellTime){
			towards_dwell_time = 0;
			previousSelectionTime = Date.now();
			// actually do a dwelltime click

		}
		draw_dwelltime_circle();

	}

	function draw_dwelltime_circle_canvas(x,y,r) {
		var offset  = 2;
		var angle_frac = Math.PI * 2 * (towards_dwell_time/dwellTime);
		var style='rgb(0,255,0)';
		Canvas.context.beginPath();
		Canvas.context.lineWidth=2;
		Canvas.context.strokeStyle = style;
		Canvas.context.arc(x,y, r + offset, angle_frac, Math.PI * 2, true);
		Canvas.context.stroke();
	}

	function XlabslUpdate2(){
		// get x position
		//var x = xLabs.getConfig("state.head.x");
		//var y = xLabs.getConfig("state.head.y");
		//var adjustedX = (screen.width * 0.5) - (x * 300);
		//var adjustedY = ( screen.height * 0.5 ) + ( y * 300 );
		Head.update();
		var style = "rgba( 255, 0, 0, 0.4 )";
		var radius = 15;

		Canvas.clear();
		Canvas.context.beginPath();
	    Canvas.context.lineCap = "round";
	    Canvas.context.lineWidth = 2;
	    Canvas.context.strokeStyle = style;
	    Canvas.context.arc( Head.x, Head.y, radius, 0, 2 * Math.PI, false);
	    Canvas.context.stroke();
	   // console.log(Head.x);
	   // console.log(Head.y);
	    towards_dwell_time = Date.now() - previousSelectionTime;
		if (towards_dwell_time >= dwellTime){
			towards_dwell_time = 0;
			previousSelectionTime = Date.now();
			click_point(Head.x, Head.y, div_click_fn);
		}
		draw_dwelltime_circle_canvas(Head.x, Head.y, radius);


	}

	xLabs.setup(onXlabsReady, XlabslUpdate2, null, ApiKey);