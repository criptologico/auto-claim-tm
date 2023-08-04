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
        this.hideAdBlocker();
        if(this.hasErrorMessage('suspicious activity')) {
            shared.closeWithError(K.ErrorType.ERROR, 'Suspicious Activity Message Displayed');
            return;
        }
        if(this.hasErrorMessage('no funds left') || this.hasErrorMessage('not have sufficient funds')) {
            shared.closeWithError(K.ErrorType.FAUCET_EMPTY, 'Out of Funds');
            return;
        }
        
        if(this.hasErrorMessage('reached the daily claim limit')) {
            let result = {
                nextRoll: this.readNextRoll()
            };
            shared.closeWindow(result);
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

        let waitTime = this.hasWaitTime();
        if (waitTime) {
            let result = {
                nextRoll: helpers.addMinutes(waitTime + 1)
            };
            shared.closeWindow(result);
            return;
        }

        if (this.changeCaptcha()) {
            return;
        }

        this.setCurrentCaptcha();

        if (this._elements.addressInput.isUserFriendly) {
            if (this._elements.addressInput.value != this._params.address) {
                this._elements.addressInput.value = this._params.address;
            }
        }
        this.run();
    }

    hideAdBlocker() {
        try {
            document.getElementById("page-body").style.display = "block";
            document.getElementById("blocker-enabled").style.display = "none";
        } catch (err) {}
        setInterval(() => {
            try {
                document.getElementById("page-body").style.display = "block";
                document.getElementById("blocker-enabled").style.display = "none";
            } catch (err) {}
        }, 3000);
    }

    setCurrentCaptcha() {
        if ([...document.querySelectorAll('iframe')].map(x => x.src || '').filter(x => x.includes('hcaptcha.com')).length > 0) {
            // hcaptcha
            return;
        }
        this._elements.captcha = new RecaptchaWidget();
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

    hasWaitTime() {
        try {
            let pInfos = [...document.querySelectorAll('p.alert.alert-info')].filter(x => x.innerText.toLowerCase().includes('you have to wait'));
            if (pInfos.length == 1) {
                let time = +pInfos[0].innerText.toLowerCase().replace('you have to wait ', '').split(' ')[0];
                return time;
            }
        } catch (err) {}
        return false;
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
