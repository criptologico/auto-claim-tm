class CrawlerWidget {
    constructor(params) {
        if (!params || !params.selector) {
            throw new Error('CrawlerWidget requires a selector parameter');
        }
        this.context = this.context || document;
        Object.assign(this, params);
    }

    get isUserFriendly() {
        // Changed to select the element each time
        this.element = this.context.isUserFriendly(this.selector);
        return this.element;
        // this.element = this.element || this.context.isUserFriendly(this.selector);
        // return this.element;
    }
}

class ReadableWidget extends CrawlerWidget {
    constructor(params) {
        if (params && !params.parser) {
            params.parser = Parsers.innerText; //default parser
        }
        super(params);
    }

    get value() {
        if (this.isUserFriendly) {
            return this.parser(this.element, this.options);
        } else {
            shared.devlog(`ReadableWidget (selector: '${this.selector}') cannot be read with the assigned parser`);
            return '';
        }
    }
}

class TextboxWidget extends CrawlerWidget {
    get value() {
        if (!this.isUserFriendly) {
            shared.devlog(`TextboxWidget (selector: '${this.selector}') cannot be access with the assigned parser`);
            return '';
        }
        return this.element.value;
    }

    set value(newValue) {
        if (!this.isUserFriendly) {
            shared.devlog(`TextboxWidget (selector: '${this.selector}') cannot be access with the assigned parser`);
            return '';
        }
        this.element.value = newValue;
        return '';
    }
}

class ButtonWidget extends CrawlerWidget {
    // Overriding to select the button again, just in case fake buttons are used by the faucet
    // get isUserFriendly() {
    //     this.element = this.context.isUserFriendly(this.selector);
    //     return this.element;
    // }

    click() {
        if (this.isUserFriendly) {
            this.element.click();
            return Promise.resolve(true);
        } else {
            shared.devlog(`ButtonWidget (selector: '${this.selector}') cannot be clicked`);
        }
    }
}

class SubmitWidget extends CrawlerWidget {
    click() {
        shared.devlog(`SubmitWidget: click attempt`);
        if (this.isUserFriendly) {
            let frm = this.element;
            while(frm.nodeName != 'FORM' && frm.nodeName != null) {
                frm = frm.parentElement;
            }
            if (frm.nodeName == 'FORM') {
                shared.devlog(`SubmitWidget submitting`);
                frm.submit();
            } else {
                shared.devlog(`SubmitWidget form not found`);
                return;
            }
            return Promise.resolve(true);
        } else {
            shared.devlog(`SubmitWidget (selector: '${this.selector}') cannot be trigger`);
        }
    }
}

class CountdownWidget extends CrawlerWidget {
    constructor(params) {
        if (params && !params.parser) {
            params.parser = Parsers.innerText; //default parser
        }
        super(params);
    }

    get timeLeft() {
        if (this.isUserFriendly) {
            return this.parser(this.element, this.options);
        } else {
            throw new Error(`CountdownWidget (selector: '${this.selector}') cannot be read`);
        }
    }
}

{{crawlers/parsers.js}}
{{crawlers/image-processor.js}}

{{crawlers/captchas.js}}

{{crawlers/faucet.js}}

{{crawlers/sites/index.js}}
