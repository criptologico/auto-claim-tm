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
