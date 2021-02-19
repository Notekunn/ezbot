interface Mention {
	tag: String;
	id: String;
	fromIndex: Number;
}
export default interface MessageObject {
	body: String;
	sticker: any;
	attachment: any;
	emoji: any;
	mentions: Mention | Mention[];
}
