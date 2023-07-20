class CClicks extends Faucet {
    constructor() {
        let elements = {
            claimed: new ReadableWidget({selector: 'div.alert.alert-success', parser: Parsers.cbgClaimed}),
            captcha: new HCaptchaWidget(),
            rollButton: new ButtonWidget({selector: '#myModal input[type="submit"].btnclaim'}),
            addressInput: new TextboxWidget({ selector: '#myModal input[type="text"]'}),
            openModalButton: new ButtonWidget({selector: 'button[data-target="#myModal"]'})
        };
        let actions = {
            readTimeLeft: false,
            readRolledNumber: false,
            readBalance: false
        };
        super(elements, actions);
    }

    async init() {
        if (this.hasCloudflare()) {
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
        if(this.hasErrorMessage('reached the daily claim limit') || this.hasErrorMessage('reached the daily limit')) {
            let result = {
                nextRoll: helpers.addMinutes(60 * 8 + helpers.randomInt(15, 40))
            };
            shared.closeWindow(result);
            return;
        }

        let claimed = this.readClaimed();
        if (claimed != 0) {
            shared.devlog(`closing because claim was read`);
            let result = {
                claimed: claimed,
                nextRoll: this.readNextRoll()
            };
            shared.closeWindow(result);
            return;
        }

        if (this.changeCaptcha()) {
            return;
        }

        if (this._elements.openModalButton.isUserFriendly) {
            this._elements.openModalButton.click();
            await wait(helpers.randomInt(1000, 2000));
        }

        if (this._elements.addressInput.isUserFriendly) {
            if (this._elements.addressInput.value != this._params.address) {
                this._elements.addressInput.value = this._params.address;
            }
        }
        this.run();
    }

    changeCaptcha() {
        let selections = [...document.querySelectorAll('div.text-center b')];
        if (selections.length == 0) {
            return false;
        }
        if (selections.filter(x => x.innerText.toLowerCase().includes('hcaptcha')).length != 1) {
            location.href = location.href.includes('?') ? (location.href + '&cc=hCaptcha') : (location.href + '?cc=hCaptcha');
            return true;
        }
        return false;
    }

    hasErrorMessage(searchTerm) {
        return document.body.innerText.toLowerCase().includes(searchTerm);
    }

    readNextRoll() {
        try {
            let p = document.querySelector('p.alert.alert-success');
            if (p && p.innerText.toLowerCase().includes('daily')) {
                p = p.innerText.split('\n')[1];
                p = +p.split(' daily')[0];

                shared.devlog(`@readNextRoll: rolls left: ${p}`);
                if (p > 0) {
                    return helpers.addMinutes(helpers.randomInt(3, 9));
                } else {
                    return helpers.addMinutes(60 * 8 + helpers.randomInt(15, 40));
                }
            }
            shared.devlog(`@readNextRoll: remaining rolls not found`);
            return helpers.addMinutes(helpers.randomInt(3, 9));
        } catch (err) { shared.devlog(`@readNextRoll: ${err}`); }
        //return helpers.addMinutes(60);
        return helpers.addMinutes(60 * 8 + helpers.randomInt(15, 40));
    }
}
