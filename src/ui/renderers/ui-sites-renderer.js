class UiSitesRenderer extends UiBaseRenderer {
    appendEventListeners() {
        console.log(`@UiSitesRenderer.appendEventListeners`);

        document.querySelector('#modal-assign-schedule').addEventListener('click', this.onClickOnModalAssignSchedule.bind(this));
        eventer.on('siteChangedSchedule', (e) => {
            // Example data e => {siteId: '94', scheduleId: '65329c', oldScheduleId: '4a70e0'}
            this.uiRenderer.toast(`Site moved to schedule ${e.scheduleId}`);
            manager.resyncAll({withUpdate: true}); // should act based on data only
            // TODO: maybe update the site in the list?
        });

        document.querySelector('#schedule-table-body').addEventListener('click', this.onClickOnSitesTableBody.bind(this));

        document.querySelector('.action-edit-all-sites').addEventListener('click', this.onClickOnEditAllSites.bind(this));
        document.querySelector('.action-edit-all-sites-cancel').addEventListener('click', this.onClickOnCancelEditAllSites.bind(this));
        document.querySelector('.action-edit-all-sites-save').addEventListener('click', this.onClickOnSaveEditAllSites.bind(this));

        document.querySelector('.action-add-external-site').addEventListener('click', this.onClickOnAddSiteButton.bind(this));
        document.querySelector('#modal-add-site').addEventListener('click', this.onClickOnModalAddSite.bind(this));
        eventer.on('siteAdded', (e) => {
            // Example data e => {siteId: '94', siteName: 'the site name', scheduleId: '4a70e0'}
            this.uiRenderer.toast(`Site ${e.siteName} added`);
            manager.resyncAll({withUpdate: true}); // should act based on data only
            // TODO: maybe update the site in the list?
        });
        eventer.on('siteRemoved', (e) => {
            // Example data e => {siteId: '94', siteName: 'the site name'}
            this.uiRenderer.toast(`Site ${e.siteName} removed`);
            manager.resyncAll({withUpdate: true}); // should act based on data only
            // TODO: maybe update the site in the list?
        });
    }

    _legacyAddBadges(stats) {
        let consecutiveTimeout = stats.countTimeouts;
        let otherErrors = stats.errors;
        let html = ' ';

        if (consecutiveTimeout) {
            html += `<span class="badge badge-pill badge-warning" title="${consecutiveTimeout} consecutive timeouts">${consecutiveTimeout}</span>`;
        }

        if (otherErrors) {
            html += `<span class="badge badge-pill badge-warning" title="${otherErrors.errorMessage}">${helpers.getEnumText(K.ErrorType, otherErrors.errorType)}</span>`;
        }
        return html;
    }

    removeDeletedSitesRows(validSiteIds) {
        let removableRows = [...document.querySelectorAll('#schedule-table-body tr')].filter(r => !validSiteIds.includes(r.dataset.id));
        removableRows.forEach(r => {
            r.remove();
        });
    }

    renderSiteRow(site) {
        // console.info(site, `@renderSiteRow`);

        let row = [...document.querySelectorAll('#schedule-table-body tr')]
                    .filter(r => r.dataset.id == site.id);

        if (row.length == 0) {
            // console.warn(`No ROW found for this site!`);
            row = document.createElement('tr');
            document.querySelector('#schedule-table-body').appendChild(row);
            row.setAttribute('aria-expanded', false);
            row.classList.add('align-middle');
            row.dataset.id = site.id;
            row.dataset.cmc = site.cmc;
        } else {
            row = row[0];
        }

        // TODO: update values!
        row.dataset.json = `${JSON.stringify(site)}`;
        row.dataset.schedule = site.schedule;
        row.dataset.nextRollTimestamp = site.nextRoll ? site.nextRoll.getTime() : 'null';
        row.dataset.enabled = site.enabled ? '1' : '0';
        if (site.balance) {
            if (typeof site.balance == 'string') {
                row.dataset.balance = site.balance.split(' ')[0];
            } else {
                row.dataset.balance = site.balance.toFixed(8);
            }
        } else {
            row.dataset.balance = '';
        }

        let tds = '';

        tds += '<td class="align-middle edit-status d-none em-only"><label class="switch"><input type="checkbox" data-original="' + (site.enabled ? '1' : '0') + '" ' + (site.enabled ? 'checked' : ' ') + '><span class="slider round"></span></label></td>';
        tds += '<td class="align-middle" title="' + helpers.getPrintableDateTime(site.nextRoll) + '"><span><i class="fas fa-square pr-1" style="color: #' + site.schedule + ';"></i></span>' + helpers.getTdPrintableTime(site.nextRoll) + '</td>';
        if (site.isExternal && site.clId == -1) {
            tds += '<td class="align-middle text-left"><a class="" title="Visit site" target="_blank" rel="noreferrer" href="' + site.url + '"><i class="fa fa-external-link-alt"></i></a></td>';
        } else {
            tds += '<td class="align-middle text-left"><a class="" title="Visit site" target="_blank" rel="noreferrer" href="' + (new URL(site.clId, 'https://criptologico.com/goto/')).href + '"><i class="fa fa-external-link-alt"></i></a></td>';
        }

        tds += '<td class="align-middle em-input text-left" data-field="displayName">';
        if (site.cmc) {
            tds +='<div class="input-group input-group-sm">';
            tds += '<div class="input-group-prepend"><span class="input-group-text">';
            if (site.cmc > 0) {
                let cmcLower = helpers.getEnumText(K.CMC, site.cmc).toLowerCase();
                tds += '<img loading="lazy" src="/static/c-icons/' + cmcLower + '.svg" height="20" alt="' + cmcLower + '">';
            } else {
                tds += '<i class="fa fa-question-circle"></i>';
            }
            tds += '</span></div>';
        }
        tds += ' <span class="site-name-container px-1">' + site.name + '</span></div></td>';

        tds +='<td class="align-middle text-right">' + site.lastClaim.toFixed(Number.isInteger(site.lastClaim) ? 0 : 8) + '</td>';
        tds +='<td class="align-middle text-right">' + site.aggregate.toFixed(Number.isInteger(site.aggregate) ? 0 : 8) + '</td>';

        tds += '<td class="align-middle text-right">' + (+row.dataset.balance > 100 ? (+row.dataset.balance).toFixed(2) : row.dataset.balance)  + '</td>';
        tds +='<td class="align-middle text-right fiat-conversion em-hide"></td>';
        tds +='<td class="align-middle">' + this._legacyAddBadges(site.stats) + '</td>';
        tds +='<td class="align-middle justify-content-center em-hide">';

        tds += 
        `<div class="btn-group btn-group-sm">
            <button type="button" title="Run ASAP" class="btn btn-default action-run-asap">
                <i class="fa fa-bolt"></i>
            </button>
            <button type="button" title="Schedule parameters..." 
                class="btn btn-default action-edit-site ${Object.keys(site.params).some( k => k.endsWith('.override') && site.params[k] == true ) ? 'text-warning' : ''}">
                <i class="fa fa-clock"></i>
            </button>
            <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-default dropdown-toggle dropdown-icon" data-toggle="dropdown" aria-expanded="false">
                </button>
                <div class="dropdown-menu dropdown-menu-right text-sm" style="">
                    <!-- <a class="dropdown-item action-site-edit-parameters"><i class="fa fa-edit"></i> Site parameters...</a> -->
                    <a class="dropdown-item action-site-assign-schedule"><i class="fa fa-exchange-alt"></i> Move to...</a>`;
        if (site.isExternal) {
            tds += `<a class="dropdown-item action-site-remove-external"><i class="fa fa-trash"></i> Remove site</a>`;
        }
        tds += `</div></div></div>`;

        tds +='</td></tr>';
        // tableBody +=`<tr class="expandable-body d-none"><td colspan="9"><div>Lorem Ipsum.</div></td></tr>`;

        row.innerHTML = tds;
    }

    legacyRenderSiteData(site, config) {
        document.querySelector('#faucet-name').innerHTML = site.name;
        document.querySelector('#faucet-name').dataset.id = site.id;
        let data = site.params || {};

        for (const prop in config) {
            let overrideElement = document.querySelector('[data-site-prop="' + prop + '.override"]');
            if (overrideElement) {
                overrideElement.dataset.original = (data[prop + '.override'] ? "1" : "0");
                overrideElement.checked = data[prop + '.override'];
            }

            let element = document.querySelector('[data-site-prop="' + prop + '"]');
            if(element) {
                if(element.type == 'select-one' || element.type == 'text' || element.type == 'password' || element.type == 'number' || element.type == 'time') {
                    element.dataset.original = data[prop] ?? config[prop];
                    element.value = data[prop] ?? config[prop];
                } else if (element.type == 'checkbox') {
                    element.dataset.original = ((data[prop] ?? config[prop]) ? "1" : "0");
                    element.checked = data[prop] ?? config[prop];
                }
                element.disabled = true;
            }
        }

        let elWorkInBackgroundOverride = document.querySelector('[data-site-prop="defaults.workInBackground.override"]');
        let elWorkInBackground = document.querySelector('[data-site-prop="defaults.workInBackground"]');
        elWorkInBackground.disabled = !elWorkInBackgroundOverride.checked;
        elWorkInBackgroundOverride.onchange = function (e) {
            document.querySelector('[data-site-prop="defaults.workInBackground"]').disabled = !e.target.checked;
        }

        let elTimeoutOverride = document.querySelector('[data-site-prop="defaults.timeout.override"]');
        let elTimeout = document.querySelector('[data-site-prop="defaults.timeout"]');
        elTimeout.disabled = !elTimeoutOverride.checked;
        elTimeoutOverride.onchange = function (e) {
            document.querySelector('[data-site-prop="defaults.timeout"]').disabled = !e.target.checked;
        }

        let elPostponeOverride = document.querySelector('[data-site-prop="defaults.postponeMinutes.override"]');
        let elPostpone = document.querySelector('[data-site-prop="defaults.postponeMinutes"]');
        let elPostponeMin = document.querySelector('[data-site-prop="defaults.postponeMinutes.min"]');
        let elPostponeMax = document.querySelector('[data-site-prop="defaults.postponeMinutes.max"]');
        elPostpone.disabled = !elPostponeOverride.checked;
        elPostponeMin.disabled = !elPostponeOverride.checked || (elPostpone.value > "0");
        elPostponeMax.disabled = !elPostponeOverride.checked || (elPostpone.value > "0");
        elPostponeOverride.onchange = function (e) {
            let mode = document.querySelector('[data-site-prop="defaults.postponeMinutes"]');
            mode.disabled = !e.target.checked;
            document.querySelector('[data-site-prop="defaults.postponeMinutes.min"]').disabled = !e.target.checked || mode.value > 0;
            document.querySelector('[data-site-prop="defaults.postponeMinutes.max"]').disabled = !e.target.checked || mode.value > 0;
        }
        elPostpone.onchange = function (e) {
            document.querySelector('[data-site-prop="defaults.postponeMinutes.min"]').disabled = e.target.value > 0;
            document.querySelector('[data-site-prop="defaults.postponeMinutes.max"]').disabled = e.target.value > 0;
            if (e.target.value > 0) {
                document.querySelector('[data-site-prop="defaults.postponeMinutes.min"]').value = e.target.value;
                document.querySelector('[data-site-prop="defaults.postponeMinutes.max"]').value = e.target.value;
            }
        }

        let elNextRunOverride = document.querySelector('[data-site-prop="defaults.nextRun.override"]');
        let elNextRun = document.querySelector('[data-site-prop="defaults.nextRun"]');
        let elNextRunMin = document.querySelector('[data-site-prop="defaults.nextRun.min"]');
        let elNextRunMax = document.querySelector('[data-site-prop="defaults.nextRun.max"]');
        let elNextRunUseCountdown = document.querySelector('[data-site-prop="defaults.nextRun.useCountdown"]');
        elNextRun.disabled = !elNextRunOverride.checked;
        elNextRunMin.disabled = !elNextRunOverride.checked || (elNextRun.value > "0");
        elNextRunMax.disabled = !elNextRunOverride.checked || (elNextRun.value > "0");
        elNextRunUseCountdown.disabled = !elNextRunOverride.checked;
        elNextRunOverride.onchange = function (e) {
            let mode = document.querySelector('[data-site-prop="defaults.nextRun"]');
            mode.disabled = !e.target.checked;
            document.querySelector('[data-site-prop="defaults.nextRun.min"]').disabled = !e.target.checked || mode.value > 0;
            document.querySelector('[data-site-prop="defaults.nextRun.max"]').disabled = !e.target.checked || mode.value > 0;
            document.querySelector('[data-site-prop="defaults.nextRun.useCountdown"]').disabled = !e.target.checked;
        }
        elNextRun.onchange = function (e) {
            document.querySelector('[data-site-prop="defaults.nextRun.min"]').disabled = e.target.value > 0;
            document.querySelector('[data-site-prop="defaults.nextRun.max"]').disabled = e.target.value > 0;
            if (e.target.value > 0) {
                document.querySelector('[data-site-prop="defaults.nextRun.min"]').value = e.target.value;
                document.querySelector('[data-site-prop="defaults.nextRun.max"]').value = e.target.value;
            }
        }

        let elSleepOverride = document.querySelector('[data-site-prop="defaults.sleepMode.override"]');
        let elSleep = document.querySelector('[data-site-prop="defaults.sleepMode"]');
        let elSleepMin = document.querySelector('[data-site-prop="defaults.sleepMode.min"]');
        let elSleepMax = document.querySelector('[data-site-prop="defaults.sleepMode.max"]');
        elSleep.disabled = !elSleepOverride.checked;
        // elNextRun.disabled = !elNextRunOverride.checked;
        elSleepMin.disabled = !elSleepOverride.checked || !elSleep.checked;
        elSleepMax.disabled = !elSleepOverride.checked || !elSleep.checked;
        elSleepOverride.onchange = function (e) {
            let mode = document.querySelector('[data-site-prop="defaults.sleepMode"]');
            mode.disabled = !e.target.checked;
            document.querySelector('[data-site-prop="defaults.sleepMode.min"]').disabled = !e.target.checked || !mode.checked;
            document.querySelector('[data-site-prop="defaults.sleepMode.max"]').disabled = !e.target.checked || !mode.checked;
        }
        elSleep.onchange = function (e) {
            document.querySelector('[data-site-prop="defaults.sleepMode.min"]').disabled = !e.target.checked;
            document.querySelector('[data-site-prop="defaults.sleepMode.max"]').disabled = !e.target.checked;
        }

        return;
    }

    sortSitesTable() {
        const tbody = document.querySelector('#schedule-table-body');

        let rows, switching, i, shouldSwitch;
        switching = true;
        while (switching) {
            switching = false;
            rows = tbody.rows;

            for (i = 0; i < (rows.length - 1); i++) {
                shouldSwitch = false;

                let aNextRoll, bNextRoll, aHasLoginError, bHasLoginError, aName, bName;
                aNextRoll = rows[i].dataset.nextRollTimestamp;
                bNextRoll = rows[i + 1].dataset.nextRollTimestamp;
                if (aNextRoll == 'null' && bNextRoll == 'null') {
                    // TODO: check if it has login error! Now using just the name
                    aName = rows[i].querySelector('.site-name-container').innerText;
                    bName = rows[i + 1].querySelector('.site-name-container').innerText;
                    if (aName.toLowerCase() > bName.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (aNextRoll == 'null' || (aNextRoll > bNextRoll)) {
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }

    onClickOnSitesTableBody(e) {
        console.log({theEvent: e});
        let actionElement = e.target;
        if (actionElement.tagName === 'I') {
            actionElement = actionElement.parentElement;
        }
        const row = actionElement.closest('tr');
        if (actionElement.classList.contains('action-edit-site')) {
            e.stopPropagation();
            console.log('opening site edit dialog', row.dataset.id);
            this.uiRenderer.openModal('modal-site', row.dataset.id);
        } else if (actionElement.classList.contains('action-run-asap')) {
            e.stopPropagation();
            Site.setAsRunAsap(row.dataset.id);
        } else if (actionElement.classList.contains('action-site-assign-schedule')) {
            // e.stopPropagation();
            console.log('opening siteAssignSchedule dialog', row.dataset.id);
            this.uiRenderer.openModal('modal-assign-schedule', { site_id: row.dataset.id, schedule_id: row.dataset.schedule });
        } else if (actionElement.classList.contains('action-site-edit-parameters')) {
            // e.stopPropagation();
            console.log('opening siteEditParameters dialog', row.dataset.id);
            this.uiRenderer.openModal('modal-site-parameters', { site_id: row.dataset.id });
        } else if (actionElement.classList.contains('action-site-remove-external')) {
            // e.stopPropagation();
            Site.remove(row.dataset.id);
            console.info('TODO: remove site and all the related configuration', row.dataset.id);
        }
    }

    onClickOnModalAssignSchedule(e) {
        const modalAssignScheduleToSite = document.querySelector('#modal-assign-schedule');
        let actionElement = e.target.tagName === 'I' ? e.target.parentElement : e.target;
        if (actionElement.classList.contains('modal-save')) {
            let data = this.uiRenderer.parseContainer(modalAssignScheduleToSite.querySelector('.form-container'));
            if (data.original_schedule_id == data.schedule) {
                console.log(`Schedule did not change!`);
            } else {
                Site.getById(data.site_id).changeSchedule(data.schedule);
            }
        }
    }

    onClickOnModalAddSite(e) {
        const modal = document.querySelector('#modal-add-site');
        let actionElement = e.target.tagName === 'I' ? e.target.parentElement : e.target;
        if (actionElement.classList.contains('modal-save')) {
            let formData = this.uiRenderer.parseContainer(modal.querySelector('.form-container'));
            console.log(formData);
            let data = {};
            data.name = formData.site_name;
            data.url = new URL(formData.site_url);
            data.schedule = formData.schedule;
            data.clId = -1;
            data.id = 'ext_rnd_id_' + helpers.randomString(8);
            data.type = K.WebType.UNDEFINED;
            data.cmc = -1;
            data.rf = '';
            data.isExternal = true;

            console.warn('Savable new site');
            console.log(data);
            Site.add(data);
            return;
            if (data.original_schedule_id == data.schedule) {
                console.log(`Schedule did not change!`);
            } else {
                Site.getById(data.site_id).changeSchedule(data.schedule);
            }
        }
    }

    onClickOnEditAllSites(e) {
        document.querySelectorAll("#schedule-table-body td.em-input .site-name-container").forEach(function (x) {
            let val = x.innerHTML;
            x.innerHTML = "<input type=\'text\' class=\'form-control form-control-sm\' data-original=\'" + val.trim() + "\' value=\'" + val.trim() + "\' />";
        });
        document.querySelectorAll("#schedule-table-body td.edit-status").forEach(function (x) {
            // let activeSwitch = x.querySelector("input");
            x.classList.remove("d-none");
        });
        document.querySelectorAll(".em-only").forEach(x => x.classList.remove("d-none"));
        document.querySelectorAll(".em-hide").forEach(x => x.classList.add("d-none"));
    }

    onClickOnCancelEditAllSites(e) {
        document.querySelectorAll("#schedule-table-body td.em-input .site-name-container input").forEach(function(x) {
            x.parentNode.innerHTML = x.dataset.original;
        });
        document.querySelectorAll(".em-only").forEach(x => x.classList.add("d-none"));
        document.querySelectorAll(".em-hide").forEach(x => x.classList.remove("d-none"));
    }

    onClickOnSaveEditAllSites(e) {
        // let updateObject = window.getUpdateObject();
        let updateObject;
        var updateData = document.getElementById("update-data");
        if (updateData.innerHTML != "") {
            updateObject = JSON.parse(updateData.innerHTML);
        } else {
            updateObject = {
                runAsap: { ids: [], changed: false }, 
                editSingle: { changed: false, items: [] }, 
                wallet: { changed: false, items: [] }, 
                config: { changed: false, items: [] }, 
                site: { changed: false, list: [] }
            };
        }

        document.querySelectorAll("#schedule-table-body tr").forEach(function (row) {
            let textInputCell = row.querySelector(".em-input .site-name-container");
            let textInput = textInputCell.querySelector("input");
            let activeSwitch = row.querySelector("td.edit-status input");
            let single = { id: row.dataset.id, displayName: textInput.dataset.original, enabled: activeSwitch.dataset.original };
            textInputCell.innerHTML = textInput.value;
            if(textInput.dataset.original != textInput.value) {
                single.displayName = textInput.value;
            }
            if(activeSwitch.dataset.original != Boolean(activeSwitch.checked)) {
                single.enabled = Boolean(activeSwitch.checked);
            }
            if(textInput.dataset.original != textInput.value || activeSwitch.dataset.original != Boolean(activeSwitch.checked)) {
                updateObject.editSingle.items.push(single);
                updateObject.editSingle.changed = true;
            }
        });
        if(updateObject.editSingle.changed) {
            document.getElementById("update-data").innerHTML = JSON.stringify(updateObject);
            this.uiRenderer.toast("Data will be updated as soon as possible");
        }

        document.querySelectorAll(".em-only").forEach(x => x.classList.add("d-none"));
        document.querySelectorAll(".em-hide").forEach(x => x.classList.remove("d-none"));
    }

    onClickOnAddSiteButton(e) {
        e.stopPropagation();
        console.log(`@Open AddSite`);
        this.uiRenderer.openModal('modal-add-site');
    }

    renderAddExternalSite() {
        const modalAssignSchedule = document.getElementById('modal-add-site');
        // modalAssignSchedule.querySelector('input[name="site_id"]').value = values.site_id;
        // modalAssignSchedule.querySelector('input[name="original_schedule_id"]').value = values.schedule_id;
        let selectElm = modalAssignSchedule.querySelector('select');
        let options = [];
        let firstSchedule = '';
        Schedule.getAllForCrud().forEach(sch => {
            // TODO: icon is not rendered.. try .selectpicker or something else (dropdown with a disabled or hidden input to store the selection?)
            if (firstSchedule == '') {
                firstSchedule = sch.uuid;
            }
            options.push(`<option value="${sch.uuid}"><i class="fas fa-square" style="color: #${sch.uuid}"></i>${sch.name}</option>`)
        });
        selectElm.innerHTML = options.join('');
        selectElm.value = firstSchedule;
        return;
    }

    renderAssignScheduleToSite(values) {
        const modalAssignSchedule = document.getElementById('modal-assign-schedule');
        modalAssignSchedule.querySelector('input[name="site_id"]').value = values.site_id;
        modalAssignSchedule.querySelector('input[name="original_schedule_id"]').value = values.schedule_id;
        let selectElm = modalAssignSchedule.querySelector('select');
        let options = [];
        Schedule.getAllForCrud().forEach(sch => {
            // TODO: icon is not rendered.. try .selectpicker or something else (dropdown with a disabled or hidden input to store the selection?)
            options.push(`<option value="${sch.uuid}"><i class="fas fa-square" style="color: #${sch.uuid}"></i>${sch.name}</option>`)
        });
        selectElm.innerHTML = options.join('');
        selectElm.value = values.schedule_id || "";
        return;
    }
}

