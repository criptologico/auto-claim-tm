class BFRoll extends Faucet {
    constructor(coinPrefix, trySpin = false) {
        let elements = {
            preRunButton: new ButtonWidget({selector: '.free-box.free-box__' + coinPrefix + ' button'}), //'#' + coinPrefix + '_free_box_withdraw_page'}),
            // captcha: new HCaptchaWidget({selector: '.free-box-withdraw__captcha iframe'}),
            captcha: new NoCaptchaWidget({ selector: '.free-box-withdraw__footer .button_red.button_center.button_fullwidth' }),
            //rollButton: new ButtonWidget({selector: '.modal__container button.button.button_md.button_red.fullwidth'}), //'#free_box_withdraw_popup'}),
            rollButton: new ButtonWidget({selector: '.free-box-withdraw__footer .button_red.button_center.button_fullwidth'}),
            success: new ReadableWidget({selector: '.modal:not(.free-box-withdraw,fury-wheel-modal), .vue-notification-template.my-notify.success'}),
            claimed: new ReadableWidget({selector: '.free-box.free-box__' + coinPrefix, parser: Parsers.bfBoxClaimed}),
            progressBar: new ReadableWidget({selector: '.free-box.free-box__' + coinPrefix + ' .free-box__progress-bar progress'}),
            // loggedElm: new ReadableWidget({selector: '.btn-container .btn-wallet'}),
            // notLoggedElm: new ReadableWidget({selector: '.btn-container.no-logged'}),
        };

        let actions = {
            preRun: true,
            readClaimed: true,
            readBalance: false,
            readRolledNumber: false
        };
        super(elements, actions);
        this.coinPrefix = coinPrefix;
        this.trySpin = trySpin;
    }

    init() {
        if (this._url.includes('https://betfury.io/boxes/all')) {
            this.run();
            return;
        } else {
            return;
        }
    }

    async spin() {
        shared.devlog('Spinning...');
        // TODO: wait for popup
        // Click wheel
        let clickables = document.querySelectorAll('.fury-wheel__wheel-btn, .fury-wheel__btn-wrap, .fury-wheel__btn-content, .fury-wheel__btn-img');
        if (clickables.length > 0) {
            clickables[Math.floor(Math.random()*clickables.length)].click();
            // Wait for result and save it somewhere
            // continue with the claim or just refresh the page to make it easier...
            wait(15000).then ( () => { shared.closeWindow(this._result); } );
        }
        return;
    }

    async preRun() {
        return wait().then( () => {
            try {
                // close opened popups
                let popup = document.querySelector('.modal-wrapper .modal:not(.free-box-withdraw,fury-wheel-modal) .modal__btn-close');
                // let popup = document.querySelector('.modal-wrapper .modal:not(.free-box-withdraw) .modal__btn-close');
                if (popup) {
                    popup.click();
                    popup.click(); // twice
                }
            } catch (err) {}

            if (this.trySpin) {
                let spinUnavailable = document.querySelector('.bonus.bonus_furywheel.wait');
                if (spinUnavailable) {
                    shared.devlog('Spin not available');
                } else {
                    let spinBtn = document.querySelector('.wheel-amin'); //bonus bonus_furywheel wait
                    if (spinBtn) {
                        shared.devlog('Attempting spin');
                        spinBtn.click();
                        wait(10000).then ( () => { this.spin() } );
                        return wait(60000).then ( () => { this.preRun(); } );
                    }
                }
            }

            // LOGIN CHECK REMOVED (throwing inconsistences)
            // if (this._elements.notLoggedElm && this._elements.notLoggedElm.isUserFriendly &&
            //     this._elements.loggedElm && !this._elements.loggedElm.isUserFriendly) {
            //     shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
            //     return;
            // }

            // wait for progress bar...
            if (!this._elements.progressBar || !this._elements.progressBar.isUserFriendly) {
                return this.preRun();
            }

            if (this._elements.preRunButton.isUserFriendly) {
                shared.devlog('@preRunButton is userfriendly');
                if (!this._elements.preRunButton.isUserFriendly.disabled) {
                    shared.devlog('@preRunButton is userfriendly and enabled');
                    return this._elements.preRunButton.click();
                } else {
                    this._timeout.restart();
                    shared.closeWindow(this._result);
                    return;
                }
            } else if (document.querySelectorAll('.free-box').length > 1) {
                shared.devlog('list of boxes is userfriendly');
                shared.closeWithError(K.ErrorType.ERROR, 'Box might not exist for your account.');
                return;
            }
            return this.preRun();
        });
    }

    // Custom Run Validation
    async validateRun() {
        shared.devlog('@validate BF');
        return wait(7000).then( () => {
            let gtHook = document.querySelector('div.geetest_slice_bg');
            if (gtHook) {
                if (gtHook.isUserFriendly()) {
                    shared.devlog('@validate: gt hook present');
                    return this.validateRun();
                }
                shared.devlog('@validate: gt hook present but not user friendly');
            }
            let popup = document.querySelector('.modal-wrapper .modal:not(.free-box-withdraw,fury-wheel-modal) .modal__btn-close');
            if (!popup) {
                shared.devlog('@validate post run popup not found');
                if (this._elements.preRunButton.isUserFriendly && !this._elements.preRunButton.isUserFriendly.disabled) {
                    shared.devlog('@valide trying re-click');
                    this._elements.preRunButton.click();
                    return this.validateRun();
                }
            } else {
                shared.devlog('@validate post run popup found');
                try {
                    // let popup = document.querySelector('.modal-wrapper .modal:not(.free-box-withdraw) .modal__btn-close');
                    if (popup) {
                        popup.click();
                        popup.click();
                    }
                } catch (err) {}
            }

            if (this._elements.success.isUserFriendly) {
                shared.devlog('@validate BF Successful run');
                return this.updateResult();
            } else if(this._actions.altValidation) {
                if(this.altValidation()) {
                    shared.devlog('Alt validated');
                    return this.updateResult();
                }
            }
            return this.validateRun();
        });
    }
}
