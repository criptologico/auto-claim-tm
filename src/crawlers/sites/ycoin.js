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
            this.solveColorCaptcha();
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

    async solveColorCaptcha() {
        await wait(2000);
        let optionInputs = [...document.querySelectorAll('#newch input[type="submit"]')];
        let options = optionInputs.map(x => x.style.background);
        let wantedColor = document.querySelector('#newch p b');
        if (options.length > 0 && wantedColor) {
            try {
                let knownColors = Object.keys(nearestColor.STANDARD_COLORS);
                let toColorName = nearestColor.from(nearestColor.STANDARD_COLORS);

                options = options.map(x => toColorName(x).name);
                wantedColor = wantedColor.innerText.toLowerCase();
                if (wantedColor == 'grey') { wantedColor = 'gray'; }
                let solutionIdx = options.findIndex(x => x.includes(wantedColor));
                if (solutionIdx > -1) {
                    console.log('about to click #' + solutionIdx);
                    optionInputs[solutionIdx].click();
                    return;
                }
                if (wantedColor == 'green') {
                    wantedColor = 'lime';
                    solutionIdx = options.findIndex(x => x.includes(wantedColor));
                    if (solutionIdx > -1) {
                        console.log('about to click #' + solutionIdx);
                        optionInputs[solutionIdx].click();
                        return;
                    }
                }
                shared.devlog('No matching color found');
                await wait(5000);
                location.reload();
            } catch (err) {
                shared.devlog('Error looking for color to click');
                await wait(15000);
                location.reload();
            }
        } else {
            return this.solveColorCaptcha();
        }
    }

}

