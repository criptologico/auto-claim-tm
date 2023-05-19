class UiPromosRenderer extends UiBaseRenderer {
    appendEventListeners() {
        console.log(`@UiCFLegacyRenderer.appendEventListeners`);
        document.querySelector('#promo-button').addEventListener('click', this.onClickSavePromoCode.bind(this));
        document.querySelector('#button-try-get-codes').addEventListener('click', this.onClickTryGetCodes.bind(this));
        document.querySelector('#promo-table-body').addEventListener('click', this.onClickOnPromoTableBody.bind(this));
    }

    onClickSavePromoCode(e) {
        var promoText = document.getElementById("promo-text-input");
        var promoCode = document.getElementById("promo-code-new");
        var promoDaily = document.getElementById("promo-daily");
        var promoObject = { action: "ADD", code: promoText.value.trim(), repeatDaily: promoDaily.checked };
        promoCode.innerHTML =JSON.stringify(promoObject);
        this.uiRenderer.toast("Adding promo code: " + promoObject.code + "...");
        promoText.value = '';
    }

    onClickTryGetCodes(e) {
        var promoCode = document.getElementById("promo-code-new");
        var promoObject = { action: "TRYGETCODES" };
        promoCode.innerHTML =JSON.stringify(promoObject);
        this.uiRenderer.toast("Fetching codes...");
    }

    _legacyRemoveUsedDailyCodes(codes) {
        if(codes && codes.length) {
            codes.forEach(code => {
                if(!code.repeatDaily) {
                    let counter = 0;
                    for(let i = 0; i < code.statusPerFaucet.length; i++) {
                        if(code.statusPerFaucet[i].execTimeStamp) {
                            counter++;
                        }
                    }
                    if(counter == code.statusPerFaucet.length) {
                        setTimeout(() => removePromoCode(code.id, code.code), 20000);
                    }
                }
            });
        }
    }

    legacyRenderPromotionTable(codes) {
        let tableBody = '';
        this._legacyRemoveUsedDailyCodes(codes);

        for(let c=0; c < codes.length; c++) {
            let data = codes[c];
            tableBody += '<tr data-promotion-code="' + data.code + '" data-promotion-id="' + data.id + '">';
            tableBody += '<td class="align-middle text-left ' + (data.repeatDaily ? 'text-warning' : '') + '">';
            tableBody += `<a class="action-remove-promo-code" data-toggle="tooltip" data-placement="left" title="Remove" onclick=""><i class="fa fa-times-circle"></i></a>`;
            tableBody += '<span  title="' + (data.repeatDaily ? 'Reusable Code' : 'One-time-only Code') + '">' + data.code + '</span></td>';
            tableBody +='<td class="align-middle" title="' + (data.repeatDaily ? 'Reusable Code' : 'One-time-only Code') + '">' + helpers.getPrintableDateTime(data.added) + '</td>';

            for(let i=0, all = data.statusPerFaucet.length; i < all; i++) {
                tableBody +='<td class="align-middle" title="Runned @' + helpers.getPrintableDateTime(data.statusPerFaucet[i].execTimeStamp) + '">' + helpers.getEmojiForPromoStatus(data.statusPerFaucet[i].status ?? 0) + '</td>';
            }
            tableBody +='</tr>';
        }

        document.getElementById('promo-table-body').innerHTML = tableBody;
    }

    onClickOnPromoTableBody(e) {
        console.log({theEvent: e});
        let actionElement = e.target;
        if (actionElement.tagName === 'I') {
            actionElement = actionElement.parentElement;
        }
        const row = actionElement.closest('tr');
        if (actionElement.classList.contains('action-remove-promo-code')) {
            e.stopPropagation();
            console.log('removing promo code logic');
            var promoCode = document.getElementById("promo-code-new");
            var promoObject = { action: "REMOVE", id: row.dataset.promotionId, code: row.dataset.promotionCode };
            console.log(promoObject);
            promoCode.innerHTML =JSON.stringify(promoObject);
        }
    }
}

