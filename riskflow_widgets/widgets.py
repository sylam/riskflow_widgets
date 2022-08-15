import ipywidgets as widgets
from traitlets import Unicode, List

# See js/lib/tree.js for the frontend counterpart to this file.

@widgets.register
class Tree(widgets.DOMWidget):
    """An example widget."""

    # Name of the widget view class in front-end
    _view_name = Unicode('TreeView').tag(sync=True)

    # Name of the widget model class in front-end
    _model_name = Unicode('TreeModel').tag(sync=True)

    # Name of the front-end module containing widget view
    _view_module = Unicode('riskflow_widgets').tag(sync=True)

    # Name of the front-end module containing widget model
    _model_module = Unicode('riskflow_widgets').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    # Widget specific property.
    # Widget properties are defined as traitlets. Any property tagged with `sync=True`
    # is automatically synced to the frontend *any* time it changes in Python.
    # It is synced back to Python from the frontend *any* time the model is touched.
    value = Unicode('').tag(sync=True)
    type_data = Unicode('').tag(sync=True)
    selected = Unicode('').tag(sync=True)
    created = Unicode('').tag(sync=True)
    deleted = Unicode('').tag(sync=True)
    plugins = List([]).tag(sync=True)
    context_menu = Unicode('').tag(sync=True)
