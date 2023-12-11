import k3d
import json
import numpy as np
import ipywidgets as widgets
from traitlets import Unicode, List
# use the FileChooser widget from ipyfilechooser to select JSON (can change this later)
from ipyfilechooser import FileChooser


# See js/lib/*.js for the frontend counterpart to this file.

def to_json(p_object):
    """
    converts a python object to json.
    skips the whitespace for a smaller output and converts numpy arrays back to lists
    """

    class NpEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, np.integer):
                return int(obj)
            if isinstance(obj, np.floating):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return json.JSONEncoder.default(self, obj)

    return json.dumps(p_object, separators=(',', ':'), cls=NpEncoder)


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
    _view_module_version = Unicode('^0.2.1').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.2.1').tag(sync=True)

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
    ignore = List([]).tag(sync=True)
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
    _view_module_version = Unicode('^0.2.1').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.2.1').tag(sync=True)

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
    _view_module_version = Unicode('^0.2.1').tag(sync=True)
    # Version of the front-end module containing widget model
    _model_module_version = Unicode('^0.2.1').tag(sync=True)

    value = Unicode().tag(sync=True)
    description = Unicode().tag(sync=True)
    hot_settings = Unicode('{}').tag(sync=True)
    flot_settings = Unicode('{}').tag(sync=True)


class Three(widgets.HBox):
    def __init__(self, description, value='[[0.0,1.0], [1.0,0.0]]'):
        self.description = widgets.Label(value=description)
        self.plot = k3d.plot(
            axes=['log(moneyness)', 'expiry', 'vol(\%)'],
            # menu_visibility=False,
            camera_rotate_speed=3.0,
        )
        # set the plot layout to match the table below
        self.plot.layout.max_width = '600px'

        self.mesh = None
        self.points = None
        self.plot_label = None
        self.data = Table(description='', settings=to_json({
            'width': 600, 'height': 300, 'contextMenu': True,
            'minSpareRows': 1, 'minSpareCols': 1
        }))

        self.add_button = widgets.Button(
            description='Add Tenor', tooltip='Add a new vol surface for a new tenor')
        self.del_button = widgets.Button(
            description='Remove Tenor', tooltip='Delete vol surface for this tenor')
        self.dropdown = widgets.Combobox(
            description='Tenor:', placeholder='Choose Tenor', options=[],
            ensure_option=False)
        self.dropdown.layout.max_width = '360px'
        self.tenor = None

        self.selector = widgets.HBox(children=[self.add_button, self.del_button, self.dropdown])
        self.selector.layout.visibility = 'hidden'
        self.selector.layout.max_width = '600px'

        self.add_button.on_click(self.add_button_clicked)
        self.del_button.on_click(self.del_button_clicked)
        self.dropdown.observe(self.change_selection, 'value')
        self.obj = None

        super().__init__(
            children=[
                self.description,
                widgets.VBox(children=[self.selector, self.plot, self.data])
            ]
        )
        self.value = value

    def change_selection(self, change):
        if change.new in self.obj:
            matrix = self.obj[change.new]
            self.data.value = to_json(matrix)
            self.update_plot(matrix)
            self.tenor = self.dropdown.value
            self.plot_label.text = 'Tenor: {}'.format(self.tenor)
            self.dropdown.unobserve(self.change_selection, 'value')
            self.dropdown.value = ''
            self.dropdown.observe(self.change_selection, 'value')

    def add_button_clicked(self, b):
        val = self.dropdown.value
        if val:
            try:
                val = self.dropdown.value
                self.dropdown.options = tuple([str(x) for x in sorted(
                    [float(x) for x in (self.dropdown.options + (val,))])])
                self.tenor = val
                self.plot_label.text = 'Tenor: {}'.format(self.tenor)
                self.obj[val] = json.loads('[[0.0,1.0], [1.0,0.0]]')
                matrix = self.obj[val]
                self.data.value = to_json(matrix)
                self.update_plot(matrix)
            except:
                print('could not cast value to float')

    def del_button_clicked(self, b):
        val = self.dropdown.value if self.dropdown.value else self.tenor
        if val in self.dropdown.options:
            self.dropdown.options = tuple([x for x in self.dropdown.options if x != val])
            print('inside - about to del', self.obj.keys())
            del self.obj[val]
            print('inside - about to del', self.obj.keys())
            if self.dropdown.options:
                self.tenor = self.dropdown.options[0]
                matrix = self.obj[self.tenor]
            else:
                self.tenor = ''
                matrix = [[]]

            self.dropdown.value = self.tenor
            print('inside - after del', self.obj.keys())
            self.data.value = to_json(matrix)
            self.update_plot(matrix)
        print("del Button clicked.", val)

    def observe(self, handler, prop, type='change'):

        def make_plot_fn():
            def update_plot(change):
                # now update the table with the new data
                table_obj = json.loads(change.new)
                # store the result if this is a 3d obj
                if self.tenor is not None:
                    self.obj[self.tenor] = table_obj
                # call the original handler with the modified change event
                handler({'name': change.name, 'old': change.old,
                         'new': change.new, 'owner': self, 'type': change.type})
                # check if we have a valid table obj
                if np.all([len(x) > 1 for x in table_obj[1:]]):
                    self.update_plot(table_obj)

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
        return e, expiry, moneyness, np.array([np.interp(
            moneyness, surface[surface[:, 1] == x][:, 0], surface[surface[:, 1] == x][:, 2]) for x in expiry])

    def update_plot(self, json_list):
        raw_points, expiry, moneyness, vol = Three.interpolate_surface(json_list)
        raw_vertices = np.array(raw_points, dtype=np.float32)

        if min(moneyness) > 0:
            scale = 2 / np.log(2)
            m = scale * np.log(moneyness)
            raw_vertices[:, 0] = scale * np.log(raw_vertices[:, 0])
        else:
            m = np.array(moneyness) * 100.0
            raw_vertices[:, 0] = 100.0 * raw_vertices[:, 0]
            self.plot.axes = ['moneyness (bps)', 'expiry', 'vol(\%)']

        v = vol * 100
        raw_vertices[:, 2] = 100.0 * raw_vertices[:, 2]

        U, V = np.meshgrid(m, expiry)
        vertices = np.dstack([U, V, v]).astype(np.float32).reshape(-1, 3)
        indices = Three.make_faces_vectorized1(*v.shape).astype(np.uint32)
        if self.mesh is None:
            self.mesh = k3d.mesh(
                vertices, indices, flat_shading=False, attribute=v,
                side='double', color_map=k3d.basic_color_maps.Reds, color_range=[v.min(), v.max()]
            )
            self.points = k3d.points(raw_vertices, point_size=0.1, shader='3d')
            self.plot_label = k3d.text2d('Volatility', position=(0, 0))
            # add the plots
            self.plot += self.points
            self.plot += self.mesh
            self.plot += self.plot_label
        else:
            self.points.vertices = raw_vertices
            self.mesh.attribute = v
            self.mesh.color_range = [v.min(), v.max()]
            self.mesh.vertices = vertices
            self.mesh.indices = indices

    @property
    def value(self):
        return to_json(self.obj)

    @value.setter
    def value(self, json_string):
        self.obj = json.loads(json_string)
        if isinstance(self.obj, dict):
            self.selector.layout.visibility = 'visible'
            self.dropdown.options = tuple(self.obj.keys())
            selection = self.dropdown.options[0]
            self.dropdown.value = selection
            matrix = self.obj[selection]
            data_value = to_json(matrix)
        else:
            self.selector.layout.visibility = 'hidden'
            data_value = json_string
            matrix = self.obj

        self.data.value = data_value
        self.update_plot(matrix)
