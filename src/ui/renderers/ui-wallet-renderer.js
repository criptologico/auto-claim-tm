class UiWalletRenderer extends UiBaseRenderer {
    legacyRenderWalletTable(data) {
        console.log(`@legacyRenderWalletTable`);
        let tableBody = '';

        for(let i=0, all = data.length; i < all; i++) {
            tableBody += '<tr class="align-middle" data-id="'+ data[i].id + '">';
            tableBody += '<td class="align-middle">' + data[i].name + '</td>';
            tableBody += '<td class="align-middle em-input"><input type="text" class="w-100" onfocus="this.select();" data-field="address" data-original="' + data[i].address + '" value="' + data[i].address + '"></td>';
            tableBody += '</tr>';
        }

        document.getElementById('wallet-table-body').innerHTML = tableBody;
    }
}

