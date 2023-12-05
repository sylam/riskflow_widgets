var widgets = require('@jupyter-widgets/base');
require('jstree');
require('./theme/style.css');

export class TreeView extends widgets.DOMWidgetView {

    initialize(options) {
        super.initialize(options);
        this.loaded = false;
    }

    generateActionMethod(subtree, $node, node_data, obj_type)
    {
        return function(data) {
            $node = subtree.create_node($node, {"type":node_data, "data":obj_type});
            subtree.edit($node, obj_type+".");
        };
    }

    generateContextMethod(subtree, $node, obj_types)
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
    }

    perform_update( tree, data, type_data ) {
        var settings = $.parseJSON(this.model.get('settings'));
        var plugins = this.model.get('plugins');
        var self = this;
        // check if we need to return all selected
        this.multiselect = plugins.includes('checkbox');

        tree.jstree({
            core  : {data: data, check_callback : true},
            types : type_data,
            plugins : plugins,
            themes: {icons: true},
            contextmenu : plugins.includes('contextmenu') ? {
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
                    var toggle = {
                        "Toggle": {
                            "separator_before"	: true,
                            "label": "Toggle Status",
                                "action": function() {
                                    subtree.get_selected(true).map (
                                        function(x) {
                                            x.data.ignore = x.data.hasOwnProperty('ignore') ? x.data.ignore : false;
                                            x.data.ignore = !x.data.ignore;
                                            var node_dom = subtree.get_node(x,true).children('.jstree-anchor')
                                            if (x.data.ignore)
                                            {
                                                node_dom.addClass('jstree-disabled').attr('aria-disabled', true);
                                            } else {
                                                node_dom.removeClass('jstree-disabled').attr('aria-disabled', false);
                                            }
                                        }
                                    );
                                    subtree.trigger('enable_node', { 'node' : $node });
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
                            if (settings['events'].includes('ignore')) {
                               items = $.extend({}, create, toggle, del);
                            } else {
                                items = $.extend({}, create, del);
                            }
                            break;
                        default:
                            if (settings['events'].includes('ignore')) {
                               items = $.extend({}, toggle, del);
                            } else {
                                items = del;
                            }
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
        if (settings['events'].includes('ignore')){
            tree.on('enable_node.jstree', this.handle_toggle.bind(this));
            // make sure we draw ignored nodes correctly
            tree.on('open_node.jstree', this.handle_open.bind(this));
        }
        if (this.multiselect){
            tree.on('deselect_node.jstree', this.handle_deselect.bind(this))
        }
    }

    update() {
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
        return super.update();
    }

    render() {
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
    }

    get_json_path(obj) {
        var path = this.$tree.jstree("get_path", obj.node);
        return path.slice(1);
    }

    handle_search(event, obj) {
        var self = this;

        if (this.to) { clearTimeout(this.to); }
        this.to = setTimeout ( function () {
            var v = self.$search.val();
            self.$tree.jstree(true).search(v);
        }, 250);
    }

    // Callback for when the user makes a new selection
    handle_select(event, obj) {
        if (obj!=null) {
            //console.log(obj.node);
            this.model.set('selected', this.get_json_path(obj) );
            if (this.multiselect) {
                var list_selected = this.$tree.jstree("get_selected", true).map (function (x) {return x["text"];} );
			    this.model.set ( 'checked', list_selected );
			}
            this.touch();
        }
    }

    handle_open(event, obj) {
        if (obj != null) {
            var self = this;
            obj.node.children.forEach(function(child) {
                var node = self.$tree.jstree('get_node', child);
                var $anchor = $(self.$tree.jstree('get_node', child, true)).children('.jstree-anchor');
                if (node.data.hasOwnProperty('ignore') ? node.data.ignore : false) {
                    $anchor.addClass('jstree-disabled').attr('aria-disabled', true);
                }
            });
        }
    }

    handle_deselect(event, obj) {
        if (obj!=null) {
            var list_selected = this.$tree.jstree("get_selected", true).map (function (x) {return x["text"];} );
            this.model.set ( 'checked', list_selected );
            this.touch();
        }
    }

    handle_toggle(event, obj) {
        if (obj!=null) {
            var self = this;
            var path = this.$tree.jstree("get_selected", true).map (
                function(x) {
                        var w = self.$tree.jstree('get_path',x);
                        w[0] = x.data.hasOwnProperty('ignore') ? x.data.ignore : false;
                        return w;
                    }
                );
            this.model.set('ignore', path);
            this.touch();
        }
    }

    // Callback for when the user creates a new node
    handle_tree_change(event, obj) {
        if (obj!=null) {
            if ( obj.node.text.indexOf(obj.node.data)!=0 )
            {
                //console.log('Create',obj.node.text, obj.node.data);
                this.$tree.jstree("rename_node", obj.node, obj.node.data+"."+obj.node.text);
            }
            this.model.set('created', this.get_json_path(obj) );
            this.touch();
        }
    }

    // Callback for when the user deletes a nod
    handle_delete(event, obj) {
        if (obj!=null) {
            //console.log('Delete',obj.node);
            this.model.set('deleted', this.get_json_path(obj));
            this.touch();
        }
    }
}

export const TREE_WIDGET_VERSION = '0.2.1';

export class TreeModel extends widgets.DOMWidgetModel {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: "TreeModel",
            _view_name: "TreeView",
            _model_module : 'riskflow_widgets',
            _view_module : 'riskflow_widgets',
            _model_module_version : TREE_WIDGET_VERSION,
            _view_module_version : TREE_WIDGET_VERSION,

            value : '',
            type_data : '',
            selected : [],
            created : [],
            deleted : [],
            plugins: [],
            checked: [],
            ignore: [],
            settings: ''
        };
    }
}
