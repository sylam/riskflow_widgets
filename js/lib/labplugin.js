var plugin = require('./index');
var base = require('@jupyter-widgets/base');

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

