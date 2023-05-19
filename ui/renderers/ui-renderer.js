class UiRenderer {
    constructor () {
        this.sites = new UiSitesRenderer(this);
        this.siteParameters = new UiSiteParameterRenderer(this);
        this.promos = new UiPromosRenderer(this);
        this.config = new UiConfigRenderer(this);
        this.wallet = new UiWalletRenderer(this);
        this.schedules = new UiSchedulesRenderer(this);
        this.selectedSchedule = null;
        // this.openModalMap = new Map();
    }

    initialize() {
        this.appendCSS();
    }

    toast(msg, msgType = "info") {
        toastr[msgType](msg);
    }

    openModal(id, values = null) {
        console.log('@openModal');
        const dlg = document.querySelector('#modal-dlg');
        console.log(dlg);
        dlg.querySelectorAll(".modal-content").forEach(x => x.classList.add('d-none'));
        switch (id) {
            case 'modal-ereport':
            case 'modal-config':
            case 'modal-site':
                document.getElementById("target-spinner").innerHTML = JSON.stringify({id: id, siteId: values});
                document.getElementById("modal-spinner").classList.remove("d-none");
                dlg.querySelector('div').classList.add('modal-lg');
                break;
            case 'modal-add-site':
                this.sites.renderAddExternalSite();
                document.getElementById(id).classList.remove("d-none");
                dlg.querySelector('div').classList.remove('modal-lg');
                break;
            case 'modal-slAlert':
                shortlinkAlert.load(id);
                dlg.querySelector('div').classList.add('modal-lg');
                break;
            case 'modal-schedules':
                document.getElementById(id).querySelector('table tbody').innerHTML = this.schedules.renderTBody();
                this.appendColorPickers('.color-picker');
                dlg.querySelector('div').classList.remove('modal-lg');
                document.getElementById(id).classList.remove("d-none");
                break;
            case 'modal-assign-schedule':
                this.sites.renderAssignScheduleToSite(values);
                document.getElementById(id).classList.remove("d-none");
                dlg.querySelector('div').classList.remove('modal-lg');
                break;
            case 'modal-site-parameters':
                this.siteParameters.renderEditSiteParameters(values);
                document.getElementById(id).classList.remove("d-none");
                dlg.querySelector('div').classList.remove('modal-lg');
                break;
            default:
                dlg.querySelector('div').classList.add('modal-lg');
                document.getElementById(id).classList.remove("d-none");
                break;
        }

        console.log('pre open modal');
        $(dlg).modal('show');
    }

    appendEventListeners() {
        console.log(`@UiRenderer.appendEventListeners`);
        // for (const renderer of Object.values(this)) {
        for (const renderer in this) {
            if (this[renderer] && typeof this[renderer].appendEventListeners === 'function') {
                this[renderer].appendEventListeners();
            }
        }
        $('[data-toggle="tooltip"]').tooltip({
            trigger: 'hover'
        });
    }

    appendCSS() {
        let css = document.createElement('style');
        css.innerHTML = `
            td.em-input {
                padding-top: 0;
                padding-bottom: 0;
            }
            pre {
                height: 145px;
                width:100%;
                white-space: pre-wrap;
                padding-left: 1em;
            }
            pre span {
                display: block;
            }
            .row-schedule-handle {

            }
            .grabbable:not(.d-none):not(.in-use) {
                cursor: move;
                cursor: grab;
                cursor: -moz-grab;
                cursor: -webkit-grab;
            }
            
            .grabbable:not(.d-none):not(.in-use):active {
                cursor: grabbing;
                cursor: -moz-grabbing;
                cursor: -webkit-grabbing;
            }

            .row-handle {
                cursor: grab;
            }

            .dropdown-item {
                cursor: pointer;
            }

            #schedule-table th,td {
                vertical-align: middle;
                padding-top: .25rem!important;
                padding-bottom: .25rem!important;
            }

            #schedule-table-body td.em-input input[readonly] {
                background-color:transparent;
                border: 0;
                font-size: 1em;
            }

            td[data-field="displayName"] .input-group-prepend .input-group-text {
                background-color: transparent;
                border-color: transparent;
                font-size: 1em;
            }

            .custom-switch input,label {
                cursor: pointer;
            }
            `;
        document.head.appendChild(css);
    }

    addLegacySliderHtml(propName, propValue, text) {
        return `<label class="switch"><input type="checkbox" ${propName}="${propValue}" data-original="1"><span class="slider round"></span></label> ${text}`;
    }

    addSliderHtml(field) {
        const rndStr = helpers.randomString(8);
        return `<div class="form-group"><div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                <input type="checkbox" class="custom-control-input" name="${field.name}" id="${rndStr}" ${field.value ? 'checked' : ''}>
                <label class="custom-control-label" for="${rndStr}">${field.text}</label>
                </div></div>`;
    }

    addInputEmailHtml(field) {
        const rndStr = helpers.randomString(8);
        const pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
        return `<div class="form-group row"><label for="${rndStr}" class="col-sm-4 col-form-label">${field.text}</label>
        <div class="col-sm-8">
        <input type="email" class="form-control" required id="${rndStr}" placeholder="${field.placeholder || ' '}" name="${field.name}" pattern="${pattern}" value="${field.value || ''}">
        </div></div>`;
        
        // fieldsHtml += `<div><input type="email" class="form-control" required placeholder="${field.placeholder || ' '}" name="${field.name}" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$" value="${field.value || ''}" />`;

    }

    addInputPasswordHtml(field) {
        const rndStr = helpers.randomString(8);
        return `<div class="form-group row"><label for="${rndStr}" class="col-sm-4 col-form-label">${field.text}</label>
        <div class="col-sm-8">
        <input type="password" min="${field.min !== undefined ? field.min : ''}" min="${field.max !== undefined ? field.max : ''}" class="form-control" required id="${rndStr}" placeholder="${field.placeholder || ' '}" name="${field.name}" value="${field.value || ''}">
        </div></div>`;
    }

    addInputTextHtml(field) {
        const rndStr = helpers.randomString(8);
        return `<div class="form-group row"><label for="${rndStr}" class="col-sm-4 col-form-label">${field.text}</label>
        <div class="col-sm-8">
        <input type="text" class="form-control" required="${field.required || 'false'}" id="${rndStr}" placeholder="${field.placeholder || ' '}" name="${field.name}" value="${field.value || ''}">
        </div></div>`;
    }

    addInputNumberHtml(field) {
        const rndStr = helpers.randomString(8);
        return `<div class="form-group row"><label for="${rndStr}" class="col-sm-4 col-form-label">${field.text}</label>
        <div class="col-sm-8">
        <input type="number" step="${field.step || 1}" class="form-control" required id="${rndStr}" placeholder="${field.placeholder || ' '}" name="${field.name}" value="${field.value || ''}">
        </div></div>`;
    }

    parseContainer(container) {
        let obj = {};
        Object.assign(obj, container.dataset);
        let inputs = container.querySelectorAll('input, select');
        inputs.forEach(function (input) {
            if (input.type == 'checkbox') {
                obj[input.name] = input.checked ? 'true' : 'false';
            } else if (input.type == 'number') {
                obj[input.name] = +input.value;
            } else {
                obj[input.name] = input.value;
            }
        });

        for (const p in obj) { // type converter. TODO: add int, float, etc.
            if (obj[p] === 'true') { obj[p] = true }
            if (obj[p] === 'false') { obj[p] = false }

            // TODO: custom format hooks
            if (p == 'uuid') {
                obj[p] = obj[p].toLowerCase().replace('#', '');
            }
            if (p == 'originals') {
                try {
                    obj[p] = JSON.parse(obj[p]);
                } catch (err) { delete obj[p]; }
            }
        }
        return obj;
    }

    parseTable(table) {
        let rows = table.querySelectorAll('tbody tr');
        let data = [];
        // TODO: raise error if 2 or more rows have the same ID?
        rows.forEach( (r, idx) => {
            // let originalValues = JSON.parse(r.dataset.json);
            let obj = this.parseContainer(r);
            obj.order = '' + idx; // fix order
            if (!(obj.added && obj.removed)) { // skip if it was just added and removed
                data.push(obj);
            }
        });
        // data.sort((a, b) => a.order - b.order);

        return data;
    }

    appendColorPickers(selector) {
        $(selector).each(function () {
            $(this).colorpicker();
            $(this).on('colorpickerChange', function(event) {
                $(event.target.querySelector('.fa-square')).css('color', event.color.toString());
                // $(this).find('input')[0].attr('value', event.color.toHexString());
            });
        });
    }
}

