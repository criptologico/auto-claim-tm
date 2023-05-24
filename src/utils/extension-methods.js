Element.prototype.isVisible = function() {
    return !!(this.offsetWidth||this.offsetHeight||this.getClientRects().length);
};
Element.prototype.isUserFriendly = function(selector) {
    let e = selector ? this.querySelector(selector) : this;
    return e && e.isVisible()  ? e : null;
};
Document.prototype.isUserFriendly = Element.prototype.isUserFriendly;

Number.prototype.toDate = function() {
    return new Date(this);
};
Number.prototype.msToCountdown = function() {
    const remainingSeconds = Math.ceil(this / 1000);
    const hours = Math.floor(remainingSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((remainingSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (remainingSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};
  
String.prototype.clean = function() {
    let output = "";
    for (let i = 0; i < this.length; i++) {
        if (this.charCodeAt(i) <= 127) {
            output += this.charAt(i);
        }
    }
    return output;
};
Array.prototype.shuffle = function () {
    let currentIndex = this.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = this[currentIndex];
        this[currentIndex] = this[randomIndex];
        this[randomIndex] = temporaryValue;
    }

    return this;
};
