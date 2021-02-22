import Bot from './Bot';
import { Payload, PayloadMessage, PayloadMessageReaction } from './types/Payload';
import MessageObject from './types/MessageObject';
import Conversation from './Conversation';
import { EventEmitter, DefaultEventMap } from 'tsee';
import { threadId } from 'worker_threads';
export interface ConversationEvent extends DefaultEventMap {
	end: (convo: Conversation) => void;
	start: (convo: Conversation) => void;
}
export default class Chat extends EventEmitter<ConversationEvent> {
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
	say(message: MessageObject | string, callback?: Function): void {
		this.bot.sendMessage(message, this.payload.threadID, callback);
	}
	inbox(message: MessageObject | string, callback?: Function): void {
		if (
			this.payload.type === 'message' ||
			this.payload.type === 'message_reaction' ||
			this.payload.type === 'message_reply'
		)
			return this.bot.sendMessage(message, this.payload.senderID, callback);
		throw new Error('Cannot inbox with this event');
	}
	reply(message: MessageObject | string, callback?: Function): void {
		if (
			this.payload.type == 'message' ||
			this.payload.type == 'message_reply' ||
			this.payload.type == 'message_reaction'
		)
			return this.bot.sendMessage(
				message,
				this.payload.threadID,
				callback,
				this.payload.messageID
			);
		throw new Error('Cannot reply this event');
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
	setMessageReaction(reaction: string) {
		if (
			this.payload.type == 'message' ||
			this.payload.type == 'message_reply' ||
			this.payload.type == 'message_reaction'
		)
			return this.bot.setMessageReaction(reaction, this.payload.messageID);
	}
	changeNickname(nickname: string, participantID?: string) {
		return this.bot.changeNickname(nickname, this.payload.threadID, participantID);
	}
	deleteThread() {
		return this.bot.deleteThread(this.payload.threadID);
	}
	conversation(factory: (covo: Conversation) => void) {
		return this.bot.conversation(this.payload, factory);
	}
	addUserToGroup(senderID: string, callback?: Function) {
		return this.bot.addUserToGroup(senderID, this.payload.threadID, callback);
	}
	removeUserFromGroup(senderID: string, callback?: Function) {
		return this.bot.removeUserFromGroup(senderID, this.payload.threadID, callback);
	}
	unsendMessage(callback?: Function) {
		return this.bot.unsendMessage(
			(<PayloadMessage | PayloadMessageReaction>this.payload).messageID,
			callback
		);
	}
}
