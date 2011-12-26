var map;
var baselayer_osm, baselayer_mqosm, baselayer_agsonline_topo, baselayer_agsonline_imagery;  

var osgeo_wms;
var ags_wfs;

var mapPanel;
var tree, treeJsonConfig;
var store, grid;

var schema_store, schema_grid;

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
	// wms layer
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
	
	// wfs layer
	ags_wfs = new OpenLayers.Layer.Vector(
		"ags wfs",
		{
			// no need to specify the wfst protocol here, do it when creating the feature store
			//   otherwise DescribeFeatureType request will be sent twice
			/*
			protocol: new OpenLayers.Protocol.WFSTWithLock({
				url: "http://penelopetown0/arcgis/services/playground/haiti/MapServer/WFSServer?",    				
				format: new OpenLayers.Format.WFSTWithLock({
					//version: "1.1.0",
					srsName: "urn:ogc:def:crs:EPSG:6.9:3857",
					// if schema is set, a DescribeFeatureType request will be sent
					schema: "http://penelopetown0/arcgis/services/playground/haiti/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:portauprince_places_3857",
					featureType: "portauprince_places_3857",    					
					geometryName: "Shape",																		
					featureNS: "http://www.esri.com",
					featurePrefix: "esri",    					
					extractAttributes: true,
					xy: true,
					lockExpiry: "5",
					releaseAction: "ALL"
					// propertyNames: "", array of string to list properties to be returned
				}),
				maxFeatures: 49
	    	})
			*/
		}
	);
	// wfs layer is associated with grid and store 
	//   in GeoExt 1.0, it must be added to map first instead of being added when creating MapPanel
	//	 otherwise initialization of FeatureSelectionModel fails
	map.addLayer(ags_wfs);		
	
	// =====================================================================================
	// Map panel
	// =====================================================================================
    mapPanel = new GeoExt.MapPanel({        
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
            osgeo_wms,
            //ags_wfs
        ],    	                
        items: []	// child components        
    });	 
	
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
	//
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
	// feature store and grid panel
	// =====================================================================================
    store = new GeoExt.data.FeatureStore({
        layer: ags_wfs,
        fields: [
            {name: 'name', type: 'string'},
            {name: 'id', type: 'float'},
            {name: 'timestamp', type: 'string'}
        ],
        proxy: new GeoExt.data.ProtocolProxy({
        	// sample OpenLayers HTTP protocol with GeoJSON format
        	/*
            protocol: new OpenLayers.Protocol.HTTP({
                url: "data/summits.json",
                format: new OpenLayers.Format.GeoJSON()
            })
        	*/
        	// OpenLayers WFS2 protocol plus GML3 format
        	protocol: new OpenLayers.Protocol.WFSTWithLock({
				url: "http://penelopetown0/arcgis/services/playground/haiti/MapServer/WFSServer?",    				
				format: new OpenLayers.Format.WFSTWithLock({
					//version: "1.1.0",
					srsName: "urn:ogc:def:crs:EPSG:6.9:3857",
					// if schema is set, a DescribeFeatureType request will be sent
					//schema: "http://penelopetown0/arcgis/services/playground/haiti/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:portauprince_places_3857",
					featureType: "portauprince_places_3857",    					
					geometryName: "Shape",																		
					featureNS: "http://www.esri.com",
					featurePrefix: "esri",    					
					extractAttributes: true,
					xy: true,
					lockExpiry: "5",
    				releaseAction: "ALL"
					// propertyNames: "", // array of string to list properties to be returned
				}),
				maxFeatures: 49
        	})   
        }),
        autoLoad: true
    });
    
    grid = new Ext.grid.GridPanel({
    	title: "Feature Grid",
        region: "south",
        store: store,
        //width: 220,
        height: 150,
        split: true,			//
		collapsible: true,		//
		collapseMode: "mini",	//
		autoScroll: true,		//
        columns: [
            {
	            header: "Name",
	            width: 100,
	            dataIndex: "name"
            }, 
        	{
	            header: "ID",
	            width: 100,
	            dataIndex: "id"
        	}, 
        	{
	            header: "Timestamp",
	            width: 100,
	            dataIndex: "timestamp"
        	}
        ],
        sm: new GeoExt.grid.FeatureSelectionModel() 
    });
    
    // =====================================================================================
	// schema store and grid
	// =====================================================================================
	schema_store = new GeoExt.data.AttributeStore({
        url: "http://penelopetown0/arcgis/services/playground/haiti/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:portauprince_places_3857"        
	});		 
	schema_store.load();
	
	// create a grid to display records from the store
    schema_grid = new Ext.grid.GridPanel({
        title: "Feature Attributes",
        store: schema_store,
        cm: new Ext.grid.ColumnModel([
            {id: "name", header: "Name", dataIndex: "name", sortable: true},
            {id: "type", header: "Type", dataIndex: "type", sortable: true}
        ]),
        sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
        autoExpandColumn: "name",
        region: "east",
        height: 150,
        width: 250,
        split: true,			//
		collapsible: true,		//
		collapseMode: "mini",	//
		autoScroll: true		//
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
                mapPanel,                
                tree,                
                grid,
                schema_grid               
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
