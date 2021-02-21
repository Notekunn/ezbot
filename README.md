### EZ BOT - MAKE BOT EASIER

Framework for personal bot

```bash
npm i --save @vnbot/ezbot
```

```javascript
const { Bot } = require('@vnbot/ezbot');
const config = require('config');
const path = require('path');
const bot = new Bot({
	email: config.get('email'),
	password: config.get('password'),
	appStatePath: path.resolve(__dirname, '../appstate.json'),
});

bot.on('message', (payload, chat) => {
	const text = payload.body;
	chat.say(`Echo: ${text}`);
});

bot.start();
```
