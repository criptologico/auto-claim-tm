function createUi() {

    let injectables = {
        managerJs: function () {

            window.myBarChart = null;
            window.landing = window.location.host;

            window.sendErrorReport = function sendErrorReport() {
                try {
                    let header = new Headers();
                    header.append("Content-Type", "application/json");
                    let description = document.getElementById("log-message").value;
                    let log = document.getElementById("log-textarea").value.split('\n');
                    let content = {"description":description, "log":log};
                    let opt = { method: "POST", header, mode: "cors", body: JSON.stringify(content) };
                    fetch("https://1d0103ec5a621b87ea27ffed3c072796.m.pipedream.net", opt).then(response => {
                    }).catch(err => {
                        console.error("[error] " + err.message);
                    });
                } catch { }
            };

            window.getUpdateObject = function getUpdateObject() {
                let updateObject;
                var updateData = document.getElementById("update-data");
                if (updateData.innerHTML != "") {
                    updateObject = JSON.parse(updateData.innerHTML);
                } else {
                    updateObject = { runAsap: { ids: [], changed: false}, editSingle: { changed: false, items: [] }, wallet: { changed: false, items: []}, config: { changed: false, items: []}, site: { changed: false, list: []} };
                }
                return updateObject;
            };

            window.removePromoCode = function removePromoCode(id, code) {
                var promoCode = document.getElementById("promo-code-new");
                var promoObject = { action: "REMOVE", id: id, code: code };
                promoCode.innerHTML =JSON.stringify(promoObject);
                // this.uiRenderer.toast("Removing promo code " + code);
            };
    
            // window.editList = function editList() {
            //     document.querySelectorAll("#schedule-table-body td.em-input .site-name-container").forEach(function (x) {
            //         let val = x.innerHTML;
            //         x.innerHTML = "<input type=\'text\' class=\'form-control form-control-sm\' data-original=\'" + val.trim() + "\' value=\'" + val.trim() + "\' />";
            //     });
            //     document.querySelectorAll("#schedule-table-body td.edit-status").forEach(function (x) {
            //         let activeSwitch = x.querySelector("input");
            //         x.classList.remove("d-none");
            //     });
            //     document.querySelectorAll(".em-only").forEach(x => x.classList.remove("d-none"));
            //     document.querySelectorAll(".em-hide").forEach(x => x.classList.add("d-none"));
            // };

            // window.editListSave = function editListSave() {
            //     let updateObject = getUpdateObject();
            //     document.querySelectorAll("#schedule-table-body tr").forEach(function (row) {
            //         let textInputCell = row.querySelector(".em-input .site-name-container");
            //         let textInput = textInputCell.querySelector("input");
            //         let activeSwitch = row.querySelector("td.edit-status input");
            //         let single = { id: row.dataset.id, displayName: textInput.dataset.original, enabled: activeSwitch.dataset.original };
            //         textInputCell.innerHTML = textInput.value;
            //         if(textInput.dataset.original != textInput.value) {
            //             single.displayName = textInput.value;
            //         }
            //         if(activeSwitch.dataset.original != Boolean(activeSwitch.checked)) {
            //             single.enabled = Boolean(activeSwitch.checked);
            //         }
            //         if(textInput.dataset.original != textInput.value || activeSwitch.dataset.original != Boolean(activeSwitch.checked)) {
            //             updateObject.editSingle.items.push(single);
            //             updateObject.editSingle.changed = true;
            //         }
            //     });
            //     if(updateObject.editSingle.changed) {
            //         document.getElementById("update-data").innerHTML = JSON.stringify(updateObject);
            //         uiRenderer.toast("Data will be updated as soon as possible");
            //     }

            //     document.querySelectorAll(".em-only").forEach(x => x.classList.add("d-none"));
            //     document.querySelectorAll(".em-hide").forEach(x => x.classList.remove("d-none"));
            //     // if (!localStorage.getItem("hiddenSiteIds")) {
            //     //     document.querySelector('#unhide-btn').classList.add("d-none");
            //     // }
            // };

            // window.editListCancel = function editListCancel() {
            //     document.querySelectorAll("#schedule-table-body td.em-input .site-name-container input").forEach(function(x) {
            //         x.parentNode.innerHTML = x.dataset.original;
            //     });
            //     document.querySelectorAll(".em-only").forEach(x => x.classList.add("d-none"));
            //     document.querySelectorAll(".em-hide").forEach(x => x.classList.remove("d-none"));
            // };

            window.editWallet = {
                save: function() {
                    let updateObject = getUpdateObject();
                    document.querySelectorAll("#wallet-table-body tr").forEach( function(row) {
                        let textInput = row.querySelector(".em-input input");
                        if(textInput.dataset.original != textInput.value) {
                            let single = { id: row.dataset.id, address: textInput.value.trim() };
                            updateObject.wallet.items.push(single);
                            updateObject.wallet.changed = true;
                        }
                    });
                    if(updateObject.wallet.changed) {
                        document.getElementById("update-data").innerHTML = JSON.stringify(updateObject);
                        toastr["info"]("Wallet will be updated as soon as possible");
                    }
                },
                toggleJson: function(val) {
                    if (document.querySelector('#wallet-json').isVisible()) {
                        if(val != 'cancel') {
                            editWallet.fromJson();
                        }
                    } else {
                        editWallet.toJson();
                    }
                    document.querySelector('.footer-json').classList.toggle('d-none');
                    document.querySelector('.footer-table').classList.toggle('d-none');
                    document.querySelector('#wallet-table').classList.toggle('d-none');
                    document.querySelector('#wallet-json').classList.toggle('d-none');
                },
                toJson: function() {
                    let j = [];
                    document.querySelectorAll('#wallet-table-body tr').forEach(function (row) {
                        j.push({ id: row.dataset.id, address: row.querySelector('.em-input input').value });
                    });
                    document.querySelector('#wallet-json').value = JSON.stringify(j);
                },
                fromJson: function() {
                    let j = JSON.parse(document.querySelector('#wallet-json').value);
                    document.querySelectorAll('#wallet-table-body tr').forEach(function (row) {
                        let element = j.find(x => x.id == row.dataset.id);
                        if (element) {
                            row.querySelector('.em-input input').value = element.address;
                        }
                    });
                },
                cancel: function() {
                    document.querySelectorAll("#wallet-table-body .em-input input").forEach( function(x) {
                        x.value = x.dataset.original;
                    });
                }
            };

            window.editConfig = {
                save: function() {
                    let updateObject = getUpdateObject();
                    document.querySelectorAll("#modal-config [data-original][data-prop]").forEach(function(elm) {
                        let single = { prop: elm.dataset.prop, value: elm.dataset.value };
                        if(elm.dataset.original != elm.value && (elm.type == "select-one" || elm.type == "text" || elm.type == "password" || elm.type == "number" || elm.type == "time") ) {
                            single.value = elm.value;
                            updateObject.config.items.push(single);
                            updateObject.config.changed = true;
                        } else if (elm.type == "checkbox" && ((elm.dataset.original == "0" && elm.checked) || (elm.dataset.original == "1" && !elm.checked)) ) {
                            single.value = elm.checked;
                            updateObject.config.items.push(single);
                            updateObject.config.changed = true;
                        }
                    });
                    if(updateObject.config.changed) {
                        document.getElementById("update-data").innerHTML = JSON.stringify(updateObject);
                        toastr["info"]("Config will be updated as soon as possible");
                    }
                },
                cancel: function() {
                    document.querySelectorAll("#modal-config [data-original][data-prop]").forEach(function(elm) {
                        if(elm.type == "select-one" || elm.type == "text" || elm.type == "password" || elm.type == "number" || elm.type == "time") {
                            elm.value = elm.dataset.original;
                        } else if (elm.type == "checkbox") {
                            elm.checked = (elm.dataset.original == "1" ? true : false)
                        }
                    });
                }
            };

            window.editSite = {
                save: function() {
                    let updateObject = getUpdateObject();
                    let faucet = { id: document.querySelector("#faucet-name").dataset.id, items: [] };
                    document.querySelectorAll("#modal-site [data-original][data-site-prop]").forEach(function(elm) {
                        let single = { prop: elm.dataset.siteProp, value: elm.dataset.original };
                        if(elm.dataset.original != elm.value && (elm.type == "select-one" || elm.type == "text" || elm.type == "password" || elm.type == "number" || elm.type == "time") ) {
                            single.value = elm.value;
                            faucet.items.push(single);
                            updateObject.site.changed = true;
                        } else if (elm.type == "checkbox" && ((elm.dataset.original == "0" && elm.checked) || (elm.dataset.original == "1" && !elm.checked)) ) {
                            single.value = elm.checked;
                            faucet.items.push(single);
                            updateObject.site.changed = true;
                        }
                    });
                    if(updateObject.site.changed) {
                        updateObject.site.list.push(faucet);
                        document.getElementById("update-data").innerHTML = JSON.stringify(updateObject);
                        toastr["info"]("Site will be updated as soon as possible");
                    }

                },
                cancel: function() {
                    document.querySelectorAll("#modal-site [data-original][data-site-prop]").forEach(function(elm) {
                        if(elm.type == "select-one" || elm.type == "text" || elm.type == "password" || elm.type == "number" || elm.type == "time") {
                            elm.value = elm.dataset.original;
                        } else if (elm.type == "checkbox") {
                            elm.checked = (elm.dataset.original == "1" ? true : false)
                        }
                    });
                }
            };

            window.editEreport = {
                save: function() {
                    sendErrorReport();
                },
                cancel: function() {
                }
            };

            window.modalSave = function modalSave(content) {
                switch(content) {
                    case "wallet":
                        editWallet.save();
                        break;
                    case "ereport":
                        editEreport.save();
                        break;
                    case "config":
                        editConfig.save();
                        break;
                    case "site":
                        editSite.save();
                        break;
                    case "slAlert":
                        shortlinkAlert.save();
                        break;
                }
            };

            window.modalCancel = function modalCancel(content) {
                if(content == "wallet") {
                    editWallet.cancel();
                } else if ("ereport") {
                    editEreport.cancel();
                }
                document.querySelectorAll("modal-content").forEach(x => x.classList.add("d-none"));
            };

            window.updateValues = function updateValues(type, values) {
                let updateObject = getUpdateObject();
                if (type == "runAsap") {
                    updateObject.runAsap.ids.push(values.id);
                    updateObject.runAsap.changed = true;
                    document.getElementById("update-data").innerHTML = JSON.stringify(updateObject);
                    uiRenderer.toast("Faucet will be updated to run as soon as possible");
                }
            };

            window.schedulesInterval = null;
            window.startSchedulesInterval = function startSchedulesInterval(uuids) {
                console.log(`@window.startSchedulesInterval`);
                if (window.schedulesInterval) {
                    clearInterval(window.schedulesInterval);
                }

                let innerWaitTimes = '';
                uuids.forEach(x => {
                    innerWaitTimes += `<span data-schedule="${x}" data-nextroll="UNDEFINED" class="mx-1"><i class="fas fa-square pr-1" style="color: #${x};"></i><span></span></span>`;
                });

                let container = document.querySelector('#wait-times');
                container.innerHTML = innerWaitTimes;
                window.schedulesInterval = setInterval(() => {
                    [...document.querySelectorAll('#wait-times > span')].forEach(sp => {
                        let nroll = sp.getAttribute('data-nextroll');
                        let spanScheduleId = sp.getAttribute('data-schedule');
                        if (nroll == 'UNDEFINED') {
                            sp.querySelector('span').innerText = '-';
                        } else if (nroll == 'RUNNING') {
                            sp.querySelector('span').innerText = 'Running';
                            let inUseElm = document.querySelector(`#schedule-table tr[data-schedule="${spanScheduleId}"]`);
                            if (inUseElm) {
                                inUseElm.classList.add('in-use');
                            }
                        } else {
                            let timeVal = +nroll - Date.now();
                            sp.querySelector('span').innerText = timeVal.msToCountdown();
                            if (timeVal < -60000) {
                                // TODO: trigger a resync!
                                // Forcing refresh
                                location.reload();
                                // console.warn(`HITTING RELOAD: ${timeVal}`);
                                // console.info(sp);
                                // location.reload();
                            }
                        }
                    })
                }, 1000);
            }
            window.confirmable = {
                open: function (req, details = null, params = null) {
                    // open modal with req/action reference
                    let btn = document.getElementById("confirm-req-btn");
                    btn.setAttribute('data-request', req);
                    btn.setAttribute('data-params', params ? JSON.stringify(params) : '{}');

                    if(details) {
                        document.querySelector("#confirmable-modal p").innerText = details;
                    }
                    return;
                },
                accept: function () {
                    let btn = document.getElementById("confirm-req-btn");
                    let req = { type: '', params: {}};
                    req.type = btn.getAttribute('data-request');
                    req.params = JSON.parse(btn.getAttribute('data-params'));
                    switch(req.type) {
                        case 'removeAllPromos':
                            window.removeAllPromos();
                            break;
                        case 'forceStopFaucet':
                            window.forceStopFaucet();
                            break;
                        default:
                            break;
                    }
                }
            }

            window.removeAllPromos = function removeAllPromos() {
                var promoCode = document.getElementById("promo-code-new");
                var promoObject = { action: "REMOVEALLPROMOS" };
                promoCode.innerHTML =JSON.stringify(promoObject);
                toastr["info"]("Removing all promo codes... please wait");
            };

            window.forceStopFaucet = function forceStopFaucet() {
                var promoCode = document.getElementById("promo-code-new");
                var promoObject = { action: "FORCESTOPFAUCET" };
                promoCode.innerHTML =JSON.stringify(promoObject);
                toastr["info"]("Trying to stop... Please wait for reload");
            };

            window.openStatsChart = function openStatsChart() {
                if(myBarChart) { myBarChart.destroy(); }
                let statsFragment = document.getElementById("stats-fragment");
                if (statsFragment.style.display === "block") { statsFragment.style.display = "none"; document.getElementById("stats-button").innerText = "Lucky Number Stats"; } else {
                    statsFragment.style.display = "block"; document.getElementById("stats-button").innerText = "Close Stats";
                    var canvas = document.getElementById("barChart");
                    var ctx = canvas.getContext("2d");
                    var dataSpan = document.getElementById("rolls-span");
                    var data = {
                        labels: ["0000-9885", "9886-9985", "9986-9993", "9994-9997", "9998-9999", "10000"],
                        datasets: [ { fill: false, backgroundColor: [ "#990000", "#660066", "#000099", "#ff8000", "#ffff00", "#00ff00"],
                                     data: dataSpan.innerText.split(",") } ] };
                    var options = { plugins: { legend: { display: false } }, title: { display: true, text: "Rolled Numbers", position: "top" }, rotation: -0.3 * Math.PI };
                    myBarChart = new Chart(ctx, { type: "doughnut", data: data, options: options });
                }
            };

            window.shortlinkAlert = {
                load: function(id, destination) {
                    let hideShortlinkAlerts = localStorage.getItem("hideShortlinkAlerts");
                    hideShortlinkAlerts = hideShortlinkAlerts ? JSON.parse(hideShortlinkAlerts) : false;

                    if (hideShortlinkAlerts) {
                        //do alert action without warning (go to SL)
                    } else {
                        document.getElementById(id).classList.remove("d-none");
                    }
                },
                save: function () {
                    localStorage.setItem("hideShortlinkAlerts", JSON.stringify(document.getElementById("hideShortlinkAlerts").checked));
                    // go to SL
                    window.open("https://example.com", "_blank");
                }
            }
        }
    };

    let logLines = [];
    function init(cfFaucets, schedules) {
        // appendCSS();
        appendJavaScript();
        appendHtml(schedules);
        updateSchedulesToggler();
        appendEventListeners();
        appendWidgets();
        setupEventerListeners();

        createPromoTable(cfFaucets);
        try {
            document.querySelector('.page-title h1').innerHTML = 'Auto Claim';
        } catch (err) {}
    };
    function setupEventerListeners() {
        eventer.on('siteUpdated', (site) => {
            console.log(site, 'on => siteUpdated');
            // manager.resyncAll({withUpdate: true});
            // Seria:
            Site.sortAll(); // en todos los sites...
            let schedule = Schedule.getById(site.schedule);
            schedule.sortSites(); // solo en el schedule de este site
            schedule.setCurrentSite(); // solo en el schedule de este site
            Site.saveAll();
            uiRenderer.sites.renderSiteRow(site); // solo la row de este site
            uiRenderer.sites.sortSitesTable(); // y reordenar

            schedule.checkNextRoll(); // solo en el schedule de este site    
            convertToFiat();
        });
    }
    function appendWidgets() {
        $('.tableSortable').sortable({
            placeholder:'sort-highlight',
            handle:'.row-handle',
            cursor: 'grabbing',
            axis: 'y',
            stop: function(event, ui) {
                $("tbody.ui-sortable tr").each(function(index) {
                  $(this).attr("data-order", index);
                });
              }
        });
        $('#promo-daily').bootstrapSwitch();
        $('#bss-log').bootstrapSwitch({
            // TODO: state: (nm && nm == 'false' ? false : true), // grab from localSettings
            onSwitchChange(event, state) {
                $('#console-log').collapse('toggle');
            },
            onInit: function(event, state) {
                // $(this).closest('.bootstrap-switch-container').addClass('m-1');
                this.$element.closest('.bootstrap-switch-container').find('.bootstrap-switch-handle-on').first().addClass('fa fa-eye').text('');
                this.$element.closest('.bootstrap-switch-container').find('.bootstrap-switch-handle-off').first().addClass('fa fa-eye-slash').text('');
            }
        });
    };
    function updateSchedulesToggler() {
        let container = document.querySelector('#schedules-toggler');
        let html = '<label class="btn btn-outline-primary active" data-schedule="all"><input type="radio" name="options" autocomplete="off" checked="true"> All</label>';
        Schedule.getAll().forEach(x => {
            html += `<label class="btn btn-outline-primary" data-schedule="${x.uuid}">
            <i class="fas fa-square pr-1" style="color: #${x.uuid};"></i>${x.name}
            <input type="radio" name="options" autocomplete="off">
            </label>`;
        });
        container.innerHTML = html;
        startSchedulesInterval(Schedule.getAllForCrud().map(x => x.uuid));
        uiRenderer.schedules.toggleSchedule('all');
    };
    function appendEventListeners() {
        console.log('@appendEventListeners');
        // Menu links
        document.querySelector('.dropdown-settings-menu').addEventListener('click', function(e) {
            console.log('@click event listener at dropdown-settings-menu');
            console.log(e.target);
            let actionElement = e.target.tagName === 'I' ? e.target.parentElement : e.target;
            if (actionElement.dataset.target) {
                e.stopPropagation();
                uiRenderer.openModal(actionElement.dataset.target);
            }
        });

        // Modal Schedules Listeners
        const modalSchedules = document.querySelector('#modal-schedules');
        modalSchedules.addEventListener('click', function(e) {
            console.log('click callback at modalSchedules');
            console.log(e.target);
            let actionElement = e.target.tagName === 'I' ? e.target.parentElement : e.target;
            console.log(actionElement);
            if (actionElement.classList.contains('action-schedule-add')) {
                e.stopPropagation();
                let rows = modalSchedules.querySelectorAll('table tbody tr');
                let rndColor = helpers.randomHexColor();
                let rowTemplate = uiRenderer.schedules.renderRow({
                    uuid: rndColor,
                    name: rndColor,
                    order: rows.length,
                    added: true
                });
                $(modalSchedules.querySelector('table tbody tr:last-child')).after(rowTemplate);
                uiRenderer.appendColorPickers('table tbody tr:last-child .color-picker');
            } else if (actionElement.classList.contains('action-schedule-remove')) {
                let rows = modalSchedules.querySelectorAll('table tbody tr:not(.d-none)');
                if (rows.length <= 1) {
                    alert('You need to keep at least 1 schedule');
                } else {
                    let current = actionElement.closest('tr');
                    if (current.dataset.added === 'true') {
                        current.remove();
                    } else {
                        current.dataset.removed = 'true';
                        current.classList.add('d-none');
                    }
                }
            } else if (actionElement.classList.contains('modal-save')) {
                let data = uiRenderer.parseTable(modalSchedules.querySelector('table'));
                console.log({tableData: data});
                let isValid = Schedule.crud(data);
                updateSchedulesToggler();
                manager.resyncAll({withUpdate: true});
                if (!isValid) {
                    uiRenderer.toast('Some schedules might have errors/invalid colors', 'warning');
                }
            }
        });
    };
    function appendJavaScript() {
        addJS_Node (null, null, injectables.managerJs);
    };
    function addCardHtml(obj) {
        return `<div class="card m-1"><div class="card-header">${obj.header}</div><div class="card-body px-4">${obj.body}</div></div>`;
    };
    function addRandomBetween(propSelect, propMin, propMax) {
        return `<table><tr><td>
          <select class="form-control" ${propSelect.name}="${propSelect.value}">
           <option value="0">Random between...</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="35">35 minutes</option><option value="45">45 minutes</option><option value="65">65 minutes</option><option value="90">90 minutes</option><option value="120">120 minutes</option>
          </select></td>
          <td><input type="number" data-original="" ${propMin.name}="${propMin.value}" min="1" value="15" step="5" class="form-control"></td><td>and</td><td><input type="number" data-original="" ${propMax.name}="${propMax.value}" value="65" step="5" class="form-control"></td><td>minutes</td></tr></table>`;
    }
    function appendHtml(schedules) {
        let html ='';
        // html = await GM_getResourceText("r_html")
        let tgt = document.querySelector('div.row.py-3');
        if (tgt) {
            let rowDiv = document.createElement('div');
            rowDiv.innerHTML = '<div class="row py-3 ac-log"><div class="col-12 justify-content-center"><div class="card"><div class="card-body" id="referral-table"></div></div></div></div>';
            tgt.after(rowDiv);
        }

        html += '<div class="modal fade" id="confirmable-modal" tabindex="-1" role="dialog" aria-hidden="true">';
        html += '<div class="modal-dialog modal-sm modal-dialog-centered"><div class="modal-content">';
        html += '<div class="modal-header"><h4 class="modal-title">Are you sure?</h4><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button></div>';
        html += '<div class="modal-body"><p></p></div>';
        html += '<div class="modal-footer justify-content-between"><button type="button" class="btn btn-default" data-dismiss="modal">No</button>';
        html += '<button type="button" class="btn btn-primary" data-dismiss="modal" id="confirm-req-btn" onclick="confirmable.accept()">Yes</button></div>';
        html += '</div></div>';
        html += '</div>';

        html += '<div class="modal fade" id="modal-dlg" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true">';
        html += ' <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">';

        // MODAL CONTENTS
        //[Loading]
        html += '<div class="modal-content bg-beige" id="modal-spinner"><div class="modal-body"><div class="d-flex justify-content-center"><span id="target-spinner" class="d-none"></span><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>Loading data</div></div></div>';

        //Error report
        html += '  <div class="modal-content bg-beige d-none" id="modal-ereport">';
        html += '   <div class="modal-header"><h5 class="modal-title"><i class="fa fa-history"></i> Submit an Error</h5></div>';
        html += '    <div class="modal-body">';
        html += '     <div class="alert alert-danger">Don\'t send private information as data might be publicly access.</div>';
        html += '      <textarea rows="4" id="log-message" class="form-control" placeholder="PLEASE do not send logs without describing here the issue you are facing..."></textarea>';
        html += '      <label for="log-textarea">Log</label>';
        html += '      <textarea rows="10" id="log-textarea" class="form-control"></textarea>';
        html += '    </div>';
        html += '    <div class="modal-footer"><a class="btn m-2 anchor btn-outline-danger align-middle" onclick="modalCancel(\'ereport\')" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '    <a class="btn m-2 anchor btn-outline-success align-middle" onclick="modalSave(\'ereport\')" data-dismiss="modal"><i class="fa fa-paper-plane"></i> Send</a></div>';
        html += '  </div>';

        //Wallet
        html += '  <div class="modal-content bg-beige d-none" id="modal-wallet">';
        html += '   <div class="modal-header"><h5 class="modal-title"><i class="fa fa-wallet"></i> Your Addresses</h5></div>';
        html += '    <div class="modal-body">';
        html += '     <div><table class="table custom-table-striped" id="wallet-table">';
        html += '          <thead><tr><th class="">Name</th><th class="">Address</th></tr></thead>';
        html += '          <tbody class="overflow-auto" id="wallet-table-body"></tbody></table><textarea rows="14" id="wallet-json" class="d-none w-100"></textarea>';
        html += '     </div>';
        html += '    </div>';
        html += '<div class="modal-footer">';
        html += '<div class="footer-json d-none">';
        html += '<a class="btn m-2 anchor btn-outline-danger align-middle" onclick="editWallet.toggleJson(\'cancel\')"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '<a class="btn m-2 anchor btn-outline-primary align-middle" onclick="editWallet.toggleJson()"><i class="fa fa-edit"></i> Confirm</a></div>';
        html += '<div class="footer-table"><a class="btn m-2 anchor btn-outline-primary align-middle" onclick="editWallet.toggleJson()"><i class="fa fa-edit"></i> Edit as JSON</a>';
        html += '<a class="btn m-2 anchor btn-outline-danger align-middle" onclick="modalCancel(\'wallet\')" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '<a class="btn m-2 anchor btn-outline-success align-middle" onclick="modalSave(\'wallet\')" data-dismiss="modal"><i class="fa fa-check-circle"></i> Save</a></div></div>';
        html += '   </div>';

        // document.body.appendChild(document.querySelector('#tpl-modal').content);
      
        //Requirements (old)
        // html += '  <div class="modal-content bg-beige d-none" id="modal-requirements">';
        // html += '   <div class="modal-header"><h5 class="modal-title"><i class="fa fa-exclamation-circle"></i> Other requirements</h5></div>';
        // html += '    <div class="modal-body">';
        // html += `<div class="callout callout-warning m-3"><p class="text-justify">Some sites might require specific tools like captcha solvers that are not including in the script.</p></div>`;
        // html += '     <div><table class="table custom-table-striped" id="requirements-table">';
        // for(let r=0; r< tempRequirementsList.length; r++) {
        //     let req = tempRequirementsList[r];
        //     html += `<tr><td>${req.name}</td><td>${req.description}</td><td>${req.suggestion}</td></tr>`;
        // }
        // html += '          <thead><tr><th class="">Name</th><th class="">Description</th><th class="">Suggestion</th></tr></thead>';
        // html += '          <tbody class="overflow-auto" id="requirements-table-body">';
    
        // html += '</tbody></table>';
        // html += '     </div>';
        // html += '    </div>';
        // html += '    <div class="modal-footer">';
        // html += '    <a class="btn m-2 anchor btn-outline-danger align-middle" data-dismiss="modal"><i class="fa fa-times-circle"></i> Close</a>';
        // html += '    </div>';
        // html += '   </div>';

        //Info
        html += '  <div class="modal-content bg-beige d-none" id="modal-info">';
        html += '   <div class="modal-header"><h5 class="modal-title"><i class="fa fa-info"></i> Info</h5></div>';
        html += '    <div class="modal-body">';
        html += '<ul>';
        html += '<li>First of all, make sure you visit our <a href="https://discord.gg/23s9fDgHqe" target="_blank">discord</a> server for specific issues with the script.</li>';
        html += `<li>The script comes with <b>2 schedules</b> (Default and CF). You can add more from <i>Settings > Schedules...</i><br>About the <i>Schedules</i>:`;
        html += `<ul><li>Each schedule will open a new tab, so:<br>N schedules = N simultaneous tabs.</li>`;
        html += `<li>Each schedule has it's own list of sites.<br>You can have N sites per schedule, but each site can be in just 1 schedule to avoid overlapping.</li>`;
        html += `<li>We suggest you to test how many tabs you can run simultaneously before creating too many schedules.<br>Usually, with 4 or 5 it will run smoothly.</li></ul>`;
        html += `</li>`;
        html += '<li>Almost all sites in the list require an external hCaptcha solver or similar scripts/extensions. You can find our free suggestions in Settings > Other requirements...</li>';
        html += '<li>Stormgain requires a GeeTest solver. You can use <a href="https://greasyfork.org/en/scripts/444560" target="_blank">this script</a> to solve the captchas through 2Captcha API service.</li>';
        html += `<li>Some sites pay directly to <a href="https://faucetpay.io/?r=freebtc" target="_blank"><i class="fa fa-external-link-alt"></i> FaucetPay</a>. You need to add your FP addresses at <i>Settings > Wallet...</i> to claim from those sites.</li>`;
        html += `<li>You can set default configurations at <i>Settings > Defaults...</i></li>`;
        html += `<li>At <i>Settings > Defaults</i>, you will also find <i>Site Specific</i> settings like credentials for auto login.</li>`;
        html += '<li>You can override configurations for a specific site using the edit (<i class="fa fa-clock"></i>) buttons</li>';
        html += '<li>When enabling a new site, try it first with the tab on focus, to detect potential issues</li>';
        // html += '<li>You can enable the log in Settings to detect processing problems</li>';
        html += '</ul>';
        html += '    </div>';
        html += '<div class="modal-footer">';
        html += '<a class="btn m-2 anchor btn-outline-warning align-middle" data-dismiss="modal"><i class="fa fa-edit"></i> Close</a></div>';
        html += '   </div>';

        // Modal Schedules
        html += '<div class="modal-content bg-beige" id="modal-schedules">';
        html += '    <div class="modal-header py-2"><h5 class="modal-title"><i class="fa fa-stopwatch"></i> Schedules</h5>';
        html += '        <div class="ml-auto"><button type="button" class="btn btn-default btn-sm action-schedule-add">';
        html += '            <i class="fa fa-plus"></i> Add Schedule';
        html += '        </button></div>';
        html += '    </div>';
        html += '    <div class="modal-body">';
        html += '<div class="callout callout-warning m-0"><p class="text-justify">Each schedule opens sites in a new/different tab.<br>Colors must be unique.</p></div>';
        html += '    <table class="table">';
        html += '        <thead>';
        html += '        <tr><th></th><th class="text-center" width="35%">Color</th><th class="text-center">Name</th><th></th></tr>';
        html += '        </thead>';
        html += '        <tbody class="tableSortable">';
        html += '        </tbody>';
        html += '    </table>';
        html += '    </div>';
        html += '    <div class="modal-footer">';
        html += '    <a class="btn m-2 anchor btn-outline-danger align-middle" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '    <a class="btn m-2 anchor btn-outline-success align-middle modal-save" data-dismiss="modal"><i class="fa fa-check-circle"></i> Save</a>';
        html += '    </div>';
        html += '</div>';

        // Modal Assign Schedule (to a site)
        html += '<div class="modal-content bg-beige" id="modal-assign-schedule">';
        html += '    <div class="modal-header py-2"><h5 class="modal-title"><i class="fa fa-exchange-alt"></i> Move to...</h5>';
        html += '    </div>';
        html += '    <div class="modal-body">';
        html += '      <div class="form-container">';
        html += '       <input type="hidden" name="site_id" value="not_set">';
        html += '       <input type="hidden" name="original_schedule_id" value="not_set">';
        html += '       <label class="control-label">Schedule</label>';
        html += '       <select class="form-control" name="schedule">';
        html += '       </select>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="modal-footer">';
        html += '    <a class="btn m-2 anchor btn-outline-danger align-middle" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '    <a class="btn m-2 anchor btn-outline-success align-middle modal-save" data-dismiss="modal"><i class="fa fa-check-circle"></i> Save</a>';
        html += '    </div>';
        html += '</div>';

        // Modal Add Site
        html += '<div class="modal-content bg-beige" id="modal-add-site">';
        html += '    <div class="modal-header py-2"><h5 class="modal-title"><i class="fa fa-code"></i> Add Site...</h5>';
        html += '    </div>';
        html += '    <div class="modal-body">';
        html += '      <div class="form-container">';
        html += uiRenderer.addInputTextHtml({ required: true, name: 'site_name', value: '', text: 'Display name'});
        html += uiRenderer.addInputTextHtml({ required: true, name: 'site_url', value: '', text: 'Url to open', placeholder: 'Example: https://freebitcoin.io/free' });
        html += '       <label class="control-label">Schedule</label>';
        html += '       <select class="form-control" name="schedule">';
        html += '       </select>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div class="modal-footer">';
        html += '    <a class="btn m-2 anchor btn-outline-danger align-middle" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '    <a class="btn m-2 anchor btn-outline-success align-middle modal-save" data-dismiss="modal"><i class="fa fa-check-circle"></i> Save</a>';
        html += '    </div>';
        html += '</div>';

        // Modal Site Parameters
        html += '<div class="modal-content bg-beige" id="modal-site-parameters">';
        html += '    <div class="modal-header py-2"><h5 class="modal-title"><i class="fa fa-edit"></i> Edit Site Arguments...</h5>';
        html += '    </div>';
        html += '    <div class="modal-body">';
        html += '      <div class="form-container"><form action="">';
        html += `      <div>Soon you'll be able to edit the site's specific settings here (credentials, withdrawal configuration, etc.)<br>`;
        html += `You'll also see the site specific requirements, like required captcha solvers.<br>Meanwhile, go to Settings > Defaults > Site Specifics.<br>If there's something to configurate for this site, it'll be listed there.`;
        html += `<br>You can find a general requirements list in Settings > Other requirements...</div>`;
        html += '      </form></div>';
        html += '    </div>';
        html += '    <div class="modal-footer">';
        html += '    <a class="btn m-2 anchor btn-outline-danger align-middle" data-dismiss="modal"><i class="fa fa-times-circle"></i> Close</a>';
        // html += '    <a class="btn m-2 anchor btn-outline-danger align-middle" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        // html += '    <a class="btn m-2 anchor btn-outline-success align-middle modal-save"><i class="fa fa-check-circle"></i> Save</a>';
        html += '    </div>';
        html += '</div>';

        //Alert Msg
        html += '  <div class="modal-content bg-beige d-none" id="modal-slAlert">';
        html += '   <div class="modal-header"><h5 class="modal-title">Attention</h5></div>';
        html += '    <div class="modal-body">';
        html += '     <div class="alert alert-warning">You will be redirected to a shortlink, and after completing it the new Twitter Daily Promo Code will be added to your table.<br>';
        html += 'This is an optional contribution. You can still get the code the old fashion way.</div>';
        html += uiRenderer.addLegacySliderHtml('id', 'hideShortlinkAlerts', `Stop warning me before a shortlink`);
        html += '   </div>';
        html += '<div class="modal-footer"><a class="btn m-2 anchor btn-outline-danger align-middle" onclick="modalCancel(\'slAlert\')" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '<a class="btn m-2 anchor btn-outline-success align-middle" onclick="modalSave(\'slAlert\')" data-dismiss="modal"><i class="fa fa-external-link-alt"></i> Lets Go!</a></div>';
        html += '   </div>';

        //Edit Site / single faucet
        html += '  <div class="modal-content bg-beige d-none" id="modal-site">';
        html += '    <div class="modal-header"><h5 class="modal-title"><i class="fa fa-clock"></i> <span id="faucet-name" data-id=""></span> Schedule Parameters</h5></div>';
        html += '    <div class="modal-body">';
        html += '     <div class="alert alert-warning">Override Settings for the selected faucet.<br>Faucet-specific configurations will be moved here soon.</div>';
        html += '     <div class="row">';

        html += '     <div class="col-md-12 col-sm-12">';
        html += addCardHtml({
            header: uiRenderer.addLegacySliderHtml('data-site-prop', 'defaults.workInBackground.override', 'Override Work Mode'),
            body: uiRenderer.addLegacySliderHtml('data-site-prop', 'defaults.workInBackground', 'Open tab in background')
        });
        html += addCardHtml({
            header: uiRenderer.addLegacySliderHtml('data-site-prop', 'defaults.nextRun.override', 'Override Next Run'),
            body: `<div>${uiRenderer.addLegacySliderHtml('data-site-prop', 'defaults.nextRun.useCountdown', 'Use faucet countdown when possible')}</div>` +
            `<label class="control-label">Otherwise wait:</label>` +
            addRandomBetween({ name: 'data-site-prop', value: 'defaults.nextRun' }, { name: 'data-site-prop', value: 'defaults.nextRun.min' }, { name: 'data-site-prop', value: 'defaults.nextRun.max' })
        });
        html += addCardHtml({
            header: uiRenderer.addLegacySliderHtml('data-site-prop', 'defaults.sleepMode.override', 'Override Sleep Mode'),
            body: uiRenderer.addLegacySliderHtml('data-site-prop', 'defaults.sleepMode', 'Sleep mode') +
            `<table><tr><td>Don't claim between </td><td><input type="time" data-original="" data-site-prop="defaults.sleepMode.min" class="form-control"></td><td>and</td>
          <td><input type="time" data-original="" data-site-prop="defaults.sleepMode.max" class="form-control"></td></tr></table>`
        });
        html += '         <div class="card m-1"><div class="card-header">Timeout</div>';
        html += '           <div class="card-body px-4">';
        html += addCardHtml({
            header: uiRenderer.addLegacySliderHtml('data-site-prop', 'defaults.timeout.override', 'Override Timeout'),
            body: `<table><tr><td>After</td><td><input type="number" data-original="" data-site-prop="defaults.timeout" min="2" value="5" step="1" class="form-control"></td><td>minutes</td></tr></table>`
        });
        html += addCardHtml({
            header: uiRenderer.addLegacySliderHtml('data-site-prop', 'defaults.postponeMinutes.override', 'Override Postpone'),
            body: `<label class="control-label">After timeout/error, postpone for:</label>` +
            addRandomBetween({ name: 'data-site-prop', value: 'defaults.postponeMinutes' }, { name: 'data-site-prop', value: 'defaults.postponeMinutes.min' }, { name: 'data-site-prop', value: 'defaults.postponeMinutes.max' })
        });
        html += '       </div>';
        html += '     </div>';
        html += '    </div>';
        html += '     </div>';
        html += '    </div>';
        html += '<div class="modal-footer"><a class="btn m-2 anchor btn-outline-danger align-middle" onclick="modalCancel(\'site\')" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '<a class="btn m-2 anchor btn-outline-success align-middle" onclick="modalSave(\'site\')" data-dismiss="modal"><i class="fa fa-check-circle"></i> Save</a></div>';
        html += '   </div>';

        //Config
        html += '<div class="modal-content bg-beige d-none" id="modal-config">';
        html += '  <div class="modal-header"><h5 class="modal-title"><i class="fa fa-cog"></i> Settings</h5></div>';
        html += '  <div class="modal-body">';
        // html += '     <div class="alert alert-danger alert-dismissible fade show" id="alert-settings-01">This form does not upload data. Values are added to a span, then read by the script and locally stored by Tampermonkey using GM_setValue.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
        // html += '     <div class="alert alert-danger alert-dismissible fade show" id="alert-settings-02">Time values are estimated and will be randomly modified by +/-2% aprox.<br>The script will trigger a reload of the page after updating the data.<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
        html += '     <div class="row">';

        html += '     <div class="col-md-12 col-sm-12">';
        html += '         <div class="card card-info m-1"><div class="card-header">Defaults<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-minus"></i></button></div></div>';
        html += '           <div class="card-body px-4">';
        html += `<div>${uiRenderer.addLegacySliderHtml('data-prop', 'defaults.workInBackground', 'Open tabs in background')}</div>`;
        html += `<div>${uiRenderer.addLegacySliderHtml('data-prop', 'defaults.extraInterval', 'Use extra timer to detect ad redirects faster')}</div>`;

        html += addCardHtml({
            header: 'Next Run',
            body: `<div>${uiRenderer.addLegacySliderHtml('data-prop', 'defaults.nextRun.useCountdown', 'Use faucet countdown when possible')}</div>` +
            `<label class="control-label">Otherwise wait:</label>` +
            addRandomBetween({ name: 'data-prop', value: 'defaults.nextRun' }, { name: 'data-prop', value: 'defaults.nextRun.min' }, { name: 'data-prop', value: 'defaults.nextRun.max' })
        });
        html += addCardHtml({
            header: 'Timeout',
            body: `<table><tr><td>After</td><td><input type="number" data-original="" data-prop="defaults.timeout" min="2" value="5" step="1" class="form-control"></td><td>minutes</td></tr></table>` +
            `<label class="control-label">After timeout/error, postpone for:</label>` +
            addRandomBetween({ name: 'data-prop', value: 'defaults.postponeMinutes' }, { name: 'data-prop', value: 'defaults.postponeMinutes.min' }, { name: 'data-prop', value: 'defaults.postponeMinutes.max' })
        });
        html += addCardHtml({
            header: 'Logging',
            body: `<div>${uiRenderer.addLegacySliderHtml('data-prop', 'devlog.enabled', 'Store log (enables the \'Log\' button)')}</div>` +
            `<table><tr><td>Max log size in lines:</td><td><input type="number" data-original="" data-prop="devlog.maxLines" min="100" step="100" class="form-control"></td></tr></table>`
        });
        html += addCardHtml({
            header: uiRenderer.addLegacySliderHtml('data-prop', 'defaults.sleepMode', 'Sleep mode'),
            body: `<table><tr><td>Don't claim between </td><td><input type="time" data-original="" data-prop="defaults.sleepMode.min" class="form-control"></td><td>and</td>
          <td><input type="time" data-original="" data-prop="defaults.sleepMode.max" class="form-control"></td></tr></table>`
        });
        html += '       </div></div>';
        html += '     </div>';

        html += '     <div class="col-md-12 col-sm-12">';
        html += '         <div class="card card-info m-1"><div class="card-header">Site Specifics<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-minus"></i></button></div></div>';
        html += '           <div class="card-body px-4">';

        html += '         <div class="card m-1 collapsed-card"><div class="card-header">CryptosFaucets<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        html += '           <div class="card-body px-4" style="display: none;">';
        html += '          <div><label class="switch"><input type="checkbox" data-prop="cf.rollOnce" ><span class="slider round"></span></label> Roll once per round </div>';
        html += '          <div><label class="switch"><input type="checkbox" data-prop="cf.usePromoCodes" ><span class="slider round"></span></label> Try to use promo codes every day (disable it if you are facing too many captcha timeouts) </div>';
        html += '          <div><label class="switch"><input type="checkbox" data-prop="cf.tryGetCodes" ><span class="slider round"></span></label> Auto update promo codes </div>';
        html += '          <div><label class="switch"><input type="checkbox" data-prop="cf.autologin" ><span class="slider round"></span></label> Autologin when necessary</div>';
        html += '           <select class="form-control" data-prop="cf.credentials.mode">';
        html += '            <option value="1">Use Email and Password</option><option value="2">Filled by 3rd party software/extension</option>';
        html += '           </select>';
        html += '           <label class="control-label">E-Mail</label>';
        html += '           <input maxlength="200" type="text" data-prop="cf.credentials.email" required="required" class="form-control" placeholder="Email address..."/>';
        html += '           <label class="control-label">Password</label>';
        html += '           <input maxlength="200" type="password" data-prop="cf.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
        html += '           <label class="control-label">Hours to wait If IP is banned:</label>';
        html += '           <select class="form-control" data-prop="cf.sleepHoursIfIpBan">';
        html += '            <option value="0">Disabled</option><option value="2">2</option><option value="4">4</option><option value="8">8</option><option value="16">16</option><option value="24">24</option><option value="26">26</option>';
        html += '           </select>';
        html += '       </div></div>';

        // html += '         <div class="card m-1 collapsed-card"><div class="card-header">FPig<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        // html += '           <div class="card-body px-4" style="display: none;">';
        // html += '           <label class="control-label">Login Mode</label>';
        // html += '           <select class="form-control" data-prop="fpb.credentials.mode">';
        // html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
        // html += '           </select>';
        // html += '           <label class="control-label">E-Mail</label>';
        // html += '           <input maxlength="200" type="text" data-prop="fpb.credentials.username" required="required" class="form-control" placeholder="Email address..."/>';
        // html += '           <label class="control-label">Password</label>';
        // html += '           <input maxlength="200" type="password" data-prop="fpb.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
        // html += '       </div></div>';

        // html += '         <div class="card m-1 collapsed-card"><div class="card-header">FreeBCH<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        // html += '           <div class="card-body px-4" style="display: none;">';
        // html += '           <label class="control-label">Login Mode</label>';
        // html += '           <select class="form-control" data-prop="fbch.credentials.mode">';
        // html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
        // html += '           </select>';
        // html += '           <label class="control-label">E-Mail</label>';
        // html += '           <input maxlength="200" type="text" data-prop="fbch.credentials.username" required="required" class="form-control" placeholder="Email address..."/>';
        // html += '           <label class="control-label">Password</label>';
        // html += '           <input maxlength="200" type="password" data-prop="fbch.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
        // html += '       </div></div>';

        html += '         <div class="card m-1 collapsed-card"><div class="card-header">JTFey<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        html += '           <div class="card-body px-4" style="display: none;">';
        html += '           <label class="control-label">Login Mode</label>';
        html += '           <select class="form-control" data-prop="jtfey.credentials.mode">';
        html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
        html += '           </select>';
        html += '           <label class="control-label">E-Mail</label>';
        html += '           <input maxlength="200" type="text" data-prop="jtfey.credentials.username" required="required" class="form-control" placeholder="Email address..."/>';
        html += '           <label class="control-label">Password</label>';
        html += '           <input maxlength="200" type="password" data-prop="jtfey.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
        html += '       </div></div>';

        // html += '         <div class="card m-1 collapsed-card"><div class="card-header">BscAds<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        // html += '           <div class="card-body px-4" style="display: none;">';
        // html += '           <label class="control-label">Login Mode</label>';
        // html += '           <select class="form-control" data-prop="bscads.credentials.mode">';
        // html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
        // html += '           </select>';
        // html += '           <label class="control-label">E-Mail</label>';
        // html += '           <input maxlength="200" type="text" data-prop="bscads.credentials.username" required="required" class="form-control" placeholder="Username..."/>';
        // html += '           <label class="control-label">Password</label>';
        // html += '           <input maxlength="200" type="password" data-prop="bscads.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
        // html += '       </div></div>';

        html += '         <div class="card m-1 collapsed-card"><div class="card-header">FaucetPay PTC<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        html += '           <div class="card-body px-4" style="display: none;">';
        html += '           <div><label class="switch"><input type="checkbox" data-prop="fp.randomPtcOrder" ><span class="slider round"></span></label> Random PTC order </div>';
        html += '           <label class="control-label">Max duration per run:</label>';
        html += '           <select class="form-control" data-prop="fp.maxTimeInMinutes">';
        html += '            <option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option>';
        html += '           </select>';
        html += '       </div></div>';

        html += '         <div class="card m-1 collapsed-card"><div class="card-header">Dutchy<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        html += '           <div class="card-body px-4" style="display: none;">';
        html += '           <div><label class="switch"><input type="checkbox" data-prop="dutchy.useBoosted" ><span class="slider round"></span></label> Try boosted roll </div>';
        html += '       </div></div>';

        html += '         <div class="card m-1 collapsed-card"><div class="card-header">BestChange<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        html += '           <div class="card-body px-4" style="display: none;">';
        html += '           <label class="control-label">BTC Address:</label>';
        html += '           <select class="form-control" data-prop="bestchange.address">';
        html += '            <option value="101">Faucet Pay BTC</option><option value="1">BTC Alt Address</option>';
        html += '           </select>';
        html += '       </div></div>';

        // html += '         <div class="card m-1 collapsed-card"><div class="card-header">Bagi/Keran<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        // html += '           <div class="card-body px-4" style="display: none;">';
        // html += '           <label class="control-label">Keran - Crypto to claim: (make sure it exists/is enabled in the site)</label>';
        // html += '           <select class="form-control" data-prop="bkclass.coin">';
        // html += '            <option value="Random">Random</option><option value="LTC">LTC</option><option value="DOGE">DOGE</option><option value="ETH">ETH</option><option value="SOL">SOL</option>';
        // html += '           </select>';
        // html += '           <label class="control-label">Bagi - Crypto to claim: (make sure it exists/is enabled in the site)</label>';
        // html += '           <select class="form-control" data-prop="bkclass.bcoin">';
        // html += '            <option value="Random">Random</option><option value="LTC">LTC</option><option value="DOGE">DOGE</option><option value="ETH">ETH</option><option value="SOL">SOL</option>';
        // html += '           </select>';
        // // html += '           <label class="control-label">Auto withdraw:</label>';
        // // html += '           <select class="form-control" data-prop="bk.withdrawMode">';
        // // html += '            <option value="0">Disabled</option><option value="1">Once every X hours</option><option value="2">After each successful claim</option>';
        // // html += '           </select>';
        // // html += '           <label class="control-label">Hours (X) between withdraws:</label>';
        // // html += '           <select class="form-control" data-prop="bk.hoursBetweenWithdraws">';
        // // html += '            <option value="0">Disabled</option><option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="8">8</option><option value="12">12</option><option value="24">24</option>';
        // // html += '           </select>';
        // html += '           <label class="control-label">Time to wait If IP is restricted:</label>';
        // html += '           <select class="form-control" data-prop="bk.sleepMinutesIfIpBan">';
        // html += '            <option value="0">Disabled</option><option value="45">45 minutes</option><option value="60">1hr</option><option value="75">1hr 15min</option><option value="90">1hr 30min</option><option value="120">2hrs</option><option value="180">3hrs</option><option value="240">4hrs</option>';
        // html += '           </select>';
        // html += '       </div></div>';

        // html += '         <div class="card m-1 collapsed-card"><div class="card-header">SatoHost<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        // html += '           <div class="card-body px-4" style="display: none;">';
        // html += '           <label class="control-label">Login Mode</label>';
        // html += '           <select class="form-control" data-prop="shost.credentials.mode">';
        // html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
        // html += '           </select>';
        // html += '           <label class="control-label">E-Mail</label>';
        // html += '           <input maxlength="200" type="text" data-prop="shost.credentials.username" required="required" class="form-control" placeholder="Username..."/>';
        // html += '           <label class="control-label">Password</label>';
        // html += '           <input maxlength="200" type="password" data-prop="shost.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
        // html += '       </div></div>';

        html += '         <div class="card m-1 collapsed-card"><div class="card-header">Yes Coiner<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
        html += '           <div class="card-body px-4" style="display: none;">';
        html += '           <label class="control-label">Login Mode</label>';
        html += '           <select class="form-control" data-prop="ycoin.credentials.mode">';
        html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
        html += '           </select>';
        html += '           <label class="control-label">E-Mail</label>';
        html += '           <input maxlength="200" type="text" data-prop="ycoin.credentials.username" required="required" class="form-control" placeholder="Account number..."/>';
        html += '           <label class="control-label">Password</label>';
        html += '           <input maxlength="200" type="password" data-prop="ycoin.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
        html += '       </div></div>';

        html += '    </div></div>';
        html += '  </div>';
        html += ' </div>';
        html += '</div>';
        html += '<div class="modal-footer"><a class="btn m-2 anchor btn-outline-danger align-middle" onclick="modalCancel(\'config\')" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
        html += '<a class="btn m-2 anchor btn-outline-success align-middle" onclick="modalSave(\'config\')" data-dismiss="modal"><i class="fa fa-check-circle"></i> Save</a></div>';
        html += '   </div>';
        //END OF MODAL CONTENTS

        html += '</div>';
        html += '</div>';


        html += '<section id="table-struct" class="fragment "><div class="container-fluid "><div class="py-1 "><div class="row mx-0 justify-content-center">';
        html += '<a class="btn m-2 anchor btn-outline-danger align-middle" data-toggle="modal" data-target="#confirmable-modal" onclick="confirmable.open(\'forceStopFaucet\', \'Running faucet will be disabled and the manager will reload.\')"><i class="fa fa-stop-circle"></i>Force Stop</a>';
        html += '</div>';


        html += '<div class="card">';

        html += '<div class="card-header">';
        html += '<div class="d-flex p-0">';

        // Schedule tabs
        html += '<div id="schedules-toggler" class="btn-group btn-group-toggle" data-toggle="buttons">';

        html += '</div>';

        html += '<div class="card-tools ml-auto mt-2 mr-1">';
        html += '<input type="checkbox" data-toggle="switch" data-label-text="Log" title="Show/Hide Log" id="bss-log" checked>';

        html += `<button type="button" class="btn btn-flat btn-sm btn-outline-primary mx-1 dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-cog"></i> Settings</button>
        <div class="dropdown-menu text-sm dropdown-settings-menu" style="">
        <a class="dropdown-item btn-open-dialog" data-target="modal-config"><i class="fa fa-cog"></i>&nbsp;Defaults...</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item btn-open-dialog" data-target="modal-schedules"><i class="fa fa-stopwatch"></i>&nbsp;Schedules...</a>
        <a class="dropdown-item btn-open-dialog" data-target="modal-wallet"><i class="fa fa-wallet"></i>&nbsp;Wallets...</a>
        <a class="dropdown-item btn-open-dialog" data-target="modal-requirements"><i class="fa fa-exclamation-circle"></i>&nbsp;Other requirements...</a>
        <!-- <a class="dropdown-item btn-open-dialog" data-target="modal-sites"><i class="fa fa-window-restore"></i>&nbsp;Sites...</a> -->
        <div class="dropdown-divider"></div>
        <a class="dropdown-item btn-open-dialog" data-target="modal-info"><i class="fa fa-info"></i>&nbsp;Help/Info...</a>
        </div>`;

        // <div class="dropdown-divider"></div>
        // <a class="dropdown-item btn-open-dialog" data-target="modal-ereport"><i class="fa fa-history"></i>&nbsp;Log...</a>
        // <a class="dropdown-item btn-open-dialog" data-target="modal-backup"><i class="fa fa-save"></i>&nbsp;Back up...</a>
        // <div class="dropdown-divider"></div>

        // html += '<button type="button" class="btn btn-tool-colorless btn-outline-success em-only d-none mx-1" onclick="editListSave()"><i class="fa fa-check-circle"></i> Save</button>';
        // html += '<button type="button" class="btn btn-tool-colorless btn-outline-danger em-only d-none mx-1" onclick="editListCancel()"><i class="fa fa-times-circle"></i> Cancel</button>';
        // html += '<button onclick="editList()" class="btn btn-flat btn-sm btn-outline-primary mx-1 em-hide" type="button"><i class="fa fa-edit"></i> Edit</button>';
        html += '<button type="button" class="btn btn-tool" data-card-widget="collapse"><i class="fas fa-minus"></i></button>';
        html += '<button type="button" class="btn btn-tool mx-1" data-card-widget="maximize"><i class="fas fa-expand"></i></button>';
        html += '</div></div>';
        html += '<div id="wait-times" class="row mx-0 p-0 justify-content-center"></div>';
        html += '</div>';

        html += '<div class="card-body table-responsive p-0" style="height: 400px;" id="schedule-container">';
        html += '<pre class="collapse show" id="console-log"><b>Loading...</b></pre>';
        html += '</div>';

        html += '</div>';

        html += '</div>';
        html += '<span id="update-data" style="display:none;"></span></section>';
        html += '<section id="table-struct-promo" class="fragment "><div class="container-fluid "><div class="py-1 ">';

        html += '<div class="card"><div class="card-header"><h3 class="card-title font-weight-bold">Promo Codes</h3><span id="promo-code-new" style="display:none;"></span>';
        html += '<div class="card-tools">';

        html += '<div class="input-group input-group-sm btn-tool">';
        html += '<input id="promo-text-input" type="text" name="table_search" class="form-control float-right" placeholder="CF Promo Code..." style="width:130px;">';
        html += '<input type="checkbox" data-toggle="switch" title="Check if the code can be reused every 24hs" id="promo-daily" data-on-text="Daily" data-off-text="1 Time">';
        html += '<div class="input-group-append"><button type="submit" class="btn btn-default" id="promo-button""><i class="fas fa-plus"></i> Add</button></div>';
        html += '<div class="input-group-append"><button type="submit" class="btn btn-default btn-outline-danger mx-1" data-toggle="modal" data-target="#confirmable-modal" onclick="confirmable.open(\'removeAllPromos\', \'All promo codes will be removed.\')"><i class="fas fa-times-circle"></i> Remove All</button></div>';
        html += '<div class="input-group-append"><button type="submit" class="btn btn-default btn-outline-primary" id="button-try-get-codes"><i class="fas fa-bolt"></i> Try to Get Codes</button></div>';
        html += '<div class="input-group-append"><button type="button" class="btn btn-tool btn-sm mx-1" data-card-widget="collapse" title="Collapse"><i class="fas fa-minus"></i></button></div>';
        html += '<div class="input-group-append"><button type="button" class="btn btn-tool btn-sm mx-1" data-card-widget="maximize" title="Maximize"><i class="fas fa-expand"></i></button></div>';
        html += '</div>';
        html += '</div>';

        html += '</div>';
        html += '<div class="card-body table-responsive p-0" id="promo-container">';
        html += '</div></div>';

        html +='</div></div></section>';
        html += '<section class="fragment"><div class="container-fluid ">';
        html += '<div class="row justify-content-center"><a class="btn  m-2 anchor btn-outline-primary" id="stats-button" onclick="openStatsChart()">CF Lucky Number Stats</a></div>';
        html +='<div class="py-1" id="stats-fragment" style="display:none;"><div class="row align-items-center text-center justify-content-center">';
        html += '<div class="col-md-12 col-lg-8"><canvas id="barChart"></canvas><span id="rolls-span" style="display:none;"></span></div></div></div></div></div></section>';

        let wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();

        let target = document.getElementById('referral-table');
        target.parentNode.insertBefore(wrapper, target);
        document.getElementById('schedule-container').appendChild( createScheduleTable() );

        if (document.querySelector('.main-header .navbar-nav.ml-auto')) {
            let discord = document.createElement('li');
            discord.classList.add('nav-item');
            discord.innerHTML = '<a class="btn btn-primary btn-sm m-1" href="https://discord.gg/23s9fDgHqe" target="_blank"><div class="">discord</div></a>';
            document.querySelector('.main-header .navbar-nav.ml-auto').prepend(discord);
        } else {
            let discord = document.createElement('div');
            discord.innerHTML = '<a class="btn m-2 btn-primary" href="https://discord.gg/23s9fDgHqe" target="_blank"><div class="">discord</div></a>';
            document.querySelector('.navbar-nav').prepend(discord);
        }
        // Requirements (new)
        addHtml({
            target: '#modal-dlg .modal-dialog',
            where: 'afterbegin',
            content: `/**other-requirements.html**/`
        });
        addTemplateTag({
            id: 'tpl-requirement-row',
            content: `/**tpl-requirement-row.html**/`
        });
        const tempRequirementsList = [
            { id: '1', name: 'HCaptcha Solver', description: 'A solver for HCaptcha challenges', suggestion: `Latest github version of hektCaptcha extension (free)<br><a href="https://bit.ly/3Y24vg5" target="_blank"><i class="fa fa-external-link-alt"></i> Visit</a>` },
            { id: '2', name: 'Recaptcha Solver', description: 'A solver for ReCaptcha challenges', suggestion: `Latest github version of hektCaptcha extension (free)<br><a href="https://bit.ly/3Y24vg5" target="_blank"><i class="fa fa-external-link-alt"></i> Visit</a>` },
            { id: '3', name: 'Cloudflare Challenge Bypass', description: 'A solver for Cloudflare/Turnstile challenges', suggestion: `Auto clicker user script (free)<br><a  href="https://sharetext.me/knpmyolewq" target="_blank"><i class="fa fa-external-link-alt"></i> Visit</a>` },
            // { id: '4', name: 'Antibot Solver', description: 'A solver for Antibot/AB word challenges', suggestion: 'Latest AB Links Solver user script (free)' },
            // { id: '5', name: 'GPCaptcha Solver', description: 'A solver for GP Captcha challenges', suggestion: 'Latest GP Captcha solver user script (free)' },
            { id: '6', name: 'Active Tab/Window', description: 'The site requires the tab to be active. A good option is Tab Revolver Extension, which will loop the tabs opened in a specific window.', suggestion: `<a  href="https://bit.ly/3Y28lpA" target="_blank"><i class="fa fa-external-link-alt"></i> User Script</a> or <a href="https://bit.ly/3q0H4Ht" target="_blank"><i class="fa fa-external-link-alt"></i> Extension</a>` },
            // { id: '7', name: 'GeeTest Solver', description: 'A solver for GeeTest challenges.', suggestion: 'MB Solver (paid service), GeeTest User Script (free, solves only the puzzles, requires the tab to be active)' },
        ];
        for(let r=0; r< tempRequirementsList.length; r++) {
            let req = tempRequirementsList[r];
            useTemplate({
                templateId: 'tpl-requirement-row',
                target: '#requirements-table-body',
                where: 'afterbegin',
                replacements: req
            });
            // data = { templateId: '', target: '', where: '', replacements: {} }
            // html += `<tr><td>${req.name}</td><td>${req.description}</td><td>${req.suggestion}</td></tr>`;
        }
    };
    function createPromoTable(faucets) {
        let table = document.createElement('table');
        let inner = '';
        table.classList.add('table', 'custom-table-striped');
        table.setAttribute('id','promo-table');

        inner += '<caption style="text-align: -webkit-center;">⏳ Pending ✔️ Accepted 🕙 Used Before ❌ Invalid code ❗ Unknown error ⚪ No code</caption>';
        inner += '<thead><tr><th class="">Code</th><th class="">Added</th>';

        for (let i = 0, all = faucets.length; i < all; i++) {
            inner += '<th data-faucet-id="' + faucets[i].id + '">' + faucets[i].name + '</th>';
        }

        inner += '</tr></thead><tbody id="promo-table-body"></tbody></table>';

        table.innerHTML = inner
        document.getElementById('promo-container').appendChild( table );
    };
    function createScheduleTable() {
        let table = document.createElement('table');
        let inner;
        table.classList.add('table', 'custom-table-striped', 'table-head-fixed', 'text-nowrap');
        table.setAttribute('id','schedule-table');

        inner = '<thead><tr>';
        inner += '<th scope="col" class="edit-status d-none em-only" style="">Active</th><th class="">Next Roll</th><th class=""></th><th class="">Name</th><th class="text-center">Last Claim</th>';
        inner += '<th class="text-center">Aggregate</th><th class="text-center">Balance</th><th class="text-center em-hide" id="converted-balance-col">FIAT</th>';
        inner += '<th scope="col" class="text-center em-hide">Msgs</th>';
        inner += '<th scope="col" class="" style="">';
        inner += `<div class="btn-group btn-group-sm">
        <button type="button" data-toggle="tooltip" title="Add site..." class="btn btn-default action-add-external-site em-hide">
            <i class="fa fa-plus"></i>
        </button>
        <button type="button" title="Cancel" class="btn btn-danger action-edit-all-sites-cancel em-only d-none"><i class="fa fa-times-circle"></i> Cancel</button>
        <button type="button" title="Save" class="btn btn-success action-edit-all-sites-save em-only d-none"><i class="fa fa-check-circle"></i> Save</button>
        <button type="button" data-toggle="tooltip" title="Edit all..." class="btn btn-default action-edit-all-sites em-hide"><i class="fa fa-toggle-off"></i></button>
        </div>`;
        inner += '</th></tr></thead><tbody id="schedule-table-body"></tbody>';
        table.innerHTML = inner;

        return table;
    };
    function renderLogRow(data) {
        let tr = document.createElement('tr');
        tr.dataset.schedule = data.schedule;
        tr.dataset.ts = data.ts.getTime();
        tr.dataset.siteName = data.siteName || '';
        tr.dataset.elapsed = data.elapsed || '';
        let color = data.schedule ? `#${data.schedule}` : `transparent`;
        let showIt = !data.schedule || !uiRenderer.schedules.selectedSchedule 
                    || uiRenderer.schedules.selectedSchedule == 'all' || uiRenderer.schedules.selectedSchedule == data.schedule;
        if (!showIt) {
            tr.classList.add('d-none');
        }

        let tds = '';
        tds += `<td>${helpers.getPrintableTime(data.ts)}</td>`;
        tds += `<td><i class="fas fa-square pr-1" style="color: ${color};"></i></td>`;
        if (data.elapsed) {
            tds += `<td>${data.msg} [Elapsed time: ${data.elapsed} seconds]</td>`;
        } else {
            tds += `<td>${data.msg}</td>`;
        }
        tr.innerHTML = tds;

        // console.log(`LogRow rendered`, tr);
        document.querySelector('#console-log table').appendChild(tr);
    };
    function log(data) {
        // data = { schedule, siteName, elapsed, msg }
        if (!data || !data.msg) {
            console.warn(`Log attempt without data or msg!`, data);
            return;
        }
        data.ts = new Date();
        data.schedule = data.schedule || false;
        data.siteName = data.siteName || false;
        data.elapsed = data.elapsed || false;

        // Legacy:
        if(shared.getConfig()['devlog.enabled']) {
            if (data.schedule) {
                shared.devlog(`[${data.schedule}] ${data.msg}`, data.elapsed || false);
            } else {
                shared.devlog(data.msg, data.elapsed || false);
            }
        };

        if (data.elapsed) {
            let previous = logLines.find(x => x.msg == data.msg && x.schedule == data.schedule);
            if (previous) {
                previous.elapsed = data.elapsed;
                previous.ts = data.ts;
                logLines.sort( (a, b) => b.ts.getTime() - a.ts.getTime());
            } else {
                logLines.unshift(data);
            }
        } else {
            logLines.unshift(data);
        }
        while(logLines.length > 30) {
            logLines.pop();
        }

        document.querySelector('#console-log table').innerHTML = '';
        logLines.forEach(r => renderLogRow(r));
    };
    function legacyLog(data, elapsed = false) {
        if (!data || !data.msg) {
            return;
        }
        elapsed = data.elapsed || false;
        let msg = data.msg;
        if (data.schedule) {
            msg = `[${data.schedule}] ${data.msg}`;
        }

        if(shared.getConfig()['devlog.enabled']) { shared.devlog(msg, elapsed) };
        if(msg) {
            // let previous = logLines[0].split('&nbsp')[1];
            let waitingIdx = logLines.findIndex(line => {
                let waitingMsg= line.split('&nbsp')[1];
                if (waitingMsg == msg) {
                    return true;
                }
            });

            let previous = waitingIdx > -1 ? logLines[waitingIdx].split('&nbsp')[1] : '';
            if (elapsed && (previous == msg)) {
                logLines[waitingIdx] = helpers.getPrintableTime() + '&nbsp' + msg + '&nbsp[Elapsed time:&nbsp' + elapsed + '&nbspseconds]';
            } else {
                while(logLines.length > 20) {
                    logLines.pop();
                }
                logLines.unshift(helpers.getPrintableTime() + '&nbsp' + msg);
            }

            document.getElementById('console-log').innerHTML = logLines.map(x => {
                const regex = /\[([0-9a-fA-F]+)\]/;
                const match = regex.exec(x);
                let colorNumber = null;
                if (match !== null) {
                  colorNumber = match[1];
                }

                let showIt = !colorNumber || !window.selectedSchedule || window.selectedSchedule == 'all' || window.selectedSchedule == colorNumber;

                const formattedMsg = x.replace(/\[([0-9a-fA-F]+)\]/, '<i class="fas fa-square pr-1" style="color: #$1;"></i>');

                let line = `<span data-schedule="${colorNumber ? colorNumber : ''}" class="${showIt ? '' : 'd-none'}">${formattedMsg}</span>`;
                return line;
            }).join('');
        }
    };
    return {
        init: init,
        // refresh: refresh,
        // loadPromotionTable: loadPromotionTable,
        log: log
    }
}
