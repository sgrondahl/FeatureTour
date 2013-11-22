
/*global jQuery $ FeatureTour my_chat_list*/

var feature_tour = new FeatureTour();

feature_tour.addFeature({
    name:   'basic_usage',
    type:   'overlay',
    text:   '<p> Welcome to your app! This is how you use it. </p>'
});

feature_tour.addFeature({
    name:   'chat_list',
    type:   'pointy',
    xyfn:   getChatListXY,
    text:   '<p> This is how you can chat with other users. </p>.'
});

feature_tour.addFeature({
    name:   'demo',
    type:   'pointy',
    placement: 'left',
    element: 'myDemoElem',
    text:   '<p> This is how to use the demo element. </p>',
    onload: showDemo,
    ondestroy: hideDemo
});

feature_tour.setSequence(['basic_usage', 'chat_list', 'demo']);

feature_tour.beginTour(function(arg) {
    console.log('This is a callback from the feature tour: ' + arg);
});


function getChatListXY(callback) {
    var myvec = my_chat_list.currentPosition(),
        xbuffer = 35;
    var xoffset = myvec.x,
        yoffset = myvec.y;
    
    var holder_pos = $('#my_chat_list_holder').offset();
    var netxoff = holder_pos.left,
        netyoff = holder_pos.top;
        
    var x = xoffset + netxoff + xbuffer,
        y = yoffset + netyoff;
        
    callback(x,y);
}

function showDemo(callback) {
    my_chat_list.showDemoStuff();
    callback();
}

function hideDemo() {
    my_chat_list.hideDemoStuff();
}
