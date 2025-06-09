# TNILBot/TNIL-helper

# Roadmap

- [ ] romanization -> script (w spoilered original) slash command)
- [ ] /render using a reply to someone's message. Or /renderreply
- [ ] word builder
- [ ] Quizzes
    - [ ] Cs chars/secondaries
    - [ ] Cs/secondary extensions
    - [ ] Primary chars & diacritics
- [ ] Affixes

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
- fix bias adjuncts looking weird
- check numeric parsing (and if numeric roots need special handling; I suppose zsnout does this already if so)
- add intro to this README
- add some copyleft foss copyright
