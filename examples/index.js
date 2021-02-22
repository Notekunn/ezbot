const { Bot, Command } = require('../');
const { CustomBot, HelloGroup, SyncOptions } = require('../lib/plugins/');
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
bot.on('error', (error, payload, chat) => {
	chat.say(error.stack);
});
bot.use((bot) => {
	bot.on('message', (payload, chat) => {
		console.log(payload);
	});
	bot.on('event', (payload) => {
		console.log(payload);
	});
	bot.on('message_reaction', (payload, chat) => {
		const { admins = [] } = bot.getOptions();
		//Admin unsend bot
		if (
			payload.reaction == '👎' &&
			payload.senderID == bot.getCurrentUserID() &&
			admins.includes(payload.userID)
		) {
			chat.unsendMessage((error) => {
				if (error) chat.say(`Có lỗi xảy ra khi xóa tin nhắn`);
			});
		}
	});

	bot.on('info', (message) => {
		message.log();
	});
	bot.on('error:login', (error) => {
		console.log('Listen failed', error);
	});
	bot.on('error:runtime', (error) => {
		console.log(error);
	});
})
	.use(
		new CustomBot({
			name: 'EZBoiiiiiii',
			prefix: '!#',
			admins: ['100009859624773'],
		})
	)
	.use(
		new HelloGroup({
			sayHello: { setNickname: false, showPrefix: true },
		})
	)
	.use(
		new SyncOptions({
			location: './option.json',
		})
	)
	.use(
		new Command({ command: 'ping', usage: 'Ping thoi' }, (payload, chat, context) => {
			chat.say('Pong!');
		})
	);
bot.start({
	listenEvents: true,
});
