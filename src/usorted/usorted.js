class EventEmitter {
    constructor() {
        this.events = {};
    }
  
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }
  
    emit(eventName, data) {
        const eventCallbacks = this.events[eventName];
        if (eventCallbacks) {
            eventCallbacks.forEach(callback => {
                callback(data);
            });
        }
    }
}

class Timeout {
    constructor() {
        this.startedAt;
        this.interval;
        this.cb = (() => { shared.closeWithError(K.ErrorType.TIMEOUT, '') });
        let paramTimeout =  shared.getParam('timeout');
        if (paramTimeout) {
            this.wait = paramTimeout * 60;
        } else {
            this.wait = shared.getConfig()['defaults.timeout'] * 60
        }
        this.wait += 30; // add a threshold
        this.restart();
    }

    get elapsed() {
        return Date.now() - this.startedAt;
    }

    restart(addSeconds = false) {
        if(this.interval) {
            clearTimeout(this.interval);
        }
        this.startedAt = Date.now();
        if(addSeconds) {
            this.wait = this.wait + addSeconds;
        }
        this.interval = setTimeout( () => { this.cb() }, this.wait * 1000);
    }
}

class Timer {
    constructor(params) {
        Object.assign(this, params);
        if(!useTimer || (this.webType && !Timer.webTypes().includes(this.webType))) {
            return;
        }
        this.delay = this.delaySeconds * 1000;

        // Temporary disabled: mulfunctioning
        // if(!this.isManager) {
        //     this.tick();
        //     this.interval = setInterval(
        //         () => { this.tick() }, this.delay);
        // }
    }

    static webTypes() {
        return [K.WebType.FREELITECOIN, K.WebType.FREEETHEREUMIO, K.WebType.BIGBTC, K.WebType.FCRYPTO, K.WebType.FPB] // , K.WebType.BSCADS]
    };

    startCheck(webType) {
        this.webType = webType;
        if(!useTimer || (helpers.hasValue(webType) && !Timer.webTypes().includes(webType))) {
            return;
        }
        persistence.save(this.uuid + '_lastAccess', Date.now());
        this.interval = setInterval(() => {
            this.isAlive();
        }, this.delay);
    }

    stopCheck() {
        if(!useTimer) {
            return;
        }
        clearInterval(this.interval);
    }

    tick() {
        if(!useTimer) {
            return;
        }
        persistence.save(this.uuid + '_lastAccess', Date.now());
    }

    isAlive() {
        return;
        // Temporary disabled: malfunctioning
        // if(!useTimer) {
        //     return;
        // }
        // let now = Date.now();
        // let newAccess = persistence.load(this.uuid + '_lastAccess');
        // if(newAccess && (now - newAccess > this.delay)) {
        //     //Close working tab and force restart
        //     // shared.devlog(`Timer is closing the working tab`);
        //     // shared.addError(K.ErrorType.FORCE_CLOSED, 'Site was unresponsive or redirected', this.uuid);
        //     // manager.closeWorkingTab(schedule);
        //     shared.devlog(`Trying to reload original site instead of FORCE_CLOSED`);
        //     manager.reloadWorkingTab(this.uuid);
        // }
    }
}
