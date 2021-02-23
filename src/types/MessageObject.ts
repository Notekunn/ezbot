interface Mention {
  tag: string;
  id: string;
  fromIndex: Number;
}
export default interface MessageObject {
  body: string;
  sticker: any;
  attachment: any;
  emoji: any;
  mentions: Mention | Mention[];
}
