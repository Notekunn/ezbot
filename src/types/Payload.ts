import { Attachment } from './Attachment';
interface PayloadTemplate {
	type: PayloadType;
	threadID: string;
}

type Mention = {
	[key: string]: string;
};
export interface PayloadMessage extends PayloadTemplate {
	type: 'message';
	attachments?: Attachment[];
	body: string;
	isGroup: boolean;
	mentions: Mention;
	messageID: string;
	senderID: string;
	isUnread: boolean;
}
export interface PayloadEvent extends PayloadTemplate {
	type: 'event';
	author: string;
	logMessageBody: string;
	logMessageData: Object;
	logMessageType:
		| 'log:subscribe'
		| 'log:unsubscribe'
		| 'log:thread-name'
		| 'log:thread-color'
		| 'log:thread-icon'
		| 'log:user-nickname';
}
export interface PayloadMessageReaction extends PayloadTemplate {
	type: 'message_reaction';
	messageID: string;
	offlineThreadingID: string;
	reaction: string;
	senderID: string;
	timestamp: any;
	userID: string;
}
export interface PayloadMessageReply extends PayloadTemplate {
	type: 'message_reply';
	attachments: Attachment[];
	body: string;
	isGroup: boolean;
	mentions: Mention;
	messageID: string;
	senderID: string;
	isUnread: boolean;
	messageReply: PayloadMessage;
}
export interface PayloadMessageUnsend extends PayloadTemplate {
	type: 'message_unsend';
	senderID: string;
	messageID: string;
	deletionTimestamp: any;
}

/**
 * Payload for event
 */
export type Payload =
	| PayloadMessage
	| PayloadEvent
	| PayloadMessageReaction
	| PayloadMessageReply
	| PayloadMessageUnsend;

export type PayloadType = Payload['type'];
export type PayloadByType<E extends Payload['type'], T = Payload> = T extends { type: E }
	? T
	: never;
