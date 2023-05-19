class BCuba extends Faucet {

}

class Fiab extends Faucet { // https://auto-crypto.ml/?cc=hCaptcha // https://auto-crypto.ml/doge/
    // Check max daily claims / claims left
    // claim every X minutes
    // Captcha Options (recaptcha, solvemedia, hcaptcha)
    // antibot links (on/off)
    // step 1 (shortlink) optional or mandatory
    constructor() {
        let elements = {
            claimed: new ReadableWidget({selector: 'p.success', parser: Parsers.trimNaNs}),
            hcaptcha: new HCaptchaWidget(),
            rcaptcha: new RecaptchaWidget(),
            rollButton: new ButtonWidget({selector: 'input[type="submit"]'}),
        };
        let actions = {
            readTimeLeft: true,
            readRolledNumber: false,
            readBalance: false
        };
        super(elements, actions);
    }

    init() {
        if(this.hasErrorMessage()) {
            shared.closeWithError(K.ErrorType.ERROR, 'Suspicious Activity Message Displayed');
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

    hasErrorMessage() {
        return document.body.innerText.toLowerCase().includes('suspicious activity');
    }

    isFirstStep() {
        return document.querySelector('form input[name="adr"]') ? true : false;
    }

    async doFirstStep() {
        let form = document.querySelector('form');
        if (!form) {
            shared.devlog(`Form element not found`);
            this.updateResult();
            return;
        }
        let userInput = form.querySelector('input[name="adr"]');
        if (!userInput) {
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
        userInput.value = this._params.address;

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
                    return helpers.addMinutes(helpers.randomInt(6, 22));
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
                            return helpers.addSeconds(val);
                        } else {
                            return helpers.addMinutes(val);
                        }
                    } catch { }
                    let claimsLeft;
                    try {
                        claimsLeft = warnDiv.innerText.split(' seconds')[0].split('wait ')[1];
                    } catch (err) {}
                    shared.devlog(`claimsLeft: ${claimsLeft}`);
                    if (claimsLeft) {
                        return helpers.addMinutes(helpers.randomInt(6, 22));
                    }
                }
            }

        } catch (err) { }
        return null;
    }
}

