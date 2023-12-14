import $ from "expose-loader?exposes=$,jQuery!jquery";

var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var Handsontable = require('handsontable');

require('flot/lib/jquery.mousewheel');
require('flot/lib/jquery.event.drag');
require('flot')

//setup Flot for drawing stuff
//useful definition to format the date

function yyyymmdd(date) {
   var yyyy = date.getFullYear().toString();
   var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = date.getDate().toString();
   return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]); // padding
};

function settabledata(data, format_time) {
    // console.log('set');
    var columns = [['Index'].concat(data.map(x=>x['label']))];
    if (data.length>1) {
        for (var i=0; i< data[0]['data'].length; i++) {
            var row = data[0]['data'][i].slice(0);
            if (format_time)
                row[0] = yyyymmdd( new Date(row[0]) );
            for (var j=1; j<data.length; j++ ) {
                row.push(data[j]['data'][i][1]);
            }
            columns.push( row );
        }
    } else {
        columns = columns.concat(data[0]['data']);
    }
    return columns;
}

function gettabledata(colheaders, ht) {
    console.log('get');
    var columns = [];

    if (ht.countCols ()>2) {
        var terms = ht.getDataAtCol(0).slice(0,-1);
        var labels = colheaders.slice(1);
        for (var i=0; i< labels.length; i++) {
            columns.push ({'label':labels[i], 'data':_.zip(terms, ht.getDataAtCol(i+1).slice(0,-1))});
        }
    } else {
        columns= [ {'label':'Rate', 'data':ht.getData().slice(0,-1)} ];
    }
    return columns;
}

export class FlotView extends widgets.DOMWidgetView {

        update() {
            //var flot = this.$flot;
            var val = this.model.get('value');

            if (val != "") {
                var data = JSON.parse(val);
                // console.log("update", data);
                this.renderGraph(data);
            }
            else {
                console.log("update is null - why?");
            }

            return super.update();
        }

        render() {
            //console.log("render");
            this.el.classList.add('widget-inline-hbox');

            if (this.model.get('description')!='')
            {
                this.$label = $('<div />')
                                .addClass('widget-label')
                                .appendTo(this.el);
                //always initialize with the label
                this.$label.text(this.model.get('description'));
            }

            this.$flot = $('<div/>')
                         .addClass('flotplot')
                         .appendTo(this.el);

            this.$table = $('<div/>')
                         .addClass('handsonplot')
                         .appendTo(this.el);

            this.colheaders = [];
            this.displayed.then(_.bind(this.update, this));
        }

        renderGraph(data) {
            // console.log("renderGraph");

            var view = this;
            var flot_settings = JSON.parse(this.model.get('flot_settings'));
            var hot_settings = JSON.parse(this.model.get('hot_settings'));

            var table_data = settabledata(data, _.get(flot_settings, 'xaxis.mode')=='time');
            var hot_settings = _.extend({
                // defaults for tables
                manualColumnMove: true,
                contextMenu: false,
                minSpareRows: 1,
                width:  300,
                height: 300
            }, hot_settings);
            //set the column headers
            this.colheaders = table_data[0];
            hot_settings['colHeaders'] = this.colheaders;
            // now setup flot
            flot_settings = _.extend({
                legend: { show: true, position: "ne"},
                series: {
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    },
                    shadowSize: 0
                },
                grid: {
                    hoverable: true
                },
                zoom: {
                    interactive: true
                },
                pan: {
                    interactive: true
                }
            }, flot_settings);

            if (_.get(flot_settings, 'xaxis.mode')=='time') {
                flot_settings = _.extend({
                yaxis : {
                            tickFormatter: function numberWithCommas(x) {
                                return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
                            }
                        }
                }
                , flot_settings);
            }
            var plt = $.plot( view.$flot, data, flot_settings);
            // Create the Handsontable table.
            this.hot = new Handsontable(view.$table[0], _.extend(
                {
                    data: table_data.slice(1),
                    // when working in HoT, don't listen for command mode keys
                    // afterSelection: function(){ IPython.keyboard_manager.disable(); },
                    // afterDeselect: function(){ IPython.keyboard_manager.enable(); },
                    // the data changed. `this` is the HoT instance
                    afterChange: function(changes, source){
                        // don't update if we did the changing!
                        if(source === "loadData") { return; }
                        view.handle_table_change(this.getData());
                    }
                }, hot_settings)
            );
        }

        //events: {"change": "handle_table_change"},

        handle_table_change(event) {
            // Get the data, and serialize it in JSON.
            var data = gettabledata(this.colheaders, this.hot);
            // Update the model with the JSON string.
            this.model.set('value', JSON.stringify(data));
            // Don't touch this...
            this.touch();
        }
}

export const FLOT_WIDGET_VERSION = '0.2.1';

export class FlotModel extends widgets.DOMWidgetModel {
    defaults() {
        return  {
            ...super.defaults(),
            _model_name: 'FlotModel',
            _view_name: 'FlotView',
            _model_module : 'riskflow_widgets',
            _view_module : 'riskflow_widgets',
            _model_module_version : FLOT_WIDGET_VERSION,
            _view_module_version : FLOT_WIDGET_VERSION,

            value : '',
            hot_settings: '',
            flot_settings: '',
            description : ''
        };
    }
}

