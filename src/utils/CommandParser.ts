import { PayloadMessage } from '../types/Payload';
import Bot from '../Bot';
import Middleware from '../Middleware';
import { PayloadMessageReply } from '../types/Payload';

export default class CommandParser extends Middleware {
  constructor(bot: Bot) {
    const regex: RegExp = /(\w|\d)+/gm;
    super('message', (payload, chat, context, next) => {
      const { prefix } = bot.getOptions();
      const message = (<PayloadMessage | PayloadMessageReply>payload).body;
      if (!message.startsWith(prefix)) return next();
      const text = `${message.slice(prefix.length)}`.trim() || '';
      const [command = '', ...args] = text.match(regex);
      context.command = command.toLowerCase();
      context.args = args || [];
      next();
    });
  }
}
