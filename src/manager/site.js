class Site {
    constructor(params) {
        Object.assign(this, {
            schedule: '4a70e0', // Owner!
            id: null,
            name: null,
            cmc: null, // REVIEW LOCATION
            coinRef: null, // REVIEW LOCATION. Only for CFs?
            url: null, // REVIEW FORMAT. Only one/'start' url? What about complex scripts/rotators/SLs?
            rf: null, // ...
            type: null, // REVIEW DEFAULT. It should be something like 'Crawler' or 'Handler' and the site params should depend on this value
            clId: null,
            wallet: null, // should be part of site parameters/crawler based?
            enabled: false,
            lastClaim: 0,
            aggregate: 0,
            balance: 0,
            stats: {},
            nextRoll: null,
            params: {}, // should have schedule overrides and be called customExecution, scheduleParamaters or something like that
            firstRun: true,
            isExternal: false,
            // parameters: {},
            // execution: {},
        }, params);

        this.setLegacyConditionalDefaults();

        // TODO: some EventEmitters?
        // TODO: check if data is valid
        // How to handle particular cases such as Promo Codes? As a SiteType parameter?
        // this.parameters = {}
    }

    setLegacyConditionalDefaults() {
        if (this.type == K.WebType.CRYPTOSFAUCETS) {
            this.schedule = '65329c';
        }

        // if (this.type == K.WebType.BFBOX) {
        //     this.params['defaults.nextRun.override'] = true;
        //     this.params['defaults.nextRun.useCountdown'] = false;
        //     this.params['defaults.nextRun'] = 0;
        //     this.params['defaults.nextRun.min'] = 21;
        //     this.params['defaults.nextRun.max'] = 25;
        // }

        if (this.type == K.WebType.FREEBITCOIN) {
            this.params['custom.useWofRp'] = 0;
            this.params['custom.useFunRp'] = 0;
        }

        if (this.type == K.WebType.STORMGAIN) {
            this.params['defaults.nextRun.override'] = true;
            this.params['defaults.nextRun.useCountdown'] = true;
            this.params['defaults.nextRun'] = 0;
            this.params['defaults.nextRun.min'] = 15;
            this.params['defaults.nextRun.max'] = 20;
        }
        if (this.type == K.WebType.FAUCETPAY) {
            this.params['defaults.workInBackground.override'] = true;
            this.params['defaults.workInBackground'] = false;
            this.params['defaults.nextRun.override'] = true;
            this.params['defaults.nextRun.useCountdown'] = false;
            this.params['defaults.nextRun'] = 0;
            this.params['defaults.nextRun.min'] = 300;
            this.params['defaults.nextRun.max'] = 360;
        }
        if (this.type == K.WebType.BIGBTC) {
            this.params['defaults.nextRun.override'] = true;
            this.params['defaults.nextRun.useCountdown'] = false;
            this.params['defaults.nextRun'] = 0;
            this.params['defaults.nextRun.min'] = 15;
            this.params['defaults.nextRun.max'] = 40;
        }
        if (this.type == K.WebType.DUTCHYROLL) {
            this.params['defaults.nextRun.override'] = true;
            this.params['defaults.nextRun.useCountdown'] = true;
            this.params['defaults.nextRun'] = 0;
            this.params['defaults.nextRun.min'] = 30;
            this.params['defaults.nextRun.max'] = 35;
        }
        if (this.type == K.WebType.FCRYPTO) {
            this.params['defaults.workInBackground.override'] = true;
            this.params['defaults.workInBackground'] = false;
            this.params['defaults.nextRun.override'] = true;
            this.params['defaults.nextRun.useCountdown'] = false;
            this.params['defaults.nextRun'] = 0;
            this.params['defaults.nextRun.min'] = 26;
            this.params['defaults.nextRun.max'] = 35;
            this.params['defaults.timeout.override'] = true;
            this.params['defaults.timeout'] = 3;
            this.params['defaults.postponeMinutes.override'] = true;
            this.params['defaults.postponeMinutes'] = 0;
            this.params['defaults.postponeMinutes.min'] = 12;
            this.params['defaults.postponeMinutes.max'] = 18;
        }
        if (this.type == K.WebType.FPB) {
            this.params['defaults.nextRun.override'] = true;
            this.params['defaults.nextRun.useCountdown'] = false;
            this.params['defaults.nextRun'] = 0;
            this.params['defaults.nextRun.min'] = 22;
            this.params['defaults.nextRun.max'] = 45;
        }
    }

    static _sites = [];
    static getAll() {
        return Site._sites;
    }

    static getById(siteId) {
        return Site.getAll().find(x => x.id == siteId) || false;
    }

    static createFromDataArray(newSites) {
        if (!Array.isArray(newSites)) {
            newSites = [...newSites];
        }
        newSites.forEach(s => Site.getAll().push(new Site(s)));
    }

    static add(data) { 
        let newSite = new Site(data);
        Site.getAll().push(newSite);


        let schedule = Schedule.getById(newSite.schedule);

        // Quick fix for Schedule errors: refactor
        if (!schedule) {
            try {
                schedule = Schedule.getAll()[0];
            } catch (err) {
                console.warn('No schedules found! Reseting to default schedules');
                let defaultSchedule = new Schedule({ uuid: '4a70e0', name: 'Default' });
                let sampleSchedule = new Schedule({ uuid: '65329c', name: 'CF' });
                if (Schedule.getAll().length == 0) {
                    Schedule.add(defaultSchedule);
                    Schedule.add(sampleSchedule);
                }
                schedule = Schedule.getAll()[0];
            }
        }

        if (!schedule) {
            console.warn('Schedule NOT found');
            console.warn(data);
            return;
        }
        schedule.addSite(newSite);

        eventer.emit('siteAdded', {
            siteId: newSite.id,
            siteName: newSite.name,
            scheduleId: newSite.schedule
        });
    }

    static remove(siteId) {
        let idx = this._sites.findIndex(x => x.id === siteId);
        if (idx > -1 && this._sites[idx].isExternal) {
            let siteName = this._sites[idx].name;
            this._sites = Site.getAll().filter(x => x.id !== siteId);
            Schedule.getAll().forEach(sch => {
                sch.removeSite(siteId);
            });
            eventer.emit('siteRemoved', {
                siteId: siteId,
                siteName: siteName
            });
        }

    }

    static sortAll() {
        Site.getAll().sort( function(a,b) {
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

    static setAsRunAsap(siteId) {
        console.log(`@Site.setAsRunAsap`);
        let site = Site.getById(siteId);
        if (!site) return false;

        try {
            let schedule = Schedule.getById(site.schedule);
            if (schedule.status == STATUS.CLAIMING) {
                console.warn(`Setting ASAP as 1st in schedule time + 1`);
                site.nextRoll = new Date(schedule.currentSite.nextRoll.getTime() + 1);
            } else {
                let now = new Date();
                if (!schedule.currentSite?.nextRoll) {
                    console.warn(`Setting ASAP as now()`);
                    site.nextRoll = now;
                } else if (now < schedule.currentSite.nextRoll) {
                    console.warn(`Setting ASAP as now()`);
                    site.nextRoll = now;
                } else {
                    console.warn(`Setting ASAP as 1st in schedule time - 1`);
                    site.nextRoll = new Date(schedule.currentSite.nextRoll.getTime() - 1);
                }
            }
            site.enabled = true;

            console.warn(`[${site.schedule}] ${site.name} updated to run ASAP from Site`);
            // TODO: all updates and refreshes
            eventer.emit('siteUpdated', site);
            return;
        } catch (err) {
            console.error(err);
            ui.log({msg: `Error setting faucet to run ASAP from Site: ${err}`});
        }
    }

    // Implementation referencing only id at this.schedule:
    changeSchedule(newScheduleId) {
        let oldScheduleId = null;
        if (this.schedule) {
            oldScheduleId = this.schedule;
            Schedule.getById(this.schedule)?.removeSite(this.id);
            // eventer.emit('removeSiteFromSchedule', { site_id: this.id, schedule_id: this.schedule });
        }
        this.schedule = newScheduleId;
        let newSchedule = Schedule.getById(this.schedule);
        newSchedule.addSite(this); // maybe use just the ids...
        eventer.emit('siteChangedSchedule', {
            siteId: this.id,
            scheduleId: this.schedule,
            oldScheduleId: oldScheduleId
        });
    }

    static saveAll() {
        console.log({ saveAllSites: 'Site.saveAll()', sites: Site._sites.map(x => x.toStorage()) });
        persistence.save('webList', Site._sites.map(x => x.toStorage()), true);
        console.log({sites: 'saved', list: Site._sites});
    }

    toStorage() { // Single site
        if (!this.isExternal) {
            return {
                id: this.id,
                isExternal: this.isExternal || false,
                name: this.name,
                schedule:this.schedule,
                lastClaim: this.lastClaim,
                aggregate: this.aggregate,
                balance: this.balance,
                stats: this.stats,
                nextRoll: this.nextRoll,
                enabled: this.enabled,
                params: this.params
            };
        } else {
            return {
                id: this.id,
                url: this.url.href,
                clId: this.clId,
                type: this.type,
                cmc: this.cmc,
                rf: this.rf,
                name: this.name,
                isExternal: this.isExternal || false,
                schedule:this.schedule,
                lastClaim: this.lastClaim,
                aggregate: this.aggregate,
                balance: this.balance,
                stats: this.stats,
                nextRoll: this.nextRoll,
                enabled: this.enabled,
                params: this.params
            };
        }
    }

    update(items) { // this should be for Parameters or Execution (custom)
        this.params = this.params || {};
        items.forEach( item => {
            this.params[item.prop] = item.value;
        });
        ui.log({schedule: this.schedule, siteName: this.name, msg: `Site ${this.name} updated`});
    }

    getSiteParameters() {
        if (this.type == K.WebType.CRYPTOSFAUCETS) {
            this.siteParameters = {
                handler: 'CF',
                fields: [
                    { name: 'try_get_codes', type: 'checkbox', value: 'false', text: 'Auto update promo codes' },
                    { name: 'max_rolls_per_visit', type: 'numberInput', value: 1, min: 0 },
                    { name: 'autologin', type: 'checkbox', value: 'true', text: 'Autologin when necessary' },
                    { name: 'credentials_mode', type: 'credentials_or_autofilled', value: '2' },
                    { name: 'email', type: 'email', value: '' },
                    { name: 'password', type: 'password', value: '' }
                ]
            };
        }
        return this.siteParameters || false;
    }
}
