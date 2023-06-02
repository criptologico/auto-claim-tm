let helpers = {
    hasValue: function (val) {
        return val !== null && val !== undefined;
    },
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
