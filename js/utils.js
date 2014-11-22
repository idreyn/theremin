var Set = Class.extend(function() {
	this.constructor = function(src) {
		src = src || [];
		this.src = [];
		for(var i=0;i<src.length;i++) {
			this.add(src[i]);
		}
	}

	this.next = function() {
		return this.src.shift();
	}

	this.at = function(i) {
		return this.src[i];
	}

	this.size = function() {
		return this.src.length;
	}

	this.contains = function(el) {
		return this.src.indexOf(el) != -1;
	}

	this.add = function(el) {
		if(!this.contains(el)) {
			this.src.push(el);
		}
	}

	this.remove = function(el) {
		if(this.contains(el)) {
			this.src = this.src.slice(0,this.src.indexOf(el)).concat(this.src.slice(this.src.indexOf(el) + 1));
		}
	}

	this.query = function(lambda) {
		return new Set(this.src.filter(lambda));
	}

	this.map = function(lambda) {
		return this.src.map(lambda);
	}

	this.get = function() {
		return this.src.concat();
	}

	this.addAll = function(s) {
		var self = this;
		s.map(function(el) {
			self.add(el);
		});
	}
})

var Utils = {
	snap: function(n,values) {
		var minDistance = Infinity;
		var snapped;
		values.forEach(function(v) {
			var d = Math.abs(n - v);
			if(d < minDistance) {
				minDistance = d;
				snapped = v;
			}
		});
		return snapped;
	},
	snapNearest: function(n,v) {
		var c = Math.ceil(n / v) * v;
		var f = Math.floor(n / v) * v;
		if(Math.abs(n - c) < Math.abs(n - f)) {
			return c;
		} else {
			return f;
		}
	},
	snapPointNearest: function(p,v) {
		return new paper.Point(
			Utils.snapNearest(p.x,v),
			Utils.snapNearest(p.y,v)
		);
	},
	indexOfSlice: function(arr,slice) {
		for(var i=0;i<arr.length;i++) {
			var sub = arr.slice(i,i + slice.length);
			if(Utils.sameArray(sub,slice)) {
				return i;
			}
		}
		return -1;
	},
	sameArray: function(a,b) {
		if(a.length != b.length) {
			return false;
		}
		for(var i=0;i<a.length;i++) {
			if(a[i] != b[i]) {
				return false;
			}
		}
		return true;
	},
	normalize: function(angle) {
		if(angle > 360) {
			while(angle > 180) {
				angle -= 360;
			}
		} else {
			while(angle < -180) {
				angle += 360;
			}
		}
		return angle;
	},
	compoundPathToDollarPCloudString: function(p) {
		var res = [];
		for(var i=0;i<p.children.length;i++) {
			var path = p.children[i];
			for(var j=0;j<path.segments.length;j++) {
				var s = path.segments[j];
				res.push('new Point(' + Math.round(s.point.x) + ',' + Math.round(s.point.y) + ',' + (i + 1).toString() + ')');
			}
		}
		return '[' + res.join(',') + ']';
	},
	compoundPathToDollarPCloud: function(p) {
		var res = [];
		for(var i=0;i<p.children.length;i++) {
			var path = p.children[i];
			for(var j=0;j<path.segments.length;j++) {
				var s = path.segments[j];
				res.push(new Point(Math.round(s.point.x), Math.round(s.point.y), i+1));
			}
		}
		return res;
	}
}