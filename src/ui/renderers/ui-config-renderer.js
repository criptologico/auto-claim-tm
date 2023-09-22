class UiConfigRenderer extends UiBaseRenderer {
    legacyRenderConfigData(data) {
        for (const prop in data) {
            let element = document.querySelector('[data-prop="' + prop + '"]');
            if(element) {
                if(element.type == 'select-one' || element.type == 'text' || element.type == 'password' || element.type == 'number' || element.type == 'time') {
                    element.dataset.original = data[prop];
                    element.value = data[prop];
                } else if (element.type == 'checkbox') {
                    element.dataset.original = (data[prop] ? "1" : "0");
                    element.checked = data[prop];
                }
            }
        }

        let elCfTryGetCodes = document.querySelector('[data-prop="cf.tryGetCodes"]')
        let elCredentialsAutologin = document.querySelector('[data-prop="cf.autologin"]');
        let elCredentialsMode = document.querySelector('[data-prop="cf.credentials.mode"]');
        let elCredentialsEmail = document.querySelector('[data-prop="cf.credentials.email"]');
        let elCredentialsPassword = document.querySelector('[data-prop="cf.credentials.password"]');
        // let elWithdrawMode = document.querySelector('[data-prop="bk.withdrawMode"]');
        // let elHoursBetweenWithdraws = document.querySelector('[data-prop="bk.hoursBetweenWithdraws"]');
        let elDevlogEnabled = document.querySelector('[data-prop="devlog.enabled"]');
        let elDevlogMaxLines = document.querySelector('[data-prop="devlog.maxLines"]');
        // let elFpigCredentialsMode = document.querySelector('[data-prop="fpb.credentials.mode"]');
        // let elFpigCredentialsUsername = document.querySelector('[data-prop="fpb.credentials.username"]');
        // let elFpigCredentialsPassword = document.querySelector('[data-prop="fpb.credentials.password"]');
        // let elFBchCredentialsMode = document.querySelector('[data-prop="fbch.credentials.mode"]');
        // let elFBchCredentialsUsername = document.querySelector('[data-prop="fbch.credentials.username"]');
        // let elFBchCredentialsPassword = document.querySelector('[data-prop="fbch.credentials.password"]');
        // let elSHostCredentialsMode = document.querySelector('[data-prop="shost.credentials.mode"]');
        // let elSHostCredentialsUsername = document.querySelector('[data-prop="shost.credentials.username"]');
        // let elSHostCredentialsPassword = document.querySelector('[data-prop="shost.credentials.password"]');
        let elJtfeyCredentialsMode = document.querySelector('[data-prop="jtfey.credentials.mode"]');
        let elJtfeyCredentialsUsername = document.querySelector('[data-prop="jtfey.credentials.username"]');
        let elJtfeyCredentialsPassword = document.querySelector('[data-prop="jtfey.credentials.password"]');
        let elYCoinCredentialsMode = document.querySelector('[data-prop="ycoin.credentials.mode"]');
        let elYCoinCredentialsUsername = document.querySelector('[data-prop="ycoin.credentials.username"]');
        let elYCoinCredentialsPassword = document.querySelector('[data-prop="ycoin.credentials.password"]');
        // let elBscadsCredentialsMode = document.querySelector('[data-prop="bscads.credentials.mode"]');
        // let elBscadsCredentialsUsername = document.querySelector('[data-prop="bscads.credentials.username"]');
        // let elBscadsCredentialsPassword = document.querySelector('[data-prop="bscads.credentials.password"]');

        let elPostpone = document.querySelector('[data-prop="defaults.postponeMinutes"]');
        let elPostponeMin = document.querySelector('[data-prop="defaults.postponeMinutes.min"]');
        let elPostponeMax = document.querySelector('[data-prop="defaults.postponeMinutes.max"]');
        elPostponeMin.disabled = (elPostpone.value > "0");
        elPostponeMax.disabled = (elPostpone.value > "0");
        if (elPostponeMin.disabled && elPostponeMax.disabled) {
            elPostponeMin.value = elPostpone.value;
            elPostponeMax.value = elPostpone.value;
        }
        elPostpone.onchange = function (e) {
            document.querySelector('[data-prop="defaults.postponeMinutes.min"]').disabled = e.target.value > 0;
            document.querySelector('[data-prop="defaults.postponeMinutes.max"]').disabled = e.target.value > 0;
            if (e.target.value > 0) {
                document.querySelector('[data-prop="defaults.postponeMinutes.min"]').value = e.target.value;
                document.querySelector('[data-prop="defaults.postponeMinutes.max"]').value = e.target.value;
            }
        }

        let elNextRun = document.querySelector('[data-prop="defaults.nextRun"]');
        let elNextRunMin = document.querySelector('[data-prop="defaults.nextRun.min"]');
        let elNextRunMax = document.querySelector('[data-prop="defaults.nextRun.max"]');
        let elNextRunUseCountdown = document.querySelector('[data-prop="defaults.nextRun.useCountdown"]');
        elNextRunMin.disabled = (elNextRun.value > "0");
        elNextRunMax.disabled = (elNextRun.value > "0");
        if (elNextRunMin.disabled && elNextRunMax.disabled) {
            elNextRunMin.value = elNextRun.value;
            elNextRunMax.value = elNextRun.value;
        }
        elNextRun.onchange = function (e) {
            document.querySelector('[data-prop="defaults.nextRun.min"]').disabled = e.target.value > 0;
            document.querySelector('[data-prop="defaults.nextRun.max"]').disabled = e.target.value > 0;
            if (e.target.value > 0) {
                document.querySelector('[data-prop="defaults.nextRun.min"]').value = e.target.value;
                document.querySelector('[data-prop="defaults.nextRun.max"]').value = e.target.value;
            }
        }

        let elSleepMode = document.querySelector('[data-prop="defaults.sleepMode"]');
        let elSleepModeMin = document.querySelector('[data-prop="defaults.sleepMode.min"]');
        let elSleepModeMax = document.querySelector('[data-prop="defaults.sleepMode.max"]');
        elSleepModeMin.disabled = !elSleepMode.checked;
        elSleepModeMax.disabled = !elSleepMode.checked;
        elSleepMode.onchange = function (e) {
            document.querySelector('[data-prop="defaults.sleepMode.min"]').disabled = !e.target.checked;
            document.querySelector('[data-prop="defaults.sleepMode.max"]').disabled = !e.target.checked;
        }

        elCredentialsMode.disabled = !elCredentialsAutologin.checked;

        elCredentialsEmail.disabled = ( (!elCredentialsAutologin.checked || elCredentialsMode.value == "2") ? true : false);
        elCredentialsPassword.disabled = ( (!elCredentialsAutologin.checked || elCredentialsMode.value == "2") ? true : false);

        // elHoursBetweenWithdraws.disabled = ( (elWithdrawMode.value == "0" || elWithdrawMode.value == "2") ? true : false);

        elCredentialsAutologin.onchange = function (e) {
            document.querySelector('[data-prop="cf.credentials.mode"]').disabled = !e.target.checked;
            if (elCredentialsMode.value == "2") {
                document.querySelector('[data-prop="cf.credentials.email"]').disabled = true;
                document.querySelector('[data-prop="cf.credentials.password"]').disabled = true;
            } else {
                document.querySelector('[data-prop="cf.credentials.email"]').disabled = false;
                document.querySelector('[data-prop="cf.credentials.password"]').disabled = false;
            }
        }

        elCredentialsMode.onchange = function (e) {
            if (e.target.value == "2") {
                document.querySelector('[data-prop="cf.credentials.email"]').disabled = true;
                document.querySelector('[data-prop="cf.credentials.password"]').disabled = true;
            } else {
                document.querySelector('[data-prop="cf.credentials.email"]').disabled = false;
                document.querySelector('[data-prop="cf.credentials.password"]').disabled = false;
            }
        }

        // elFpigCredentialsUsername.disabled = ( (elFpigCredentialsMode.value == "2") ? true : false);
        // elFpigCredentialsPassword.disabled = ( (elFpigCredentialsMode.value == "2") ? true : false);
        // elFpigCredentialsMode.onchange = function (e) {
        //     if (e.target.value == "2") {
        //         document.querySelector('[data-prop="fpb.credentials.username"]').disabled = true;
        //         document.querySelector('[data-prop="fpb.credentials.password"]').disabled = true;
        //     } else {
        //         document.querySelector('[data-prop="fpb.credentials.username"]').disabled = false;
        //         document.querySelector('[data-prop="fpb.credentials.password"]').disabled = false;
        //     }
        // }

        // elSHostCredentialsUsername.disabled = ( (elSHostCredentialsMode.value == "2") ? true : false);
        // elSHostCredentialsPassword.disabled = ( (elSHostCredentialsMode.value == "2") ? true : false);
        // elSHostCredentialsMode.onchange = function (e) {
        //     if (e.target.value == "2") {
        //         document.querySelector('[data-prop="shost.credentials.username"]').disabled = true;
        //         document.querySelector('[data-prop="shost.credentials.password"]').disabled = true;
        //     } else {
        //         document.querySelector('[data-prop="shost.credentials.username"]').disabled = false;
        //         document.querySelector('[data-prop="shost.credentials.password"]').disabled = false;
        //     }
        // }

        elYCoinCredentialsUsername.disabled = ( (elYCoinCredentialsMode.value == "2") ? true : false);
        elYCoinCredentialsPassword.disabled = ( (elYCoinCredentialsMode.value == "2") ? true : false);
        elYCoinCredentialsMode.onchange = function (e) {
            if (e.target.value == "2") {
                document.querySelector('[data-prop="ycoin.credentials.username"]').disabled = true;
                document.querySelector('[data-prop="ycoin.credentials.password"]').disabled = true;
            } else {
                document.querySelector('[data-prop="ycoin.credentials.username"]').disabled = false;
                document.querySelector('[data-prop="ycoin.credentials.password"]').disabled = false;
            }
        }

        // elFBchCredentialsUsername.disabled = ( (elFBchCredentialsMode.value == "2") ? true : false);
        // elFBchCredentialsPassword.disabled = ( (elFBchCredentialsMode.value == "2") ? true : false);
        // elFBchCredentialsMode.onchange = function (e) {
        //     if (e.target.value == "2") {
        //         document.querySelector('[data-prop="fbch.credentials.username"]').disabled = true;
        //         document.querySelector('[data-prop="fbch.credentials.password"]').disabled = true;
        //     } else {
        //         document.querySelector('[data-prop="fbch.credentials.username"]').disabled = false;
        //         document.querySelector('[data-prop="fbch.credentials.password"]').disabled = false;
        //     }
        // }

        elJtfeyCredentialsUsername.disabled = ( (elJtfeyCredentialsMode.value == "2") ? true : false);
        elJtfeyCredentialsPassword.disabled = ( (elJtfeyCredentialsMode.value == "2") ? true : false);
        elJtfeyCredentialsMode.onchange = function (e) {
            if (e.target.value == "2") {
                document.querySelector('[data-prop="jtfey.credentials.username"]').disabled = true;
                document.querySelector('[data-prop="jtfey.credentials.password"]').disabled = true;
            } else {
                document.querySelector('[data-prop="jtfey.credentials.username"]').disabled = false;
                document.querySelector('[data-prop="jtfey.credentials.password"]').disabled = false;
            }
        }

        // elBscadsCredentialsUsername.disabled = ( (elBscadsCredentialsMode.value == "2") ? true : false);
        // elBscadsCredentialsPassword.disabled = ( (elBscadsCredentialsMode.value == "2") ? true : false);
        // elBscadsCredentialsMode.onchange = function (e) {
        //     if (e.target.value == "2") {
        //         document.querySelector('[data-prop="bscads.credentials.username"]').disabled = true;
        //         document.querySelector('[data-prop="bsdads.credentials.password"]').disabled = true;
        //     } else {
        //         document.querySelector('[data-prop="bscads.credentials.username"]').disabled = false;
        //         document.querySelector('[data-prop="bscads.credentials.password"]').disabled = false;
        //     }
        // }

        // elWithdrawMode.onchange = function (e) {
        //     if (e.target.value == "0" || e.target.value == "2") {
        //         document.querySelector('[data-prop="bk.hoursBetweenWithdraws"]').disabled = true;
        //     } else {
        //         document.querySelector('[data-prop="bk.hoursBetweenWithdraws"]').disabled = false;
        //     }
        // }

        elDevlogMaxLines.disabled = !elDevlogEnabled.checked;
        elDevlogEnabled.onchange = function (e) {
            document.querySelector('[data-prop="devlog.maxLines"]').disabled = !e.target.checked;
        }
    }
}

