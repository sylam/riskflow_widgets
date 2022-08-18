require('handsontable/dist/handsontable.full.css');
require('jstree/dist/themes/default/style.css');
require('./theme/style.css');

// Export widget models and views, and the npm package version number.
module.exports = {};

var loadedModules = [
    require("./tree.js"),
    require("./table.js"),
    require("./flot_tree.js"),
    require('./three.js')
];

for (var i in loadedModules) {
    if (loadedModules.hasOwnProperty(i)) {
        var loadedModule = loadedModules[i];
        for (var target_name in loadedModule) {
            if (loadedModule.hasOwnProperty(target_name)) {
                module.exports[target_name] = loadedModule[target_name];
            }
        }
    }
}

module.exports['version'] = require('../package.json').version;