import k3d
import json
import numpy as np
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
    selected = List([]).tag(sync=True)
    created = List([]).tag(sync=True)
    deleted = List([]).tag(sync=True)
    plugins = List([]).tag(sync=True)
    checked = List([]).tag(sync=True)
    settings = Unicode('').tag(sync=True)


# HandsonTable view
@widgets.register
class Table(widgets.DOMWidget):
    _view_name = Unicode('TableView').tag(sync=True)
    _model_name = Unicode('TableModel').tag(sync=True)
    # Name of the front-end module containing widget view
    _view_module = Unicode('riskflow_widgets').tag(sync=True)

    # Name of the front-end module containing widget model
    _model_module = Unicode('riskflow_widgets').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    value = Unicode().tag(sync=True)
    description = Unicode().tag(sync=True)
    settings = Unicode('{}').tag(sync=True)


@widgets.register
class Flot(widgets.DOMWidget):
    _view_name = Unicode('FlotView').tag(sync=True)
    _model_name = Unicode('FlotModel').tag(sync=True)
    # Name of the front-end module containing widget view
    _view_module = Unicode('riskflow_widgets').tag(sync=True)

    # Name of the front-end module containing widget model
    _model_module = Unicode('riskflow_widgets').tag(sync=True)

    # Version of the front-end module containing widget view
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    value = Unicode().tag(sync=True)
    description = Unicode().tag(sync=True)


@widgets.register
class FlotTree(Tree):
    _view_name = Unicode('FlotTreeView').tag(sync=True)
    _model_name = Unicode('FlotTreeModel').tag(sync=True)

    description = Unicode().tag(sync=True)
    profiles = Unicode().tag(sync=True)


class Three(widgets.HBox):
    '''Fake widget built around HBox - just shows a label, a plot and a table for editing'''

    def __init__(self, description):
        self.description = widgets.Label(value=description)
        self.plot = k3d.plot(
            axes=['log(moneyness)', 'expiry', 'vol(\%)'],
            camera_rotate_speed=3.0
        )
        self.mesh = None

        self.data = Table(description='', settings=json.dumps({
            'width': 500, 'height': 300, 'contextMenu': True, 'minSpareRows': 1, 'minSpareCols': 1
        }))

        super().__init__(
            children=[
                self.description,
                widgets.VBox(children=[self.plot, self.data])
            ]
        )

    def observe(self, handler, prop, type='change'):

        def make_plot_fn():
            def update_plot(change):
                # call the original handler first
                handler(change)
                # now update the plot with the new data
                self.update_plot(json.loads(change['new']))

            return update_plot

        if self.children:
            # link the observable function to the table widget (self.data)
            self.data.observe(make_plot_fn(), prop, type)
        else:
            super().observe(handler, prop, type)

    @staticmethod
    def make_faces_vectorized1(Nr, Nc):

        out = np.empty((Nr - 1, Nc - 1, 2, 3), dtype=int)

        r = np.arange(Nr * Nc).reshape(Nr, Nc)

        out[:, :, 0, 0] = r[:-1, :-1]
        out[:, :, 1, 0] = r[:-1, 1:]
        out[:, :, 0, 1] = r[:-1, 1:]

        out[:, :, 1, 1] = r[1:, 1:]
        out[:, :, :, 2] = r[1:, :-1, None]

        out.shape = (-1, 3)
        return out

    @staticmethod
    def interpolate_surface(json_list):
        moneyness = json_list[0][1:]
        e = []
        for p in json_list[1:]:
            e.extend([[m, p[0], v] for m, v in zip(moneyness, p[1:]) if v is not None])

        surface = np.array(e)
        expiry = [p[0] for p in json_list[1:]]
        return expiry, moneyness, np.array([np.interp(
            moneyness, surface[surface[:, 1] == x][:, 0], surface[surface[:, 1] == x][:, 2]) for x in expiry])

    def update_plot(self, json_list):
        e, moneyness, vol = Three.interpolate_surface(json_list)
        scale = 2 / np.log(2)
        m = scale * np.log(moneyness)
        v = vol * 100

        U, V = np.meshgrid(m, e)
        vertices = np.dstack([U, V, v]).astype(np.float32).reshape(-1, 3)
        indices = Three.make_faces_vectorized1(*v.shape).astype(np.uint32)
        if self.mesh is None:
            self.mesh = k3d.mesh(
                vertices, indices, flat_shading=False, attribute=v,
                side='double', color_map=k3d.basic_color_maps.Reds, color_range=[v.min(), v.max()]
            )
            self.plot += self.mesh
        else:
            self.mesh.attribute = v
            self.mesh.color_range = [v.min(), v.max()]
            self.mesh.vertices = vertices
            self.mesh.indices = indices

    @property
    def value(self):
        return self.data.value

    @value.setter
    def value(self, json_string):
        self.data.value = json_string
        self.update_plot(json.loads(json_string))