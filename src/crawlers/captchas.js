class CaptchaWidget extends CrawlerWidget {
    constructor(params) {
        super(params);
    }

    solve() { return true; }

    async isSolved() { return false; }
}

class RecaptchaWidget extends CaptchaWidget {
    constructor(params) {
        // if (!params || !params.selector) {
        //     throw new Error('CrawlerWidget requires a selector parameter');
        // }
        this.context = this.context || document;
        let defaultParams = {
            // selector: '.h-captcha > iframe',
            waitMs: [1000, 5000],
            timeoutMs: 4 * 60 * 1000
        };
        for (let p in params) {
            defaultParams[p] = params[p];
        }
        Object.assign(this, defaultParams);
    }

    get isUserFriendly() {
        // Custom for recaptcha
        this.element = grecaptcha;
        return this.element;
    }

    async isSolved() {
        return wait().then( () => {
            if (this.isUserFriendly && this.element.hasOwnProperty('getResponse') && (typeof(this.element.getResponse) == 'function')
                && this.element.getResponse().length > 0) {
                return Promise.resolve(true);
            }
            return this.isSolved();
        });
    }
}

class HCaptchaWidget extends CaptchaWidget {
    constructor(params) {
        let defaultParams = {
            selector: '.h-captcha > iframe',
            waitMs: [1000, 5000],
            timeoutMs: 4 * 60 * 1000
        };
        for (let p in params) {
            defaultParams[p] = params[p];
        }
        super(defaultParams);
    }

    async isSolved() {
        return wait().then( () => {
            if (this.isUserFriendly && this.element.hasAttribute('data-hcaptcha-response') && this.element.getAttribute('data-hcaptcha-response').length > 0) {
                return Promise.resolve(true);
            }
            return this.isSolved();
        });
    }
}

class BKCaptchaWidget extends CaptchaWidget {
    constructor() {
        let defaultParams = {
            selector: 'img[src="antibot.php"]',
            waitMs: [1000, 5000],
            timeoutMs: 4 * 60 * 1000
        };
        super(defaultParams);
        this._imgProcessor;
        this._characters = [];
    }

    charList() {
        return [{"answer":"g","width":8,"height":9,"bools":[false,true,true,true,true,true,false,true,true,true,false,false,false,true,true,true,true,true,false,false,false,true,true,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false,false,true,true,false,false,false,false,false,false,false,true,true,true,true,true,true,false,true,true,false,false,false,false,true,true,false,true,true,true,true,true,true,false]},
                {"answer":"5","width":8,"height":10,"bools":[true,true,true,true,true,true,true,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false]},
                {"answer":"W","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,true,true,true,true,true,true,true,true,true,false,false,true,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"O","width":8,"height":10,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false]},
                {"answer":"N","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,true,false,false,false,true,true,true,true,true,true,false,false,true,true,true,true,true,true,false,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,false,true,true,true,true,true,true,false,false,false,true,true,true,true,true,false,false,false,true,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"T","width":8,"height":10,"bools":[true,true,true,true,true,true,true,true,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false]},
                {"answer":"q","width":8,"height":9,"bools":[false,false,true,true,true,false,true,true,false,true,true,false,false,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,true,false,false,true,true,true,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true]},
                {"answer":"l","width":4,"height":10,"bools":[true,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,true,true,true,true]},
                {"answer":"B","width":8,"height":10,"bools":[true,true,true,true,true,true,false,false,true,true,false,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,true,true,false,true,true,true,true,true,true,false,false,true,true,false,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,true,true,false,true,true,true,true,true,true,false,false]},
                {"answer":"3","width":8,"height":10,"bools":[false,false,true,true,true,true,false,false,true,true,false,false,false,true,true,false,false,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,true,true,true,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false,false]},
                {"answer":"s","width":8,"height":7,"bools":[false,true,true,true,true,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,false,false,false,true,true,true,true,true,true,false,false,false,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,true,true,true,true,false]},
                {"answer":"p","width":8,"height":9,"bools":[true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,false,false,true,true,false,true,true,false,true,true,true,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false]},
                {"answer":"L","width":7,"height":10,"bools":[true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,true,true,true]},
                {"answer":"Z","width":7,"height":10,"bools":[false,true,true,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,true,true,true]},
                {"answer":"F","width":8,"height":10,"bools":[true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,true,true,true,true,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false]},
                {"answer":"p","width":8,"height":9,"bools":[true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,false,false,true,true,false,true,true,false,true,true,true,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false]},
                {"answer":"T","width":8,"height":10,"bools":[true,true,true,true,true,true,true,true,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false]},
                {"answer":"8","width":8,"height":10,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false]},
                {"answer":"P","width":8,"height":10,"bools":[true,true,true,true,true,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false]},
                {"answer":"J","width":6,"height":10,"bools":[false,false,true,true,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,true,false,false,false,true,true,true,true,false,true,true,false,false,true,true,true,false,false]},
                {"answer":"y","width":8,"height":9,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,true,false,false,true,true,true,false,true,true,true,false,false,false,false,false,true,true,false,true,true,true,true,true,true,false]},
                {"answer":"r","width":8,"height":7,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false]},
                {"answer":"R","width":8,"height":10,"bools":[true,true,true,true,true,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,false,true,true,true,true,true,false,false,false,true,true,false,false,true,true,false,false,true,true,false,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"M","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"d","width":8,"height":10,"bools":[false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,true,true,true,false,true,true,false,true,true,false,false,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,true,false,false,true,true,true,false,true,true]},
                {"answer":"E","width":7,"height":10,"bools":[true,true,true,true,true,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,true,true,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,true,true,true]},
                {"answer":"7","width":8,"height":10,"bools":[true,true,true,true,true,true,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false]},
                {"answer":"Z","width":7,"height":10,"bools":[true,true,true,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,true,true,true]},
                {"answer":"l","width":4,"height":10,"bools":[true,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,true,true,true,true]},
                {"answer":"K","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,true,true,false,true,true,false,false,true,true,false,false,true,true,false,true,true,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,false,true,true,false,false,true,true,false,false,true,true,false,false,false,true,true,false,true,true,false,false,false,false,true,true]},
                {"answer":"6","width":8,"height":10,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,false,true,true,false,false,false,false,false,false,true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,false,false,false,false,true,true,true,true,false,false]},
                {"answer":"H","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"5","width":8,"height":10,"bools":[true,true,true,true,true,true,true,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false]},
                {"answer":"Y","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false]},
                {"answer":"d","width":8,"height":10,"bools":[false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,true,true,true,false,true,true,false,true,true,false,false,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,true,false,false,true,true,true,false,true,true]},
                {"answer":"p","width":8,"height":9,"bools":[true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,false,false,true,true,false,true,true,false,true,true,true,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false]},
                {"answer":"z","width":6,"height":7,"bools":[true,true,true,true,true,true,false,false,false,false,true,true,false,false,false,true,true,false,false,false,true,true,false,false,false,true,true,false,false,false,true,true,false,false,false,false,true,true,true,true,true,true]},
                {"answer":"n","width":8,"height":7,"bools":[true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"a","width":8,"height":7,"bools":[false,false,true,true,true,true,true,false,false,true,true,false,false,false,true,true,false,false,false,false,false,false,true,true,false,true,true,true,true,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,true,true,true,false,true,true,true,true,false,true,true]},
                {"answer":"8","width":8,"height":10,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false]},
                {"answer":"t","width":8,"height":9,"bools":[false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,true,true,true,true,true,true,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false]},
                {"answer":"q","width":8,"height":9,"bools":[false,false,true,true,true,false,true,true,false,true,true,false,false,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,true,false,false,true,true,true,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true]},
                {"answer":"a","width":8,"height":7,"bools":[false,false,true,true,true,true,true,false,false,true,true,false,false,false,true,true,false,false,false,false,false,false,true,true,false,true,true,true,true,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,true,true,true,false,true,true,true,true,false,true,true]},
                {"answer":"Z","width":7,"height":10,"bools":[true,true,true,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,true,true,true,true]},
                {"answer":"1","width":6,"height":10,"bools":[false,false,true,true,false,false,false,true,true,true,false,false,true,true,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,true,true,true,true,true,true]},
                {"answer":"m","width":8,"height":7,"bools":[true,false,true,true,false,true,true,false,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true]},
                {"answer":"l","width":4,"height":10,"bools":[true,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,true,true,true,true]},
                {"answer":"q","width":8,"height":9,"bools":[false,false,true,true,true,false,true,true,false,true,true,false,false,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,true,false,false,true,true,true,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true]},
                {"answer":"C","width":8,"height":10,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,true,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false]},
                {"answer":"a","width":8,"height":7,"bools":[false,false,true,true,true,true,true,false,false,true,true,false,false,false,true,true,false,false,false,false,false,false,true,true,false,true,true,true,true,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,true,true,true,false,true,true,true,true,false,true,true]},
                {"answer":"2","width":8,"height":10,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,true,true,true,true]},
                {"answer":"h","width":8,"height":10,"bools":[true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"F","width":7,"height":10,"bools":[true,true,true,true,true,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,true,true,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false]},
                {"answer":"c","width":8,"height":7,"bools":[false,false,true,true,true,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false]},
                {"answer":"P","width":8,"height":10,"bools":[true,true,true,true,true,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,false,false,false,false,false,false,false]},
                {"answer":"r","width":8,"height":7,"bools":[true,true,false,true,true,true,false,false,false,true,true,true,false,false,true,true,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false]},
                {"answer":"Y","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false]},
                {"answer":"S","width":8,"height":10,"bools":[false,true,true,true,true,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,false,true,true,true,true,true,true,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,true,true,true,true,false]},
                {"answer":"u","width":8,"height":7,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,true,false,false,true,true,true,false,true,true]},
                {"answer":"M","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,true,false,false,true,true,true,true,true,true,true,true,true,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"S","width":8,"height":10,"bools":[false,true,true,true,true,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,false,true,true,true,true,true,true,false,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,true,true,true,true,false]},
                {"answer":"g","width":8,"height":9,"bools":[false,true,true,true,true,true,false,true,true,true,false,false,false,true,true,true,true,true,false,false,false,true,true,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false,false,true,true,false,false,false,false,false,false,false,true,true,true,true,true,true,false,true,true,false,false,false,false,true,true,false,true,true,true,true,true,true,false]},
                {"answer":"U","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,false,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false]},
                {"answer":"k","width":7,"height":10,"bools":[true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,true,true,false,true,true,false,true,true,false,false,true,true,true,true,false,false,false,true,true,true,true,false,false,false,true,true,false,true,true,false,false,true,true,false,false,true,true,false,true,true,false,false,false,true,true]},
                {"answer":"4","width":8,"height":10,"bools":[false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,false,false,false,false,true,true,true,true,false,false,false,true,true,false,true,true,false,false,true,true,false,false,true,true,false,true,true,false,false,false,true,true,false,true,true,true,true,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false]},
                {"answer":"A","width":8,"height":10,"bools":[false,false,false,true,true,false,false,false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"b","width":8,"height":10,"bools":[true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,true,true,true,false,false,true,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,true,false,false,true,true,false,true,true,false,true,true,true,false,false]},
                {"answer":"I","width":6,"height":10,"bools":[true,true,true,true,true,true,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,true,true,true,true,true,true]},
                {"answer":"o","width":8,"height":7,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false]},
                {"answer":"i","width":6,"height":10,"bools":[false,false,true,true,false,false,false,false,true,true,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,true,true,true,true,true,true]},
                {"answer":"C","width":8,"height":10,"bools":[false,false,true,true,true,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,true,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false]},
                {"answer":"e","width":8,"height":7,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false]},
                {"answer":"w","width":8,"height":7,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,false,true,true,false,true,true,true,true,true,true,true,true,true,true,false,true,true,false,false,true,true,false]},
                {"answer":"f","width":8,"height":10,"bools":[false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,true,true,true,true,true,true,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false]},
                {"answer":"j","width":7,"height":12,"bools":[false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,false,false,false,false,false,false,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,false,false,false,true,true,true,true,false,false,false,true,true,false,true,true,true,true,true,false]},
                {"answer":"F","width":6,"height":10,"bools":[true,true,true,true,true,true,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,true,true,true,true,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false,true,true,false,false,false,false]},
                {"answer":"x","width":8,"height":7,"bools":[true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true]},
                {"answer":"e","width":8,"height":7,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,true,true,true,false,false,false,false,false,false,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false]},
                {"answer":"G","width":8,"height":10,"bools":[false,false,true,true,true,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,true,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false]},
                {"answer":"0","width":8,"height":10,"bools":[false,false,false,true,true,false,false,false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true,false,false,false]},
                {"answer":"0","width":8,"height":10,"bools":[false,false,false,true,true,false,false,false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true,false,false,false]},
                {"answer":"D","width":8,"height":10,"bools":[true,true,true,true,true,true,false,false,true,true,false,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,true,true,false,true,true,true,true,true,true,false,false]},
                {"answer":"e","width":8,"height":7,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,true,true,true,true,true,true,false,true,false,false,false,false,false,false,false,true,true,false,false,false,true,true,false,false,true,true,true,true,true,false]},
                {"answer":"X","width":8,"height":10,"bools":[true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true,false,false,false,false,false,false,true,true,false,false,false,false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true]},
                {"answer":"Q","width":8,"height":10,"bools":[false,false,true,true,true,true,false,false,false,true,true,false,false,true,true,false,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,false,false,false,true,true,true,true,false,true,true,false,true,true,true,true,false,false,true,true,true,true,false,true,true,false,false,true,true,false,false,false,true,true,true,true,false,true]}];
    }

    async isReady() {
        return wait().then( () => {
            let img = document.querySelector(this.selector);
            if(img && img.complete) {
                shared.devlog(`@BKCaptcha isReady : true`);
                this._imgProcessor = new ImageProcessor(img);
                return Promise.resolve(true);
            }
            shared.devlog(`@BKCaptcha isReady : false`);
            return this.isReady();
        });
    }

    async isSolved() {
        shared.devlog(`@BKCaptcha isSolved`);
        return this.isReady()
            .then( () => this.solve())
            .then( (solution) => {
            document.querySelector('input[name="kodecaptcha"]').value = solution;
            return Promise.resolve(true);
        })
            .catch(err => {
            shared.devlog(`@BKCaptcha error ${err}`);
            return Promise.reject(`Error ${err}`);
        });
    }

    preProcessImage() {
        this._imgProcessor.toCanvas();
        this._imgProcessor.binarize(200);
        this._imgProcessor.invert();
        shared.devlog(`@BKCaptcha preProcessImage: finished`);
    }

    cropCharacter(startFrom = 0) {
        let imgData = this._imgProcessor.getDrawer().ctx.getImageData(startFrom, 0, this._imgProcessor.getDrawer().canvas.width - startFrom, this._imgProcessor.getDrawer().canvas.height);
        let newBounds = { left: null, right:null, top: null, bottom: null };
        let readingCharacter = false;
        let endOfCharacter = null;

        for (var x = 0; x < imgData.width; x++) {
            if (endOfCharacter) {
                newBounds.right = endOfCharacter;
                break;
            }

            let isColumnEmpty = true;
            for (var y = 0; y < imgData.height; y++) {
                var i = x * 4 + y * 4 * imgData.width;
                var pixel = { r: imgData.data[i + 0], g: imgData.data[i + 1], b: imgData.data[i + 2] };

                if (pixel.r + pixel.g + pixel.b == 0) {
                    if (newBounds.left == null || newBounds.left > x) {
                        newBounds.left = x;
                    }
                    if (newBounds.right == null || newBounds.right < x) {
                        newBounds.right = x;
                    }

                    if (newBounds.top == null || newBounds.top > y) {
                        newBounds.top = y;
                    }

                    if (newBounds.bottom == null || newBounds.bottom < y) {
                        newBounds.bottom = y;
                    }
                    readingCharacter = true;
                    isColumnEmpty = false;
                }
            }

            if (isColumnEmpty && readingCharacter) {
                endOfCharacter = x - 1;
                break;
            }
        }

        return {
            x: startFrom + newBounds.left,
            y: newBounds.top,
            width: newBounds.right - newBounds.left + 1,
            height: newBounds.bottom - newBounds.top + 1,
            nextBegins: startFrom + newBounds.right + 1
        };
    }

    splitInCharacters() {
        let chars = [];
        let i =0;
        do {
            chars.push(this.cropCharacter( i== 0 ? 0 : chars[i-1].nextBegins ) );
            let copy = document.createElement('canvas').getContext('2d');
            copy.canvas.width = chars[i].width;
            copy.canvas.height = chars[i].height;

            let trimmedData = this._imgProcessor.getDrawer().ctx.getImageData(chars[i].x, chars[i].y, chars[i].width, chars[i].height);
            copy.putImageData(trimmedData, 0, 0);

            chars[i].bools = this._imgProcessor.imgDataToBool(trimmedData);
            chars[i].dataUrl = copy.canvas.toDataURL("image/png");

            i++;
        } while(i < 5);

        this._characters = chars;
    }

    guess(charElm) {
        let bestGuess = {
            answer: '',
            blacksMatched: 0,
            blacksMissed: 0,
            percentageBlacks: 0,
            exactMatch: false
        };

        let totalPixels = charElm.width * charElm.height;
        let totalBlacks = charElm.bools.filter(x => x === true).length;
        this.charList().filter(x => x.answer != '').forEach( function (elm) {
            if (bestGuess.exactMatch) {
                return;
            }
            if (charElm.width == elm.width && charElm.height == elm.height) {
                if (charElm.bools.join(',') == elm.bools.join(',')) {
                    bestGuess = {
                        answer: elm.answer,
                        percentageBlacks: 100,
                        exactMatch: true
                    };
                    return;
                }

                let blacksMatched = 0;
                let blacksMissed = 0;
                let percentageBlacks = 0;
                for (let p = 0; p < totalPixels; p++) {
                    if (charElm.bools[p] === true || elm.bools[p] === true) {
                        if (elm.bools[p] == charElm.bools[p]) {
                            blacksMatched++;
                        } else {
                            blacksMissed++;
                        }
                    }
                }

                if (blacksMatched != 0 || blacksMissed != 0) {
                    percentageBlacks = blacksMatched/(blacksMatched + blacksMissed);
                }

                if (percentageBlacks > bestGuess.percentageBlacks) {
                    bestGuess = {
                        answer: elm.answer,
                        blacksMatched: blacksMatched,
                        blacksMissed: blacksMissed,
                        percentageBlacks: percentageBlacks
                    };
                }
            }
        });
        return bestGuess;
    }

    async solve() {
        shared.devlog(`@BKCaptcha solve`);
        let solution = '';
        if(this._imgProcessor.isImageComplete()) {
            this.preProcessImage();
            this.splitInCharacters();

            this._characters.forEach( ch => {
                let bestGuess = this.guess(ch);
                solution += bestGuess.answer;
                shared.devlog(`@BKCaptcha Guessing: ${bestGuess.answer}`);
            });
            shared.devlog(`@BKCaptcha SOLUTION: ${solution}`);
        }
        // shared.devlog(`@BKCaptcha REJECTING (WAITING)`);
        // return Promise.reject(`@BKCaptcha WAITING`);
        // return (solution.length == this._segments.qty) ? Promise.resolve(solution) : Promise.reject(solution);
        return Promise.resolve(solution);
    }
}

class NoCaptchaWidget extends CaptchaWidget {
    constructor(params) {
        let defaultParams = {
            selector: 'svg.feather-check-circle',
            waitMs: 10000
        };
        for (let p in params) {
            defaultParams[p] = params[p];
        }
        super(defaultParams);
    }

    async isSolved() {
        return wait().then( () => {
            if (this.isUserFriendly) {
                shared.devlog(`@NoCaptcha solved`);
                return Promise.resolve(true);
            }
            shared.devlog(`@NoCaptcha waiting`);
            return this.isSolved();
        });
    }
}

class GeeTestCaptchaWidget extends CaptchaWidget {
    constructor(params) {
        let defaultParams = {
            selector: '.geetest_captcha.geetest_lock_success',
            waitMs: 2000
        };
        for (let p in params) {
            defaultParams[p] = params[p];
        }
        super(defaultParams);
    }

    async isSolved() {
        shared.devlog(`@gt.isSolved`);
        return wait().then( () => {
            if (this.isUserFriendly) {
                shared.devlog(`gt solved`);
                return Promise.resolve(true);
            }
            shared.devlog(`gt waiting`);
            return this.isSolved();
        });
    }
}

class CBL01CaptchaWidget extends CaptchaWidget {
    constructor(params) {
        let defaultParams = {
            selector: '',
            waitMs: 2000
        };
        for (let p in params) {
            defaultParams[p] = params[p];
        }
        super(defaultParams);
    }

    async isReady() {
        return wait(1).then( () => {
            if(this.isUserFriendly) {
                shared.devlog(`@CBL01 isReady`);
                return Promise.resolve(true);
            }
            return wait().then( () => { this.isReady(); });
        });
    }

    async solve() {
        let answer = document.getElementById('captchainput').value;
        if (answer != '') {
            // workaround for JJJ
            if (answer.startsWith('JJJ')) {
                answer = answer.slice(3);
                document.getElementById('captchainput').value = answer;
            }

            if (answer.length != 6) {
                shared.devlog(`@CBL1 too short or too long. Refreshing`);
                document.getElementById('captchainput').value ='';
                window.location.reload();
                return wait(10000).then( () => { this.solve(); });
            } else {
                shared.devlog(`@CBL1 answer: ${answer}`);
                return wait().then( () => { return true; } );
            }
        } else {
            return wait().then( () => { this.solve(); });
        }
    }

    async isSolved() {
        return this.isReady()
            .then( () => this.solve())
            .then( (solution) => {
            return Promise.resolve(true);
        })
            .catch(err => { shared.devlog(err); })
    }
}

class D1CaptchaWidget extends CaptchaWidget {
    constructor() {
        let defaultParams = {
            selector: '#submit_captcha span',
            waitMs: [1000, 5000],
            timeoutMs: 4 * 60 * 1000
        };
        super(defaultParams);
        this.selectors = {
            submitButton: '#submit',
            answerSpan: '#submit_captcha span'
        }
        this._elements = {
            submitButton: new ButtonWidget({selector: '#submit'}),
            answerSpan: new ReadableWidget({selector: '#submit_captcha span'})
        };
    }

    async isReady() {
        return wait().then( () => {
            if(this._elements.submitButton.isUserFriendly) {
                shared.devlog(`@D1Captcha isReady`);
                return Promise.resolve(true);
            }
            shared.devlog(`@D1Captcha waiting to be ready`);
            return this.isReady();
        });
    }

    async solve() {
        if (this._elements.answerSpan.isUserFriendly) {
            let answer = this._elements.answerSpan.value;
            answer = answer ? answer.trim() : answer;
            shared.devlog(`@D1Captcha answer: ${answer}`);
            let input = document.querySelector(`input[value="${answer}"`);
            if (input) {
                shared.devlog(`@D1Captcha input for answer found!`);
                helpers.alternativeClick(input.parentElement.querySelector('i'));
                return wait().then( () => { return true; } );
            } else {
                shared.devlog(`@D1Captcha input for answer NOT FOUND!`);
                return Promise.reject(`@D1Captcha input NOT FOUND for answer: ${answer}`);
            }
        } else {
            shared.devlog(`@D1Captcha Answer span not found!!!`);
            return Promise.reject('Answer span not found!!!');
        }
    }

    async isSolved() {
        return this.isReady()
            .then( () => this.solve())
            .then( (solution) => {
            shared.devlog(`@D1Captcha => Solved`);
            return Promise.resolve(true);
        })
            .catch(err => { shared.devlog(err); })
    }
}
