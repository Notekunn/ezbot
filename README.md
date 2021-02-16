### EZ BOT - MAKE BOT EASIER

Package sample [GitHub - Charca/bootbot: Facebook Messenger Bot Framework for Node.js](https://github.com/Charca/bootbot) for personal bot

```javascript
const EzBot = require('../');
const config = require('config');
const path = require('path');
const bot = new EzBot({
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
