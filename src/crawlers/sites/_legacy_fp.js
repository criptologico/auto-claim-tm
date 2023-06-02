// class FPPtc extends Faucet {
//     constructor() {
//         let elements = {
//             claimButton: new ButtonWidget({selector: '#pop-up button:not([disabled])'}),
//             openPtcButton: new ButtonWidget({fnSelector: function() {
//                 let btn = [...document.querySelectorAll('button')].filter(x => x.innerText.toLowerCase().includes('view'));
//                 return (btn.length > 0) ? btn[0] : null;
//             }}),
//             claimed: new ReadableWidget({fnSelector: function() {
//                 let divSpanSuccessClaim = [...document.querySelectorAll('div span')].filter(x => x.innerText.toLowerCase().includes('successfully credited with'));
//                 return (divSpanSuccessClaim.length > 0) ? divSpanSuccessClaim[0] : null;
//             }, parser: Parsers.trimNaNs}),
//             captcha: new GeeTestCaptchaWidget(),
//             success: new ReadableWidget({selector: 'div.ml-3.w-0 p span.text-yellow-500.font-medium'})
//         };
//         let actions = {
//             isMultiClaim: true,
//             preRoll: true,
//             postRun: true,
//             readRolledNumber: false,
//         };
//         super(elements, actions);
//         this._paths = {
//             ptcList: '/ptc',
//             ptcSingleView: '/ptc/view',
//             login: '/account/login',
//             dashboard: '/user-admin'
//         };
//         this.useUrlListener();
//     }

//     init() {
//         shared.devlog(`@FP => init`);
//         if (this._url.includes(this._paths.ptcSingleView)) {
//             shared.devlog(`@FP => @ptcSingleView`);
//             // return this.runDashboard();
//             return;
//         } else if (this._url.includes(this._paths.ptcList)) {
//             shared.devlog(`@FP => @ptcList`);
//             // return wait().then( () => { this.run(); });
//             return;
//         } else if (this._url.includes(this._paths.login)) {
//             shared.devlog(`@FP => @login`);
//             return;
//         } else if (this._url.includes(this._paths.dashboard)) {
//             shared.devlog(`@FP => @dashboard/account`);
//             return;
//         }

//         shared.devlog(`@FP => No url match! Might be home...`);
//         return;
//     }
// }

function createFPProcessor() {
    let timeout = new Timeout(this.maxSeconds);
    let captcha = new HCaptchaWidget();

    function init() {
        if(window.location.href.includes('ptc/view')) {
            addDuration();
            ptcSingle();
        } else if (window.location.href.includes('ptc')) {
            ptcList();
        } else if (window.location.href.includes('account/login')) {
            tryLogin();
        } else if (window.location.href.includes('page/user-admin')) {
            window.location.href = 'https://faucetpay.io/ptc';
        }
        return;
    }

    function tryLogin() {
        let username = document.querySelector('input[name="user_name"');
        let password = document.querySelector('input[name="password"');
        let captcha = document.querySelector('.h-captcha > iframe');
        let btn = document.querySelector('button[type="submit"');
        if (username && password && btn && username.value != '' && password.value != '') {
            //WAIT FOR CAPTCHA => THEN CLICK BTN
            if ( captcha && captcha.getAttribute('data-hcaptcha-response').length > 0 ) {
                btn.click();
            } else {
                setTimeout(tryLogin, helpers.randomMs(9000, 11000));
            }
        } else {
            shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
        }
    }

    function addDuration() {
        let duration = document.querySelector('#duration');
        if(duration && !isNaN(duration.innerText)) {
            timeout.restart(parseInt(duration.innerText));
        } else {
            setTimeout(addDuration, 10000);
        }
    }

    function ptcList() {
        let result;
        let runMsgDiv = document.querySelector('.alert.alert-info');
        if (runMsgDiv) {
            let runMsg = runMsgDiv.innerHTML;
            if (runMsg.includes('invalid captcha')) {
                // Warn? Usually an error if ptcList is refreshed
            } else if (runMsg.includes('Good job')) {
                // "Good job! You have been credited with 0.00000001 BTC."
                try {
                    let idx = runMsg.search(/\d/);
                    let claimed = parseFloat(runMsg.slice(idx, idx + 10));
                    result = shared.getResult();
                    result.claimed = (result.claimed ?? 0) + claimed;
                    // result.nextRoll = helpers.addMs(helpers.getRandomMs(shared.getConfig()['fp.hoursBetweenRuns'] * 60, 2)); // Wait hoursBetweenRuns +/- 1% //TODO: SLEEP CHECK
                    shared.updateWithoutClosing(result, 'WORKING');
                } catch { }
            }
        }

        if ([...document.querySelectorAll('b')].filter(x => x.innerText.includes('Whoops!')).length > 0) {
            result = shared.getResult();
            shared.closeWindow(result);
            return;
        }

        let adButtons = [...document.querySelectorAll('button')].filter(x => x .innerHTML.includes('VISIT AD FOR'));

        if (adButtons.length > 0) {
            if (shared.getConfig()['fp.randomPtcOrder']) {
            adButtons[helpers.randomInt(0, adButtons.length-1)].click();
            } else {
                adButtons[0].click();
            }
            return;
        }

        setTimeout(ptcList, helpers.randomMs(10000, 12000));
    }

    function ptcSingle() {
        if(document.querySelector('input[name="complete"]').isVisible()) {
            captcha.isSolved().then(() => { clickClaim(); });
        } else if (document.querySelector('body').innerText.toLowerCase().includes('ad does not exist')) {
            window.location.href = 'https://faucetpay.io/ptc';
        } else {
            setTimeout(ptcSingle, helpers.randomMs(5000, 6000));
        }
    }

    function clickClaim() {
        let input = document.querySelector('input[name="complete"]');
        input.focus();
        input.onclick = '';
        input.click();
        //force close with timeout in case it's still opened
        setTimeout(shared.closeWithError.bind(null, 'TIMEOUT', 'Timed out after clicking a CLAIM button.'), helpers.minToMs(shared.getConfig()['defaults.timeout']));
    }

    return {
        init: init
    };
}
