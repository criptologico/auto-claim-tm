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
