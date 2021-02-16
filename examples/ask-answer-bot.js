const EzBot = require('../');
const config = require('config');
const path = require('path');
const bot = new EzBot({
	email: config.get('email'),
	password: config.get('password'),
	appStatePath: path.resolve(__dirname, '../appstate.json'),
});

bot.hear(['ask'], (payload, chat) => {
	chat.conversation((convo) => {
		convo.ask('Yêu tui không?', (payload, convo) => {
			convo.set('love_me', payload.body);
			convo.ask('Thật không?', (payload, convo) => {
				convo.set('confirm', payload.body);
				convo.say(`Bạn đã trả lời ${convo.get('love_me')}, ${convo.get('confirm')}`);
			});
		});
	});
});
bot.on('message', (payload, chat) => {
	const text = payload.body;
	console.log(payload);
	chat.say(`Echo: ${text}`);
	chat.setMessageReaction(':love:');
});

bot.start();
