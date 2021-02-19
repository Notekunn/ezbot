const { Bot } = require('../');
const config = require('config');
const path = require('path');
const bot = new Bot({
	email: config.get('email'),
	password: config.get('password'),
	appStatePath: path.resolve(__dirname, '../appstate.json'),
	listenOptions: {
		logLevel: 'info',
	},
});

bot.on('message', (payload, chat) => {
	console.log(payload);
});
bot.on('info', (message) => {
	message.log();
});
bot.on('error:login', (error) => {
	console.log('Listen failed', error);
});
bot.hear('ask', (payload, chat, context, next) => {
	chat.conversation((convo) => {
		convo.ask('What your name?', (payload) => {
			convo.say('You reply: ' + payload.body);
		});
	});
});
bot.start();
