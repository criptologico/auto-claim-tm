{{crawlers/sites/bfroll.js}}

// TODO: move to individual files
class DutchyRoll extends Faucet {
    constructor() {
        let elements = {
            countdownMinutes: new CountdownWidget({selector: '#timer', parser: Parsers.splitAndIdxToInt, options: { splitter: 'Minutes', idx: 0} }), // "26 Minutes 23"
            captcha: new HCaptchaWidget(),
            rollButton: new ButtonWidget({selector: '#claim'}), //w/booster video: '#unlockbutton' & then #claim_boosted
            success: new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse'}),
            claimed: new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse', parser: Parsers.freeEthereumIoClaimed}) //"You Won 0.00409070 TRX + 20 XP"
        };
        let actions = {
            preRun: true,
            readClaimed: true,
            readBalance: false,
            readRolledNumber: false
        };
        super(elements, actions);
    }

    init() {
        switch(window.location.host) {
            case 'autofaucet.dutchycorp.space':
                if (this._url.includes('/roll.php')) {
                    this._elements.claimed = new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse', parser: Parsers.dutchysClaimed})
                } else if (this._url.includes('/login.php')) {
                    shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
                    return;
                }
                break;
            case 'express.dutchycorp.space':
                if (this._url.includes('/roll.php')) {
                    this._elements.claimed = new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse', parser: Parsers.dutchysClaimed})
                } else if (this._url.includes('/coin_roll.php')) {
                    this._elements.claimed = new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse', parser: Parsers.dutchysClaimedToFloat})
                } else if (this._url.includes('/index.php')) {
                    shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, 'You need to login using ExpressCrypto (EC-UserId-XXXXXX).');
                    return;
                }
                break;
        }
        this.run();
        return;
    }

    async preRun() {
        if (this._elements.captcha.isUserFriendly) {
            if (shared.getConfig()['dutchy.useBoosted']) {
                this._elements.rollButton = new ButtonWidget({selector: '#unlockbutton'});
                this._elements.confirmBoost = new ButtonWidget({selector: '#claim_boosted'});
                setInterval(() => {
                    shared.devlog(`@boost wait`);
                    try {
                        shared.devlog(`this._elements.confirmBoost`);
                        if (this._elements.confirmBoost.isUserFriendly) {
                            shared.devlog(`@boost clicking`);
                            this._elements.confirmBoost.click();
                        }
                    } catch (err) {}
                }, 8000);
            }
            return true;
        } else {
            return wait().preRun();
            // if (document.readyState === 'complete') {
            //     shared.closeWithError(K.ErrorType.Error, `You need to set hCaptcha as default at ${(new URL('account.php', this._url)).href}`);
            // } else {
            //     return wait().preRun();
            // }
        }
    }
}

class YCoin extends Faucet {
    constructor() {
        let elements = {
            rollButton: new ButtonWidget({selector: 'input[type="submit"][value="Get Free Crypto!"]'}),
            claimed: new ReadableWidget({selector: 'div.alert.alert-info', parser: Parsers.freeEthereumIoClaimed}),
            captcha: new HCaptchaWidget(),
            balance: new ReadableWidget({selector: 'a.wha[href="/account?page=history"]', parser: Parsers.trimNaNs}),
            success: new ReadableWidget({selector: 'div.alert.alert-info'}),
            login: {
                inputUser: new TextboxWidget({ selector: 'input[name="number"]' }),
                inputPass: new TextboxWidget({ selector: 'input[name="pass"]' }),
                inputSubmit: new SubmitWidget({ selector: 'input[type="submit"][value="Login!"]' }),
                setCredentials: false
            },
            // outOfFundsDivSelector: '.alert.alert-info'
        };

        if(shared.getConfig()['ycoin.credentials.mode'] == 1) {
            elements.login.setCredentials = {
                username: shared.getConfig()['ycoin.credentials.username'],
                password: shared.getConfig()['ycoin.credentials.password']
            };
        }

        let actions = {
            preRun: true,
            readClaimed: true,
            readBalance: true,
            readRolledNumber: false,
            checkIfOutOfFunds: false
        };
        super(elements, actions);
    }

    async preRun() {
        shared.devlog(`@preRun`);
        // <p class="info success">0.00000007  has been transferred to your account! You have 6 claims left today.</p>
        let msgDiv;
        msgDiv = document.querySelector('p.info.success');
        if (msgDiv && msgDiv.innerText.includes('has been transferred')) {
            shared.devlog(`custom closing`);
            let result = {};
            if (msgDiv.innerText.includes('0 claims')) {
                result.nextRoll = helpers.addMinutes(60 * 24 + helpers.randomInt(10, 50));
            } else {
                result.nextRoll = helpers.addMinutes('60');
            }
            result.claimed = +msgDiv.innerText.split(' ')[0];
            result.balance = this.readBalance();
            shared.closeWindow(result);
            return;
        }

        msgDiv = document.querySelector('p.info.warn');
        if (msgDiv) {
            if (msgDiv.innerText.includes('can claim only')) {
                shared.devlog(`@preRun -> wait 24 hs`);
                let result = {};
                result.nextRoll = helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
                shared.closeWindow(result);
                return;
            } else if (msgDiv.innerText.includes('Please wait')) {
                shared.devlog(`@preRun -> please wait found`);
                let result = {};
                try {
                    let unit = msgDiv.innerText.includes(' seconds') ? ' seconds' : ' minutes';
                    let val = msgDiv.innerText.split('Please wait ')[1].replace(/\D/g, '');
                    if (unit == ' seconds') {
                        result.nextRoll = helpers.addSeconds(val);
                    } else {
                        result.nextRoll = helpers.addMinutes(val);
                    }
                } catch {
                    result.nextRoll = helpers.addMinutes(60);
                }
                shared.closeWindow(result);
                return;
            }
        }

        if (this._elements.captcha.isUserFriendly) {
            shared.devlog(`Captcha found`);
        } else {
            shared.devlog(`Captcha not found`);
            if (this._elements.rollButton) {
                shared.devlog(`Click getFreeCrypto no captcha`);
                this._elements.rollButton.click();
                return;
            }
        }
    }

    async init() {
        shared.devlog(`@init`);
        if (this._url.includes('/faucet')) {
            let needToLoginButton = document.querySelector('input[type="submit"][value="Login / Signup"]');
            if (needToLoginButton) {
                shared.devlog(`GoTo Login`);
                needToLoginButton.click();
                return;
            }

            this.run();
            return;
        } else if (this._url.includes('/account')) {
            this.doLogin();
            return;
        }
    }

    async doLogin() {
        shared.devlog(`@doLogin`);
        return wait().then( () => {
            let container = document.querySelector('#cc');
            if (container.innerText.includes('You are now logged in as account')) {
                shared.devlog(`@logged in OK`);
                let toFaucetButton = document.querySelector('#mmenu a[href="/faucet"]');
                if (toFaucetButton) {
                    toFaucetButton.click();
                    return;
                }
                return this.doLogin();
            }
            if (!this._elements.login.inputUser.isUserFriendly || !this._elements.login.inputPass.isUserFriendly || !this._elements.login.inputSubmit.isUserFriendly) {
                shared.devlog(`Waiting form inputs`);
                return this.doLogin();
            }

            let loginErrorDiv = document.querySelector('#cc .info.fail');
            if (loginErrorDiv && loginErrorDiv.innerText.includes('Invalid')) {
                shared.closeWithError(K.ErrorType.LOGIN_ERROR, loginErrorDiv.innerText);
                return;
            }

            if (this._elements.login.setCredentials != false) {
                shared.devlog(`Setting credentials from var`);
                this._elements.login.inputUser.value = this._elements.login.setCredentials.username;
                this._elements.login.inputPass.value = this._elements.login.setCredentials.password;
            }

            try {
                this._elements.login.rememberMe.isUserFriendly.checked = true;
            } catch (err) {}

            if (this._elements.login.inputUser.value != '' && this._elements.login.inputPass.value != '' ) {
                this._elements.login.inputSubmit.click();
            } else {
                shared.closeWithError(K.ErrorType.LOGIN_ERROR, 'No credentials were provided');
                return;
            }
        });
    }

}

class CDiversity extends Faucet {
    constructor() {
        let elements = {
            claimed: new ReadableWidget({selector: 'p.success', parser: Parsers.trimNaNs}),
            captcha: new HCaptchaWidget(),
            rollButton: new ButtonWidget({selector: 'input[type="submit"][value="Get Free Crypto!"]'}),
        };
        let actions = {
            readTimeLeft: true,
            readRolledNumber: false,
            readBalance: false
        };
        super(elements, actions);
    }

    init() {
        if(this.hasErrorMessage()) {
            shared.closeWithError(K.ErrorType.ERROR, 'Suspicious Activity Message Displayed');
            return;
        }

        let claimed = this.readClaimed();
        if (claimed != 0) {
            shared.devlog(`closing because claim was read`);
            let result = {
                claimed: claimed,
                nextRoll: this.readNextRoll()
            };
            shared.closeWindow(result);
            return;
        }

        let nextRoll = this.readNextRoll();
        if(nextRoll) {
            shared.devlog(`closing with next roll`);
            let result = {
                nextRoll: nextRoll
            };
            shared.closeWindow(result);
            return;
        }

        this.solve();
    }

    hasErrorMessage() {
        return document.body.innerText.toLowerCase().includes('suspicious activity');
    }

    isFirstStep() {
        return document.querySelector('form select[name="coin"]') ? true : false;
    }

    async doFirstStep() {
        let form = document.querySelector('form');
        if (!form) {
            shared.devlog(`Form element not found`);
            this.updateResult();
            return;
        }
        // TODO: read latest claims to find coin to use
        let coinSelect = form.querySelector('select[name="coin"]');
        if (!coinSelect) {
            shared.devlog(`coinSelect not found`);
            this.updateResult();
            return;
        }
        let userInput = form.querySelector('input[name="ado"]');
        if (!userInput) {
            shared.devlog(`userInput not found`);
            this.updateResult();
            return;
        }
        let submitButton = form.querySelector('input[type="submit"]');
        if (!submitButton) {
            shared.devlog(`submitButton not found`);
            this.updateResult();
            return;
        }
        // fill coin
        coinSelect.value = this.getCoin();
        // fill email
        userInput.value = this._params.address;

        submitButton.parentElement.submit();
        return;
    }

    getCoin() {
        try {
            let tds = document.querySelectorAll('table tr td:nth-child(2)');
            return tds[helpers.randomInt(0, 5)].innerText.split(' ')[1]
        } catch (err) {
            return 'BTC';
        }
    }

    isSecondStep() {
        let ps = [...document.querySelectorAll('p')];
        return ps.findIndex(x => x.innerText.toLowerCase().includes('one more step...')) >= 0;
    }

    async solve() {
        shared.devlog(`@solve`);
        if (this.isSecondStep()) {
            shared.devlog(`@2nd step`);
            return this.run();
        }
        if (this.isFirstStep()) {
            shared.devlog(`@1st step`);
            return this.doFirstStep();
        }
    }

    isCountdownVisible() {
        let successDiv = document.querySelector('p.success');
        if (!successDiv) {
            return false;
        }
        if (successDiv.innerText.includes('0 claims')) {
            // need to wait a day
            return true;
        }

        return false;
    }

    readClaimed() {
        let successDiv = document.querySelector('p.success');
        if (successDiv) {
            return successDiv.innerText.split(' ')[0];
        } else {
            shared.devlog(`successDiv not found`);
            return 0;
        }
    }

    readNextRoll() {
        // <p class="warn">Time between claims should be at least 1 minutes! Please wait 47 seconds before claiming again.</p>
        try {
            let successDiv = document.querySelector('p.success');
            if (successDiv && successDiv.innerText.includes('You have')) {
                let claimsLeft;
                try {
                    claimsLeft = successDiv.innerText.split(' claims')[0].split('have ')[1];
                } catch (err) {}
                shared.devlog(`claimsLeft: ${claimsLeft}`);
                if (claimsLeft) {
                    return helpers.addMinutes(helpers.randomInt(6, 22));
                } else if (claimsLeft === '0') {
                    return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
                }
            }
        } catch (err) { }

        try {
            let warnDiv = document.querySelector('p.warn');
            if (warnDiv) {
                if (warnDiv.innerText.includes('You can claim only')) {
                    return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
                }

                if (warnDiv.innerText.includes('Please wait ')) {
                    try {
                        let unit = warnDiv.innerText.includes(' seconds') ? ' seconds' : ' minutes';
                        let val = warnDiv.innerText.split('Please wait ')[1].split(unit)[0].replace(/\D/g, '');
                        if (unit == ' seconds') {
                            return helpers.addSeconds(val);
                        } else {
                            return helpers.addMinutes(val);
                        }
                    } catch { }
                    let claimsLeft;
                    try {
                        claimsLeft = warnDiv.innerText.split(' seconds')[0].split('wait ')[1];
                    } catch (err) {}
                    shared.devlog(`claimsLeft: ${claimsLeft}`);
                    if (claimsLeft) {
                        return helpers.addMinutes(helpers.randomInt(6, 22));
                    }
                }
            }

        } catch (err) { }
        //return helpers.addMinutes(60);
        return null;
    }
}

class CTop extends Faucet {
    constructor() {
        let elements = {
            claimed: new ReadableWidget({selector: 'p.success', parser: Parsers.trimNaNs}),
            captcha: new HCaptchaWidget(),
            rollButton: new ButtonWidget({selector: 'input[type="submit"]'}),
        };
        let actions = {
            readTimeLeft: true,
            readRolledNumber: false,
            readBalance: false
        };
        super(elements, actions);
    }

    init() {
        if(this.hasErrorMessage()) {
            shared.closeWithError(K.ErrorType.ERROR, 'Suspicious Activity Message Displayed');
            return;
        }

        let claimed = this.readClaimed();
        if (claimed != 0) {
            shared.devlog(`closing because claim was read`);
            let result = {
                claimed: claimed,
                nextRoll: this.readNextRoll()
            };
            shared.closeWindow(result);
            return;
        }

        let nextRoll = this.readNextRoll();
        if(nextRoll) {
            shared.devlog(`closing with next roll`);
            let result = {
                nextRoll: nextRoll
            };
            shared.closeWindow(result);
            return;
        }

        this.solve();
    }

    hasErrorMessage() {
        return document.body.innerText.toLowerCase().includes('suspicious activity');
    }

    isFirstStep() {
        return document.querySelector('form input[name="adr"]') ? true : false;
    }

    async doFirstStep() {
        let form = document.querySelector('form');
        if (!form) {
            shared.devlog(`Form element not found`);
            this.updateResult();
            return;
        }
        let userInput = form.querySelector('input[name="adr"]');
        if (!userInput) {
            shared.devlog(`address input not found`);
            this.updateResult();
            return;
        }
        let submitButton = form.querySelector('input[type="submit"]');
        if (!submitButton) {
            shared.devlog(`submitButton not found`);
            this.updateResult();
            return;
        }
        userInput.value = this._params.address;

        submitButton.closest('form').submit();
        return;
    }

    isSecondStep() {
        let ps = [...document.querySelectorAll('p')];
        return ps.findIndex(x => x.innerText.toLowerCase().includes('one more step...')) >= 0;
    }

    async solve() {
        shared.devlog(`@solve`);
        if (this.isSecondStep()) {
            shared.devlog(`@2nd step`);
            return this.run();
        }
        if (this.isFirstStep()) {
            shared.devlog(`@1st step`);
            return this.doFirstStep();
        }
    }

    isCountdownVisible() {
        let successDiv = document.querySelector('p.success');
        if (!successDiv) {
            return false;
        }
        if (successDiv.innerText.includes('0 claims')) {
            return true;
        }

        return false;
    }

    readClaimed() {
        let successDiv = document.querySelector('p.success');
        if (successDiv) {
            return successDiv.innerText.split(' ')[0];
        } else {
            shared.devlog(`successDiv not found`);
            return 0;
        }
    }

    readNextRoll() {
        try {
            let successDiv = document.querySelector('p.success');
            if (successDiv && successDiv.innerText.includes('You have')) {
                let claimsLeft;
                try {
                    claimsLeft = successDiv.innerText.split(' claims')[0].split('have ')[1];
                } catch (err) {}
                shared.devlog(`claimsLeft: ${claimsLeft}`);
                if (claimsLeft) {
                    return helpers.addMinutes(helpers.randomInt(6, 22));
                } else if (claimsLeft === '0') {
                    return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
                }
            }
        } catch (err) { }

        try {
            let warnDiv = document.querySelector('p.warn');
            if (warnDiv) {
                if (warnDiv.innerText.includes('You can claim only')) {
                    return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
                }

                if (warnDiv.innerText.includes('Please wait ')) {
                    try {
                        let unit = warnDiv.innerText.includes(' seconds') ? ' seconds' : ' minutes';
                        let val = warnDiv.innerText.split('Please wait ')[1].split(unit)[0].replace(/\D/g, '');
                        if (unit == ' seconds') {
                            return helpers.addSeconds(val);
                        } else {
                            return helpers.addMinutes(val);
                        }
                    } catch { }
                    let claimsLeft;
                    try {
                        claimsLeft = warnDiv.innerText.split(' seconds')[0].split('wait ')[1];
                    } catch (err) {}
                    shared.devlog(`claimsLeft: ${claimsLeft}`);
                    if (claimsLeft) {
                        return helpers.addMinutes(helpers.randomInt(6, 22));
                    }
                }
            }

        } catch (err) { }
        return null;
    }
}

class BscAds extends Faucet {
    constructor() {
        let elements = {
            rollButton: new ButtonWidget({selector: 'button.btn.btn-primary.btn-lg'}),
            claimed: new ReadableWidget({selector: 'div.alert.alert-success', parser: Parsers.trimNaNs}),
            captcha: new HCaptchaWidget(),
            countdownMinutes: new CountdownWidget({selector: '#faucet_timer', parser: Parsers.fromTextTimer }), // 0 hours 15 minutes 36 seconds
            success: new ReadableWidget({selector: 'div.alert.alert-success'}),
            login: {
                inputUser: new TextboxWidget({ selector: 'input[name="username"]' }),
                inputPass: new TextboxWidget({ selector: 'input[name="password"]' }),
                inputSubmit: new ButtonWidget({ selector: 'button.btn' }),
                setCredantials: false
            }
        }

        if(shared.getConfig()['bscads.credentials.mode'] == 1) {
            elements.login.setCredentials = {
                username: shared.getConfig()['bscads.credentials.username'],
                password: shared.getConfig()['bscads.credentials.password']
            };
        }

        let actions = {
            readClaimed: true,
            readBalance: false,
            readRolledNumber: false
        };
        super(elements, actions);
    }

    init() {
        if (this._url.includes('/faucet/access')) {
            this.run();
            return;
        } else if (this._url.includes('/faucet')) {
            shared.devlog('@faucet pre/post step');
            this.doPrePostFaucet();
            return;
        } else if (this._url.includes('/login')) {
            this.doLogin();
            return;
        } else {
            location.replace('faucet');
            return;
        }
    }

    async doPrePostFaucet() {
        // pre faucet and post faucet
        return wait(10000).then( () => {
            let button = document.querySelector('button.btn.btn-primary.btn-lg');
            if (button) {
                // is pre faucet
                shared.devlog('pre-faucet button click');
                button.click();
                return;
            }
            if (!button) {
                shared.devlog('post-faucet');
                return this.run();
//                     // button not found. check if it's a post claim
//                     let successDiv = document.querySelector('div.alert.alert-success');
//                     if (successDiv && successDiv.innerText.includes('THE_SUCCESS_MESSAGE')) {

//                     }
//                     shared.devlog('button not found');
//                     shared.closeWithError(K.ErrorType.ERROR, 'Button not found on faucet pre step');
//                     return this.doPrePostFaucet();
            }
        });
    }

    async doLogin() {
        shared.devlog(`@doLogin`);
        // nothing if 'please wait during'
        if (document.body.innerText.toLowerCase().includes('please wait during')) {
            return wait(8000).then( () => {
                shared.devlog(`redirecting to faucet from login countdown`);
                location.replace('faucet');
            });
        }
        return wait().then( () => {
            if (!this._elements.login.inputUser.isUserFriendly || !this._elements.login.inputPass.isUserFriendly || !this._elements.login.inputSubmit.isUserFriendly) {
                shared.devlog(`Waiting form inputs`);
                return this.doLogin();
            }

            let loginErrorDiv = document.querySelector('div.alert.alert-danger');
            if (loginErrorDiv && loginErrorDiv.innerText.toLowerCase().includes('invalid')) {
                shared.closeWithError(K.ErrorType.LOGIN_ERROR, loginErrorDiv.innerText);
                return;
            }

            if (this._elements.login.setCredentials != false) {
                shared.devlog(`Setting credentials from var`);
                this._elements.login.inputUser.value = this._elements.login.setCredentials.username;
                this._elements.login.inputPass.value = this._elements.login.setCredentials.password;
            }

            try {
                this._elements.login.rememberMe.isUserFriendly.checked = true;
            } catch (err) {}

            if (this._elements.login.inputUser.value != '' && this._elements.login.inputPass.value != '' ) {
                shared.devlog(`@Run - Captcha`);
                this._elements.captcha.isSolved().then(() => {
                    this._elements.login.inputSubmit.click();
                    return;
                });
            } else {
                shared.closeWithError(K.ErrorType.LOGIN_ERROR, 'No credentials were provided');
                return;
            }
        });
    }

    async preRun() {
        // <button class="btn btn-primary btn-lg">Claim Your Reward Now</button>
    }
}

class FPB extends Faucet {
    constructor(sitePrefix = null) {
        let elements = {
            rollButton: new ButtonWidget({selector: 'input[type="submit"][value="Claim From Faucet"],input[type="submit"][name="claim"]'}),
            claimed: new ReadableWidget({selector: 'div.alert.alert-info', parser: Parsers.freeEthereumIoClaimed}),
            captcha: new HCaptchaWidget(),
            success: new ReadableWidget({selector: 'div.alert.alert-info'}),
            login: {
                inputUser: new TextboxWidget({ selector: 'input[name="user_name"]' }),
                inputPass: new TextboxWidget({ selector: 'input[name="password"]' }),
                rememberMe: new TextboxWidget({ selector: 'input[name="remember_me"]' }),
                inputSubmit: new ButtonWidget({ selector: 'input[type="submit"][name="login"]' }),
                setCredentials: false
            },
            outOfFundsDivSelector: '.alert.alert-info'
        };

        if(shared.getConfig()[sitePrefix + '.credentials.mode'] == 1) {
            elements.login.setCredentials = {
                username: shared.getConfig()[sitePrefix + '.credentials.username'],
                password: shared.getConfig()[sitePrefix + '.credentials.password']
            };
        }

        let actions = {
            readClaimed: true,
            readBalance: false,
            readRolledNumber: false,
            checkIfOutOfFunds: true
        };
        super(elements, actions);
    }

    init() {
        if (this._url.includes('/dashboard')) {
            this.run();
            return;
        } else if (this._url.includes('/login')) {
            this.doLogin();
            return;
        }
    }

    async doLogin() {
        shared.devlog(`@doLogin`);
        return wait().then( () => {
            if (!this._elements.login.inputUser.isUserFriendly || !this._elements.login.inputPass.isUserFriendly || !this._elements.login.inputSubmit.isUserFriendly) {
                shared.devlog(`Waiting form inputs`);
                return this.doLogin();
            }

            let loginErrorDiv = document.querySelector('div.alert.alert-info');
            if (loginErrorDiv && loginErrorDiv.innerText.includes('not valid')) {
                shared.closeWithError(K.ErrorType.LOGIN_ERROR, loginErrorDiv.innerText);
                return;
            }

            if (this._elements.login.setCredentials != false) {
                shared.devlog(`Setting credentials from var`);
                this._elements.login.inputUser.value = this._elements.login.setCredentials.username;
                this._elements.login.inputPass.value = this._elements.login.setCredentials.password;
            }

            try {
                this._elements.login.rememberMe.isUserFriendly.checked = true;
            } catch (err) {}

            if (this._elements.login.inputUser.value != '' && this._elements.login.inputPass.value != '' ) {
                shared.devlog(`@Run - Captcha`);
                this._elements.captcha.isSolved().then(() => {
                    this._elements.login.inputSubmit.click();
                    return;
                });
            } else {
                shared.closeWithError(K.ErrorType.LOGIN_ERROR, 'No credentials were provided');
                return;
            }
        });
    }

    async detectAction() {
        shared.devlog(`@detectAction Custom`);
        return wait().then( () => {
            if ( this.isCountdownVisible() ) {
                shared.devlog('needToWait');
                return Promise.resolve({action: 'needToWait'});
            } else if ( this._elements.success.isUserFriendly ) {
                shared.devlog('Successful run');
                return this.updateResult();
            } else if ( this.isRollButtonVisible() ) {
                shared.devlog('doRoll');
                return Promise.resolve({action: 'doRoll'});
            } else {
                return this.detectAction();
            }
        });
    }

    clickRoll() {
        try {
            shared.devlog(`@clickRoll custom`);
            try {
                window.scrollTo(0, document.body.scrollHeight);
                this._elements.rollButton.scrollIntoView(false);
            } catch (err) { }
            this._elements.rollButton.click();
            setTimeout( () => { this._elements.rollButton.click(); }, 5000);
            // setTimeout(() => { this.validateRun() }, helpers.randomMs(10000, 12000));
        } catch (err) {
            shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
        }
    }
}

class VieRoll extends Faucet {
    constructor() {
        let elements = {
            rollButton: new SubmitWidget({selector: '.main-content button[type="submit"]'}),
            claimed: new ReadableWidget({selector: '.swal2-html-container', parser: Parsers.trimNaNs}),
            captcha: new HCaptchaWidget(),
            success: new ReadableWidget({selector: '.swal2-success-ring'}),
            login: {
                // captchaOptions: new SelectWidget({ selector: '#selectCaptcha', valueSeeked: 'hcaptcha' }),
                inputUser: new TextboxWidget({ selector: '#email' }),
                inputPass: new TextboxWidget({ selector: '#password' }),
                // rememberMe: new TextboxWidget({ selector: 'input[name="remember_me"]' }),
                inputSubmit: new SubmitWidget({ selector: 'button[type="submit"]' })
            }
        };

        let actions = {
            readClaimed: true,
            readBalance: false,
            readTimeLeft: false,
            readRolledNumber: false,
            preSaveResult: false,
            preRun: true
        };
        super(elements, actions);
    }

    getClaimsQty() {
        shared.devlog(`@getClaimsQty`);
        let statWidgets = document.querySelectorAll('.card.mini-stats-wid');
        if (statWidgets.length < 4) return false;

        let claimCounts = statWidgets[3].querySelector('p');
        if (!claimCounts) return false;

        claimCounts = claimCounts.innerText.split('/');
        if (claimCounts.length != 2) return false;

        shared.devlog(`@getClaimsQty => ${claimCounts[0]}`);
        return claimCounts[0];
    }

    async evalClaimsQty() {
        shared.devlog(`@evalClaimsQty`);
        let current = this.getClaimsQty();

        if (current) {
            current = +current;
        } else {
            shared.devlog(`@evalClaimsQty => no current`);
            return;
        }

        let previous = await shared.getProp('tempClaimsQty') || 0;
        if (!isNaN(previous)) previous = +previous;

        if (current == previous) {
            shared.devlog(`@evalClaimsQty => current == previous`);
            return;
        } else if (current < previous) {
            shared.devlog(`@evalClaimsQty => to updateResult`);
            return this.updateResult();
        } else {
            shared.devlog(`@evalClaimsQty => to setProp`);
            await shared.setProp('tempClaimsQty', current);
        }
    }

    readClaimed() {
        let claimed = 0.12;
        try {
            claimed = +document.querySelectorAll('.card.mini-stats-wid')[2].querySelector('p').innerText.split(' ')[0];
        } catch (err) { }
        return claimed;
    }

    async init() {
        await this.evalClaimsQty();

        if (window.location.pathname.includes('/faucet')) {
            shared.devlog(`@VieRoll => At Faucet starting claim`);
            this.run();
            return;
        } else if (window.location.pathname.includes('/firewall')) {
            shared.devlog(`@VieRoll => At Firewall`);
            this.solveFirewall();
            return;
        } else if (window.location.pathname.includes('/dashboard')) {
            shared.devlog(`@VieRoll => At Dashboard`);
            window.location.href = (new URL('faucet', window.location)).href;
            return;
        } else if (window.location.pathname == '/') {
            // At home => go to login
            let loginBtn = document.querySelector('.btn.btn-success');
            if (loginBtn) {
                loginBtn.click();
                return;
            } else {
                shared.devlog(`@VieRoll => Home => Login button not found`);
                window.location.href = (new URL('login', window.location)).href;
            }
            return;
        } else if (this._url.includes('/login')) {
            shared.devlog(`@VieRoll => At Login`);

            let credentialsMode = this._params.credentials.mode;
            switch(credentialsMode) {
                case -1:
                    shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, 'Manual login required.');
                    break;
                case 0:
                    shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, 'Login required and autologin is not configured.');
                    break;
                default:
                    shared.devlog(`@VieRoll: Login attempt`);
                    this.doLogin();
                    break;
            }
            return;
        }
    }

    async preRun() {
        shared.devlog(`@preRun`);
        return;
    }

    async solveFirewall() {
        this.closeSwal();

        this._elements.captcha.isSolved().then(() => {
            let btn = new SubmitWidget({selector: 'form:not(.p-3) button[type="submit"]'});
            btn.click();
        });
    }

    async doLogin() {
        shared.devlog(`@doLogin`);
        return wait().then( () => {
            if (!this._elements.login.inputUser.isUserFriendly || !this._elements.login.inputPass.isUserFriendly || !this._elements.login.inputSubmit.isUserFriendly) {
                shared.devlog(`Waiting form inputs`);
                return this.doLogin();
            }

            let loginErrorDiv = document.querySelector('div.alert.alert-danger');
            if (loginErrorDiv) {
                shared.closeWithError(K.ErrorType.LOGIN_ERROR, loginErrorDiv.innerText);
                return;
            }

            if (this._params.credentials.mode == 1) {
                shared.devlog(`Setting credentials`);
                this._elements.login.inputUser.value = this._params.credentials.username;
                this._elements.login.inputPass.value = this._params.credentials.password;
            }

            if (this._elements.login.inputUser.value != '' && this._elements.login.inputPass.value != '' ) {
                this._elements.captcha.isSolved().then(() => {
                    this._elements.login.inputSubmit.click();
                    return;
                });
            } else {
                shared.closeWithError(K.ErrorType.LOGIN_ERROR, 'No credentials were provided');
                return;
            }
        });
    }

    preSaveResult() {
        this.closeSwal();
    }

    closeSwal() {
        let okButton = document.querySelector('button.swal2-confirm');
        if (okButton) {
            okButton.click();
        }
    }
}

class GRCRoll extends Faucet {
    constructor() {
        let elements = {
            countdownMinutes: new CountdownWidget({selector: '#roll_wait_text', parser: Parsers.freeGrcCountdown}),
            rollButton: new ButtonWidget({selector: 'input[id="roll_button"]'}),
            balance: new ReadableWidget({selector: '#balance', parser: Parsers.trimNaNs}),
            claimed: new ReadableWidget({selector: '#roll_comment .won', parser: Parsers.trimNaNs}),
            rolledNumber: new ReadableWidget({selector: '#roll_result', parser: Parsers.trimNaNs}),
            captcha: new NoCaptchaWidget({selector: '#roll_button'}),
            success: new ReadableWidget({selector: '#roll_result'})
        };
        let actions = {
            readTimeLeft: true,
            readRolledNumber: true
        };
        super(elements, actions);
    }

    init() {
        if (this._url.includes('#free_roll')) {
            if (document.querySelectorAll('a[href="#login"]').length > 0) {
                shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
                return;
            } else {
                this.run();
                return;
            }
        } else {
            return;
        }
    }

    isCountdownVisible() {
        return this._elements.countdownMinutes && this._elements.countdownMinutes.isUserFriendly && this._elements.countdownMinutes.isUserFriendly.innerText != '';
    }
}

class O24Roll extends Faucet {
    constructor() {
        let elements = {
            claimed: new ReadableWidget({selector: '#roll_comment .won', parser: Parsers.trimNaNs})
        };
        let actions = {
            readTimeLeft: true,
            readRolledNumber: false,
            readBalance: false
        };
        super(elements, actions);
    }

    init() {
        if (this.isCountdownVisible() || this.readClaimed() != 0) {
            this.updateResult();
            return;
        }

        this.solve();
    }

    getSpotsAvailable() {
        try {
            let soldSpots = document.querySelectorAll('.pos:not(.pfree)').length;
            let available = 1024-soldSpots;
            shared.devlog(`Spots read => available: ${available}, sold: ${soldSpots}`);
            return {
                sold: '' + soldSpots,
                available: '' + available
            }
        } catch (err) {
            shared.devlog(`Unable to read spots sold`);
            shared.devlog(err);
        }
    }

    isPrime(num) {
        for(var i = 2; i < num; i++){
            if(num % i === 0){
                return false;
            }
        }
        return num > 1;
    }

    async solve() {
        let spots = this.getSpotsAvailable();
        if(!spots) {
            // close with error
            shared.devlog(`Could not find spots available`);
            this.updateResult();
            return;
        }

        const findNotPrime = document.querySelector('select[name="pr"]').parentElement.innerText.includes('not a prime')
        let numbers = [...document.querySelectorAll('select[name="pr"] option[value]')].map(x => x.innerText)
        let prime = null;
        if (findNotPrime) {
            prime = numbers.find(x => {
                return !this.isPrime(x)
            });
        } else {
            prime = numbers.find(x => {
            return this.isPrime(x)
        });
        }
        if(!prime) {
            // close with error
            shared.devlog(`Could not find ${findNotPrime ? 'not' : ''} prime number`);
            this.updateResult();
            return;
        }

        // fill address
        let addrInput = document.querySelector('label input[name="a"]');
        if (addrInput) {
            addrInput.value = this._params.address;
        } else {
            shared.devlog(`Could not find address input element`);
            this.updateResult();
            return;
        }
        await wait(helpers.randomInt(1500, 3000));

        // answer_1:
        let answersList = [...document.querySelectorAll('select[name="tt"] option')].map(x => x.value);
        if (answersList.includes(spots.sold)) {
            document.querySelector('select[name="tt"]').value=spots.sold;
        } else if (answersList.includes(spots.available)) {
            document.querySelector('select[name="tt"]').value=spots.available;
        } else {
            shared.devlog(`Could not find option for sold/available spots`);
            this.updateResult();
            return;
        }

        await wait(helpers.randomInt(400, 5000));

        // answer_2:
        let primeSelect = document.querySelector('select[name="pr"]');
        helpers.triggerMouseEvent (primeSelect, "mouseenter");
        await wait(helpers.randomInt(5600, 29000));
        helpers.triggerMouseEvent (primeSelect, "mouseout");
        primeSelect.value=prime.toString()
        await wait(helpers.randomInt(1500, 5000));

        let claimForm = document.querySelector('form');
        if(claimForm) {
            claimForm.submit();
        }
    }

    isCountdownVisible() {
        let pars = [...document.querySelectorAll('p')];
        if (pars.find(x => x.innerText.includes('wait until next day'))) {
            // need to wait a day
            return true;
        }

        if (pars.find(x => x.innerText.includes('PROBLEM'))) {
            // need to wait at least 5 min
            return true;
        }

        return false;
    }

    readClaimed() {
        let pars = [...document.querySelectorAll('p')];
        let claimedElm = pars.find(x => x.innerText.includes('been transferred to your account'));
        if (claimedElm) {
            return claimedElm.innerText.split(' ')[0];
        } else {
            return 0;
        }
    }

    readNextRoll() {
        try {
            let pars = [...document.querySelectorAll('p')];
            if (pars.find(x => x.innerText.includes('until next day') || x.innerText.includes('ALL DAILY CLAIMS') || x.innerText.includes('You have 0 claims left'))) {
                // need to wait a day
                return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
            }

            if (pars.find(x => x.innerText.includes('PROBLEM'))) {
                // need to wait
                return helpers.addMinutes(helpers.randomInt(6, 22));
            }

            if (pars.find(x => x.innerText.includes('You have'))) {
                // need to wait a day
                return helpers.addMinutes(helpers.randomInt(6, 22));
            }
        } catch (err) { shared.devlog(`@readNextRoll: ${err}`); }
        //return helpers.addMinutes(60);
        return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
    }
}

// TODO: refactor => separate in PTC and FAUCET, using a generic PTC class with PTCList, PTCSingle, etc
//                   create a container class that has both PTC and FAUCET
class FCryptoRoll extends Faucet {
    constructor() {
        let elements = {
            countdownMinutes: new CountdownWidget({selector: '.sidebar-links .cursor-not-allowed span.notranslate', parser: Parsers.splitAndIdxToInt, options: { splitter: ':', idx: 1} }), // '00:21:28'
            // rollButton: new ButtonWidget({selector: 'button.notranslate.inline-flex.items-center.text-center:not(.hidden)'}),
            rollButton: new ButtonWidget({selector: '.flex.justify-center button.inline-flex.items-center:not(.hidden)'}),
            balance: new ReadableWidget({selector: 'div.flex.badge.text-bg-yellow', parser: Parsers.trimNaNs}), // '405.81 Coins'
            claimed: new ReadableWidget({selector: 'div.ml-3.w-0 p span.text-yellow-500.font-medium', parser: Parsers.splitAndIdxTrimNaNs, options: { splitter: '(', idx: 0} }), // '25.05 Coins (12 + 13.05)'
            captcha: new HCaptchaWidget({selector: '#hcap-script > iframe'}),
            success: new ReadableWidget({selector: 'div.ml-3.w-0 p span.text-yellow-500.font-medium'})
        };
        let actions = {
            isMultiClaim: true,
            preRoll: true,
            postRun: true,
            readRolledNumber: false,
        };
        super(elements, actions);
        this._paths = {
            faucet: '/task/faucet-claim',
            dashboard: '/dashboard'
        };
        this._linkSelectors = {
            Faucet: 'a[href="https://faucetcrypto.com/task/faucet-claim"]'
        }
        this.useUrlListener();
    }

    init() {
        this._elements.captcha = new HCaptchaWidget({selector: '#hcap-script > iframe'});
        this._elements.rollButton = new ButtonWidget({selector: '.flex.justify-center button.inline-flex.items-center:not(.hidden)'});
        if (this._url.endsWith(this._paths.dashboard)) {
            shared.devlog(`@FC => @dashboard`);
            return this.runDashboard();
        } else if (this._url.includes(this._paths.faucet)) {
            shared.devlog(`@FC => @faucet`);
            return wait().then( () => { this.run(); });
        }

        shared.devlog(`@FC => No url match!`);
        return;
    }

    readSections() {
        let sections = {};
        try {
            for (var l in this._linkSelectors) {
                sections[l] = {};
                sections[l].elm = document.querySelector(this._linkSelectors[l]);
                if (sections[l].elm) {
                    let qty = sections[l].elm.querySelector('span.ml-auto');
                    sections[l].qty = (qty && !isNaN(qty.innerText)) ? qty.innerText : 0;
                }
            }
        } catch {}

        this.sections = sections;
    }

    runDashboard() {
        this.readSections();

        if (this.sections['Faucet'].elm) {
            shared.devlog(`@FC => goto faucet`);
            this.sections['Faucet'].elm.click();
            return;
        } else {
            // process Faucet results?
            shared.devlog(`@FC => processing faucet results`);
            return wait().then( () => { this.run(); });
        }
    }

    // TODO: refactor and move
    scrollTo() {
        let mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.scrollTo(0, mainContainer.scrollHeight - mainContainer.offsetHeight);
        }
    }

    preRoll() { // search for 'You don't need to solve any captcha! The system is telling me that you are a good person :)'
        this.scrollTo();
        let checkCircleSpan = document.querySelector('p.font-medium.flex.justify-center.leading-0 span.text-green-500.mr-3 svg');
        if(checkCircleSpan) {
            if (checkCircleSpan.parentElement.parentElement.innerText.toLowerCase().includes('the system is telling me that you are a good person')) {
                shared.devlog(`No captcha needed`);
                // TODO: review the following selector as it's matching the countdown button
                this._elements.captcha = new NoCaptchaWidget({selector: '.flex.justify-center button.inline-flex.items-center:not(.hidden)'});
                return;
            }
        }
    }

    postRun() {
        shared.devlog(`@FC @postRun in ${window.location.href}`);

        // if ( this._url.endsWith(this._paths.dashboard) || (this._oldClaimed && this._result && this._result.claimed && this._oldClaimed != this._result.claimed) ) {
        if (this._url.endsWith(this._paths.dashboard) || this._oldClaimed != this._result.claimed) {
            shared.devlog(`@FC @postRun => Claim/Action finished [${this._oldClaimed} != ${this._result.claimed}]`);
            try {
                this._elements.claimed.isUserFriendly.parentElement.parentElement.parentElement.querySelector('button');
                shared.devlog(`@FC @postRun => closing claimed notification`);
            } catch (err) {
                shared.devlog(`@FC @postRun => error closing claimed notification: ${err}`);
            }
            this._oldClaimed = null;
            this.readSections();
            if (this.sections != {}) {
                if (this.sections['Faucet'].elm) {
                    shared.devlog(`@FC @postRun => goto faucet`);
                    this.sections['Faucet'].elm.click();
                    return;
                    // } else if (this.sections['PtcList'].elm && this.sections['PtcList'].qty > 0) {
                    //     shared.devlog(`@FC @postRun => has PTCs. goto ptcList`);
                    //     this.sections['PtcList'].elm.click();
                    //     return;
                } else {
                    shared.devlog(`@FC @postRun => ignoring @1`);
                }
            } else {
                shared.devlog(`@FC @postRun => ignoring @2`);
            }
        } else {
            shared.devlog(`@FC @postRun => ignoring @3`);
        }

        this._result = shared.getProp('tempResults');
        shared.closeWindow(this._result);
        return;
    }

    async runPtcList() {
        shared.devlog(`@FC => @runPtcList`);
        let listItems = [...document.querySelectorAll('.grid.grid-responsive-3 .feather.feather-eye')].map(x => x.parentElement.parentElement).filter(x => x.isUserFriendly());
        if (listItems.length > 0) {
            shared.devlog(`@FC => goto PtcSingleStart`);
            listItems[0].click();
            return;
        } else {
            shared.devlog(`@FC => list invalid. Length: ${listItems.length}`);
            return wait().then( () => { this.runPtcList() } );
        }
    }

    runPtcSingleStart() {
        shared.devlog(`@FC => @runPtcSingleStart`);
        return this.run('doRoll');
    }

    runPtcSingleWait() {
        shared.devlog(`@FC => @runPtcSingleWait`);
        this._elements.captcha = new NoCaptchaWidget({selector: 'a.notranslate:not(.cursor-not-allowed)' });
        this._elements.rollButton = new ButtonWidget({selector: 'a.notranslate:not(.cursor-not-allowed)' });
        return this.run('doRoll');
    }
}
