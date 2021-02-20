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
bot.on('error', (error, payload, chat) => {
	chat.say(error.stack.slice(-199));
});
bot.hear('ask', (payload, chat, context, next) => {
	chat.conversation((convo) => {
		const endConvo = () => {
			convo.say(`${convo.get('name')} ${convo.get('age')}`);
		};
		const askAge = () => {
			convo.ask('What your age', (payload) => {
				convo.set('age', payload.body);
				if (payload.body == '2313') return next(new Error('No no no no'));
				endConvo();
			});
		};
		const askName = () => {
			convo.ask('What your name?', (payload) => {
				convo.set('name', payload.body);
				if (payload.body == 'e') return next(new Error('No no no no'));
				askAge();
			});
		};
		askName();
	});
});
bot.start();
