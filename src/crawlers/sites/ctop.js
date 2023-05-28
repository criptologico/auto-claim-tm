class CTop extends Faucet {
    constructor() {
        let elements = {
            claimed: new ReadableWidget({selector: 'p.success', parser: Parsers.trimNaNs}),
            captcha: new HCaptchaWidget(),
            rollButton: new ButtonWidget({selector: 'input[type="submit"]'}),
            addressInput: new TextboxWidget({ selector: 'form input[name="adr"], form input[name="a"]'})
        };
        let actions = {
            readTimeLeft: true,
            readRolledNumber: false,
            readBalance: false
        };
        super(elements, actions);
    }

    init() {
        if(this.hasErrorMessage('suspicious activity')) {
            shared.closeWithError(K.ErrorType.ERROR, 'Suspicious Activity Message Displayed');
            return;
        }
        if(this.hasErrorMessage('no funds left')) {
            shared.closeWithError(K.ErrorType.NO_FUNDS, 'Out of Funds');
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

        let nextRoll = this.readNextRoll();
        if(nextRoll) {
            shared.devlog(`closing with next roll`);
            let result = {
                nextRoll: nextRoll
            };
            shared.closeWindow(result);
            return;
        }

        this.solve();
    }

    readNextRoll() {
        try {
            let ps = document.querySelectorAll('p');
            for(let i = 0; i < ps.length; ps++) {
                let elm = ps[i];
                if (elm.classList.contains('warn') && elm.innerText.toLowerCase().includes('please wait')) {
                    let seconds = null;
                    try { seconds = elm.innerText.toLowerCase().split('please wait')[1].replace(/\D/g, ''); } catch(err) {}
                    if (seconds) {
                        return helpers.addSeconds(seconds + helpers.randomInt(30, 180));
                    }
                }
            }
            return null;
        } catch (err) { return null; }
    }

    hasErrorMessage(searchTerm) {
        return document.body.innerText.toLowerCase().includes(searchTerm);
    }

    isFirstStep() {
        return this._elements.addressInput.isUserFriendly;
        // return document.querySelector('form input[name="adr"]') ? true : false;
    }

    async doFirstStep() {
        let form = document.querySelector('form');
        if (!form) {
            shared.devlog(`Form element not found`);
            this.updateResult();
            return;
        }
        // let userInput = form.querySelector('input[name="adr"]');
        if (!this._elements.addressInput.isUserFriendly) {
            shared.devlog(`address input not found`);
            this.updateResult();
            return;
        }
        let submitButton = form.querySelector('input[type="submit"]');
        if (!submitButton) {
            shared.devlog(`submitButton not found`);
            this.updateResult();
            return;
        }
        this._elements.addressInput.value = this._params.address;

        submitButton.closest('form').submit();
        return;
    }

    isSecondStep() {
        let ps = [...document.querySelectorAll('p')];
        return ps.findIndex(x => x.innerText.toLowerCase().includes('one more step...')) >= 0;
    }

    async solve() {
        shared.devlog(`@solve`);
        if (this.isSecondStep()) {
            shared.devlog(`@2nd step`);
            return this.run();
        }
        if (this.isFirstStep()) {
            shared.devlog(`@1st step`);
            return this.doFirstStep();
        }
    }

    isCountdownVisible() {
        let successDiv = document.querySelector('p.success');
        if (!successDiv) {
            return false;
        }
        if (successDiv.innerText.includes('0 claims')) {
            return true;
        }

        return false;
    }

    readClaimed() {
        let successDiv = document.querySelector('p.success');
        if (successDiv) {
            return successDiv.innerText.split(' ')[0];
        } else {
            shared.devlog(`successDiv not found`);
            return 0;
        }
    }

    readNextRoll() {
        try {
            let successDiv = document.querySelector('p.success');
            if (successDiv && successDiv.innerText.includes('You have')) {
                let claimsLeft;
                try {
                    claimsLeft = successDiv.innerText.split(' claims')[0].split('have ')[1];
                } catch (err) {}
                shared.devlog(`claimsLeft: ${claimsLeft}`);
                if (claimsLeft) {
                    return helpers.addMinutes(helpers.randomInt(12, 22));
                } else if (claimsLeft === '0') {
                    return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
                }
            }
        } catch (err) { }

        try {
            let warnDiv = document.querySelector('p.warn');
            if (warnDiv) {
                if (warnDiv.innerText.includes('You can claim only')) {
                    return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
                }

                if (warnDiv.innerText.includes('Please wait ')) {
                    try {
                        let unit = warnDiv.innerText.includes(' seconds') ? ' seconds' : ' minutes';
                        let val = warnDiv.innerText.split('Please wait ')[1].split(unit)[0].replace(/\D/g, '');
                        if (unit == ' seconds') {
                            return helpers.addSeconds(val + helpers.randomInt(90, 180));
                        } else {
                            return helpers.addMinutes(val + helpers.randomInt(1, 5));
                        }
                    } catch { }
                    let claimsLeft;
                    try {
                        claimsLeft = warnDiv.innerText.split(' seconds')[0].split('wait ')[1];
                    } catch (err) {}
                    shared.devlog(`claimsLeft: ${claimsLeft}`);
                    if (claimsLeft) {
                        return helpers.addMinutes(helpers.randomInt(12, 22));
                    }
                }
            }

        } catch (err) { }
        return null;
    }
}
