riskflow_widgets
===============================

Jupyter widget library for riskflow

Installation
------------

To install use pip:

    $ pip install riskflow_widgets

Note that for jupyterlab>3.0 you must disable the context menu i.e.

    $ jupyter labextension disable @jupyterlab/application-extension:context-menu

For a development installation (requires [Node.js](https://nodejs.org) and [Yarn version 1](https://classic.yarnpkg.com/)),

    $ git clone https://github.com/sylam/riskflow_widgets.git
    $ cd riskflow_widgets
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --overwrite --sys-prefix riskflow_widgets
    $ jupyter nbextension enable --py --sys-prefix riskflow_widgets

When actively developing your extension for JupyterLab, run the command:

    $ jupyter labextension develop --overwrite riskflow_widgets

Then you need to rebuild the JS when you make a code change:

    $ cd js
    $ yarn run build

You then need to refresh the JupyterLab page when your javascript changes.
