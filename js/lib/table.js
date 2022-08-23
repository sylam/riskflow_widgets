var widgets = require('@jupyter-widgets/base');

// Define the TableView
var TableView = widgets.DOMWidgetView.extend({

    initialize: function(options) {
        TableView.__super__.initialize.apply(this, arguments);
        this.loaded = false;
    },

    update: function() {
        var val   = this.model.get('value');
        var data = (val==="") ? null : $.parseJSON(val);

        if (!this.loaded)
        {
            var view = this;
            var settings = _.extend({
                // defaults for tables
                // set the default columns to always be numeric
                columns() {
                    return {
                        type: 'numeric',
                        numericFormat: {
                            pattern: '0.0000'
                        },
                        validator: Handsontable.validators.NumericValidator
                    }
                }
            }, this.settings);

            this.hot = new Handsontable(
                view.$table[0], _.extend({
                        data : data,
                        // when working in HoT, don't listen for command mode keys
                        afterSelection: function(){ IPython.keyboard_manager.disable(); },
                        afterDeselect: function(){ IPython.keyboard_manager.enable(); },
                        // the data changed. `this` is the HoT instance
                        afterChange: function(changes, source) {
                            // don't update if we did the changing!
                            if(source === "loadData"){ return; }
                            view.handle_table_change(changes, this.getData());
                        },
                    },
                    settings)
            );

            this.loaded = true;
        }
        else
        {
            this.hot.loadData(data);
        }

        return TableView.__super__.update.apply(this);
    },

    render: function() {

        var label = this.model.get('description');

        // if the label is empty, then just create a table
        if (label != "") {
            this.el.classList.add('widget-inline-hbox');
            this.$label = $('<div />')
                            .addClass('widget-label')
                            .appendTo(this.el);

            //always initialize with the label
            this.$label.text(label);
        }

        this.$table = $('<div/>')
                     .appendTo(this.el);

        this.settings = $.parseJSON(this.model.get('settings'));
        //load up the column header info
        this.colHeaders = ("colHeaders" in this.settings) ? this.settings.colHeaders : [];
        this.label = label;
        //update the table
        this.displayed.then(_.bind(this.update, this));
    },

    handle_table_change: function(changes, data) {
        // Update the model with the JSON string.
        // should check the changes array and send that - more efficient - TODO!
        if (this.colHeaders.length && (data.length>1)) {
            // regular field with coltypes
            if ((data[0].length==this.colHeaders.length) ||
                this.model.get('description')=="Model Configuration")
            {
                this.model.set('value', JSON.stringify(data));
                // Don't touch this...
                this.touch();
            }
        } else if (data.length>1) {
            nulls = Array(data[0].length-1).fill(true);
            data.slice(0, -1).forEach(v=>{
                v.slice(0, -1).forEach((c,j)=>{
                    nulls[j]=nulls[j]&(c==null)
                    })
                });
            if (!nulls.some(x=>x))
            {
                // remove the last row and column
                /*
                Should not be necessary to add the extra parseFloat
                HoT already has its columns set to numeric - this might be bug in HoT
                */
                // console.log('changes', changes);
                this.model.set('value', JSON.stringify(
                    data.slice(0,-1).map(v=>v.slice(0,-1).map(k=>parseFloat(k))))
                    // data.slice(0,-1).map(v=>v.slice(0,-1)))
                    );
                this.touch();
            }
        }
    }
});

var TableModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name: "TableModel",
        _view_name: "TableView",
        _model_module : 'riskflow_widgets',
        _view_module : 'riskflow_widgets',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',

        value : '',
        settings: '',
        description : ''
    })
});

module.exports = {
    TableModel: TableModel,
    TableView: TableView
};
