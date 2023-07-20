class Requirement {
    static _defaults = [
        { id: '1', name: 'HCaptcha Solver', description: 'A solver for HCaptcha challenges', suggestion: 'Latest github version of hektCaptcha extension (free)' },
        { id: '2', name: 'Recaptcha Solver', description: 'A solver for ReCaptcha challenges', suggestion: 'Latest github version of hektCaptcha extension (free)' },
        { id: '3', name: 'Cloudflare Challenge Bypass', description: 'A solver for Cloudflare/Turnstile challenges', suggestion: 'Auto clicker user script (free)' },
        { id: '4', name: 'Antibot Solver', description: 'A solver for Antibot/AB word challenges', suggestion: 'Latest AB Links Solver user script (free)' },
        { id: '5', name: 'GPCaptcha Solver', description: 'A solver for GP Captcha challenges', suggestion: 'Latest GP Captcha solver user script (free)' },
        { id: '6', name: 'Active Tab/Window', description: 'The site requires the tab to be active.', suggestion: 'User script or Active Window extension' },
        { id: '7', name: 'GeeTest Solver', description: 'A solver for GeeTest challenges.', suggestion: 'MB Solver (paid service), GeeTest User Script (free, solves only the puzzles, requires the tab to be active)' },
    ];

    constructor() {
        this.userRequirements = [];

        console.log('Requirements: adding default requirements');
        Requirement._default.forEach(x => this.userRequirements.push(x));
        this.userRequirements.forEach(function (element, idx, arr) {
            arr[idx].isCovered = false;
        });

        // adding user's coverage
        console.log('Requirements: adding userRequirements');
        let storedData = persistence.load('userRequirements', true);
        if(storedData) {
            storedData.forEach( function (element) {
                let idx = this.userRequirements.findIndex(x => x.id == element.id);
                if(idx != -1) {
                    this.userRequirements[idx].isCovered = element.isCovered ?? false;
                }
            });
        }
    }
        // others: ABLinks solver, GPCaptcha solver, AlwaysOnTop or Focus, window.alert overwrite or ads enabled, popunder blocker, etc.
}