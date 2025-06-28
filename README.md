# TNILBot/TNIL-helper

# Roadmap

- [x] romanization -> script (w spoilered original) slash command)
- [ ] Rendering support
    - [x] Primary chars
    - [x] Secondary chars + extensions
    - [x] Tert chars
    - [x] Quat chars
    - [x] Diacritics
    - [x] Registers & Modes
    - [x] Affixes (specialized Cs roots)
    - [x] Personal reference roots
    - [x] Biases
    - [x] Numbers
        - [x] Single numbers
        - [x] Compound numbers
    - [ ] Remove spacing features. Use spacing only for sentences
    - [ ] Tones in alphabetic writing
    - [ ] Option for registers & suppletives continue until closed with hü
- [ ] Render replied message
- [ ] Support for punctuation marks, and ? silly reduplication (e.g. wuoltwaaaaaaa)
- [ ] Edit rendered message
- [ ] Quizzes
    - [x] Cs chars/secondaries
    - [x] Cs/secondary extensions
    - [ ] Handwritten font option
    - [ ] Set inversion enabled by default
    - [ ] Primary chars & diacritics
- [ ] word builder
- [ ] Support for elision settings
- [ ] Potential per-channel "always render my/all messages" setting

# Development

- secrets.json is encrypted. Create your own in the format `{ token: string, id: number|string }`
    - if you don't have an app go to the [discord developer's portal](https://discord.com/developers/applications/) and create a new application
- [Authorization link](https://discord.com/oauth2/authorize?client_id=1380721179790147636&scope=bot&permissions=274877974528) to add the bot to your server. Replace `client_id` val with your own app's ID if not using the official bot
    - `https://discord.com/oauth2/authorize?client_id=1380721179790147636&scope=bot&permissions=274877974528`

# Docs

- [@zsnout/ithkuil](https://github.com/zsakowitz/ithkuil)
- [discord.js docs](https://discord.js.org/docs/packages/discord.js/14.19.3)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

# Tasks
- elide quaternaries by default
- check numeric root parsing and see if they need special handling
- add intro to this README
- add some copyleft foss copyright
