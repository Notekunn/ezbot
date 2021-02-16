const EventEmitter = require('eventemitter3');

class Chat extends EventEmitter {
	constructor(bot, threadID, senderID, messageID) {
		super();
		if (!bot || !threadID) {
			throw new Error('You need to specify a BootBot instance and a threadID');
		}
		this.bot = bot;
		this.senderID = senderID;
		this.threadID = threadID;
		this.messageID = messageID;
	}

	say(message) {
		this.bot.api.sendMessage(message, this.threadID);
	}

	sayPrivate(message) {
		this.bot.api.sendMessage(message, this.senderID);
	}
	sendTypingIndicator() {
		return this.bot.api.sendTypingIndicator(this.threadID);
	}
	markAsDelivered() {
		return this.bot.api.markAsDelivered(this.threadID);
	}
	maskAsRead() {
		return this.bot.api.markAsRead(this.threadID);
	}
	muteThread(muteSeconds = 60) {
		return this.bot.api.muteThread(message.threadID, muteSeconds);
	}
	setMessageReaction(reaction) {
		return this.bot.api.setMessageReaction(reaction, this.messageID);
	}
	conversation(factory) {
		return this.bot.conversation(this.threadID, factory);
	}
}
module.exports = Chat;
