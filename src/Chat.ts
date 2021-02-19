import Bot from './Bot';
import Payload from './utils/Payload';
import MessageObject from './utils/MessageObject';
import Conversation from './Conversation';
import { EventEmitter, DefaultEventMap } from 'tsee';
/**
 *
 */

interface ConversationEvent extends DefaultEventMap {
	end: (convo: Conversation) => void;
	start: (convo: Conversation) => void;
}
class Chat extends EventEmitter<ConversationEvent> {
	bot: Bot;
	payload: Payload;
	/**
	 * @param  {Bot} bot
	 * @param  {Payload} payload
	 * @constructor
	 */
	constructor(bot: Bot, payload: Payload) {
		super();
		if (!Bot.isBot(bot) || !payload) {
			throw new Error('A bot instance and a payload is required!');
		}
		this.bot = bot;
		this.payload = payload;
	}
	say(message: MessageObject | String, callback?: Function): void {
		this.bot.sendMessage(message, this.payload.threadID, callback);
	}
	inbox(message: MessageObject | String, callback?: Function): void {
		if (!this.payload.senderID) throw new Error('Cannot inbox with this event');
		this.bot.sendMessage(message, this.payload.senderID, callback);
	}
	reply(message: MessageObject | String, callback?: Function): void {
		if (!this.payload.messageID) throw new Error('Cannot reply this event');
		this.bot.sendMessage(message, this.payload.threadID, callback, this.payload.messageID);
	}
	sendTypingIndicator() {
		return this.bot.sendTypingIndicator(this.payload.threadID);
	}
	markAsDelivered() {
		return this.bot.markAsDelivered(this.payload.threadID);
	}
	maskAsRead() {
		return this.bot.maskAsRead(this.payload.threadID);
	}
	muteThread(muteSeconds = 60) {
		return this.bot.muteThread(this.payload.threadID, muteSeconds);
	}
	setMessageReaction(reaction: String) {
		return this.bot.setMessageReaction(reaction, this.payload.messageID);
	}
	conversation(factory: (covo: Conversation) => void) {
		return this.bot.conversation(this.payload, factory);
	}
}

export default Chat;
