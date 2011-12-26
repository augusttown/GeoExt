var wpsCapabilitiesStore;

Ext.onReady(function() {   
	// set the proxy url for corss-domain calls
	OpenLayers.ProxyHost= function(url) {
		return "/opengeo.geoext/ApacheProxyServlet?url=" + url;
    };	
    // create a new WPS capabilities store
    wpsCapabilitiesStore = new GeoExt.data.WPSCapabilitiesStore({
        url: "http://sazabiii:6080/arcgis/services/regression.basic.services/GPServer/WPSServer?service=WPS&version=1.0.0&request=GetCapabilities"
    	//url: "http://char:8080/geoserver/wps?service=WPS&version=1.0.0&request=GetCapabilities"
    });
    // load the store with records derived from the doc at the above url
    wpsCapabilitiesStore.load();

    // create a grid to display records from the store
    var grid = new Ext.grid.GridPanel({
        title: "WPS Capabilities",
        store: wpsCapabilitiesStore,
        columns: [
            {header:"Identifier", dataIndex:"identifier", sortable:true},
            {header:"Tile", dataIndex:"title", sortable:true},
            {header:"Abstract", dataIndex:"abstract", sortable:true},            
        ],        
        renderTo: "grid",
        height: 300,
        width: 650,
        listeners: {
            rowdblclick: function(record){
            	OpenLayers.Console.debug("...display information on selected process...");                        	
            }
        }
    });
});
