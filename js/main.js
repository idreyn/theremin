var Application = Class.extend(function(){

	var canvas = document.getElementById('main');
	var p = paper;
	p.setup(canvas);

    this.constructor = function(){
    	this.draw = new Draw(canvas);
    };
});

var Draw = Class.extend(function() {
	var canvas;
	var nextElementTimeout;

	this.constructor = function(c) {
		this.canvas = canvas = c;
		Hammer(canvas).on('panstart',this.panStart);
		Hammer(canvas).on('pan',this.pan);
		Hammer(canvas).on('panend',this.panEnd);
		this.beginElement();
	}

	this.panStart = function() {
		if(nextElementTimeout) clearTimeout(nextElementTimeout);
	}

	this.pan = function() {

	}

	this.panEnd = function() {
		nextElementTimeout = setTimeout(this.beginElement,500);
	}

	this.beginElement= function() {
		if(this.element) {

		}
	}
});
