# TNILBot/TNIL-helper

# Roadmap

- [x] romanization -> script (w spoilered original) slash command)
- [ ] Help command
- [ ] Activity indicating to use slash commands
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
    - [x] Make word spacing optional
    - [ ] Sentence spacing
    - [ ] Tones in alphabetic writing
    - [ ] Option for registers & suppletives continue until closed with hü
    - [x] Render arbitrary text in the font
    - [ ] Support for elision settings
    - [ ] Support for punctuation marks, and ? silly reduplication (e.g. wuoltwaaaaaaa)
    - [ ] Support for inclusion of arbitrary non-ithkuil text in render commands (e.g. keyboard smashes)
- [ ] Message features
    - [x] Render replied message
    - [ ] Edit rendered mesage (with edited marker)
    - [ ] Delete rendered message by reacting with :x:
    - [ ] ? per-channel "always render my/all messages" setting
- [ ] Quizzes
    - [x] Interactive quizzes
    - [x] Consonantal chars/secondaries
    - [x] Consonantal/secondary extensions
    - [x] Handwritten font option
    - [x] Set inversion enabled by default
    - [x] Make ' optional in quizzes
    - [ ] Primary chars & diacritics
    - [ ] Quat chars & diacritics
    - [ ] Secondary char diacritics (case/ill/val)
    - [ ] Special constructions (Cs roots & personal reference adjuncts)
    - [ ] Complex referentials (saxaň)
- [ ] Word builder

# Development

- secrets.json is encrypted. Create your own in the format `{ token: string, id: number|string }`
    - if you don't have an app go to the [discord developer's portal](https://discord.com/developers/applications/) and create a new application
- [Authorization link](https://discord.com/oauth2/authorize?client_id=1380721179790147636&scope=bot&permissions=274877974528) to add the bot to your server. Replace `client_id` val with your own app's ID if not using the official bot
- testing
- [Authorization link](https://discord.com/oauth2/authorize?client_id=1382046810398265417&scope=bot&permissions=68608) to add the bot to your server. Replace `client_id` val with your own app's ID if not using the official bot
    - `https://discord.com/oauth2/authorize?client_id=1380721179790147636&scope=bot&permissions=274877974528`

# Docs

- [@zsnout/ithkuil](https://github.com/zsakowitz/ithkuil)
- [discord.js docs](https://discord.js.org/docs/packages/discord.js/14.19.3)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

# Tasks
- Insert space between sentences
- fix extra spacing
- Fix double quiz (if you answer a question after the question time is over it double nextQuestion()s)
- add intro to this README
- add some copyleft foss copyright
