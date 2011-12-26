/**
 * @include GeoExt/data/ProcessParamRecord.js
 */

/** api: (define)
 *  module = GeoExt.data
 *  class = WPSProcessDescriptionReader
 *  base_link = `Ext.data.DataReader <http://dev.sencha.com/deploy/dev/docs/?class=Ext.data.DataReader>`_
 */
Ext.namespace("GeoExt.data");

/** api: constructor
 *  .. class:: WPSProcessDescriptionReader(meta, recordType)
 *  
 *      :param meta: ``Object`` Reader configuration.
 *      :param recordType: ``Array | Ext.data.Record`` An array of field
 *          configuration objects or a record object.  Default is
 *          :class:`GeoExt.data.ProcessParamRecord`.
 *   
 *      Data reader class to create an array of
 *      :class:`GeoExt.data.ProcessParamRecord` objects from a WPS DescribeProcess
 *      response.
 */
GeoExt.data.WPSProcessDescriptionReader = function(meta, recordType) {
    meta = meta || {};
    if(!meta.format) {
        meta.format = new OpenLayers.Format.WPSCommon();	// WPSCommon format
    }
    if(!(typeof recordType === "function")) {
        recordType = GeoExt.data.ProcessParamRecord.create(
            recordType || meta.fields || [
                {name: "identifier", type: "string"},
                {name: "type", type: "string"},
                {name: "datatype", type: "string"},
                {name: "direction", type: "string"},
                {name: "value", type: "string"},
            ]
        );
    }
    GeoExt.data.WPSProcessDescriptionReader.superclass.constructor.call(
        this, meta, recordType
    );
};

Ext.extend(GeoExt.data.WPSProcessDescriptionReader, Ext.data.DataReader, {

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
        /* 
         * A WPS process description xml document may have more than one process description
         * here always assume the response contains only one process description
         * so always take the first one
         */
        var processdescription = data.processDescriptions[0];
        var datainputs = processdescription.datainputs;
        var processoutputs = processdescription.processoutputs;
        var fields = this.recordType.prototype.fields;
        
        var datainput, processoutput;
        var values, field, v, values;
                
        var records = [];
        
        for(var i=0;i<datainputs.length; i++) {
        	datainput = datainputs[i];
        	if(datainput.identifier) {
        		values = {};        		        	
        		for(var j=0; j<fields.length; j++) {
                    field = fields.items[j];
                    if(field.name == "direction") {
                    	v = field.convert("input");                        
                    } else if(field.name == "datatype") {
                    	if(datainput['type'] == "ComplexData") {
                    		// TODO: for now always take the default format
                    		v = datainput['default'].format.mimetype;
                    	} else if(datainput['type'] == "LiteralData") {
                    		v = datainput.dataType;
                    	} else if(datainput['type'] == "ComplexOutput") {
                    		v = datainput['default'].format.mimetype;
                    	}
                    	v = field.convert(v);
                    } else {                    
                    	v = datainput[field.mapping || field.name] || field.defaultValue;
                        v = field.convert(v);                        
                    }
                    values[field.name] = v;                    
                }
        		// add value
        		values['value'] = "not set";
        		//
        		values.parameter = {
        			identifier: datainput['identifier'],
        			type: datainput['type'], 
        			datatype: datainput['dataType'], 
        			direction: "input",
        			value: "not set"
        		};
        		records.push(new this.recordType(values, values.parameter.identifier));
        	}
        }
        
        for(var i=0;i<processoutputs.length; i++) {
        	processoutput = processoutputs[i];
        	if(processoutput.identifier) {
        		values = {};        		        	
        		for(var j=0; j<fields.length; j++) {
                    field = fields.items[j];
                    if(field.name == "direction") {
                    	v = field.convert("output");                        
                    } else if(field.name == "datatype") {
                    	if(processoutput['type'] == "ComplexOutput") {
                    		// TODO: for now always take the default format
                    		v = processoutput['default'].format.mimetype;
                    	}
                    	v = field.convert(v);
                    } else {
                    	v = processoutput[field.mapping || field.name] || field.defaultValue;
                        v = field.convert(v);                        
                    }
                    values[field.name] = v;                    
                }
        		// add value
        		values['value'] = "not set";
        		//
        		values.parameter = {
        			identifier: processoutput['identifier'],
        			type: processoutput['type'],
        			datatype: processoutput['dataType'],
        			direction: "output",
        			value: "not set"
        		};
        		records.push(new this.recordType(values, values.parameter.identifier));
        	}
        }
        
        return {
            totalRecords: records.length,
            success: true,
            records: records
        };
    }
});
