
/*global jQuery $*/


var FeatureTour = function() {
    this.features = {};
    this.nextTooltip = $('<div id="next-tooltip-container" class="arrow-box top"> Click here to continue. </div>');
    this.nextTooltip.click(function() {$(this).hide();}).hide().appendTo('body');
    this.tooltipDelay = 5000;
    $('<div id="instruction-overlay-container" class="modal hide fade" tabindex="-1" role="dialog" aria-hidden="true"></div>').appendTo('body');
};

FeatureTour.prototype.dispose = function(callback) {
    this.features[this.sequence[this.currentFeature]].hide();
    $('.popover').remove();
    $('.modal-backdrop').remove();
    $('#instruction-overlay-container').remove();
    this.nextTooltip.remove();
    if (typeof callback === 'function') callback();
};

FeatureTour.prototype.setSequence = function(sequence) {
    if (!sequence instanceof Array || sequence.length <= 0)
        throw { 
            name     :   "Argument Error", 
            message  :   "Feature must receive array argument for nonempty sequence of features to show."
        };
    
    for (var i = 0; i < sequence.length; i++) {
	if (!this.features[sequence[i]] instanceof Feature)
	    throw { 
		name     :   "Argument Error", 
		message  :   "Feature '"+sequence[i]+"' was not found in list of features."
	    };
    }
    
    this.sequence = sequence;
};

FeatureTour.prototype.nextButtonTooltip = function() {
    if (this.currentFeature < 0 || this.currentFeature >= (this.sequence.length - 1)) return;
    
    var BUFFER = 8,
	feature = this.features[this.sequence[this.currentFeature]],
	holder = feature.popover ? $('.popover') : $('#instruction-overlay-container'),
	next_elem = holder.find('.next-tour-stop'),
	button_height = parseInt(next_elem.css('height'), 10),
	button_width = parseInt(next_elem.css('width'), 10),
	button_pos = next_elem.offset(),
	tooltip_width = this.nextTooltip.width(),
	offset_top = button_pos.top + button_height + BUFFER,
	offset_left = button_pos.left + button_width / 2 - tooltip_width / 2;
    
    this.nextTooltip.show().css('left', offset_left).css('top', offset_top);
};

FeatureTour.prototype.beginTour = function(onUpdate, currentPage) {
    if (!this.sequence instanceof Array || this.sequence.length === 0) {
	throw { 
	    name     :   "Error", 
	    message  :   "You must set feature sequence with setSequence() before beginning tour."
	};
    }
    
    this.currentFeature = typeof currentPage !== 'undefined' ? this.sequence.indexOf(currentPage) : -1;
    // this.history = [];
    this.onUpdate = typeof onUpdate === 'function' ? onUpdate : function(arg) { console.log(arg); };
    this.progressTimer = undefined;
    this.nextStop();
};

FeatureTour.prototype.nextStop = function() {
    var self = this,
	toc = new Date();
    
    self.nextTooltip.hide();
    window.clearTimeout(self.progressTimer);
    self.progressTimer = window.setTimeout(function() { self.nextButtonTooltip.call(self); }, self.tooltipDelay);
    
    if (self.currentFeature > -1) {
	// self.history.push({page: self.sequence[self.currentFeature], duration: toc - self.tic, direction: 'next'});
	self.onUpdate({page: self.sequence[self.currentFeature], duration: toc - self.tic, direction: 'next'});
    }
    
    self.tic = new Date();

    if (self.sequence.length > self.currentFeature + 1)  {
	
	if (self.currentFeature > -1) {
	    self.features[self.sequence[self.currentFeature]].hide();
	}
	
	self.currentFeature++;
	
	if (self.currentFeature === 0 && self.sequence.length === 1) {
	    self.features[self.sequence[self.currentFeature]].show('only');
	} else if (self.currentFeature === 0) {
	    self.features[self.sequence[self.currentFeature]].show('first');
	} else if (self.currentFeature === self.sequence.length - 1) {
	    self.features[self.sequence[self.currentFeature]].show('last');
	} else {
	    self.features[self.sequence[self.currentFeature]].show();
	}
	
	$('.next-tour-stop').click(function(e) { e.preventDefault(); if (self.features[self.sequence[self.currentFeature]].beforeAdvancing()) { self.nextStop(); } });
	$('.prev-tour-stop').click(function(e) { e.preventDefault(); self.prevStop(); });
    }
};

FeatureTour.prototype.prevStop = function() {
    var self = this,
	toc = new Date();
    
    self.nextTooltip.hide();
    window.clearTimeout(self.progressTimer);
    self.progressTimer = window.setTimeout(function() { self.nextButtonTooltip.call(self); }, self.tooltipDelay);
    
    if (self.currentFeature > -1) {
	// self.history.push({page: self.sequence[self.currentFeature], duration: toc - self.tic, direction: 'prev'});
	self.onUpdate({page: self.sequence[self.currentFeature], duration: toc - self.tic, direction: 'prev'});
    }
    
    self.tic = new Date();
    
    if (self.currentFeature > 0) {
	self.features[self.sequence[self.currentFeature--]].hide();
	
	if (self.currentFeature == 0) {
	    self.features[self.sequence[self.currentFeature]].show('first');
	} else {
	    self.features[self.sequence[self.currentFeature]].show();
	}
	
	$('.next-tour-stop').click(function(e) { e.preventDefault(); if (self.features[self.sequence[self.currentFeature]].beforeAdvancing()) { self.nextStop() } });
	$('.prev-tour-stop').click(function(e) { e.preventDefault(); self.prevStop(); });
    }
};

FeatureTour.prototype.addFeature = function(params) {
    if (typeof params !== 'object' ||
	(params.type !== 'overlay' && typeof params.xyfn !== 'function' && typeof params.element !== 'string') ||
	typeof params.name !== 'string') {
	throw { 
	    name     :   "Argument Error", 
	    message  :   "Feature must receive element argument, and element must be valid id for DOM element."
	};
    }
    this.features[params.name] = new Feature(this, params);
};

FeatureTour.prototype.generateInstructionPosition = function() {
    return (this.currentFeature + 1) + ' of ' + this.sequence.length;
};

var Feature = function(featureTour, params) {
    this.featureTour = featureTour;
    this.popover = params.type !== 'overlay';
    this.name = params.name;
    this.title = typeof params.title === 'string' ? params.title : 'Instruction';
    this.elementId = params.element;
    this.text = typeof params.text === 'string' ? params.text : '';
    this.preventBack = params.preventBack;
    this.placement = typeof params.placement === 'string' ? params.placement : 'right';
    this.onload = typeof params.onload === 'function' ? params.onload : function(callback) { callback(); };
    this.ondestroy = typeof params.ondestroy === 'function' ? params.ondestroy : function() {  };
    this.beforeAdvancing = typeof params.beforeAdvancing === 'function' ? params.beforeAdvancing : function() { return true };
    this.nextText = typeof params.nextText === 'string' ? params.nextText : 'Next';
    this.prevText = typeof params.prevText === 'string' ? params.prevText : 'Back';
    this.xyfn = params.xyfn;
};

Feature.prototype.show = function(pos) {
    var self = this;
    
    this.onload(function() {
        self.element = document.getElementById(self.elementId);
        if (self.popover && typeof self.xyfn !== 'function' && self.element === null) {
            throw { 
    		name     :   "Argument Error", 
    		message  :   "Feature either be an overlay or contain a valid id for DOM element."
    	    };
    	}
    	if (self.popover) self.renderPopover(pos);
    	else self.renderOverlay(pos);
    });
};

Feature.prototype.renderOverlay = function(pos) {
    var first = pos === 'first' || pos === 'only',
	last = pos === 'last' || pos === 'only',
	button_content = '';
    this.modal = $('#instruction-overlay-container');
    
    if (!this.preventBack && !first) button_content += '<button class="btn prev-tour-stop" style="margin-right: 10px;">'+this.prevText+'</button>';
    if (!last) button_content += '<button class="btn btn-success next-tour-stop">'+this.nextText+'</button>';
    
    this.modal.html(
	'<div class="modal-header">'+
	    '<h3>'+this.title + ' - ' + this.featureTour.generateInstructionPosition()+'</h3>'+
	    '</div>'+
	    '<div class="modal-body">'+
	    '<p>' + this.text + '</p>' +
	    '</div>'+
	    '<div class="modal-footer">'+
	    button_content+
	    '</div>'+
	    '</div>'
    );
    
    this.modal.modal({keyboard:false}).modal('show');
    
    $('.modal-backdrop').unbind('click').click(function(e) {
	return;
    });
};

Feature.prototype.renderPopover = function(pos) {
    
    console.log('popover render');
    if (typeof this.xyfn === 'function') {
        $('body').popover({
            title: this.title + ' - ' + this.featureTour.generateInstructionPosition(),
    	    html: true,
    	    placement: this.placement,
    	    trigger: 'manual',
    	    content: this.renderContent(pos),
    	    container: 'body'
    	}).popover('show');
        
        var self = this,
            BUFFER = 10;
        
        this.xyfn(function(x, y) {
            switch (self.placement) {
            case 'left':
                y -= $('.popover').first().height()/2;
                x -= BUFFER;
                break;
            case 'right':
                y -= $('.popover').first().height()/2;
                x += BUFFER;
                break;
            case 'top':
                x -= $('.popover').first().width()/2;
                y -= BUFFER;
                break;
            case 'bottom':
                x -= $('.popover').first().width()/2;
                y += BUFFER;
                break;
            }
            $('.popover').css({'position': 'absolute', top: y, left: x});
        });
    } else {
        $(this.element).popover({
    	    title: this.title + ' - ' + this.featureTour.generateInstructionPosition(),
    	    html: true,
    	    placement: this.placement,
    	    trigger: 'manual',
    	    content: this.renderContent(pos),
    	    container: 'body'
    	}).popover('show');
    }
};

Feature.prototype.hide = function() {
    this.ondestroy();
    if (this.popover) this.hidePopover();
    else this.hideOverlay();
};

Feature.prototype.hidePopover = function() {
    $(this.element).removeData('popover');//.data('popover').$tip.remove();
    $('.popover').remove();
};

Feature.prototype.hideOverlay = function() {
    $('.modal-backdrop').remove();
    $('#instruction-overlay-container')
	.css('border', 'none')
	.html('')
	.removeData('modal');
};

Feature.prototype.renderContent = function(pos) {
    var first = pos === 'first' || pos === 'only',
	last = pos === 'last' || pos === 'only',
	content = '<p>' + this.text + '</p><br>';
    if (!this.preventBack && !first) content += '<button class="btn prev-tour-stop" style="margin-right: 10px;">'+this.prevText+'</button>';
    if (!last) content += '<button class="btn btn-success next-tour-stop">'+this.nextText+'</button>';
    
    return content;
};
