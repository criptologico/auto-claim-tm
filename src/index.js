{{meta/index.js}}

(function() {
    'use strict';
    const localeConfig = {
        setToEnglish: true, // will set the faucets to English
        stringSearches: {
            promoCodeAccepted: 'roll',
            promoCodeUsed: 'already used',
            promoCodeInvalid: ['not found', 'only alphanumeric'],
            promoCodeExpired: ['ended']
        }
    };

    {{utils/constants.js}}

    let persistence, shared, manager, ui, CFPromotions, interactions, CFHistory, SiteProcessor, eventer;
    let uiRenderer;

    {{utils/extension-methods.js}}

    {{utils/helpers.js}}

    class Persistence {
        constructor(prefix = 'autoWeb_') {
            this.prefix = prefix;
        }
        save(key, value, parseIt = false) {
            GM_setValue(this.prefix + key, parseIt ? JSON.stringify(value) : value);
        }
        load(key, parseIt = false) {
            let value = GM_getValue(this.prefix + key);
            if(value && parseIt) {
                value = JSON.parse(value);
            }
            return value;

        }
    }

    // class Shared {
    //     constructor() {
    //         this.scheduleUuid = null;
    //         this.runningSites = {};
    //         this.initializeConfig();
    //     }
    //     initializeConfig() {
    //         // Defaults:
    //         this.config = {
    //             'devlog.enabled': false,
    //             'devlog.maxLines': 200,
    //             'defaults.extraInterval': true,
    //             'defaults.timeout': 4,
    //             'defaults.postponeMinutes': 65,
    //             'defaults.postponeMinutes.min': 65,
    //             'defaults.postponeMinutes.max': 65,
    //             'defaults.workInBackground': true,
    //             'defaults.nextRun.useCountdown': true,
    //             'defaults.nextRun': 60,
    //             'defaults.nextRun.min': 60,
    //             'defaults.nextRun.max': 60,
    //             'defaults.sleepMode': false,
    //             'defaults.sleepMode.min': "00:00",
    //             'defaults.sleepMode.max': "01:00",
    //             'cf.tryGetCodes': false,
    //             'cf.rollOnce': false,
    //             'cf.maxRollsPerVisit': 1,
    //             'cf.autologin': false,
    //             'cf.credentials.mode': 1,
    //             'cf.credentials.email': 'YOUR@EMAIL.com',
    //             'cf.credentials.password': 'YOURPASSWORD',
    //             'cf.sleepHoursIfIpBan': 8,
    //             'fp.maxTimeInMinutes': 15,
    //             'fp.randomPtcOrder': true,
    //             'dutchy.useBoosted': false,
    //             'bk.withdrawMode': "0",
    //             'bk.hoursBetweenWithdraws': 4,
    //             'bk.sleepMinutesIfIpBan': 75,
    //             'bestchange.address': '101',
    //             'ui.runtime': 0,
    //             'fpb.credentials.mode': 2,
    //             'fpb.credentials.username': 'YOUR_USERNAME',
    //             'fpb.credentials.password': 'YOURPASSWORD',
    //             'bigbtc.postponeMinutes': '0',
    //             'fbch.credentials.mode': 2,
    //             'fbch.credentials.username': 'YOUR_USERNAME',
    //             'fbch.credentials.password': 'YOURPASSWORD',
    //             'jtfey.credentials.mode': 2,
    //             'jtfey.credentials.username': 'YOUR_USERNAME',
    //             'jtfey.credentials.password': 'YOURPASSWORD',
    //             'shost.credentials.mode': 2,
    //             'shost.credentials.username': 'YOUR_USERNAME',
    //             'shost.credentials.password': 'YOURPASSWORD',
    //             'ycoin.credentials.mode': 2,
    //             'ycoin.credentials.username': 'YOUR_ACCOUNT_NUMBER',
    //             'ycoin.credentials.password': 'YOURPASSWORD',
    //             'bkclass.coin': 'LTC',
    //             'bkclass.bcoin': 'LTC',
    //             'bscads.credentials.mode': 2,
    //             'bscads.credentials.username': 'YOUR_USERNAME',
    //             'bscads.credentials.password': 'YOURPASSWORD',
    //             'migrations': [
    //                 {version: '00200799', applied: false} // migration to change pcodes status from error to usable due to ui changes
    //             ]
    //             // config['fb.activateRPBonus'] = true;
    //             // config['fp.hoursBetweenRuns'] = 6;
    //         };
            
    //         let storedData = persistence.load('config', true);
    //         if(storedData) {
    //             for (const prop in this.config) {
    //                 if(storedData.hasOwnProperty(prop)) {
    //                     this.config[prop] = storedData[prop];
    //                 }
    //             }
    //         }

    //         this.config.version = GM_info.script.version;
    //     }
    //     getConfig() {
    //         return this.config;
    //     }
        
    //     updateConfig(items) {
    //         for (const item of items) {
    //             this.config[item.prop] = item.value;
    //         }
    //         persistence.save('config', this.config, true);
    //     }
        
    //     migrationApplied(migrationVersion) {
    //         try {
    //             let mig = this.config.migrations.find(x => x.version == migrationVersion);
    //             mig.applied = true;
    //             persistence.save('config', this.config, true);
    //         } catch (err) {
    //             console.warn('Error saving migration as applied');
    //             console.error(err);
    //         }
    //     }
        
    //     devlog(msg, elapsed = false, reset = false) {
    //         if (!this.config['devlog.enabled']) {
    //             return;
    //         }
        
    //         let log;
    //         if (reset) {
    //             log = [`${helpers.getPrintableTime()}|Log cleared`];
    //         } else {
    //             log = persistence.load('devlog', true) || [];
    //         }
        
    //         if (msg) {
    //             msg = this.scheduleUuid ? `[${this.scheduleUuid}] ${msg}` : msg;
    //             let previous;
    //             try {
    //                 previous = log[log.length - 1].split('|')[1];
    //             } catch {}
    //             if (elapsed && previous === msg) {
    //                 log[log.length - 1] = `${helpers.getPrintableTime()}|${msg}|[Elapsed time: ${elapsed} seconds]`;
    //             } else {
    //                 log.push(`${helpers.getPrintableTime()}|${msg}`);
    //             }
    //         }
        
    //         if (log.length > 200) {
    //             log.splice(0, log.length - 200);
    //         }
        
    //         persistence.save('devlog', log, true);
    //     }
        
    //     getDevLog() {
    //         let log = persistence.load('devlog', true);
    //         if (log) {
    //             return log;
    //         }
    //     }

    //     isOpenedByManager() {
    //         this.loadFlowControl();
    //         if(!this.runningSites || this.runningSites == {}) {
    //             return false;
    //         }
    //         let uuid = null;
    //         for (const sch in this.runningSites) {
    //             if ( (this.runningSites[sch].host && this.runningSites[sch].host == window.location.host) ||
    //                  (this.runningSites[sch].params && this.runningSites[sch].params.trackUrl && window.location.href.includes(this.runningSites[sch].params.trackUrl))
    //                ) {
    //                 uuid = sch;
    //                 break;
    //             }
    //         }
    //         if (!uuid) {
    //             return false;
    //         }

    //         if (this.runningSites[uuid].runStatus == 'COMPLETED') {
    //             return false;
    //         } else {
    //             this.scheduleUuid = uuid;
    //             return true;
    //         }            
    //     }

    //     loadFlowControl() { // TODO: renae to loadRunningSites
    //         this.runningSites = persistence.load('runningSites', true);
    //     }
    // }

    let objectGenerator = {
        createShared: function() {
            let config = {};
            function initializeConfig() {
                // Defaults:
                config = {
                    'devlog.enabled': false,
                    'devlog.maxLines': 200,
                    'defaults.extraInterval': true,
                    'defaults.timeout': 4,
                    'defaults.postponeMinutes': 65,
                    'defaults.postponeMinutes.min': 65,
                    'defaults.postponeMinutes.max': 65,
                    'defaults.workInBackground': true,
                    'defaults.nextRun.useCountdown': true,
                    'defaults.nextRun': 60,
                    'defaults.nextRun.min': 60,
                    'defaults.nextRun.max': 60,
                    'defaults.sleepMode': false,
                    'defaults.sleepMode.min': "00:00",
                    'defaults.sleepMode.max': "01:00",
                    'cf.tryGetCodes': false,
                    'cf.usePromoCodes': true,
                    'cf.rollOnce': false,
                    'cf.autologin': false,
                    'cf.credentials.mode': 1,
                    'cf.credentials.email': 'YOUR@EMAIL.com',
                    'cf.credentials.password': 'YOURPASSWORD',
                    'cf.sleepHoursIfIpBan': 8,
                    'fp.maxTimeInMinutes': 15,
                    'fp.randomPtcOrder': true,
                    'dutchy.useBoosted': false,
                    'bk.withdrawMode': "0",
                    'bk.hoursBetweenWithdraws': 4,
                    'bk.sleepMinutesIfIpBan': 75,
                    'bestchange.address': '101',
                    'ui.runtime': 0,
                    // 'fpb.credentials.mode': 2,
                    // 'fpb.credentials.username': 'YOUR_USERNAME',
                    // 'fpb.credentials.password': 'YOURPASSWORD',
                    'bigbtc.postponeMinutes': '0',
                    // 'fbch.credentials.mode': 2,
                    // 'fbch.credentials.username': 'YOUR_USERNAME',
                    // 'fbch.credentials.password': 'YOURPASSWORD',
                    'jtfey.credentials.mode': 2,
                    'jtfey.credentials.username': 'YOUR_USERNAME',
                    'jtfey.credentials.password': 'YOURPASSWORD',
                    // 'shost.credentials.mode': 2,
                    // 'shost.credentials.username': 'YOUR_USERNAME',
                    // 'shost.credentials.password': 'YOURPASSWORD',
                    'ycoin.credentials.mode': 2,
                    'ycoin.credentials.username': 'YOUR_ACCOUNT_NUMBER',
                    'ycoin.credentials.password': 'YOURPASSWORD',
                    'bkclass.coin': 'LTC',
                    'bkclass.bcoin': 'LTC',
                    // 'bscads.credentials.mode': 2,
                    // 'bscads.credentials.username': 'YOUR_USERNAME',
                    // 'bscads.credentials.password': 'YOURPASSWORD',
                    'migrations': [
                        {version: '00200799', applied: false} // migration to change pcodes status from error to usable due to ui changes
                    ]
                    // config['fb.activateRPBonus'] = true;
                    // config['fp.hoursBetweenRuns'] = 6;
                };
                
                let storedData = persistence.load('config', true);
                if(storedData) {
                    for (const prop in config) {
                        if(storedData.hasOwnProperty(prop)) {
                            config[prop] = storedData[prop];
                        }
                    }
                }

                config.version = GM_info.script.version;
            };
            function getConfig() {
                return config;
            };
            function updateConfig(items) {
                items.forEach( function (item) {
                    config[item.prop] = item.value;
                });
                persistence.save('config', config, true);
            };
            function migrationApplied(migrationVersion) {
                try {
                    let mig = config.migrations.find(x => x.version == migrationVersion);
                    mig.applied = true;
                    persistence.save('config', config, true);
                } catch (err) {
                    console.warn('Error saving migration as applied');
                    console.error(err);
                }
            };
            function devlog(msg, elapsed = false, reset = false) {
                if(!config['devlog.enabled']) {
                    return;
                }

                let log;
                if(reset) {
                    log = [`${helpers.getPrintableTime()}|Log cleared`];
                } else {
                    log = persistence.load('devlog', true);
                    log = log ?? [];
                }

                if(msg) {
                    msg = scheduleUuid ? `[${scheduleUuid}] ${msg}` : msg;
                    let previous;
                    try {
                        previous = log[log.length - 1].split('|')[1];
                    } catch {}
                    if(elapsed && (previous == msg)) {
                        log[log.length - 1] = `${helpers.getPrintableTime()}|${msg}|[Elapsed time: ${elapsed} seconds]`;
                    } else {
                        log.push(`${helpers.getPrintableTime()}|${msg}`);
                    }
                }

                if(log.length > 200) {
                    log.splice(0, log.length - 200);
                }

                persistence.save('devlog', log, true);
            };
            function getDevLog() {
                let log;
                log = persistence.load('devlog', true);
                if(log) {
                    return log;
                }
            };

            function getRunningSites() {
                let ret = [];
                loadFlowControl();
                console.log('@getRunningSites');
                console.log(runningSites);
                if(!runningSites || runningSites == {}) {
                    return ret;
                }
                for (const sch in runningSites) {
                    if (runningSites[sch].host) {
                        ret.push(runningSites[sch].host);
                    }
                }
                return ret;
            }

            let runningSites = {}
            let scheduleUuid = null;
            function isOpenedByManager() {
                loadFlowControl();
                if(!runningSites || runningSites == {}) {
                    return false;
                }
                console.log('Running sites', runningSites);
                let uuid = null;
                for (const sch in runningSites) {
                    if ( (runningSites[sch].host && runningSites[sch].host == window.location.host) ||
                         (runningSites[sch].params && runningSites[sch].params.trackUrl && window.location.href.includes(runningSites[sch].params.trackUrl))
                       ) {
                        uuid = sch;
                        break;
                    }
                }
                if (!uuid) {
                    return false;
                }

                if (runningSites[uuid].runStatus == 'COMPLETED') {
                    return false;
                } else {
                    scheduleUuid = uuid;
                    return true;
                }
                // if (runningSites[uuid].type == K.WebType.CBG) {
                //     if (window.location.href.includes(runningSites[uuid].url) || window.location.href.includes(runningSites[uuid].host)) {
                //         shared.devlog(`Visit [CBG] returning true`);
                //         scheduleUuid = uuid;
                //         return true;
                //     } else {
                //         shared.devlog(`Visit [CBG] returning false`);
                //         return false;
                //     }
                // } else if (runningSites[uuid].host != window.location.host) {
                //     return false;
                // }
                // if(runningSites[uuid].opened && runningSites[uuid].type != K.WebType.FAUCETPAY) {
                //     return false;
                // }
                // scheduleUuid = uuid;
                // return true;
            // shared.devlog(`Visit to: ${flowControl.url}`);
            };
            function loadFlowControl() {
                runningSites = persistence.load('runningSites', true) || {};
            };
            function setFlowControl(schedule, id, url, webType, params = null) {
                console.log(`@setFlowControl (id=${id}, url=${url})`);
                console.log(runningSites);
                runningSites[schedule] = {
                    id: id,
                    changedAt: Date.now(),
                    url: url,
                    host: url.host,
                    type: webType,
                    opened: false,
                    error: false,
                    result: {}
                };

                if(params) {
                    runningSites[schedule].params = params;
                } else {
                    runningSites[schedule].params = {};
                }
                console.log(runningSites);
                saveFlowControl(schedule);
            };
            function isCompleted(expectedId) {
                // console.log(`@isCompleted with expectedId=${expectedId}`);
                loadFlowControl();
                for(const sch in runningSites) {
                    if (runningSites[sch].id == expectedId) {
                        if (runningSites[sch].runStatus == 'COMPLETED') {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
                return false;
            };
            function isIncompleted(expectedId) {
                // console.log(`@isIncompleted with expectedId=${expectedId}`);
                loadFlowControl();
                for(const sch in runningSites) {
                    if (runningSites[sch].id == expectedId) {
                        if (runningSites[sch].runStatus == 'WORKING') {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
                return false;
            };
            function hasErrors(expectedId) {
                for(const sch in runningSites) {
                    if (runningSites[sch].id == expectedId && runningSites[sch].error) {
                        return true;
                    }
                }
                return false;
            };
            function getResult(schedule) {
                if (schedule) {
                    // console.log(`@getResult. schedule=${schedule}`);
                    console.log({theSiteResult:runningSites[schedule].result});
                    console.log({runningSites:runningSites});
                    return runningSites.hasOwnProperty(schedule) ? runningSites[schedule].result : {};
                }
                return runningSites.hasOwnProperty(scheduleUuid) ? runningSites[scheduleUuid].result : {};
            };
            function getCurrent(schedule) {
                if (schedule) {
                    return runningSites.hasOwnProperty(schedule) ? runningSites[schedule] : {};
                }
                return runningSites.hasOwnProperty(scheduleUuid) ? runningSites[scheduleUuid] : {};
            };
            function saveAndclose(runDetails, delay = 0) {
                markAsVisited(runDetails);
                shared.devlog(`${window.location.href} closing`);
                if(delay) {
                    setTimeout(window.close, delay);
                } else {
                    setTimeout(window.close, 1000);
                }
            };
            function purgeFlowControlSchedules(validSchedules) {
                loadFlowControl();
                let deletables = [];
                for (var sch in runningSites) {
                    if (!validSchedules.includes(sch)) {
                        deletables.push(sch);
                    }
                }
                deletables.forEach(x => {
                    delete runningSites[sch];
                });
                persistence.save('runningSites', runningSites, true);
            };
            function saveFlowControl(schedule) {
                schedule = schedule ? schedule : scheduleUuid;
                console.log(`@saveFlowControl (schedule=${schedule})`);
                if (!schedule) {
                    shared.devlog(`Saving from runningSites`);
                    console.log({runningSites: runningSites});
                    persistence.save('runningSites', runningSites, true);
                    return;
                }
                let tempFlow = persistence.load('runningSites', true);
                tempFlow[schedule] = runningSites[schedule];
                shared.devlog(`Saving from tempFlow`);
                console.log({runningSites: runningSites});
                console.log({tempFlow: tempFlow});
                persistence.save('runningSites', tempFlow, true);
            };
            function markAsVisited(runDetails, runStatus = 'COMPLETED') {
                shared.devlog(`@markAsVisited. runStatus=${runStatus}, scheduleUuid=${scheduleUuid}`);
                if (!scheduleUuid) {
                    shared.devlog(`ERROR @markAsVisited: no scheduleUuid to reference`);
                    return;
                }
                runningSites[scheduleUuid].opened = true;
                runningSites[scheduleUuid].runStatus = runStatus;
                runningSites[scheduleUuid].result = runDetails ? runDetails : runningSites[scheduleUuid].result;

                saveFlowControl(scheduleUuid);
            };
            function addError(errorType, errorMessage, schedule) {
                if (schedule) {
                    runningSites[schedule].error = true;
                    runningSites[schedule].result.errorType = errorType;
                    runningSites[schedule].result.errorMessage = errorMessage;
                } else {
                    runningSites[scheduleUuid].error = true;
                    runningSites[scheduleUuid].result.errorType = errorType;
                    runningSites[scheduleUuid].result.errorMessage = errorMessage;
                }

                saveFlowControl(schedule ? schedule : scheduleUuid);
            };
            function closeWithError(errorType, errorMessage) {
                addError(errorType, errorMessage);
                window.close();
                setInterval(() => {
                    window.close();
                }, 15000);
            };
            function clearFlowControl(schedule) {
                shared.devlog(`[${schedule}] clearFlowControl for ${schedule}`);
                if (schedule && schedule != 'all') {
                    runningSites[schedule] = {};
                    saveFlowControl(schedule);
                } else if (schedule == 'all') {
                    runningSites = {};
                    persistence.save('runningSites', {}, true);
                }
            };
            function clearRetries() {
                loadFlowControl();
                runningSites[scheduleUuid].retrying = false;
                saveFlowControl(scheduleUuid);
                return false;
            };
            function isRetrying() {
                if(runningSites[scheduleUuid].retrying) {
                    return true;
                }
                runningSites[scheduleUuid].retrying = true;
                saveFlowControl(scheduleUuid);
                return false;
            };
            function setProp(key, val) {
                shared.devlog(`@setProp, key => ${key}, val => ${val}`);
                runningSites[scheduleUuid][key] = val;
                saveFlowControl(scheduleUuid);
            };
            function getProp(key) {
                shared.devlog(`@getProp, key => ${key}`);
                return runningSites[scheduleUuid][key];
            };
            function getParam(key) {
                shared.devlog(`@getParam, key => ${key}`);
                try {
                    shared.devlog(`@getParam, returning: ${runningSites[scheduleUuid].params[key]}`);
                } catch {}
                return runningSites[scheduleUuid].params[key];
            };
            initializeConfig();
            return {
                devlog: devlog,
                getDevLog: getDevLog,
                setFlowControl: setFlowControl,
                isCompleted: isCompleted,
                isIncompleted: isIncompleted,
                isOpenedByManager: isOpenedByManager,
                saveFlowControl: saveFlowControl,
                getCurrent: getCurrent,
                getResult: getResult,
                addError: addError,
                closeWindow: saveAndclose,
                closeWithError: closeWithError,
                updateWithoutClosing: markAsVisited,
                hasErrors: hasErrors,
                clearFlowControl: clearFlowControl,
                getConfig: getConfig,
                updateConfig: updateConfig,
                clearRetries: clearRetries,
                isRetrying: isRetrying,
                setProp: setProp,
                getProp: getProp,
                getParam: getParam,
                migrationApplied: migrationApplied,
                purgeFlowControlSchedules: purgeFlowControlSchedules,
                getRunningSites: getRunningSites
            };
        },
        createCFPromotions: function() {
            let codes = [];

            function PromotionCode(id, code, repeatDaily = false, expiration = null, isRemoved = false) {
                this.id = id;
                this.code = code;
                this.added = new Date();
                this.statusPerFaucet = [];
                this.repeatDaily = repeatDaily;
                this.lastExecTimeStamp = null;
                this['expiration' + 'Date'] = expiration;
                this.isRemoved = isRemoved;
            };

            function getFaucetStatusInPromo(promo, faucetId) {
                let faucet = promo.statusPerFaucet.find(x => x.id == faucetId);
                if (faucet.status && promo.repeatDaily) {
                    //Using 26 hs instead of 24hs, and 2hs gap retry when code is flagged as USEDBEFORE
                    if((faucet.status == K.CF.PromoStatus.ACCEPTED && (Date.now() - faucet.execTimeStamp.getTime()) > K.Integers.HS_26_IN_MILLISECONDS)
                       || (faucet.status == K.CF.PromoStatus.USEDBEFORE && (Date.now() - faucet.execTimeStamp.getTime()) > K.Integers.HS_2_IN_MILLISECONDS)) {
                        faucet.status = K.CF.PromoStatus.PENDING;
                    }
                }
                return faucet.status ?? K.CF.PromoStatus.NOCODE;
            };

            function addNew(code, repeatDaily = false, expiration = null) {
                let found = codes.find(x => x.code == code);
                if (found) {
                    found.repeatDaily = repeatDaily;
                    found['expiration' + 'Date'] = expiration;
                    found.isRemoved = false;
                } else {
                    found = new PromotionCode(codes.length, code, repeatDaily, expiration);
                    codes.push(found);
                }

                found.statusPerFaucet = manager.getFaucetsForPromotion().map(x => {
                    return {
                        id: x.id,
                    };});
                found.statusPerFaucet.forEach(function (element, idx, arr) {
                    arr[idx].status = K.CF.PromoStatus.PENDING;
                    arr[idx].execTimeStamp = null;
                });

                // codes.push(newPromo);
                //codes.sort((a, b) => (a.id < b.id) ? 1 : -1);
                save();
            };

            function includeNewCodes(newCodes) {
                for(let i=0; i<newCodes.length; i++) {
                    let item = newCodes[i];
                    // let exists = codes.find(x => x.code.toLowerCase() == item.code.toLowerCase() && x.code['expiration' + 'Date'] != item['expiration' + 'Date']);
                    let exists = codes.find(x => x.code.toLowerCase() == item.code.toLowerCase());
                    if (!exists) {
                        // console.log(`${item.code} does not exist`);
                        addNew(item.code, !item.oneTimeOnly, item['expiration' + 'Date']);
                    } else {
                        // console.log(`${item.code} exists`);
                        // TODO: need to change status per faucet
                        // exists['expiration' + 'Date'] == item['expiration' + 'Date'];
                    }
                }
            };

            function getAll() {
                // now is all with isremoved=false
                return codes.filter(x => !x.isRemoved);
            };

            function updateFaucetForCode(code, faucetId, newStatus) {
                let promo = codes.find(x => x.code == code);
                let faucet = promo.statusPerFaucet.find(x => x.id == faucetId);
                if(faucet) {
                    faucet.status = newStatus;
                    faucet.execTimeStamp = new Date();
                    promo.lastExecTimeStamp = faucet.execTimeStamp;
                }
                save();
            };

            function hasPromoAvailable(faucetId) {
                let resp = [];
                codes.forEach(function (promotion, idx, arr) {
                    let status = getFaucetStatusInPromo(promotion, faucetId);
                    if (status == K.CF.PromoStatus.PENDING && !promotion.isRemoved) {
                        resp.push(promotion.code);
                    }
                });
                if (resp.length > 0) {
                return resp;
                } else {
                    return false;
                }
            };

            function save() {
                persistence.save('CFPromotions', codes, true);
            };

            function load(data) {
                codes = data;
                // console.log({codes,});
                save();
            };

            function removeAll() {
                codes.forEach(x => x.isRemoved = true);
                codes = codes.filter(x => x['expiration' + 'Date'] && Date.parse(x['expiration' + 'Date']) > Date.now());
                save();
            };

            function remove(id, code) {
                let idx = codes.findIndex(x => x.id == id && x.code == code);
                if(idx != -1) {
                    codes[idx].isRemoved = true;
                    // codes.splice(idx, 1);
                    save();
                }

                return idx;
            };

            return {
                addNew: addNew,
                removeAll: removeAll,
                remove: remove,
                getAll: getAll,
                load: load,
                updateFaucetForCode: updateFaucetForCode,
                hasPromoAvailable: hasPromoAvailable,
                includeNewCodes: includeNewCodes
            }
        },
        createInteractions: function(){
            let randomInteractionLevel = K.RandomInteractionLevel.MEDIUM;
            let maxActions = 0;
            let performedActions = -1;
            let selectableElements;
            let actions = {
                available: [
                    // function() {
                    //     $('html, body').animate({
                    //         scrollTop: helpers.randomInt(0, $('html, body').get(0).scrollHeight)
                    //     }, {
                    //         complete: setTimeout(interactions.addPerformed, helpers.randomMs(100, 3000)),
                    //         duration: helpers.randomMs(100, 1500)
                    //     });
                    // },
                    function() {
                        let element = interactions.selectableElements[helpers.randomInt(0, interactions.selectableElements.length - 1)];

                        try {
                            if (document.body.createTextRange) {
                                const range = document.body.createTextRange();
                                range.moveToElementText(element);
                                range.select();
                            } else if (window.getSelection) {
                                const selection = window.getSelection();
                                const range = document.createRange();
                                range.selectNodeContents(element);
                                selection.removeAllRanges();
                                selection.addRange(range);
                            }
                        } catch (err) { }

                        interactions.addPerformed();
                    }
                ]
            };

            function start(selectableElements) {
                performedActions = 0;
                switch(randomInteractionLevel) {
                    case K.RandomInteractionLevel.NONE:
                        maxActions = 0;
                        break;
                    case K.RandomInteractionLevel.LOW:
                        maxActions = helpers.randomInt(2, 4);
                        break;
                    case K.RandomInteractionLevel.MEDIUM:
                        maxActions = helpers.randomInt(5, 8);
                        break;
                    case K.RandomInteractionLevel.HIGH:
                        maxActions = helpers.randomInt(12, 16);
                        break;
                }
                interactions.selectableElements = selectableElements;
                performActions();
            }

            function performActions() {
                if(performedActions >= maxActions) {
                    return;
                }
                let delay = 0;
                for(let i = 0; i < maxActions; i++) {
                    delay += helpers.randomMs(350, 1500);
                    setTimeout(actions.available[helpers.randomInt(0, actions.available.length - 1)], delay);
                }
            }

            function addPerformed() {
                performedActions++;
            }
            function completed() {
                return (performedActions >= maxActions);
            }

            return {
                start: start,
                completed: completed,
                addPerformed: addPerformed,
                selectableElements: selectableElements
            };
        },
        createCFProcessor: function() {
            const NavigationProcess = {
                ROLLING: 1,
                PROCESSING_PROMOTION: 2,
                LOGIN: 3
            };
            let navigationProcess;
            let countdown;
            let rollButton;
            let promotionTag;
            let timeWaiting= 0;
            let loopingForErrors = false;
            let tempRollNumber = null;
            let firstRollCompleted = false;

            function init() {
                let urlType = helpers.cf.getUrlType(window.location.href);
                console.log('URL TYPE:', urlType)
                switch(urlType) {
                    case K.CF.UrlType.FREE:
                        if(localeConfig.setToEnglish) {
                            document.querySelector('.locale-changer .p-dropdown-trigger')?.click();
                            setTimeout(() => {
                                document.querySelector("#pv_id_3_3")?.click();
                            }, 1000);
                            // let refValue = document.querySelectorAll('.nav-item a')[4].innerHTML;
                            // if (refValue != 'Settings') {
                            //     window.location.href = '/set-language/en';
                            // }
                        }
                        addJS_Node (null, null, overrideSelectNativeJS_Functions);
                        interactions = objectGenerator.createInteractions();
                        run();
                        break;

                    case K.CF.UrlType.PROMOTION:
                        interactions = objectGenerator.createInteractions();
                        runPromotion();
                        break;

                    case K.CF.UrlType.HOME:
                    case K.CF.UrlType.LOGIN:
                            if (shared.getConfig()['cf.autologin']) {
                            addJS_Node (null, null, overrideSelectNativeJS_Functions);
                            doLogin();
                        } else {
                            shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
                        }
                        break;

                    case K.CF.UrlType.CONTACTTWITTER:
                        shared.closeWithError(K.ErrorType.IP_BAN, '');
                        break;
                    default:
                        break;
                }
                return;
            }

            function run() {
                console.log('@run');
                navigationProcess = NavigationProcess.ROLLING;
                // To close without rolling: if (maxRollsPerVisit == 0) shared.closeWindow({});
                // displayStatusUi();
                setInterval(tryClosePopup, helpers.randomMs(3000, 6000));
                setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
            };

            function doLogin() {
                console.log('@doLogin');
                navigationProcess = NavigationProcess.LOGIN;
                // displayStatusUi();

                setTimeout(findLoginForm, helpers.randomMs(2000, 5000));
            };

            function isFullyLoaded() { //Waits 55 seconds max
                if(document.readyState == 'complete' || timeWaiting == -1) {
                    // document.getElementById('process-status').innerHTML = 'Interacting';
                    timeWaiting = 0;
                    if (firstRollCompleted) {
                        roll();
                    } else {
                        interact();
                    }
                } else {
                    timeWaiting = -1;
                    // document.getElementById('process-status').innerHTML = 'Waiting for document fully loaded';
                    setTimeout(isFullyLoaded, helpers.randomMs(15000, 25000));
                }
            };
            function runPromotion() {
                navigationProcess = NavigationProcess.PROCESSING_PROMOTION
                // displayStatusUi();
                setTimeout(findPromotionTag, helpers.randomMs(1000, 3000));
            };
            function tryClosePopup() {
                let popupBtn = document.querySelector('.p-dialog .p-dialog-header-close');
                if (popupBtn && popupBtn.isVisible()) {
                    console.log(`Closing popup`);
                    popupBtn.click();
                }
            };
            function isRollResultVisible() {
                let rollDiv = document.querySelector('.result');
                if (rollDiv && rollDiv.isVisible() && rollDiv.innerText != '') {
                }
            };
            let waitRollNumberCount = 0;
            function closeToast() {
                document.querySelector('.p-toast-icon-close')?.click();
            }
            async function waitForRollNumber() {
                console.log('Waiting for rolled number');
                shared.devlog(`Waiting for rolled number`);
                let newNumber = -1;
                try { // intento leer el rolled number
                    newNumber = [...document.querySelectorAll('.lucky-number-wrapper img')].map(x => x.src.split('/').slice(-1)[0].split('.').slice(-3)[0]).join('');
                    // newNumber = [...document.querySelectorAll('.lucky-number')].map(x => x.innerText).join('');
                    newNumber = parseInt(newNumber)
                    console.log(`Roll #: ${newNumber}`);
                } catch(err) {
                    console.log(`Roll #: error reading it`);
                    newNumber = null;
                }
                if (newNumber === null) { // si no logro leerlo, bajo 1 en tempRollNumber
                    console.log(`Roll # is null`);
                    if (tempRollNumber < 0) {
                        tempRollNumber -= 1;
                    } else {
                        tempRollNumber = -1;
                    }
                    console.log(`Temp Roll Reads: ${tempRollNumber}`);
                    if (tempRollNumber < -5) {
                        // something might be wrong, it's taking too much time. Closing
                        processRunDetails();
                        return;
                    } else {
                        // let's keep waiting
                        await wait(3000);
                        return waitForRollNumber();
                    }
                }

                // tengo un numero. comparo con el guardado
                if (newNumber == tempRollNumber) {
                    timeWaiting = 0;
                    if (shared.getConfig()['cf.rollOnce']) {
                        processRunDetails();
                        return;
                    } else {
                        firstRollCompleted = true;
                        closeToast();
                        setTimeout(findCountdownOrRollButton, helpers.randomMs(1000, 2000));
                        return;
                    }
                } else {
                    waitRollNumberCount++;
                    if (waitRollNumberCount > 15) {
                        console.log(`Waited too much for the rolls to stop. Forcing refresh}`);
                        setTimeout(() => { location.reload(); }, 5000);
                        return;
                    }

                    // not the same number. save new one and keep waiting
                    tempRollNumber = newNumber;
                    await wait(3000);
                    return waitForRollNumber();
                }

            };
            function isLoggedIn() {
                return !!document.querySelector('.pi-user');
            }

            function findCountdownOrRollButton() {
                if (!isLoggedIn()) {
                    location.reload();
                }
                console.log(`findCountdownOrRollButton`);
                if( isCountdownVisible() && !isRollButtonVisible() ) {
                    timeWaiting = 0;
                    processRunDetails();
                } else if ( !isCountdownVisible() && isRollButtonVisible() ) {
                    timeWaiting = 0;
                    setTimeout(isFullyLoaded, helpers.randomMs(1000, 5000));
                } else if ( isCountdownVisible() && isRollButtonVisible() ) {
                    // if countdown 0/-1, try to roll
                    try {
                        let minLeft = document.querySelector('.minutes .digits').innerText;
                        if (minLeft < 1) {
                            timeWaiting = 0;
                            setTimeout(isFullyLoaded, helpers.randomMs(1000, 5000));
                        }
                    } catch (err) { console.log(`Error on alt logic of CF roll: ${err}`); }
                } else {
                    if (timeWaiting/1000 > shared.getConfig()['defaults.timeout'] * 60) {
                        shared.closeWithError(K.ErrorType.TIMEOUT, '');
                        return;
                    }

                    timeWaiting += 3000;
                    setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
                }
            };
            function addUrlChangeListener() {
                if (window.onurlchange === null) {
                    window.addEventListener('urlchange', (data) => {
                        if (navigationProcess == NavigationProcess.LOGIN && !window.location.href.includes('/login')) {
                            loopingForErrors = false;
                            init();
                        }
                    });
                }    
            };
            function findLoginForm() {
                console.log('@findLoginForm');
                // if ( document.querySelector('div.login-wrapper').isVisible() ) {
                if ( document.querySelector('#email')?.isVisible() && document.querySelector('#password')?.isVisible() ) {
                    addUrlChangeListener();
                    //Other possible error is if recaptcha did not load yet... so maybe wait til the web is fully loaded for low connection issues
                    let errElement = document.querySelector('.login-wrapper .error');
                    if( errElement && errElement.innerHTML != '') {
                        let errorMessage = errElement.innerText;
                        shared.closeWithError(K.ErrorType.LOGIN_ERROR, errorMessage);
                        return;
                    }
                    if(!loopingForErrors) {
                        if(shared.getConfig()['cf.credentials.mode'] == 1) {
                            timeWaiting = 0;
                            helpers.typer(document.querySelector('.login-wrapper input[name="email"],#email'), shared.getConfig()['cf.credentials.email']);
                            helpers.typer(document.querySelector('.login-wrapper input[name="password"],#password'), shared.getConfig()['cf.credentials.password']);
                            // document.querySelector('.login-wrapper input[name="email"],#email').value = shared.getConfig()['cf.credentials.email'];
                            // document.querySelector('.login-wrapper input[name="password"],#password').value = shared.getConfig()['cf.credentials.password'];
                            // document.querySelector('.login-wrapper button.login').click();
                            document.querySelector('#password')?.closest('div')?.querySelector('button')?.click();
                            loopingForErrors = true;
                        } else {
                            if(document.querySelector('.login-wrapper input[name="email"],#email').value != '' && document.querySelector('.login-wrapper input[name="password"],#password').value != '') {
                                document.querySelector('#password')?.closest('div')?.querySelector('button')?.click();
                                // document.getElementById('process-status').innerHTML = 'Processing';
                                loopingForErrors = true;
                            } else {
                                // document.getElementById('process-status').innerHTML = 'Waiting for credentials...';
                                if (timeWaiting/1000 > (shared.getConfig()['defaults.timeout'] / 1.5) * 60) {
                                    shared.closeWithError(K.ErrorType.LOGIN_ERROR, 'No credentials were provided');
                                    return;
                                }
                            }
                        }
                    }
                }

                if (timeWaiting/1000 > shared.getConfig()['defaults.timeout'] * 60) {
                    shared.closeWithError(K.ErrorType.TIMEOUT, '');
                    return;
                }

                timeWaiting += 3000;
                setTimeout(findLoginForm, helpers.randomMs(2000, 5000));
            };
            function interact() {
                let selectables = [].concat([...document.querySelectorAll('td')], [...document.querySelectorAll('p')], [...document.querySelectorAll('th')]);

                interactions.start(selectables);
                setTimeout(waitInteractions, helpers.randomMs(2000, 4000));
            }
            function waitInteractions() {
                if(interactions.completed()) {
                    roll();
                } else {
                    setTimeout(waitInteractions, helpers.randomMs(2000, 4000));
                }
            }
            function isCountdownVisible() {
                countdown = document.querySelectorAll('.minutes .digits');
                // countdown = document.querySelectorAll('.timeout-wrapper');
                return (countdown.length > 0 && countdown[0].isVisible());
            };
            function isRollButtonVisible() {
                let rollButtonIcon = document.querySelector('.p-button .pi-gift');
                if (!rollButtonIcon) {
                    return false;
                }
                rollButton = rollButtonIcon.closest('button');
                return rollButton && !rollButton.disabled && rollButton.isVisible();
                // rollButton = document.querySelectorAll('.main-button-2.roll-button.bg-2');
                // return (rollButton.length > 0 && rollButton[0].isVisible());
            };
            function roll() {
                // document.getElementById('process-status').innerHTML = 'Roll triggered';
                rollButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
                rollButton.click();
                tempRollNumber = -1;
                setTimeout(waitForRollNumber, helpers.randomMs(4000, 7000));
            }
            function isPromotionTagVisible() {
                let pTag;
                try {
                    pTag = document.querySelectorAll('.p-message-text.p-message-text')[0];
                } catch(err) {
                    return false;
                }
                if (pTag) {
                    promotionTag = pTag;
                    return true;
                }
                return false;
            };
            // function hasToWaitForPromotionCaptcha() {
            //     let captchaTag = document.querySelector('#instructions');
            //     if (captchaTag && captchaTag.innerText.toLowerCase().includes('complete the captcha')) {
            //         return true;
            //     }
            //     return false;
            // };
            function findPromotionTag() {
                // if (hasToWaitForPromotionCaptcha()) {
                //     setTimeout(findPromotionTag, helpers.randomMs(2000, 5000));
                //     return;
                // }
                if( isPromotionTagVisible() ) {
                    processRunDetails();
                } else {
                    setTimeout(findPromotionTag, helpers.randomMs(2000, 5000));
                }
            };
            function processRunDetails() {
                let result = {};
                if(navigationProcess == NavigationProcess.ROLLING) {
                    result.claimed = readClaimed();
                    result.balance = readBalance();
                    if(result.claimed != 0) {
                        result.rolledNumber = readRolledNumber();
                    }
                    // To adjust nextRoll if it failed to load before reading it:
                    let minOneHour = result.rolledNumber && result.rolledNumber != 0;
                    result.nextRoll = readCountdown(minOneHour);
                    result.balance = readBalance();
                } else if (navigationProcess == NavigationProcess.PROCESSING_PROMOTION) {
                    result = shared.getResult() || {};
                    if (!result.promoCodeResults) {
                        result.promoCodeResults = [];
                    }
                    let pc = {
                        promoCode: readPromoCode(),
                        promoStatus: readPromoStatus()
                    };

                    result.promoCodeResults.push(pc);
                    // if (result.promoStatus == K.CF.PromoStatus.ACCEPTED) {
                    //     result.nextRoll = (new Date(59000)).getTime();
                    // }
                    shared.updateWithoutClosing(result, 'WORKING');
                    setTimeout(gotoNextPromoCode, helpers.randomMs(1000, 2500));
                    return;
                }
                shared.closeWindow(result);
            };
            function gotoNextPromoCode() {
                let codes = shared.getCurrent().params.promoCodes;
                if (!codes) {
                    shared.closeWindow();
                    return;
                }
                let pc = readPromoCode();
                let pcIdx = codes.findIndex(x => x == pc);
                if (pcIdx == -1 || pcIdx == codes.length - 1) {
                    shared.closeWindow();
                    return;
                }
                window.location.href = '/promotion/' + codes[pcIdx + 1];
            };
            function readCountdown(minOneHour = false) {
                // let minsElement = document.querySelector('.timeout-container .minutes .digits');
                let minsElement = document.querySelector('.minutes .digits');
                let mins = "0";
                if (minsElement) {
                    mins = minsElement.innerHTML;
                }
                if (mins) {
                    let estimated = helpers.addMinutes(+mins + 1);
                    let oneHour = Date.now() + (60*60*1000);
                    if (minOneHour && (oneHour > estimated) ) {
                        return oneHour;
                    }
                    return estimated;
                } else {
                    return null;
                }
            };
            function readClaimed() {
                let claimed = 0;
                try {
                    // claimed = document.querySelector('.result').innerHTML;
                    claimed = document.querySelector('.p-toast-message-text .p-toast-detail').innerHTML;
                    claimed = claimed.trim();
                    claimed = claimed.split(' ').slice(-2)[0]
                    // claimed = claimed.slice(claimed.lastIndexOf(" "));
                } catch(err) { }
                return claimed;
            };
            function readRolledNumber() {
                let number = 0;
                try {
                    // number = [...document.querySelectorAll('.lucky-number')].map(x => x.innerText).join('');
                    number = [...document.querySelectorAll('.lucky-number-wrapper img')].map(x => x.src.split('/').slice(-1)[0].split('.').slice(-3)[0]).join('');
                    number = parseInt(number);
                } catch(err) { }
                return number;
            };
            function readBalance() {
                let balance = "";
                try {
                    // balance = document.querySelector('.navbar-coins.bg-1 a').innerText;
                    balance = document.querySelectorAll('header div div div > span')[0].innerText.trim().split(' ')[0];
                } catch(err) { }
                return balance;
            };
            function readPromoStatus() {
                let promoStatus = K.CF.PromoStatus.UNKNOWNERROR;
                try {
                    if(promotionTag.innerHTML.indexOf(localeConfig.stringSearches.promoCodeAccepted) > 0) {
                        return K.CF.PromoStatus.ACCEPTED;
                    } else if(promotionTag.innerHTML.indexOf(localeConfig.stringSearches.promoCodeUsed) > 0) {
                        return K.CF.PromoStatus.USEDBEFORE;
                    } else if(promotionTag.innerHTML.indexOf(localeConfig.stringSearches.promoCodeExpired) > 0) {
                        return K.CF.PromoStatus.EXPIRED;
                    } else if(localeConfig.stringSearches.promoCodeInvalid.findIndex(x => promotionTag.innerHTML.indexOf(x) > -1) == -1) {
                        return K.CF.PromoStatus.INVALID;
                    }
                } catch ( err ) { }
                return promoStatus;
            };
            function validatePromoString() {

            };
            function readPromoCode() {
                var urlSplit = window.location.href.split('/');
                return urlSplit[urlSplit.length - 1];
            };
            function displayStatusUi() {
                let wrapper = document.createElement('div');
                wrapper.innerHTML = '<div class="withdraw-button bg-2" style="top:30%; z-index:1500;" href="#">⚙️ <span id="process-status">Processing</span></div>';
                document.querySelector( 'body' ).prepend( wrapper.firstChild );
            };
            return {
                init: init
            };
        },
        createCFHistory: function() {
            let rollsMeta = [
                { id: 0, range: '0000-9885', count: 0 },
                { id: 1, range: '9886-9985', count: 0 },
                { id: 2, range: '9986-9993', count: 0 },
                { id: 3, range: '9994-9997', count: 0 },
                { id: 4, range: '9998-9999', count: 0 },
                { id: 5, range: '10000', count: 0 }
            ];

            function initOrLoad() {
                let storedData = persistence.load('CFHistory', true);
                if(storedData) {
                    rollsMeta = storedData;
                }
            };

            function addRoll(number) {
                switch(true) {
                    case (number <= 9885):
                        rollsMeta[0].count++;
                        break;
                    case (number <= 9985):
                        rollsMeta[1].count++;
                        break;
                    case (number <= 9993):
                        rollsMeta[2].count++;
                        break;
                    case (number <= 9997):
                        rollsMeta[3].count++;
                        break;
                    case (number <= 9999):
                        rollsMeta[4].count++;
                        break;
                    case (number == 10000):
                        rollsMeta[5].count++;
                        break;
                    default:
                        break;
                }
                save();
            };

            function getRollsMeta() {
                return rollsMeta.map(x => x.count);
            };

            function save() {
                persistence.save('CFHistory', rollsMeta, true);
            };

            return {
                initOrLoad: initOrLoad,
                addRoll: addRoll,
                getRollsMeta: getRollsMeta
            }
        },
    };

    function overrideSelectNativeJS_Functions () {
        window.alert = function alert (message) {
            console.log (message);
        }
    }
    function addJS_Node (text, s_URL, funcToRun) {
        var scriptNode= document.createElement ('script');
        scriptNode.type= "text/javascript";
        if (text)scriptNode.textContent= text;
        if (s_URL)scriptNode.src= s_URL;
        if (funcToRun)scriptNode.textContent = '(' + funcToRun.toString() + ')()';
        var element = document.getElementsByTagName ('head')[0] || document.body || document.documentElement;
        element.appendChild (scriptNode);
    }
    function addHtml(data) { // data = { target: '', where: '', content: '' }
        document.querySelector(data.target).insertAdjacentHTML(data.where, data.content);
    }
    function addTemplateTag(data) {
        let templateTag = document.createElement('template');
        templateTag.id = data.id;
        templateTag.innerHTML = data.content;
        let container = document.body || document.documentElement;
        container.appendChild(templateTag);
    }
    function useTemplate(data) { // data = { templateId: '', target: '', where: '', replacements: {} }
        let template = document.querySelector(`#${data.templateId}`).innerHTML;
        let content = template.formatUnicorn(data.replacements);
        addHtml({
            target: data.target,
            where: data.where,
            content: content
        });
        // let template = document.querySelector('#tpl-requirement-row').innerHTML;
    }

    function isExpectedPtc() {
        let runningList = shared.getRunningSites();
        let ptcHosts = ['faucetpay.io'];

        for (let i = 0; i < ptcHosts.length; i++) {
            if (document.referrer.includes(`//${ptcHosts[i]}`) && runningList.includes(ptcHosts[i])) {
                // is a ptc and a schedule is running it
                // Triggering waitForClose for the page
                waitForCloseSignal(ptcHosts[i]);
                return true;
            }
        }
        console.log('NOT EXPECTED PTC');
        return false;
    }

    async function waitForCloseSignal(host) {
        await wait(3000);
        console.log(`Waiting for ptc-close-signal-${host}`);
        const signal = GM_getValue(`ptc-close-signal-${host}`) || null;
        if (signal) {
            window.close();
        }
        return waitForCloseSignal(host);
    }

    function detectWeb() {
        console.log('@detectWeb');
        if (isExpectedPtc()) {
            return;
        }
        if(!shared.isOpenedByManager()) {
            console.log('@dismissed');
            shared.devlog(`${window.location.href} dismissed`);
            return;
        }
        instance = K.LOCATION.SITE;
        shared.devlog(`${window.location.href} accepted`);

        let typeFromManager = shared.getCurrent().type;

        siteTimer = new Timer({ isManager: false, delaySeconds: 20, uuid: shared.getProp('schedule'), webType: typeFromManager });
        switch( typeFromManager ) {
            case K.WebType.STORMGAIN:
                SiteProcessor = createSGProcessor();
                setTimeout(SiteProcessor.run, helpers.randomMs(10000, 20000));
                break;
            case K.WebType.CRYPTOSFAUCETS:
                SiteProcessor = objectGenerator.createCFProcessor();
                setTimeout(SiteProcessor.init, helpers.randomMs(1000, 3000));
                break;
            case K.WebType.FREEBITCOIN:
                SiteProcessor = createFBProcessor();
                setTimeout(SiteProcessor.run, helpers.randomMs(2000, 5000));
                break;
            // case K.WebType.FREELITECOIN:
            //     SiteProcessor = new FreeLitecoin();
            //     setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(2000, 5000));
            //     break;
            // case K.WebType.FREEETHEREUMIO:
            //     SiteProcessor = new FreeEthereumIo();
            //     setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(2000, 5000));
            //     break;
            case K.WebType.FAUCETPAY:
                // SiteProcessor = createFPProcessor();
                // setTimeout(SiteProcessor.init, helpers.randomMs(2000, 5000));
                SiteProcessor = new FPPtc();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(2000, 5000));
                break;
            case K.WebType.BIGBTC:
                SiteProcessor = createBigBtcProcessor();
                setTimeout(SiteProcessor.init, helpers.randomMs(2000, 4000));
                break;
            case K.WebType.BESTCHANGE:
                SiteProcessor = createBestChangeProcessor();
                setTimeout(SiteProcessor.init, helpers.randomMs(4000, 6000));
                break;
            // case K.WebType.KINGBIZ:
            //     SiteProcessor = new KingBiz();
            //     setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(2000, 5000));
            //     break;
            // case K.WebType.FREEDOGEIO:
            //     SiteProcessor = new FreeDogeIo();
            //     setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(2000, 5000));
            //     break;
            case K.WebType.BFBOX:
                SiteProcessor = new BFRoll(helpers.getEnumText(K.CMC, shared.getCurrent().params.cmc).toLowerCase());
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(2000, 5000));
                break;
            case K.WebType.DUTCHYROLL:
                SiteProcessor = new DutchyRoll();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(2000, 5000));
                break;
            case K.WebType.FCRYPTO:
                SiteProcessor = new FCryptoRoll();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(2000, 5000));
                break;
            // case K.WebType.CBG:
            //     SiteProcessor = new CBGRoll();
            //     setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
            //     break;
            case K.WebType.FPB:
                SiteProcessor = new FPB(shared.getCurrent().params.sitePrefix);
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            // case K.WebType.G8:
            //     SiteProcessor = new G8();
            //     setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
            //     break;
            case K.WebType.FREEGRC:
                SiteProcessor = new GRCRoll();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            case K.WebType.VIE:
                SiteProcessor = new VieRoll();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            case K.WebType.O24:
                SiteProcessor = new O24Roll();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            case K.WebType.YCOIN:
                SiteProcessor = new YCoin();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            case K.WebType.CDIVERSITY:
                SiteProcessor = new CDiversity();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            // case K.WebType.BSCADS:
            //     SiteProcessor = new BscAds();
            //     setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
            //     break;
            case K.WebType.CTOP:
                SiteProcessor = new CTop();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            case K.WebType.AUTOCML:
                SiteProcessor = new AutoCMl();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            case K.WebType.CCLICKS:
                SiteProcessor = new CClicks();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            default:
                break;
        }
    }

    {{ui/index.js}}

    {{usorted/usorted.js}}

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms || 3000));

    {{crawlers/index.js}}

    let landing, instance, siteTimer;
    let useTimer;

    {{manager/site.js}}
    {{manager/schedule.js}}

    {{manager/legacy.js}}
    {{ui/legacy.js}}

    async function init() {
        // persistence = objectGenerator.createPersistence();
        eventer = new EventEmitter();
        persistence = new Persistence();
        shared = objectGenerator.createShared();
        useTimer = shared.getConfig()['defaults.extraInterval'];
        if (location.href.startsWith('https://criptologico.com/tools/cc')) {
            landing = window.location.host;
            instance = K.LOCATION.MANAGER;
            shared.devlog('Manager Reloaded');
            manager = createManager();
            CFPromotions = objectGenerator.createCFPromotions();
            uiRenderer = new UiRenderer();
            uiRenderer.initialize();
            // ui = objectGenerator.createUi();
            ui = createUi();
            CFHistory = objectGenerator.createCFHistory();

            await manager.start();
            try {
                if (!document.body.classList.contains('sidebar-collapse')) document.querySelector('a[data-widget="pushmenu"]').click()
            } catch {}
            setTimeout( () => { window.stop(); }, 10000);
        } else {
            instance = K.LOCATION.UNKNOWN;
            detectWeb();
        }
    }
    init();
})();
