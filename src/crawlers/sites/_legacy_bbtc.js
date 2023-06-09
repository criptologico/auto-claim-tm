function createBigBtcProcessor() {
    let timeout = new Timeout(this.maxSeconds);
    let countdownMinutes;
    let captcha = new HCaptchaWidget();
    let selectElement = {
        loadingDiv: function() {
            let loading = document.querySelector('#loading');
            if (loading && loading.isVisible()) {
                return true;
            } else {
                return false;
            }
        },
        addressInput: function() {
            return document.querySelector('#login input[name="address"]');
        },
        loginButton: function() {
            return document.querySelector('#login input[type="submit"]');
        },
        claimButton: function() {
            return document.getElementById('claimbutn');
        },
        countdown: function() { // "You have to wait\n60 minutes"
            let cd = document.getElementById('countdown');
            if(cd && cd.isVisible()) {
                return parseInt(cd.innerText);
            }
            return null;
        },
        claimedAmount: function() {
            let elm = document.querySelector('.alert.alert-success.pulse'); //"Yuppie! You won 2 satoshi!"
            if(elm && elm.isVisible()) {
                let val = parseInt(elm.innerText.replace(/\D/g, ''));
                if (Number.isInteger(val)) {
                    val = val / 100000000;
                }

                return val;
            } else {
                return null;
            }
        },
        balance: function() {
            let elm = document.querySelector('a b');
            if (elm && elm.isVisible()) {
                let val = parseInt(elm.innerText.replace(',', ''));
                if (Number.isInteger(val)) {
                    val = val / 100000000;
                }

                return val;
            } else {
                return null;
            }
        },
        error: function () {
            return null;
        }
    };

    function init() {
        // anti ad blocker workaround
        window.scrollTo(0, document.body.scrollHeight);
        let m = document.getElementById('main'); if (m) { m.style.display='block'; }
        m = document.getElementById('block-adb-enabled'); if (m) { m.style.display='none'; }
        m = document.getElementById('ielement'); if (m) { m.style.display='block'; }
        setInterval(() => {
            let frames = [...document.querySelectorAll('iframe')];
            frames.forEach(x => {
                if (!x.src.includes('hcaptcha')) {
                    x.remove()
                }
            });
        }, 5000);
    
        if (window.location.href.includes('/faucet')) {
            setTimeout(runFaucet, helpers.randomMs(12000, 14000));
            return;
        } else {
            setTimeout(run, helpers.randomMs(3000, 5000));
            return;
        }
    }

    function run() {
        try {
            setTimeout(waitIfLoading, helpers.randomMs(12000, 15000));
        } catch (err) {
            shared.closeWithErrors(K.ErrorType.ERROR, err);
        }
    };
    function doLogin() {
        let address = selectElement.addressInput();
        if(address && address.value != shared.getCurrent().params.address) {
            address.value = shared.getCurrent().params.address;
        } else {
            selectElement.loginButton().click();
            return;
        }
        setTimeout( doLogin , helpers.randomMs(1000, 2000));
    };
    function waitIfLoading() {
        if ( !selectElement.loadingDiv() ) {
            shared.devlog(`BigBtc: doing log in`);
            doLogin();
            return;
        } else {
            shared.devlog(`BigBtc: waiting for login form`);
        }

        setTimeout(waitIfLoading, helpers.randomMs(5000, 7000));
    };
    function runFaucet() {
        let claimedAmount = selectElement.claimedAmount();
        if(claimedAmount) {
            shared.devlog(`@runFaucet: has claimed amount: ${claimedAmount}`);
            processRunDetails();
            return;
        } else if (selectElement.countdown()) {
            // need to wait
            shared.devlog(`@runFaucet: has countdown: ${selectElement.countdown()}`);
            let result = {};

            shared.closeWindow(result);
        } else {
            shared.devlog(`BigBtc: waiting for captcha`);
            captcha.isSolved().then(() => { clickClaim(); });
        }
    }
    function clickClaim() {
        try {
            shared.devlog('Clicking roll button');
            selectElement.claimButton().click();
            return;
        } catch (err) {
            shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
        }
    };
    function processRunDetails() {
        shared.devlog(`BigBtc: processing results`);
        let claimedAmount = selectElement.claimedAmount();
        let balance = selectElement.balance();
        let countdown = selectElement.countdown();

        if (claimedAmount && balance) {
            let result = {};
            result.claimed = claimedAmount;
            result.balance = balance;
            // result.nextRoll = getDelayedNext();

            shared.closeWindow(result);
            return;
        }

        setTimeout(processRunDetails, helpers.randomMs(5000, 6000));
    };

    return {
        init: init
    };
}