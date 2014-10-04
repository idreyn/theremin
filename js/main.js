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
	var p = paper;
	var nextElementTimeout;

	this.constructor = function(c) {
		this.canvas = canvas = c;
		var h = Hammer(canvas);
		h.on('panstart',this.panStart);
		h.on('pan',this.pan);
		h.get('pan').set({threshold: 0, direction: Hammer.DIRECTION_ALL});
		h.on('panend',this.panEnd);
		this.beginElement();
	}

	this.panStart = function(e) {
		if(nextElementTimeout) clearTimeout(nextElementTimeout);
		this.element.moveTo(this.globalToLocal(e.center));
	}

	this.pan = function(e) {
		this.element.lineTo(this.globalToLocal(e.center));
	}

	this.panEnd = function(e) {
		nextElementTimeout = setTimeout(this.beginElement,1000);
	}

	this.beginElement= function() {
		if(this.element) {
			this.detectElementType();
			this.element.strokeColor = '#DDD';
		}
		this.element = new p.CompoundPath();
		this.element.strokeColor = 'black';
		this.element.strokeWidth = 2;
		p.view.draw();
	}

	this.detectElementType = function() {
		var CURVE_DISTANCE_THRESHOLD = 20;
		var CURVE_SIMPLIFY_THRESHOLD = 20;
		var APPROX_ANGLES = [-90,-60,-45,-30,0,30,45,60,90];
		var angles = [];
		var firstPoint;
		var lastPoint;
		var elementAngle;
		var intersections = 0;
		var possible = new Set([
			'wire',
			'resistor',
			'capacitor',
			'inductor',
			'current_source',
			'voltage_source'
		]);
		if(this.element.children.length > 1) {
			possible.remove('wire');
			possible.remove('resistor');
			possible.remove('inductor');
		}
		for(var j=0;j<this.element.children.length;j++) {
			var path = this.element.children[j];
			if(path.length > 5) {
				path.simplify(CURVE_SIMPLIFY_THRESHOLD);
			}
			var sub_segments = [];
			intersections += path.getIntersections(path).length;
			for(var i=0;i<path.curves.length;i++) {
				var curve = path.curves[i],
					start = curve.point1,
					end = curve.point2;
					if(!firstPoint) {
						firstPoint = start;
					}
					lastPoint = end;
				if(start.getDistance(end) > CURVE_DISTANCE_THRESHOLD) {
					sub_angles.push(end.subtract(start).angle);
				}
			}
			sub_angles = sub_angles.map(function(a) {
				return Utils.snap(a,APPROX_ANGLES);
			});
			angles = angles.concat(sub_angles);
		}
		elementAngle = Utils.snap(lastPoint.subtract(firstPoint).angle,APPROX_ANGLES);
		angles = angles.map(function(a) {
			return a - elementAngle;
		});
		// Let's see what's left
		if(intersections < 2) {
			possible.remove('inductor');
		}
		if(!Utils.sameArray(angles.map(Math.abs),[0,90,90,0])) {
			possible.remove('voltage_source');
			possible.remove('capacitor');
		}
		if(!(Math.min.apply(null,angles) <= -45 && Math.max.apply(null,angles) >= 45) || intersections > 0) {
			possible.remove('resistor');
		}
		console.log(possible.get());
		return possible.get();
	}

	this.globalToLocal = function(p) {
		var o = $(canvas).offset();
		return new paper.Point(p.x - o.left,p.y - o.top);
	}
});
