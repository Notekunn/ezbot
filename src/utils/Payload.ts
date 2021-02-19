export type PayloadType = 'message' | 'event' | 'message_reaction' | 'message_reply';

interface Event {
	type: PayloadType;
	threadID: String;
}
interface Attachment {}
interface Mention {}
export interface PayloadMessage extends Event {
	attachments: Attachment[];
	body: String;
	isGroup: Boolean;
	mentions: Mention[];
	messageID: String;
	senderID: String;
	isUnread: Boolean;
}
export interface PayloadEvent extends Event {
	author: String;
	logMessageBody: String;
	logMessageData: Object;
	logMessageType:
		| 'log:subscribe'
		| 'log:unsubscribe'
		| 'log:thread-name'
		| 'log:thread-color'
		| 'log:thread-icon'
		| 'log:user-nickname';
}
export interface PayloadMessageReaction extends Event {
	/**
	 * Adu
	 */
	messageID: String;
	offlineThreadingID: String;
	reaction: String;
	senderID: String;
	timestamp: any;
	userID: String;
}
/**
 * Payload for event
 */
interface Payload extends PayloadMessage, PayloadEvent, PayloadMessageReaction {}
// type Payload = PayloadMessage & PayloadEvent & PayloadMessageReaction;

export default Payload;
