/**
 * @include GeoExt/data/ProcessRecord.js
 */

/** api: (define)
 *  module = GeoExt.data
 *  class = WPSCapabilitiesReader
 *  base_link = `Ext.data.DataReader <http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.DataReader>`_
 */
Ext.namespace("GeoExt.data");

/** api: constructor
 *  .. class:: WPSCapabilitiesReader(meta, recordType)
 *  
 *      :param meta: ``Object`` Reader configuration.
 *      :param recordType: ``Array | Ext.data.Record`` An array of field
 *          configuration objects or a record object.  Default is
 *          :class:`GeoExt.data.ProcessRecord`.
 *   
 *      Data reader class to create an array of
 *      :class:`GeoExt.data.ProcessRecord` objects from a WPS GetCapabilities
 *      response.
 */
GeoExt.data.WPSCapabilitiesReader = function(meta, recordType) {
    meta = meta || {};
    if(!meta.format) {
        meta.format = new OpenLayers.Format.WPSCommon();	// WPSCommon format
    }
    if(!(typeof recordType === "function")) {
        recordType = GeoExt.data.ProcessRecord.create(
            recordType || meta.fields || [
                {name: "identifier", type: "string"},
                {name: "title", type: "string"},
                {name: "abstract", type: "string"},
            ]
        );
    }
    GeoExt.data.WPSCapabilitiesReader.superclass.constructor.call(
        this, meta, recordType
    );
};

Ext.extend(GeoExt.data.WPSCapabilitiesReader, Ext.data.DataReader, {

    /** private: method[read]
     *  :param request: ``Object`` The XHR object which contains the parsed XML
     *      document.
     *  :return: ``Object`` A data block which is used by an ``Ext.data.Store``
     *      as a cache of ``Ext.data.Record`` objects.
     */
    read: function(request) {
        var data = request.responseXML;
        if(!data || !data.documentElement) {
            data = request.responseText;
        }
        return this.readRecords(data);
    },

    /** private: method[readRecords]
     *  :param data: ``DOMElement | String | Object`` A document element or XHR
     *      response string.  As an alternative to fetching capabilities data
     *      from a remote source, an object representing the capabilities can
     *      be provided given that the structure mirrors that returned from the
     *      capabilities parser.
     *  :return: ``Object`` A data block which is used by an ``Ext.data.Store``
     *      as a cache of ``Ext.data.Record`` objects.
     *  
     *  Create a data block containing Ext.data.Records from an XML document.
     */
    readRecords: function(data) {
        if(typeof data === "string" || data.nodeType) {
            data = this.meta.format.read(data);
        }
        
        var processOfferings = data.processOfferings;
        var fields = this.recordType.prototype.fields;
        
        var processOffering, values, field, v, values;
        var processOptions;
        var records = [];
        
        for(var i=0;i<processOfferings.length; i++) {
        	processOffering = processOfferings[i];
        	if(processOffering.identifier) {
        		values = {};
                for(var j=0; j<fields.length; j++) {
                    field = fields.items[j];
                    v = processOffering[field.mapping || field.name] ||
                        field.defaultValue;
                    v = field.convert(v);
                    values[field.name] = v;
                }
                processOptions = {
                	//map: null,
                	identifier: processOffering.identifier,
                	// TODO: extract the HTTP POST url for Execute from GetCapabilities response
                	//   hard coded right now
                	//url: "http://localhost:8080/geoserver/wps" 
                	url: data.operationsMetadata.Execute.dcp.http.post
                };
                if(this.meta.processOptions) {
                    Ext.apply(processOptions, this.meta.processOptions);
                }
                values.process = new OpenLayers.Process.WPS(processOptions);
                records.push(new this.recordType(values, values.process.identifier));
        	}
        }               
        return {
            totalRecords: records.length,
            success: true,
            records: records
        };
    }
});
