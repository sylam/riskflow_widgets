require('jstree');

var widgets = require('@jupyter-widgets/base');

var TreeView = widgets.DOMWidgetView.extend({

    initialize: function(options) {
        TreeView.__super__.initialize.apply(this, arguments);
        this.loaded = false;
    },

    generateActionMethod: function (subtree, $node, node_data, obj_type)
    {
        return function(data) {
            $node = subtree.create_node($node, {"type":node_data, "data":obj_type});
            subtree.edit($node, obj_type+".");
        };
    },

    generateContextMethod: function (subtree, $node, obj_types)
    {
        var submenus = {};
        for (var key in obj_types) {
          if (obj_types.hasOwnProperty(key)) {
            submenus[key] = {
                                "separator_before": false,
                                "separator_after": false,
                                "label" : key,
                                "action" : this.generateActionMethod(subtree, $node, obj_types[key], key)
                            };
          }
        }
        return submenus;
    },

    perform_update: function ( tree, data, type_data ) {
        var settings = $.parseJSON(this.model.get('settings'));
        var plugins = this.model.get('plugins');
        var self = this;
        // check if we need to return all selected
        this.multiselect = plugins.includes('checkbox');

        tree.jstree({
            "core"  : {"data":data, "check_callback" : true},
            "types" : type_data,
            "plugins" : plugins,
            "contextmenu" : plugins.includes('contextmenu') ? {
                 "items": function ($node) {
                    var subtree = tree.jstree(true);
                    var create = {};
                    for (const key in settings['contextmenu']) {
                        if (settings['contextmenu'].hasOwnProperty(key)) {
                            create[key] = {
                                "separator_before": false,
                                "separator_after" : false,
                                "label"			  : key,
                                "action"		  : false,
                                "submenu"         : self.generateContextMethod(
                                    subtree, $node, settings['contextmenu'][key])
                            }
                        }
                    };
                    var del = {
                                "Delete": {
                                    "separator_before"	: true,
                                    "label": "Delete Node",
                                    "action": function (data) {
                                        subtree.delete_node($node);
                                    }
                                }
                            };
                    var items;
                    switch ($node.type) {
                        case "root":
                            items = create;
                            break;
                        case "group":
                            items = $.extend({}, create, del);
                            break;
                        default:
                            items = del;
                    }
                    return items;
                }
            } : null
        }).on('select_node.jstree', this.handle_select.bind(this));

        if (settings['events'].includes('create')){
            tree.on('rename_node.jstree', this.handle_tree_change.bind(this));
        }
        if (settings['events'].includes('delete')){
            tree.on('delete.jstree', this.handle_delete.bind(this));
        }
        if (this.multiselect){
            tree.on('deselect_node.jstree', this.handle_deselect.bind(this))
        }
    },

    update: function() {
        if (!this.loaded && this.model.get('value')) {
            var tree = this.$tree;
            var data = $.parseJSON(this.model.get('value'));
            // console.log('value', data);
            var type_data = $.parseJSON(this.model.get('type_data'));
            this.perform_update(tree, data, type_data);

            this.$search
                .on("keyup", this.handle_search.bind(this))
                .on("paste", this.handle_search.bind(this));

            //tree is now loaded
            this.loaded=true;
            // console.log ('loaded data and type data');
        }

        //We can only create the tree once via an update
        return TreeView.__super__.update.apply(this);
    },

    render: function() {
        // Create the control.
        this.$search  = $('<input type="text" />')
            .addClass('input')
            .addClass('widget-text')
            .appendTo(this.el);

        // Add a <div> in the widget area.
        this.$tree = $('<div />')
            .appendTo(this.el);

        this.to = false;

        //call update
        this.displayed.then(_.bind(this.update, this));
    },

    get_json_path: function(obj) {
        var path = this.$tree.jstree("get_path", obj.node);
        return path.slice(1);
    },

    handle_search: function(event, obj) {
        var self = this;

        if (this.to) { clearTimeout(this.to); }
        this.to = setTimeout ( function () {
            var v = self.$search.val();
            self.$tree.jstree(true).search(v);
        }, 250);
    },

    // Callback for when the user makes a new selection
    handle_select: function(event, obj) {
        if (obj!=null) {
            //console.log(obj.node);
            this.model.set('selected', this.get_json_path(obj) );
            if (this.multiselect) {
                var list_selected = this.$tree.jstree("get_selected", true).map (function (x) {return x["text"];} );
			    this.model.set ( 'checked', list_selected );
			}
            this.touch();
        }
    },

    handle_deselect: function(event, obj) {
        if (obj!=null) {
            // note this that sh
            var list_selected = this.$tree.jstree("get_selected", true).map (function (x) {return x["text"];} );
            this.model.set ( 'checked', list_selected );
            this.touch();
        }
    },

    // Callback for when the user creates a new node
    handle_tree_change: function(event, obj) {
        if (obj!=null) {
            if ( obj.node.text.indexOf(obj.node.data)!=0 )
            {
                //console.log('Create',obj.node.text, obj.node.data);
                this.$tree.jstree("rename_node", obj.node, obj.node.data+"."+obj.node.text);
            }
            this.model.set('created', this.get_json_path(obj) );
            this.touch();
        }
    },

    // Callback for when the user deletes a nod
    handle_delete: function(event, obj) {
        if (obj!=null) {
            //console.log('Delete',obj.node);
            this.model.set('deleted', this.get_json_path(obj));
            this.touch();
        }
    }
});

var TreeModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name: "TreeModel",
        _view_name: "TreeView",
        _model_module : 'riskflow_widgets',
        _view_module : 'riskflow_widgets',
        _model_module_version : '0.1.0',
        _view_module_version : '0.1.0',

        value : '',
        type_data : '',
        selected : [],
        created : [],
        deleted : [],
        plugins: [],
        checked: [],
        settings: ''
    })
});

module.exports = {
    TreeModel: TreeModel,
    TreeView: TreeView
};
