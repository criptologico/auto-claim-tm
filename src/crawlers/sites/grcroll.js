class GRCRoll extends Faucet {
    constructor() {
        let elements = {
            countdownMinutes: new CountdownWidget({selector: '#roll_wait_text', parser: Parsers.freeGrcCountdown}),
            rollButton: new ButtonWidget({selector: 'input[id="roll_button"]'}),
            balance: new ReadableWidget({selector: '#balance', parser: Parsers.trimNaNs}),
            claimed: new ReadableWidget({selector: '#roll_comment .won', parser: Parsers.trimNaNs}),
            rolledNumber: new ReadableWidget({selector: '#roll_result', parser: Parsers.trimNaNs}),
            captcha: new NoCaptchaWidget({selector: '#roll_button'}),
            success: new ReadableWidget({selector: '#roll_result'})
        };
        let actions = {
            readTimeLeft: true,
            readRolledNumber: true
        };
        super(elements, actions);
    }

    init() {
        if (this._url.includes('#free_roll')) {
            if (document.querySelectorAll('a[href="#login"]').length > 0) {
                shared.closeWithError(K.ErrorType.NEED_TO_LOGIN, '');
                return;
            } else {
                this.run();
                return;
            }
        } else {
            return;
        }
    }

    isCountdownVisible() {
        return this._elements.countdownMinutes && this._elements.countdownMinutes.isUserFriendly && this._elements.countdownMinutes.isUserFriendly.innerText != '';
    }
}
