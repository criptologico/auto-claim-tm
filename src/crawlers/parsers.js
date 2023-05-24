class Parsers {
    static innerText(elm) { // '0.12341234' => '0.12341234'
        try {
            return elm.innerText;
        } catch (err) { }
    }
    static trimNaNs(elm) { // 'You won 0.12341234 TRX' => '0.12341234'
        try {
            return elm.innerText.replace(/[^\d.-]/g, '');
        } catch (err) { }
    }
    static splitAndIdxTrimNaNs(elm, options) { // '17.96 Coins (17.50 + 0.46)' => 17.96
        try {
            return elm.innerText.split(options.splitter)[options.idx].replace(/[^\d.-]/g, '');
        } catch (err) { }
    }
    static innerTextIntToFloat(elm) { // 'You won 1234 satoshis' => 0.00001234
        try {
            let sats = elm.innerText.replace(/\D/g, '');
            return sats / 100000000;
        } catch (err) { }
    }
    static innerTextJoinedToInt(elm) { // '7|2|9|6' => 7296
        try {
            return parseInt([... elm].map( x => x.innerText).join(''));
        } catch (err) { }
    }
    static stormGainCountdown(elm) { // '3:01:01' => 120000
        try {
            let timeLeft = elm.innerText.split(':');
            if (timeLeft[0] == 'Synchronizing') {
                //TODO: should retry to load the value
            }

            if(timeLeft.length === 3) {
                return parseInt(timeLeft[0]) * 60 + parseInt(timeLeft[1]);
            }
        } catch (err) {
            return null;
        }
    }
    static kingBizCountdown(elm) { // '4|2' => 42
        try {
            let itms = elm.querySelectorAll('.flip-clock-active .up');
            if (itms.length > 1 && itms[0].isVisible() && itms[1].isVisible()) {
                return parseInt([itms[0].innerText, itms[1].innerText].join(''));
            }
        } catch (err) {
            return null;
        }
    }
    static freeGrcCountdown(elm) { // 'Wait for 53:31 before next roll' => 53
        try {
            shared.devlog(`@Parsers.freeGrcCountdown: with element [${elm}]`);
            let val = elm.innerText.split(':')[0];
            val = val.replace(/[^\d.-]/g, '');
            shared.devlog(`@Parsers.freeGrcCountdown returning`);
            return parseInt(val);
        } catch (err) {
            shared.devlog(`@Parsers.freeGrcCountdown error: ${err}`);
            return null;
        }
    }
    static bestChangeCountdown(elm) { // '00:58:35' => 58
        try {
            if (elm.value) {
                let timeLeft = elm.value.split(':');
                if (timeLeft.length > 1) {
                    return parseInt(timeLeft[1]);
                }
            }
        } catch (err) {
            return null;
        }
    }
    static freeEthereumIoClaimed(elm) { // 'You won 0.12341234 TRX and rolled number 7623' => 0.12341234
        try {
            let line = elm.innerHTML;
            let idx = line.search(/0\./);
            return parseFloat(line.slice(idx, idx + 10));
        } catch (err) { }
    }
    static bfBoxClaimed(elm) {
        try {
            let currency = elm.querySelector('.free-box__withdraw-currency').innerText;
            let val = elm.querySelector('.free-box__need-sum').innerText.replace(/ /g,'').split('/')[1];

            // if (val.length < 10) {
            if (currency == 'Satoshi') {
                val = val/100000000;
            }
            return val;
        } catch (err) {
            return null;
        }
    }
    static g8ClaimsLeft(elm) {
        try {
            if (elm.innerText.includes('\nYou have ')) { // 'Claim 183848 satoshi (0.00012 USD) every 20 Seconds\nYou have 70 claims left today.'
                let val = elm.innerText.split('\nYou have ')[1].split(' ')[0];
                // val = val/100000000;
                return val;
            } else {
                shared.devlog(`@Parsers.g8ClaimsLeft not read: with element [${elm}]`);
                return null;
            }
        } catch (err) {
            shared.devlog(`@Parsers.g8ClaimsLeft not read: with element [${elm}] Error: ${err}`);
            return null;
        }
    }
    static cbgClaimed(elm) {
        try {
            if (elm.innerText.includes('was sent to')) { //?? was sent to you on...
                let val = elm.innerText.trim().split(' ')[0];
                if (elm.innerText.includes('oshi') || elm.innerText.includes('gwei')) {
                    val = val/100000000;
                }
                return val;
            } else {
                shared.devlog(`@Parsers.cbgClaimed not read: with element [${elm}]`);
                return null;
            }
        } catch (err) {
            shared.devlog(`@Parsers.cbgClaimed read error: with element [${elm}] Error: ${err}`);
            return null;
        }
    }
    static dutchysClaimed(elm) { // 'You Won :101  DUTCHY + 20 XP' => 101
        try {
            let splitted = elm.innerText.split('DUTCHY');
            return splitted[0].replace(/[^\d.-]/g, '');
        } catch (err) { shared.devlog(`@Parsers.dutchysClaimed, with element [${elm}] Error: ${err}`); }
    }
    static dutchysClaimedToFloat(elm) { // 'You Won :22437 ADA + 100 XP' => 0.00022437
        try {
            let sats = elm.innerText.split('+');
            sats = sats[0].replace(/\D/g, '');
            return sats / 100000000;
        } catch (err) { shared.devlog(`@Parsers.dutchysClaimedToFloat, with element [${elm}] Error: ${err}`); }
    }
    static splitAndIdxToInt(elm, options) { // '26 Minutes 23' w/spliiter='Minutes' => 26
        try {
            return parseInt(elm.innerText.split(options.splitter)[options.idx].trim());
            // return parseInt(elm.innerText.split('Minutes')[0].trim());
        } catch (err) { shared.devlog(`Error @Parsers.splitAndIdxToInt: ${err}`); }
    }
    static fromTextTimer(elm) { // '0 hours 11 minutes 1 seconds' => 12 minutes
        try {
            let hours, minutes;
            hours = +elm.innerText.split(' hours')[0].trim();
            minutes = +elm.innerText.split('hours ')[1].split('minutes')[0].trim();
            return hours * 60 + minutes + 1;
        } catch (err) { shared.devlog(`Error @Parsers.splitAndIdxToInt: ${err}`); }
    }
}
