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
                setCredentials: false
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

