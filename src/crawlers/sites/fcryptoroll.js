// TODO: refactor => separate in PTC and FAUCET, using a generic PTC class with PTCList, PTCSingle, etc
//                   create a container class that has both PTC and FAUCET
class FCryptoRoll extends Faucet {
    constructor() {
        let elements = {
            countdownMinutes: new CountdownWidget({selector: '.sidebar-links .cursor-not-allowed span.notranslate', parser: Parsers.splitAndIdxToInt, options: { splitter: ':', idx: 1} }), // '00:21:28'
            // rollButton: new ButtonWidget({selector: 'button.notranslate.inline-flex.items-center.text-center:not(.hidden)'}),
            rollButton: new ButtonWidget({selector: '.flex.justify-center button.inline-flex.items-center:not(.hidden)'}),
            balance: new ReadableWidget({selector: 'div.flex.badge.text-bg-yellow', parser: Parsers.trimNaNs}), // '405.81 Coins'
            claimed: new ReadableWidget({selector: 'div.ml-3.w-0 p span.text-yellow-500.font-medium', parser: Parsers.splitAndIdxTrimNaNs, options: { splitter: '(', idx: 0} }), // '25.05 Coins (12 + 13.05)'
            captcha: new HCaptchaWidget({selector: '#hcap-script > iframe'}),
            success: new ReadableWidget({selector: 'div.ml-3.w-0 p span.text-yellow-500.font-medium'})
        };
        let actions = {
            isMultiClaim: true,
            preRoll: true,
            postRun: true,
            readRolledNumber: false,
        };
        super(elements, actions);
        this._paths = {
            faucet: '/task/faucet-claim',
            dashboard: '/dashboard'
        };
        this._linkSelectors = {
            Faucet: 'a[href="https://faucetcrypto.com/task/faucet-claim"]'
        }
        this.useUrlListener();
    }

    init() {
        this._elements.captcha = new HCaptchaWidget({selector: '#hcap-script > iframe'});
        this._elements.rollButton = new ButtonWidget({selector: '.flex.justify-center button.inline-flex.items-center:not(.hidden)'});
        if (this._url.endsWith(this._paths.dashboard)) {
            shared.devlog(`@FC => @dashboard`);
            return this.runDashboard();
        } else if (this._url.includes(this._paths.faucet)) {
            shared.devlog(`@FC => @faucet`);
            return wait().then( () => { this.run(); });
        }

        shared.devlog(`@FC => No url match!`);
        return;
    }

    readSections() {
        let sections = {};
        try {
            for (var l in this._linkSelectors) {
                sections[l] = {};
                sections[l].elm = document.querySelector(this._linkSelectors[l]);
                if (sections[l].elm) {
                    let qty = sections[l].elm.querySelector('span.ml-auto');
                    sections[l].qty = (qty && !isNaN(qty.innerText)) ? qty.innerText : 0;
                }
            }
        } catch {}

        this.sections = sections;
    }

    runDashboard() {
        this.readSections();

        if (this.sections['Faucet'].elm) {
            shared.devlog(`@FC => goto faucet`);
            this.sections['Faucet'].elm.click();
            return;
        } else {
            // process Faucet results?
            shared.devlog(`@FC => processing faucet results`);
            return wait().then( () => { this.run(); });
        }
    }

    // TODO: refactor and move
    scrollTo() {
        let mainContainer = document.querySelector('main');
        if (mainContainer) {
            mainContainer.scrollTo(0, mainContainer.scrollHeight - mainContainer.offsetHeight);
        }
    }

    preRoll() { // search for 'You don't need to solve any captcha! The system is telling me that you are a good person :)'
        this.scrollTo();
        let checkCircleSpan = document.querySelector('p.font-medium.flex.justify-center.leading-0 span.text-green-500.mr-3 svg');
        if(checkCircleSpan) {
            if (checkCircleSpan.parentElement.parentElement.innerText.toLowerCase().includes('the system is telling me that you are a good person')) {
                shared.devlog(`No captcha needed`);
                // TODO: review the following selector as it's matching the countdown button
                this._elements.captcha = new NoCaptchaWidget({selector: '.flex.justify-center button.inline-flex.items-center:not(.hidden)'});
                return;
            }
        }
    }

    postRun() {
        shared.devlog(`@FC @postRun in ${window.location.href}`);

        // if ( this._url.endsWith(this._paths.dashboard) || (this._oldClaimed && this._result && this._result.claimed && this._oldClaimed != this._result.claimed) ) {
        if (this._url.endsWith(this._paths.dashboard) || this._oldClaimed != this._result.claimed) {
            shared.devlog(`@FC @postRun => Claim/Action finished [${this._oldClaimed} != ${this._result.claimed}]`);
            try {
                this._elements.claimed.isUserFriendly.parentElement.parentElement.parentElement.querySelector('button');
                shared.devlog(`@FC @postRun => closing claimed notification`);
            } catch (err) {
                shared.devlog(`@FC @postRun => error closing claimed notification: ${err}`);
            }
            this._oldClaimed = null;
            this.readSections();
            if (this.sections != {}) {
                if (this.sections['Faucet'].elm) {
                    shared.devlog(`@FC @postRun => goto faucet`);
                    this.sections['Faucet'].elm.click();
                    return;
                    // } else if (this.sections['PtcList'].elm && this.sections['PtcList'].qty > 0) {
                    //     shared.devlog(`@FC @postRun => has PTCs. goto ptcList`);
                    //     this.sections['PtcList'].elm.click();
                    //     return;
                } else {
                    shared.devlog(`@FC @postRun => ignoring @1`);
                }
            } else {
                shared.devlog(`@FC @postRun => ignoring @2`);
            }
        } else {
            shared.devlog(`@FC @postRun => ignoring @3`);
        }

        this._result = shared.getProp('tempResults');
        shared.closeWindow(this._result);
        return;
    }

    async runPtcList() {
        shared.devlog(`@FC => @runPtcList`);
        let listItems = [...document.querySelectorAll('.grid.grid-responsive-3 .feather.feather-eye')].map(x => x.parentElement.parentElement).filter(x => x.isUserFriendly());
        if (listItems.length > 0) {
            shared.devlog(`@FC => goto PtcSingleStart`);
            listItems[0].click();
            return;
        } else {
            shared.devlog(`@FC => list invalid. Length: ${listItems.length}`);
            return wait().then( () => { this.runPtcList() } );
        }
    }

    runPtcSingleStart() {
        shared.devlog(`@FC => @runPtcSingleStart`);
        return this.run('doRoll');
    }

    runPtcSingleWait() {
        shared.devlog(`@FC => @runPtcSingleWait`);
        this._elements.captcha = new NoCaptchaWidget({selector: 'a.notranslate:not(.cursor-not-allowed)' });
        this._elements.rollButton = new ButtonWidget({selector: 'a.notranslate:not(.cursor-not-allowed)' });
        return this.run('doRoll');
    }
}
