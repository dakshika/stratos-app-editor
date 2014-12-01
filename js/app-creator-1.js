// init draggable and resizable on elements
$(document).ready(function(){
    DragEl(".stepnode");
    //ResizeEl(".stepnode");
    Repaint();
});

//// functions ////

// repaint
function Repaint(){
    $("#whiteboard").resize(function(){
        jsPlumb.repaintEverything();
    });
}
// resize
function ResizeEl(el){
    $(el).resizable();
}
// drag
function DragEl(el){
    jsPlumb.draggable($(el) ,{
        containment:"#whiteboard"
    });
}


// JsPlumb Config
var color = "gray",
    exampleColor = "#00f",
    arrowCommon = { foldback:0.7, fillStyle:color, width:14 };

jsPlumb.importDefaults({
    Connector : [ "Bezier", { curviness:63 } ],
    /*Overlays: [
     [ "Arrow", { location:0.7 }, arrowCommon ],
     ]*/
});


var exampleDropOptions = {
    activeClass:"dragActive"
};

var exampleGreyEndpointOptions = {
    endpoint:"Rectangle",
    paintStyle:{ width:25, height:21, fillStyle:'#666' },
    isSource:true,
    connectorStyle : { strokeStyle:"#666" },
    isTarget:false,
    maxConnections:5
};

var endpointOptions = {
    isTarget:true,
    endpoint:"Dot",
    paintStyle:{
        fillStyle:"gray"
    },
    dropOptions: exampleDropOptions,
    maxConnections:5
};

var groupOptions = {
    isTarget:false,
    endpoint:"Dot",
    paintStyle:{
        fillStyle:"gray"
    },
    dropOptions: exampleDropOptions,
    maxConnections:1
};


jsPlumb.ready(function() {


    jsPlumb.addEndpoint('container1', {
        anchor:"BottomCenter"
    }, exampleGreyEndpointOptions);


    $('.block-cartridge').on('dblclick', function(){
        addCartridge($(this).attr('id'));
    })

    $('.block-group').on('dblclick', function(){
        addGroup($(this).attr('id'));
    })


});

function addCartridge(idname) {
    var Div = $('<div>').text(idname).appendTo('#whiteboard');
    $(Div).addClass('stepnode');
    jsPlumb.addEndpoint($(Div), {
        anchor: "TopCenter"
    }, endpointOptions);
    // jsPlumb.addEndpoint($(Div), sourceEndpoint);
    DragEl($(Div));
    Repaint();
    console.log('me hitted')
}

function addGroup(idname) {
    var Div = $('<div>').text(idname).css({left:"300px", top:"200px"}).appendTo('#whiteboard');
    var Div2 = $('<div>').text(idname).appendTo('#whiteboard');

    $(Div).addClass('stepnode');
    jsPlumb.addEndpoint($(Div), {
        anchor: "TopCenter"
    }, endpointOptions);
    jsPlumb.addEndpoint($(Div), {
        anchor:"BottomCenter"
    }, exampleGreyEndpointOptions);

    $(Div2).addClass('stepnode');
    jsPlumb.addEndpoint($(Div2), {
        anchor: "TopCenter"
    }, groupOptions);
    // jsPlumb.addEndpoint($(Div), sourceEndpoint);

    jsPlumb.connect({
        source:$(Div),
        target:$(Div2),
        paintStyle:{ width:25, height:21, fillStyle:'#666' },
        Connector : [ "Bezier", { curviness:63 } ],
        anchors:["BottomCenter", "TopCenter"],
        endpoint:"Dot"
    });
    DragEl($(Div));
    DragEl($(Div2));
    Repaint();
}

$(document).ready(function(){
    $('#whiteboard').on('click', '.stepnode', function(){
        console.log('hit me')
    });
});


console.dir(jsPlumb.getConnections())