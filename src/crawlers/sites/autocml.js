class AutoCMl extends Faucet {
    constructor() {
        let elements = {
            claimed: new ReadableWidget({selector: 'div.alert.alert-success', parser: Parsers.splitAndIdxTrimNaNs, options: { splitter: ' ', idx: 0} }),
            captcha: new HCaptchaWidget(),
            rollButton: new ButtonWidget({selector: 'input[type="submit"].claim-button'}),
            addressInput: new TextboxWidget({ selector: 'form[role="form"] input[type="text"]'})
        };
        let actions = {
            readTimeLeft: false,
            readRolledNumber: false,
            readBalance: false
        };
        super(elements, actions);
    }

    init() {
        if (location.href.includes('r=') && !location.href.includes('hCaptcha')) {
            location.href = (location.href + '&cc=hCaptcha');
            return;
        }

        if(this.hasErrorMessage('suspicious activity')) {
            shared.closeWithError(K.ErrorType.ERROR, 'Suspicious Activity Message Displayed');
            return;
        }
        if(this.hasErrorMessage('no funds left') || this.hasErrorMessage('not have sufficient funds')) {
            shared.closeWithError(K.ErrorType.FAUCET_EMPTY, 'Out of Funds');
            return;
        }

        let claimed = this.readClaimed();
        if (claimed != 0) {
            if (!location.href.includes('doge')) {
                claimed = claimed/100000000;
            }
            shared.devlog(`closing because claim was read`);
            let result = {
                claimed: claimed,
                nextRoll: this.readNextRoll()
            };
            shared.closeWindow(result);
            return;
        }

        if (this._elements.addressInput.isUserFriendly) {
            if (this._elements.addressInput.value != this._params.address) {
                this._elements.addressInput.value = this._params.address;
            }
        }
        this.run();
    }

    hasErrorMessage(searchTerm) {
        return document.body.innerText.toLowerCase().includes(searchTerm);
    }

    readNextRoll() {
        try {
            let spans = [...document.querySelectorAll('div.row div.col-md-5ths span:not(.glyphicon)')];
            let idxClaimsLeft = spans.findIndex(x => x.innerText.includes('daily claims left'));
            if (idxClaimsLeft > -1) {
                if (spans[idxClaimsLeft].innerText.includes('0')) {
                    // need to wait a day
                    return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
                } else {
                    return helpers.addMinutes(helpers.randomInt(5, 12));
                }
            }
        } catch (err) { shared.devlog(`@readNextRoll: ${err}`); }
        //return helpers.addMinutes(60);
        return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
    }
}
