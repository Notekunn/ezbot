module.exports = (bot) => {
	bot.on('message', (payload, chat) => {
		const text = payload.body;
		chat.say(`Echo: ${text}`);
	});
};
