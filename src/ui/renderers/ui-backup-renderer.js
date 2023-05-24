class UiBackupRenderer extends UiBaseRenderer {
    appendEventListeners() {
        console.log(`@UiBackupRenderer.appendEventListeners`);
        // document.querySelector('#schedules-toggler').addEventListener('change', this.onScheduleToggled.bind(this));
    }

    onScheduleToggled(e) {
        e.stopPropagation();
        let actionElement = e.target.tagName !== 'LABEL' ? e.target.closest('label') : e.target;
        let otherActiveLabels = [...actionElement.parentElement.querySelectorAll('label.active')].filter(l => l.dataset.schedule != actionElement.dataset.schedule);
        console.log(otherActiveLabels);
        if (otherActiveLabels.length > 0) {
            otherActiveLabels.forEach(l => l.classList.remove('active'));
        }
        this.toggleSchedule(actionElement.dataset.schedule);
    }

    toggleSchedule(uuid) {
        console.log('@toggleSchedule');

        if (uuid) {
            this.selectedSchedule = uuid;
        } else {
            if (!this.selectedSchedule) {
                this.selectedSchedule = 'all';
            }
        }

        [...document.querySelectorAll('#schedule-table-body tr')].forEach((row) => {
            // if (row.classList.contains('expandable-body')) {
            //     row.classList.add('d-none');
            //     return;
            // }
            if (this.selectedSchedule == 'all') {
                row.classList.remove('d-none');
            } else if (row.getAttribute('data-schedule') == this.selectedSchedule) {
                row.classList.remove('d-none');
            } else {
                row.classList.add('d-none');
            }
        });

        if (this.selectedSchedule == 'all') {
            [...document.querySelectorAll('#console-log tr')].forEach(x => {
                x.classList.remove('d-none');
            })
        } else {
            [...document.querySelectorAll('#console-log tr')].forEach(x => {
                if (x.getAttribute('data-schedule') == 'false' || x.getAttribute('data-schedule') == this.selectedSchedule) {
                    x.classList.remove('d-none');
                } else {
                    x.classList.add('d-none');
                }
            })
        }
    };

    renderTBody() {
        let rows = [];
        manager.Schedule.getAllForCrud().forEach(sch => {
            rows.push(this.renderRow(sch));
        });
        return rows.join('');
    }

    renderRow(sch) {
        // TODO: block default schedule edition (except for the name). No delete, no color change? Or maybe decouple the uuid from the color...
        let row = 
        `<tr data-uuid="${sch.uuid}" 
                data-order="${sch.order}" 
                data-added="${sch.added ? 'true' : 'false'}" 
                data-removed="false" 
                data-updated="false" 
                data-originals='${!sch.added ? JSON.stringify(sch) : ""}'>
            <td class="row-handle"><i class="fas fa-grip-vertical"></i></td>
            <td><div class="input-group input-group-sm color-picker colorpicker-element" style="max-width: 125px;">
                <div class="input-group-prepend"><span class="input-group-text"><i class="fas fa-square" style="color: #${sch.uuid}"></i></span></div>
                <input type="text" name="uuid" class="form-control" data-original-title="" value="${sch.uuid}">
            </div></td>
            <td><input type="text" name="name" class="form-control form-control-sm" value="${sch.name}"></td>
            <td>
                <button type="button" title="Remove" class="btn btn-default btn-sm action-schedule-remove"><i class="fa fa-trash"></i></button>
            </td>
        </tr>`;
        return row;
    }
}

