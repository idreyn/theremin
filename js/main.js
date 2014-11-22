var Application = Class.extend(function(){
	var canvas = document.getElementById('main');
	paper.setup(canvas);

    this.constructor = function(){
    	this.draw = new Draw(canvas);
    };
});

var Draw = Class.extend(function() {
	var self = this;
	var canvas;
	var p = paper;
	var nextElementTimeout;
	var dragUpdateFunctions;
	var elementsNearCursor;
	var cursorOnDragPoint;
	var isDraggingNode;
	var isAssigningValue;
	var wasAssigningValue;
	var assignStartDistance;
	var assignInitialValue;
	var lastValidCursorPosition;

	this.constructor = function(c) {
		canvas = c;
		this.recog = new Recognizer();
		this.elements = new Set();
		this.gridSize = 30;
		var h = Hammer(canvas);
		h.on('panstart',this.panStart);
		h.on('pan',this.pan);
		h.get('pan').set({threshold: 0, direction: Hammer.DIRECTION_ALL});
		h.on('panend',this.panEnd);
		$(canvas).on('mousemove',this.mouseMove);
		this.beginElement();
		this.renderGrid(this.gridSize);
	}

	this.renderGrid = function(size) {
		var width = $(canvas).width();
		var height = $(canvas).height();
		this.grid = new paper.CompoundPath();
		this.grid.strokeColor = '#F5F5F5';
		this.grid.strokeWidth = 1;
		for(var i=0;i<height/size;i++) {
			this.grid.moveTo(new paper.Point(0,i * size));
			this.grid.lineTo(new paper.Point(width,i * size));
		}
		for(var i=0;i<width/size;i++) {
			this.grid.moveTo(new paper.Point(i * size,0));
			this.grid.lineTo(new paper.Point(i * size,height));
		}
		paper.view.draw();
	}

	this.mouseMove = function(e) {
		var mouse = this.globalToLocal(new paper.Point(e.pageX,e.pageY));
		var p = Utils.snapPointNearest(mouse,this.gridSize);
		if(!this.cursorBlip) {
			this.cursorBlip = new paper.Shape.Circle(p,5);
			this.cursorBlip.fillColor = '#EEE';
		}
		this.cursorBlip.bringToFront();
		this.cursorBlip.position = p;
		elementsNearCursor = this.elements.query(function(el) {
			return el.start.equals(p) || el.end.equals(p)
		});
		if(elementsNearCursor.size() > 0 && this.cursorBlip.position.getDistance(mouse) <= 5) {
			cursorOnDragPoint = true;
			this.cursorBlip.visible = true;
		} else {
			cursorOnDragPoint = false;
			this.cursorBlip.visible = false;
		}
	}

	this.panStart = function(e) {
		var self = this;
		if(!cursorOnDragPoint) {
			isDraggingNode = false;
			if(nextElementTimeout) clearTimeout(nextElementTimeout);
			this.scribble.moveTo(this.globalToLocal(e.center));
		} else {
			lastValidCursorPosition = this.cursorBlip.position;
			isDraggingNode = true;
			dragUpdateFunctions = elementsNearCursor.map(function(el) {
				if(el.start.equals(self.cursorBlip.position)) {
					return el.setStart;
				} else {
					return el.setEnd;
				}
			});
		}
	}

	this.pan = function(e) {
		var self = this;
		var mouse = this.globalToLocal(e.center);
		if(!isDraggingNode) {
			this.scribble.lineTo(mouse);
			if(!isAssigningValue) {
				try {
					var rec = this.recog.guess(Utils.compoundPathToDollarPCloud(this.scribble));
					if(rec.Name == '0' && rec.Score > 0.25) {
						var scribbled = this.scribbledOutElements(this.scribble);
						if(scribbled.size()) {
							this.selectedElement = scribbled.at(0);
							this.selectedElement.path.strokeColor = '#33D';
							isAssigningValue = true;
							assignInitialValue = this.selectedElement.value;
							assignStartDistance = this.selectedElement.path.position.getDistance(mouse);
						}
					}

				} catch(e) {
				
				}
			} else {
				var center = this.selectedElement.path.position;
				var distance = this.selectedElement.path.position.getDistance(mouse);
				var value = Utils.snapNearest(Utils.snapNearest(
					Math.pow(3,distance/assignStartDistance),
					Math.pow(10,-1 + Math.floor((distance / assignStartDistance)/2))
				),0.5);
				this.selectedElement.value = value;
				this.selectedElement.renderText();
			}
		} else {
			dragUpdateFunctions.forEach(function(lambda) {
				lambda(self.cursorBlip.position);
			});
			if(!this.isValidPlacement()) {
				dragUpdateFunctions.forEach(function(lambda) {
					lambda(lastValidCursorPosition);
				});
			} else {
				lastValidCursorPosition = self.cursorBlip.position;
			}
		}
	}

	this.panEnd = function(e) {
		if(this.selectedElement) {
			this.selectedElement.path.strokeColor = '#000';
			this.selectedElement = null;
		}
		if(isDraggingNode) {
			this.nodeDragAftermath();
		}
		if(isAssigningValue) {
			this.scribble.remove();
			isAssigningValue = false;
			wasAssigningValue = true;
		}
		isDraggingNode = false;
		nextElementTimeout = setTimeout(this.beginElement,500);
	}

	this.nodeDragAftermath = function() {
		this.removeZeroLengthElements();
	}

	this.removeZeroLengthElements = function() {
		this.elements.query(function(el) {
			if(el.start.equals(el.end)) {
				el.destruct();
				self.elements.remove(el);
			}
		});
	}

	this.beginElement = function() {
		if(this.scribble) {
			if(wasAssigningValue) {
				wasAssigningValue = false;
			} else {
				var rec = this.recog.guess(Utils.compoundPathToDollarPCloud(this.scribble));
				var scribbledOutElements = this.scribbledOutElements(this.scribble,3);
				if(scribbledOutElements.size()) {
					if(isAssigningValue) {

					} else {
						scribbledOutElements.map(function(el) {
							self.elements.remove(el);
							el.destruct();
						});
					}
				} else {
					var res = this.detectElementType();
					if(res) {
						this.addElement(res);
					}
				}
				this.scribble.remove();
			}
		}
		isAssigningValue = false;
		this.scribble = new p.CompoundPath();
		this.scribble.strokeColor = '#CCC';
		this.scribble.strokeWidth = 2;
		p.view.draw();
	}

	this.addElement = function(analysis) {
		var self = this;
		var o = new OnePort(
			analysis.type,
			Utils.snapPointNearest(analysis.start,this.gridSize),
			Utils.snapPointNearest(analysis.end,this.gridSize),
			0
		);
		if(analysis.length < Math.sqrt(Math.pow(2 * this.gridSize,2))) {
			return;
		}
		o.render();
		this.elements.add(o);
		if(!this.isValidPlacement()) {
			this.elements.remove(o);
			o.destruct();
		} else {
			this.resolveIntersections(new Set([o]));
		}
	}

	this.scribbledOutElements = function(scribble,threshold) {
		threshold = threshold || 2;
		var res = new Set();
		for(var i=0;i<this.elements.size();i++) {
			var el = this.elements.at(i);
			var ins = scribble.getIntersections(el.path);
			if(ins.length >= threshold) {
				res.add(el);
			}
		}
		return res;
	}

	this.isValidPlacement = function() {
		this.removeZeroLengthElements();
		for(var i=0;i<this.elements.size();i++) {
			var a = this.elements.at(i);
			if(a.start.equals(a.end)) {
				return false;
			}
			for(var j=i;j<this.elements.size();j++) {
				if(i == j) {
					continue;
				}
				var b = this.elements.at(j);
				if(
				   a.pointOnLine(b.end) || 
				   b.pointOnLine(a.end) ||
				   a.pointOnLine(b.start) || 
				   b.pointOnLine(a.start) ||
				   (a.start.equals(b.start) && a.end.equals(b.end)) ||
				   (a.start.equals(b.end) && a.end.equals(b.start))
				) {
					console.log('nope');
					return false;
				}
			}
		}
		return true;
	}

	this.elementsTouching = function(el) {
		return this.elements.query(function(e) {
			return e.path.getIntersections(el.path).length
		});
	}

	this.resolveIntersections = function(test) {
		var rest = new Set();
		var self = this;
		while(test.size() != 0) {
			var t = test.next();
			this.elements.query(function(el) {
				if(el == t) {
					return;
				}
				var ins = el.intersection(t);
				if(ins) {
					var m = t.splitAt(ins);
					var n = el.splitAt(ins);
					m[0].end = m[1].start = Utils.snapPointNearest(m[0].end,self.gridSize);
					n[0].end = n[1].start = Utils.snapPointNearest(n[0].end,self.gridSize);
					m[0].render();
					m[1].render();
					n[0].render();
					n[1].render();
					t.destruct()
					el.destruct();
					rest.add(m[0]);
					rest.add(m[1]);
					rest.add(n[0]);
					rest.add(n[1]);
					test.add(m[0]);
					test.add(m[1]);
					test.add(n[0]);
					test.add(n[1]);
					test.remove(t);
					test.remove(el);
					self.elements.remove(t);
					self.elements.remove(el);
				}
			});	
		}
		this.elements.addAll(rest);
	}

	this.detectElementType = function() {
		var CURVE_DISTANCE_THRESHOLD = 10;
		var CURVE_SIMPLIFY_THRESHOLD = 20;
		var APPROX_ANGLES = [-180,-135,-90,-45,0,45,90,135,180];
		var segments = [];
		var angles = [];
		var augmentData = {};
		var firstPoint;
		var lastPoint;
		var elementAngle;
		var intersections = 0;
		var possible = new Set([
			'resistor',
			'inductor',
			'capacitor',
			'voltage_source',
			'wire',
			'current_source',
		//	'removal'
		]);
		if(this.scribble.children.length > 1) {
			possible.remove('wire');
			possible.remove('resistor');
			possible.remove('inductor');
		}
		for(var j=0;j<this.scribble.children.length;j++) {
			var path = this.scribble.children[j];
			if(path.length > 5) {
				path.simplify(CURVE_SIMPLIFY_THRESHOLD);
			}
			var sub_segments = [];
			intersections += path.getIntersections(path).length;
			for(var i=0;i<path.curves.length;i++) {
				var curve = path.curves[i],
					start = curve.point1,
					end = curve.point2,
					length = start.getDistance(end);
					if(!firstPoint) {
						firstPoint = start;
					}
					lastPoint = end;
				if(length > CURVE_DISTANCE_THRESHOLD) {
					sub_segments.push({
						start: start,
						end: end,
						length: length,
						angle: Utils.snap(end.subtract(start).angle,APPROX_ANGLES)
					});
				}
			}
			segments = segments.concat(sub_segments);
		}
		if(!segments.length) {
			return;
		}
		segments = segments.reduce(function(accumulated,next) {
			if(!(accumulated instanceof Array)) {
				accumulated = [accumulated];
			}
			var last = accumulated[accumulated.length - 1];
			if(last.end.isClose(next.start,CURVE_DISTANCE_THRESHOLD) && last.angle == next.angle) {
				last.length += next.length;
				last.end = next.end;
			} else {
				accumulated.push(next);
			}
			return accumulated;
		});
		elementAngle = Utils.snap(lastPoint.subtract(firstPoint).angle,APPROX_ANGLES);
		if(!(segments instanceof Array)) {
			segments = [segments];
		}
		segments.forEach(function(s) {
			s.angle = Utils.snap(Utils.normalize(s.angle - elementAngle),APPROX_ANGLES);
		});
		angles = segments.map(function(s) {
			return s.angle;
		});
		// Let's see what's left
		if(intersections < 2) {
			possible.remove('inductor');
		}
		var double90Index = Utils.indexOfSlice(angles.map(Math.abs),[90,90]);
		if(double90Index != -1) {
			var first = segments[double90Index];
			var second = segments[double90Index + 1];
			var max = Math.max(first.length,second.length);
			var min = Math.min(first.length,second.length);
			if(first.length > second.length) {
				var swap = firstPoint;
				firstPoint = lastPoint;
				lastPoint = swap;
			}
			if(max / min > 1.5) {
				possible.remove('capacitor');
			} else {
				possible.remove('voltage_source');
			}
		} else {
			possible.remove('voltage_source');
			possible.remove('capacitor');
		}
		if(angles.indexOf(0) == -1) {
			possible.remove('current_source')
			possible.remove('wire');
		}
		if(angles.indexOf(45) == -1 || angles.indexOf(-45) == -1 || angles.indexOf(0) != -1) {
			possible.remove('removal');
		}
		if(segments.length < 3) {
			possible.remove('current_source');
		}
		if(angles.length < 5 || intersections > 1) {
			possible.remove('resistor');
		}
		console.log(angles);
		return {
			type: possible.get()[0],
			segments: segments,
			start: firstPoint,
			end: lastPoint
		}
	}

	this.localToGlobal = function(p) {
		var o = $(canvas).offset();
		return new paper.Point(p.x + o.left,p.y + o.top);
	}

	this.globalToLocal = function(p) {
		var o = $(canvas).offset();
		return new paper.Point(p.x - o.left,p.y - o.top);
	}
});

var OnePort = Class.extend(function() {
	this.constructor = function(type,start,end,value) {
		this.type = type;
		this.start = start;
		this.end = end;
		this.value = value;
	}

	this.destruct = function() {
		if(this.path) this.path.remove();
		if(this.text) this.text.remove();
		this.text = null;
	}

	this.renderPath = function() {
		var length = this.start.getDistance(this.end);
		var path = new paper.CompoundPath();
		path.strokeColor = 'black';
		path.strokeWidth = 2;
		path.moveTo(this.start);
		path.lineBy(new paper.Point(length/4,0));
		this.renderCenter(path,length/2);
		path.lineBy(new paper.Point(length/4,0));
		path.rotate(this.end.subtract(this.start).angle,this.start);
		this.path = path;
		return path;
	}

	this.renderText = function() {
		if(!this.text) {
			this.text = $('<span></span>');
			$('body').append(this.type == 'wire' ? '' : this.text);
		}
		this.text.css('top',this.path.position.y).css('left',this.path.position.x);
		this.text.html(this.value.toString());
	}

	this.render = function() {
		if(this.path) this.path.remove();
		this.who_pooped_the_bed = new paper.Group();
		this.who_pooped_the_bed.addChild(this.renderPath());
		this.renderText();
		return this.who_pooped_the_bed;
	}

	this.center = function(n) {
		return this.start.add(this.end.subtract(this.start).divide(n || 2));
	}

	this.length = function() {
		return this.start.getDistance(this.end);
	}

	this.slope = function() {
		return this.end.subtract(this.start).angle;
	}

	this.pointOnLine = function(p) {
		return Math.abs(p.subtract(this.start).angle) == Math.abs(this.slope()) && Math.max(p.getDistance(this.start),p.getDistance(this.end)) < this.length();
	}

	this.intersection = function(op) {
		var ins = this.path.getIntersections(op.path);
		if(ins.length && !ins[0].point.equals(this.start) && !ins[0].point.equals(this.end)) return ins[0].point;
		return null;
	}

	this.setStart = function(s) {
		this.start = s;
		if(this.path) {
			this.destruct();
			this.render();
		} else {
			this.render();
		}
	}

	this.setEnd = function(e) {
		this.end = e;
		if(this.path) {
			this.destruct();
			this.render();
		} else {
			this.render();
		}
	}

	this.splitAt = function(p) {
		if(p == this.start || p == this.end) {
			return this;
		}
		if(p.getDistance(this.start) < p.getDistance(this.end)) {
			return [
				new OnePort('wire',this.start,p,this.value),
				new OnePort(this.type,p,this.end,this.value)
			];
		} else {
			return [
				new OnePort(this.type,this.start,p,this.value),
				new OnePort('wire',p,this.end,this.value)
			];
		}
	}

	this.renderCenter = function(path,length) {
		if(this.type == 'wire' || this.type == 'current_source') {
			path.lineBy(new paper.Point(length,0));
		}
		if(this.type == 'resistor') {
			var resistorLength = Math.min(length,90);
			var resistorHeight = (resistorLength / 60) * 10;
			var lineLength = (length - resistorLength) / 2;
			path.lineBy(new paper.Point(lineLength,0));
			for(var i=0;i<3;i++) {
				path.lineBy(new paper.Point(resistorLength/6,resistorHeight));
				path.lineBy(new paper.Point(0,0 - 2 * resistorHeight));
				path.lineBy(new paper.Point(resistorLength/6,resistorHeight));
			}
			path.lineBy(new paper.Point(lineLength,0));
		}
		if(this.type == 'current_source') {
			path.lineBy(new paper.Point(length,0));
		}
		if(this.type == 'inductor') {
			var inductorLength = Math.min(length,100);
			var inductorHeight = (inductorLength / 60) * 25;
			var lineLength = (length - inductorLength) / 2;
			path.lineBy(new paper.Point(lineLength,0));
			for(var i=0;i<3;i++) {
				path.lineBy(new paper.Point(inductorLength / 6,0));
				path.arcBy(new paper.Point(0,0 - inductorHeight),false);
				path.arcBy(new paper.Point(0,inductorHeight),false);
				path.lineBy(new paper.Point(inductorLength / 6,0));
			}
			path.lineBy(new paper.Point(lineLength,0));
		}
		if(this.type == 'capacitor') {
			var capacitorDistance = Math.min(length/4,20);
			var capacitorHeight = (capacitorDistance / 20) * 60;
			var lineLength = (length - capacitorDistance) / 2;
			path.lineBy(new paper.Point(lineLength,0));
			path.moveBy(new paper.Point(0,0 - capacitorHeight/2));
			path.lineBy(new paper.Point(0,capacitorHeight));
			path.moveBy(new paper.Point(0,0 - capacitorHeight/2));
			path.moveBy(new paper.Point(capacitorDistance,0));
			path.moveBy(new paper.Point(0,0 - capacitorHeight/2));
			path.lineBy(new paper.Point(0,capacitorHeight));
			path.moveBy(new paper.Point(0,0 - capacitorHeight/2));
			path.lineBy(new paper.Point(lineLength,0));
		}
		if(this.type == 'voltage_source') {
			var vsDistance = Math.min(length/4,20);
			var vsHeight = (vsDistance / 20) * 60;
			var lineLength = (length - vsDistance) / 2;
			path.lineBy(new paper.Point(lineLength,0));
			path.moveBy(new paper.Point(0,0 - vsHeight/4));
			path.lineBy(new paper.Point(0,vsHeight/2));
			path.moveBy(new paper.Point(0,0 - vsHeight/4));
			path.moveBy(new paper.Point(vsDistance,0));
			path.moveBy(new paper.Point(0,0 - vsHeight/2));
			path.lineBy(new paper.Point(0,vsHeight));
			path.moveBy(new paper.Point(0,0 - vsHeight/2));
			path.lineBy(new paper.Point(lineLength,0));
		}
	}
})