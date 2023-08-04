class Faucet {
    constructor(elements, actions = {}) {
        this._url = window.location.href;
        this._timeout = new Timeout(); // this.maxSeconds);
        this._elements = elements;
        this._actions = {
            preRun: false,
            preRoll: false,
            altValidation: false,
            readClaimed: true,
            readBalance: true,
            readTimeLeft: true,
            readRolledNumber: false,
            isMultiClaim: false,
            checkIfOutOfFunds: false,
            preSaveResult: false
        }
        this._actions = { ...this._actions, ...actions };
        this._params = shared.getCurrent().params || {};
        this._result = this._actions.isMultiClaim ? (shared.getProp('tempResults') || {}) : (shared.getResult() || {});
        // Sample this._params:
        // {
        //     "address": "TK3ofbD3AyXotN2111UvnwCzr2YaW8Qmx7",
        //     "timeout": "7",
        //     "cmc": "825"
        // }
    }

    hasCloudflare() {
        let h2 = document.querySelector('h2#challenge-running');
        let stage = document.querySelector('#challenge-stage');
        if (h2 || stage) {
            return true;
        }
        return false;
    }

    useUrlListener() {
        if (window.onurlchange === null) {
            window.addEventListener('urlchange', (data) => {
                if (this._url != window.location.href) {
                    shared.devlog(`Url changed from ${this._url} to ${window.location.href}`);
                    this._url = window.location.href;
                    this.resetRun();
                }
            });
        }
    }

    resetRun() {
        wait().then( () => { this.init(); });
    }

    init() {
        throw new Error('Init not implemented!');
    }

    login() {
        throw new Error('Login not implemented!'); //return NEED_TO_LOGIN
    }

    async run(action = false) {
        if (this._actions.checkIfOutOfFunds) {
            this.checkIfOutOfFunds();
        }

        if (this._actions.preRun) {
            await wait().then( () => { this.preRun() } );;
        }

        if (!action) {
            this.detectAction().then( (resolve) => {
                shared.devlog(`@Run - Action detected: ${resolve.action}`);
                this.perform(resolve.action);
            });
        } else {
            this.perform(action);
        }
    }

    perform(action) {
        switch(action) {
            case 'doRoll':
                if(this._actions.preRoll) {
                    shared.devlog(`@Run - PREROLL`);
                    this.preRoll();
                }
                shared.devlog(`@Run - Captcha`);
                this._elements.captcha.isSolved().then(() => { this.clickRoll() });
                break;
            case 'needToWait':
                this.updateResult();
                break;
            default:
                break;
        }
    }

    async detectAction() {
        // shared.devlog(`@detectAction`);
        return wait().then( () => {
            if ( this.isCountdownVisible() ) {
                return Promise.resolve({action: 'needToWait'});
            } else if ( this.isRollButtonVisible() ) {
                return Promise.resolve({action: 'doRoll'});
            } else {
                return this.detectAction();
            }
        });
    }

    preRoll() {
        throw new Error('PreRoll not implemented!');
    }

    preRun() {
        throw new Error('PreRun not implemented!');
    }

    altValidation() {
        throw new Error('AltValidation not implemented!');
    }

    isCountdownVisible() {
        return this._elements.countdownMinutes && this._elements.countdownMinutes.isUserFriendly;
    }

    isRollButtonVisible() {
        return this._elements.rollButton && this._elements.rollButton.isUserFriendly;
    }

    clickRoll() {
        try {
            shared.devlog('Clicking roll button');
            this._elements.rollButton.element.scrollIntoView(false);
            this._elements.rollButton.click();
            this.validateRun();
            // setTimeout(() => { this.validateRun() }, helpers.randomMs(10000, 12000));
        } catch (err) {
            shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
        }
    }

    failureValidation() {
        throw new Error('FailureValidation not implemented!');
    }

    async validateRun() {
        return wait(this._actions.useFailureValidation ? 6000 : null).then( () => {
            if (this._actions.useFailureValidation) {
                shared.devlog('@Doing FailureValidation');
                if (this.failureValidation()) {
                    shared.devlog('@FailureValidation true => @Incorrect captcha');
                    return;
                }
            }
            if (this._elements.success?.isUserFriendly) {
                shared.devlog('Successful run');
                return this.updateResult();
            } else if(this._actions.altValidation) {
                if(this.altValidation()) {
                    shared.devlog('Alt validated');
                    return this.updateResult();
                }
            }
            return wait(2000).then( () => { this.validateRun() });
        });
    }

    async updateResult() {
        // if (!this._actions.isMultiClaim) {
        if(this._actions.readClaimed) {
            this._result.claimed = this.readClaimed();
        }
        if(this._actions.readBalance) {
            this._result.balance = this.readBalance();
        }
        if(this._actions.readTimeLeft) {
            this._result.nextRoll = this.readNextRoll();
        }
        if(this._actions.readRolledNumber) {
            this._result.rolledNumber = this.readRolledNumber();
        }
        shared.devlog(`Result: ${JSON.stringify(this._result)}`);
        // }
        if (this._actions.isMultiClaim) {
            shared.devlog(`@updateResult as MultiClaim`);
            shared.setProp('tempResults', this._result);
            return this._actions.postRun ? this.postRun() : true;
        }
        if (this._actions.preSaveResult) {
            this.preSaveResult();
        }
        if (this._actions.updateWithoutClosing) {
            shared.updateWithoutClosing(this._result);
            return this._actions.postRun ? this.postRun() : true;
        } else {
            shared.closeWindow(this._result);
        }
    }

    readNextRoll() {
        try {
            if (this._elements.countdownMinutes && this._elements.countdownMinutes.isUserFriendly) {
                shared.devlog(`@readNextRoll: ${helpers.addMinutes(this._elements.countdownMinutes.timeLeft)}`);
                return helpers.addMinutes(this._elements.countdownMinutes.timeLeft);
            }
        } catch (err) { shared.devlog(`@readNextRoll: ${err}`); }
        //return helpers.addMinutes(60);
        return null;
    }

    readRolledNumber() {
        let rolled = 0;
        try {
            if(this._elements.rolledNumber.isUserFriendly) {
                rolled = this._elements.rolledNumber.value;
            }
        } catch (err) { shared.devlog(`@readRolledNumber: ${err}`); }
        return rolled;
    }

    readBalance() {
        let balance = 0;
        try {
            if(this._elements.balance.isUserFriendly) {
                balance = this._elements.balance.value;
            }
        } catch (err) { shared.devlog(`@readBalance: ${err}`); }
        return balance;
    }

    readClaimed() { //TODO: review if previous claimed should be received as arg
        let claimed = this._result.claimed ?? 0;
        if (this._actions.isMultiClaim) {
            this._oldClaimed = claimed;
            shared.devlog(`@readClaimed: oldClaimed set to ${this._oldClaimed}`);
        } else {
            shared.devlog(`@readClaimed: oldClaimed not set`);
        }

        try {
            shared.devlog(`@readClaimed: isUserFriendly => ${this._elements.claimed.isUserFriendly}`);
            if(this._elements.claimed.isUserFriendly) {
                // shared.devlog(`@readClaimed: inside isUserFriendly`);
                // shared.devlog(`InnerText: ${this._elements.claimed.isUserFriendly.innerText}`);
                claimed = +claimed + +this._elements.claimed.value;
            } else {
                shared.devlog(`@readClaimed: NOT isUserFriendly`);
            }
        } catch (err) { shared.devlog(`@readClaimed: ${err}`); }
        shared.devlog(`@readClaimed: returns ${claimed}`);
        return claimed;
    }

    checkIfOutOfFunds() {
        let divAlerts = [...document.querySelectorAll(this._elements.outOfFundsDivSelector)];
        divAlerts.forEach( function (d) {
            if (d.innerText.toLowerCase().includes('not have sufficient funds')) {
                shared.closeWithError(K.ErrorType.FAUCET_EMPTY, d.innerText);
                return;
            }
        });
    }

    setCurrentCaptcha() {
        if ([...document.querySelectorAll('iframe')].map(x => x.src || '').filter(x => x.includes('hcaptcha.com')).length > 0) {
            // hcaptcha
            return;
        }
        this._elements.captcha = new RecaptchaWidget();
    }
}

