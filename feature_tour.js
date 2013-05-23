
var FeatureTour = function() {
	this.features = [];
	this.title = 'Title';
}

FeatureTour.prototype.beginTour = function() {
	this.currentFeature = -1;
	this.nextStop();
}

FeatureTour.prototype.nextStop = function() {
	var self = this;
	if (self.features.length > self.currentFeature)  {
	
		if (self.currentFeature > -1) {
			self.features[self.currentFeature].hide();
		}
		
		self.currentFeature++;
		
		if (self.currentFeature === 0) {
			self.features[self.currentFeature].show('first');
		} else if (self.currentFeature === self.features.length - 1) {
			self.features[self.currentFeature].show('last');
		} else {
			self.features[self.currentFeature].show();
		}
		
		$('.next-tour-stop').click(function(e) { e.preventDefault(); self.nextStop(); });
		$('.prev-tour-stop').click(function(e) { e.preventDefault(); self.prevStop(); });
	}
}

FeatureTour.prototype.prevStop = function() {
	var self = this;
	if (self.currentFeature > 0) {
		self.features[self.currentFeature--].hide();
		
		if (self.currentFeature == 0) {
			self.features[self.currentFeature].show('first');
		} else {
			self.features[self.currentFeature].show();
		}
		
		$('.next-tour-stop').click(function(e) { e.preventDefault(); self.nextStop(); });
		$('.prev-tour-stop').click(function(e) { e.preventDefault(); self.prevStop(); });
	}
}

FeatureTour.prototype.addFeature = function(params) {
	this.features.push(new Feature(this, params));
}

FeatureTour.prototype.getTitle = function() {
	return this.title;
}

FeatureTour.prototype.setTitle = function(title) {
	if (!typeof title === 'string') return;
	this.title = title;
	$('.popover-title').html(title);
}

var Feature = function(featureTour, params) {
	if (typeof params !== 'object' ||
		typeof params.element !== 'string' ||
		document.getElementById(params.element) === null) {
		throw { 
			name     :   "Argument Error", 
			message  :   "Feature must receive element argument, and element must be valid id for DOM element."
		};
	}
	
	this.featureTour = featureTour;
	this.element = document.getElementById(params.element);
	this.text = typeof params.text === 'string' ? params.text : '';
	this.preventBack = params.preventBack;
	this.placement = typeof params.placement === 'string' ? params.placement : 'right';
	this.onload = typeof params.onload === 'function' ? params.onload : function() {};
}

Feature.prototype.show = function(pos) {
	var test = $(this.element).popover({
		html: true,
		placement: this.placement,
		trigger: 'manual',
		content: this.renderContent(pos),
		container: 'body'
	}).popover('show');
	
	$('.popover-title').html(this.featureTour.getTitle());
	
	this.onload();
}

Feature.prototype.hide = function() {
	$(this.element).data('popover').$tip.remove();
}

Feature.prototype.renderContent = function(pos) {
	var first = pos === 'first',
		last = pos === 'last',
		content = '<p>' + this.text + '</p><br>';
	if (!this.preventBack && !first) content += '<button class="btn prev-tour-stop" style="margin-right: 10px;">Back</button>';
	if (!last) content += '<button class="btn btn-success next-tour-stop">Next</button>';
	
	return content;
}