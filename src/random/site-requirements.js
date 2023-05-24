class SiteRequirements {
    constructor(args) {
        // Smaple:
        this.name = 'HCaptcha Solver';
        this.suggested = 'https://...hekt';
        this.description = 'This site requires an HCaptcha Solver for full automation. There are some free and paid solutions available';
        this.alternatives = 'claimCaptcha, 2Captcha, nopecha, nocaptcha.ai';
        this.isCovered = false; // true if the user has an hcaptcha solver

        // others: ABLinks solver, GPCaptcha solver, AlwaysOnTop or Focus, window.alert overwrite or ads enabled, popunder blocker, etc.
    }
}