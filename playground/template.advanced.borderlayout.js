var map;
var baselayer_osm, baselayer_mqosm, baselayer_agsonline_topo, baselayer_agsonline_imagery;  
var osgeo_wms;

var panel;
var tree, treeJsonConfig;


Ext.onReady(function() {

	// set the proxy url for corss-domain calls
	OpenLayers.ProxyHost= function(url) {
		return "/opengeo.geoext/ApacheProxyServlet?url=" + url;
    };
	// set the proxy url for corss-domain calls
	//OpenLayers.ProxyHost= "/opengeo.geoext/ApacheProxyServlet?url=";
	    
    // set MapBox customized theme
    OpenLayers.ImgPath = "http://js.mapbox.com/theme/dark/";
	
    // ==================================================================================================
	// initialize map
	// ==================================================================================================
	map = new OpenLayers.Map(	// call OpenLayers.Map constructor to initialize map
    	{        		
    		//panMethod: null, // set 'panMethod' to null to disable animated panning
    		controls: [		      
    		    //new OpenLayers.Control.LayerSwitcher(),
    		   	//new OpenLayers.Control.Navigation(),
    			new OpenLayers.Control.PanZoom(),
    		   	new OpenLayers.Control.MousePosition()
    		],
    		numZoomLevels: 19,	// default allowed zoom levels is 16 so change it to 20  
    		projection: "EPSG:3857",             	
            units: "m",
            maxResolution: 156543.0339,        
            maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            allOverlays: false
    	}        		
    );
	
	// =====================================================================================
	// Define a customized XYZ layer for Open MapQuest Tiles
	// ===================================================================================== 
	OpenLayers.Layer.MapQuestOSM = OpenLayers.Class(OpenLayers.Layer.XYZ, {
        name: "MapQuestOSM",
        //attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
        sphericalMercator: true,
        url: ' http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png',
        clone: function(obj) {
            if (obj == null) {
                obj = new OpenLayers.Layer.OSM(
                    this.name, this.url, this.getOptions());
            }
            obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
            return obj;
        },
        CLASS_NAME: "OpenLayers.Layer.MapQuestOSM"
    });
	
	// =====================================================================================
	// base layer
	// =====================================================================================
	
	// create baselayer from MapQuest OSM
	// osm base layer
	baselayer_osm = new OpenLayers.Layer.OSM();
	// mapquest base layer
	baselayer_osmmq = new OpenLayers.Layer.MapQuestOSM();
	// arcgis online base layer
	baselayer_agsonline_topo = new OpenLayers.Layer.AgsTiled( 
		"world topo map", 
		"http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/",
    	//"World Imagery Map",
		//"http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
    	{					
			tileSize: new OpenLayers.Size(256,256),
			tileFormat:'jpg',
			tileOrigin: new OpenLayers.LonLat(-20037508.342789, 20037508.342789),
			tileFullExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
			isBaseLayer: true,
			singleTile: false,
			buffer: 0,
			transitionEffect: 'resize'
		}
	);	
	baselayer_agsonline_imagery = new OpenLayers.Layer.AgsTiled( 
		//"World Topo Map", 
		//"http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/",
    	"world imagery map",
		"http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
    	{					
			tileSize: new OpenLayers.Size(256,256),
			tileFormat:'jpg',
			tileOrigin: new OpenLayers.LonLat(-20037508.342789, 20037508.342789),
			tileFullExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
			isBaseLayer: true,
			singleTile: false,
			buffer: 0,
			transitionEffect: 'resize'
		}
	);	
	
	// =====================================================================================
	// overlays
	// =====================================================================================		
	osgeo_wms = new OpenLayers.Layer.WMS(   
    	"osgeo wms", 
    	"http://maps.opengeo.org/geowebcache/service/wms", 
        {
    		layers: "bluemarble"
    	},
        {
    		buffer: 0,
    		isBaseLayer: false,
			singleTile: false,
			displayOutsideMaxExtent: true
    	}
	);	
	osgeo_wms.setOpacity(0.64);								    
	osgeo_wms.setVisibility(false);
		
	// =====================================================================================
	// layers tree
	// =====================================================================================
	/*
	asyncTreeNode = new Ext.tree.AsyncTreeNode({
        text: 'Single Root Layer', 
        loader: new GeoExt.tree.WMSCapabilitiesLoader({
            url: 'http://penelopetown0/arcgis/services/playground/haiti/MapServer/WMSServer?',
            layerOptions: {	// OpenLayers layer options
            	buffer: 0, 
            	singleTile: true, 
            	ratio: 1
            },
            layerParams: {	// OpenLayers WMS layer specific options
            	'TRANSPARENT': 'TRUE'
            },            
            createNode: function(attr) {	// customize the createNode method to add a checkbox to nodes
                attr.checked = attr.leaf ? false : undefined;
                return GeoExt.tree.WMSCapabilitiesLoader.prototype.createNode.apply(this, [attr]);
            }
        })
    });
	*/
	
	// flexible to customize layer node UI class, using the TreeNodeUIEventMixin
    var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());
    	
	treeJsonConfig = [
        {	// baselayer container
        	nodeType: "gx_baselayercontainer",
			text: 'basemap'
        },
        {	// overlayer container
        	nodeType: "gx_overlaylayercontainer",
			text: 'overlays',
			expanded: false,
	        // render the nodes inside this container with a radio button,
	        // and assign them the group "overlayers".
	        loader: {
	            baseAttrs: {
	                radioGroup: "overlayers",
	                uiProvider: "layernodeui"
	            }
	        }
        }        
	];
	
	treeJsonConfig = new OpenLayers.Format.JSON().write(treeJsonConfig, true);
	
	// what's the difference between using xtype and not using xtype to create a tree panel	
    tree = new Ext.tree.TreePanel({        
    	//
    	border: true,			//
		region: "west",			// the position of the TreePanel in a BorderLayout container
		title: "Table of Content",		//
		width: 250,				//
		split: true,			//
		collapsible: true,		//
		collapseMode: "mini",	//
		autoScroll: true,		//
		//enableDD: true,		//
		//
		plugins: [
            new GeoExt.plugins.TreeNodeRadioButton({
                listeners: {
                    "radiochange": function(node) {
                        alert(node.text + " is now the active layer.");
                    }
                }
            })
        ],
        //
		loader: new Ext.tree.TreeLoader({
            // applyLoader has to be set to false to not interfer with loaders
            // of nodes further down the tree hierarchy
            applyLoader: false,
            uiProviders: {
                "layernodeui": LayerNodeUI
            }
        }),
    	//root: asyncTreeNode,  			// use a simple Ext.tree.AsyncTreeNode as tree root
		root: {
			 nodeType: "async",
			 children: Ext.decode(treeJsonConfig)			 
		},
    	rootVisible: false,		// whether the single tree root is visible
    	//
        listeners: {            
            /*'checkchange': function(node, checked) {	// check to add, uncheck to remove layers
                if (checked === true) {
                    panel.map.addLayer(node.attributes.layer); 
                } else {
                    panel.map.removeLayer(node.attributes.layer);
                }
            },*/
			"radiochange": function(node){
	            alert(node.layer.name + " is now the the active layer.");
	        }
        }
    });
    
    // or another way to create a tree panel
    /*tree = {
		xtype: "treepanel",		// xtype
    	//
    	border: true,			//
		region: "west",			// the position of the TreePanel in a BorderLayout container
		title: "Table of Content",		//
		width: 250,				//
		split: true,			//
		collapsible: true,		//
		collapseMode: "mini",	//
		autoScroll: true,		//
		//enableDD: true,		//
		//
    	root: root,  			//
    	rootVisible: true,		// whether the single tree root is visible
    	//
        listeners: {            
            'checkchange': function(node, checked) {	// check to add, uncheck to remove layers
                if (checked === true) {
                    panel.map.addLayer(node.attributes.layer); 
                } else {
                    panel.map.removeLayer(node.attributes.layer);
                }
            }
        }	
    };*/
    
    // =====================================================================================
	// Map panel
	// =====================================================================================
    panel = new GeoExt.MapPanel({        
    	//title: "Map",		// give a title for the MapPanel, if missing then there is no title bar                
    	border: true,		// attribute inherit from Ext.Panel
        region: "center",	//          
        map: map,                        
        center: new OpenLayers.LonLat(-8053390.64539, 2102254.56893),		// center map to Port-au-Prince, Haiti 
        //center: new OpenLayers.LonLat(-72.345, 18.551).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()),
        zoom: 15,                 
        //tbar: [],	// add tool bar to the map panel
        layers: [
            baselayer_osmmq,
            baselayer_osm,            
            //baselayer_agsonline_topo,
            baselayer_agsonline_imagery,
            osgeo_wms
        ],    	                
        items: []	// child components    
    });	 

    // =====================================================================================
	// Viewport
	// =====================================================================================
    new Ext.Viewport({
        layout: "fit",
        hideBorders: true,
        items: {
            layout: "border",
            deferredRender: false,	// what does it mean? render right way
            items: [
                panel, 
                tree, 
                /*{	// add a description panel
	                contentEl: "desc",
	                region: "east",
	                bodyStyle: {"padding": "5px"},
	                collapsible: true,
	                collapseMode: "mini",
	                split: true,
	                width: 200,
	                title: "Description"
                }*/
            ]
        }
    });
});
