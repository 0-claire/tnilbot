# TNILBot/TNIL-helper

# Roadmap

- [ ] romanization -> script (w spoilered original) slash command)
- [ ] word builder

# Development

- secrets.json is encrypted. Create your own in the format `{ token: string, id: number|string }`
    - if you don't have an app go to the [discord developer's portal](https://discord.com/developers/applications/) and create a new application
- [Authorization link](https://discord.com/oauth2/authorize?client_id=1380721179790147636&scope=bot&permissions=274877974528) to add the bot to your server. Replace `client_id` val with your own app's ID if not using the official bot
    - `https://discord.com/oauth2/authorize?client_id=1380721179790147636&scope=bot&permissions=274877974528`

# Docs

- [@zsnout/ithkuil](https://github.com/zsakowitz/ithkuil)
- [discord.js docs](https://discord.js.org/docs/packages/discord.js/14.19.3)

# Tasks
Current issues: converting the svg from @zsnout/ithkuil/script to png seems to require a headless browser when in a node context. Apparently puppeteer may be the only option. I have no experience with jsx. Sharp doesn't support all required svg features and I can't get the jsx to compile with tsc correctly so I can't exactly be sure I need the headless browser (puppeteer). But I would imagine so
- remove sharp & resvg from package.json
- add intro to this README
- add some copyleft foss copyright
