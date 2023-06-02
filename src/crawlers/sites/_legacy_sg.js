function createSGProcessor() {
    let timerSpans;
    function run() {
        if(isLoading()) {
            setTimeout(run, helpers.randomMs(5000, 10000));
            return;
        } else if (hasPopup()) {
            closePopup();
            setTimeout(run, helpers.randomMs(5000, 10000));
        } else {
            if(isMinerActive()) {
                processRunDetails();
            } else {
                // Wait for captcha to be solved
                setTimeout(run, helpers.randomMs(5000, 10000));
                activateMiner();
            }
        }
    };
    function hasPopup() {
        if (document.querySelector('div.absolute.flex.top-0.right-0.cursor-pointer.p-4.text-white.md-text-gray-1')) {
            return true;
        }
        return false;
    };
    function closePopup() {
        try {
            shared.devlog(`@SG: closing popup`);
            document.querySelector("div.absolute.flex.top-0.right-0.cursor-pointer.p-4.text-white.md-text-gray-1").click();
            document.querySelector('svg.flex.w-8.h-8.fill-current').parentElement.click();
        } catch { shared.devlog(`@SG: error closing popup`); }
    };
    function isLoading() {
        return document.getElementById('loader-logo') ? true : false;
    };
    function isMinerActive() {
        timerSpans = document.querySelector('.font-bold.text-center.text-accent.w-11-12.text-18 span');

        if(timerSpans) {
            shared.devlog(`SG: Miner is active`);
            return true;
        } else {
            shared.devlog(`SG: Miner is inactive`);
            return false;
        }
        return (!!timerSpans);
    };
    function activateMiner() {
        let activateButton = document.querySelector("#region-main button.activate.block.w-full.h-full.mx-auto.p-0.rounded-full.select-none.cursor-pointer.focus-outline-none.border-0.bg-transparent");
        // let activateButton = document.querySelector('.mb-8 .wrapper button');
        if (activateButton) {
            activateButton.click();
            shared.devlog(`SG: Activate miner clicked`);
            setTimeout(run, helpers.randomMs(10000, 20000));
        } else {
            processRunDetails()
        }
    };

    function processRunDetails() {
        let result = {};
        shared.devlog(`SG: @processRunDetails`);
        result.nextRoll = helpers.addMinutes(readCountdown().toString());
        result.balance = readBalance();
        shared.closeWindow(result);
    };

    function readCountdown() {
        shared.devlog(`SG: @readCountdown`);
        let synchronizing = document.querySelector('.text-15.font-bold.text-center.text-accent'); // use
        let mins = 15;
        try {
            let timeLeft = timerSpans.innerText.split(':');
            if (timeLeft[0] == 'Synchronizing') {
                //should retry to load the value
            }
            shared.devlog(`SG Countdown timeLeft spans:`);
            shared.devlog(timeLeft);

            if(timeLeft.length === 3) {
                mins = parseInt(timeLeft[0]) * 60 + parseInt(timeLeft[1]);
            }
        } catch (err) { shared.devlog(`SG Error reading countdown: ${err}`); }
        return mins;
    };
    function readBalance() {
        shared.devlog(`SG: @readBalance`);
        let balance = "";
        try {
            balance = document.querySelector('span.text-accent').innerText + " BTC";
        } catch (err) { }
        return balance;
    };
    return {
        run: run,
        processRunDetails: processRunDetails
    };
}
