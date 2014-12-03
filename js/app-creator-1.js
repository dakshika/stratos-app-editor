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

//use to activate tab
function activateTab(tab){
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
};

// Document ready events
$(document).ready(function(){

    $('#whiteboard').on('dblclick', '.stepnode', function(){
        //get tab activated
        activateTab('components')
    });

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

    //handle single click for groups
    $('#group-list').on('click', ".block-group", function(){
        var groupJSON = JSON.parse(decodeURIComponent($(this).attr('data-info')));
        data = generateGroupTree(groupJSON);
        generateGroupPreview(data);

    });
    //handle double click event for groups
    $('#group-list').on('dblclick', ".block-group", function(){
        addGroup($(this).attr('id'));
    });


    //generate treefor Groups
    function generateGroupTree(groupJSON){

        var rawout = [];

        var rootnode ={};
        rootnode.name = groupJSON.name;
        rootnode.parent = null;
        rawout.push(rootnode);

        for (var prop in groupJSON) {
            if(prop == 'cartridges'){
                getCartridges(groupJSON[prop],rawout, groupJSON.name)
            }
            if(prop == 'groups'){
                getGroups(groupJSON[prop], rawout, groupJSON.name)
            }
        }

        function getCartridges(item, collector, parent){
            for (var i = 0; i < item.length; i++) {
                var type = 'cartridges';
                var cur_name = item[i];
                collector.push({"name": cur_name, "parent": parent, "type": type});
            }
        }

        function getGroups(item, collector, parent){
            for (var prop in item) {
                var cur_name = item[prop]['name'];
                var type = 'groups';
                collector.push({"name": cur_name, "parent": parent, "type": type});
                getCartridges(item[prop].cartridges, collector , cur_name);
                getGroups(item[prop].groups, collector, cur_name)
            }
        }

        return rawout;

    }

});


// ************** Generate the tree diagram	 *****************
function generateGroupPreview(data) {
    $(".description-section").html('');
    //clean current graph
    d3.select("svg").remove();
    //mapping data
    var dataMap = data.reduce(function(map, node) {
        map[node.name] = node;
        return map;
    }, {});
    var treeData = [];
    data.forEach(function(node) {
        // add to parent
        var parent = dataMap[node.parent];
        if (parent) {
            // create child array if it doesn't exist
            (parent.children || (parent.children = []))
                // add node to child array
                .push(node);
        } else {
            // parent is null or missing
            treeData.push(node);
        }
    });

    var source = treeData[0];

//generate position for tree view
    var margin = {top: 25, right: 5, bottom: 5, left: 5},
        width = 320 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom;

    var i = 0;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.x, d.y]; });

    var svg = d3.select(".description-section").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + -100+ "," + margin.top + ")");

    // Compute the new tree layout.
    var nodes = tree.nodes(source).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 100; });

    // Declare the nodesâ€¦
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter the nodes.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; });

    nodeEnter.append("circle")
        .attr("r", 4)
        .style("fill", "#fff");

    nodeEnter.append("text")
        .attr("y", function(d) {
            return d.children || d._children ? -20 : 20; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1);

    // Declare the links
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter the links.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", diagonal);

}


