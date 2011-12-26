/**
 * Copyright (c) 2008-2011 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/**
 * @requires GeoExt/widgets/tree/LayerContainer.js
 */
Ext.namespace("GeoExt.tree");

/** api: (define)
 *  module = GeoExt.tree
 *  class = ProcessLayerContainer
 */

/** api: (extends)
 * GeoExt/widgets/tree/LayerContainer.js
 */

/** api: constructor
 * .. class:: ProcessLayerContainer
 * 
 *     A layer container that will collect all process layers of an OpenLayers
 *     map.
 * 
 *     To use this node type in ``TreePanel`` config, set nodeType to
 *     "gx_processlayercontainer".
 */
GeoExt.tree.ProcessLayerContainer = Ext.extend(GeoExt.tree.LayerContainer, {
    /** private: property[text]
     *  ``String`` The text for this node.
     */
    text: 'Tools',    

    /** private: method[constructor]
     *  Private constructor override.
     */
    constructor: function(config) {
        config = Ext.applyIf(config || {}, {
            text: this.text
        });                                
        config.loader = Ext.applyIf(config.loader || {}, {
            filter: function(record){
                var layer = record.getLayer();
                if(layer instanceof OpenLayers.Layer.Process) {                	
                	// TODO: do something with the process layer if necessary
                	return true;
                } else {
                	return false;
                }                              
            }            
        });                 
        GeoExt.tree.ProcessLayerContainer.superclass.constructor.call(this, config);        
    }
});

GeoExt.tree.ProcessLayerTreeNodeUIEventMixin = function(options){
    return {        
    	
        constructor: function(node) {            
            node.addEvents(

                /** api: event[rendernode]
                 *  Fires on the tree when a node is rendered.
                 *
                 *  Listener arguments:
                 *  
                 *  * node - ``Ext.TreeNode`` The rendered node.
                 */
                "rendernode",

                /** api: event[rawclicknode]
                 *  Fires on the tree when a node is clicked.
                 *
                 *  Listener arguments:
                 *  
                 *  * node - ``Ext.TreeNode`` The clicked node.
                 *  * event - ``Ext.EventObject`` The click event.
                 */
                "rawclicknode"                
            );
            this.superclass = arguments.callee.superclass;
            this.superclass.constructor.apply(this, arguments);
            
        },
        
        /** private: method[render]
         *  :param bulkRender: ``Boolean``
         */
        render: function(bulkRender) {
            if(!this.rendered) {
                this.superclass.render.apply(this, arguments);
                this.fireEvent("rendernode", this.node);
            }
        },
        
        /** private: method[onClick]
         *  :param e: ``Ext.EventObject``
         */
        onClick: function(e) {
            if(this.fireEvent("rawclicknode", this.node, e) !== false) {
                this.superclass.onClick.apply(this, arguments);
            }
        },        
        
        onDblClick: function(e) {
            //OpenLayers.Console.debug("...constructs the editor panel for the process...");
            // NOTE: the tree node that is clicked can be accessed through this.node
            // TODO: get process identifier from node.layer or node.layer.name            
            if(this.node.layer) {
            	var pLayer = this.node.layer;
            	var pLayerId = pLayer.processIdentifier || pLayer.name;
            	//OpenLayers.Console.debug("...process identifier: " + pId + "...");
            	var cachedStores = this.options.stores || {};
            	var pStore = cachedStores[pLayerId]; 
            	if(!pStore) {
            		OpenLayers.Console.debug("...wps processdescription store doeesn't exists...create new...");
            		pStore = new GeoExt.data.WPSProcessDescriptionStore({            		    	
        		    	// TODO: need a better approach to assemble the describeprocess request
        				// TODO: detect if the url ends with "?" and adjust accordingly
        				url: pLayer.describeProcessUrl + "service=WPS&version=1.0.0&request=DescribeProcess&identifier=" + pLayerId 
        		    });
            		cachedStores[pLayerId] = pStore;
            	} else {
            		OpenLayers.Console.debug("...wps processdescription store exists...use cache...");
            	}            	
            	// load wps description
            	var pDescWndX = e.xy[0];
            	var pDescWndY = e.xy[1];
            	// clean up layer process's input and output             	
            	pLayer.process.cleanupDataInput();
            	pLayer.process.cleanupDataOutput();
            	//
            	pStore.on(
        		    "load",
        		    function(records) {
        		    	// create Ext.grid.EditorGridPanel
        	    	    var grid = new Ext.grid.EditorGridPanel({
        	    	        id: pLayerId + "_EditorGridPanel",
        	    	    	//title: "WPS Process Description",
        	    	        store: pStore,        	    	        
        	    	        cm: pStore.getEditorGridColumnModel(),                	    	        
        	    	        listeners: {
        	    	        	//cellcontextmenu: function(view, cell, cellIdx, record, row, rowIdx, evtObj) {
        	    	        	cellcontextmenu: function(editorGrid, rowIdx, cellIdx, evtObj) { 
        	    	        		// stop propogating the event
        	    	        		evtObj.stopEvent();
        	    	        		// what type and datatype is this input/output parameter?
        	    	        		var type = editorGrid.getStore().getAt(rowIdx).get("type");
        	    	        		var dataType = editorGrid.getStore().getAt(rowIdx).get("datatype");        	    	        		
        	    	        		if(!editorGrid.rowCtxMenu) {
        	    	        			//if() {	// if it is cell 'Value' AND if it is 'ComplexData' or 'ComplexOutput'
        	    	        				editorGrid.rowCtxMenu = new Ext.menu.Menu({
        	    	        					id: "rowCtxMenu",
        	    	        					items:[
													{
														text: "Set Input/Output Value",
														handler: function() {                                    		
															// available layers from map to select as input/output
															var map = pLayer.map;
															var vLyrList = [];        	           
															
															var ctxSelectedCell = editorGrid.getSelectionModel().getSelectedCell();
													    	// selectedCell[0] is idx of selected row; selectedCell[1] is idx of selected col 
													    	var ctxParamRecord = editorGrid.getStore().getAt(ctxSelectedCell[0]);
													    	var ctxParamId = ctxParamRecord.get("identifier");
													    	var ctxParamType = ctxParamRecord.get("type");
													    	var ctxParamDataType = ctxParamRecord.get("datatype");
													    	
													    	// add map layers into a select list as candidate WPS input 
													    	//   add layer object itself for all vector layers
													    	//	 add layer url or else for WMS or other image/tile layer
													    	for(var i=0; i<pLayer.map.layers.length; i++) {                            	                    		
													    		if(pLayer.map.layers[i] instanceof OpenLayers.Layer.WMS) {
													    			// WMS layer
													    			vLyrList.push([vLyrList.length+1, pLayer.map.layers[i].name, pLayer.map.layers[i].url]);
													    		} else if(pLayer.map.layers[i] instanceof OpenLayers.Layer.Vector) {
													    			// Vector layer
																	vLyrList.push([vLyrList.length+1, pLayer.map.layers[i].name, pLayer.map.layers[i]]);
																} else {
																	// TODO: add other types of layer
																}
															}                            	                    	
															/*if(ctxParamType != "LiteralData") {
																//OpenLayers.Console.debug("...complex input/output populate layers list...");
																for(var i=0; i<pLayer.map.layers.length; i++) {
													    			if(pLayer.map.layers[i] instanceof OpenLayers.Layer.Vector) {        	                                    				
													    				vLyrList.push([vLyrList.length+1, pLayer.map.layers[i].name, pLayer.map.layers[i]]);
													    			}
													    		}
															} else {
																//OpenLayers.Console.debug("...literal input/output don't populate layers list...");
																// TODO: some hard code value for test
																var wcsUrl = "http://alexandertown0:6080/arcgis/services/haiti/MapServer/WCSServer?coverage=1";
																vLyrList.push([vLyrList.length+1, wcsUrl, wcsUrl]);
															}*/        	                                    		
															if(this.pParamWnd) {
																this.pParamWnd.close();
														    	this.pParamWnd.destroy();
														    	this.pParamWnd = null;        	    	    	
														    }                    	                                    		
															this.pParamWnd = new Ext.Window({
														        id: pLayerId + "_paramWnd",
																title: "WPS Input/Output Parameters",
														        layout: "fit",
														        //height: 100,
														        width: 300,
														        closable: true,			//
														        collapsible: true,
														        collapseMode: "mini",	//
														        x: evtObj.xy[0],
														        y: evtObj.xy[1],
														        // use Ext.form.ComboBox
														        items: [
														            {    	            	
														            	xtype: "combo",				// xtype for Ext.form.ComboBox    	
														            	typeAhead: true,			// auto complete the remainder when typing in
														            	typeAheadDelay: 500,		// the delay of auto complete in milliseconds
														                triggerAction: 'all',		
														                lazyRender:true,		
														                mode: 'local',			
														            	store: new Ext.data.ArrayStore({
													            		    id: 0,
													            		    fields: [
													            		        'id',
													            		        'name',
													            		        'value'
													            		    ],
													            		    data: vLyrList
													            		}),
														            	valueField: 'id',
														                displayField: 'name',
														                enableKeyEvents: true,
														                listeners:{
														                    'select': function(combo, record, index) {        	                                    	                    	        	                                    	                    	
														                    	
														                    	var selectedCell = editorGrid.getSelectionModel().getSelectedCell();
														                    	// selectedCell[0] is idx of selected row; selectedCell[1] is idx of selected col 
														                    	var paramRecord = editorGrid.getStore().getAt(selectedCell[0]);
														                    	var paramId = paramRecord.get("identifier");
														                    	var paramType = paramRecord.get("type");
														                    	var paramDataType = paramRecord.get("datatype");
														                    	var paramLyrName = record.get("name");
														                    	
														                    	
														                    	if(paramType == "LiteralData") {
														                    		var paramValue = record.get("value");
														                    		pLayer.process.addDataInput({
														                    			identifier: paramId,
														                    			//title: "",
														                    			//'abstract': "",
														                    			type: "LiteralData",
														                    			options: {
														                    				dataType: paramDataType,			
														                    				literalData: paramValue	// 
														                    			}
														                    		});
														                    	} else if(paramType == "LiteralOutput") {
														                    		// TODO:
														                    	} else if(paramType == "ComplexData") {        	                                    	                    		
														                    		// TODO: support vector features and raster as ComplexData input
														                    		// TODO: choose between different complex data types (GML, GeoJSON, KML etc.) based on paramDataType
														                    		//		   now it's only limited to vector GML        	                                    	                    		        	                                    	                    		        	                                    	                    		
														                    		var input_encoder;
														                    		var complexDataRoot;
														                    		var complexDataSchema;
														                    		
														                    		var paramLyr = record.get("value");
														                    		if(paramLyr.protocol && paramLyr.protocol.format) {
														                    			input_encoder = paramLyr.protocol.format;
														                    			input_encoder.writers['wfs']['FeatureCollection'] = OpenLayers.Format.GML.v3.prototype.writers['wfs']['FeatureCollection'];
														                    			complexDataRoot = "wfs:FeatureCollection";
														                    			complexDataSchema = paramLyr.protocol.format.schema;        	                                    	                    			
														                    		} else {
														                    			// use GML default encoder
														                    			input_encoder = new OpenLayers.Format.GML.v3({ 
														                    				srsName: paramLyr.map.projection,	// always go with map's projection                            	        	       		    					 		
													   		    					 		featureType: "feature",			// default featureType is "feature"     					
													   		    					 		geometryName: "Shape",				// default geometryName is "geometry"                            	        	       		    					 		
													   		    					 		featureNS: "http://www.esri.com",	// hard code as http://www.esri.com
													   		    					 		featurePrefix: "esri",  				// hard code as esri                            	        	       		    					 		
													   		    					 		xy: true	// no axis reverse for EPSG:3857 
														                    			});
														                    			//input_encoder.writers['wfs']['FeatureCollection'] = OpenLayers.Format.GML.v3.prototype.writers['wfs']['FeatureCollection'];
														                    			complexDataRoot = "wfs:FeatureCollection";
														                    			complexDataSchema = "http://schemas.opengis.net/gml/3.1.1/base/gml.xsd";
														                    		}        	                                    	                    		
														                    		pLayer.process.regDataInputEncoder(paramId, input_encoder);
														                    		OpenLayers.Console.debug("...add complex wps input...");
														                    		pLayer.process.addDataInput({
														                    			identifier: paramId,        	                                    	                    			
														                    			type: "ComplexData",
														                    			options: {
														                    				schema: complexDataSchema,	// TODO:
														                    				encoding: "UTF-8",	// TODO:
														                    				mimeType: paramDataType,        	                                    	                    				
														                    				complexData: paramLyr.features,
														                    				encodeComplexData: true,
														                    				complexDataRoot: complexDataRoot	// TODO: can not hard code this
														                    			}
														                    		});
														                    	} else if(paramType == "ComplexOutput") {
														                    		var output_parser;
														                    		var paramLyr = record.get("value");
														                    		if(paramLyr.protocol && paramLyr.protocol.format) {
														                    			output_parser = paramLyr.protocol.format;
														                    			// temporary fix for GML3 parser
														                    			output_parser.readers['wfs']['FeatureCollection'] = OpenLayers.Format.GML.v3.prototype.writers['wfs']['FeatureCollection'];
														                    		} else {
														                    			// TODO: set default encoder based param "datatype"
														                    		}
														                    		pLayer.process.regDataOutputParser(paramId, output_parser);
														                    		pLayer.process.addDataOutput({
														                    			identifier: paramId,        	                                    	                    			
														                    			type: "ResponseDocument", 
														                    			options: {
														                    				//schema: "",	// TODO:
														                    				//encoding: "UTF-8",	// TODO:
														                    				//mimeType: "text/xml",	// TODO:			
														                    				asReference: true
														                    			}
														                    		});
														                    		// push callback to handle execute result        	                                    	                    		
														                    		
														                    		pLayer.process.callbacks.push(
														                    		    function(executeResponse) {	// callback to handle <wps:ExecuteResponse>
													    	       		    			    //OpenLayers.Console.debug("...callback is called...");		    					        	       		    			    	        	       		    			    	
													    	       		    			    // TODO: search for processoutput based on paramId
														                    		    	//         now it's assuming only one output
														                    		    	// TODO: deal with different types of complex output
														                    		    	//		   now it's assuming vector in GML only 
														                    		    	// TODO: the execute results may also embedded into the response
														                    		    	// 		   now it's assuming by result by url reference
														                    		    	// 
														                    		    	var resp_url = executeResponse.processoutputs[0].data.complexData[0];        	       		    			    	
														       		    			    	//
														                    		    	OpenLayers.loadURL(
														       		    			    		resp_url,
														       		    			    		{},
														       		    			    		this,
														       		    			    		function(request) {	// onSucceeded
														       		    			    			var doc = request.responseXML;
														       		    					        if(!doc || !doc.documentElement) {
														       		    					            doc = request.responseText;
														       		    					        }        	       		    					        	        	       		    					        	                                        	       		    					            	                                        	       		    					        
														       		    					        // TODO: deal with features or images from execute result
														       		    					        // TODO: in case of features
														       		    					        var output_parser = new OpenLayers.Format.GML.v3({    	                                	        	       		    					 		
														       		    					        	//srsName: paramLyr.map.projection,	// always go with map's projection
													    	       		    					 		// since featureType name in GML returned by WPS is unknown
													    	       		    					 		//   we will have to use "*" as a wildcard for all different featureType names
													    	       		    					 		//   this requires a fix in OpenLayers.Format.GML.v3.Base reader to handle the generic case
													    	       		    					 		featureType: "*",    					
													    	       		    					 		//geometryName: "Shape",	// not necessary, GML reader can guess
													    	       		    					 		// since the featureType namespace and prefix in GML returned by WPS is unknown
													    	       		    					 		//   we will have to use "*" as a wildcard for all different featureType names
													    	       		    					 		//	 this requires a fix in OpenLayers.Format.XML readNode to handle the generic case
													    	       		    					 		//featureNS: "*",			
													    	       		    					 		//featurePrefix: "*",  
													    	       		    					 		// whether to parse attributes and what subset of attributes to parse
													    	       		    					 		extractAttributes: true,    	                                	        	       		    					 		
													    	       		    					 		attributes: {
													    	       		    					 			//'OBJECTID': true
													    	       		    					 		},
													    	       		    					 		xy: true	// no axis reverse for EPSG:3857    											
													    	       		    					 	});
														       		    					        // another option for unknown namespace is to register all possbile namespace uri with "feature" reader
														       		    					        output_parser.setNamespace("feature", "http://www.esri.com");
														       		    					        // GML from WPS usually comes back as <wfs:FeatureCollection>, so mixin the WFST.v1.prototype.readers['wfs']['FeatureCollection'];
														       		    					        output_parser.readers['gml']['FeatureCollection'] = OpenLayers.Format.WFST.v1.prototype.readers['wfs']['FeatureCollection'];
														       		    					        var extracted_features = output_parser.read(doc);				        				           	       		    					        
														       		    					        //OpenLayers.Console.debug("..." + extracted_features.length + " features are parsed...");
														       		    					        paramLyr.addFeatures(extracted_features);    	                                        	       		    					        
														       		    					        // TODO: in case of image
														       		    			    		},
														       		    			    		function(request) {	// onFailed
														       		    			    			// TODO: error handling
														       		    			    		}
														       		    			    	);        	                                        	       		    			    
													    	       		    			} 	
														                    		);        	                                    	                    		
														                    		//
														                    	} else {
														                    		// TODO:
														                    	}
														                    	// update UI
														                    	paramRecord.beginEdit();
														                    	paramRecord.set("value", paramLyrName);
														                    	paramRecord.endEdit();
														                    	// get pParamWnd by id
														                    	Ext.getCmp(pLayerId + "_paramWnd").close();
														                    },
														                    //'change': function(field, newValue, oldValue) {},        	                                    	                    
														                    'keypress': function(field, evtObj) {
														                    	if(evtObj.keyCode == 13) { // check if 'enter' is pressed
														                    		var selectedCell = editorGrid.getSelectionModel().getSelectedCell();
													    	                    	
														                    		// selectedCell[0] is idx of selected row; 
														                    		// selectedCell[1] is idx of selected col 
													    	                    	var paramRecord = editorGrid.getStore().getAt(selectedCell[0]);
													    	                    	
													    	                    	var paramId = paramRecord.get("identifier");
													    	                    	var paramType = paramRecord.get("type");
													    	                    	var paramDataType = paramRecord.get("datatype");            	                                    	                    	
													    	                    	if(paramType == "LiteralData") {
													    	                    		OpenLayers.Console.debug("...add literal wps input..." + field.lastQuery);
													    	                    		pLayer.process.addDataInput({
													    	                    			identifier: paramId,
													    	                    			//title: "",
													    	                    			//'abstract': "",
													    	                    			type: "LiteralData",
													    	                    			options: {
													    	                    				dataType: paramDataType,			
													    	                    				literalData: field.lastQuery
													    	                    			}
													    	                    		});
													    	                    	} else if(paramType == "LiteralOutput") {
													    	                    		// TODO:
													    	                    	}           	                                    	                    	        	                                    	                    	
													    	                    	// update UI
													    	                    	paramRecord.beginEdit();
													    	                    	paramRecord.set("value", field.lastQuery);
													    	                    	paramRecord.endEdit();        	                                    	                    		
													    	                    	Ext.getCmp(pLayerId + "_paramWnd").close();
														                    	}	        	                                    	                    		        	                                    	                    		
														                    }
														               }
														            }
														        ]
														    });                                    		
															this.pParamWnd.show();        	                                    		
														}
													},
													{
														text: "Print Input/Output Value",
														handler: function() {
															// TODO:
														}
													},
													{
														text: "Clear Input/Output Value",
														handler: function() {                                    		
															// TODO:
														}
													}       
        	    	        					]
        	    	        				});
        	    	        			//}
        	    	        		}
        	    	        		//OpenLayers.Console.debug("rowId: " + rowIdx);
        	    	        		editorGrid.getSelectionModel().select(rowIdx, cellIdx);
        	    	        		editorGrid.rowCtxMenu.showAt(evtObj.getXY());
        	    	        	}
        	    	        }
        	    	    });    
        	    	    // TODO: ?? can this window be a global one shared by different grid ??
        	    	    // TODO: ?? another option is how to destroy a window everytime when it is closed 
        	    	    if(this.pDescWnd) {
        	    	    	this.pDescWnd.close();
        	    	    	this.pDescWnd.destroy();
        	    	    	this.pDescWnd = null;        	    	    	
        	    	    }         	    	    
        	    	    // this displays the grid panel wnd where you dbl click
        	    	    var x = pDescWndX;
        	    	    var y = pDescWndY;
        	    	    // TODO: determine where the layer tree wnd is locate
        	    	    //   show grid panel wnd next to it
        	    	    
        	    	    this.pDescWnd = new Ext.Window({
        	    	        title: pLayerId,
        	    	        layout: "fit",
        	    	        height: 256,
        	    	        width: 640,
        	    	        closable: true,			//
        	    	        collapsible: false,
        	    	        collapseMode: "mini",	//
        	    	        bodyStyle:{
        	    	        	'background': "transparent"
        	    	        	//'opacity': '0.1'        	    	        
        	    	        },
        	    	        x: pDescWndX,
        	    	        y: pDescWndY,
        	    	        items: [
        	    	            grid       
        	    	        ],
        	    	        bbar:[{
        	    	        	text: 'Execute WPS Process',
        	    	        	handler: function(button) {
        	       		    		//OpenLayers.Console.info("...execute WPS process: " + pLayerId + "...");
        	       		    		//        	       		    		
        	       		    		pLayer.process.execute({        	       		    			        	       		    			
        	       		    			isRawDataOutput: false,
        	       		    			callbacks:[]	// additional callbacks if necessary
        	       		    		});        	       		    		
        	       		    	}
        	    	        }]
        	    	    });
    	    	    	this.pDescWnd.show();        	    	    
        		    },
        		    this,
        		    {        		    	
        		    	// TODO: how to pass in more options to handler        		    	
        		    }
        		);
            	pStore.load();                     
            }            
            // TODO: create wps process description store
                        
        },
        
        /**
         * 
         */
        options: options,
        /**
         * 
         */
        pDescWnd: null,
        /**
         * 
         */
        pParamWnd: null
    };
};

/**
 * NodeType: gx_processlayercontainer
 */
Ext.tree.TreePanel.nodeTypes.gx_processlayercontainer = GeoExt.tree.ProcessLayerContainer;
