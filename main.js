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

    const STATUS = {
        INITIALIZING: 0,
        IDLE: 1,
        CLAIMING: 2
    };

    const K = Object.freeze({
        WebType: {
            UNDEFINED: 0,
            CRYPTOSFAUCETS: 1,
            STORMGAIN: 2,
            FREEBITCOIN: 3,
            FAUCETPAY: 4,
            FREELITECOIN: 5,
            FREEETHEREUMIO: 6,
            BAGIKERAN: 7,
            OKFAUCET: 8,
            BIGBTC: 9,
            BESTCHANGE: 10,
            KINGBIZ: 11,
            BFBOX: 13,
            FREEDOGEIO: 14,
            DUTCHYROLL: 15,
            FCRYPTO: 16,
            CPU: 17,
            CBG: 18,
            FPB: 19,
            G8: 20,
            FREEGRC: 21,
            HELI: 22,
            VIE: 23,
            O24: 24,
            YCOIN: 25,
            CDIVERSITY: 26,
            BSCADS: 27,
            CTOP: 28
        },
        CF: {
            UrlType: {
                HOME: 0,
                FREE: 1,
                CONTACTTWITTER: 2,
                PROMOTION: 3,
                STATS: 4,
                SETTINGS: 5,
                FREEROLLS: 6,
                IGNORE: 99
            },
            PromoStatus: {
                NOCODE: 0,
                PENDING: 1,
                ACCEPTED: 2,
                USEDBEFORE: 3,
                INVALID: 4,
                UNKNOWNERROR: 5,
                EXPIRED: 6
            },
            ReusableCodeSuggestions: ['q5rlm6ot3r', '55khv20st4', 'ykxlvmg9ja', 'vmuph8j0c6', 'd8fmqxjlma', 'rjnmzjs673', 'ki2r0jq5r0', '4obq1i3idd']
        },
        RandomInteractionLevel: {
            NONE: 0,
            LOW: 1,
            MEDIUM: 2,
            HIGH: 3
        },
        Integers: {
            HS_26_IN_MILLISECONDS: 93600000, //Using 26 hs instead of 24hs
            HS_2_IN_MILLISECONDS: 7200000 //and 2hs gap retry when code is flagged as USEDBEFORE
        },
        WalletType: {
            FP_MAIL: 100,
            FP_BTC: 101,
            FP_BNB: 102,
            FP_BCH: 103,
            FP_DASH: 104,
            FP_DGB: 105,
            FP_DOGE: 106,
            FP_ETH: 107,
            FP_FEY: 108,
            FP_LTC: 109,
            FP_TRX: 110,
            FP_USDT: 111,
            FP_ZEC: 112,
            FP_SOL: 113,
            EC: 200,
            BTC: 1,
            LTC: 2
        },
        ErrorType: {
            ERROR: 0,
            TIMEOUT: 1,
            NEED_TO_LOGIN: 2,
            ROLL_ERROR: 3,
            CLICK_ROLL_ERROR: 4,
            LOGIN_ERROR: 5,
            CLAIM_ERROR: 6,
            ADDRESS_ERROR: 7,
            MIN_WITHDRAW_ERROR: 8,
            IP_BAN: 9,
            IP_RESTRICTED: 10,
            IP_ERROR: 11,
            FORCE_CLOSED: 12,
            NO_FUNDS: 13,
            VERIFY_EMAIL: 14,
            NO_ADDRESS: 15,
            FAUCET_EMPTY: 16
        },
        CMC: {
            MULT: '-1',
            BTC: '1',
            LTC: '2',
            XRP: '52',
            DOGE: '74',
            DGB: '109',
            DASH: '131',
            USDT: '825',
            XEM: '873',
            ETH: '1027',
            STEEM: '1230',
            NEO: '1376',
            ZEC: '1437',
            BCH: '1831',
            BNB: '1839',
            TRX: '1958',
            LINK: '1975',
            ADA: '2010',
            USDC: '3408',
            SOL: '5426',
            SHIB: '5994',
            FEY: '10361',
            BFG: '11038',
            CAKE: '7186',
            GRC: '833',
            MATIC: '3890',
            BABY: '10334',
            BTT: '16086',
            BSW: '10746',
        },
        LOCATION: {
            UNKNOWN: 0,
            MANAGER: 1,
            SITE: 2
        }
    });

    let persistence, shared, manager, ui, CFPromotions, interactions, CFHistory, SiteProcessor, eventer;
    let uiRenderer;

    Element.prototype.isVisible = function() {
        return !!(this.offsetWidth||this.offsetHeight||this.getClientRects().length);
    };
    Element.prototype.isUserFriendly = function(selector) {
        let e = selector ? this.querySelector(selector) : this;
        return e && e.isVisible()  ? e : null;
    };
    Document.prototype.isUserFriendly = Element.prototype.isUserFriendly;

    Number.prototype.toDate = function() {
        return new Date(this);
    };
    Number.prototype.msToCountdown = function() {
        const remainingSeconds = Math.ceil(this / 1000);
        const hours = Math.floor(remainingSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((remainingSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };
      
    String.prototype.clean = function() {
        let output = "";
        for (let i = 0; i < this.length; i++) {
            if (this.charCodeAt(i) <= 127) {
                output += this.charAt(i);
            }
        }
        return output;
    };
    Array.prototype.shuffle = function () {
        let currentIndex = this.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = this[currentIndex];
            this[currentIndex] = this[randomIndex];
            this[randomIndex] = temporaryValue;
        }

        return this;
    };

    let helpers = {
        getTdPrintableTime: function (date = new Date()) {
            if (date != null) {
                return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
            }
            return '';
        },
        getPrintableTime: function (date = new Date()) {
            if (date == null) {
                return '';
            }
            return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
        },
        getPrintableDateTime: function (date) {
            if (date != null) {
                return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
            } else {
                return '';
            }
        },
        getEnumText: function (enm, value) {
            return Object.keys(enm).find(key => enm[key] === value) || '_ERR';
        },
        randomMs: function (a, b){
            return a + (b - a) * Math.random();
        },
        addMinutes: function(mins, date = new Date()) {
            return date.setMinutes(date.getMinutes() + +mins);
        },
        addSeconds: function(secs, date = new Date()) {
            return date.setSeconds(date.getSeconds() + +secs);
        },
        randomHexColor: function() {
            const hexChars = '0123456789abcdef';
            let color = '';
            for (let i = 0; i < 6; i++) {
              color += hexChars[Math.floor(Math.random() * hexChars.length)];
            }
            return color;
        },
        randomString: function(length) {
            let str = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            const charactersLength = characters.length;
            
            for (let i = 0; i < length; i++) {
                str += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            
            return str;
        },
        randomInt: function(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        addMs: function(ms, date = new Date()) {
            return date.setMilliseconds(date.getMilliseconds() + ms);
        },
        getRandomMs: function(minute, rangeDiffInPercentage) { // Now will be a random value between minute and minute + rangeDiffPercentage%; Example if minute = 30 and rangeDiffPercentage = 5 => random in the range [30, 31.5]
            let msMin = minute * 60 * 1000;
            let msMax = msMin + rangeDiffInPercentage/100 * msMin;
            return helpers.randomMs(msMin, msMax);
        },
        hsToMs: function(hours) {
            return hours * 60 * 60 * 1000;
        },
        minToMs: function(min) {
            return min * 60 * 1000;
        },
        getEmojiForPromoStatus: function(promoStatus) {
            switch (promoStatus) {
                case K.CF.PromoStatus.NOCODE:
                    return '⚪';
                case K.CF.PromoStatus.PENDING:
                    return '⏳';
                case K.CF.PromoStatus.ACCEPTED:
                    return '✔️';
                case K.CF.PromoStatus.USEDBEFORE:
                    return '🕙';
                case K.CF.PromoStatus.INVALID:
                    return '❌';
                case K.CF.PromoStatus.EXPIRED:
                    return '📅';
                case K.CF.PromoStatus.UNKNOWNERROR:
                    return '❗';
            }
        },
        getHost: function(url, withHttps = false) {
            if (url.includes('//')) {
                url = url.split('//')[1];
            }
            url = url.split('/')[0];
            return withHttps ? ('https://' + url) : url;
        },
        cf: {
            getUrlType: function(url) {
                if (url.endsWith('/free-rolls')) {
                    return K.CF.UrlType.FREEROLLS;
                }
                if (url.split('?')[0].endsWith('/free')) {
                    return K.CF.UrlType.FREE;
                }
                if (url.includes('/promotion/')) {
                    return K.CF.UrlType.PROMOTION;
                }
                if (url.endsWith('/contact-twitter')) {
                    return K.CF.UrlType.CONTACTTWITTER;
                }
                if (url.endsWith('/settings')) {
                    return K.CF.UrlType.SETTINGS;
                }
                if (url.endsWith('/stats')) {
                    return K.CF.UrlType.STATS;
                }
                if (url.endsWith('/')) {
                    url = url.slice(0, -1);
                    if (url == helpers.getHost(url, true)) {
                        return K.CF.UrlType.HOME;
                    }
                }

                return K.CF.UrlType.IGNORE;
            }
        },
        triggerMouseEvent: function (elm, eventType) {
            let clickEvent = document.createEvent('MouseEvents');
            clickEvent.initEvent (eventType, true, true);
            elm.dispatchEvent (clickEvent);
        },
        alternativeClick: function (elm) {
            helpers.triggerMouseEvent (elm, "mouseover");
            helpers.triggerMouseEvent (elm, "mousedown");
            helpers.triggerMouseEvent (elm, "mouseup");
            helpers.triggerMouseEvent (elm, "click");
        }
    }

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
                    'fpb.credentials.mode': 2,
                    'fpb.credentials.username': 'YOUR_USERNAME',
                    'fpb.credentials.password': 'YOURPASSWORD',
                    'bigbtc.postponeMinutes': '0',
                    'fbch.credentials.mode': 2,
                    'fbch.credentials.username': 'YOUR_USERNAME',
                    'fbch.credentials.password': 'YOURPASSWORD',
                    'jtfey.credentials.mode': 2,
                    'jtfey.credentials.username': 'YOUR_USERNAME',
                    'jtfey.credentials.password': 'YOURPASSWORD',
                    'shost.credentials.mode': 2,
                    'shost.credentials.username': 'YOUR_USERNAME',
                    'shost.credentials.password': 'YOURPASSWORD',
                    'ycoin.credentials.mode': 2,
                    'ycoin.credentials.username': 'YOUR_ACCOUNT_NUMBER',
                    'ycoin.credentials.password': 'YOURPASSWORD',
                    'bkclass.coin': 'LTC',
                    'bkclass.bcoin': 'LTC',
                    'bscads.credentials.mode': 2,
                    'bscads.credentials.username': 'YOUR_USERNAME',
                    'bscads.credentials.password': 'YOURPASSWORD',
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

            let runningSites = {}
            let scheduleUuid = null;
            function isOpenedByManager() {
                loadFlowControl();
                if(!runningSites || runningSites == {}) {
                    return false;
                }
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
                shared.devlog(`${window.location.href} closing with error msg`);
                window.close();
            };
            function clearFlowControl(schedule) {
                shared.devlog(`[${schedule}] clearFlowControl for ${schedule}`);
                if (schedule) {
                    runningSites[schedule] = {};
                    saveFlowControl(schedule);
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
                purgeFlowControlSchedules: purgeFlowControlSchedules
            };
        },
        createManager: function() {
            let timestamp = null;
            let intervalUiUpdate;
            let getFeedInterval;

            let userWallet = [];

            const sites = [
                { id: '1', name: 'CF ADA', cmc: '2010', coinRef: 'ADA', url: new URL('https://freecardano.com/free'), rf: '?ref=335463', type: K.WebType.CRYPTOSFAUCETS, clId: 45 },
                { id: '2', name: 'CF BNB', cmc: '1839', coinRef: 'BNB', url: new URL('https://freebinancecoin.com/free'), rf: '?ref=161127', type: K.WebType.CRYPTOSFAUCETS, clId: 42 },
                { id: '3', name: 'CF BTC', cmc: '1', coinRef: 'BTC', url: new URL('https://freebitcoin.io/free'), rf: '?ref=490252', type: K.WebType.CRYPTOSFAUCETS, clId: 40 },
                { id: '4', name: 'CF DASH', cmc: '131', coinRef: 'DASH', url: new URL('https://freedash.io/free'), rf: '?ref=124083', type: K.WebType.CRYPTOSFAUCETS, clId: 156 },
                { id: '5', name: 'CF ETH', cmc: '1027', coinRef: 'ETH', url: new URL('https://freeethereum.com/free'), rf: '?ref=204076', type: K.WebType.CRYPTOSFAUCETS, clId: 44 },
                { id: '6', name: 'CF LINK', cmc: '1975', coinRef: 'LINK', url: new URL('https://freecryptom.com/free'), rf: '?ref=78652', type: K.WebType.CRYPTOSFAUCETS, clId: 157 },
                { id: '7', name: 'CF LTC', cmc: '2', coinRef: 'LTC', url: new URL('https://free-ltc.com/free'), rf: '?ref=117042', type: K.WebType.CRYPTOSFAUCETS, clId: 47 },
                { id: '8', name: 'CF NEO', cmc: '1376', coinRef: 'NEO', url: new URL('https://freeneo.io/free'), rf: '?ref=100529', type: K.WebType.CRYPTOSFAUCETS, clId: 158 },
                { id: '9', name: 'CF STEAM', cmc: '825', coinRef: 'STEEM', url: new URL('https://freesteam.io/free'), rf: '?ref=117686', type: K.WebType.CRYPTOSFAUCETS, clId: 49 },
                { id: '10', name: 'CF TRX', cmc: '1958', coinRef: 'TRX', url: new URL('https://free-tron.com/free'), rf: '?ref=145047', type: K.WebType.CRYPTOSFAUCETS, clId: 41 },
                { id: '11', name: 'CF USDC', cmc: '3408', coinRef: 'USDC', url: new URL('https://freeusdcoin.com/free'), rf: '?ref=100434', type: K.WebType.CRYPTOSFAUCETS, clId: 51 },
                { id: '12', name: 'CF USDT', cmc: '825', coinRef: 'USDT', url: new URL('https://freetether.com/free'), rf: '?ref=181230', type: K.WebType.CRYPTOSFAUCETS, clId: 43 },
                { id: '13', name: 'CF XEM', cmc: '873', coinRef: 'XEM', url: new URL('https://freenem.com/free'), rf: '?ref=295274', type: K.WebType.CRYPTOSFAUCETS, clId: 46 },
                { id: '14', name: 'CF XRP', cmc: '52', coinRef: 'XRP', url: new URL('https://coinfaucet.io/free'), rf: '?ref=808298', type: K.WebType.CRYPTOSFAUCETS, clId: 48 },
                { id: '15', name: 'StormGain', cmc: '1', url: new URL('https://app.stormgain.com/crypto-miner/'), rf: 'friend/BNS27140552', type: K.WebType.STORMGAIN, clId: 35 },
                { id: '16', name: 'CF DOGE', cmc: '74', coinRef: 'DOGE', url: new URL('https://free-doge.com/free'), rf: '?ref=97166', type: K.WebType.CRYPTOSFAUCETS, clId: 50 },
                { id: '17', name: 'FreeBitco.in', cmc: '1', url: new URL('https://freebitco.in/'), rf: '?r=41092365', type: K.WebType.FREEBITCOIN, clId: 36 },
                { id: '18', name: 'FaucetPay PTC', cmc: '1', url: new URL('https://faucetpay.io/ptc'), rf: '?r=41092365', type: K.WebType.FAUCETPAY, clId: 159 },
                // { id: '19', name: 'Free-Litecoin.com', cmc: '2', url: new URL('https://free-litecoin.com/'), rf: 'login?referer=1332950', type: K.WebType.FREELITECOIN, clId: 160 },
                // { id: '20', name: 'Free-Ethereum.io', cmc: '1027', url: new URL('https://www.free-ethereum.io/'), rf: '?referer=1064662', type: K.WebType.FREEETHEREUMIO, clId: 161 },
                // { id: '21', name: 'Bagi BTC', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://bagi.co.in/bitcoin/'), rf: ['?ref=53706', '?ref=63428', '?ref=54350'], type: K.WebType.BAGIKERAN, clId: 52 },
                // { id: '22', name: 'Bagi BNB', cmc: '1839', wallet: K.WalletType.FP_BNB, url: new URL('https://bagi.co.in/binance/'), rf: ['?ref=12529', '?ref=23852', '?ref=13847'], type: K.WebType.BAGIKERAN, clId: 142  },
                // { id: '23', name: 'Bagi BCH', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://bagi.co.in/bitcoincash/'), rf: ['?ref=44242', '?ref=50185', '?ref=41957'], type: K.WebType.BAGIKERAN, clId: 143 },
                // { id: '24', name: 'Bagi DASH', cmc: '131', wallet: K.WalletType.FP_DASH, url: new URL('https://bagi.co.in/dash/'), rf: ['?ref=32724', '?ref=38540', '?ref=40441'], type: K.WebType.BAGIKERAN, clId: 144 },
                // { id: '25', name: 'Bagi DGB', cmc: '109', wallet: K.WalletType.FP_DGB, url: new URL('https://bagi.co.in/digibyte/'), rf: ['?ref=22664', '?ref=27872', '?ref=29669'], type: K.WebType.BAGIKERAN, clId: 147 },
                // { id: '26', name: 'Bagi DOGE', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://bagi.co.in/dogecoin/'), rf: ['?ref=45047', '?ref=54217', '?ref=45568'], type: K.WebType.BAGIKERAN, clId: 145 },
                // { id: '27', name: 'Bagi ETH', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://bagi.co.in/ethereum/'), rf: ['?ref=24486', '?ref=27799', '?ref=24847'], type: K.WebType.BAGIKERAN, clId: 152 },
                // { id: '28', name: 'Bagi FEY', cmc: '10361', wallet: K.WalletType.FP_FEY, url: new URL('https://bagi.co.in/feyorra/'), rf: ['?ref=5049', '?ref=7433', '?ref=5318'], type: K.WebType.BAGIKERAN, clId: 153 },
                // { id: '29', name: 'Bagi LTC', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://bagi.co.in/litecoin/'), rf: ['?ref=48335', '?ref=57196', '?ref=48878'], type: K.WebType.BAGIKERAN, clId: 146 },
                // { id: '30', name: 'Bagi TRX', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://bagi.co.in/tron/'), rf: ['?ref=22622', '?ref=31272', '?ref=23075'], type: K.WebType.BAGIKERAN, clId: 150 },
                // { id: '31', name: 'Bagi USDT', cmc: '825', wallet: K.WalletType.FP_USDT, url: new URL('https://bagi.co.in/tether/'), rf: ['?ref=25462', '?ref=32491', '?ref=25981'], type: K.WebType.BAGIKERAN, clId: 151 },
                // { id: '32', name: 'Bagi ZEC', cmc: '1437', wallet: K.WalletType.FP_ZEC, url: new URL('https://bagi.co.in/zcash/'), rf: ['?ref=9181', '?ref=15120', '?ref=9878'], type: K.WebType.BAGIKERAN, clId: 148 },
                // { id: '33', name: 'Keran BTC', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://keran.co/BTC/'), rf: ['?ref=73729', '?ref=92353', '?ref=79321'], type: K.WebType.BAGIKERAN, clId: 53 },
                // { id: '34', name: 'Keran BNB', cmc: '1839', wallet: K.WalletType.FP_BNB, url: new URL('https://keran.co/BNB/'), rf: ['?ref=19287', '?ref=31242', '?ref=20659'], type: K.WebType.BAGIKERAN, clId: 54 },
                // { id: '35', name: 'Keran BCH', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://keran.co/BCH/'), rf: ['?ref=58232', '?ref=67326', '?ref=70759'], type: K.WebType.BAGIKERAN, clId: 30 },
                // { id: '36', name: 'Keran DASH', cmc: '131', wallet: K.WalletType.FP_DASH, url: new URL('https://keran.co/DASH/'), rf: ['?ref=45229', '?ref=53041', '?ref=55716'], type: K.WebType.BAGIKERAN, clId: 127 },
                // { id: '37', name: 'Keran DGB', cmc: '109', wallet: K.WalletType.FP_DGB, url: new URL('https://keran.co/DGB/'), rf: ['?ref=32788', '?ref=39527', '?ref=42014'], type: K.WebType.BAGIKERAN, clId: 129 },
                // { id: '38', name: 'Keran DOGE', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://keran.co/DOGE/'), rf: ['?ref=73512', '?ref=85779', '?ref=89613'], type: K.WebType.BAGIKERAN, clId: 128 },
                // { id: '39', name: 'Keran ETH', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://keran.co/ETH/'), rf: ['?ref=32226', '?ref=36427', '?ref=32676'], type: K.WebType.BAGIKERAN, clId: 37 },
                // { id: '40', name: 'Keran FEY', cmc: '10361', wallet: K.WalletType.FP_FEY, url: new URL('https://keran.co/FEY/'), rf: ['?ref=6269', '?ref=9019', '?ref=6569'], type: K.WebType.BAGIKERAN, clId: 133 },
                // { id: '41', name: 'Keran LTC', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://keran.co/LTC/'), rf: ['?ref=69102', '?ref=80726', '?ref=84722'], type: K.WebType.BAGIKERAN, clId: 29 },
                // { id: '42', name: 'Keran TRX', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://keran.co/TRX/'), rf: ['?ref=49686', '?ref=46544', '?ref=34485'], type: K.WebType.BAGIKERAN, clId: 162 },
                // { id: '43', name: 'Keran USDT', cmc: '825', wallet: K.WalletType.FP_USDT, url: new URL('https://keran.co/USDT/'), rf: ['?ref=40582', '?ref=48907', '?ref=41009'], type: K.WebType.BAGIKERAN, clId: 132 },
                // { id: '44', name: 'Keran ZEC', cmc: '1437', wallet: K.WalletType.FP_ZEC, url: new URL('https://keran.co/ZEC/'), rf: ['?ref=', '?ref=18976', '?ref=12487'], type: K.WebType.BAGIKERAN, clId: 130 },
                // { id: '45', name: 'OK Btc', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://btc-ok.net/'), rf: 'index.php?r=1QCD6cWJNVH4Cdnz85SQ2qtTkAwGr9fvUk', type: K.WebType.OKFAUCET },
                // { id: '46', name: 'OK Dash', cmc: '131', wallet: K.WalletType.FP_DASH, url: new URL('https://dash-ok.net/'), rf: 'index.php?r=Xbyi7Fk2NRmZ32SHpDhmpGHLa4NMokhmGR', type: K.WebType.OKFAUCET },
                // { id: '47', name: 'OK Dgb', cmc: '109', wallet: K.WalletType.FP_DGB, url: new URL('https://dgb-ok.net/'), rf: 'index.php?r=DSM93hgZuapnjeeDMe8spzwG9rMrw4sdua', type: K.WebType.OKFAUCET },
                // { id: '48', name: 'OK Doge', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://doge-ok.net/'), rf: 'index.php?r=DDaQWmD7vY1NhtK1M5Pno7sdccmgxNUfv1', type: K.WebType.OKFAUCET },
                // { id: '49', name: 'OK Eth', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://eth-ok.net/'), rf: 'index.php?r=0x7636f64a8241257b1edaf65ae943c66de87b1749', type: K.WebType.OKFAUCET },
                // { id: '50', name: 'OK Ltc', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://ltc-ok.net/'), rf: 'index.php?r=MEmxLqYzZdMsEswUQkqL5aawT5UsqYwYgr', type: K.WebType.OKFAUCET },
                // { id: '51', name: 'OK Trx', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://trx-ok.net/'), rf: 'index.php?r=TSocuzJ6ADUoQ49v28BXN2jo3By6awwHvj', type: K.WebType.OKFAUCET },
                { id: '52', name: 'BigBtc', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://bigbtc.win/'), rf: '?id=39255652', type: K.WebType.BIGBTC, clId: 200 },
                { id: '53', name: 'BestChange', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://www.bestchange.com/'), rf: ['index.php?nt=bonus&p=1QCD6cWJNVH4Cdnz85SQ2qtTkAwGr9fvUk'], type: K.WebType.BESTCHANGE, clId: 163 },
                // { id: '54', name: 'Litking.biz', cmc: '2', url: new URL('https://litking.biz/'), rf: 'signup?r=159189', type: K.WebType.KINGBIZ, clId: 164 },
                // { id: '55', name: 'Bitking.biz', cmc: '1', url: new URL('https://bitking.biz/'), rf: 'signup?r=90003', type: K.WebType.KINGBIZ, clId: 165 },
                // { id: '56', name: 'OK Bch', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://faucetok.net/bch/'), rf: '?r=qz742nf2c30ktehlmn0pg6quqe8yuwp3evd75y8c0k', type: K.WebType.OKFAUCET }
                // { id: '57', name: 'OurBitco.in', cmc: '1', url: new URL('https://ourbitco.in/dashboard'), rf: '?r=gebcjvwpky', type: K.WebType.OURBITCOIN },
                { id: '58', name: 'BF BTC', cmc: '1', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BFBOX, clId: 1 },
                { id: '59', name: 'BF BNB', cmc: '1839', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BFBOX, clId: 1 },
                // { id: '60', name: 'Free-Doge.io', cmc: '74', url: new URL('https://www.free-doge.io/'), rf: '?referer=6695', type: K.WebType.FREEDOGEIO, clId: 166 },
                { id: '61', name: 'Dutchy', cmc: '-1', url: new URL('https://autofaucet.dutchycorp.space/roll.php'), rf: '?r=corecrafting', type: K.WebType.DUTCHYROLL, clId: 141 },
                { id: '62', name: 'Dutchy Monthly Coin', cmc: '-1', url: new URL('https://autofaucet.dutchycorp.space/coin_roll.php'), rf: '?r=corecrafting', type: K.WebType.DUTCHYROLL, clId: 141 },
                // { id: '63', name: 'Express', cmc: '-1', url: new URL('https://express.dutchycorp.space/roll.php'), rf: '?r=EC-UserId-428378', type: K.WebType.DUTCHYROLL },
                // { id: '64', name: 'Express Monthly Coin', cmc: '-1', url: new URL('https://express.dutchycorp.space/coin_roll.php'), rf: '?r=EC-UserId-428378', type: K.WebType.DUTCHYROLL },
                { id: '65', name: 'FCrypto Roll', cmc: '-1', url: new URL('https://faucetcrypto.com/dashboard'), rf: 'ref/704060', type: K.WebType.FCRYPTO, clId: 27 },
                // WIP { id: '66', name: 'CPU', cmc: '-1', url: new URL('https://www.coinpayu.com/dashboard'), rf: '?r=corecrafting', type: K.WebType.CPU },
                { id: '67', name: 'BF BFG', cmc: '11038', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BFBOX, clId: 1 },
                { id: '68', name: 'CF SHIBA', cmc: '5994', coinRef: 'SHIBA', url: new URL('https://freeshibainu.com/free'), rf: '?ref=18226', type: K.WebType.CRYPTOSFAUCETS, clId: 167 },
                // { id: '69', name: 'Bagi SOL', cmc: '5426', wallet: K.WalletType.FP_SOL, url: new URL('https://bagi.co.in/solana/'), rf: ['?ref=2838'], type: K.WebType.BAGIKERAN, clId: 149 },
                // { id: '70', name: 'Keran SOL', cmc: '5426', wallet: K.WalletType.FP_SOL, url: new URL('https://keran.co/SOL/'), rf: ['?ref=4249'], type: K.WebType.BAGIKERAN, clId: 131 },
                // { id: '71', name: 'CBG Doge', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://cryptobaggiver.com/dogecoin-faucet/'), rf: ['?r=D8Xgghu5gCryukwmxidFpSmw8aAKon2mEQ'], type: K.WebType.CBG, clId: 110 },
                // { id: '72', name: 'CBG Eth', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://cryptobaggiver.com/ethereum-faucet/'), rf: ['?r=0xC21FD989118b8C0Db6Ac2eC944B53C09F7293CC8'], type: K.WebType.CBG, clId: 111 },
                // { id: '73', name: 'CBG Ltc', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://cryptobaggiver.com/litecoin-faucet/'), rf: ['?r=MWSsGAQTYD7GH5o4oAehC8Et5PyMBfhnKK'], type: K.WebType.CBG, clId: 114 },
                // { id: '74', name: 'CBG Bch', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://cryptobaggiver.com/bitcoin-cash-faucet/'), rf: ['?r=qq2qlpzs4rsn30utrumezpkzezpteqj92ykdgfeq5u'], type: K.WebType.CBG, clId: 112 },
                // { id: '75', name: 'CBG Dgb', cmc: '109', wallet: K.WalletType.FP_DGB, url: new URL('https://cryptobaggiver.com/digibyte-faucet/'), rf: ['?r=DTn8mnXo655wdS78u2qSHHcqaiP5Z8Ewro'], type: K.WebType.CBG, clId: 113 },
                // { id: '76', name: 'CBG Dash', cmc: '131', wallet: K.WalletType.FP_DASH, url: new URL('https://cryptobaggiver.com/dash-faucet/'), rf: ['?r=XfYJ3XmbCHA1HcCFb5Qnyiq5YFFGVZYZv6'], type: K.WebType.CBG, clId: 115 },
                { id: '77', name: 'FPig', cmc: '825', wallet: K.WalletType.FP_USDT, url: new URL('https://faupig-bit.online/page/dashboard'), rf: [''], type: K.WebType.FPB, clId: 154 },
                { id: '78', name: 'CF Cake', cmc: '7186', coinRef: 'CAKE', url: new URL('https://freepancake.com/free'), rf: '?ref=699', type: K.WebType.CRYPTOSFAUCETS, clId: 197 },
                // { id: '79', name: 'GetFreeTRX', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://getfreetrx.com/'), rf: '?r=TK3ofbD3AyXotN2111UvnwCzr2YaW8Qmx7', type: K.WebType.G8, clId: 201 },
                { id: '80', name: 'FreeGRC', cmc: '833', url: new URL('https://freegridco.in/#free_roll'), rf: '', type: K.WebType.FREEGRC, clId: 207 },
                { id: '81', name: 'CF Matic', cmc: '3890', coinRef: 'MATIC', url: new URL('https://freematic.com/free'), rf: '?ref=6435', type: K.WebType.CRYPTOSFAUCETS, clId: 210 },
                // { id: '82', name: 'Heli', cmc: '-1', url: new URL('https://helidrops.io/coins.php'), rf: 'OLPUAO', type: K.WebType.HELI, clId: 211 },
                // { id: '83', name: 'FreeBCH', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://freebch.fun/page/dashboard'), rf: ['?r=satology'], type: K.WebType.FPB, clId: 212 },
                { id: '84', name: 'JTFey', cmc: '-1', url: new URL('https://james-trussy.com/faucet'), rf: ['?r=corecrafting'], type: K.WebType.VIE, clId: 213 },
                { id: '85', name: 'O24', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://www.only1024.com/f'), rf: ['?r=1QCD6cWJNVH4Cdnz85SQ2qtTkAwGr9fvUk'], type: K.WebType.O24, clId: 97 },
                { id: '86', name: 'BF BABY', cmc: '10334', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BFBOX, clId: 1 },
                { id: '87', name: 'CF BTT', cmc: '16086', coinRef: 'BTT', url: new URL('https://freebittorrent.com/free'), rf: '?ref=2050', type: K.WebType.CRYPTOSFAUCETS, clId: 218 },
                { id: '88', name: 'BF BSW', cmc: '10746', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BETFURYBOX, clId: 1 },
                { id: '89', name: 'CF BFG', cmc: '11038', coinRef: 'BFG', url: new URL('https://freebfg.com/free'), rf: '?ref=117', type: K.WebType.CRYPTOSFAUCETS, clId: 219 },
                // { id: '90', name: 'Keran.co', cmc: '-1', wallet: K.WalletType.FP_MAIL, url: new URL('https://keran.co/'), rf: ['?ref=91'], type: K.WebType.BAGIKERAN, clId: 220 },
                // { id: '91', name: 'Bagi.co.in', cmc: '-1', wallet: K.WalletType.FP_MAIL, url: new URL('https://bagi.co.in/'), rf: ['?ref=64'], type: K.WebType.BAGIKERAN, clId: 221 },
                // { id: '92', name: 'SatoHost', cmc: '825', wallet: K.WalletType.FP_USDT, url: new URL('http://sato.host/page/dashboard'), rf: ['?r=corecrafting'], type: K.WebType.FPB, clId: 233 },
                { id: '93', name: 'YCoin', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://yescoiner.com/faucet'), rf: ['?ref=4729452'], type: K.WebType.YCOIN, clId: 234 },
                { id: '94', name: 'CDiversity', cmc: '-1', wallet: K.WalletType.FP_MAIL, url: new URL('http://coindiversity.io/free-coins'), rf: ['?r=1J3sLBZAvY5Vk9x4RY2qSFyL7UHUszJ4DJ'], type: K.WebType.CDIVERSITY, clId: 235 },
                { id: '95', name: 'BscAds', cmc: '1839', url: new URL('https://bscads.com/'), rf: ['ref/corecrafting'], type: K.WebType.BSCADS, clId: 226 },
                { id: '96', name: 'Top Ltc', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://ltcfaucet.top/'), rf: ['?r=MWSsGAQTYD7GH5o4oAehC8Et5PyMBfhnKK'], type: K.WebType.CTOP, clId: 239 },
                { id: '97', name: 'Top Bnb', cmc: '1839', wallet: K.WalletType.FP_BNB, url: new URL('https://bnbfaucet.top/'), rf: ['?r=0x1e8CB8A79E347C54aaF21C0502892B58F97CC07A'], type: K.WebType.CTOP, clId: 240 },
                { id: '98', name: 'Top Doge', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://dogecoinfaucet.top/'), rf: ['?r=D8Xgghu5gCryukwmxidFpSmw8aAKon2mEQ'], type: K.WebType.CTOP, clId: 241 },
                { id: '99', name: 'Top Trx', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://tronfaucet.top/'), rf: ['?r=TK3ofbD3AyXotN2111UvnwCzr2YaW8Qmx7'], type: K.WebType.CTOP, clId: 242 },
                { id: '100', name: 'Top Eth', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://ethfaucet.top/'), rf: ['?r=0xC21FD989118b8C0Db6Ac2eC944B53C09F7293CC8'], type: K.WebType.CTOP, clId: 243 },
            ];

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

                    if (this.type == K.WebType.BFBOX) {
                        this.params['defaults.nextRun.override'] = true;
                        this.params['defaults.nextRun.useCountdown'] = false;
                        this.params['defaults.nextRun'] = 0;
                        this.params['defaults.nextRun.min'] = 21;
                        this.params['defaults.nextRun.max'] = 25;
                    }

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

                    let schedule = manager.Schedule.getById(newSite.schedule);
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
                        manager.Schedule.getAll().forEach(sch => {
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
                        manager.Schedule.getById(this.schedule)?.removeSite(this.id);
                        // eventer.emit('removeSiteFromSchedule', { site_id: this.id, schedule_id: this.schedule });
                    }
                    this.schedule = newScheduleId;
                    let newSchedule = manager.Schedule.getById(this.schedule);
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
                    this.timer = new Timer(true, 30, this.uuid);
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
                    this.tab.close();
                };
        
                reopenTab() {
                    this.tab = GM_openInTab(this.currentSite.url, { active: !this.getCustomOrDefaultVal('defaults.workInBackground', this.useOverride('defaults.workInBackground')) });
                };
        
                open(promoCodes) {
                    this.status = STATUS.CLAIMING;
                    let navUrl = this.currentSite.url;
                    try {
                        let params = this.currentSite.params || {};
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
                                params.address = userWallet.find(x => x.type == this.currentSite.wallet).address;
                            } catch {
                                shared.addError(K.ErrorType.NO_ADDRESS, 'You need to add your address to the wallet before claiming this faucet.', this.uuid);
                                ui.log({ schedule: this.uuid, siteName: this.currentSite.name, msg: `Unable to launch ${this.currentSite.name}: Address not detected > add it to the wallet.`});
                                this.moveNextAfterTimeoutOrError();
                                return;
                            }
                        }
                        if(this.currentSite.type == K.WebType.BESTCHANGE) {
                            params.address = shared.getConfig()['bestchange.address'] == '1' ? userWallet.find(x => x.type == 1).address : params.address;
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
                            try {
                                shared.devlog(`Tab closed from Manager`);
                                this.tab.close();
                            } catch {
                                shared.devlog(`ERROR: unable to close tab from Manager`);
                            }
                        } else {
                            shared.devlog(`No open tabs detected`);
                        }
        
                        this.timer.startCheck(this.currentSite.type);
                        let noSignUpList = [ K.WebType.BESTCHANGE, K.WebType.CBG, K.WebType.G8, K.WebType.O24, K.WebType.CDIVERSITY, K.WebType.CTOP ];
                        let hrefOpener = navUrl.href;
                        if (noSignUpList.includes(this.currentSite.type)) {
                            hrefOpener = (new URL(this.currentSite.clId, 'https://criptologico.com/goto/')).href;
                        }
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
                    if(isObsolete()) {
                        return;
                    }
        
                    // ui.log(`[${this.uuid}] @resultReader. Current Id: ${this.currentSite.id}`);
                    if(shared.isCompleted(this.currentSite.id)) {
                        this.analyzeResult(); // rename to something else...
                    } else {
                        this.waitOrMoveNext(); // this should just be the error and timeout check
                    }
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
                    let result = shared.getResult(this.uuid);
        
                    if (result) {
                        this.updateWebListItem(result);
        
                        if (result.closeParentWindow) {
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
                                update(false);
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
                    update(true);
                    readUpdateValues(true);
                    return;
                }
        
                waitOrMoveNext() {
                    // ui.log(`[${this.uuid}] @waitOrMoveNext`);
                    // No visited flag
                    this.timeWaiting += 15;
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
                        this.currentSite.stats.errors = shared.getResult(this.uuid);
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
                        update(true);
                        this.timeWaiting = 0;
                        this.status = STATUS.IDLE;
                        shared.clearFlowControl(this.uuid);
                        readUpdateValues(true);
                        return true;
                    }
                    return false;
                }
        
                updateWebListItem(result) {
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
                    update(true);
                    this.timeWaiting = 0;
                    this.status = STATUS.IDLE;
                    shared.clearFlowControl(this.uuid);
                    readUpdateValues(true);
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
                    update(true);
                    this.timeWaiting = 0;
                    this.status = STATUS.IDLE;
                    shared.clearFlowControl(this.uuid);
                    readUpdateValues(true);
                }
        
            }
        
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
                    // manager.Schedule.getAllSites() for UI? always sorted?
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
                                    s.currentSite.enabled = false
                                }
                            });
                            update(true);
                            window.location.reload();

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
                init:start,
                getFaucetsForPromotion: getCFlist,
                readPromoCodeValues: readPromoCodeValues,
                closeWorkingTab: closeWorkingTab,
                reloadWorkingTab: reloadWorkingTab,
                Schedule: Schedule,
                Site: Site,
                getAllSites: getAllSites,
                resyncAll: resyncAll
            };
        },
        createUi: function() {

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
                                uiRenderer.toast("Wallet will be updated as soon as possible");
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
                                uiRenderer.toast("Config will be updated as soon as possible");
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
                                    if (timeVal < -15000) {
                                        // TODO: trigger a resync!
                                        console.warn(`HITTING RELOAD: ${timeVal}`);
                                        console.info(sp);
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
                        uiRenderer.toast("This could take around a minute", "Removing all promo codes");
                    };

                    window.forceStopFaucet = function removeAllPromos() {
                        var promoCode = document.getElementById("promo-code-new");
                        var promoObject = { action: "FORCESTOPFAUCET" };
                        promoCode.innerHTML =JSON.stringify(promoObject);
                        uiRenderer.toast("Please wait for reload...", "Trying to stop");
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
                    manager.Site.sortAll(); // en todos los sites...
                    let schedule = manager.Schedule.getById(site.schedule);
                    schedule.sortSites(); // solo en el schedule de este site
                    schedule.setCurrentSite(); // solo en el schedule de este site
                    manager.Site.saveAll();
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
                manager.Schedule.getAll().forEach(x => {
                    html += `<label class="btn btn-outline-primary" data-schedule="${x.uuid}">
                    <i class="fas fa-square pr-1" style="color: #${x.uuid};"></i>${x.name}
                    <input type="radio" name="options" autocomplete="off">
                    </label>`;
                });
                container.innerHTML = html;
                startSchedulesInterval(manager.Schedule.getAllForCrud().map(x => x.uuid));
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
                        let isValid = manager.Schedule.crud(data);
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

                //Info
                html += '  <div class="modal-content bg-beige d-none" id="modal-info">';
                html += '   <div class="modal-header"><h5 class="modal-title"><i class="fa fa-info"></i> Info</h5></div>';
                html += '    <div class="modal-body">';
                html += '<ul>';
                html += '<li>Almost all sites in the list require an external hCaptcha solver, you can find one in our <a href="https://discord.gg/23s9fDgHqe" target="_blank">discord</a>.</li>';
                html += '<li>Stormgain requires a GeeTest solver. You can use <a href="https://greasyfork.org/en/scripts/444560" target="_blank">this script</a> to solve the captchas through 2Captcha API service.</li>';
                html += '<li>You can set default configurations at Settings</li>';
                html += '<li>You can override configurations for a specific site using the edit (<i class="fa fa-edit"></i>) buttons</li>';
                html += '<li>Some sites might only work if the tab running it is on focus</li>';
                html += '<li>When enabling a new site, try it first with the tab on focus, to detect potential issues</li>';
                html += '<li>You can enable the log in Settings to detect processing problems</li>';
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
                html += '    <div class="modal-header py-2"><h5 class="modal-title"><i class="fa fa-edit"></i> Edit Site Parameters...</h5>';
                html += '    </div>';
                html += '    <div class="modal-body">';
                html += '      <div class="form-container"><form action="">';
                html += '      </form></div>';
                html += '    </div>';
                html += '    <div class="modal-footer">';
                html += '    <a class="btn m-2 anchor btn-outline-danger align-middle" data-dismiss="modal"><i class="fa fa-times-circle"></i> Cancel</a>';
                html += '    <a class="btn m-2 anchor btn-outline-success align-middle modal-save"><i class="fa fa-check-circle"></i> Save</a>';
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
                html += '          <div><label class="switch"><input type="checkbox" data-prop="cf.tryGetCodes" ><span class="slider round"></span></label> Auto update promo codes </div>';
                html += '          <div><label class="switch"><input type="checkbox" data-prop="cf.rollOnce" ><span class="slider round"></span></label> Roll once per round </div>';
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

                html += '         <div class="card m-1 collapsed-card"><div class="card-header">FPig<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
                html += '           <div class="card-body px-4" style="display: none;">';
                html += '           <label class="control-label">Login Mode</label>';
                html += '           <select class="form-control" data-prop="fpb.credentials.mode">';
                html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
                html += '           </select>';
                html += '           <label class="control-label">E-Mail</label>';
                html += '           <input maxlength="200" type="text" data-prop="fpb.credentials.username" required="required" class="form-control" placeholder="Email address..."/>';
                html += '           <label class="control-label">Password</label>';
                html += '           <input maxlength="200" type="password" data-prop="fpb.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
                html += '       </div></div>';

                html += '         <div class="card m-1 collapsed-card"><div class="card-header">FreeBCH<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
                html += '           <div class="card-body px-4" style="display: none;">';
                html += '           <label class="control-label">Login Mode</label>';
                html += '           <select class="form-control" data-prop="fbch.credentials.mode">';
                html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
                html += '           </select>';
                html += '           <label class="control-label">E-Mail</label>';
                html += '           <input maxlength="200" type="text" data-prop="fbch.credentials.username" required="required" class="form-control" placeholder="Email address..."/>';
                html += '           <label class="control-label">Password</label>';
                html += '           <input maxlength="200" type="password" data-prop="fbch.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
                html += '       </div></div>';

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

                html += '         <div class="card m-1 collapsed-card"><div class="card-header">BscAds<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
                html += '           <div class="card-body px-4" style="display: none;">';
                html += '           <label class="control-label">Login Mode</label>';
                html += '           <select class="form-control" data-prop="bscads.credentials.mode">';
                html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
                html += '           </select>';
                html += '           <label class="control-label">E-Mail</label>';
                html += '           <input maxlength="200" type="text" data-prop="bscads.credentials.username" required="required" class="form-control" placeholder="Username..."/>';
                html += '           <label class="control-label">Password</label>';
                html += '           <input maxlength="200" type="password" data-prop="bscads.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
                html += '       </div></div>';

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

                html += '         <div class="card m-1 collapsed-card"><div class="card-header">SatoHost<div class="card-tools"><button type="button" class="btn btn-white btn-sm" data-card-widget="collapse" title="Collapse"><i class="fas fa-plus"></i></button></div></div>';
                html += '           <div class="card-body px-4" style="display: none;">';
                html += '           <label class="control-label">Login Mode</label>';
                html += '           <select class="form-control" data-prop="shost.credentials.mode">';
                html += '            <option value="1">Use Username and Password</option><option value="2">Filled by 3rd party software/extension</option>';
                html += '           </select>';
                html += '           <label class="control-label">E-Mail</label>';
                html += '           <input maxlength="200" type="text" data-prop="shost.credentials.username" required="required" class="form-control" placeholder="Username..."/>';
                html += '           <label class="control-label">Password</label>';
                html += '           <input maxlength="200" type="password" data-prop="shost.credentials.password" required="required" class="form-control" placeholder="Password..."/>';
                html += '       </div></div>';

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
                <!-- <a class="dropdown-item btn-open-dialog" data-target="modal-sites"><i class="fa fa-window-restore"></i>&nbsp;Sites...</a> -->
                <div class="dropdown-divider"></div>
                <a class="dropdown-item btn-open-dialog" data-target="modal-ereport"><i class="fa fa-history"></i>&nbsp;Log...</a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item btn-open-dialog" data-target="modal-info"><i class="fa fa-info"></i>&nbsp;Help/Info...</a>
                </div>`;

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
                html += '<input id="promo-text-input" type="text" name="table_search" class="form-control float-right" list="promoCode_list" placeholder="CF Promo Code..." style="width:130px;">';
                html += '<input type="checkbox" data-toggle="switch" title="Check if the code can be reused every 24hs" id="promo-daily" data-on-text="Daily" data-off-text="1 Time">';
                html += '<div class="input-group-append"><button type="submit" class="btn btn-default" id="promo-button""><i class="fas fa-plus"></i> Add</button></div>';
                html += '<div class="input-group-append"><button type="submit" class="btn btn-default btn-outline-danger mx-1" data-toggle="modal" data-target="#confirmable-modal" onclick="confirmable.open(\'removeAllPromos\', \'All promo codes will be removed.\')"><i class="fas fa-times-circle"></i> Remove All</button></div>';
                html += '<div class="input-group-append"><button type="submit" class="btn btn-default btn-outline-primary" id="button-try-get-codes"><i class="fas fa-bolt"></i> Try to Get Codes</button></div>';
                html += '<div class="input-group-append"><button type="button" class="btn btn-tool btn-sm mx-1" data-card-widget="collapse" title="Collapse"><i class="fas fa-minus"></i></button></div>';
                html += '<div class="input-group-append"><button type="button" class="btn btn-tool btn-sm mx-1" data-card-widget="maximize" title="Maximize"><i class="fas fa-expand"></i></button></div>';
                html += '</div>';
                html += '<datalist id="promoCode_list">';
                K.CF.ReusableCodeSuggestions.forEach( function(x) { html += '<option>' + x + '</option>' });
                html += '</datalist>';
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

                let tgt = document.querySelector('div.row.py-3');
                if (tgt) {
                    let rowDiv = document.createElement('div');
                    rowDiv.innerHTML = '<div class="row py-3 ac-log"><div class="col-12 justify-content-center"><div class="card"><div class="card-body" id="referral-table"></div></div></div></div>';
                    tgt.after(rowDiv);
                }

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
        },
        createCFPromotions: function() {
            let codes = [];

            function PromotionCode(id, code, repeatDaily = false, expirationDate = null, isRemoved = false) {
                this.id = id;
                this.code = code;
                this.added = new Date();
                this.statusPerFaucet = [];
                this.repeatDaily = repeatDaily;
                this.lastExecTimeStamp = null;
                this.expirationDate = expirationDate;
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

            function addNew(code, repeatDaily = false, expirationDate = null) {
                let found = codes.find(x => x.code == code);
                if (found) {
                    found.repeatDaily = repeatDaily;
                    found.expirationDate = expirationDate;
                    found.isRemoved = false;
                } else {
                    found = new PromotionCode(codes.length, code, repeatDaily, expirationDate);
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
                    // let exists = codes.find(x => x.code.toLowerCase() == item.code.toLowerCase() && x.code.expirationDate != item.expirationDate);
                    let exists = codes.find(x => x.code.toLowerCase() == item.code.toLowerCase());
                    if (!exists) {
                        // console.log(`${item.code} does not exist`);
                        addNew(item.code, !item.oneTimeOnly, item.expirationDate);
                    } else {
                        // console.log(`${item.code} exists`);
                        // TODO: need to change status per faucet
                        // exists.expirationDate == item.expirationDate;
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
                codes = codes.filter(x => x.expirationDate && Date.parse(x.expirationDate) > Date.now());
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
                    function() {
                        $('html, body').animate({
                            scrollTop: helpers.randomInt(0, $('html, body').get(0).scrollHeight)
                        }, {
                            complete: setTimeout(interactions.addPerformed, helpers.randomMs(100, 3000)),
                            duration: helpers.randomMs(100, 1500)
                        });
                    },
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
        createSGProcessor: function() {
            let timerSpans;
            function run() {
                if(isLoading()) {
                    setTimeout(run, helpers.randomMs(5000, 10000));
                    return;
                } else if (hasPopup()) {
                    closePopup();
                    setTimeout(run, helpers.randomMs(5000, 10000));
                } else {
                    if(isMinerActive()) {
                        processRunDetails();
                    } else {
                        // Wait for captcha to be solved
                        setTimeout(run, helpers.randomMs(5000, 10000));
                        // activateMiner();
                    }
                }
            };
            function hasPopup() {
                if (document.querySelector('div.absolute.flex.top-0.right-0.cursor-pointer.p-4.text-white.md-text-gray-1')) {
                    return true;
                }
                return false;
            };
            function closePopup() {
                try {
                    shared.devlog(`@SG: closing popup`);
                    document.querySelector("div.absolute.flex.top-0.right-0.cursor-pointer.p-4.text-white.md-text-gray-1").click();
                    document.querySelector('svg.flex.w-8.h-8.fill-current').parentElement.click();
                } catch { shared.devlog(`@SG: error closing popup`); }
            };
            function isLoading() {
                return document.getElementById('loader-logo') ? true : false;
            };
            function isMinerActive() {
                timerSpans = document.querySelector('.font-bold.text-center.text-accent.w-11-12.text-18 span');

                if(timerSpans) {
                    shared.devlog(`SG: Miner is active`);
                    return true;
                } else {
                    shared.devlog(`SG: Miner is inactive`);
                    return false;
                }
                return (!!timerSpans);
            };
            function activateMiner() {
                let activateButton = document.querySelector("#region-main button.activate.block.w-full.h-full.mx-auto.p-0.rounded-full.select-none.cursor-pointer.focus-outline-none.border-0.bg-transparent");
                // let activateButton = document.querySelector('.mb-8 .wrapper button');
                if (activateButton) {
                    activateButton.click();
                    shared.devlog(`SG: Activate miner clicked`);
                    setTimeout(run, helpers.randomMs(10000, 20000));
                } else {
                    processRunDetails()
                }
            };

            function processRunDetails() {
                let result = {};
                shared.devlog(`SG: @processRunDetails`);
                result.nextRoll = helpers.addMinutes(readCountdown().toString());
                result.balance = readBalance();
                shared.closeWindow(result);
            };

            function readCountdown() {
                shared.devlog(`SG: @readCountdown`);
                let synchronizing = document.querySelector('.text-15.font-bold.text-center.text-accent'); // use
                let mins = 15;
                try {
                    let timeLeft = timerSpans.innerText.split(':');
                    if (timeLeft[0] == 'Synchronizing') {
                        //should retry to load the value
                    }
                    shared.devlog(`SG Countdown timeLeft spans:`);
                    shared.devlog(timeLeft);

                    if(timeLeft.length === 3) {
                        mins = parseInt(timeLeft[0]) * 60 + parseInt(timeLeft[1]);
                    }
                } catch (err) { shared.devlog(`SG Error reading countdown: ${err}`); }
                return mins;
            };
            function readBalance() {
                shared.devlog(`SG: @readBalance`);
                let balance = "";
                try {
                    balance = document.querySelector('span.text-accent').innerText + " BTC";
                } catch (err) { }
                return balance;
            };
            return {
                run: run,
                processRunDetails: processRunDetails
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

            function init() {
                let urlType = helpers.cf.getUrlType(window.location.href);
                switch(urlType) {
                    case K.CF.UrlType.FREE:
                        if(localeConfig.setToEnglish) {
                            let refValue = document.querySelectorAll('.nav-item a')[4].innerHTML;
                            if (refValue != 'Settings') {
                                window.location.href = '/set-language/en';
                            }
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
                navigationProcess = NavigationProcess.ROLLING;
                // To close without rolling: if (maxRollsPerVisit == 0) shared.closeWindow({});
                displayStatusUi();
                setInterval(tryClosePopup, helpers.randomMs(3000, 6000));
                setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
            };

            function doLogin() {
                navigationProcess = NavigationProcess.LOGIN;
                displayStatusUi();

                setTimeout(findLoginForm, helpers.randomMs(2000, 5000));
            };

            function isFullyLoaded() { //Waits 55 seconds max
                if(document.readyState == 'complete' || timeWaiting == -1) {
                    document.getElementById('process-status').innerHTML = 'Interacting';
                    timeWaiting = 0;
                    interact();
                } else {
                    timeWaiting = -1;
                    document.getElementById('process-status').innerHTML = 'Waiting for document fully loaded';
                    setTimeout(isFullyLoaded, helpers.randomMs(15000, 25000));
                }
            };
            function runPromotion() {
                navigationProcess = NavigationProcess.PROCESSING_PROMOTION
                displayStatusUi();
                setTimeout(findPromotionTag, helpers.randomMs(1000, 3000));
            };
            function tryClosePopup() {
                let popupBtn = document.querySelector('.popup-close');
                if (popupBtn && popupBtn.isVisible()) {
                    shared.devlog(`Closing popup`);
                    popupBtn.click();
                }
            };
            function isRollResultVisible() {
                let rollDiv = document.querySelector('.result');
                if (rollDiv && rollDiv.isVisible() && rollDiv.innerText != '') {
                }
            };
            let waitRollNumberCount = 0;
            async function waitForRollNumber() {
                shared.devlog(`Waiting for rolled number`);
                let newNumber = -1;
                try { // intento leer el rolled number
                    newNumber = [...document.querySelectorAll('.lucky-number')].map(x => x.innerText).join('');
                    newNumber = parseInt(newNumber)
                    shared.devlog(`Roll #: ${newNumber}`);
                } catch(err) {
                    shared.devlog(`Roll #: error reading it`);
                    newNumber = null;
                }
                if (newNumber === null) { // si no logro leerlo, bajo 1 en tempRollNumber
                    shared.devlog(`Roll # is null`);
                    if (tempRollNumber < 0) {
                        tempRollNumber -= 1;
                    } else {
                        tempRollNumber = -1;
                    }
                    shared.devlog(`Temp Roll Reads: ${tempRollNumber}`);
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
                        setTimeout(findCountdownOrRollButton, helpers.randomMs(1000, 2000));
                        return;
                    }
                } else {
                    waitRollNumberCount++;
                    if (waitRollNumberCount > 15) {
                        shared.devlog(`Waited too much for the rolls to stop. Forcing refresh}`);
                        setTimeout(() => { location.reload(); }, 5000);
                        return;
                    }

                    // not the same number. save new one and keep waiting
                    tempRollNumber = newNumber;
                    await wait(3000);
                    return waitForRollNumber();
                }

            };
            function findCountdownOrRollButton() {
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
                    } catch (err) { shared.devlog(`Error on alt logic of CF roll: ${err}`); }
                } else {
                    if (timeWaiting/1000 > shared.getConfig()['defaults.timeout'] * 60) {
                        shared.closeWithError(K.ErrorType.TIMEOUT, '');
                        return;
                    }

                    timeWaiting += 3000;
                    setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
                }
            };
            function findLoginForm() {
                if ( document.querySelector('div.login-wrapper').isVisible() ) {
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
                            document.querySelector('.login-wrapper input[name="email"]').value = shared.getConfig()['cf.credentials.email'];
                            document.querySelector('.login-wrapper input[name="password"]').value = shared.getConfig()['cf.credentials.password'];
                            document.querySelector('.login-wrapper button.login').click();
                            loopingForErrors = true;
                        } else {
                            if(document.querySelector('.login-wrapper input[name="email"]').value != '' && document.querySelector('.login-wrapper input[name="password"]').value != '') {
                                document.querySelector('.login-wrapper button.login').click();
                                document.getElementById('process-status').innerHTML = 'Processing';
                                loopingForErrors = true;
                            } else {
                                document.getElementById('process-status').innerHTML = 'Waiting for credentials...';
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
                countdown = document.querySelectorAll('.timeout-wrapper');
                return (countdown.length > 0 && countdown[0].isVisible());
            };
            function isRollButtonVisible() {
                rollButton = document.querySelectorAll('.main-button-2.roll-button.bg-2');
                return (rollButton.length > 0 && rollButton[0].isVisible());
            };
            function roll() {
                document.getElementById('process-status').innerHTML = 'Roll triggered';
                rollButton[0].click();
                tempRollNumber = -1;
                setTimeout(waitForRollNumber, helpers.randomMs(4000, 7000));
            }
            function isPromotionTagVisible() {
                let pTag;
                try {
                    pTag = document.querySelectorAll('div.header-wrapper')[0];
                } catch(err) {
                    return false;
                }
                if (pTag) {
                    promotionTag = pTag;
                    return true;
                }
                return false;
            };
            function findPromotionTag() {
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
                let minsElement = document.querySelector('.timeout-container .minutes .digits');
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
                    claimed = document.querySelector('.result').innerHTML;
                    claimed = claimed.trim();
                    claimed = claimed.slice(claimed.lastIndexOf(" ") + 1);
                } catch(err) { }
                return claimed;
            };
            function readRolledNumber() {
                let number = 0;
                try {
                    number = [...document.querySelectorAll('.lucky-number')].map(x => x.innerText).join('');
                    number = parseInt(number);
                } catch(err) { }
                return number;
            };
            function readBalance() {
                let balance = "";
                try {
                    balance = document.querySelector('.navbar-coins.bg-1 a').innerText;
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
        createFBProcessor: function() {
            let countdownMinutes;
            let timeout = new Timeout(this.maxSeconds);
            let captcha = new HCaptchaWidget();

            function run() {
                setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
            };
            function findCountdownOrRollButton() {
                if ( isCountdownVisible() ) {
                    timeout.restart();
                    countdownMinutes = +document.querySelectorAll('.free_play_time_remaining.hasCountdown .countdown_amount')[0].innerHTML + 1;
                    let result = {};
                    result.balance = readBalance();
                    result.nextRoll = helpers.addMinutes(countdownMinutes.toString());

                    shared.closeWindow(result);
                    return;
                }

                if ( isRollButtonVisible() ) {
                    // if (shared.getConfig()['fb.activateRPBonus']) {
                    //     if (!document.getElementById('bonus_container_free_points')) {
                    //         document.querySelector('a.rewards_link').click();
                    //         activateBonus(0);
                    //     }
                    // }

                    try {
                        let doBonus = false; // true;
                        if (doBonus) {
                            if (!document.getElementById('bonus_span_free_wof')) {
                                RedeemRPProduct('free_wof_5');
                                setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
                                return;
                            }
                        }
                    } catch { }

                    /* For 'Play without captcha accounts' */
                    if (!captcha.isUserFriendly) {
                        clickRoll()
                    } else {
                        captcha.isSolved().then(() => { clickRoll(); });
                    }
                } else {
                    setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
                }
            };
            function isCountdownVisible() {
                return document.querySelectorAll('.free_play_time_remaining.hasCountdown .countdown_amount').length > 0;
            };
            function isHCaptchaVisible() {
                let hCaptchaFrame = document.querySelector('.h-captcha > iframe');
                if (hCaptchaFrame && hCaptchaFrame.isVisible()) {
                    return true;
                }
                return false;
            };
            function isRollButtonVisible() {
                return document.getElementById('free_play_form_button').isVisible();
            };
            function clickRoll() {
                try {
                    document.getElementById('free_play_form_button').click();
                    setTimeout(processRunDetails, helpers.randomMs(3000, 10000));
                } catch (err) {
                    shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
                }
            };
            function processRunDetails() {
                if (document.getElementById('winnings').isVisible()) {
                    closePopup();

                    let result = {};
                    result.claimed = readClaimed();
                    result.balance = readBalance();
                    if(result.claimed != 0) {
                        result.rolledNumber = readRolledNumber();
                    }
                    shared.closeWindow(result);
                    return;
                }

                if (document.querySelector('.free_play_result_error').isVisible()) {
                    shared.closeWithError(K.ErrorType.ROLL_ERROR, document.querySelector('.free_play_result_error').innerHTML);
                    return;
                }

                if(document.getElementById('free_play_error').isVisible()) {
                    shared.closeWithError(K.ErrorType.ROLL_ERROR, document.querySelector('.free_play_error').innerHTML);
                    return;
                }

                if (document.getElementById('same_ip_error').isVisible()) {
                    shared.closeWithError(K.ErrorType.ROLL_ERROR, document.getElementById('same_ip_error').innerHTML);
                    return;
                }

                setTimeout(processRunDetails, helpers.randomMs(5000, 6000));
            };
            function closePopup() {
                let closePopupBtn = document.querySelector('.reveal-modal.open .close-reveal-modal');
                if (closePopupBtn) {
                    closePopupBtn.click();
                }
            };
            function readRolledNumber() {
                let rolled = 0;
                try {
                    rolled = parseInt([... document.querySelectorAll('#free_play_digits span')].map( x => x.innerHTML).join(''));
                } catch { }
                return rolled;
            };
            function readBalance() {
                let balance = 0;
                try {
                    balance = document.getElementById('balance').innerHTML;
                } catch { }
                return balance;
            };
            function readClaimed() {
                let claimed = 0;
                try {
                    claimed = document.getElementById('winnings').innerHTML;
                } catch { }
                return claimed;
            };
            //             function activateBonus(i) {
            //                 if(document.querySelector('#reward_point_redeem_result_container_div .reward_point_redeem_result_error')) {
            //                     let closeBtn = document.querySelector('#reward_point_redeem_result_container_div .reward_point_redeem_result_box_close')
            //                     if (closeBtn.isVisible()) {
            //                         closeBtn.click();
            //                     }
            //                 } else if (document.querySelector('#reward_point_redeem_result_container_div .reward_point_redeem_result_success')) {
            //                     let closeBtn = document.querySelector('#reward_point_redeem_result_container_div .reward_point_redeem_result_box_close')
            //                     if (closeBtn.isVisible()) {
            //                         closeBtn.click();
            //                         document.querySelector('#free_play_link_li a').click();
            //                         setTimeout(findCountdownOrRollButton, helpers.randomMs(10000, 12000));
            //                         return;
            //                     }
            //                 }

            //                 try {
            //                     let redeemButtons = document.querySelectorAll('#free_points_rewards button');
            //                     redeemButtons[i].click();
            //                     i = i + 1;
            //                 } catch (err) {
            //                 }

            //                 if(i > 4) {
            //                     document.querySelector('#free_play_link_li a').click();
            //                     setTimeout(findCountdownOrRollButton, helpers.randomMs(10000, 12000));
            //                     return;
            //                 }
            //                 setTimeout(activateBonus.bind(null, i), 5000);
            //             };
            return {
                run: run
            };
        },
        createFPProcessor: function() {
            let timeout = new Timeout(this.maxSeconds);
            let captcha = new HCaptchaWidget();

            function init() {
                if(window.location.href.includes('ptc/view')) {
                    addDuration();
                    ptcSingle();
                } else if (window.location.href.includes('ptc')) {
                    ptcList();
                } else if (window.location.href.includes('account/login')) {
                    tryLogin();
                } else if (window.location.href.includes('page/user-admin')) {
                    window.location.href = 'https://faucetpay.io/ptc';
                }
                return;
            }

            function tryLogin() {
                let username = document.querySelector('input[name="user_name"');
                let password = document.querySelector('input[name="password"');
                let captcha = document.querySelector('.h-captcha > iframe');
                let btn = document.querySelector('button[type="submit"');
                if (username && password && btn && username.value != '' && password.value != '') {
                    //WAIT FOR CAPTCHA => THEN CLICK BTN
                    if ( captcha && captcha.getAttribute('data-hcaptcha-response').length > 0 ) {
                        btn.click();
                    } else {
                        setTimeout(tryLogin, helpers.randomMs(9000, 11000));
                    }
                } else {
                    shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
                }
            }

            function addDuration() {
                let duration = document.querySelector('#duration');
                if(duration && !isNaN(duration.innerText)) {
                    timeout.restart(parseInt(duration.innerText));
                } else {
                    setTimeout(addDuration, 10000);
                }
            }

            function ptcList() {
                let result;
                let runMsgDiv = document.querySelector('.alert.alert-info');
                if (runMsgDiv) {
                    let runMsg = runMsgDiv.innerHTML;
                    if (runMsg.includes('invalid captcha')) {
                        // Warn? Usually an error if ptcList is refreshed
                    } else if (runMsg.includes('Good job')) {
                        // "Good job! You have been credited with 0.00000001 BTC."
                        try {
                            let idx = runMsg.search(/\d/);
                            let claimed = parseFloat(runMsg.slice(idx, idx + 10));
                            result = shared.getResult();
                            result.claimed = (result.claimed ?? 0) + claimed;
                            // result.nextRoll = helpers.addMs(helpers.getRandomMs(shared.getConfig()['fp.hoursBetweenRuns'] * 60, 2)); // Wait hoursBetweenRuns +/- 1% //TODO: SLEEP CHECK
                            shared.updateWithoutClosing(result, 'WORKING');
                        } catch { }
                    }
                }

                if ([...document.querySelectorAll('b')].filter(x => x.innerText.includes('Whoops!')).length > 0) {
                    result = shared.getResult();
                    shared.closeWindow(result);
                    return;
                }

                let adButtons = [...document.querySelectorAll('button')].filter(x => x .innerHTML.includes('VISIT AD FOR'));

                if (adButtons.length > 0) {
                    if (shared.getConfig()['fp.randomPtcOrder']) {
                    adButtons[helpers.randomInt(0, adButtons.length-1)].click();
                    } else {
                        adButtons[0].click();
                    }
                    return;
                }

                setTimeout(ptcList, helpers.randomMs(10000, 12000));
            }

            function ptcSingle() {
                if(document.querySelector('input[name="complete"]').isVisible()) {
                    captcha.isSolved().then(() => { clickClaim(); });
                } else if (document.querySelector('body').innerText.toLowerCase().includes('ad does not exist')) {
                    window.location.href = 'https://faucetpay.io/ptc';
                } else {
                    setTimeout(ptcSingle, helpers.randomMs(5000, 6000));
                }
            }

            function clickClaim() {
                let input = document.querySelector('input[name="complete"]');
                input.focus();
                input.onclick = '';
                input.click();
                //force close with timeout in case it's still opened
                setTimeout(shared.closeWithError.bind(null, 'TIMEOUT', 'Timed out after clicking a CLAIM button.'), helpers.minToMs(shared.getConfig()['defaults.timeout']));
            }

            return {
                init: init
            };
        },
        createBigBtcProcessor: function() {
            let timeout = new Timeout(this.maxSeconds);
            let countdownMinutes;
            let captcha = new HCaptchaWidget();
            let selectElement = {
                loadingDiv: function() {
                    let loading = document.querySelector('#loading');
                    if (loading && loading.isVisible()) {
                        return true;
                    } else {
                        return false;
                    }
                },
                addressInput: function() {
                    return document.querySelector('#login input[name="address"]');
                },
                loginButton: function() {
                    return document.querySelector('#login input[type="submit"]');
                },
                claimButton: function() {
                    return document.getElementById('claimbutn');
                },
                countdown: function() { // "You have to wait\n60 minutes"
                    let cd = document.getElementById('countdown');
                    if(cd && cd.isVisible()) {
                        return parseInt(cd.innerText);
                    }
                    return null;
                },
                claimedAmount: function() {
                    let elm = document.querySelector('.alert.alert-success.pulse'); //"Yuppie! You won 2 satoshi!"
                    if(elm && elm.isVisible()) {
                        let val = parseInt(elm.innerText.replace(/\D/g, ''));
                        if (Number.isInteger(val)) {
                            val = val / 100000000;
                        }

                        return val;
                    } else {
                        return null;
                    }
                },
                balance: function() {
                    let elm = document.querySelector('a b');
                    if (elm && elm.isVisible()) {
                        let val = parseInt(elm.innerText.replace(',', ''));
                        if (Number.isInteger(val)) {
                            val = val / 100000000;
                        }

                        return val;
                    } else {
                        return null;
                    }
                },
                error: function () {
                    return null;
                }
            };

            function init() {
                // anti ad blocker workaround
                window.scrollTo(0, document.body.scrollHeight);
                let m = document.getElementById('main'); if (m) { m.style.display='block'; }
                m = document.getElementById('block-adb-enabled'); if (m) { m.style.display='none'; }
                m = document.getElementById('ielement'); if (m) { m.style.display='block'; }
                setInterval(() => {
                    let frames = [...document.querySelectorAll('iframe')];
                    frames.forEach(x => {
                        if (!x.src.includes('hcaptcha')) {
                            x.remove()
                        }
                    });
                }, 5000);
            
                if (window.location.href.includes('/faucet')) {
                    setTimeout(runFaucet, helpers.randomMs(12000, 14000));
                    return;
                } else {
                    setTimeout(run, helpers.randomMs(3000, 5000));
                    return;
                }
            }

            function run() {
                try {
                    setTimeout(waitIfLoading, helpers.randomMs(12000, 15000));
                } catch (err) {
                    shared.closeWithErrors(K.ErrorType.ERROR, err);
                }
            };
            function doLogin() {
                let address = selectElement.addressInput();
                if(address && address.value != shared.getCurrent().params.address) {
                    address.value = shared.getCurrent().params.address;
                } else {
                    selectElement.loginButton().click();
                    return;
                }
                setTimeout( doLogin , helpers.randomMs(1000, 2000));
            };
            function waitIfLoading() {
                if ( !selectElement.loadingDiv() ) {
                    shared.devlog(`BigBtc: doing log in`);
                    doLogin();
                    return;
                } else {
                    shared.devlog(`BigBtc: waiting for login form`);
                }

                setTimeout(waitIfLoading, helpers.randomMs(5000, 7000));
            };
            function runFaucet() {
                let claimedAmount = selectElement.claimedAmount();
                if(claimedAmount) {
                    shared.devlog(`@runFaucet: has claimed amount: ${claimedAmount}`);
                    processRunDetails();
                    return;
                } else if (selectElement.countdown()) {
                    // need to wait
                    shared.devlog(`@runFaucet: has countdown: ${selectElement.countdown()}`);
                    let result = {};

                    shared.closeWindow(result);
                } else {
                    shared.devlog(`BigBtc: waiting for captcha`);
                    captcha.isSolved().then(() => { clickClaim(); });
                }
            }
            function clickClaim() {
                try {
                    shared.devlog('Clicking roll button');
                    selectElement.claimButton().click();
                    return;
                } catch (err) {
                    shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
                }
            };
            function processRunDetails() {
                shared.devlog(`BigBtc: processing results`);
                let claimedAmount = selectElement.claimedAmount();
                let balance = selectElement.balance();
                let countdown = selectElement.countdown();

                if (claimedAmount && balance) {
                    let result = {};
                    result.claimed = claimedAmount;
                    result.balance = balance;
                    // result.nextRoll = getDelayedNext();

                    shared.closeWindow(result);
                    return;
                }

                setTimeout(processRunDetails, helpers.randomMs(5000, 6000));
            };

            return {
                init: init
            };
        },
        createBestChangeProcessor: function() {
            let timeout = new Timeout(this.maxSeconds);
            let countdownMinutes;
            let captcha = new HCaptchaWidget({selector: '.hcaptcha > iframe'});
            let elements = {
                captcha: function() {
                    return document.querySelector('.hcaptcha > iframe');
                },
                container: function() {
                    return document.querySelector('#info_bonus');
                },
                containerOpener: function() {
                    return document.querySelector('#tab_bonus a');
                },
                addressInput: function() {
                    return document.querySelector('#bonus_purse');
                },
                claimButton: function() {
                    return document.querySelector('#bonus_button');
                },
                countdown: function() { // Time left: mm:ss
                    let elm = document.querySelector('#bonus_button');
                    try {
                        if (elm.value) {
                            let timeLeft = elm.value.split(':');
                            if (timeLeft.length > 1) {
                                return parseInt(timeLeft[1]);
                            }
                        }
                    } catch (err) {
                        return null;
                    }
                },
                claimedAmount: function() {
                    let elm = document.querySelector("#bonus_status b");
                    try {
                        let sats = elm.innerText.replace(/\D/g, '');
                        return sats / 100000000;
                    } catch (err) {
                        return null;
                    }
                },
                balance: function() {
                    let elm = document.querySelector("#faucet_unpaid_balance b");
                    try {
                        let sats = elm.innerText.replace(/\D/g, '');
                        return sats / 100000000;
                    } catch (err) {
                        return null;
                    }
                }
            };

            function init() {
                run();
            }

            function run() {
                try {
                    if (!elements.container().isUserFriendly()) {
                        let co = elements.containerOpener();
                        if(co.isUserFriendly()) {
                            co.onclick = co.onmousedown;
                            co.click();
                        }
                    }
                    setTimeout(findCountdownOrRoll, helpers.randomMs(4000, 5000));
                } catch (err) {
                    shared.closeWithErrors(K.ErrorType.ERROR, err);
                }
            };
            function findCountdownOrRoll() {
                let countdown = elements.countdown();
                if(countdown) {
                    let result = { };
                    result.nextRoll = helpers.addMinutes(countdown.toString());

                    shared.closeWindow(result);
                    return;
                }

                let ai = elements.addressInput();

                if (ai.isUserFriendly()) {
                    if (ai.value != shared.getCurrent().params.address) {
                        ai.value = shared.getCurrent().params.address;
                    }
                    captcha.isSolved().then(() => { clickClaim(); });
                    return;
                }

                setTimeout(findCountdownOrRoll, helpers.randomMs(10000, 12000));
            };

            function clickClaim() {
                try {
                    shared.devlog('Clicking claim button');
                    let btn = elements.claimButton();
                    if(btn.isUserFriendly()) {
                        shared.devlog('Button found');
                        btn.click();
                        setTimeout(processRunDetails, helpers.randomMs(4000, 8000));
                    } else {
                        shared.devlog('Button not found. Retrying in 5 secs');
                        setTimeout(clickClaim, helpers.randomMs(4000, 8000));
                    }
                    return;
                } catch (err) {
                    shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
                }
            };

            function processRunDetails() {
                let claimedAmount = elements.claimedAmount();
                let balance = elements.balance();

                if (claimedAmount && balance) {
                    let result = {};
                    result.claimed = claimedAmount;
                    result.balance = balance;
                    // result.nextRoll = helpers.addMinutes(60);

                    shared.closeWindow(result);
                    return;
                }

                setTimeout(processRunDetails, helpers.randomMs(5000, 6000));
            };

            return {
                init: init
            };
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

    function detectWeb() {
        if(!shared.isOpenedByManager()) {
            shared.devlog(`${window.location.href} dismissed`);
            return;
        }
        instance = K.LOCATION.SITE;
        shared.devlog(`${window.location.href} accepted`);

        let typeFromManager = shared.getCurrent().type;

        siteTimer = new Timer({ isManager: false, delaySeconds: 20, uuid: shared.getProp('schedule'), webType: typeFromManager });
        switch( typeFromManager ) {
            case K.WebType.STORMGAIN:
                SiteProcessor = objectGenerator.createSGProcessor();
                setTimeout(SiteProcessor.run, helpers.randomMs(10000, 20000));
                break;
            case K.WebType.CRYPTOSFAUCETS:
                SiteProcessor = objectGenerator.createCFProcessor();
                setTimeout(SiteProcessor.init, helpers.randomMs(1000, 3000));
                break;
            case K.WebType.FREEBITCOIN:
                SiteProcessor = objectGenerator.createFBProcessor();
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
                SiteProcessor = objectGenerator.createFPProcessor();
                setTimeout(SiteProcessor.init, helpers.randomMs(2000, 5000));
                break;
            case K.WebType.BIGBTC:
                SiteProcessor = objectGenerator.createBigBtcProcessor();
                setTimeout(SiteProcessor.init, helpers.randomMs(2000, 4000));
                break;
            case K.WebType.BESTCHANGE:
                SiteProcessor = objectGenerator.createBestChangeProcessor();
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
            case K.WebType.BSCADS:
                SiteProcessor = new BscAds();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            case K.WebType.CTOP:
                SiteProcessor = new CTop();
                setTimeout(() => { SiteProcessor.init() }, helpers.randomMs(3000, 5000));
                break;
            default:
                break;
        }
    }

    {{ui/index.js}}

    class EventEmitter {
        constructor() {
            this.events = {};
        }
      
        on(eventName, callback) {
            if (!this.events[eventName]) {
                this.events[eventName] = [];
            }
            this.events[eventName].push(callback);
        }
      
        emit(eventName, data) {
            const eventCallbacks = this.events[eventName];
            if (eventCallbacks) {
                eventCallbacks.forEach(callback => {
                    callback(data);
                });
            }
        }
    }

    class Timeout {
        constructor(seconds) {
            this.startedAt;
            this.interval;
            this.cb = (() => { shared.closeWithError(K.ErrorType.TIMEOUT, '') });
            if (seconds) {
                this.wait = seconds;
            } else {
                let paramTimeout =  shared.getParam('timeout');
                if (paramTimeout) {
                    this.wait = paramTimeout * 60;
                } else {
                    this.wait = shared.getConfig()['defaults.timeout'] * 60
                }
            }
            this.restart();
        }

        get elapsed() {
            return Date.now() - this.startedAt;
        }

        restart(addSeconds = false) {
            if(this.interval) {
                clearTimeout(this.interval);
            }
            this.startedAt = Date.now();
            if(addSeconds) {
                this.wait = this.wait + addSeconds;
            }
            this.interval = setTimeout( () => { this.cb() }, this.wait * 1000);
        }
    }

    class Timer {
        constructor(params) {
            Object.assign(this, params);
            if(!useTimer || (this.webType && !Timer.webTypes().includes(this.webType))) {
                return;
            }
            this.delay = this.delaySeconds * 1000;

            if(!this.isManager) {
                this.tick();
                this.interval = setInterval(
                    () => { this.tick() }, this.delay);
            }
        }

        static webTypes() {
            return [K.WebType.FREELITECOIN, K.WebType.FREEETHEREUMIO, K.WebType.BIGBTC, K.WebType.FCRYPTO, K.WebType.FPB, K.WebType.BSCADS]
        };

        startCheck(webType) {
            this.webType = webType;
            if(!useTimer || (webType && !Timer.webTypes().includes(webType))) {
                return;
            }
            persistence.save(this.uuid + '_lastAccess', Date.now());
            this.interval = setInterval(() => {
                this.isAlive();
            }, this.delay);
        }

        stopCheck() {
            if(!useTimer) {
                return;
            }
            clearInterval(this.interval);
        }

        tick() {
            if(!useTimer) {
                return;
            }
            persistence.save(this.uuid + '_lastAccess', Date.now());
        }

        isAlive() {
            if(!useTimer) {
                return;
            }
            let now = Date.now();
            let newAccess = persistence.load(this.uuid + '_lastAccess');
            if(newAccess && (now - newAccess > this.delay)) {
                //Close working tab and force restart
                // shared.devlog(`Timer is closing the working tab`);
                // shared.addError(K.ErrorType.FORCE_CLOSED, 'Site was unresponsive or redirected', this.uuid);
                // manager.closeWorkingTab(schedule);
                shared.devlog(`Trying to reload original site instead of FORCE_CLOSED`);
                manager.reloadWorkingTab(schedule);
            }
        }
    }


    const wait = ms => new Promise(resolve => setTimeout(resolve, ms || 3000));

    {{crawlers/index.js}}

    let landing, instance, siteTimer;
    let useTimer;
    async function init() {
        // persistence = objectGenerator.createPersistence();
        eventer = new EventEmitter();
        persistence = new Persistence();
        shared = objectGenerator.createShared();
        useTimer = shared.getConfig()['defaults.extraInterval'];
        if (window.location.host === 'criptologico.com') {
            landing = window.location.host;
            instance = K.LOCATION.MANAGER;
            shared.devlog('Manager Reloaded');
            manager = objectGenerator.createManager();
            CFPromotions = objectGenerator.createCFPromotions();
            uiRenderer = new UiRenderer();
            uiRenderer.initialize();
            ui = objectGenerator.createUi();
            CFHistory = objectGenerator.createCFHistory();

            await manager.init();
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
