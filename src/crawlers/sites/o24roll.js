class O24Roll extends Faucet {
    constructor() {
        let elements = {
            claimed: new ReadableWidget({selector: '#roll_comment .won', parser: Parsers.trimNaNs})
        };
        let actions = {
            readTimeLeft: true,
            readRolledNumber: false,
            readBalance: false
        };
        super(elements, actions);
    }

    init() {
        if (this.isCountdownVisible() || this.readClaimed() != 0) {
            this.updateResult();
            return;
        }

        this.solve();
    }

    getSpotsAvailable() {
        try {
            let soldSpots = document.querySelectorAll('.pos:not(.pfree)').length;
            let available = 1024-soldSpots;
            shared.devlog(`Spots read => available: ${available}, sold: ${soldSpots}`);
            return {
                sold: '' + soldSpots,
                available: '' + available
            }
        } catch (err) {
            shared.devlog(`Unable to read spots sold`);
            shared.devlog(err);
        }
    }

    isPrime(num) {
        for(var i = 2; i < num; i++){
            if(num % i === 0){
                return false;
            }
        }
        return num > 1;
    }

    async solve() {
        let spots = this.getSpotsAvailable();
        if(!spots) {
            // close with error
            shared.devlog(`Could not find spots available`);
            this.updateResult();
            return;
        }

        const findNotPrime = document.querySelector('select[name="pr"]').parentElement.innerText.includes('not a prime')
        let numbers = [...document.querySelectorAll('select[name="pr"] option[value]')].map(x => x.innerText)
        let prime = null;
        if (findNotPrime) {
            prime = numbers.find(x => {
                return !this.isPrime(x)
            });
        } else {
            prime = numbers.find(x => {
            return this.isPrime(x)
        });
        }
        if(!prime) {
            // close with error
            shared.devlog(`Could not find ${findNotPrime ? 'not' : ''} prime number`);
            this.updateResult();
            return;
        }

        // fill address
        let addrInput = document.querySelector('label input[name="a"]');
        if (addrInput) {
            addrInput.value = this._params.address;
        } else {
            shared.devlog(`Could not find address input element`);
            this.updateResult();
            return;
        }
        await wait(helpers.randomInt(1500, 3000));

        // answer_1:
        let answersList = [...document.querySelectorAll('select[name="tt"] option')].map(x => x.value);
        if (answersList.includes(spots.sold)) {
            document.querySelector('select[name="tt"]').value=spots.sold;
        } else if (answersList.includes(spots.available)) {
            document.querySelector('select[name="tt"]').value=spots.available;
        } else {
            shared.devlog(`Could not find option for sold/available spots`);
            this.updateResult();
            return;
        }

        await wait(helpers.randomInt(400, 5000));

        // answer_2:
        let primeSelect = document.querySelector('select[name="pr"]');
        helpers.triggerMouseEvent (primeSelect, "mouseenter");
        await wait(helpers.randomInt(5600, 29000));
        helpers.triggerMouseEvent (primeSelect, "mouseout");
        primeSelect.value=prime.toString()
        await wait(helpers.randomInt(1500, 5000));

        let claimForm = document.querySelector('form');
        if(claimForm) {
            claimForm.submit();
        }
    }

    isCountdownVisible() {
        let pars = [...document.querySelectorAll('p')];
        if (pars.find(x => x.innerText.includes('wait until next day'))) {
            // need to wait a day
            return true;
        }

        if (pars.find(x => x.innerText.includes('PROBLEM'))) {
            // need to wait at least 5 min
            return true;
        }

        return false;
    }

    readClaimed() {
        let pars = [...document.querySelectorAll('p')];
        let claimedElm = pars.find(x => x.innerText.includes('been transferred to your account'));
        if (claimedElm) {
            return claimedElm.innerText.split(' ')[0];
        } else {
            return 0;
        }
    }

    readNextRoll() {
        try {
            let pars = [...document.querySelectorAll('p')];
            if (pars.find(x => x.innerText.includes('until next day') || x.innerText.includes('ALL DAILY CLAIMS') || x.innerText.includes('You have 0 claims left'))) {
                // need to wait a day
                return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
            }

            if (pars.find(x => x.innerText.includes('PROBLEM'))) {
                // need to wait
                return helpers.addMinutes(helpers.randomInt(6, 22));
            }

            if (pars.find(x => x.innerText.includes('You have'))) {
                // need to wait a day
                return helpers.addMinutes(helpers.randomInt(6, 22));
            }
        } catch (err) { shared.devlog(`@readNextRoll: ${err}`); }
        //return helpers.addMinutes(60);
        return helpers.addMinutes(60 * 24 + helpers.randomInt(10, 160));
    }
}
