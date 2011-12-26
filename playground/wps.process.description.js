var wpsCapabilitiesStore;
var fakeLayerListStore = new Ext.data.ArrayStore({
    id: 0,
    fields: [
        'id',
        'name'
    ],
    data: [[1, '@point.vector.layer'], [2, '@polyline.vector.layer'], [3, '@polygon.vector.layer']]
});
var selectedRowId = 0;

Ext.onReady(function() {   
	// set the proxy url for corss-domain calls
	OpenLayers.ProxyHost= function(url) {
		return "/opengeo.geoext/ApacheProxyServlet?url=" + url;
    };	
    // create a new WPS process description store
    wpsProcessDescriptionStore = new GeoExt.data.WPSProcessDescriptionStore({
    	// url must be a request to a single WPS process description
    	//url: "http://char:8080/geoserver/wps?service=WPS&version=1.0.0&request=DescribeProcess&identifier=gt:BufferFeatureCollection"
    	url: "http://sazabiii:6080/arcgis/services/regression.advanced.services/GPServer/WPSServer?service=WPS&version=1.0.0&request=DescribeProcess&identifier=clip"
    });
    // load the store with records derived from the doc at the above url
    wpsProcessDescriptionStore.load();
    wpsProcessDescriptionStore.on(
    	"load",
    	function(records) {
    		OpenLayers.Console.debug("...initialize Ext.grid.EditorGridPanel...");   
    		    		    		
    		// create a grid to display records from the store
    	    var grid = new Ext.grid.EditorGridPanel({
    	        id: "wpsDescEditorGridPanel",
    	    	title: "WPS Process Description",
    	        store: this,
    	        cm: this.getEditorGridColumnModel(),        
    	        renderTo: "grid",
    	        height: 300,
    	        width: 650,
    	        listeners: {    	        	
    	            //rowdblclick: function(record){},
    	        	cellcontextmenu: function(editorGrid, rowIdx, cellIdx, evtObj) {    	        		
    	        		evtObj.stopEvent();
    	        		// what type and datatype is this input/output parameter?
    	        		var type = editorGrid.getStore().getAt(rowIdx).get("type");
    	        		var dataType = editorGrid.getStore().getAt(rowIdx).get("datatype");
    	        		OpenLayers.Console.info("select row: " + rowIdx);
    	        		selectedRowId = rowIdx;
    	        		//
    	        		if(!editorGrid.rowCtxMenu) {
    	        			//if() {	// if it is cell 'Value' AND if it is 'ComplexData' or 'ComplexOutput'
    	        				editorGrid.rowCtxMenu = new Ext.menu.Menu([
                                    {
                                    	text: "Set Input/Output Value",
                                    	handler: function() {                                    		
                                    		var paramWindow = new Ext.Window({
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
                                    	            	store: fakeLayerListStore,
                                    	            	valueField: 'id',
                                    	                displayField: 'name',
                                    	                listeners:{
                                    	                    //scope: this,
                                    	                    'select': function(combo, record, index) {
                                    	                    	OpenLayers.Console.info("set row: " + selectedRowId);
                                    	                    	var record = editorGrid.getStore().getAt(selectedRowId);
                                    	                    	record.beginEdit();
                                    	                    	record.set("value", "@@@");
                                    	                    	record.endEdit();                                    	                    	
                                    	                    }
                                    	               }
                                    	            }
                                    	        ]
                                    	    });                                    		
                                    		paramWindow.show();
                                    		OpenLayers.Console.debug("...set input/output value...");
                                    	}
                                    },
                                    {
                                    	text: "Print Input/Output Value",
                                    	handler: function() {
                                    		var value = editorGrid.getStore().getAt(selectedRowId).get("value");
                                    		OpenLayers.Console.info("current value: " + value);
                                    	}
                                    },
                                    {
                                    	text: "Clear Input/Output Value",
                                    	handler: function() {                                    		
                                    		OpenLayers.Console.debug("...clear input/output value...");
                                    	}
                                    }
                                ]);
    	        			//}
    	        		}
    	        		editorGrid.getSelectionModel().select(rowIdx, cellIdx);
    	        		editorGrid.rowCtxMenu.showAt(evtObj.getXY());
    	        	}
    	        }
    	    });
    	}
    );    
});
