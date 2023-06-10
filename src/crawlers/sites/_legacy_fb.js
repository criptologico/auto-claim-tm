function createFBProcessor() {
    let countdownMinutes;
    let timeout = new Timeout(); // this.maxSeconds);
    let captcha = new HCaptchaWidget();

    function run() {
        setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
    };
    function findCountdownOrRollButton() {
        if ( isCountdownVisible() ) {
            timeout.restart();
            countdownMinutes = +document.querySelectorAll('.free_play_time_remaining.hasCountdown .countdown_amount')[0].innerHTML + 1;
            let result = {};
            result.balance = readBalance();
            result.nextRoll = helpers.addMinutes(countdownMinutes.toString());

            shared.closeWindow(result);
            return;
        }

        if ( isRollButtonVisible() ) {
            // if (shared.getConfig()['fb.activateRPBonus']) {
            //     if (!document.getElementById('bonus_container_free_points')) {
            //         document.querySelector('a.rewards_link').click();
            //         activateBonus(0);
            //     }
            // }

            try {
                let doBonus = false; // true;
                if (doBonus) {
                    if (!document.getElementById('bonus_span_free_wof')) {
                        RedeemRPProduct('free_wof_5');
                        setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
                        return;
                    }
                }
            } catch { }

            /* For 'Play without captcha accounts' */
            if (!captcha.isUserFriendly) {
                clickRoll()
            } else {
                captcha.isSolved().then(() => { clickRoll(); });
            }
        } else {
            setTimeout(findCountdownOrRollButton, helpers.randomMs(2000, 5000));
        }
    };
    function isCountdownVisible() {
        return document.querySelectorAll('.free_play_time_remaining.hasCountdown .countdown_amount').length > 0;
    };
    function isHCaptchaVisible() {
        let hCaptchaFrame = document.querySelector('.h-captcha > iframe');
        if (hCaptchaFrame && hCaptchaFrame.isVisible()) {
            return true;
        }
        return false;
    };
    function isRollButtonVisible() {
        return document.getElementById('free_play_form_button').isVisible();
    };
    function clickRoll() {
        try {
            document.getElementById('free_play_form_button').click();
            setTimeout(processRunDetails, helpers.randomMs(3000, 10000));
        } catch (err) {
            shared.closeWithError(K.ErrorType.CLICK_ROLL_ERROR, err);
        }
    };
    function processRunDetails() {
        if (document.getElementById('winnings').isVisible()) {
            closePopup();

            let result = {};
            result.claimed = readClaimed();
            result.balance = readBalance();
            if(result.claimed != 0) {
                result.rolledNumber = readRolledNumber();
            }
            shared.closeWindow(result);
            return;
        }

        if (document.querySelector('.free_play_result_error').isVisible()) {
            shared.closeWithError(K.ErrorType.ROLL_ERROR, document.querySelector('.free_play_result_error').innerHTML);
            return;
        }

        if(document.getElementById('free_play_error').isVisible()) {
            shared.closeWithError(K.ErrorType.ROLL_ERROR, document.querySelector('.free_play_error').innerHTML);
            return;
        }

        if (document.getElementById('same_ip_error').isVisible()) {
            shared.closeWithError(K.ErrorType.ROLL_ERROR, document.getElementById('same_ip_error').innerHTML);
            return;
        }

        setTimeout(processRunDetails, helpers.randomMs(5000, 6000));
    };
    function closePopup() {
        let closePopupBtn = document.querySelector('.reveal-modal.open .close-reveal-modal');
        if (closePopupBtn) {
            closePopupBtn.click();
        }
    };
    function readRolledNumber() {
        let rolled = 0;
        try {
            rolled = parseInt([... document.querySelectorAll('#free_play_digits span')].map( x => x.innerHTML).join(''));
        } catch { }
        return rolled;
    };
    function readBalance() {
        let balance = 0;
        try {
            balance = document.getElementById('balance').innerHTML;
        } catch { }
        return balance;
    };
    function readClaimed() {
        let claimed = 0;
        try {
            claimed = document.getElementById('winnings').innerHTML;
        } catch { }
        return claimed;
    };
    //             function activateBonus(i) {
    //                 if(document.querySelector('#reward_point_redeem_result_container_div .reward_point_redeem_result_error')) {
    //                     let closeBtn = document.querySelector('#reward_point_redeem_result_container_div .reward_point_redeem_result_box_close')
    //                     if (closeBtn.isVisible()) {
    //                         closeBtn.click();
    //                     }
    //                 } else if (document.querySelector('#reward_point_redeem_result_container_div .reward_point_redeem_result_success')) {
    //                     let closeBtn = document.querySelector('#reward_point_redeem_result_container_div .reward_point_redeem_result_box_close')
    //                     if (closeBtn.isVisible()) {
    //                         closeBtn.click();
    //                         document.querySelector('#free_play_link_li a').click();
    //                         setTimeout(findCountdownOrRollButton, helpers.randomMs(10000, 12000));
    //                         return;
    //                     }
    //                 }

    //                 try {
    //                     let redeemButtons = document.querySelectorAll('#free_points_rewards button');
    //                     redeemButtons[i].click();
    //                     i = i + 1;
    //                 } catch (err) {
    //                 }

    //                 if(i > 4) {
    //                     document.querySelector('#free_play_link_li a').click();
    //                     setTimeout(findCountdownOrRollButton, helpers.randomMs(10000, 12000));
    //                     return;
    //                 }
    //                 setTimeout(activateBonus.bind(null, i), 5000);
    //             };
    return {
        run: run
    };
}
