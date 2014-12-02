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
    maxConnections:1
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


    jsPlumb.addEndpoint('applicationId', {
        anchor:"BottomCenter"
    }, exampleGreyEndpointOptions);


    $('.block-cartridge').on('dblclick', function(){
    //    addCartridge($(this).attr('id'));
    })

    $('.block-group').on('dblclick', function(){
       // addGroup($(this).attr('id'));
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
        paintStyle:{strokeStyle:"blue", lineWidth:1 },
        Connector : [ "Bezier", { curviness:63 } ],
        anchors:["BottomCenter", "TopCenter"],
        endpoint:"Dot"
    });
    DragEl($(Div));
    DragEl($(Div2));
    Repaint();
}

$(document).ready(function(){

    $('#whiteboard').on('dblclick', '.stepnode', function(){
        console.log('hit me')
        activateTab('components')
    });

    //use to activate tab
    function activateTab(tab){
        $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    };

    //get create cartridge list
    var cartridgeUrl = "json/cartridges.json";

    $.getJSON(cartridgeUrl, function(data) {
        generateCartridges(data.cartridge);
    })

    //create cartridge list
    var cartridgeListHtml='';
    function generateCartridges(data){
        for(var cartridge in data){
            var cartridgeData = data[cartridge];
            cartridgeListHtml += '<div class="block-cartridge" ' +
                'data-info="'+cartridgeData.description+ '"'+
                'data-toggle="tooltip" data-placement="bottom" title="Single Click to view details. Double click to add"'+
                'id="'+cartridgeData.displayName+'">'
                + cartridgeData.displayName+
                '</div>'
        }
        //append cartridge into html content
       $('#cartridge-list').append(cartridgeListHtml);
    }

    //handle single click for cartridge
    $('#cartridge-list').on('click', ".block-cartridge", function(){
        $('.description-section').html($(this).attr('data-info'));
    });
    //handle double click for cartridge
    $('#cartridge-list').on('dblclick', ".block-cartridge", function(){
        addCartridge($(this).attr('id'));
    });

    //get group JSON
    var groupUrl = "json/groups.json";

    $.getJSON(groupUrl, function(data) {
        generateGroups(data.serviceGroup);
    });

    //create group list
    var groupListHtml='';
    function generateGroups(data){
        for(var group in data){
            var groupData = data[group];
            groupListHtml += '<div class="block-group" ' +
                ' data-info="'+encodeURIComponent(JSON.stringify(groupData))+'"'+
                'id="'+groupData.name+'">'
                + groupData.name+
                '</div>'
        }
        //append cartridge into html content
        $('#group-list').append(groupListHtml);
    }

    //handle single click for cartridge
    $('#group-list').on('click', ".block-group", function(){
        console.log(decodeURIComponent($(this).attr('data-info')))
    });

    $('#group-list').on('dblclick', ".block-group", function(){
        addGroup($(this).attr('id'));
    });


});


console.dir(jsPlumb.getConnections())