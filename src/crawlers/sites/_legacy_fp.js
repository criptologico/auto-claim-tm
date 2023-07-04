class FPPtc extends Faucet {
    constructor() {
        let elements = {
            claimButton: new ButtonWidget({selector: '#pop-up button.purpleButton:not([disabled])'}),
            claimButtonDisabled: new ButtonWidget({selector: '#pop-up button.purpleButton'}),
            openPtcButton: new ButtonWidget({fnSelector: function() {
                let btn = [...document.querySelectorAll('button')].filter(x => x.innerText.toLowerCase().includes('view'));
                return (btn.length > 0) ? btn[0] : null;
            }}),
            claimed: new ReadableWidget({fnSelector: function() {
                let divSpanSuccessClaim = [...document.querySelectorAll('div span')].filter(x => x.innerText.toLowerCase().includes('successfully credited with'));
                return (divSpanSuccessClaim.length > 0) ? divSpanSuccessClaim[0] : null;
            }, parser: Parsers.trimNaNs}),
            captcha: new GeeTestCaptchaWidget(),
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
            ptcList: '/ptc',
            ptcSingleView: '/ptc/view',
            login: '/account/login',
            dashboard: '/user-admin'
        };
        this.useUrlListener();
    }

    init() {
        shared.devlog(`@FP => init`);
        if (this._url.includes(this._paths.ptcSingleView)) {
            shared.devlog(`@FP => @ptcSingleView`);
            this.doPtcList(true);
            // return this.runDashboard();
            return;
        } else if (this._url.includes(this._paths.ptcList)) {
            shared.devlog(`@FP => @ptcList`);
            this.doPtcList();
            // return wait().then( () => { this.run(); });
            return;
        } else if (this._url.includes(this._paths.login)) {
            shared.devlog(`@FP => @login`);
            this.doLogin();
            return;
        } else if (this._url.includes(this._paths.dashboard)) {
            shared.devlog(`@FP => @dashboard/account`);
            return;
        }

        shared.devlog(`@FP => No url match! Might be home...`);
        return;
    }

    hasExpired() {
        return document.body.innerText.includes('The session has expired');
    }

    getETAWaitSeconds(btn) {
        try {
            let seconds = btn.nextSibling.firstChild.innerText.split('s')[0];
            return +seconds;
        } catch (err) {
            shared.devlog('Unable to read seconds...');
            console.log(err);
        }
        return 15;
    }

    getPayout(btn) {
        this.lastClaimed = 0;
        try {
            let payout = btn.nextSibling.lastChild.innerText.split(' ')[0];
            this.lastClaimed = +payout;
        } catch (err) {
            shared.devlog('Unable to read payout...');
            console.log(err);
        }
    }

    async validateClaim() {
        await wait(300);
        if (this.hasExpired()) {
            shared.devlog('Claim was expired');
            await wait(2000);
            return false;
        }
        if (this._elements.claimed.isUserFriendly) {
            let claimed = this._elements.claimed.value;
            if (claimed) {
                shared.devlog('Returning claimed:', claimed);
                await this.storeClaim();
                await wait(2000);
                return claimed;
            }
        }
        shared.devlog('Still waiting...');
        return this.validateClaim();
    }

    async storeClaim() {
        let result = shared.getResult();
        result.ptcsDone = (result.ptcsDone ?? 0) + 1;
        result.claimed = +(result.claimed ?? 0) + +this.lastClaimed;
        this.lastClaimed = 0;
        // result.nextRoll = helpers.addMs(helpers.getRandomMs(shared.getConfig()['fp.hoursBetweenRuns'] * 60, 2)); // Wait hoursBetweenRuns +/- 1% //TODO: SLEEP CHECK
        shared.devlog(`Working but ${result.ptcsDone} PTCs done claiming ${result.claimed} USDT`);
        shared.updateWithoutClosing(result, 'WORKING');
    }

    async confirmClaim() {
        shared.devlog('@confirmClaim');
        // Confirming claim... wait for completion (geetest popup)
        let captcha = new GeeTestCaptchaWidget();

        shared.devlog('Waiting for Geetest');
        await captcha.isSolved();
        if (!this._elements.claimButton.isUserFriendly) {
            shared.devlog('Confirm claim button not found!!!');
            return;
        }
        this._elements.claimButton.click();
        let validation = await this.validateClaim();
        shared.devlog('After claim validation' + validation);
        return this.doPtcList();
    }

    async startPtc() {
        shared.devlog('@startPtc');
        shared.devlog('Opened tabs with document.referrer = faucetpay.io should be closed here...');
        this._elements.openPtcButton.click();
        let minSeconds = this.getETAWaitSeconds(this._elements.openPtcButton.isUserFriendly);
        this.getPayout(this._elements.openPtcButton.isUserFriendly);
        shared.devlog('TODO: another option is to wait based on minSeconds:' + minSeconds);
        await wait(4000);
        return this.waitPtcSeconds();
    }

    async waitPtcSeconds() {
        shared.devlog('@waitPtcSeconds');
        if (this._elements.claimButtonDisabled.isUserFriendly) {
            shared.devlog('Wait completed. Claim button found');
            return this.confirmClaim();
        }
        if (!document.title.includes('PTC Ads') && document.title.includes('s |')) {
            shared.devlog('Waiting for ptc timeout: ' + document.title);
            await wait(5000);
            return this.waitPtcSeconds();
        }
        let iframe = document.querySelector('iframe[title="ptc-view"]');
        if (document.title.includes('PTC Ads') && iframe) {
            shared.devlog('Waiting for iframe ptc timeout');
            await wait(5000);
            return this.waitPtcSeconds();
        }
        shared.devlog('Wait completed');
        return this.confirmClaim();
    }

    async doPtcList(isSingle = false) {
        shared.devlog('@doPtcList');
        if (document.title.includes('PTC Ads') || document.title.includes('Complete Visit')) {
            if (this._elements.claimButtonDisabled.isUserFriendly) {
                return this.confirmClaim();
            } else {
                // Need to open a new PTC...
                if (this._elements.openPtcButton.isUserFriendly) {
                    return this.startPtc();
                } else {
                    shared.devlog('No more PTCs left...');
                    shared.closeWindow();
                    return;
                }
            }
        }
    }

    async doLogin() {
        let username = document.querySelector('input');
        let password = document.querySelector('input[type="password"]');
        let captcha = new GeeTestCaptchaWidget();
        let btn = document.querySelector('button[type="submit"');
        if (username && password && btn && username.value != '' && password.value != '') {
            //WAIT FOR CAPTCHA => THEN CLICK BTN
            shared.devlog('Waiting for GeeTest...');
            await captcha.isSolved();
            shared.devlog('Solved. Submiting');
            btn.click();
            return;
        } else {
            shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
        }
    }
}

// function createFPProcessor() {
//     let timeout = new Timeout(); //this.maxSeconds);
//     let captcha = new HCaptchaWidget();

//     function init() {
//         if(window.location.href.includes('ptc/view')) {
//             addDuration();
//             ptcSingle();
//         } else if (window.location.href.includes('ptc')) {
//             ptcList();
//         } else if (window.location.href.includes('account/login')) {
//             tryLogin();
//             return;
//         } else if (window.location.href.includes('page/user-admin')) {
//             window.location.href = 'https://faucetpay.io/ptc';
//         }
//         return;
//     }

//     async function tryLogin() {
//         let username = document.querySelector('input');
//         let password = document.querySelector('input[type="password"]');
//         let captcha = new GeeTestCaptchaWidget();
//         let btn = document.querySelector('button[type="submit"');
//         if (username && password && btn && username.value != '' && password.value != '') {
//             //WAIT FOR CAPTCHA => THEN CLICK BTN
//             shared.devlog('Waiting for GeeTest...');
//             await captcha.isSolved();
//             shared.devlog('Solved. Submiting');
//             btn.click();
//             return;
//         } else {
//             shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
//         }
//     }

//     function addDuration() {
//         let duration = document.querySelector('#duration');
//         if(duration && !isNaN(duration.innerText)) {
//             timeout.restart(parseInt(duration.innerText));
//         } else {
//             setTimeout(addDuration, 10000);
//         }
//     }

//     function ptcList() {
//         let result;
//         let runMsgDiv = document.querySelector('.alert.alert-info');
//         if (runMsgDiv) {
//             let runMsg = runMsgDiv.innerHTML;
//             if (runMsg.includes('invalid captcha')) {
//                 // Warn? Usually an error if ptcList is refreshed
//             } else if (runMsg.includes('Good job')) {
//                 // "Good job! You have been credited with 0.00000001 BTC."
//                 try {
//                     let idx = runMsg.search(/\d/);
//                     let claimed = parseFloat(runMsg.slice(idx, idx + 10));
//                     result = shared.getResult();
//                     result.claimed = (result.claimed ?? 0) + claimed;
//                     // result.nextRoll = helpers.addMs(helpers.getRandomMs(shared.getConfig()['fp.hoursBetweenRuns'] * 60, 2)); // Wait hoursBetweenRuns +/- 1% //TODO: SLEEP CHECK
//                     shared.updateWithoutClosing(result, 'WORKING');
//                 } catch { }
//             }
//         }

//         if ([...document.querySelectorAll('b')].filter(x => x.innerText.includes('Whoops!')).length > 0) {
//             result = shared.getResult();
//             shared.closeWindow(result);
//             return;
//         }

//         let adButtons = [...document.querySelectorAll('button')].filter(x => x .innerHTML.includes('VISIT AD FOR'));

//         if (adButtons.length > 0) {
//             if (shared.getConfig()['fp.randomPtcOrder']) {
//             adButtons[helpers.randomInt(0, adButtons.length-1)].click();
//             } else {
//                 adButtons[0].click();
//             }
//             return;
//         }

//         setTimeout(ptcList, helpers.randomMs(10000, 12000));
//     }

//     function ptcSingle() {
//         if(document.querySelector('input[name="complete"]').isVisible()) {
//             captcha.isSolved().then(() => { clickClaim(); });
//         } else if (document.querySelector('body').innerText.toLowerCase().includes('ad does not exist')) {
//             window.location.href = 'https://faucetpay.io/ptc';
//         } else {
//             setTimeout(ptcSingle, helpers.randomMs(5000, 6000));
//         }
//     }

//     function clickClaim() {
//         let input = document.querySelector('input[name="complete"]');
//         input.focus();
//         input.onclick = '';
//         input.click();
//         //force close with timeout in case it's still opened
//         setTimeout(shared.closeWithError.bind(null, 'TIMEOUT', 'Timed out after clicking a CLAIM button.'), helpers.minToMs(shared.getConfig()['defaults.timeout']));
//     }

//     return {
//         init: init
//     };
// }
