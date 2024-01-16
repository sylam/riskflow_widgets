// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

var widgets = require('@jupyter-widgets/base');

function makepromise(files) {
    const promisesFile = [];
    _.forEach(files, (file) => promisesFile.push(
        new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                // We know we can read the result as an array buffer since
                // we use the `.readAsArrayBuffer` method
                const content = fileReader.result;
                resolve({
                    content,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    last_modified: file.lastModified,
                });
            };
            fileReader.onerror = () => {
                reject();
            };
            fileReader.onabort = fileReader.onerror;
            fileReader.readAsArrayBuffer(file);
        })
    ));
    return promisesFile;
}

export const DRAG_WIDGET_VERSION = '0.2.1';

export class FileDragUploadModel extends widgets.DOMWidgetModel  {
    defaults() {
        return {
            ...super.defaults(),
            _model_name: 'FileDragUploadModel',
            _view_name: 'FileDragUploadView',
            _model_module : 'riskflow_widgets',
            _view_module : 'riskflow_widgets',
            _model_module_version : DRAG_WIDGET_VERSION,
            _view_module_version : DRAG_WIDGET_VERSION,
            accept: '',
            tooltip: 'Click or drag a file here',
            description: 'Upload',
            disabled: false,
            icon: 'upload',
            value: [],
            error: '',
        };
    }

    static serializers = {
        ...widgets.DOMWidgetModel.serializers,
        // use a dummy serializer for value to circumvent the default serializer.
        value: { serialize: (x) => x },
    };
}

export class FileDragUploadView extends widgets.DOMWidgetView {

    preinitialize() {
        // Must set this before the initialize method creates the element
        this.tagName = 'button';
    }

    render() {
        super.render();

        this.el.classList.add('jupyter-widgets');
        this.el.classList.add('widget-upload');
        this.el.classList.add('jupyter-button');

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.style.display = 'none';

        this.el.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('click', () => {
            this.fileInput.value = '';
        });

        this.el.addEventListener("dragover", (e)=> {
            e.preventDefault();
            e.stopPropagation();
        });

        this.el.addEventListener("drop", (e)=> {
            e.preventDefault();
            e.stopPropagation();
            var promisesFile = makepromise(e.dataTransfer.files);
            Promise.all(promisesFile)
            .then(files => {
                this.model.set({
                    value: files,
                    error: '',
                });
                this.touch();
            })
            .catch((err) => {
                console.error('error in file upload: %o', err);
                this.model.set({
                    error: err,
                });
                this.touch();
            });
        });

        this.fileInput.addEventListener('change', () => {
            const promisesFile = makepromise(this.fileInput.files);

            Promise.all(promisesFile)
            .then(files => {
                this.model.set({
                    value: files,
                    error: '',
                });
                this.touch();
            })
            .catch((err) => {
                console.error('error in file upload: %o', err);
                this.model.set({
                    error: err,
                });
                this.touch();
            });
        });

        this.update(); // Set defaults.
    }

    update() {
        this.el.disabled = this.model.get('disabled');
        this.el.setAttribute('title', this.model.get('tooltip'));

        var value = this.model.get('value');
        var description = `${this.model.get('description')} (${value.length})`;
        var icon = this.model.get('icon');

        if (description.length || icon.length) {
            this.el.textContent = '';
            if (icon.length) {
                const i = document.createElement('i');
                i.classList.add('fa');
                i.classList.add('fa-' + icon);
                if (description.length === 0) {
                    i.classList.add('center');
                }
                this.el.appendChild(i);
            }
            this.el.appendChild(document.createTextNode(description));
        }

        this.fileInput.accept = this.model.get('accept');
        return super.update();
    }
}