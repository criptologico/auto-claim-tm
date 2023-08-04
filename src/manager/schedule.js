class Schedule {
    constructor(params) {
        Object.assign(this, {
            uuid: '4a70e0',
            name: 'default_schedule',
            status: STATUS.INITIALIZING,
            currentSite: null,
            sites: [],
            tab: null,
            timer: null, // TBD
            timeWaiting: 0,
            timeUntilNext: null,
            worker: null
        }, params)
        this.timer = new Timer({ isManager: true, delaySeconds: 30, uuid: this.uuid, webType: null });
        // this.timer = new Timer(true, 30, this.uuid);
    }

    static schedules = [];

    static getAll() {
        return Schedule.schedules;
    }

    static getById(scheduleId) {
        return Schedule.getAll().find(x => x.uuid == scheduleId) || false;
    }

    static add(newSchedule) {
        Schedule.getAll().push(newSchedule);
    }

    static getAllForCrud() {
        return Schedule.getAll().map(x => {
            return {
                uuid: x.uuid,
                name: x.name,
                hasSites: x.sites && x.sites.length > 0
            };
        });
    }

    static async initialize() {
        console.log('@Schedules.initialize');

        Schedule.loadAll();

        // add first time schedules if necessary
        let defaultSchedule = new Schedule({ uuid: '4a70e0', name: 'Default' });
        let sampleSchedule = new Schedule({ uuid: '65329c', name: 'CF' });
        if (Schedule.getAll().length == 0) {
            console.log('No Stored Schedules...');
            Schedule.add(defaultSchedule);
            Schedule.add(sampleSchedule);
            console.log({schedules: Schedule.schedules});
            return;
        }

        // add default schedule, if 4a70e0 is not present. TODO: review
        let idxDefault = Schedule.getAll().findIndex(x => x.uuid == '4a70e0');
        if (idxDefault == -1) {
            Schedule.add(defaultSchedule);
        }
        console.log({schedules: Schedule.schedules});
    };

    static saveAll() {
        persistence.save('schedules', Schedule.schedules.map(x => {
            return {
                uuid: x.uuid,
                name: x.name
            };
        }), true);
        console.log({schedules: 'saved', list: Schedule.schedules});
    }

    static loadAll() {
        Schedule.schedules = [];
        let schedulesJson = persistence.load('schedules', true) || [];
        schedulesJson.forEach(function(element) {
            Schedule.getAll().push(new Schedule({
                uuid: element.uuid,
                name: element.name,
                // defaults: defaults
            }));
        });
    }

    sortSites() {
        this.sites.sort( function(a,b) {
            if (a === b) {
                return 0;
            } else if (a.nextRoll === null && b.nextRoll === null) {
                let aHasLoginError = a.stats?.errors?.errorType == 2;
                let bHasLoginError = b.stats?.errors?.errorType == 2;
                if (aHasLoginError) {
                    return -1;
                } else if (bHasLoginError) {
                    return 1;
                }
                return a.id > b.id ? -1 : 1
            } else if (a.nextRoll === null) {
                return 1;
            } else if (b.nextRoll === null) {
                return -1;
            } else {
                return a.nextRoll.getTime() < b.nextRoll.getTime() ? -1 : 1;
            }
        });
    }

    static crud(data) {
        let isInvalid = false;
        try {
            const orphanSites = [];
            // TODO: check if there are 2 schedules with the same uuid
            // data.map(x => x.uuid)
            data.forEach(x => {
                if (x.added) {
                    if (Schedule.getById(x.uuid)) {
                        isInvalid = true;
                    } else {
                        let newSchedule = new Schedule({
                            uuid: x.uuid,
                            name: x.name,
                            order: x.order
                        })
                        Schedule.getAll().push(newSchedule);
                        newSchedule.start();
                    }
                } else if (x.removed) {
                    console.log('@x.removed');
                    console.log({x: x, schedules: Schedule.getAll() });
                    let pos = Schedule.getAll().findIndex(s => s.uuid == x.originals.uuid);
                    console.log({pos: pos});
                    orphanSites.push(...Schedule.getAll()[pos].sites);
                    Schedule.getAll().splice(pos, 1);
                } else {
                    // treat as updated
                    let sch = Schedule.getAll().find(s => s.uuid == x.originals.uuid);
                    if (Schedule.getById(x.uuid) && (Schedule.getById(x.uuid) != sch)) {
                        isInvalid = true;
                    } else {
                        sch.uuid = x.uuid;
                    }
                    sch.name = x.name;
                    sch.order = x.order;
                }
            });

            // Sort by order
            Schedule.getAll().sort((a, b) => a.order - b.order);
            console.log('New Schedule List');
            console.log({ newSchedules: Schedule.getAll() });

            if (orphanSites.length > 0) {
                // TODO: this should go somewhere else to allow saving, and only when really necessary
                orphanSites.forEach(x => {
                    x.schedule = Schedule.getAll()[0].uuid;
                    // Schedule.getAll()[0].sites.push(x);
                });

                Schedule.getAll()[0].sites.push(...orphanSites);
            }
            Schedule.saveAll();
        } catch (err) {
            console.log('Error @Schedule.crud');
            console.error(err);
            return false;
        }
        if (isInvalid) {
            return false;
        }
        return true;
    }

    addSite(site)     { this.sites.push(site) }
    removeSite(siteId)  {
        if (this.sites.findIndex(x => x.id === siteId) > -1) {
            this.sites = this.sites.filter(x => x.id !== siteId);
            // this.sites.splice(this.sites.findIndex(x => x.id == siteId), 1);
            this.setCurrentSite();
        }
    }

    setCurrentSite() {
        // TODO: review if I should sort it first!
        this.currentSite = this.sites[0];
    }

    start() {
        this.status = STATUS.IDLE;
        this.worker = setTimeout(() => {
            this.checkNextRoll();
        }, 2000);
    }

    checkNextRoll() {
        if (this.status != STATUS.IDLE) {
            console.log(`[${this.uuid}] Skipping checkNextRoll`);
            return;
        }
        console.log(`[${this.uuid}] Checking next roll...`); // , this.currentSite.name, this.currentSite.nextRoll, this.currentSite);
        this.timer.stopCheck();
        clearTimeout(this.worker);
        if(!this.currentSite || this.currentSite.nextRoll == null) {
            // ui.log(`[${this.uuid}] All faucets in Schedule ${this.uuid} are disabled. Click edit and select those you want to run, or just hit the 'Run ASAP' link at the Actions column...`);
            document.querySelector(`#wait-times span[data-schedule="${this.uuid}"]`).setAttribute('data-nextroll', 'UNDEFINED');
            this.status = STATUS.IDLE;
            console.log(`[${this.uuid}] Schedule empty`);
            // shared.clearFlowControl(this.uuid);
            return;
        }

        if(this.currentSite.nextRoll.getTime() < Date.now()) {
            // Open it!
            console.log(`[${this.uuid}] Opening site`);
            ui.log({ schedule: this.uuid, siteName: this.currentSite.name, msg: `Opening ${this.currentSite.name}`});
            document.querySelector(`#wait-times span[data-schedule="${this.uuid}"]`).setAttribute('data-nextroll', 'RUNNING');
            this.open();
            this.timeUntilNext = null;
            return;
        } else {
            this.timeUntilNext = this.currentSite.nextRoll.getTime() - Date.now() + helpers.randomMs(1000, 2000);
            console.log(`[${this.uuid}] Waiting ${this.timeUntilNext/1000} seconds`);

            // ui.log(`[${this.uuid}] Waiting ${(this.timeUntilNext/1000/60).toFixed(2)} minutes...`);
            document.querySelector(`#wait-times span[data-schedule="${this.uuid}"]`).setAttribute('data-nextroll', this.currentSite.nextRoll.getTime());
            this.worker = setTimeout(() => {
                this.checkNextRoll();
            }, this.timeUntilNext);
            this.status = STATUS.IDLE;
        }
    }

    // // Alternative:
    // getParameter(param) {
    //     let val;
    //     // source: '0: defaults, 1: siteType, 2: schedule, 3: site/custom
    //     let from = this.parameterSource[param].source;
    //     switch(from) {
    //         case 0:
    //             val = Defaults.parameters[param];
    //             break;
    //         case 1:
    //             val = SiteTypes.get(this.siteTypeId).parameters[param];
    //             break;
    //         case 2:
    //             val = Schedule.get(this.scheduleId).parameters[param];
    //             break;
    //         case 3:
    //             val = this.parameters[param];
    //             break;
    //     }
    // }
    
    getCustomOrDefaultVal(param, useOverride = false) {
        let val;

        if (useOverride) {
            if (this.currentSite.params && this.currentSite.params.hasOwnProperty(param)) {
                val = this.currentSite.params[param];
                if (val != -1) {
                    return val;
                }
            }
        }

        return shared.getConfig()[param];
    }

    useOverride(param) {
        let overrideFlag = param  + '.override';
        return this.currentSite.params && this.currentSite.params[overrideFlag];
    }

    closeTab() {
        try {
            this.tab.close();
        } catch (err) {
            console.warn('Error while trying to close tab', err);
        }
    };

    reopenTab() {
        this.tab = GM_openInTab(this.currentSite.url, { active: !this.getCustomOrDefaultVal('defaults.workInBackground', this.useOverride('defaults.workInBackground')) });
    };

    open(promoCodes) {
        this.status = STATUS.CLAIMING;
        let navUrl = this.currentSite.url;
        try {
            let params = this.currentSite.params || {};
            params.siteParams = this.currentSite.siteParams || { "test": "test_value" };

            console.log('@open => this.currentSite.params:');
            console.log(params);
            if(promoCodes) {
                navUrl = new URL('promotion/' + promoCodes[0], this.currentSite.url.origin);
                ui.log({ schedule: this.uuid, siteName: this.currentSite.name, msg: `Opening ${this.currentSite.name} with ${promoCodes.length} Promo Codes [${promoCodes.join(',')}]`});
                params.promoCodes = promoCodes;
            }

            if (this.currentSite.firstRun) {
                if(Array.isArray(this.currentSite.rf) && this.currentSite.rf.length > 0) {
                    navUrl = new URL(navUrl.href + this.currentSite.rf[helpers.randomInt(0, this.currentSite.rf.length - 1)]);
                }
            }

            if (this.currentSite.wallet) {
                //TODO: VALIDATE THAT ADDRESS EXISTS AND IS VALID!!!
                try {
                    params.address = manager.userWallet.find(x => x.type == this.currentSite.wallet)?.address;
                    if (!params.address) {
                        throw new Error('Address is not defined.');
                    }
                } catch {
                    shared.addError(K.ErrorType.NO_ADDRESS, 'You need to add your address to the wallet before claiming this faucet.', this.uuid);
                    ui.log({ schedule: this.uuid, siteName: this.currentSite.name, msg: `Unable to launch ${this.currentSite.name}: Address not detected > add it to the wallet.`});
                    this.moveNextAfterTimeoutOrError();
                    return;
                }
            }
            if(this.currentSite.type == K.WebType.BESTCHANGE) {
                params.address = shared.getConfig()['bestchange.address'] == '1' ? manager.userWallet.find(x => x.type == 1).address : params.address;
            }
            params.timeout = this.getCustomOrDefaultVal('defaults.timeout', this.useOverride('defaults.timeout'));
            params.cmc = this.currentSite.cmc;

            if(this.currentSite.type == K.WebType.FPB) {
                switch(this.currentSite.id) {
                    case '77':
                        params.sitePrefix = 'fpb';
                        break;
                    case '83':
                        params.sitePrefix = 'fbch';
                        break;
                    case '92':
                        params.sitePrefix = 'shost';
                        break;
                    // case '84':
                        //     params.sitePrefix = 'jtfey';
                        //     break;
                }
            }

            // TODO: create credentials on site level
            if(this.currentSite.type == K.WebType.VIE) {
                params.credentials = {
                    mode: shared.getConfig()['jtfey.credentials.mode'],
                    username: shared.getConfig()['jtfey.credentials.username'],
                    password: shared.getConfig()['jtfey.credentials.password']
                };
            }

            // ui.log({ schedule: this.uuid, siteName: this.currentSite.name, msg: `Setting Flow Control (id=${this.currentSite.id}, navUrl=${navUrl})`});
            shared.setFlowControl(this.uuid, this.currentSite.id, navUrl, this.currentSite.type, params);
            setTimeout(() => {
                this.waitForResult();
            }, 15000);

            if (this.tab && !this.tab.closed) {
                    shared.devlog(`Tab closed from Manager`);
                    this.closeTab(); // this.tab.close();
            } else {
                shared.devlog(`No open tabs detected`);
            }

            this.timer.startCheck(this.currentSite.type);
            let noSignUpList = [ K.WebType.BESTCHANGE, K.WebType.CBG, K.WebType.G8, K.WebType.O24, K.WebType.CDIVERSITY, K.WebType.CTOP, K.WebType.AUTOCML, K.WebType.CCLICKS ];
            let hrefOpener = navUrl.href;
            if (noSignUpList.includes(this.currentSite.type)) {
                hrefOpener = (new URL(this.currentSite.clId, 'https://criptologico.com/goto/')).href;
            }

            console.log('hrefOpener', hrefOpener);
            console.log('@open => opening params:');
            console.log(params);
            this.tab = GM_openInTab(hrefOpener, { active: !this.getCustomOrDefaultVal('defaults.workInBackground', this.useOverride('defaults.workInBackground')) });
        } catch(err) {
            ui.log({ schedule: this.uuid, msg: `Error opening tab: ${err}`});
            // TODO: refresh or rollback site data
        }
    };

    // newResultReader() {
    //     if (isObsolete()) {
    //         return;
    //     }

    //     const siteTypeHooks = [
    //         {
    //             hookType: 'isCompleted',
    //             siteType: K.WebType.FAUCETPAY,
    //             exec: (data) => {
    //                 if (data.timeWaiting < shared.getConfig()['fp.maxTimeInMinutes'] * 60 && data.tab && !data.tab.closed) {
    //                     return false;
    //                 } else {
    //                     return true;
    //                 }
    //             }
    //         }
    //     ];

    //     let hooksResult = true;
    //     siteHooks.filter(hook => hook.hookType == 'isCompleted' && hook.siteType == this.currentSite.type).forEach(hook => {
    //         hooksResult &= hook.exec(this);
    //     });

    // };

    waitForResult() {
        if(manager.isObsolete()) {
            return;
        }

        console.log(`${(new Date()).toLocaleTimeString()} - Completed: ${shared.isIncompleted(this.currentSite.id)}`);
        console.log(`${(new Date()).toLocaleTimeString()} - hasTimedOut: ${this.hasTimedOut()}`);
        // ui.log(`[${this.uuid}] @resultReader. Current Id: ${this.currentSite.id}`);
        if(shared.isCompleted(this.currentSite.id)) {
            console.log(`${(new Date()).toLocaleTimeString()} - Going to analyzeResult`);
            this.analyzeResult(); // rename to something else...
            return;
        }

        this.timeWaiting += 15;
        if(shared.isIncompleted(this.currentSite.id) && this.hasTimedOut()) {
            console.log(`${(new Date()).toLocaleTimeString()} - Site has timed out but is WORKING/Incompleted`);
            this.analyzeResult(); // rename to something else...
            return;
        }

        console.log(`${(new Date()).toLocaleTimeString()} - Going to waitOrMoveNext`);
        this.waitOrMoveNext(); // this should just be the error and timeout check
        return;

        // if ( ( (this.currentSite.type == K.WebType.FAUCETPAY && this.timeWaiting < shared.getConfig()['fp.maxTimeInMinutes'] * 60) )
        //     && this.tab && !this.tab.closed ) {
        //     this.timeWaiting += 15;
        //     ui.log(`[${this.uuid}] Waiting for ${this.currentSite.name} results...`, this.timeWaiting);
        //     setTimeout(() => {
        //         this.resultReader();
        //     }, 15000);
        //     return;
        // }

        // if(shared.isCompleted(this.currentSite.id)) {
        //     this.analyzeResult();
        // } else {
        //     this.resultReader_part02();
        // }
    };

    analyzeResult() {
        // ui.log(`[${this.uuid}] @analyzeResult`);
        console.log(`[${this.uuid}] @analyzeResult`);

        // if it was visited:
        // let result = shared.getResult(this.uuid);
        let currentSchedule = shared.getCurrent(this.uuid);
        currentSchedule.result = currentSchedule.result || {};
        currentSchedule.runStatus = currentSchedule.runStatus || false;

        if (currentSchedule.result) {
            this.updateWebListItem(currentSchedule);

            if (currentSchedule.result.closeParentWindow) {
                ui.log({ schedule: this.uuid, msg: `Closing working tab per process request` });
                this.closeTab();
            }

            // if ( (this.currentSite.type == K.WebType.CRYPTOSFAUCETS) &&
            //     ( (result.claimed) || (result.promoStatus && result.promoStatus != K.CF.PromoStatus.ACCEPTED) )) {
            if (this.currentSite.type == K.WebType.CRYPTOSFAUCETS) {
                let promoCode = CFPromotions.hasPromoAvailable(this.currentSite.id);
                if (promoCode) {
                    this.timeWaiting = 0;

                    this.currentSite.nextRoll = new Date(754000 + +this.currentSite.id);
                    manager.update(false);
                    this.open(promoCode);
                    return;
                }
            }
        } else {
            ui.log({ schedule: this.uuid, siteName: this.currentSite.name, msg: `Unable to read last run result, for ID: ${this.currentSite.id} > ${this.currentSite.name}`});
            console.log({current:this.currentSite});
        }

        this.timeWaiting = 0;
        this.status = STATUS.IDLE;
        // ui.log({ schedule: this.uuid, msg: `Clearing flow control for ${this.uuid}`});
        shared.clearFlowControl(this.uuid);
        manager.update(true);
        manager.readUpdateValues(true);
        return;
    }

    waitOrMoveNext() {
        // ui.log(`[${this.uuid}] @waitOrMoveNext`);
        // No visited flag
        if (this.currentSite.isExternal) {
            if (!this.tab || (this.tab && this.tab.closed)) {
                console.log('Tab not found. Emulating timeout');
                this.timeWaiting = this.getCustomOrDefaultVal('defaults.timeout', this.useOverride('defaults.timeout')) * 60 + 9999;
            }
        }
        if (!shared.hasErrors(this.currentSite.id) && !this.hasTimedOut()) {
            ui.log({ schedule: this.uuid, 
                siteName: this.currentSite.name,
                elapsed: this.timeWaiting, 
                msg: `Waiting for ${this.currentSite.name} results...`});
            setTimeout(() => {
                this.waitForResult();
            }, 15000);
            return;
        }

        if (shared.hasErrors(this.currentSite.id)) {
            this.currentSite.stats.errors = shared.getResult(this.uuid); // shared.getResult(this.uuid);
            console.log('@shared.hasErrors(this.currentSite.id)');
            console.log(this.currentSite.stats.errors);
            console.log(`${this.currentSite.name} closed with error: ${helpers.getEnumText(K.ErrorType,this.currentSite.stats.errors.errorType)} ${this.currentSite.stats.errors.errorMessage}`);

            ui.log({ schedule: this.uuid, siteName: this.currentSite.name, 
                msg: `${this.currentSite.name} closed with error: ${helpers.getEnumText(K.ErrorType,this.currentSite.stats.errors.errorType)} ${this.currentSite.stats.errors.errorMessage}`});
            // if(this.currentSite.type == K.WebType.CBG) {
            //     ui.log({ schedule: this.uuid, 
            //         msg: `Closing working tab per process request` });
            //     this.closeTab();
            // }

            if(this.sleepIfBan()) {
                return;
            }
        }

        if (this.hasTimedOut()) {
            if (this.currentSite.isExternal) {
                this.currentSite.stats.countTimeouts = 0;
                this.currentSite.stats.errors = null;
                ui.log({ schedule: this.uuid, siteName: this.currentSite.name, 
                    msg: `Closing ${this.currentSite.name}` });
                    try {
                        this.closeTab();
                    } catch (err) { console.error('Unable to close working tab', err); }
                this.moveAfterNormalRun();
                return;
            } else {
                if(this.currentSite.stats.countTimeouts) {
                    this.currentSite.stats.countTimeouts += 1;
                } else {
                    this.currentSite.stats.countTimeouts = 1;
                }

                ui.log({ schedule: this.uuid, siteName: this.currentSite.name, 
                    msg: `Waited too much time for ${this.currentSite.name} results: triggering timeout` });
            }
        }

        this.moveNextAfterTimeoutOrError();
        return;
    }

    hasTimedOut() { // here or on a site level???
        // return (this.timeWaiting > +this.currentSite.preloaded.timeout);
        let val = this.getCustomOrDefaultVal('defaults.timeout', this.useOverride('defaults.timeout')) * 60;
        return (this.timeWaiting > val);
    };

    // REFACTOR
    sleepIfBan() { // This should be a SiteType hook
        if( (this.currentSite.stats.errors.errorType == K.ErrorType.IP_BAN && shared.getConfig()['cf.sleepHoursIfIpBan'] > 0)
        || ( (this.currentSite.stats.errors.errorType == K.ErrorType.IP_RESTRICTED || this.currentSite.stats.errors.errorType == K.ErrorType.IP_BAN) && shared.getConfig()['bk.sleepMinutesIfIpBan'] > 0) ) {
            if(this.currentSite.type == K.WebType.CRYPTOSFAUCETS) {
                // Schedule.forEach( function (sch) {
                //     sch.sites.filter(x => x.enabled && x.type == K.WebType.CRYPTOSFAUCETS)
                //              .forEach( function (el) {
                //                 el.nextRoll = this.sleepCheck(helpers.addMs(helpers.getRandomMs(shared.getConfig()['cf.sleepHoursIfIpBan'] * 60, 2)).toDate());
                //              });
                // });
                Site.getAll().filter(x => x.enabled && x.type == K.WebType.CRYPTOSFAUCETS)
                    .forEach( function(el) {
                    el.nextRoll = this.sleepCheck(helpers.addMs(helpers.getRandomMs(shared.getConfig()['cf.sleepHoursIfIpBan'] * 60, 2)).toDate());
                });
            }

            shared.clearFlowControl(this.uuid);
            manager.update(true);
            this.timeWaiting = 0;
            this.status = STATUS.IDLE;
            shared.clearFlowControl(this.uuid);
            manager.readUpdateValues(true);
            return true;
        }
        return false;
    }

    updateWebListItem(currentSchedule) {
        // TODO: store on a site level history all result data
        let result = currentSchedule.result;

        ui.log({ schedule: this.uuid, 
            msg: `Updating data: ${JSON.stringify(result)}` });
        this.currentSite.stats.countTimeouts = 0;
        this.currentSite.stats.errors = null;

        if (result.claimed) {
            try {
                result.claimed = parseFloat(result.claimed);
            } catch { }
            if(!isNaN(result.claimed)) {
                this.currentSite.lastClaim = result.claimed;
                this.currentSite.aggregate += result.claimed;
            }
        }
        if(result.balance) {
            this.currentSite.balance = result.balance;
        }
        this.currentSite.nextRoll = this.getNextRun(result.nextRoll ? result.nextRoll.toDate() : null);
        if(result.promoCodeResults) { // TODO: move to a processResult hook
            for(let i = 0; i < result.promoCodeResults.length; i++) {
                let item = result.promoCodeResults[i];
                CFPromotions.updateFaucetForCode(item.promoCode, this.currentSite.id, item.promoStatus);
            }
        }
        if(result.rolledNumber) {
            CFHistory.addRoll(result.rolledNumber);
        }
    }

    getNextRun(nextRollFromCountdown) {
        let useCustom = this.useOverride('defaults.nextRun');
        let useCountdown = this.getCustomOrDefaultVal('defaults.nextRun.useCountdown', useCustom);
        let nextRunMode = this.getCustomOrDefaultVal('defaults.nextRun', useCustom);
        let min = this.getCustomOrDefaultVal('defaults.nextRun.min', useCustom);
        let max = this.getCustomOrDefaultVal('defaults.nextRun.max', useCustom);
        let nextRun;

        if (useCountdown && nextRollFromCountdown) {
            nextRun = nextRollFromCountdown;
        } else {
            let minutes = (nextRunMode == 0) ? helpers.randomInt(min, max) : nextRunMode;
            let msDelay = helpers.getRandomMs(minutes, 1);

            nextRun = helpers.addMs(msDelay).toDate();
        }
        nextRun = this.sleepCheck(nextRun)

        shared.devlog(`@getNextRun: ${nextRun}`);
        return nextRun;
        // return setNextRun(nextRollFromCountdown).then(setDelays).then(setSleepTime);
    }

    errorTreatment() { // Move to group custom getNextRoll
        //TODO: validate that stats.errors.errorType exists
        shared.devlog(`@errorTreatment`);
        try {
            switch(this.currentSite.stats.errors.errorType) {
                case K.ErrorType.NEED_TO_LOGIN:
                    this.currentSite.enabled = false;
                    this.currentSite.nextRoll = null;
                    return true;
                case K.ErrorType.FAUCET_EMPTY: // retry in 8 hours
                    this.currentSite.enabled = true;
                    this.currentSite.nextRoll = new Date(new Date().setHours(new Date().getHours() + 8));
                    return true;
            }
        } catch {}
        return false;
    }

    sleepCheck(nextRun) {
        let useCustom = this.useOverride('defaults.sleepMode');
        let sleepMode = this.getCustomOrDefaultVal('defaults.sleepMode', useCustom);

        if (sleepMode) {
            let intNextRunTime = nextRun.getHours() * 100 + nextRun.getMinutes();
            let min = this.getCustomOrDefaultVal('defaults.sleepMode.min', useCustom).replace(':', '');
            let max = this.getCustomOrDefaultVal('defaults.sleepMode.max', useCustom).replace(':', '');

            if (+min < +max) {
                if (+min < intNextRunTime && intNextRunTime < +max) {
                    shared.devlog(`Sleep Mode [${min} to ${max}]: adjusting next run. NextRunTimeInt => ${intNextRunTime}`);
                    nextRun.setHours(max.slice(0, 2), max.slice(-2), 10, 10);
                    ui.log({ schedule: this.uuid, 
                        msg: `Next run adjusted by Sleep Mode: ${helpers.getPrintableDateTime(nextRun)}` });
                }
            } else if (+min > +max) {
                if (intNextRunTime > +min || intNextRunTime < +max) {
                    shared.devlog(`Sleep Mode [${max} to ${min}]: adjusting next run. NextRunTimeInt => ${intNextRunTime}`);
                    nextRun.setHours(max.slice(0, 2), max.slice(-2), 10, 10);
                    if (nextRun.getTime() < Date.now()) {
                        // add 1 day
                        nextRun.setDate(nextRun.getDate() + 1);
                    }
                    ui.log({ schedule: this.uuid, 
                        msg: `Next run adjusted by Sleep Mode: ${helpers.getPrintableDateTime(nextRun)}` });
                }
            }
        }
        return nextRun;
    }

    moveAfterNormalRun() {
        this.currentSite.nextRoll = this.getNextRun(null);
        shared.devlog(`@moveAfterNormalRun: ${this.currentSite.nextRoll}`);

        shared.clearFlowControl(this.uuid);
        manager.update(true);
        this.timeWaiting = 0;
        this.status = STATUS.IDLE;
        shared.clearFlowControl(this.uuid);
        manager.readUpdateValues(true);
    }

    moveNextAfterTimeoutOrError() {
        let useCustom = this.useOverride('defaults.postponeMinutes');

        let mode = this.getCustomOrDefaultVal('defaults.postponeMinutes', useCustom);
        let min = this.getCustomOrDefaultVal('defaults.postponeMinutes.min', useCustom);
        let max = this.getCustomOrDefaultVal('defaults.postponeMinutes.max', useCustom);

        let minutes = (mode == 0) ? helpers.randomInt(min, max) : mode;
        let msDelay = helpers.getRandomMs(minutes, 5);

        this.currentSite.nextRoll = this.sleepCheck(helpers.addMs(msDelay).toDate());
        if(this.errorTreatment()) {
            shared.devlog(`@moveNextAfterTimeoutOrError: errorTreatment => true`);
        }
        shared.devlog(`@moveNextAfterTimeoutOrError: ${this.currentSite.nextRoll}`);

        shared.clearFlowControl(this.uuid);
        manager.update(true);
        this.timeWaiting = 0;
        this.status = STATUS.IDLE;
        shared.clearFlowControl(this.uuid);
        manager.readUpdateValues(true);
    }
}
