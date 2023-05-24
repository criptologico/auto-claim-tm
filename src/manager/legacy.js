function createManager() {
    let timestamp = null;
    let intervalUiUpdate;
    let getFeedInterval;

    let userWallet = [];

    const sites = [
        { id: '1', name: 'CF ADA', cmc: '2010', coinRef: 'ADA', url: new URL('https://freecardano.com/free'), rf: '?ref=335463', type: K.WebType.CRYPTOSFAUCETS, clId: 45 },
        { id: '2', name: 'CF BNB', cmc: '1839', coinRef: 'BNB', url: new URL('https://freebinancecoin.com/free'), rf: '?ref=161127', type: K.WebType.CRYPTOSFAUCETS, clId: 42 },
        { id: '3', name: 'CF BTC', cmc: '1', coinRef: 'BTC', url: new URL('https://freebitcoin.io/free'), rf: '?ref=490252', type: K.WebType.CRYPTOSFAUCETS, clId: 40 },
        { id: '4', name: 'CF DASH', cmc: '131', coinRef: 'DASH', url: new URL('https://freedash.io/free'), rf: '?ref=124083', type: K.WebType.CRYPTOSFAUCETS, clId: 156 },
        { id: '5', name: 'CF ETH', cmc: '1027', coinRef: 'ETH', url: new URL('https://freeethereum.com/free'), rf: '?ref=204076', type: K.WebType.CRYPTOSFAUCETS, clId: 44 },
        { id: '6', name: 'CF LINK', cmc: '1975', coinRef: 'LINK', url: new URL('https://freecryptom.com/free'), rf: '?ref=78652', type: K.WebType.CRYPTOSFAUCETS, clId: 157 },
        { id: '7', name: 'CF LTC', cmc: '2', coinRef: 'LTC', url: new URL('https://free-ltc.com/free'), rf: '?ref=117042', type: K.WebType.CRYPTOSFAUCETS, clId: 47 },
        { id: '8', name: 'CF NEO', cmc: '1376', coinRef: 'NEO', url: new URL('https://freeneo.io/free'), rf: '?ref=100529', type: K.WebType.CRYPTOSFAUCETS, clId: 158 },
        { id: '9', name: 'CF STEAM', cmc: '825', coinRef: 'STEEM', url: new URL('https://freesteam.io/free'), rf: '?ref=117686', type: K.WebType.CRYPTOSFAUCETS, clId: 49 },
        { id: '10', name: 'CF TRX', cmc: '1958', coinRef: 'TRX', url: new URL('https://free-tron.com/free'), rf: '?ref=145047', type: K.WebType.CRYPTOSFAUCETS, clId: 41 },
        { id: '11', name: 'CF USDC', cmc: '3408', coinRef: 'USDC', url: new URL('https://freeusdcoin.com/free'), rf: '?ref=100434', type: K.WebType.CRYPTOSFAUCETS, clId: 51 },
        { id: '12', name: 'CF USDT', cmc: '825', coinRef: 'USDT', url: new URL('https://freetether.com/free'), rf: '?ref=181230', type: K.WebType.CRYPTOSFAUCETS, clId: 43 },
        { id: '13', name: 'CF XEM', cmc: '873', coinRef: 'XEM', url: new URL('https://freenem.com/free'), rf: '?ref=295274', type: K.WebType.CRYPTOSFAUCETS, clId: 46 },
        { id: '14', name: 'CF XRP', cmc: '52', coinRef: 'XRP', url: new URL('https://coinfaucet.io/free'), rf: '?ref=808298', type: K.WebType.CRYPTOSFAUCETS, clId: 48 },
        { id: '15', name: 'StormGain', cmc: '1', url: new URL('https://app.stormgain.com/crypto-miner/'), rf: 'friend/BNS27140552', type: K.WebType.STORMGAIN, clId: 35 },
        { id: '16', name: 'CF DOGE', cmc: '74', coinRef: 'DOGE', url: new URL('https://free-doge.com/free'), rf: '?ref=97166', type: K.WebType.CRYPTOSFAUCETS, clId: 50 },
        { id: '17', name: 'FreeBitco.in', cmc: '1', url: new URL('https://freebitco.in/'), rf: '?r=41092365', type: K.WebType.FREEBITCOIN, clId: 36 },
        { id: '18', name: 'FaucetPay PTC', cmc: '1', url: new URL('https://faucetpay.io/ptc'), rf: '?r=41092365', type: K.WebType.FAUCETPAY, clId: 159 },
        // { id: '19', name: 'Free-Litecoin.com', cmc: '2', url: new URL('https://free-litecoin.com/'), rf: 'login?referer=1332950', type: K.WebType.FREELITECOIN, clId: 160 },
        // { id: '20', name: 'Free-Ethereum.io', cmc: '1027', url: new URL('https://www.free-ethereum.io/'), rf: '?referer=1064662', type: K.WebType.FREEETHEREUMIO, clId: 161 },
        // { id: '21', name: 'Bagi BTC', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://bagi.co.in/bitcoin/'), rf: ['?ref=53706', '?ref=63428', '?ref=54350'], type: K.WebType.BAGIKERAN, clId: 52 },
        // { id: '22', name: 'Bagi BNB', cmc: '1839', wallet: K.WalletType.FP_BNB, url: new URL('https://bagi.co.in/binance/'), rf: ['?ref=12529', '?ref=23852', '?ref=13847'], type: K.WebType.BAGIKERAN, clId: 142  },
        // { id: '23', name: 'Bagi BCH', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://bagi.co.in/bitcoincash/'), rf: ['?ref=44242', '?ref=50185', '?ref=41957'], type: K.WebType.BAGIKERAN, clId: 143 },
        // { id: '24', name: 'Bagi DASH', cmc: '131', wallet: K.WalletType.FP_DASH, url: new URL('https://bagi.co.in/dash/'), rf: ['?ref=32724', '?ref=38540', '?ref=40441'], type: K.WebType.BAGIKERAN, clId: 144 },
        // { id: '25', name: 'Bagi DGB', cmc: '109', wallet: K.WalletType.FP_DGB, url: new URL('https://bagi.co.in/digibyte/'), rf: ['?ref=22664', '?ref=27872', '?ref=29669'], type: K.WebType.BAGIKERAN, clId: 147 },
        // { id: '26', name: 'Bagi DOGE', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://bagi.co.in/dogecoin/'), rf: ['?ref=45047', '?ref=54217', '?ref=45568'], type: K.WebType.BAGIKERAN, clId: 145 },
        // { id: '27', name: 'Bagi ETH', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://bagi.co.in/ethereum/'), rf: ['?ref=24486', '?ref=27799', '?ref=24847'], type: K.WebType.BAGIKERAN, clId: 152 },
        // { id: '28', name: 'Bagi FEY', cmc: '10361', wallet: K.WalletType.FP_FEY, url: new URL('https://bagi.co.in/feyorra/'), rf: ['?ref=5049', '?ref=7433', '?ref=5318'], type: K.WebType.BAGIKERAN, clId: 153 },
        // { id: '29', name: 'Bagi LTC', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://bagi.co.in/litecoin/'), rf: ['?ref=48335', '?ref=57196', '?ref=48878'], type: K.WebType.BAGIKERAN, clId: 146 },
        // { id: '30', name: 'Bagi TRX', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://bagi.co.in/tron/'), rf: ['?ref=22622', '?ref=31272', '?ref=23075'], type: K.WebType.BAGIKERAN, clId: 150 },
        // { id: '31', name: 'Bagi USDT', cmc: '825', wallet: K.WalletType.FP_USDT, url: new URL('https://bagi.co.in/tether/'), rf: ['?ref=25462', '?ref=32491', '?ref=25981'], type: K.WebType.BAGIKERAN, clId: 151 },
        // { id: '32', name: 'Bagi ZEC', cmc: '1437', wallet: K.WalletType.FP_ZEC, url: new URL('https://bagi.co.in/zcash/'), rf: ['?ref=9181', '?ref=15120', '?ref=9878'], type: K.WebType.BAGIKERAN, clId: 148 },
        // { id: '33', name: 'Keran BTC', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://keran.co/BTC/'), rf: ['?ref=73729', '?ref=92353', '?ref=79321'], type: K.WebType.BAGIKERAN, clId: 53 },
        // { id: '34', name: 'Keran BNB', cmc: '1839', wallet: K.WalletType.FP_BNB, url: new URL('https://keran.co/BNB/'), rf: ['?ref=19287', '?ref=31242', '?ref=20659'], type: K.WebType.BAGIKERAN, clId: 54 },
        // { id: '35', name: 'Keran BCH', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://keran.co/BCH/'), rf: ['?ref=58232', '?ref=67326', '?ref=70759'], type: K.WebType.BAGIKERAN, clId: 30 },
        // { id: '36', name: 'Keran DASH', cmc: '131', wallet: K.WalletType.FP_DASH, url: new URL('https://keran.co/DASH/'), rf: ['?ref=45229', '?ref=53041', '?ref=55716'], type: K.WebType.BAGIKERAN, clId: 127 },
        // { id: '37', name: 'Keran DGB', cmc: '109', wallet: K.WalletType.FP_DGB, url: new URL('https://keran.co/DGB/'), rf: ['?ref=32788', '?ref=39527', '?ref=42014'], type: K.WebType.BAGIKERAN, clId: 129 },
        // { id: '38', name: 'Keran DOGE', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://keran.co/DOGE/'), rf: ['?ref=73512', '?ref=85779', '?ref=89613'], type: K.WebType.BAGIKERAN, clId: 128 },
        // { id: '39', name: 'Keran ETH', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://keran.co/ETH/'), rf: ['?ref=32226', '?ref=36427', '?ref=32676'], type: K.WebType.BAGIKERAN, clId: 37 },
        // { id: '40', name: 'Keran FEY', cmc: '10361', wallet: K.WalletType.FP_FEY, url: new URL('https://keran.co/FEY/'), rf: ['?ref=6269', '?ref=9019', '?ref=6569'], type: K.WebType.BAGIKERAN, clId: 133 },
        // { id: '41', name: 'Keran LTC', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://keran.co/LTC/'), rf: ['?ref=69102', '?ref=80726', '?ref=84722'], type: K.WebType.BAGIKERAN, clId: 29 },
        // { id: '42', name: 'Keran TRX', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://keran.co/TRX/'), rf: ['?ref=49686', '?ref=46544', '?ref=34485'], type: K.WebType.BAGIKERAN, clId: 162 },
        // { id: '43', name: 'Keran USDT', cmc: '825', wallet: K.WalletType.FP_USDT, url: new URL('https://keran.co/USDT/'), rf: ['?ref=40582', '?ref=48907', '?ref=41009'], type: K.WebType.BAGIKERAN, clId: 132 },
        // { id: '44', name: 'Keran ZEC', cmc: '1437', wallet: K.WalletType.FP_ZEC, url: new URL('https://keran.co/ZEC/'), rf: ['?ref=', '?ref=18976', '?ref=12487'], type: K.WebType.BAGIKERAN, clId: 130 },
        // { id: '45', name: 'OK Btc', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://btc-ok.net/'), rf: 'index.php?r=1QCD6cWJNVH4Cdnz85SQ2qtTkAwGr9fvUk', type: K.WebType.OKFAUCET },
        // { id: '46', name: 'OK Dash', cmc: '131', wallet: K.WalletType.FP_DASH, url: new URL('https://dash-ok.net/'), rf: 'index.php?r=Xbyi7Fk2NRmZ32SHpDhmpGHLa4NMokhmGR', type: K.WebType.OKFAUCET },
        // { id: '47', name: 'OK Dgb', cmc: '109', wallet: K.WalletType.FP_DGB, url: new URL('https://dgb-ok.net/'), rf: 'index.php?r=DSM93hgZuapnjeeDMe8spzwG9rMrw4sdua', type: K.WebType.OKFAUCET },
        // { id: '48', name: 'OK Doge', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://doge-ok.net/'), rf: 'index.php?r=DDaQWmD7vY1NhtK1M5Pno7sdccmgxNUfv1', type: K.WebType.OKFAUCET },
        // { id: '49', name: 'OK Eth', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://eth-ok.net/'), rf: 'index.php?r=0x7636f64a8241257b1edaf65ae943c66de87b1749', type: K.WebType.OKFAUCET },
        // { id: '50', name: 'OK Ltc', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://ltc-ok.net/'), rf: 'index.php?r=MEmxLqYzZdMsEswUQkqL5aawT5UsqYwYgr', type: K.WebType.OKFAUCET },
        // { id: '51', name: 'OK Trx', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://trx-ok.net/'), rf: 'index.php?r=TSocuzJ6ADUoQ49v28BXN2jo3By6awwHvj', type: K.WebType.OKFAUCET },
        { id: '52', name: 'BigBtc', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://bigbtc.win/'), rf: '?id=39255652', type: K.WebType.BIGBTC, clId: 200 },
        { id: '53', name: 'BestChange', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://www.bestchange.com/'), rf: ['index.php?nt=bonus&p=1QCD6cWJNVH4Cdnz85SQ2qtTkAwGr9fvUk'], type: K.WebType.BESTCHANGE, clId: 163 },
        // { id: '54', name: 'Litking.biz', cmc: '2', url: new URL('https://litking.biz/'), rf: 'signup?r=159189', type: K.WebType.KINGBIZ, clId: 164 },
        // { id: '55', name: 'Bitking.biz', cmc: '1', url: new URL('https://bitking.biz/'), rf: 'signup?r=90003', type: K.WebType.KINGBIZ, clId: 165 },
        // { id: '56', name: 'OK Bch', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://faucetok.net/bch/'), rf: '?r=qz742nf2c30ktehlmn0pg6quqe8yuwp3evd75y8c0k', type: K.WebType.OKFAUCET }
        // { id: '57', name: 'OurBitco.in', cmc: '1', url: new URL('https://ourbitco.in/dashboard'), rf: '?r=gebcjvwpky', type: K.WebType.OURBITCOIN },
        { id: '58', name: 'BF BTC', cmc: '1', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BFBOX, clId: 1 },
        { id: '59', name: 'BF BNB', cmc: '1839', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BFBOX, clId: 1 },
        // { id: '60', name: 'Free-Doge.io', cmc: '74', url: new URL('https://www.free-doge.io/'), rf: '?referer=6695', type: K.WebType.FREEDOGEIO, clId: 166 },
        { id: '61', name: 'Dutchy', cmc: '-1', url: new URL('https://autofaucet.dutchycorp.space/roll.php'), rf: '?r=corecrafting', type: K.WebType.DUTCHYROLL, clId: 141 },
        { id: '62', name: 'Dutchy Monthly Coin', cmc: '-1', url: new URL('https://autofaucet.dutchycorp.space/coin_roll.php'), rf: '?r=corecrafting', type: K.WebType.DUTCHYROLL, clId: 141 },
        // { id: '63', name: 'Express', cmc: '-1', url: new URL('https://express.dutchycorp.space/roll.php'), rf: '?r=EC-UserId-428378', type: K.WebType.DUTCHYROLL },
        // { id: '64', name: 'Express Monthly Coin', cmc: '-1', url: new URL('https://express.dutchycorp.space/coin_roll.php'), rf: '?r=EC-UserId-428378', type: K.WebType.DUTCHYROLL },
        { id: '65', name: 'FCrypto Roll', cmc: '-1', url: new URL('https://faucetcrypto.com/dashboard'), rf: 'ref/704060', type: K.WebType.FCRYPTO, clId: 27 },
        // WIP { id: '66', name: 'CPU', cmc: '-1', url: new URL('https://www.coinpayu.com/dashboard'), rf: '?r=corecrafting', type: K.WebType.CPU },
        { id: '67', name: 'BF BFG', cmc: '11038', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BFBOX, clId: 1 },
        { id: '68', name: 'CF SHIBA', cmc: '5994', coinRef: 'SHIBA', url: new URL('https://freeshibainu.com/free'), rf: '?ref=18226', type: K.WebType.CRYPTOSFAUCETS, clId: 167 },
        // { id: '69', name: 'Bagi SOL', cmc: '5426', wallet: K.WalletType.FP_SOL, url: new URL('https://bagi.co.in/solana/'), rf: ['?ref=2838'], type: K.WebType.BAGIKERAN, clId: 149 },
        // { id: '70', name: 'Keran SOL', cmc: '5426', wallet: K.WalletType.FP_SOL, url: new URL('https://keran.co/SOL/'), rf: ['?ref=4249'], type: K.WebType.BAGIKERAN, clId: 131 },
        // { id: '71', name: 'CBG Doge', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://cryptobaggiver.com/dogecoin-faucet/'), rf: ['?r=D8Xgghu5gCryukwmxidFpSmw8aAKon2mEQ'], type: K.WebType.CBG, clId: 110 },
        // { id: '72', name: 'CBG Eth', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://cryptobaggiver.com/ethereum-faucet/'), rf: ['?r=0xC21FD989118b8C0Db6Ac2eC944B53C09F7293CC8'], type: K.WebType.CBG, clId: 111 },
        // { id: '73', name: 'CBG Ltc', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://cryptobaggiver.com/litecoin-faucet/'), rf: ['?r=MWSsGAQTYD7GH5o4oAehC8Et5PyMBfhnKK'], type: K.WebType.CBG, clId: 114 },
        // { id: '74', name: 'CBG Bch', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://cryptobaggiver.com/bitcoin-cash-faucet/'), rf: ['?r=qq2qlpzs4rsn30utrumezpkzezpteqj92ykdgfeq5u'], type: K.WebType.CBG, clId: 112 },
        // { id: '75', name: 'CBG Dgb', cmc: '109', wallet: K.WalletType.FP_DGB, url: new URL('https://cryptobaggiver.com/digibyte-faucet/'), rf: ['?r=DTn8mnXo655wdS78u2qSHHcqaiP5Z8Ewro'], type: K.WebType.CBG, clId: 113 },
        // { id: '76', name: 'CBG Dash', cmc: '131', wallet: K.WalletType.FP_DASH, url: new URL('https://cryptobaggiver.com/dash-faucet/'), rf: ['?r=XfYJ3XmbCHA1HcCFb5Qnyiq5YFFGVZYZv6'], type: K.WebType.CBG, clId: 115 },
        { id: '77', name: 'FPig', cmc: '825', wallet: K.WalletType.FP_USDT, url: new URL('https://faupig-bit.online/page/dashboard'), rf: [''], type: K.WebType.FPB, clId: 154 },
        { id: '78', name: 'CF Cake', cmc: '7186', coinRef: 'CAKE', url: new URL('https://freepancake.com/free'), rf: '?ref=699', type: K.WebType.CRYPTOSFAUCETS, clId: 197 },
        // { id: '79', name: 'GetFreeTRX', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://getfreetrx.com/'), rf: '?r=TK3ofbD3AyXotN2111UvnwCzr2YaW8Qmx7', type: K.WebType.G8, clId: 201 },
        { id: '80', name: 'FreeGRC', cmc: '833', url: new URL('https://freegridco.in/#free_roll'), rf: '', type: K.WebType.FREEGRC, clId: 207 },
        { id: '81', name: 'CF Matic', cmc: '3890', coinRef: 'MATIC', url: new URL('https://freematic.com/free'), rf: '?ref=6435', type: K.WebType.CRYPTOSFAUCETS, clId: 210 },
        // { id: '82', name: 'Heli', cmc: '-1', url: new URL('https://helidrops.io/coins.php'), rf: 'OLPUAO', type: K.WebType.HELI, clId: 211 },
        // { id: '83', name: 'FreeBCH', cmc: '1831', wallet: K.WalletType.FP_BCH, url: new URL('https://freebch.fun/page/dashboard'), rf: ['?r=satology'], type: K.WebType.FPB, clId: 212 },
        { id: '84', name: 'JTFey', cmc: '-1', url: new URL('https://james-trussy.com/faucet'), rf: ['?r=corecrafting'], type: K.WebType.VIE, clId: 213 },
        { id: '85', name: 'O24', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://www.only1024.com/f'), rf: ['?r=1QCD6cWJNVH4Cdnz85SQ2qtTkAwGr9fvUk'], type: K.WebType.O24, clId: 97 },
        { id: '86', name: 'BF BABY', cmc: '10334', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BFBOX, clId: 1 },
        { id: '87', name: 'CF BTT', cmc: '16086', coinRef: 'BTT', url: new URL('https://freebittorrent.com/free'), rf: '?ref=2050', type: K.WebType.CRYPTOSFAUCETS, clId: 218 },
        { id: '88', name: 'BF BSW', cmc: '10746', url: new URL('https://betfury.io/boxes/all'), rf: ['?r=608c5cfcd91e762043540fd9'], type: K.WebType.BETFURYBOX, clId: 1 },
        { id: '89', name: 'CF BFG', cmc: '11038', coinRef: 'BFG', url: new URL('https://freebfg.com/free'), rf: '?ref=117', type: K.WebType.CRYPTOSFAUCETS, clId: 219 },
        // { id: '90', name: 'Keran.co', cmc: '-1', wallet: K.WalletType.FP_MAIL, url: new URL('https://keran.co/'), rf: ['?ref=91'], type: K.WebType.BAGIKERAN, clId: 220 },
        // { id: '91', name: 'Bagi.co.in', cmc: '-1', wallet: K.WalletType.FP_MAIL, url: new URL('https://bagi.co.in/'), rf: ['?ref=64'], type: K.WebType.BAGIKERAN, clId: 221 },
        // { id: '92', name: 'SatoHost', cmc: '825', wallet: K.WalletType.FP_USDT, url: new URL('http://sato.host/page/dashboard'), rf: ['?r=corecrafting'], type: K.WebType.FPB, clId: 233 },
        { id: '93', name: 'YCoin', cmc: '1', wallet: K.WalletType.FP_BTC, url: new URL('https://yescoiner.com/faucet'), rf: ['?ref=4729452'], type: K.WebType.YCOIN, clId: 234 },
        { id: '94', name: 'CDiversity', cmc: '-1', wallet: K.WalletType.FP_MAIL, url: new URL('http://coindiversity.io/free-coins'), rf: ['?r=1J3sLBZAvY5Vk9x4RY2qSFyL7UHUszJ4DJ'], type: K.WebType.CDIVERSITY, clId: 235 },
        { id: '95', name: 'BscAds', cmc: '1839', url: new URL('https://bscads.com/'), rf: ['ref/corecrafting'], type: K.WebType.BSCADS, clId: 226 },
        { id: '96', name: 'Top Ltc', cmc: '2', wallet: K.WalletType.FP_LTC, url: new URL('https://ltcfaucet.top/'), rf: ['?r=MWSsGAQTYD7GH5o4oAehC8Et5PyMBfhnKK'], type: K.WebType.CTOP, clId: 239 },
        { id: '97', name: 'Top Bnb', cmc: '1839', wallet: K.WalletType.FP_BNB, url: new URL('https://bnbfaucet.top/'), rf: ['?r=0x1e8CB8A79E347C54aaF21C0502892B58F97CC07A'], type: K.WebType.CTOP, clId: 240 },
        { id: '98', name: 'Top Doge', cmc: '74', wallet: K.WalletType.FP_DOGE, url: new URL('https://dogecoinfaucet.top/'), rf: ['?r=D8Xgghu5gCryukwmxidFpSmw8aAKon2mEQ'], type: K.WebType.CTOP, clId: 241 },
        { id: '99', name: 'Top Trx', cmc: '1958', wallet: K.WalletType.FP_TRX, url: new URL('https://tronfaucet.top/'), rf: ['?r=TK3ofbD3AyXotN2111UvnwCzr2YaW8Qmx7'], type: K.WebType.CTOP, clId: 242 },
        { id: '100', name: 'Top Eth', cmc: '1027', wallet: K.WalletType.FP_ETH, url: new URL('https://ethfaucet.top/'), rf: ['?r=0xC21FD989118b8C0Db6Ac2eC944B53C09F7293CC8'], type: K.WebType.CTOP, clId: 243 },
    ];

    const wallet = [
        { id: '100', name: 'FaucetPay Email', type: K.WalletType.FP_MAIL },
        { id: '101', name: 'FaucetPay BTC (Bitcoin)', type: K.WalletType.FP_BTC },
        { id: '102', name: 'FaucetPay BNB (Binance Coin)', type: K.WalletType.FP_BNB },
        { id: '103', name: 'FaucetPay BCH (Bitcoin Cash)', type: K.WalletType.FP_BCH },
        { id: '104', name: 'FaucetPay DASH (Dash)', type: K.WalletType.FP_DASH },
        { id: '105', name: 'FaucetPay DGB (DigiByte)', type: K.WalletType.FP_DGB },
        { id: '106', name: 'FaucetPay DOGE (Dogecoin)', type: K.WalletType.FP_DOGE },
        { id: '107', name: 'FaucetPay ETH (Ethereum)', type: K.WalletType.FP_ETH },
        { id: '108', name: 'FaucetPay FEY (Feyorra)', type: K.WalletType.FP_FEY },
        { id: '109', name: 'FaucetPay LTC (Litecoin)', type: K.WalletType.FP_LTC },
        { id: '110', name: 'FaucetPay TRX (Tron)', type: K.WalletType.FP_TRX },
        { id: '111', name: 'FaucetPay USDT (Tether TRC20)', type: K.WalletType.FP_USDT },
        { id: '112', name: 'FaucetPay ZEC (Zcash)', type: K.WalletType.FP_ZEC },
        { id: '113', name: 'FaucetPay SOL (Solana)', type: K.WalletType.FP_SOL },
        { id: '200', name: 'ExpressCrypto (EC-UserId-XXXXXX)', type: K.WalletType.EC },
        { id: '1', name: 'BTC Alternative Address', type: K.WalletType.BTC }
        //                { id: '2', name: 'LTC Address', type: K.WalletType.LTC }
    ];

    async function start() {
        await loader.initialize();
        ui.init(getCFlist(), Schedule.getAll());
        uiRenderer.appendEventListeners();
        // purge runningSites:
        shared.purgeFlowControlSchedules(Schedule.getAll().map(x => x.uuid));
        update();
        // ui.refresh(null, null, userWallet);
        uiRenderer.wallet.legacyRenderWalletTable(userWallet);
        intervalUiUpdate = setInterval(readUpdateValues, 10000);
        Schedule.getAll().forEach(x => {
            x.start();
        });
        if (document.querySelector('#console-log').innerText == 'Loading...') {
            document.querySelector('#console-log').innerHTML = '<table><tr><td><b>Running...</b></td></tr></table>';
        }
        getFeedInterval = setInterval(getCodesFeed, 25000);
    };

    let loader = function() {
        async function initialize() {
            setTimestamp();
            await Schedule.initialize();
            await initializeSites();
            initializeUserWallet();
            initializePromotions();
            initializeHistory();
        };
        async function initializeSites() {
            // await createDefaultSites();
            Site.createFromDataArray(sites);
            await updateSitesWithStoredData();
            await addSitesToSchedules();
            // Legacy wList: make it return Site.getAll();
            // splitInSchedules();
        };
        async function updateSitesWithStoredData() {
            let storedData = persistence.load('webList', true);
            console.log({ allStoredData: storedData });
            if (storedData) {
                storedData.forEach( function (stored) {
                    if (stored.isExternal) {
                        stored.url = new URL(stored.url);
                        Site.add(stored);
                        console.log('External Site To Be Loaded!');
                        console.log(stored);
                    }
                    let site = Site.getById(stored.id);
                    if (!site) {
                        return;
                    }
                    for (const prop in stored) {
                        // if (site.hasOwnProperty(prop)) {
                        // }
                        site[prop] = stored[prop];
                    }
                    if (!site.enabled) {
                        site.nextRoll = null;
                    } else {
                        site.nextRoll = site.nextRoll ? new Date(site.nextRoll) : new Date();
                    }
                    if (site.aggregate || site.balance) {
                        site.firstRun = false;
                    }
                })
            }
        };
        async function addSitesToSchedules() {
            Site.getAll().forEach(site => {
                let scheduleOfSite = Schedule.getById(site.schedule);
                if (!scheduleOfSite) {
                    // for some reason, the site has an invalid schedule
                    console.warn(`Attention! Site ${site.name} has a reference to a schedule that does not exist: (${site.schedule})`);
                    scheduleOfSite = Schedule.getAll()[0];
                    console.warn(`Assigning it to first schedule (${scheduleOfSite.uuid}) instead.`);
                    site.schedule = scheduleOfSite.uuid; // use .changeSchedule to save the change???
                }
                scheduleOfSite.addSite(site);
            });
        };
        function initializeUserWallet() {
            addWallets();
            addStoredWalletData();
        };
        function addWallets() {
            wallet.forEach(x => userWallet.push(x));
            userWallet.forEach(function (element, idx, arr) {
                arr[idx].address = '';
            });
        };
        function addStoredWalletData() {
            let storedData = persistence.load('userWallet', true);
            if(storedData) {
                storedData.forEach( function (element) {
                    let idx = userWallet.findIndex(x => x.id == element.id);
                    if(idx != -1) {
                        userWallet[idx].address = element.address ?? userWallet[idx].address;
                    }
                });
            }
        };
        function initializePromotions() {
            let storedData = persistence.load('CFPromotions', true);
            if (storedData) {
                let mig00200799 = false;
                // check if we need this migration
                try {
                    mig00200799 = shared.getConfig().migrations.find(x => x.version == '00200799' && !x.applied);
                } catch (err) {}
                console.info(`Migration 00200799: ${mig00200799 ? 'APPLYING' : 'previously applied or not needed'}`);

                let allCFs = manager.getFaucetsForPromotion().map( cf => cf.id );
                storedData.forEach( function (element, idx, arr) {
                    arr[idx].added = new Date(element.added);
                    arr[idx].statusPerFaucet.forEach( function (el, i, a) {
                        a[i].execTimeStamp = (el.execTimeStamp != null) ? new Date(el.execTimeStamp) : null;
                        if (mig00200799 && el.status == 4) {
                            a[i].status = 1;
                        }
                    });
                    // Add new CFs
                    allCFs.forEach( function (cf) {
                        if (!arr[idx].statusPerFaucet.find( x => x.id == cf )) {
                            let newCf = { id: cf, status: 1, execTimeStamp: null };
                            arr[idx].statusPerFaucet.push(newCf);
                        }
                    });
                });
                // save migration 00200799 as applied
                if (mig00200799) {
                    shared.migrationApplied('00200799');
                }
                CFPromotions.load(storedData);
            }
        };
        function initializeHistory() {
            CFHistory.initOrLoad();
        };
        function setTimestamp() {
            timestamp = Date.now();
            persistence.save('timestamp', timestamp);
        };
        return {
            initialize: initialize
        };
    }();
    function getCodesFeed(force = false) {
        console.log('@getCodesFeed');
        clearInterval(getFeedInterval);
        if (!force) {
            let tryGet = shared.getConfig()['cf.tryGetCodes'] || false;
            if (!tryGet) {
                console.log('feed interval cleared');
                return;
            }
        }

        let nextFeed = helpers.randomMs(2 * 60 * 60 * 1000, 4 * 60 * 60 * 1000);
        getFeedInterval = setInterval(getCodesFeed, nextFeed)

        GM_xmlhttpRequest({
            method: "GET",
            url: "https://criptologico.com/api/?key=XI2HV-1P9PQ-W637F-68B9B-A248&requests[cf_codes]",
            timeout: 10000,
            onload: function(response) {
                try {
                    let txt = response.responseText;
                    let parsed = JSON.parse(txt);
                    if (parsed.success) {
                        let newCodes = [];
                        for(let i = 0; i < parsed.cf_codes.length; i++) {
                            let item = parsed.cf_codes[i];
                            let newCode = {};
                            newCode.code = item.code;
                            newCode.oneTimeOnly = item.is_one_time == '1';
                            newCode.expirationDate = item.expiration_date.replace(' ', 'T') + 'Z';
                            newCode.expirationDate = new Date(newCode.expirationDate);
                            newCodes.push(newCode);
                        }
                        CFPromotions.includeNewCodes(newCodes);
                        uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
                        // ui.refresh(null, CFPromotions.getAll());
                    }
                } catch(err) {
                    console.error('unexpected error parsing codes list');
                    console.error(err);
                }
            },
            onerror: function(e) {
                console.error('error getting codes');
                console.error(e);
            },
            ontimeout: function() {
                console.error('timeout getting codes');
            },
        });
    }
    function readUpdateValues(forceCheck = false) {
        readPromoCodeValues();
        readModalData();

        // if(schedules[0].status == STATUS.IDLE || forceCheck) {
        if(true) {
            let updateDataElement = document.getElementById('update-data');
            let updateValues = updateDataElement.innerText.clean();

            if (updateValues != '') {
                updateDataElement.innerText = '';
                let updateObj = JSON.parse(updateValues);
                if(updateObj.editSingle.changed) {
                    updateObj.editSingle.items.forEach(function (element, idx, arr) {
                        // This processes the Edit Mode of the sites table (active on/off, name changes)
                        // TODO: move!
                        try {
                            let site = Site.getById(element.id);

                            // TODO: move all this......
                            site.name = element.displayName;

                            if (site.enabled != element.enabled) {
                                site.enabled = element.enabled;
                                if(site.enabled) {
                                    site.nextRoll = new Date(idx);
                                } else {
                                    site.nextRoll = null;
                                }
                            }
                            ui.log({ schedule: site.schedule,
                                msg: `Faucet updated. New name: ${element.displayName}. Active: ${element.enabled}` });
                        } catch (err) {
                            ui.log({ schedule: this.uuid,
                                msg: `Error updating faucet data: ${err}` });
                        }
                    });
                }

                if(updateObj.wallet.changed) {
                    updateObj.wallet.items.forEach(function (element) {
                        try {
                            let itemIndex = userWallet.findIndex(x => x.id == element.id);
                            userWallet[itemIndex].address = element.address;

                            ui.log({ msg: `Wallet Address updated [${userWallet[itemIndex].name}]: ${userWallet[itemIndex].address}` });
                        } catch (err) {
                            ui.log({ msg: `Error updating wallet/address: ${err}` });
                        }
                    });

                    uiRenderer.wallet.legacyRenderWalletTable(userWallet);
                    // ui.refresh(null, null, userWallet);
                    saveUserWallet();
                }

                if(updateObj.config.changed) {
                    try {
                        shared.updateConfig(updateObj.config.items);
                        ui.log({ msg: `Config updated. Reloading in a few seconds...` });
                        window.location.reload();
                        return;
                    } catch (err) {
                        ui.log({ msg: `Error updating config: ${err}` });
                    }

                }

                if(updateObj.site.changed) {
                    updateObj.site.list.forEach( (x) => {
                        try {
                            updateSite(x.id, x.items);
                        } catch (err) {
                            ui.log({ msg: `Error updating site: ${err}` });
                        }
                    });
                }

                if(updateObj.runAsap.changed || updateObj.editSingle.changed || updateObj.site.changed) {
                    resyncAll({ withUpdate: true });
                    return;
                }
            }
        }
        if(forceCheck) {
            resyncAll({ withUpdate: false });
        }
    };
    function resyncAll(options = { withUpdate: false} ) {
        if (options.withUpdate) {
            update(true);
        }
        Schedule.getAll().forEach(x => {
            x.checkNextRoll();
        });
    }
    function updateSite(id, items) {
        let site = Site.getById(id);
        if (site) {
            site.params = site.params || {};
            items.forEach( (item) => {
                site.params[item.prop] = item.value;
            });

            ui.log({ schedule: site.schedule, siteName: site.name, 
                msg: `Site ${site.name} updated` });
        }
    }
    function readModalData() { // This should be migrated and dissapear!
        if(document.getElementById('modal-spinner').isVisible()) {
            let targetObject = JSON.parse(document.getElementById('target-spinner').innerHTML);
            let target = targetObject.id;
            if (target == 'modal-ereport') {
                let temp = shared.getDevLog();
                document.getElementById('log-textarea').value = temp.join('\n');
            } else if (target == 'modal-config') {
                uiRenderer.config.legacyRenderConfigData(shared.getConfig());
                // ui.refresh(null, null, null, shared.getConfig());
            } else if (target == 'modal-site') {
                let site = Site.getById(targetObject.siteId);
                uiRenderer.sites.legacyRenderSiteData(site, shared.getConfig());
                // ui.refresh(null, null, null, null, { site: site, config: shared.getConfig() });
            }
            document.getElementById('modal-spinner').classList.toggle('d-none');
            document.getElementById(target).classList.toggle('d-none');
            document.getElementById('target-spinner').innerHTML = '';
        }
    }
    function sortSites () { // Temporary, just to decouple it...
        Site.sortAll();
        Schedule.getAll().forEach( schedule => schedule.sortSites() );
    };
    function update(sortIt = true) {
        console.log(`@update: sortIt=${sortIt}`);
        if(sortIt) {
            // Schedule.getAllSites() for UI? always sorted?
            sortSites();
            // This kind of resets the currentSite for each schedule::
            Schedule.getAll().forEach( schedule => schedule.setCurrentSite() );
        }

        Site.saveAll();
        Site.getAll().forEach(site => {
            uiRenderer.sites.renderSiteRow(site);
        });
        uiRenderer.sites.removeDeletedSitesRows(Site.getAll().map(x => x.id));
        // TODO: remove rows of deleted sites if exist
        convertToFiat();
        uiRenderer.sites.sortSitesTable(); // y reordenar
        uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
        // ui.refresh(null, CFPromotions.getAll());
        updateRollStatsSpan();
    };

    function saveUserWallet() {
        const data = userWallet.map(x => {
            return {
                id: x.id,
                address: x.address
            };});

        persistence.save('userWallet', data, true);
    }

    function isObsolete() {
        let savedTimestamp = persistence.load('timestamp');
        if (savedTimestamp && savedTimestamp > timestamp) {
            ui.log({ msg: '<b>STOPING EXECUTION!<b> A new Manager UI window was opened. Process should continue there' });
            clearInterval(intervalUiUpdate);
            return true;
        }
        return false;
    };

    // function sitehasCustom(prop) { // for site level
    //     return this.customs && this.customs.hasOwnProperty(prop) && this.params.customs[prop];
    // }
    // function grouphasCustom(prop) { // for group level
    //     return this.customs && this.customs.hasOwnProperty(prop) && this.params.customs[prop];
    // }
    // function grouphasCustom(prop) { // for group level
    //     return this.params && this.params.hasOwnProperty(prop);
    // }
    // function setNextRun(nextRun) {
    //     if (curentSite.hasCustom('nextRun')) {
    //         return currentSite.getCustom('nextRun', { nextRun: nextRun });
    //     } else if (curentSite.group.hasCustom('nextRun')) {
    //         return currentSite.group.getCustom('nextRun', { nextRun: nextRun });
    //     } else {
    //         return schedule.getCustom('nextRun', { nextRun: nextRun });
    //     }
    // }
    // function setDelays(nextRun) {
    //     if (curentSite.hasCustom('delay')) {
    //         return currentSite.getCustom('delay', { nextRun: nextRun });
    //     } else if (curentSite.group.hasCustom('delay')) {
    //         return currentSite.group.getCustom('delay', { nextRun: nextRun });
    //     } else if (schedule.hasCustom('delay')) {
    //         return schedule.getCustom('delay', { nextRun: nextRun });
    //     }
    //     return nextRun;
    // }
    // function setSleepTime() {
    //     if (curentSite.hasCustom('sleep')) {
    //         return currentSite.getCustom('sleep', { nextRun: nextRun });
    //     } else if (curentSite.group.hasCustom('sleep')) {
    //         return currentSite.group.getCustom('sleep', { nextRun: nextRun });
    //     } else if (schedule.hasCustom('sleep')) {
    //         return schedule.getCustom('sleep', { nextRun: nextRun });
    //     }
    //     return nextRun;
    // }

    function readPromoCodeValues() {
        let promoCodeElement = document.getElementById('promo-code-new');
        let promoDataStr = promoCodeElement.innerText.clean();

        if (promoDataStr == '') {
            return;
        }

        let promoData = JSON.parse(promoDataStr);

        if(promoData.action) {
            switch (promoData.action) {
                case 'FORCESTOPFAUCET':
                    Schedule.getAll().forEach(s => {
                        if (s.status != STATUS.IDLE) {
                            s.currentSite.enabled = false
                        }
                    });
                    update(true);
                    window.location.reload();

                    promoCodeElement.innerText = '';
                    //ui.refresh with reload
                    break;
                case 'ADD':
                    CFPromotions.addNew(promoData.code, promoData.repeatDaily);
                    promoCodeElement.innerText = '';
                    document.getElementById('promo-text-input').value = '';
                    uiRenderer.toast("Code " + promoData.code + " added!");
                    ui.log({ msg: `Promo code ${promoData.code} added` });
                    uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
                    // ui.refresh(null, CFPromotions.getAll());
                    break;
                case 'REMOVEALLPROMOS':
                    CFPromotions.removeAll();
                    promoCodeElement.innerText = '';
                    uiRenderer.toast("Promo codes removed!");
                    ui.log({ msg: `Promo codes removed` });
                    uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
                    // ui.refresh(null, CFPromotions.getAll());
                    break;
                case 'REMOVE':
                    if(CFPromotions.remove(promoData.id, promoData.code) != -1) {
                        ui.log({ msg: `Promo code ${promoData.code} removed` });
                    } else {
                        ui.log({ msg: `Unable to remove code ${promoData.code}` });
                    }
                    promoCodeElement.innerText = '';
                    uiRenderer.promos.legacyRenderPromotionTable(CFPromotions.getAll());
                    // ui.refresh(null, CFPromotions.getAll());
                    break;
                case 'TRYGETCODES':
                    getCodesFeed(true);
                    promoCodeElement.innerText = '';
                    uiRenderer.toast("Looking for new codes!");
                    // ui.refresh(null, CFPromotions.getAll());
                    break;
            }
        }
    };

    function updateRollStatsSpan() {
        let rollsSpanElement = document.getElementById('rolls-span');
        rollsSpanElement.innerText = CFHistory.getRollsMeta().join(',');
    };

    function getCFlist() {
        let items;
        items = Site.getAll().filter(f => f.type === K.WebType.CRYPTOSFAUCETS);
        items = items.map(x => {
            return {
                id: x.id,
                name: x.coinRef
            };});
        items.sort((a, b) => (a.name > b.name) ? 1 : -1);

        return items;
    };

    function closeWorkingTab(schedule) {
        let sc = Schedule.getAll().find(x => x.uuid == schedule);
        if (sc) sc.closeTab()
    };
    function reloadWorkingTab(schedule) {
        let sc = Schedule.getAll().find(x => x.uuid == schedule);
        if (sc) {
            sc.closeTab();
            sc.reopenTab();
        }
    };
    function getAllSites() {
        return Site.getAll();
    }
    return{
        start: start,
        getFaucetsForPromotion: getCFlist,
        closeWorkingTab: closeWorkingTab,
        reloadWorkingTab: reloadWorkingTab,
        // Schedule: Schedule,
        // Site: Site,
        getAllSites: getAllSites,
        resyncAll: resyncAll,
        isObsolete: isObsolete,
        update: update,
        userWallet: userWallet,
        readUpdateValues: readUpdateValues
    };
}