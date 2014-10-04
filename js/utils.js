var Set = Class.extend(function() {
	this.constructor = function(src) {
		this.src = src || [];
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

	this.get = function() {
		return this.src.concat();
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
	}
}