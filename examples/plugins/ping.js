module.exports = (bot) => {
	bot.hear(['ping'], (payload, chat, data) => {
		chat.say(`Pong!`);
	});
};
