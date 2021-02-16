const EzBot = require('../');
const config = require('config');
const path = require('path');
const bot = new EzBot({
	email: config.get('email'),
	password: config.get('password'),
	appStatePath: path.resolve(__dirname, '../appstate.json'),
});

bot.hear(['ping'], (payload, chat, data) => {
	chat.say(`Pong!`);
});
bot.on('message', (payload, chat) => {
	const text = payload.body;
	chat.say(`Echo: ${text}`);
	chat.setMessageReaction(':love:');
});

bot.start();
