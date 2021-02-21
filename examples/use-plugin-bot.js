const { Bot, Command } = require('../');
const { CustomBot } = require('../lib/plugins/CustomBot/');
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
bot.on('info', (message) => {
	message.log();
});
bot.on('error:login', (error) => {
	console.log('Listen failed', error);
});
bot.on('error', (error, payload, chat) => {
	chat.say(error.stack);
});
bot.use(
	new CustomBot({
		name: 'EZZZZZBot',
		prefix: '!#',
	})
)
	.use(
		new Command({ command: 'ping', usage: 'Ping thoi' }, (payload, chat, context) => {
			chat.say('Pong!');
		})
	)
	.use((bot) => {
		bot.on('message', (payload, chat) => {
			console.log(payload);
		});
		bot.on('event', (payload) => {
			console.log(payload);
		});
	});
bot.start({
	listenEvents: true,
});
