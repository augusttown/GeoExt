Ext.namespace("GeoExt.data");

/** api: constructor
 *  .. class:: ProcessParamRecord
 *  
 *      A record that represents a WPS input/output parameter. 
 *      This record will always have at least the following fields:
 *
 *      * identifier ``String``
 */
GeoExt.data.ProcessParamRecord = Ext.data.Record.create([
    { name: "parameter" },
    {
    	name: "identifier", 
    	type: "string", 
    	mapping: "identifier"		
    },
    {
    	name: "type", 
    	type: "string", 
    	mapping: "type"		
    },
    {
    	name: "datatype", 
    	type: "string", 
    	mapping: "datatype"		
    },
    {
    	name: "direction", 
    	type: "string" 
    	//mapping: "direction"
    }
]);

/** api: method[getProcessParam]
 *  :return: object
 *
 *  Gets the processDescription for this record.
 */
GeoExt.data.ProcessParamRecord.prototype.getProcessParam = function() {
    return this.get("parameter");
};

/** api: method[setProcessParam]
 *  :param process: object
 *
 *  Sets the processParam for this record.
 */
GeoExt.data.ProcessParamRecord.prototype.setProcessParam = function(parameter) {
    if (processDescription !== this.data.processDescription) {
        this.dirty = true;
        if(!this.modified) {
            this.modified = {};
        }
        if(this.modified.parameter === undefined) {
            this.modified.parameter = this.data.parameter;
        }
        this.data.parameter = parameter;
        if(!this.editing) {
            this.afterEdit();
        }
    }
};

/** api: method[clone]
 *  :param identifier: ``String`` (optional) A new Record id.
 *  :return: class:`GeoExt.data.ProcessParamRecord` A new parameter record.
 *  
 *  Creates a clone of this ProcessParamRecord. 
 */
GeoExt.data.ProcessParamRecord.prototype.clone = function(id) { 
    var parameter = this.getProcessParam() && this.getProcessParam().clone(); 
    return new this.constructor( 
        Ext.applyIf({parameter: parameter}, this.data), 
        id || parameter.identifier
    );
}; 

/** api: classmethod[create]
 *  :param o: ``Array`` Field definition as in ``Ext.data.Record.create``. Can
 *      be omitted if no additional fields are required.
 *  :return: ``Function`` A specialized :class:`GeoExt.data.ProcessParamRecord`
 *      constructor.
 *  
 *  Creates a constructor for a :class:`GeoExt.data.ProcessParamRecord`, optionally
 *  with additional fields.
 */
GeoExt.data.ProcessParamRecord.create = function(o) {
    var f = Ext.extend(GeoExt.data.ProcessParamRecord, {});
    var p = f.prototype;

    p.fields = new Ext.util.MixedCollection(false, function(field) {
        return field.name;
    });

    GeoExt.data.ProcessParamRecord.prototype.fields.each(function(f) {
        p.fields.add(f);
    });

    if(o) {
        for(var i = 0, len = o.length; i < len; i++){
            p.fields.add(new Ext.data.Field(o[i]));
        }
    }

    f.getField = function(name) {
        return p.fields.get(name);
    };

    return f;
};
