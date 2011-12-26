//-----------------------------
// OpenLayers 	
//-----------------------------
// map
var map;
// baselayers
var baselayerOSM;
var baselayer_mqosm;
var baselayerAgsOnlineTopo;
var baselayerAgsOnlineImagery;  
// wms layers and controls
var wmsLayer;
// wfs layers strategies and controls
var wfsPointLayer;
var wfsPolylineLayer;
var wfsPolygonLayer;
// wcs layer
var wcsLayer;	// add WCS as an invisible WMS layer in map, whose layer.url will be used for WPS input
//
var bbox_strategies;
//
// vector layer for hand-draw geometry
var handDrawLayer;
var handDrawLayerCtrl;
//
var wpsOutputLayer;
// wps process layers
var wpsProcessLayers;
//
//-----------------------------
//  GeoExt 
//-----------------------------
// map
var mapPanel;
// toolbar
var toolbarItems;
var toolbarActions;
var toolbarPanel;
var toolbarWindow;
// layer tree
var layerTreePanel;
var layerTreeWindow;
var layerTreeJsonConfig;
// wps process tree and stores 
var processStores;
var wpsProcessStores;	// cache the wps process description stores
//
var selectedProcessIdentifier;
var selectedProcessParam;
var processDescriptionGrid;
var processDescriptionWindow;
var selectedProcessParameterRowId;

//
//-----------------------------
//  external resources 	
//-----------------------------
var sldUrls;
var styles;
//
var schemaUrls;
var schemas;
// 
var wpsUrls;
var processList;
//
var respCount;
var expectedRespCount;

//
Ext.onReady(function() {
	// set the proxy url for corss-domain calls
	OpenLayers.ProxyHost= function(url) {
		return "/opengeo.geoext/ApacheProxyServlet?url=" + url;
    };
	// set the proxy url for corss-domain calls
	//OpenLayers.ProxyHost= "/opengeo.geoext/ApacheProxyServlet?url=";	    
    // set MapBox customized theme
    //OpenLayers.ImgPath = "http://js.mapbox.com/theme/dark/";
	
    // ==================================================================================================
	// initialize map
	// ==================================================================================================
	map = new OpenLayers.Map(	// call OpenLayers.Map constructor to initialize map
    	{        		
    		//panMethod: null, // set 'panMethod' to null to disable animated panning
    		controls: [		      
    		    //new OpenLayers.Control.LayerSwitcher(),
    		   	//new OpenLayers.Control.Navigation(),
    			//new OpenLayers.Control.PanZoom(),
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
	baselayerOSM = new OpenLayers.Layer.OSM();
	// mapquest base layer
	baselayerOSMMapQuest = new OpenLayers.Layer.MapQuestOSM();
	// arcgis online base layer
	baselayerAgsOnlineTopo = new OpenLayers.Layer.AgsTiled( 
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
	baselayerAgsOnlineImagery = new OpenLayers.Layer.AgsTiled( 
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
	wmsLayer = new OpenLayers.Layer.WMS(   
	    "WMS - dynamic rendering", 
	    "http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WMSServer?",    	
		{ 																												
    		LAYERS: "elevation",
			STYLES: "",																																																																	
			SRS: "EPSG:3857",											
			FORMAT: "image/png8",				
			EXCEPTIONS: "text/xml",																
			TRANSPARENT: true																	
		},
		{											 													
			isBaseLayer: false,
			singleTile: true,
			displayOutsideMaxExtent: true	
		}
	);	
    wmsLayer.setOpacity(0.9);								
    //wmsLayer.setVisibility(true);
    wmsLayer.setVisibility(false);
	
    wcsLayer = new OpenLayers.Layer.WMS(  
    	"Port-au-Prince WCS",
    	"http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WCSServer",
    	{},
    	{											 													
			isBaseLayer: false,
			singleTile: true,
			displayInLayerSwitcher: false
		}
    );
    wcsLayer.setVisibility(false);
    
	// wfs layers	
    wfsPointLayer = new OpenLayers.Layer.Vector(
		"WFS Points - Feature Access",
		{
			strategies: [new OpenLayers.Strategy.BBOX()],
			protocol: new OpenLayers.Protocol.WFSTWithLock({
				url: "http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WFSServer?",    				
				format: new OpenLayers.Format.WFSTWithLock({
					//version: "1.1.0",
					srsName: "urn:ogc:def:crs:EPSG:6.9:3857",
					// if schema is set, a DescribeFeatureType request will be sent
					//schema: "",
					featureType: "places",    					
					geometryName: "Shape",																		
					featureNS: "http://www.esri.com",
					featurePrefix: "esri",    					
					extractAttributes: true,
					enocdeAttributes: false,
					xy: true,
					lockExpiry: "5",
					releaseAction: "ALL"
					// propertyNames: "", array of string to list properties to be returned
				})
				//maxFeatures: 1000
	    	})						
		}
	);
	// wfs layer is associated with grid and store 
	//   in GeoExt 1.0, it must be added to map first instead of being added when creating MapPanel
	//	 otherwise initialization of FeatureSelectionModel fails
    wfsPointLayer.setVisibility(false);
	
    wfsPolylineLayer = new OpenLayers.Layer.Vector(
		"WFS Lines - Feature Access",
		{
			strategies: [new OpenLayers.Strategy.BBOX()],
			protocol: new OpenLayers.Protocol.WFSTWithLock({
				url: "http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WFSServer?",    				
				format: new OpenLayers.Format.WFSTWithLock({
					//version: "1.1.0",
					srsName: "urn:ogc:def:crs:EPSG:6.9:3857",
					// if schema is set, a DescribeFeatureType request will be sent
					schema: "http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:roads",
					featureType: "roads",    					
					geometryName: "Shape",																		
					featureNS: "http://www.esri.com",
					featurePrefix: "esri",    					
					extractAttributes: true,
					enocdeAttributes: false,
					xy: true,
					lockExpiry: "5",
					releaseAction: "ALL"
					// propertyNames: "", array of string to list properties to be returned
				})
				//maxFeatures: 10
	    	})							
		}
	);
    wfsPolylineLayer.setVisibility(false);
	//map.addLayer(wfsPolylineLayer);
	
	wfsPolygonLayer = new OpenLayers.Layer.Vector(
		"WFS Polygons - Feature Access",
		{
			strategies: [new OpenLayers.Strategy.BBOX()],
			protocol: new OpenLayers.Protocol.WFSTWithLock({
				url: "http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WFSServer?",    				
				format: new OpenLayers.Format.WFSTWithLock({
					//version: "1.1.0",
					srsName: "urn:ogc:def:crs:EPSG:6.9:3857",
					// if schema is set, a DescribeFeatureType request will be sent
					//schema: "",
					featureType: "buildings",    					
					geometryName: "Shape",																		
					featureNS: "http://www.esri.com",
					featurePrefix: "esri",    					
					extractAttributes: true,
					enocdeAttributes: false,
					xy: true,
					lockExpiry: "5",
					releaseAction: "ALL"
					// propertyNames: "", array of string to list properties to be returned
				})
				//maxFeatures: 49
	    	})							
		}
	);		
	wfsPolygonLayer.setVisibility(false);
	//map.addLayer(wfsPolygonLayer);
	
	// a empty vector for user to hand draw geometry
	handDrawLayer = new OpenLayers.Layer.Vector(
	    "__wps_hand_draw_input__",
	    {
	    	displayInLayerSwitcher: true
	    }
    );	
		
	handDrawLayerCtrl = new OpenLayers.Control.DrawFeature(
		handDrawLayer,
		//OpenLayers.Handler.Polygon,	// hand draw polygon		
		OpenLayers.Handler.Point,
    	{
			// add handler options e.g. multi to encode polygons as multipolygons instead of polygons
			//handlerOptions: {multi:true}			
    	}
    );	    	     	    	   
    map.addControl(handDrawLayerCtrl);
    //handDrawLayerCtrl.activate();
		
    wpsOutputLayer = new OpenLayers.Layer.Vector(
	    "__wps_results_output__",
	    {
	    	displayInLayerSwitcher: true
	    }
    );
    
	// =====================================================================================
	// load external resources like SLD and feature type schema
	// =====================================================================================
	// TODO: find a better way to send multiple asyn request and a single callback when all are completed
	sldUrls = [
	    "http://august-resources.appspot.com/sld/openlayers-examples/wfst-with-lock-styles.xml"
	];
	schemaUrls = [
        "http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:places",
        "http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:roads",
        "http://gouf:6080/arcgis/services/playground/haiti_3857/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:buildings"
	];
	wpsUrls = [
	    
    ];	
	respCount = 0;
	expectedRespCount = schemaUrls.length + sldUrls.length + wpsUrls.length;  
	
	for(var i=0; i<sldUrls.length; i++) {
		OpenLayers.loadURL(
	    	sldUrls[i], 
	    	null, null, 
	    	onSldLoad    	  
	    	// TODO: handle load failure
	    );	
	}
	for(var i=0; i<schemaUrls.length; i++) {
		OpenLayers.loadURL(
			schemaUrls[i], 
		    null, null, 
		    onSchemaLoad 	  
		    // TODO: handle load failure
		);
	}
	for(var i=0; i<wpsUrls.length; i++) {
		OpenLayers.loadURL(
			wpsUrls[i], 
		    null, null, 
		    onWpsCapabilitiesLoad 	  
		    // TODO: handle load failure
		);
	}
});

function onSldLoad(request) {	
	// TODO: make it generic
	//   save styles by namedlayer instead of hard code
	styles = {
		'point': {},
		'line': {},
		'polygon': {}
	};	
	var sldFormat = new OpenLayers.Format.SLD();
	var sld = sldFormat.read(request.responseXML || request.responseText);
	
	styles['point']['basic'] = sld.namedLayers["point"].userStyles[0];
	styles['point']['red'] = sld.namedLayers["point"].userStyles[1];
	styles['point']['blue'] = sld.namedLayers["point"].userStyles[2];
	styles['point']['gold'] = sld.namedLayers["point"].userStyles[3]; // gold gmaps style marker
	
	styles['line']['basic'] = sld.namedLayers["polyline"].userStyles[0];
	styles['line']['red'] = sld.namedLayers["polyline"].userStyles[1];
	styles['line']['blue'] = sld.namedLayers["polyline"].userStyles[2];
	styles['line']['gold'] = sld.namedLayers["polyline"].userStyles[3];
	
	styles['polygon']['basic'] = sld.namedLayers["polygon"].userStyles[0];
	styles['polygon']['red'] = sld.namedLayers["polygon"].userStyles[1];
	styles['polygon']['blue'] = sld.namedLayers["polygon"].userStyles[2];	
	styles['polygon']['green'] = sld.namedLayers["polygon"].userStyles[3];
	
	/*var shadowStyle = {
		backgroundGraphic: "http://august-resources.appspot.com/sld/openlayers-examples/images/shadow.png",            
        backgroundXOffset: 0,
        backgroundYOffset: -7,
        graphicZIndex: 11,
        backgroundGraphicZIndex: 10	
	};
	// this is only a trick to overwrite rendering parameters for background graphics
	styles['point']['red'].setDefaultStyle(shadowStyle);
	styles['point']['blue'].setDefaultStyle(shadowStyle);
	styles['point']['gold'].setDefaultStyle(shadowStyle);*/
	
	// change wfs layer stlyes
	// TODO: make it more generic
	wfsPointLayer.styleMap = new OpenLayers.StyleMap({
		// point geometry layer
		'default': styles['point']['gold'],
		'select': styles['point']['blue']	
	});	
	
	wfsPolylineLayer.styleMap = new OpenLayers.StyleMap({		
		// polyline geometry layer
		'default': styles['line']['blue'],
		'select': styles['line']['red']				
	});	
		
	wfsPolygonLayer.styleMap = new OpenLayers.StyleMap({
		// polygon geometry layer
		'default': styles['polygon']['blue'],
		'select': styles['polygon']['red']
				
	});	
	
	respCount++;
	if(respCount < expectedRespCount) {
		OpenLayers.Console.info("...waiting for other resources...delay initializeLayout()...");
	} else {
		OpenLayers.Console.info("...all resources loaded...call initializeLayout()...");
		initializeLayout();
	}
}
/**
 * 
 * @param request
 * @returns
 */
function onSchemaLoad(request) {	
	if(!schemas) {
		schemas = {};
	}	
	var schemaFormat = new OpenLayers.Format.WFSDescribeFeatureType();
	var schema = schemaFormat.read(request.responseXML || request.responseText);	
	
	var featureType = schema.featureTypes[0];
	schemas[featureType.typeName] = featureType;  
	
	respCount++;
	if(respCount < expectedRespCount) {
		OpenLayers.Console.info("...waiting for other resources...delay initializeLayout()...");
	} else {
		OpenLayers.Console.info("...all resources loaded...call initializeLayout()...");
		initializeLayout();
	}
}

function onWpsCapabilitiesLoad(request) {		
	if(!wpsProcessLayers) {
		wpsProcessLayers = [];
	}
	if(!wpsProcessStores) {
		wpsProcessStores = {};
	}
	var data = request.responseXML;
    if(!data || !data.documentElement) {
        data = request.responseText;
    }
	var wpsCapaParser = new OpenLayers.Format.WPSCommon();
	if(typeof data === "string" || data.nodeType) {
        data = wpsCapaParser.read(data);
    }
	var executeEndPoint = data.operationsMetadata.Execute.dcp.http.post;
	var describeProcessEndPoint = data.operationsMetadata.DescribeProcess.dcp.http.get;
	if(executeEndPoint.indexOf('?') == -1) {
		executeEndPoint = executeEndPoint + "?";
	}
	if(describeProcessEndPoint.indexOf('?') == -1) {
		describeProcessEndPoint = describeProcessEndPoint + "?";
	}
	var processOfferings = data.processOfferings;
	// TODO: parse the url endpoint for wps Execute
	for(var i=0;i<processOfferings.length; i++) {
		processOffering = processOfferings[i];
		if(processOffering.identifier) {			
			// create a wps process
			var wpsProcess = new OpenLayers.Process.WPS({						
				url: executeEndPoint,
				//url: "http://alexandertown0:6080/arcgis/services/regression.advanced.services/GPServer/WPSServer?",
				//url: "http://alexandertown0:6080/arcgis/services/wcs2polygons/GPServer/WPSServer?",				
				identifier: processOffering.identifier
				// TODO: more settings
			});
			wpsProcess.map = map;
			// create a new process layer and cache it
			var wpsProcessLayer = new OpenLayers.Layer.Process(
				processOffering.identifier, 
				{
					processIdentifier: processOffering.identifier,
					describeProcessUrl: describeProcessEndPoint,
					executeUrl: executeEndPoint,
					process: wpsProcess
				}
			);
			wpsProcessLayers.push(wpsProcessLayer); 
		}		
	}
	// TODO: do not add duplicated process layers into map 
	map.addLayers(wpsProcessLayers);
	/*
	respCount++;
	if(respCount < expectedRespCount) {
		OpenLayers.Console.info("...waiting for other resources...delay initializeLayout()...");
	} else {
		OpenLayers.Console.info("...all resources loaded...call initializeLayout()...");
		initializeLayout();
	}
	*/ 		
}

function initializeLayout() {
	// =====================================================================================
	// Create WPS process layers
	// =====================================================================================	
	var mapLayerList = [
        baselayerOSMMapQuest,
	    baselayerOSM,            
        //baselayerAgsOnlineTopo,
        baselayerAgsOnlineImagery,
        wmsLayer,
        wcsLayer,
        wfsPointLayer,
        wfsPolylineLayer,
        wfsPolygonLayer,
        wpsOutputLayer,
        handDrawLayer
    ];
	if(wpsProcessLayers) {
		for(var i=0; i<wpsProcessLayers.length; i++) {
			mapLayerList.push(wpsProcessLayers[i]);
		}
	}	
	// =====================================================================================
	// Map panel
	// =====================================================================================
    mapPanel = new GeoExt.MapPanel({        
    	//title: "Map",		// give a title for the MapPanel, if missing then there is no title bar                
    	border: true,		// attribute inherit from Ext.Panel
        region: "center",	//                  
        map: map,                                
        //center: new OpenLayers.LonLat(-13627645.42659, 4548227.25804),
        center: new OpenLayers.LonLat(-8053390.64539, 2102254.56893),		// center map to Port-au-Prince, Haiti 
        //center: new OpenLayers.LonLat(-72.345, 18.551).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()),                
        zoom: 18,                 
        //tbar: [],	// add tool bar to the map panel
        layers: mapLayerList,    	                
        items: []	// child components        
    });	 
	
	// =====================================================================================
	// layer tree 
	// =====================================================================================
    
	// flexible to customize layer node UI class, using the TreeNodeUIEventMixin
    var LayerNodeUI = Ext.extend(
    	GeoExt.tree.LayerNodeUI, 
    	new GeoExt.tree.TreeNodeUIEventMixin({})
    );
    
    var ProcessLayerNodeUI = Ext.extend(
        GeoExt.tree.LayerNodeUI, 
        // TODO: !!! figure out a better way to inherit from TreeNodeUIEventMixin
        //   see ProcessLayerContainer.js GeoExt.tree.ProcessLayerTreeNodeUIEventMixin 
        new GeoExt.tree.ProcessLayerTreeNodeUIEventMixin({
        	layers: wpsProcessLayers,
        	stores: wpsProcessStores,
        	layerTreeWndId: "layerTreeWindow"
        })
    );
    
    //    
	layerTreeJsonConfig = [
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
        },
        {	// overlayer container
        	nodeType: "gx_processlayercontainer",
			text: 'tools',
			expanded: false,
	        // render the nodes inside this container with a radio button,
	        //   and assign them the group "overlayers".
	        loader: {
	            baseAttrs: {
	                //radioGroup: "tools",
	                uiProvider: "processlayernodeui"
	            }
	        }	        
        } 
	];
	
	// GeoExt sample suggest not using this line of code, but it doesn't work without it 
	layerTreeJsonConfig = new OpenLayers.Format.JSON().write(layerTreeJsonConfig, true);
	
	// what's the difference between using xtype and not using xtype to create a tree panel	
	layerTreePanel = new Ext.tree.TreePanel({        
    	border: false,					//		
		//title: "Table of Content",	//
		//width: 250,					//
		//height: 400,					//
		//split: true,					//
		//collapsible: true,			//
		//collapseMode: "mini",			//
		autoScroll: true,				//
		//enableDD: true,		//
		//
		plugins: [		         
            /*new GeoExt.plugins.TreeNodeRadioButton({
                listeners: {
                    "radiochange": function(node) {
                        alert(node.text + " is now the active layer.");
                    }
                }
            })*/
        ],
        //
		loader: new Ext.tree.TreeLoader({
            // applyLoader has to be set to false to not interfer with loaders
            // of nodes further down the tree hierarchy
            applyLoader: false,
            uiProviders: {
                "layernodeui": LayerNodeUI,
                "processlayernodeui": ProcessLayerNodeUI
            }
        }),
    	//root: asyncTreeNode,  			// use a simple Ext.tree.AsyncTreeNode as tree root
		root: {
			 nodeType: "async",
			 children: Ext.decode(layerTreeJsonConfig)			 
		},
    	rootVisible: false,		// whether the single tree root is visible
    	//
        listeners: {                        
			// !!! if you need to pass scope into the listener, then call TreePanel.on() instead of register it here
        	/*"radiochange": function(node){
	            alert(node.layer.name + " is now the the active layer.");
	        }*/
        	/*
        	click: function(node, evt) {
        		OpenLayers.Console.info("...click on a process layer...");
            },
            */
        	/*            
            dblclick: function(node, evt) {
                // TODO: stop the event to cause listeners of 'click' to be called
            	OpenLayers.Console.info("...dblclick on a process layer...");            	            	
            }
            */
        }
    });    
		
	// layer tree window
	layerTreeWindow = new Ext.Window({
        id: "layerTreeWindow",
		title: "Table of Content",
        height: 400,
        width: 200,
        layout: "fit",
        closable: false,			//
        collapsible: true,
        collapseMode: "mini",	//
        x: 20,					// x position of the left edge of the window on initial showing
        y: 100,					// y position of the top edge of the window on initial showing
        items: [
            layerTreePanel        
        ]
    }).show();
	    
	// TODO: how to get rid of the surrounding margin of toolbar window?
	toolbarItems = []; 
	toolbarActions = {};
	
	// ZoomToMaxExtent control, a "button" control
    var zoomToMaxAction = new GeoExt.Action({
        control: new OpenLayers.Control.ZoomToMaxExtent(),
        map: map,
        text: "Full Extent",
        tooltip: "zoom to full extent"
    });    
    toolbarActions["zoomToMaxAction"] = zoomToMaxAction;
    //toolbarItems.push(zoomToMaxAction);
    //toolbarItems.push("-"); // looks like a separator or something
    
    // Navigation control and DrawFeature controls
    // in the same toggle group
    var navigationAction = new GeoExt.Action({
        text: "Navigation",
        control: new OpenLayers.Control.Navigation(),
        map: map,
        // button options
        toggleGroup: "interaction",	// only one button from "interaction" group can be toggled on at a time
        allowDepress: true,				// whether this button can be toggled off or not (toggle off to de-activate associated control)
        pressed: true,
        tooltip: "navigate map",
        // check item options
        group: "interaction",
        checked: true
    });
    toolbarActions["navigationAction"] = navigationAction;
    //toolbarItems.push(navigationAction);
    //toolbarItems.push("-");
    /*
    toolbarItems.push({
    	text: 'TOC',     	
        pressed: true,
        //allowDepress: true,
        enableToggle: true,
    	handler: function(b) {    		    		
    		if(b.pressed == true) {
    			layerTreeWindow.show();
    		} else {
    			layerTreeWindow.hide();
    		}
    	}
    });
    toolbarItems.push("-");
    */
    /*
    toolbarItems.push({   
    	id: "txtField_wpsUrl",
    	xtype: "textfield",
    	fieldLabel: 'URL:',
        name: 'url',
        allowBlank: true,
        width: 384,
        value: "http://alexandertown0:6080/arcgis/services/wcs2polygons/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
        //value: "http://alexandertown0:6080/arcgis/services/regression.advanced.services/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
    });
    */
    toolbarItems.push({   
    	id: "combo_wpsUrl",
    	xtype: "combo",				// xtype for Ext.form.ComboBox    	
    	typeAhead: true,			// auto complete the remainder when typing in
    	typeAheadDelay: 500,		// the delay of auto complete in milliseconds
        triggerAction: 'all',		
        lazyRender:true,	
        width: 384,
        emptyText: "Type in or select WPS end-point url",
        mode: 'local',			
    	store: new Ext.data.ArrayStore({
    	    id: 0,
    	    fields: ['id', 'name', 'url'],
    	    data: [
    	        [
    	            0, 
    	            "http://gouf:6080/arcgis/services/wcs.acceptance.criteria/wcs2polygons/GPServer/WPSServer", 
    	            "http://gouf:6080/arcgis/services/wcs.acceptance.criteria/wcs2polygons/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
    	        ],
    	        [
    	            1,
    	            "http://gouf:6080/arcgis/services/wps.regression/advanced_tbx/GPServer/WPSServer",
    	            "http://gouf:6080/arcgis/services/wps.regression/advanced_tbx/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
    	        ],
    	        [
 	            	2,
 	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/DataExtraction/GPServer/WPSServer",
 	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/DataExtraction/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
 	            ],
 	            [
	            	3,
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/SaveToPDF/GPServer/WPSServer",
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/SaveToPDF/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
	            ],
 	            [
	            	4,
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/Viewshed/GPServer/WPSServer",
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/Viewshed/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
	            ],
 	            [
	            	5,
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/CrimeHotSpots/GPServer/WPSServer",
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/CrimeHotSpots/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
	            ],
 	            [
	            	6,
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/MailingList/GPServer/WPSServer",
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/MailingList/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
	            ],
 	            [
	            	7,
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/PopByZip/GPServer/WPSServer",
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/PopByZip/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
	            ],
 	            [
	            	7,
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/WalkTime/GPServer/WPSServer",
	            	"http://gouf:6080/arcgis/services/wps.acceptance.criteria/WalkTime/GPServer/WPSServer?request=GetCapabilities&service=WPS&version=1.0.0"
	            ]
    	    ]
    	}),
    	valueField: 'url',
        displayField: 'name',
        listeners:{        	
        	/*'select': function(combo, record, index) {  
        		//var wcsUrlStr = record.get("url");            	
        	},
        	'change': function(field, newValue, oldValue) {},
            'keypress': function(field, evtObj) {
        		//if(evtObj.keyCode == 13) {	// check if 'enter' is pressed 
        		//}
        	}*/        	
        }
    });
        
    toolbarItems.push({
    	text: 'Add WPS Processes', 
    	handler: function(button) {    		
    		//var inputField = Ext.getCmp("txtField_wpsUrl");
    		var inputField = Ext.getCmp("combo_wpsUrl");    		
    		//OpenLayers.Console.debug("...load WPS capabilities from: " + inputField.getValue());    		    		
    		OpenLayers.loadURL(
    			inputField.getValue(), 
			    null, null, 
			    onWpsCapabilitiesLoad, 	  
			    function(resp) {
    				alert("...invalid WPS url...");
    			}
			);
    		
    	}
    });    
    
    toolbarItems.push("-");
    
    toolbarItems.push({
    	text: 'Hand Draw',     	
        pressed: false,
        //allowDepress: true,
        enableToggle: true,
    	handler: function(b) {    		    		
    		if(b.pressed == true) {
    			handDrawLayerCtrl.activate();
    		} else {
    			handDrawLayerCtrl.deactivate();
    		}
    	}
    });
    
    toolbarWindow = new Ext.Window({
        //title: "Toolbar",
        layout: "fit",
        //height: 200,
        width: 640,
        closable: false,			//
        collapsible: true,
        collapseMode: "mini",	//
        animCollapse: true,                
        x: 20,					// x position of the left edge of the window on initial showing
        y: 20,					// y position of the top edge of the window on initial showing
        tbar: toolbarItems        
    }).show();
    
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
            ]
        }
    });	
}


