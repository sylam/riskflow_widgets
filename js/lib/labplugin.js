var plugin = require('./index');
var base = require('@jupyter-widgets/base');
var $ = require('jquery');
var jQuery = require('jquery');
var _ = require('lodash');
var Handsontable = require('handsontable');

module.exports = {
  id: 'riskflow_widgets:plugin',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'riskflow_widgets',
          version: plugin.version,
          exports: plugin
      });
  },
  autoStart: true
};

