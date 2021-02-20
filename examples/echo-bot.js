const { Bot } = require('../');
const config = require('config');
const path = require('path');
const bot = new Bot({
	email: config.get('email'),
	password: config.get('password'),
	appStatePath: path.resolve(__dirname, '../appstate.json'),
	listenOptions: {
		// userAgent:
		// 	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' +
		// 	' (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36',
		logLevel: 'error',
	},
});

bot.on('message', (payload, chat) => {
	const text = payload.body;
	chat.say(`Echo: ${text}`);
});
bot.on('hello', () => {});
bot.on('info', (message) => {
	message.log();
});
bot.on('error:login', (error) => {
	console.log('Listen failed', error);
});
bot.start();
