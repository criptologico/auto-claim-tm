function createManager() {
    let timestamp = null;
    let intervalUiUpdate;
    let getFeedInterval;

    let userWallet = [];

    {{manager/sites-list.js}}

    const wallet = [
        { id: '100', name: 'FaucetPay Email', type: K.WalletType.FP_MAIL },
        { id: '101', name: 'FaucetPay BTC (Bitcoin)', type: K.WalletType.FP_BTC },
        { id: '102', name: 'FaucetPay BNB (Binance Coin)', type: K.WalletType.FP_BNB },
        { id: '103', name: 'FaucetPay BCH (Bitcoin Cash)', type: K.WalletType.FP_BCH },
        { id: '104', name: 'FaucetPay DASH (Dash)', type: K.WalletType.FP_DASH },
        { id: '105', name: 'FaucetPay DGB (DigiByte)', type: K.WalletType.FP_DGB },
        { id: '106', name: 'FaucetPay DOGE (Dogecoin)', type: K.WalletType.FP_DOGE },
        { id: '107', name: 'FaucetPay ETH (Ethereum)', type: K.WalletType.FP_ETH },
        { id: '108', name: 'FaucetPay FEY (Feyorra)', type: K.WalletType.FP_FEY },
        { id: '109', name: 'FaucetPay LTC (Litecoin)', type: K.WalletType.FP_LTC },
        { id: '110', name: 'FaucetPay TRX (Tron)', type: K.WalletType.FP_TRX },
        { id: '111', name: 'FaucetPay USDT (Tether TRC20)', type: K.WalletType.FP_USDT },
        { id: '112', name: 'FaucetPay ZEC (Zcash)', type: K.WalletType.FP_ZEC },
        { id: '113', name: 'FaucetPay SOL (Solana)', type: K.WalletType.FP_SOL },
        { id: '200', name: 'ExpressCrypto (EC-UserId-XXXXXX)', type: K.WalletType.EC },
        { id: '1', name: 'BTC Alternative Address', type: K.WalletType.BTC }
        //                { id: '2', name: 'LTC Address', type: K.WalletType.LTC }
    ];

    async function start() {
        await loader.initialize();
        ui.init(getCFlist(), Schedule.getAll());
        uiRenderer.appendEventListeners();
        // purge runningSites:
        shared.purgeFlowControlSchedules(Schedule.getAll().map(x => x.uuid));
        update();
        // ui.refresh(null, null, userWallet);
        uiRenderer.wallet.legacyRenderWalletTable(userWallet);
        intervalUiUpdate = setInterval(readUpdateValues, 10000);
        Schedule.getAll().forEach(x => {
            x.start();
        });
        if (document.querySelector('#console-log').innerText == 'Loading...') {
            document.querySelector('#console-log').innerHTML = '<table><tr><td><b>Running...</b></td></tr></table>';
        }
        getFeedInterval = setInterval(getCodesFeed, 25000);
    };

    let loader = function() {
        async function initialize() {
            setTimestamp();
            await Schedule.initialize();
            await initializeSites();
            initializeUserWallet();
            initializePromotions();
            initializeHistory();
        };
        async function initializeSites() {
            // await createDefaultSites();
            Site.createFromDataArray(sites);
            await updateSitesWithStoredData();
            await addSitesToSchedules();
            // Legacy wList: make it return Site.getAll();
            // splitInSchedules();
        };
        async function updateSitesWithStoredData() {
            let storedData = persistence.load('webList', true);
            console.log({ allStoredData: storedData });
            if (storedData) {
                storedData.forEach( function (stored) {
                    if (stored.isExternal) {
                        stored.url = new URL(stored.url);
                        Site.add(stored);
                        console.log('External Site To Be Loaded!');
                        console.log(stored);
                    }
                    let site = Site.getById(stored.id);
                    if (!site) {
                        return;
                    }
                    for (const prop in stored) {
                        // if (site.hasOwnProperty(prop)) {
                        // }
                        site[prop] = stored[prop];
                    }
                    if (!site.enabled) {
                        site.nextRoll = null;
                    } else {
                        site.nextRoll = site.nextRoll ? new Date(site.nextRoll) : new Date();
                    }
                    if (site.aggregate || site.balance) {
                        site.firstRun = false;
                    }
                })
            }
        };
        async function addSitesToSchedules() {
            Site.getAll().forEach(site => {
                let scheduleOfSite = Schedule.getById(site.schedule);
                if (!scheduleOfSite) {
                    // for some reason, the site has an invalid schedule
                    console.warn(`Attention! Site ${site.name} has a reference to a schedule that does not exist: (${site.schedule})`);
                    scheduleOfSite = Schedule.getAll()[0];
                    console.warn(`Assigning it to first schedule (${scheduleOfSite.uuid}) instead.`);
                    site.schedule = scheduleOfSite.uuid; // use .changeSchedule to save the change???
                }
                scheduleOfSite.addSite(site);
            });
        };
        function initializeUserWallet() {
            addWallets();
            addStoredWalletData();
        };
        function addWallets() {
            wallet.forEach(x => userWallet.push(x));
            userWallet.forEach(function (element, idx, arr) {
                arr[idx].address = '';
            });
        };
        function addStoredWalletData() {
            let storedData = persistence.load('userWallet', true);
            if(storedData) {
                storedData.forEach( function (element) {
                    let idx = userWallet.findIndex(x => x.id == element.id);
                    if(idx != -1) {
                        userWallet[idx].address = element.address ?? userWallet[idx].address;
                    }
                });
            }
        };
        function initializePromotions() {
            let storedData = persistence.load('CFPromotions', true);
            if (storedData) {
                let mig00200799 = false;
                // check if we need this migration
                try {
                    mig00200799 = shared.getConfig().migrations.find(x => x.version == '00200799' && !x.applied);
                } catch (err) {}
                console.info(`Migration 00200799: ${mig00200799 ? 'APPLYING' : 'previously applied or not needed'}`);

                let allCFs = manager.getFaucetsForPromotion().map( cf => cf.id );
                storedData.forEach( function (element, idx, arr) {
                    arr[idx].added = new Date(element.added);
                    arr[idx].statusPerFaucet.forEach( function (el, i, a) {
                        a[i].execTimeStamp = (el.execTimeStamp != null) ? new Date(el.execTimeStamp) : null;
                        if (mig00200799 && el.status == 4) {
                            a[i].status = 1;
                        }
                    });
                    // Add new CFs
                    allCFs.forEach( function (cf) {
                        if (!arr[idx].statusPerFaucet.find( x => x.id == cf )) {
                            let newCf = { id: cf, status: 1, execTimeStamp: null };
                            arr[idx].statusPerFaucet.push(newCf);
                        }
                    });
                });
                // save migration 00200799 as applied
                if (mig00200799) {
                    shared.migrationApplied('00200799');
                }
                CFPromotions.load(storedData);
            }
        };
        function initializeHistory() {
            CFHistory.initOrLoad();
        };
        function setTimestamp() {
            timestamp = Date.now();
            persistence.save('timestamp', timestamp);
        };
        return {
            initialize: initialize
        };
    }();
    function getCodesFeed(force = false) {
        console.log('@getCodesFeed');
        clearInterval(getFeedInterval);
        if (!force) {
            let tryGet = shared.getConfig()['cf.tryGetCodes'] || false;
            if (!tryGet) {
                console.log('feed interval cleared');
                return;
            }
        }

        let nextFeed = helpers.randomMs(2 * 60 * 60 * 1000, 4 * 60 * 60 * 1000);
        getFeedInterval = setInterval(getCodesFeed, nextFeed)

        GM_xmlhttpRequest({
            method: "GET",
            url: "https://criptologico.com/api/?key=XI2HV-1P9PQ-W637F-68B9B-A248&requests[cf_codes]",
            timeout: 10000,
            onload: function(response) {
                try {
                    let txt = response.responseText;
                    let parsed = JSON.parse(txt);
                    if (parsed.success) {
                        let newCodes = [];
                        for(let i = 0; i < parsed.cf_codes.length; i++) {
                            let item = parsed.cf_codes[i];
                            let newCode = {};
                            newCode.code = item.code;
                            newCode.oneTimeOnly = item.is_one_time == '1';
                            newCode.expirationDate = item.expiration_date.replace(' ', 'T') + 'Z';
                            newCode.expirationDate = new Date(newCode.expirationDate);
                            newCodes.push(newCode);
                        }
                        CFPromotions.includeNewCodes(newCodes);
                        uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
                        // ui.refresh(null, CFPromotions.getAll());
                    }
                } catch(err) {
                    console.error('unexpected error parsing codes list');
                    console.error(err);
                }
            },
            onerror: function(e) {
                console.error('error getting codes');
                console.error(e);
            },
            ontimeout: function() {
                console.error('timeout getting codes');
            },
        });
    }
    function readUpdateValues(forceCheck = false) {
        readPromoCodeValues();
        readModalData();

        // if(schedules[0].status == STATUS.IDLE || forceCheck) {
        if(true) {
            let updateDataElement = document.getElementById('update-data');
            let updateValues = updateDataElement.innerText.clean();

            if (updateValues != '') {
                updateDataElement.innerText = '';
                let updateObj = JSON.parse(updateValues);
                if(updateObj.editSingle.changed) {
                    updateObj.editSingle.items.forEach(function (element, idx, arr) {
                        // This processes the Edit Mode of the sites table (active on/off, name changes)
                        // TODO: move!
                        try {
                            let site = Site.getById(element.id);

                            // TODO: move all this......
                            site.name = element.displayName;

                            if (site.enabled != element.enabled) {
                                site.enabled = element.enabled;
                                if(site.enabled) {
                                    site.nextRoll = new Date(idx);
                                } else {
                                    site.nextRoll = null;
                                }
                            }
                            ui.log({ schedule: site.schedule,
                                msg: `Faucet updated. New name: ${element.displayName}. Active: ${element.enabled}` });
                        } catch (err) {
                            ui.log({ schedule: this.uuid,
                                msg: `Error updating faucet data: ${err}` });
                        }
                    });
                }

                if(updateObj.wallet.changed) {
                    updateObj.wallet.items.forEach(function (element) {
                        try {
                            let itemIndex = userWallet.findIndex(x => x.id == element.id);
                            userWallet[itemIndex].address = element.address;

                            ui.log({ msg: `Wallet Address updated [${userWallet[itemIndex].name}]: ${userWallet[itemIndex].address}` });
                        } catch (err) {
                            ui.log({ msg: `Error updating wallet/address: ${err}` });
                        }
                    });

                    uiRenderer.wallet.legacyRenderWalletTable(userWallet);
                    // ui.refresh(null, null, userWallet);
                    saveUserWallet();
                }

                if(updateObj.config.changed) {
                    try {
                        shared.updateConfig(updateObj.config.items);
                        ui.log({ msg: `Config updated. Reloading in a few seconds...` });
                        window.location.reload();
                        return;
                    } catch (err) {
                        ui.log({ msg: `Error updating config: ${err}` });
                    }

                }

                if(updateObj.site.changed) {
                    updateObj.site.list.forEach( (x) => {
                        try {
                            updateSite(x.id, x.items);
                        } catch (err) {
                            ui.log({ msg: `Error updating site: ${err}` });
                        }
                    });
                }

                if(updateObj.runAsap.changed || updateObj.editSingle.changed || updateObj.site.changed) {
                    resyncAll({ withUpdate: true });
                    return;
                }
            }
        }
        if(forceCheck) {
            resyncAll({ withUpdate: false });
        }
    };
    function resyncAll(options = { withUpdate: false} ) {
        if (options.withUpdate) {
            update(true);
        }
        Schedule.getAll().forEach(x => {
            x.checkNextRoll();
        });
    }
    function updateSite(id, items) {
        let site = Site.getById(id);
        if (site) {
            site.params = site.params || {};
            items.forEach( (item) => {
                site.params[item.prop] = item.value;
            });

            ui.log({ schedule: site.schedule, siteName: site.name, 
                msg: `Site ${site.name} updated` });
        }
    }
    function readModalData() { // This should be migrated and dissapear!
        if(document.getElementById('modal-spinner').isVisible()) {
            let targetObject = JSON.parse(document.getElementById('target-spinner').innerHTML);
            let target = targetObject.id;
            if (target == 'modal-ereport') {
                let temp = shared.getDevLog();
                document.getElementById('log-textarea').value = temp.join('\n');
            } else if (target == 'modal-config') {
                uiRenderer.config.legacyRenderConfigData(shared.getConfig());
                // ui.refresh(null, null, null, shared.getConfig());
            } else if (target == 'modal-site') {
                let site = Site.getById(targetObject.siteId);
                uiRenderer.sites.legacyRenderSiteData(site, shared.getConfig());
                // ui.refresh(null, null, null, null, { site: site, config: shared.getConfig() });
            }
            document.getElementById('modal-spinner').classList.toggle('d-none');
            document.getElementById(target).classList.toggle('d-none');
            document.getElementById('target-spinner').innerHTML = '';
        }
    }
    function sortSites () { // Temporary, just to decouple it...
        Site.sortAll();
        Schedule.getAll().forEach( schedule => schedule.sortSites() );
    };
    function update(sortIt = true) {
        console.log(`@update: sortIt=${sortIt}`);
        if(sortIt) {
            // Schedule.getAllSites() for UI? always sorted?
            sortSites();
            // This kind of resets the currentSite for each schedule::
            Schedule.getAll().forEach( schedule => schedule.setCurrentSite() );
        }

        Site.saveAll();
        Site.getAll().forEach(site => {
            uiRenderer.sites.renderSiteRow(site);
        });
        uiRenderer.sites.removeDeletedSitesRows(Site.getAll().map(x => x.id));
        // TODO: remove rows of deleted sites if exist
        convertToFiat();
        uiRenderer.sites.sortSitesTable(); // y reordenar
        uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
        // ui.refresh(null, CFPromotions.getAll());
        updateRollStatsSpan();
    };

    function saveUserWallet() {
        const data = userWallet.map(x => {
            return {
                id: x.id,
                address: x.address
            };});

        persistence.save('userWallet', data, true);
    }

    function isObsolete() {
        let savedTimestamp = persistence.load('timestamp');
        if (savedTimestamp && savedTimestamp > timestamp) {
            ui.log({ msg: '<b>STOPING EXECUTION!<b> A new Manager UI window was opened. Process should continue there' });
            clearInterval(intervalUiUpdate);
            return true;
        }
        return false;
    };

    // function sitehasCustom(prop) { // for site level
    //     return this.customs && this.customs.hasOwnProperty(prop) && this.params.customs[prop];
    // }
    // function grouphasCustom(prop) { // for group level
    //     return this.customs && this.customs.hasOwnProperty(prop) && this.params.customs[prop];
    // }
    // function grouphasCustom(prop) { // for group level
    //     return this.params && this.params.hasOwnProperty(prop);
    // }
    // function setNextRun(nextRun) {
    //     if (curentSite.hasCustom('nextRun')) {
    //         return currentSite.getCustom('nextRun', { nextRun: nextRun });
    //     } else if (curentSite.group.hasCustom('nextRun')) {
    //         return currentSite.group.getCustom('nextRun', { nextRun: nextRun });
    //     } else {
    //         return schedule.getCustom('nextRun', { nextRun: nextRun });
    //     }
    // }
    // function setDelays(nextRun) {
    //     if (curentSite.hasCustom('delay')) {
    //         return currentSite.getCustom('delay', { nextRun: nextRun });
    //     } else if (curentSite.group.hasCustom('delay')) {
    //         return currentSite.group.getCustom('delay', { nextRun: nextRun });
    //     } else if (schedule.hasCustom('delay')) {
    //         return schedule.getCustom('delay', { nextRun: nextRun });
    //     }
    //     return nextRun;
    // }
    // function setSleepTime() {
    //     if (curentSite.hasCustom('sleep')) {
    //         return currentSite.getCustom('sleep', { nextRun: nextRun });
    //     } else if (curentSite.group.hasCustom('sleep')) {
    //         return currentSite.group.getCustom('sleep', { nextRun: nextRun });
    //     } else if (schedule.hasCustom('sleep')) {
    //         return schedule.getCustom('sleep', { nextRun: nextRun });
    //     }
    //     return nextRun;
    // }

    function readPromoCodeValues() {
        let promoCodeElement = document.getElementById('promo-code-new');
        let promoDataStr = promoCodeElement.innerText.clean();

        if (promoDataStr == '') {
            return;
        }

        let promoData = JSON.parse(promoDataStr);

        if(promoData.action) {
            switch (promoData.action) {
                case 'FORCESTOPFAUCET':
                    Schedule.getAll().forEach(s => {
                        if (s.status != STATUS.IDLE) {
                            s.currentSite.enabled = false;
                            s.closeTab();
                            // TODO: remove from runningSites...
                        }
                    });

                    update(true);
                    shared.clearFlowControl('all');
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);

                    promoCodeElement.innerText = '';
                    //ui.refresh with reload
                    break;
                case 'ADD':
                    CFPromotions.addNew(promoData.code, promoData.repeatDaily);
                    promoCodeElement.innerText = '';
                    document.getElementById('promo-text-input').value = '';
                    uiRenderer.toast("Code " + promoData.code + " added!");
                    ui.log({ msg: `Promo code ${promoData.code} added` });
                    uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
                    // ui.refresh(null, CFPromotions.getAll());
                    break;
                case 'REMOVEALLPROMOS':
                    CFPromotions.removeAll();
                    promoCodeElement.innerText = '';
                    uiRenderer.toast("Promo codes removed!");
                    ui.log({ msg: `Promo codes removed` });
                    uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
                    // ui.refresh(null, CFPromotions.getAll());
                    break;
                case 'REMOVE':
                    if(CFPromotions.remove(promoData.id, promoData.code) != -1) {
                        ui.log({ msg: `Promo code ${promoData.code} removed` });
                    } else {
                        ui.log({ msg: `Unable to remove code ${promoData.code}` });
                    }
                    promoCodeElement.innerText = '';
                    uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
                    // ui.refresh(null, CFPromotions.getAll());
                    break;
                case 'TRYGETCODES':
                    getCodesFeed(true);
                    promoCodeElement.innerText = '';
                    uiRenderer.toast("Looking for new codes!");
                    // ui.refresh(null, CFPromotions.getAll());
                    break;
            }
        }
    };

    function updateRollStatsSpan() {
        let rollsSpanElement = document.getElementById('rolls-span');
        rollsSpanElement.innerText = CFHistory.getRollsMeta().join(',');
    };

    function getCFlist() {
        let items;
        items = Site.getAll().filter(f => f.type === K.WebType.CRYPTOSFAUCETS);
        items = items.map(x => {
            return {
                id: x.id,
                name: x.coinRef
            };});
        items.sort((a, b) => (a.name > b.name) ? 1 : -1);

        return items;
    };

    function closeWorkingTab(schedule) {
        let sc = Schedule.getAll().find(x => x.uuid == schedule);
        if (sc) sc.closeTab()
    };
    function reloadWorkingTab(schedule) {
        let sc = Schedule.getAll().find(x => x.uuid == schedule);
        if (sc) {
            sc.closeTab();
            sc.reopenTab();
        }
    };
    function getAllSites() {
        return Site.getAll();
    }
    return{
        start: start,
        getFaucetsForPromotion: getCFlist,
        closeWorkingTab: closeWorkingTab,
        reloadWorkingTab: reloadWorkingTab,
        // Schedule: Schedule,
        // Site: Site,
        getAllSites: getAllSites,
        resyncAll: resyncAll,
        isObsolete: isObsolete,
        update: update,
        userWallet: userWallet,
        readUpdateValues: readUpdateValues
    };
}