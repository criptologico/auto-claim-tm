# Auto Claim TM Script

## About

Auto Claim is a user script that allows the user to claim from a list of faucet based on schedules.

It was tested using Tampermonkey, but we'd appreciate feedback on how it performs using other extensions.

We don't have a tutorial/documentation/how-to yet, but you can [join the discord server](https://discord.gg/23s9fDgHqe) to find some insights, feedback and help from the community.

[![](https://dcbadge.vercel.app/api/server/23s9fDgHqe)](https://discord.gg/23s9fDgHqe)

## First time users

To run this user script, you'll need an extension like [Tampermonkey](https://www.tampermonkey.net/).

You can install the latest working version of the auto claim [HERE](raw/master/dist/autoclaim-dist.user.js).

If you don't have an automated solver for captchas, [check our discord](https://discord.gg/23s9fDgHqe), where you can find some great free options.

## For developers

- Original script is in the process of been divided in multiple js files for easier maintenance and refactor
- Using a custom 'builder.js' to generate the final .user.js output file
- We are not following any standard yet, just injecting the code through placeholders

## Maintenance-related TODO List

- [ ] Add auto versioning
- [ ] Integrate fbase library project
- [ ] Refactor to follow CommonJS or ES Modules standards
- [ ] Pick a builder that provides an easy-to-read output and does not generate useless extra lines of code
- [ ] Documentation/Tutorial/Howto

## App-related TODO List

- [ ] Optimize schedules
- [ ] Move site-specific configurations to each site
- [ ] Add CRUD for custom sites/scripts
- [ ] Deploy fbase integration for external scripts
- [ ] Add Show/Hide sites functionality
- [ ] Implement a site status checker (like shields.io)
