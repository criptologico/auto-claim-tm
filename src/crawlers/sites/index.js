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
        msgDiv = document.querySelector('p.info.fail');
        if (msgDiv) {
            if (msgDiv.innerText.toLowerCase().includes('run out of bitcoin')) {
                shared.closeWithError(K.ErrorType.FAUCET_EMPTY, 'Out of Funds');
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

{{crawlers/sites/ctop.js}}

{{crawlers/sites/bscads.js}}

{{crawlers/sites/fpb.js}}

{{crawlers/sites/vieroll.js}}

{{crawlers/sites/grcroll.js}}

{{crawlers/sites/o24roll.js}}

// {{crawlers/sites/fcryptoroll.js}}

{{crawlers/sites/_legacy_fp.js}}

{{crawlers/sites/_legacy_fb.js}}

{{crawlers/sites/_legacy_bbtc.js}}

{{crawlers/sites/_legacy_bexchange.js}}

{{crawlers/sites/_legacy_sg.js}}

{{crawlers/sites/autocml.js}}
