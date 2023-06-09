function createBestChangeProcessor() {
    let timeout = new Timeout(this.maxSeconds);
    let countdownMinutes;
    let captcha = new HCaptchaWidget({selector: '.hcaptcha > iframe'});
    let elements = {
        captcha: function() {
            return document.querySelector('.hcaptcha > iframe');
        },
        container: function() {
            return document.querySelector('#info_bonus');
        },
        containerOpener: function() {
            return document.querySelector('#tab_bonus a');
        },
        addressInput: function() {
            return document.querySelector('#bonus_purse');
        },
        claimButton: function() {
            return document.querySelector('#bonus_button');
        },
        countdown: function() { // Time left: mm:ss
            let elm = document.querySelector('#bonus_button');
            try {
                if (elm.value) {
                    let timeLeft = elm.value.split(':');
                    if (timeLeft.length > 1) {
                        return parseInt(timeLeft[1]);
                    }
                }
            } catch (err) {
                return null;
            }
        },
        claimedAmount: function() {
            let elm = document.querySelector("#bonus_status b");
            try {
                let sats = elm.innerText.replace(/\D/g, '');
                return sats / 100000000;
            } catch (err) {
                return null;
            }
        },
        balance: function() {
            let elm = document.querySelector("#faucet_unpaid_balance b");
            try {
                let sats = elm.innerText.replace(/\D/g, '');
                return sats / 100000000;
            } catch (err) {
                return null;
            }
        }
    };

    function init() {
        run();
    }

    function run() {
        try {
            if (!elements.container().isUserFriendly()) {
                let co = elements.containerOpener();
                if(co.isUserFriendly()) {
                    co.onclick = co.onmousedown;
                    co.click();
                }
            }
            setTimeout(findCountdownOrRoll, helpers.randomMs(4000, 5000));
        } catch (err) {
            shared.closeWithErrors(K.ErrorType.ERROR, err);
        }
    };
    function findCountdownOrRoll() {
        let countdown = elements.countdown();
        if(countdown) {
            let result = { };
            result.nextRoll = helpers.addMinutes(countdown.toString());

            shared.closeWindow(result);
            return;
        }

        let ai = elements.addressInput();

        if (ai.isUserFriendly()) {
            if (ai.value != shared.getCurrent().params.address) {
                ai.value = shared.getCurrent().params.address;
            }
            captcha.isSolved().then(() => { clickClaim(); });
            return;
        }

        setTimeout(findCountdownOrRoll, helpers.randomMs(10000, 12000));
    };

    function clickClaim() {
        try {
            shared.devlog('Clicking claim button');
            let btn = elements.claimButton();
            if(btn.isUserFriendly()) {
                shared.devlog('Button found');
                btn.click();
                setTimeout(processRunDetails, helpers.randomMs(4000, 8000));
            } else {
                shared.devlog('Button not found. Retrying in 5 secs');
                setTimeout(clickClaim, helpers.randomMs(4000, 8000));
            }
            return;
        } catch (err) {
            shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
        }
    };

    function processRunDetails() {
        let claimedAmount = elements.claimedAmount();
        let balance = elements.balance();

        if (claimedAmount && balance) {
            let result = {};
            result.claimed = claimedAmount;
            result.balance = balance;
            // result.nextRoll = helpers.addMinutes(60);

            shared.closeWindow(result);
            return;
        }

        setTimeout(processRunDetails, helpers.randomMs(5000, 6000));
    };

    return {
        init: init
    };
}