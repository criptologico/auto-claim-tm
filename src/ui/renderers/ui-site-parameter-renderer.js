class UiSiteParameterRenderer extends UiBaseRenderer {
    static handlers = new Map();

    static registerHandler(name, handler) {
        UiSiteParameterRenderer.handlers.set(name, handler);
    }

    static getHandler(name) {
        const handlerClass = UiSiteParameterRenderer.handlers.get(name);
        return handlerClass || false;
        // then: let handler = new handlerClass(params);
    }

    appendEventListeners() {
        console.log(`@UiSiteParameterRenderer.appendEventListeners`);
        document.querySelector('#modal-site-parameters').addEventListener('click', this.onClickOnModalSiteParameter.bind(this));
    }

    onClickOnModalSiteParameter(e) {
        const modal = document.querySelector('#modal-site-parameters');
        let actionElement = e.target.tagName === 'I' ? e.target.parentElement : e.target;
        if (actionElement.classList.contains('modal-save')) {
            e.preventDefault();
            let form = modal.querySelector('.form-container form');
            if (!form.checkValidity()) {
                console.log(`Form data not valid`);
                form.reportValidity();
                return;
            }
            // TODO: save
            let data = this.uiRenderer.parseContainer(form);
            console.log({astsData: data});
            // Site.getById(data.site_id).changeSchedule(data.schedule);
            $(modal).modal('hide');
        }
    }

    renderFields(values) {
        let fieldsHtml = '';
        values.forEach( field => {
            field.text = field.text || field.name.charAt(0).toUpperCase() + field.name.slice(1).toLowerCase().replaceAll('_', ' ');

            switch (field.type) {
                case 'credentials_or_autofilled': // TODO: will need to condition username/email/password!
                    break;
                case 'email':
                    fieldsHtml += uiRenderer.addInputEmailHtml(field);
                    break;
                case 'password':
                    fieldsHtml += uiRenderer.addInputPasswordHtml(field);
                    break;
                case 'checkbox':
                    field.value = (field.value === true || field.value === 'true' || field.value === 1 || field.value === "1") ? true : false;
                    fieldsHtml += uiRenderer.addSliderHtml(field);
                    break;
                case 'numberInput':
                    fieldsHtml += uiRenderer.addInputNumberHtml(field);
                    break;
                case 'textInput':
                case 'username':
                    field.required = 'true';
                default:
                    fieldsHtml += uiRenderer.addInputTextHtml(field);
                    break;
            }
            // fieldsHtml += `<label class="control-label">${field.text}</label></div>`;
        });
        const modalSiteParameters = document.getElementById('modal-site-parameters');
        modalSiteParameters.querySelector('.form-container form').innerHTML = fieldsHtml;
    }

    renderEditSiteParameters(args) { // { site_id: 'x' }
        const site = Site.getById(args.site_id);

        const siteParameters = site.getSiteParameters(); // async? for external site parameters that need to be loaded from other stg...
        // Should return the handler's name to be used + the values/data

        if (!siteParameters) {
            console.warn(`Site ${site.id} ${site.name} does not require parameters setup.`);
            return;
        }

        if (!siteParameters.handler) {
            console.warn(`Handler name is missing`);
            return;
        }

        const handlerClass = UiSiteParameterRenderer.getHandler(siteParameters.handler);
        if (!handlerClass) {
            console.warn(`Invalid handler class name: ${siteParameters.handler}`);
            return;
        }

        const handler = new handlerClass(siteParameters.values);
        handler.preRender();

        // let autologinField = {
        //     name: 'Autologin when necessary',
        //     type: 'checkbox',
        //     use: true
        // };
        // let modeField = {
        //     type: 'select',
        //     options: [
        //         { text: 'Credentials', value: '1' },
        //         { text: 'Filled by 3rd party software/extension', value: '2' }
        //     ],
        //     condition: () => {
        //         return autologinField.use;
        //     }
        // };
        // let credentialsFieldSet = {
        //     autologin: autologinField,
        //     mode: modeField,
        //     email: {
        //         name: 'E-Mail',
        //         type: 'email',
        //         use: true,
        //         condition: () => {
        //             modeField
        //         }
        //     }
        // }
        // let elCredentialsAutologin = document.querySelector('[data-prop="cf.autologin"]');
        // let elCredentialsMode = document.querySelector('[data-prop="cf.credentials.mode"]');
        // let elCredentialsEmail = document.querySelector('[data-prop="cf.credentials.email"]');
        // let elCredentialsPassword = document.querySelector('[data-prop="cf.credentials.password"]');

        // const fieldsets = [
        //     {
        //         type: 'credentials_fields',
        //         useEnabledSwitch: false,
        //         fields: [

        //         ]
        //     }
        // ];
        // const bscAdsFields = [
        //     { name: 'USERNAME', type: 'username', value: '' },
        //     { name: 'PASSWORD', type: 'password', value: '' }
        // ];

        let fields = [
            { name: 'AUTO_UPDATE_PROMO_CODES', type: 'checkbox', value: 'false' },
            { name: 'MAX_ROLLS_PER_VISIT', type: 'numberInput', value: 1, min: 0 },
            { name: 'AUTO_LOGIN', type: 'checkbox', value: 'true' },
            // { name: 'USE_CREDENTIALS', type: 'credentials_or_autofilled', value: 'credentials' },
            { name: 'EMAIL', type: 'email', value: '' },
            { name: 'PASSWORD', type: 'password', value: '' }
        ];

        fields.forEach( (f, idx) => {
            if (f.order == null || f.order == undefined) {
                f.order = idx;
            }
        });

        let values = persistence.load(`site_parameters_${args.site_id}`, true) || [];
        for(const field of fields) {
            let vIdx = values.findIndex(v => v.name == field.name);
            if (vIdx > -1) {
                field.value = values[vIdx].value;
            }
        }
        values = fields;
        // TODO: save values
        console.log({ values: values, fields: fields });

        this.renderFields(values);

        handler.postRender();
        // modalSiteParameters.querySelector('input[name="site_id"]').value = args.site_id;
        // modalSiteParameters.querySelector('input[name="original_schedule_id"]').value = args.schedule_id;
        // let selectElm = modalSiteParameters.querySelector('select');
        // let options = [];
        // Schedule.getAllForCrud().forEach(sch => {
        //     // TODO: icon is not rendered.. try .selectpicker or something else (dropdown with a disabled or hidden input to store the selection?)
        //     options.push(`<option value="${sch.uuid}"><i class="fas fa-square" style="color: #${sch.uuid}"></i>${sch.name}</option>`);
        // });
        // selectElm.innerHTML = options.join('');
        // selectElm.value = args.schedule_id || "";
        return;
    }

}

