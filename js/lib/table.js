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
                    this.settings)
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
            // check that row and colulm headers are populated and
            // there is at least 1 non null value per row/col
            nulls_col = data[0].slice(1,-1).map(v=>v!=null)
            nulls_row = true
            data.slice(1, -1).forEach((r,i)=>{
                nulls_row = r[0]!=null & nulls_row & r.slice(1).some(x=>x);
                r.slice(1).forEach((c,j)=>{
                    nulls_col[j]=nulls_col[j]&(c==null)
                    })
                });
            if (!nulls_col.some(x=>x) && nulls_row)
            {
                // console.log('here');
                // remove the last row and column
                /*
                Force the data to be floating point - note I could ask HoT to
                parse the columns as numeric but then manual maintenance of the columns setting
                is needed.
                */
                this.model.set('value', JSON.stringify(
                    data.slice(0,-1).map(v=>v.slice(0,-1).map(k=>parseFloat(k))))
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
