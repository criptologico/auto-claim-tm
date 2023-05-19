    // class FreeEthereumIo extends Faucet {
    //     constructor() {
    //         let elements = {
    //             countdownMinutes: new CountdownWidget({selector: '#cislo1'}),
    //             rollButton: new ButtonWidget({selector: '#rollform button'}),
    //             balance: new ReadableWidget({selector: '#cryptovalue'}),
    //             claimed: new ReadableWidget({selector: '#info', parser: Parsers.freeEthereumIoClaimed}),
    //             rolledNumber: new ReadableWidget({selector: '#numberroll'}),
    //             captcha: new CBL01CaptchaWidget({selector: '#captchainput' }),
    //             success: new ReadableWidget({selector: '#info'})
    //         };
    //         let actions = {
    //             readRolledNumber: true,
    //             useFailureValidation: true
    //         };
    //         super(elements, actions);
    //     }

    //     init() {
    //         let url = new URL(this._url);
    //         if (url.pathname == '/free/') {
    //             if (document.querySelector('.h-captcha > iframe')) {
    //                 captcha = new HCaptchaWidget();
    //             }
    //             this.run();
    //         } else if (url.pathname == '/') {
    //             shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
    //         }
    //     }

    //     failureValidation() {
    //         let elm = document.querySelector('#info');
    //         if (elm && elm.innerText.toLowerCase().includes('incorrect')) {
    //             shared.devlog(`@CBL1 invalid answer`);
    //             document.getElementById('captchainput').value ='';
    //             window.location.reload();
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     }
    // }

    // class FreeLitecoin extends Faucet {
    //     constructor() {
    //         let elements = {
    //             countdownMinutes: new CountdownWidget({selector: '#cislo1'}),
    //             rollButton: new ButtonWidget({selector: '#roll'}),
    //             balance: new ReadableWidget({selector: '#money'}),
    //             claimed: new ReadableWidget({selector: '#info', parser: Parsers.trimNaNs}),
    //             rolledNumber: new ReadableWidget({selector: '#numberroll'}),
    //             captcha: new CBL01CaptchaWidget({selector: '#captchainput' }),
    //             success: new ReadableWidget({selector: '#info'})
    //         };
    //         let actions = {
    //             readRolledNumber: true,
    //             useFailureValidation: true
    //         };
    //         super(elements, actions);
    //     }

    //     init() {
    //         let url = new URL(this._url);
    //         if (url.pathname == '/') {
    //             if (document.querySelector('.h-captcha > iframe')) {
    //                 captcha = new HCaptchaWidget();
    //             }
    //             this.run();
    //         } else if (url.pathname.includes('/login')) {
    //             shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
    //         }
    //     }

    //     failureValidation() {
    //         let elm = document.querySelector('#numberroll');
    //         if (elm && elm.innerText.toLowerCase().includes('incorrect')) {
    //             shared.devlog(`@CBL1 invalid answer`);
    //             document.getElementById('captchainput').value ='';
    //             window.location.reload();
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     }
    // }

    // class FreeDogeIo extends Faucet {
    //     constructor() {
    //         let elements = {
    //             countdownMinutes: new CountdownWidget({selector: '#cislo1'}),
    //             rollButton: new ButtonWidget({selector: '.btn.btn-success'}),
    //             balance: new ReadableWidget({selector: '#cryptovalue'}),
    //             claimed: new ReadableWidget({selector: '#info', parser: Parsers.freeEthereumIoClaimed}),
    //             rolledNumber: new ReadableWidget({selector: '#numberroll'}),
    //             captcha: new CBL01CaptchaWidget({selector: '#captchainput' }),
    //             success: new ReadableWidget({selector: '#info'})
    //         };
    //         let actions = {
    //             readRolledNumber: true,
    //             useFailureValidation: true
    //         };
    //         super(elements, actions);
    //     }

    //     init() {
    //         let url = new URL(this._url);
    //         if (url.pathname == '/free/') {
    //             if (document.querySelector('.h-captcha > iframe')) {
    //                 captcha = new HCaptchaWidget();
    //             }
    //             this.run();
    //         } else if (url.pathname == '/') {
    //             shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
    //         }
    //     }

    //     failureValidation() {
    //         let elm = document.querySelector('#info');
    //         if (elm && elm.innerText.toLowerCase().includes('incorrect')) {
    //             shared.devlog(`@CBL1 invalid answer`);
    //             document.getElementById('captchainput').value = '';
    //             window.location.reload();
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     }
    // }

    // class KingBiz extends Faucet {
    //     constructor() {
    //         let elements = {
    //             countdownMinutes: new CountdownWidget({selector: '#show_countdown_clock', parser: Parsers.kingBizCountdown}),
    //             rollButton: new ButtonWidget({selector: 'input[value="ROLL"]:last-of-type'}),
    //             balance: new ReadableWidget({selector: 'li.top_balance', parser: Parsers.trimNaNs}),
    //             claimed: new ReadableWidget({selector: '#modal_header_msg', parser: Parsers.freeEthereumIoClaimed}),
    //             rolledNumber: new ReadableWidget({selector: '#show_roll_numbers span', parser: Parsers.innerTextJoinedToInt}),
    //             captcha: new HCaptchaWidget(),
    //             success: new ReadableWidget({selector: '#show_roll_numbers span'})
    //         };
    //         let actions = {
    //             readRolledNumber: true,
    //             preRun: true
    //         };
    //         super(elements, actions);
    //     }

    //     init() {
    //         if (this._url.includes('/faucet')) {
    //             this.run();
    //             return;
    //         } else if (this._url.includes('/login')) {
    //             shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
    //             return;
    //         }
    //     }

    //     async preRun() {
    //         let dangerDivs = document.querySelectorAll('.alert.alert-danger');

    //         if (dangerDivs.length > 0) {
    //             let flag = [...dangerDivs].find(x => x.innerText.includes('you need to confirm your email'));
    //             let txt = dangerDivs[0].innerText;
    //             if (flag) {
    //                 return shared.closeWithError(K.ErrorType.VERIFY_EMAIL, 'You need to verify your email address at the site. Go to ' + (new URL('settings', window.location)).href + ' to send the email.');
    //             }
    //         }
    //     }
    // }

    // class CPUFaucet extends Faucet {
    //     constructor() {
    //         let elements = {
    //             countdownMinutes: new CountdownWidget({selector: '#refilltimer', parser: Parsers.stormGainCountdown}), // <span id="refilltimer">00:47:19</span>
    //             rollButton: new ButtonWidget({selector: '#enablebtncaptca'}),
    //             balance: new ReadableWidget({selector: '#topcoins', parser: Parsers.trimNaNs}),
    //             claimed: new ReadableWidget({selector: '#modal_header_msg', parser: Parsers.freeEthereumIoClaimed}),
    //             captcha: new HCaptchaWidget(),
    //             success: new ReadableWidget({selector: '#show_roll_numbers span'})
    //         };
    //         let actions = {
    //             readRolledNumber: false,
    //             preRun: false,
    //             altValidation: true
    //         };
    //         super(elements, actions);
    //     }

    //     init() {
    //         if (this._url.includes('/faucet')) {
    //             // Pick faucet
    //             // Faucet list: let abc = [...document.querySelectorAll('.faucet-list-item')].map(x => x.parentElement)
    //             this.run();
    //             return;
    //         } else if (this._url.includes('/login')) {
    //             shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
    //             return;
    //         } else if (this._url.endsWith('_faucet')) {
    //             // Click claim now
    //             // Button might be: document.querySelector('.coinpayu-faucet-claim-msg button')
    //         } else if (this._url.endsWith('/claim')) {
    //             // Click to see captcha.. maybe: document.querySelector('.faucet-claim-box-button button')
    //             // and good luck...
    //         }
    //     }
    // }

    // class CBGRoll extends Faucet {
    //     constructor() {
    //         let elements = {
    //             countdownMinutes: new CountdownWidget({selector: 'p.alert.alert-info', parser: Parsers.trimNaNs}),
    //             // rollButton: new SubmitWidget({selector: '#wpbf-claim-form'}),
    //             rollButton: new SubmitWidget({selector: '#wpbf-claim-form input[type="submit"]'}),
    //             claimed: new ReadableWidget({selector: 'div.alert.alert-success', parser: Parsers.cbgClaimed}),
    //             captcha: new HCaptchaWidget(),
    //             addressInput: new TextboxWidget({ selector: '#wpbf_address' }),
    //             success: new ReadableWidget({selector: 'div.alert.alert-success a[href="https://faucetpay.io/?r=2480995"]'})
    //         };
    //         let actions = {
    //             readRolledNumber: false,
    //             readClaimed: true,
    //             readBalance: false,
    //             preRun: true,
    //             preSaveResult: true
    //         };
    //         super(elements, actions);
    //     }

    //     init() {
    //         this._docType = (window != window.top ? 'IFRAME' : 'TOP');
    //         shared.devlog(`@CBG init (${window.location.host}) => ${this._docType}`);
    //         if (this._docType == 'IFRAME') {
    //             this.run();
    //             return;
    //         } else if(this._docType == 'TOP' && window.location.host.includes('.cryptobaggiver.com')) {
    //             // running iframe as top
    //             this.run();
    //             return;
    //         } else {
    //             //TODO: wait and close after claiming on the iframe
    //             return;
    //         }
    //     }

    //     async preRun() {
    //         shared.devlog(`@CBG preRun`);
    //         //TODO: fill INPUT ADDRESS

    //         let dangerDivs = document.querySelectorAll('div.alert.alert-danger');

    //         if (dangerDivs.length > 0) {
    //             return shared.closeWithError(K.ErrorType.ERROR, dangerDivs[0].innerText);
    //         }

    //         if (this._elements.addressInput.isUserFriendly) {
    //             if (this._elements.addressInput.value != shared.getCurrent().params.address) {
    //                 shared.devlog(`@CBG addressInput Found. Using ${shared.getCurrent().params.address}`);
    //                 this._elements.addressInput.value = shared.getCurrent().params.address;
    //             } else {
    //                 shared.devlog(`@CBG addressInput already filled`);
    //             }
    //         } else {
    //             shared.devlog(`@CBG addressInput not found`);
    //             return this.preRun();
    //         }

    //         return true;
    //     }

    //     async detectAction() {
    //         shared.devlog(`@CBGdetectAction Custom (${this._docType})`);
    //         return wait().then( () => {
    //             if ( this.isCountdownVisible() ) {
    //                 shared.devlog('needToWait');
    //                 return Promise.resolve({action: 'needToWait'});
    //             } else if ( this.isRollButtonVisible() ) {
    //                 shared.devlog('doRoll');
    //                 return Promise.resolve({action: 'doRoll'});
    //             } else if ( this._elements.success.isUserFriendly ) {
    //                 shared.devlog('Successful run');
    //                 return this.updateResult();
    //             } else {
    //                 return this.detectAction();
    //             }
    //         });
    //     }

    //     clickRoll() {
    //         try {
    //             shared.devlog('Clicking roll button');
    //             Element.prototype._addEventListener = Element.prototype.addEventListener;
    //             Element.prototype.addEventListener = function () {
    //                 let args = [...arguments]
    //                 let temp = args[1];
    //                 args[1] = function () {
    //                     let args2 = [...arguments];
    //                     args2[0] = Object.assign({}, args2[0])
    //                     args2[0].isTrusted = true;
    //                     return temp(...args2);
    //                 }
    //                 return this._addEventListener(...args);
    //             }
    //             this._elements.rollButton.click();
    //             this.validateRun();
    //             // setTimeout(() => { this.validateRun() }, helpers.randomMs(10000, 12000));
    //         } catch (err) {
    //             shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
    //         }
    //     }

    //     preSaveResult() {
    //         if (this._docType == 'IFRAME') {
    //             this._result.closeParentWindow = true;
    //         } else if(this._docType == 'TOP' && window.location.host.includes('.cryptobaggiver.com')) {
    //             this._result.closeParentWindow = true;
    //         }
    //     }
    // }

    // class G8 extends Faucet {
    //     constructor() {
    //         let elements = {
    //             preRunButton: new ButtonWidget({selector: 'button[data-target="#captchaModal"]'}),
    //             claimsLeft: new ReadableWidget({selector: '.alert.alert-info.fade.show', parser: Parsers.g8ClaimsLeft}),
    //             rollButton: new ButtonWidget({selector: '#login'}),
    //             claimed: new ReadableWidget({selector: '.alert.alert-success.fade.show', parser: Parsers.cbgClaimed}),
    //             captcha: new HCaptchaWidget(),
    //             success: new ReadableWidget({selector: '.alert.alert-success.fade.show'}),
    //             addressInput: new TextboxWidget({ selector: '#address' }),
    //             outOfFundsDivSelector: '.alert.alert-danger'
    //         };
    //         let actions = {
    //             readTimeLeft: false,
    //             readRolledNumber: false,
    //             readClaimed: true,
    //             readBalance: false,
    //             preRun: true,
    //             checkIfOutOfFunds: true
    //         };
    //         super(elements, actions);
    //     }

    //     init() {
    //         shared.devlog(`@G8 init`);
    //         this.run();
    //         return;
    //     }

    //     async preRun() {
    //         shared.devlog(`@G8 preRun`);
    //         return wait().then( () => {
    //             if (document.querySelectorAll('.alert.alert-danger.fade.show').length > 0) {
    //                 let divErrMsg = document.querySelectorAll('.alert.alert-danger.fade.show')[0].innerText;
    //                 shared.devlog(`@G8 Claim error message: ${divErrMsg}`);
    //                 if(divErrMsg != 'Session invalid, try again') {
    //                     shared.closeWithError(K.ErrorType.ERROR, divErrMsg);
    //                     return;
    //                 }
    //             }

    //             if(this._elements.claimsLeft.isUserFriendly) {
    //                 shared.devlog(`@G8 ClaimsLeft Check`);
    //                 try {
    //                     shared.devlog(`@G8 ClaimsLeft: ${this._elements.claimsLeft.value}`);
    //                     if (+this._elements.claimsLeft.value <= 0) {
    //                         shared.closeWithError(K.ErrorType.ERROR, 'No more claims left today');
    //                         return;
    //                     }
    //                 } catch (err) {
    //                     shared.devlog(`@G8 ClaimsLeft: error reading claims left: ${err}`);
    //                 }
    //             }


    //             if (this._elements.preRunButton.isUserFriendly) {
    //                 shared.devlog(`@preRunButton is userfriendly`);
    //                 if (this._elements.addressInput.isUserFriendly) {
    //                     if (this._elements.addressInput.value != shared.getCurrent().params.address) {
    //                         this._elements.addressInput.value = shared.getCurrent().params.address;
    //                     }

    //                     if (!this._elements.preRunButton.isUserFriendly.disabled) {
    //                         return this._elements.preRunButton.click();
    //                     }
    //                 }
    //             }
    //             return this.preRun();
    //         });
    //     }

    //     async detectAction() {
    //         shared.devlog(`@detectAction Custom`);
    //         return wait().then( () => {
    //             if ( this.isCountdownVisible() ) {
    //                 return Promise.resolve({action: 'needToWait'});
    //             } else if ( this.isRollButtonVisible() ) {
    //                 return Promise.resolve({action: 'doRoll'});
    //             } else if ( this._elements.success.isUserFriendly ) {
    //                 shared.devlog('Successful run');
    //                 return this.updateResult();
    //             } else {
    //                 return this.detectAction();
    //             }
    //         });
    //     }
    // }
