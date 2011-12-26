/*
 * @include GeoExt/data/WPSProcessDescriptionReader.js
 */

/** api: (define)
 *  module = GeoExt.data
 *  class = WPSProcessDescriptionStore
 *  base_link = `Ext.data.Store <http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.Store>`_
 */
Ext.namespace("GeoExt.data");

/** api: constructor
 *  .. class:: WPSProcessDescriptionStore
 *  
 *      Small helper class to make creating stores for remote WPS process description
 *      easier.  The store is pre-configured with a built-in
 *      ``Ext.data.HttpProxy`` and :class:`GeoExt.data.WPSProcessDescriptionReader`.
 *      The proxy is configured to allow caching and issues requests via GET.
 *      If you require some other proxy/reader combination then you'll have to
 *      configure this with your own proxy and configure as needed.
 */

/** api: config[format]
 *  ``OpenLayers.Format``
 *  A parser for transforming the XHR response into an array of objects
 *  representing attributes.  Defaults to an ``OpenLayers.Format.WPSCommon``
 *  parser.
 */

/** api: config[fields]
 *  ``Array | Function``
 *  Either an Array of field definition objects as passed to
 *  ``Ext.data.Record.create``, or a record constructor created using
 *  ``Ext.data.Record.create``.  Defaults to ````. 
 */
GeoExt.data.WPSProcessDescriptionStore = function(c) {
    c = c || {};
    GeoExt.data.WPSProcessDescriptionStore.superclass.constructor.call(
        this,
        Ext.apply(c, {
            proxy: c.proxy || (!c.data ?
                new Ext.data.HttpProxy({url: c.url, disableCaching: false, method: "GET"}) :
                undefined
            ),
            reader: new GeoExt.data.WPSProcessDescriptionReader(
                c, c.fields
            )
        })
    );
};



Ext.extend(GeoExt.data.WPSProcessDescriptionStore, Ext.data.Store, {
	//
	map: null,	
	/**
	 * 
	 */
	/*paramTypeToEditor: {
		// generic data types	
		'xs:long': 		"NumberField",
		'xs:double': 	"NumberField",		
		'xs:string': 	"TextField",
		'xs:date': 		"DateField",
		'xs:boolean': 	"Checkbox",
		'long': 		"NumberField",
		'double': 		"NumberField",		
		'string': 		"TextField",
		'date': 		"DateField",
		'boolean': 		"Checkbox",
		//
		// GeoServer specific mimeTypes
		'text/xml; subtype=wfs-collection/1.0': 		"Combo_Vector_Layers",
		'text/xml; subtype=wfs-collection/1.1': 		"Combo_Vector_Layers",
		'application/wfs-collection-1.0': 				"Combo_Vector_Layers",
		'application/wfs-collection-1.1': 				"Combo_Vector_Layers",
		'application/json': 							"Combo_Vector_Layers"	
		// ArcGIS Server specific mimeTypes				
	},*/		
	
	/**
	 * 
	 */
	getEditorGridColumnModel: function() {		
		var columns = [];
		/*this.each(
			function(record) {
				// do something based on different records
			},
			this
		);*/		
		var columnModel = new Ext.grid.ColumnModel([
	        { header:"Identifier", dataIndex:"identifier", sortable:true },
            { header:"Type", dataIndex:"type", sortable:true },
            { header:"DataType", dataIndex:"datatype", sortable:true },
            { header:"Direction", dataIndex:"direction", sortable:true },
            { 
            	header:"Value", 
            	dataIndex:"value", 
            	sortable:true
            	//editor: new Ext.form.TextField({})
            }
        ]);
		return columnModel;
	}
	
});
