Ext.namespace("GeoExt.data");

/** api: constructor
 *  .. class:: ProcessRecord
 *  
 *      A record that represents an ``OpenLayers.Process``. This record
 *      will always have at least the following fields:
 *
 *      * identifier ``String``
 */
GeoExt.data.ProcessRecord = Ext.data.Record.create([
    {name: "process"},
    {
    	name: "identifier", 
    	type: "string", 
    	mapping: "Identifier"		
    },
    {
    	name: "title", 
    	type: "string", 
    	mapping: "Title"		
    },
    {
    	name: "abstract", 
    	type: "string", 
    	mapping: "Abstract"		
    }
]);

/** api: method[getProcess]
 *  :return: ``OpenLayers.Process``
 *
 *  Gets the process for this record.
 */
GeoExt.data.ProcessRecord.prototype.getProcess = function() {
    return this.get("process");
};

/** api: method[setProcess]
 *  :param process: ``OpenLayers.Process``
 *
 *  Sets the process for this record.
 */
GeoExt.data.ProcessRecord.prototype.setProcess = function(process) {
    if (process !== this.data.process) {
        this.dirty = true;
        if(!this.modified) {
            this.modified = {};
        }
        if(this.modified.process === undefined) {
            this.modified.process = this.data.process;
        }
        this.data.process = process;
        if(!this.editing) {
            this.afterEdit();
        }
    }
};

/** api: method[clone]
 *  :param id: ``String`` (optional) A new Record id.
 *  :return: class:`GeoExt.data.ProcessRecord` A new process record.
 *  
 *  Creates a clone of this ProcessRecord. 
 */
GeoExt.data.ProcessRecord.prototype.clone = function(id) { 
    var process = this.getProcess() && this.getProcess().clone(); 
    return new this.constructor( 
        Ext.applyIf({process: process}, this.data), 
        id || process.id
    );
}; 

/** api: classmethod[create]
 *  :param o: ``Array`` Field definition as in ``Ext.data.Record.create``. Can
 *      be omitted if no additional fields are required.
 *  :return: ``Function`` A specialized :class:`GeoExt.data.ProcessRecord`
 *      constructor.
 *  
 *  Creates a constructor for a :class:`GeoExt.data.ProcessRecord`, optionally
 *  with additional fields.
 */
GeoExt.data.ProcessRecord.create = function(o) {
    var f = Ext.extend(GeoExt.data.ProcessRecord, {});
    var p = f.prototype;

    p.fields = new Ext.util.MixedCollection(false, function(field) {
        return field.name;
    });

    GeoExt.data.ProcessRecord.prototype.fields.each(function(f) {
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
