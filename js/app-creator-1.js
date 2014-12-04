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

var bottomConnectorOptions = {
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
    isTarget:true,
    endpoint:"Dot",
    paintStyle:{
        fillStyle:"gray"
    },
    dropOptions: exampleDropOptions,
    maxConnections:1
};

var generatedCartridgeEndpointOptions = {
    isTarget:false,
    endpoint:"Dot",
    paintStyle:{
        fillStyle:"gray"
    },
    dropOptions: exampleDropOptions,
    maxConnections:1
};

var generatedGroupOptions = {
    isTarget:false,
    endpoint:"Dot",
    paintStyle:{
        fillStyle:"gray"
    },
    dropOptions: exampleDropOptions,
    maxConnections:1
};

//create application level block
jsPlumb.ready(function() {
    jsPlumb.addEndpoint('applicationId', {
        anchor:"BottomCenter"
    }, bottomConnectorOptions);
});

//add cartridge to editor
function addCartridge(idname) {
    var Div = $('<div>').attr('id',idname ).text(idname).addClass('input-false').appendTo('#whiteboard');
    $(Div).addClass('stepnode');
    jsPlumb.addEndpoint($(Div), {
        anchor: "TopCenter"
    }, endpointOptions);
    // jsPlumb.addEndpoint($(Div), sourceEndpoint);
    DragEl($(Div));
    Repaint();
}

//add group to editor
function addJsplumbGroup(groupJSON){

    var divRoot = $('<div>').attr('id',groupJSON.name ).text(groupJSON.name).addClass('stepnode').appendTo('#whiteboard');
    jsPlumb.addEndpoint($(divRoot), {
        anchor:"BottomCenter"
    }, bottomConnectorOptions);

    jsPlumb.addEndpoint($(divRoot), {
        anchor: "TopCenter"
    }, groupOptions);
    DragEl($(divRoot));

    for (var prop in groupJSON) {
        if(prop == 'cartridges'){
            genJsplumbCartridge(groupJSON[prop], divRoot, groupJSON.name)
        }
        if(prop == 'groups'){
            genJsplumbGroups(groupJSON[prop], divRoot, groupJSON.name)
        }
    }

    function genJsplumbCartridge(item, currentParent, parentName){
        for (var i = 0; i < item.length; i++) {
            var id = item[i];
            var divCartridge = $('<div>').attr('id', parentName+'.'+item[i] ).text(item[i]).addClass('stepnode')
                                .appendTo('#whiteboard');
            jsPlumb.addEndpoint($(divCartridge), {
                anchor: "TopCenter"
            }, generatedCartridgeEndpointOptions);

            //add connection options
            jsPlumb.connect({
                source:$(currentParent),
                target:$(divCartridge),
                paintStyle:{strokeStyle:"blue", lineWidth:1 },
                Connector : [ "Bezier", { curviness:63 } ],
                anchors:["BottomCenter", "TopCenter"],
                endpoint:"Dot"
            });

            DragEl($(divCartridge));
        }
    }

    function genJsplumbGroups(item, currentParent, parentName) {
        for (var prop in item) {
            var divGroup = $('<div>').attr('id',parentName+'.'+item[prop]['name'] ).text(item[prop]['name'])
                            .addClass('stepnode').appendTo('#whiteboard');
            jsPlumb.addEndpoint($(divGroup), {
                anchor:"BottomCenter"
            }, bottomConnectorOptions);

            jsPlumb.addEndpoint($(divGroup), {
                anchor: "TopCenter"
            }, generatedGroupOptions);

            //add connection options
            jsPlumb.connect({
                source:$(currentParent),
                target:$(divGroup),
                paintStyle:{strokeStyle:"blue", lineWidth:1 },
                Connector : [ "Bezier", { curviness:63 } ],
                anchors:["BottomCenter", "TopCenter"],
                endpoint:"Dot"
            });

            DragEl($(divGroup));

            if(item[prop].hasOwnProperty('cartridges')) {
                genJsplumbCartridge(item[prop].cartridges, divGroup, parentName+'.'+item[prop]['name'] );
            }
            if(item[prop].hasOwnProperty('groups')) {
                genJsplumbGroups(item[prop].groups, divGroup, parentName+'.'+item[prop]['name'])
            }
        }
    }



}
//use to activate tab
function activateTab(tab){
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
};

// Document ready events
$(document).ready(function(){

    $('#whiteboard').on('dblclick', '.stepnode', function(){
        //get tab activated
        activateTab('components');
        console.log($(this))
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
        mydata = generateGroupTree(groupJSON);
        generateGroupPreview(mydata);


    });
    //handle double click event for groups
    $('#group-list').on('dblclick', ".block-group", function(){
        var groupJSON = JSON.parse(decodeURIComponent($(this).attr('data-info')));
        addJsplumbGroup(groupJSON);
    });

    //generate treefor Groups
    function generateGroupTree(groupJSON){

        var rawout = [];
        //create initial node for tree
        var rootnode ={};
        rootnode.name = groupJSON.name;
        rootnode.parent = null;
        rootnode.type = 'groups';
        rawout.push(rootnode);

        for (var prop in groupJSON) {
            if(prop == 'cartridges'){
                getCartridges(groupJSON[prop],rawout, rootnode.name)
            }
            if(prop == 'groups'){
                getGroups(groupJSON[prop], rawout, rootnode.name)
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
                if(item[prop].hasOwnProperty('cartridges')) {
                    getCartridges(item[prop].cartridges, collector, cur_name);
                }
                if(item[prop].hasOwnProperty('groups')) {
                    getGroups(item[prop].groups, collector, cur_name)
                }
            }
        }

        return rawout;

    }

});


// ************** Generate the tree diagram	 *****************
function generateGroupPreview(data) {
    //clean current graph and text
    $(".description-section").html('');

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
        .attr("transform", "translate(" + -90+ "," + margin.top + ")");

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


// ************* Add context menu for nodes ******************
//remove nodes from workarea
function deleteNode(endPoint){
    console.log(endPoint)
    //jsPlumb.deleteEndpoint(endPoint);
    var that=endPoint;      //get all of your DIV tags having endpoints
    for (var i=0;i<that.length;i++) {
        var endpoints = jsPlumb.getEndpoints($(that[i])); //get all endpoints of that DIV
        for (var m=0;m<endpoints.length;m++) {
           // if(endpoints[m].anchor.type=="TopCenter") //Endpoint on right side
                jsPlumb.deleteEndpoint(endpoints[m]);  //remove endpoint
        }
    }
    jsPlumb.detachAllConnections(endPoint);
    endPoint.remove();
}

jsPlumb.deleteEndpoint('')

$(function(){
    $.contextMenu({
        selector: '.stepnode',
        callback: function(key, options) {
            var m = "clicked: " + key + $(this);
            if(key == 'delete'){
                deleteNode($(this));
            }

            window.console && console.log($(this));
        },
        items: {
            "edit": {name: "Edit", icon: "edit"},
            "delete": {name: "Delete", icon: "delete"},
            "sep1": "---------",
            "quit": {name: "Quit", icon: "quit"}
        }
    });

});
