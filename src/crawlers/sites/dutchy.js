class DutchyRoll extends Faucet {
    constructor() {
        let elements = {
            countdownMinutes: new CountdownWidget({selector: '#timer', parser: Parsers.splitAndIdxToInt, options: { splitter: 'Minutes', idx: 0} }), // "26 Minutes 23"
            captcha: new HCaptchaWidget(),
            rollButton: new ButtonWidget({selector: '#claim'}), //w/booster video: '#unlockbutton' & then #claim_boosted
            success: new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse'}),
            claimed: new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse', parser: Parsers.freeEthereumIoClaimed}) //"You Won 0.00409070 TRX + 20 XP"
        };
        let actions = {
            preRun: true,
            readClaimed: true,
            readBalance: false,
            readRolledNumber: false
        };
        super(elements, actions);
    }

    init() {
        switch(window.location.host) {
            case 'autofaucet.dutchycorp.space':
                if (this._url.includes('/roll.php')) {
                    this._elements.claimed = new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse', parser: Parsers.dutchysClaimed})
                } else if (this._url.includes('/login.php')) {
                    shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
                    return;
                }
                break;
            case 'express.dutchycorp.space':
                if (this._url.includes('/roll.php')) {
                    this._elements.claimed = new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse', parser: Parsers.dutchysClaimed})
                } else if (this._url.includes('/coin_roll.php')) {
                    this._elements.claimed = new ReadableWidget({selector: '.card.green.pulse p,.card.blue.pulse,.card.green.animated,.card.green.pulse', parser: Parsers.dutchysClaimedToFloat})
                } else if (this._url.includes('/index.php')) {
                    shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, 'You need to login using ExpressCrypto (EC-UserId-XXXXXX).');
                    return;
                }
                break;
        }
        this.run();
        return;
    }

    async preRun() {
        if (this._elements.captcha.isUserFriendly) {
            if (shared.getConfig()['dutchy.useBoosted']) {
                this._elements.rollButton = new ButtonWidget({selector: '#unlockbutton'});
                this._elements.confirmBoost = new ButtonWidget({selector: '#claim_boosted'});
                setInterval(() => {
                    shared.devlog(`@boost wait`);
                    try {
                        shared.devlog(`this._elements.confirmBoost`);
                        if (this._elements.confirmBoost.isUserFriendly) {
                            shared.devlog(`@boost clicking`);
                            this._elements.confirmBoost.click();
                        }
                    } catch (err) {}
                }, 8000);
            }
            return true;
        } else {
            return wait().preRun();
            // if (document.readyState === 'complete') {
            //     shared.closeWithError(K.ErrorType.Error, `You need to set hCaptcha as default at ${(new URL('account.php', this._url)).href}`);
            // } else {
            //     return wait().preRun();
            // }
        }
    }
}

