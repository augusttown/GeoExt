//-----------------------------
//  OpenLayers 	
//-----------------------------
var map;
// layers
var baselayerOSM;
var baselayer_mqosm;
var baselayerAgsOnlineTopo;
var baselayerAgsOnlineImagery;
var baselayerAgsOnlineStreet;
var baselayerBingMaps;
var wmsLayerVector;
var wmsLayerRaster;
var wmtsLayer;
var wfsLayer;
// controls
var wfsSelectControl;
// process
var wcs2PolygonsPorcess;

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
// features window
var featureStore;
var featureGrid;
var featureWindow;
// feature attributes window
var featureAttributesStore;
var featureAttributesGrid;
var featureAttributesWindow;

//-----------------------------
//  external resources 	
//-----------------------------
var styles;
var schemas;
var sldUrl;  
var schemaUrls;
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
	baselayerAgsOnlineStreet = new OpenLayers.Layer.AgsTiled( 		
    	"arcgisonline street map",
		"http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/",
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
	// Bing Maps 
	baselayerBingMaps = new OpenLayers.Layer.Bing({
		key: "ApxokflsoCjPik3c2ZdyJPwfkLliHhfbADggzSJ0jN6tS4LgLU6N6NbMsMzx2cXi",
		type: "AerialWithLabels",
		name: "bing maps"
	});
	
	// =====================================================================================
	// overlays
	// =====================================================================================		
	// wms layer
	/*
	wmsLayer = new OpenLayers.Layer.WMS(   
    	"wms", 
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
	wmsLayer.setOpacity(0.64);								    
	wmsLayer.setVisibility(false);
	*/
	
	wmsLayerVector = new OpenLayers.Layer.WMS(   
		"Roads", 
	    "http://sazabiii:6080/arcgis/services/playground/haiti/MapServer/WMSServer", 
	    {
	    	layers: "roads",
	    	transparent: true,
	    	format: "image/png"
	    },
	    {
	    		buffer: 0,
	    		isBaseLayer: false,
				singleTile: true,				
				displayOutsideMaxExtent: true
	    }
	);	
	//wmsLayerVector.setOpacity(0.81);								    
	wmsLayerVector.setVisibility(false);
	
	wmsLayerRaster = new OpenLayers.Layer.WMS(   
		"Elevation", 
	    "http://sazabiii:6080/arcgis/services/playground/haiti/MapServer/WMSServer", 
	    {
	    	layers: "elevation",
	    	transparent: true,
	    	format: "image/png"
	    },
	    {
	    		buffer: 0,
	    		isBaseLayer: false,
				singleTile: true,				
				displayOutsideMaxExtent: true
	    }
	);	
	wmsLayerRaster.setOpacity(0.72);								    
	wmsLayerRaster.setVisibility(false);
	
	// add a WMTS by manually configure the tileMatrixSet and matrixIds
	// in this case you don't need to load and parse capabilities file
	var _tileMatrixSet = "EsriTileMatrix";
	var _matrixIds = [];				
    for (var j=0; j<31; ++j) {		    
        // if matrix id are integers, then make them string otherwise cause
    	_matrixIds[j] = "" + j + "";
    }
	
	// wmts layer
	/*
    wmtsLayer = new OpenLayers.Layer.WMTS({
		// general Grid layer options 
		name: 			"wmts", 
		url:			"http://sazabiii:6080/rest/services/haiti_tiled/MapServer/WMTS/tile",									
		isBaseLayer: 	false,
		singleTile: 	false,		
		layer: 			"Layers",
		style: 			"EsriStyle",				
		matrixSet: 		_tileMatrixSet,				
		format: 		"image/png",																							 					
		requestEncoding: "REST",				
		matrixIds: _matrixIds,
		// optional
		tileFullExtent: new OpenLayers.Bounds(-8069190.656976244, 2085389.073659229, -8022413.076723755, 2125896.767401971),				
		// optional
		tileOrigin: new OpenLayers.LonLat(-20037508.342789, 20037508.342789)
	});  
	wmtsLayer.setOpacity(0.8);
	wmtsLayer.setVisibility(false);
	*/
	
	// wfs layer
	wfsLayer = new OpenLayers.Layer.Vector(
		"Places",
		{
			// no need to specify the wfst protocol here, do it when creating the feature store
			//   otherwise DescribeFeatureType request will be sent twice			
			// ArcGIS Server WFS
			
			protocol: new OpenLayers.Protocol.WFSTWithLock({
				url: "http://sazabiii:6080/arcgis/services/playground/haiti/MapServer/WFSServer?",    				
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
					xy: true,
					lockExpiry: "5",
					releaseAction: "ALL"
					// propertyNames: "", array of string to list properties to be returned
				}),
				maxFeatures: 49
	    	})			
			// GeoServer WFS
			/*protocol: new OpenLayers.Protocol.WFSTWithLock({
				url: "http://char:8080/geoserver/wfs?",    				
				format: new OpenLayers.Format.WFSTWithLock({
					//version: "1.1.0",
					srsName: "EPSG:900913",
					// if schema is set, a DescribeFeatureType request will be sent
					//schema: "http://char:8080/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:sf_pizzastores",
					featureType: "sf_pizzastores",    					
					geometryName: "the_geom",																		
					featureNS: "http://www.esri.com",
					featurePrefix: "esri",    					
					extractAttributes: true,
					xy: true
					//lockExpiry: "5",
					//releaseAction: "ALL"
					// propertyNames: "", array of string to list properties to be returned
				})
				//maxFeatures: 49
	    	})*/
		}
	);
	// wfs layer is associated with grid and store 
	//   in GeoExt 1.0, it must be added to map first instead of being added when creating MapPanel
	//	 otherwise initialization of FeatureSelectionModel fails
	wfsLayer.setVisibility(false);
	map.addLayer(wfsLayer);		
	
	wfsSelectControl = new OpenLayers.Control.SelectFeature(wfsLayer, {
	    clickout: false,
	    toggle: true,
		multiple: false,
		onSelect: function(feature) {
			//OpenLayers.Console.debug("...feature " + feature.fid + " is selected...");			
			featureAttributesStore.proxy.data = featureAttributesToMemoryProxyArray(feature.fid, feature.attributes);
			featureAttributesStore.reload();
		},
		onUnselect: function(feature) {
			//OpenLayers.Console.debug("...feature " + feature.fid + " is unselected...");			
			featureAttributesStore.proxy.data = [];	
			featureAttributesStore.reload();
		}
	});	
	map.addControl(wfsSelectControl);
	wfsSelectControl.activate();
		
	// =====================================================================================
	// load external resources like SLD and feature type schema
	// =====================================================================================
	// TODO: find a better way to send multiple asyn request and a single callback when all are completed
	sldUrl = "http://august-resources.appspot.com/sld/openlayers-examples/wfst-with-lock-styles.xml";  
	schemaUrls = [
        "http://sazabiii:6080/arcgis/services/playground/haiti/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:places"
        //"http://char:8080/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:sf_pizzastores"
	];
	respCount = 0;
	expectedRespCount = schemaUrls.length + 1;  
	
	OpenLayers.loadURL(
    	sldUrl, 
    	null, null, 
    	onSldLoad    	  
    	// TODO: handle load failure
    );	
	for(var i=0; i<schemaUrls.length; i++) {
		OpenLayers.loadURL(
			schemaUrls[i], 
		    null, null, 
		    onSchemaLoad 	  
		    // TODO: handle load failure
		);
	}	
});

function onSldLoad(request) {	
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
	styles['polygon']['gold'] = sld.namedLayers["polygon"].userStyles[2];	
		
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
	wfsLayer.styleMap = new OpenLayers.StyleMap({
		// point geometry layer
		'default': styles['point']['gold'],
		'select': styles['point']['blue']	
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

/**
 * 
 * @param layer
 * @returns
 */
function getSchemaByLayer(layer) {	
	if(layer.protocol.format['featureType']) {
		// TODO: to be implemented in a generic way
		return schemas[layer.protocol.format['featureType']];
	} else {
		OpenLayers.Console.error("...layer schema not found...");
		return null;
	}	
}

/**
 * 
 * @param schema
 * @returns
 */
function schemaToFeatureStoreFields(schema) {	
	var fields = [];
	for(var i=0; i<schema.properties.length; i++) {
		if(schema.properties[i].type.split(":")[0] != "gml") {	// skip geometry attribute
			fields.push({
			    name: schema.properties[i].name,
				type: schema.properties[i].localType
				// mapping: ""	// mapping if necessary
			});
		}
	}
	return fields;
}

/**
 * 
 * @param schema
 * @returns
 */
function schemaToFeatureGridColumns(schema) {
	var columns = [];
	for(var i=0; i<schema.properties.length; i++) {
		if(schema.properties[i].type.split(":")[0] != "gml") {
			columns.push({
			    header: schema.properties[i].name,
			    //width: 100,	// hard code width
			    autoExpandColumn: true,	// auto adjust width of the column
				dataIndex: schema.properties[i].name
			});
		}
	}
	return columns;	
}

/**
 * 
 * @param schema
 * @returns
 */
/*
function schemaToEditableFeatureGridColumns(schema) {
	var columns = [];	
	var textFieldEditor = new Ext.form.TextField({
        //allowBlank: false
    });	
	var numberFieldEditor = new Ext.form.NumberField({
		//minLength: 5
		//maxLength: 5
	});	
	// TODO: need a mapping from a data type to certain editor form, e.g. string->TextField, date->DateField etc. 
	// TODO: need a list of attribute names which are usually not editable e.g. "OBJECTID", "Shape_Area", "Shape_Length"		
	for(var i=0; i<schema.properties.length; i++) {
		if(schema.properties[i].type.split(":")[0] != "gml") {						
			columns.push({
			    header: schema.properties[i].name,
			    //width: 100,	// hard code width
			    autoExpandColumn: true,	// auto adjust width of the column
				dataIndex: schema.properties[i].name,
				editor: textFieldEditor
			});
		}
	}
	return columns;	
}
*/

function featureAttributesToMemoryProxyArray(fid, attributes) {
	if(fid && attributes) {
		var memoryProxyArray = [];
		// TODO: 'fid' attribute is push in, so feature can be found by fid easily
		//   need to make it invisible in feature attribute grid
		memoryProxyArray.push({
			name: "fid",
			value: fid
		});
		for(key in attributes) {
			memoryProxyArray.push({
				name: key,
				value: attributes[key]
			});
		}		
		return memoryProxyArray;
	} else {
		return [];
	}
}

function getAttributeValueFromMemoryProxyArray(key, memoryProxyArray) {
	for(var i=0; i<memoryProxyArray.length; i++) {
		if(memoryProxyArray[i]['name'] == key) {
			return memoryProxyArray[i]['value'];
		}
	}
}

function executeWcs2Polygons() {	
	
	wcs2PolygonsPorcess = new OpenLayers.Process.WPS({
		map: map,			
		url: "http://sazabiii:6080/arcgis/services/playground/wcs2polygon/GPServer/WPSServer?",
		identifier: "wcs2polygons"
		// TODO: more settings
	});
	wcs2PolygonsPorcess.map = map;
	
	wcs2PolygonsPorcess.cleanupDataInput();
	wcs2PolygonsPorcess.cleanupDataOutput();
	
	wcs2PolygonsPorcess.addDataInput({
		identifier: "Input_WCS_Coverage",
		//title: "",
		//'abstract': "",
		type: "LiteralData",
		options: {
			dataType: "xs:string",			
			literalData: "http://sazabiii:6080/arcgis/services/playground/haiti/MapServer/WCSServer?coverage=1"
		}
	});
				
	// use a customized format to work around the limitation of current ArcGIS Server WPS	
	var result_parser = new OpenLayers.Format.WFSTWithLock({
		version: "1.1.0",
		srsName: "urn:ogc:def:crs:EPSG:6.9:3857",
		//schema: "http://sazabi:8399/arcgis/services/playground/sanfrancisco/MapServer/WFSServer?service=WFS&request=DescribeFeatureType&version=1.1.0&typename=esri:pizzastores",
		featureType: "polygons4wcs", //featureType: "pizzastores",    					
		geometryName: "Shape",																		
		featureNS: "http://www.esri.com",//featureNS: "http://augusttown0/arcgis/services/bufferfeatures/GPServer/WPSServer",
		featurePrefix: "esri", // featurePrefix: "esri",   					
		extractAttributes: false,//extractAttributes: true,
		// include only those attributes below		
		attributes: {			
			//'OBJECTID': true
		},
		xy: true	// no axis reverse for EPSG:3857    											
	});
	result_parser.readers['gml']['FeatureCollection'] = result_parser.readers['wfs']['FeatureCollection'];
	// register complex data output parser
	wcs2PolygonsPorcess.regDataOutputParser("results", result_parser);
	
	wcs2PolygonsPorcess.addDataOutput({
		identifier: "polygons4wcs",
		//type: "RawDataOutput",	// if output raw data, set 'isRawDataOutput' to true
		type: "ResponseDocument",	// if output <wps:ExecuteResponse>, set 'isRawDataOutput' to false 
		options: {
			schema: "http://schemas.opengis.net/gml/3.1.1/base/gml.xsd",
			encoding: "UTF-8",
			mimeType: "text/xml",			
			asReference: true
		}
	});
	
	wcs2PolygonsPorcess.execute({
		isRawDataOutput: false,
		callbacks:[		   
		    function(executeResponse) {	// callback to handle <wps:ExecuteResponse>
		    	OpenLayers.Console.debug("...callback is called...");		    					
		    	// in case the response data is embedded in response document
		    	/*
		    	var buffer_features = executeResponse.processoutputs[0].data.complexData[0];				
		    	result_layer.removeFeatures(result_layer.features);
		    	result_layer.addFeatures(buffer_features);
		    	*/
		    	// in case response is stored on server
		    	var resp_url = executeResponse.processoutputs[0].data.complexData[0];
		    	
		    	OpenLayers.loadURL(
		    		resp_url,
		    		{},
		    		this,
		    		function(request) {	// onSucceeded
		    			var doc = request.responseXML;
				        if(!doc || !doc.documentElement) {
				            doc = request.responseText;
				        }
				        var extracted_features = result_parser.read(doc);				        				   
				        //wfst_sf_polygon.removeFeatures(wfst_sf_polygon.features);
				        wfst_sf_polygon.addFeatures(extracted_features);
		    		},
		    		function(request) {	// onFailed
		    		}
		    	);
		    	
		    }
		]
	});
}

function initializeLayout() {
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
                
        zoom: 15,                 
        //tbar: [],	// add tool bar to the map panel
        layers: [
            baselayerOSMMapQuest,
            baselayerOSM,            
            //baselayerAgsOnlineTopo,
            baselayerAgsOnlineStreet,
            baselayerAgsOnlineImagery,
            baselayerBingMaps,
            wmsLayerVector,
            wmsLayerRaster,
            //wmtsLayer,
            //wfsLayer
        ],    	                
        items: []	// child components        
    });	 
	
	// =====================================================================================
	// layer tree 
	// =====================================================================================
    
	// flexible to customize layer node UI class, using the TreeNodeUIEventMixin
    var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());
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
			 children: Ext.decode(layerTreeJsonConfig)			 
		},
    	rootVisible: false,		// whether the single tree root is visible
    	//
        listeners: {                        
			"radiochange": function(node){
	            alert(node.layer.name + " is now the the active layer.");
	        }
        }
    });    
    // an alternative way to create a tree panel is use 'xtype'
    /*tree = {
		xtype: "treepanel",		// xtype
    	...
    	// same config as above
    	...	
    };*/
	
	// layer tree window
	layerTreeWindow = new Ext.Window({
        title: "Table of Content",
        height: 400,
        width: 200,
        layout: "fit",
        closable: false,			//
        collapsible: true,
        collapseMode: "mini",	//
        x: 20,					// x position of the left edge of the window on initial showing
        y: 200,					// y position of the top edge of the window on initial showing
        items: [
            layerTreePanel        
        ]
    }).show();
	    
    // =====================================================================================
	// feature store, grid panel and window
	// =====================================================================================
    var featureStoreFields = schemaToFeatureStoreFields(getSchemaByLayer(wfsLayer));
    var featureGridColumns = schemaToFeatureGridColumns(getSchemaByLayer(wfsLayer));
    
	featureStore = new GeoExt.data.FeatureStore({
        layer: wfsLayer,        
        fields: featureStoreFields,
        proxy: new GeoExt.data.ProtocolProxy({
        	// sample OpenLayers HTTP protocol with GeoJSON format
        	/*
            protocol: new OpenLayers.Protocol.HTTP({
                url: "data/summits.json",
                format: new OpenLayers.Format.GeoJSON()
            })
        	*/
        	// OpenLayers WFS2 protocol plus GML3 format
        	protocol: wfsLayer.protocol        	
        	/*protocol: new OpenLayers.Protocol.WFSTWithLock({
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
        	})*/   
        }),
        autoLoad: true
    });
	
	// TODO: add a paging toolbar, xtype:'paging'    
    featureGrid = new Ext.grid.GridPanel({
    	id: "featureGrid",		// give it an 'id', so it can be retrieved from component manager
    	//title: "Feature Grid",        
        store: featureStore,
        //width: 220,
        //height: 150,
        //split: true,			//
		//collapsible: true,		//
		//collapseMode: "mini",	//
		autoScroll: true,		//		
		cm: new Ext.grid.ColumnModel(featureGridColumns), 
		//columns: featureGridColumns,
        //sm: new GeoExt.grid.FeatureSelectionModel()
		// DO NOT use the built-in select control in FeatureSelectionModel
		//   pass in your own select control
		sm: new GeoExt.grid.FeatureSelectionModel({
			selectControl: wfsSelectControl
			// autoActivateControl: false	// set this false if you don't want select control be activated automatically
		})
    	// TODO:
    	/*listeners: {
    		rowdblclick: function
    		rowcontextmenu: function
    	}*/
    });
    
    // feature grid window
	featureWindow = new Ext.Window({
        title: "Features",
        layout: "fit",
        height: 200,
        width: 600,
        closable: false,			//
        collapsible: true,
        collapseMode: "mini",	//
        x: 300,					// x position of the left edge of the window on initial showing
        y: 600,					// y position of the top edge of the window on initial showing
        items: [
            featureGrid        
        ]
    });
    
    // =====================================================================================
	// feature attributes store, grid and window
	// =====================================================================================
	featureAttributesStore = new GeoExt.data.AttributeStore({
        proxy: new Ext.data.MemoryProxy([/* leave empty initially */]),		
        fields: [	// always have 'name' and 'value' for a feature attributes grid
            {
            	name:"name", 
            	value:"string"
            },
            {
            	name:"value", 
            	value:"string"
            }
        ]
	}); 
	featureAttributesStore.load();	// necessary for memory proxy?
	//
	// TODO: check how store manager Ext.StoreMgr works
	//	
	featureAttributesGrid = new Ext.grid.EditorGridPanel({
		id: "featureAttributesGrid",
        //title: "Feature Attributes",
        store: featureAttributesStore,
        // TODO: check the use of autoExpandColumn for column model
        cm: new Ext.grid.ColumnModel([
            {
            	id: "Field", 
            	header: "Field", 
            	dataIndex: "name", 
            	sortable: true,
            	editor: new Ext.form.TextField({})
            },
            {
            	id: "Value", 
            	header: "Value", 
            	dataIndex: "value", 
            	sortable: true,
            	editor: new Ext.form.TextField({})
            },            
        ]),
        sm: new Ext.grid.RowSelectionModel({singleSelect:true})        
    });
	
	// feature grid window
	featureAttributesWindow = new Ext.Window({
        title: "Features Attributes",
        layout: "fit",
        height: 300,
        width: 200,
        closable: false,			//
        collapsible: true,
        collapseMode: "mini",	//
        x: 300,					// x position of the left edge of the window on initial showing
        y: 150,					// y position of the top edge of the window on initial showing
        items: [
            featureAttributesGrid       
        ],
        bbar: [
               {
   		    	text: 'Save',     	
   		        //pressed: false,        
   		        //enableToggle: true,
   		    	handler: function(button) {
   		    		// manually save/synchronize changes in feature attributes grid
   		    		//   to associated feature properties
   		    		OpenLayers.Console.debug("...save changes...");
   		    		var modifiedAttributes = featureAttributesStore.getModifiedRecords();
   		    		//var mfid = featureAttributesStore.proxy.data[0].value;
   		    		var mfid = getAttributeValueFromMemoryProxyArray('fid', featureAttributesStore.proxy.data);
   					var mf = featureStore.layer.getFeatureByFid(mfid);
   		    		if(modifiedAttributes.length > 0) {
   		    			//var originalData = featureAttributesStore.proxy.data;
   		    			Ext.each(
   		    				modifiedAttributes,
   		    				function(record) {
   		    					// TODO: better way to find feature to save change
   		    					//var mfid = featureAttributesStore.proxy.data[0].value; 
   		    					//var mf = featureStore.layer.getFeatureByFid(mfid);
   		    					mf.attributes[record.get("name")] = record.get("value"); 
   		    				}
   		    			);
   		    			var grid = Ext.getCmp("featureAttributesGrid");
   		    			grid.stopEditing();
   		    			featureAttributesStore.commitChanges();
   		    			var a = 0;
   		    		}
   		    		// TODO: save changes using a customized two-way MemoryProxy and DataWriter
   		    		//
   		    	}
   		    },
   		    "-",
   		    {
   		    	text: 'Discard',     			        
   		    	handler: function(b) {
   		    		// manually discard changes in feature attributes grid
   		    		OpenLayers.Console.debug("...reject changes...");
   		    		featureAttributesStore.rejectChanges();
   		    	}
   		    }
   		]
    }).show();	
	
	// =====================================================================================
	// toolbar and toolbar panel
	// =====================================================================================	
	
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
    toolbarItems.push(zoomToMaxAction);
    toolbarItems.push("-"); // looks like a separator or something
    
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
    toolbarItems.push(navigationAction);
    toolbarItems.push("-");
    
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
    toolbarItems.push({
    	text: 'Search Results',     	
        pressed: false,        
        enableToggle: true,
    	handler: function(b) {
    		if(b.pressed == true) {
    			featureWindow.show();
    		} else {
    			featureWindow.hide();
    		}
    		
    	}
    });
    
    // button to execute the WPS process
    toolbarItems.push("-");
    toolbarItems.push({
    	text: 'WPS',     	                      
    	handler: function(b) {
    		executeWcs2Polygons();
    	}
    });
    
	/*
    toolbarPanel = new Ext.Panel({
    	title: "Toolbar",
    	layout: "fit",
    	region: "north",
    	collapsible: true,		//
		collapseMode: "mini",	//
		tbar: toolbarItems
    });
    */
    toolbarWindow = new Ext.Window({
        //title: "Toolbar",
        layout: "fit",
        //height: 200,
        width: 764,
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
