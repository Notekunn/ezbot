import Bot from '../Bot';
import Command from '../Command';
import { PayloadMessage, PayloadMessageReply } from '../types/Payload';
const config = {
  enabled: true,
  alias: [],
  command: 'help',
  description: 'Hiển thị bảng trợ giúp',
  usage: '{prefix}help [command]',
};
const seperator = '-'.repeat(15);
export default class HelpCommand extends Command {
  constructor(bot: Bot) {
    super(config, (payload: PayloadMessage | PayloadMessageReply, chat, context, next) => {
      if (payload.isGroup) chat.reply(`Check inbox`);
      const helpString = bot.replaceMessage(this.showHelp(bot), bot.getOptions());
      chat.inbox(helpString);
    });
  }
  showHelp(bot: Bot) {
    const categories = {};
    for (let cmd in bot._commands) {
      const { category } = bot._commands[cmd];
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd);
    }
    let helpString = '{name}\n';
    for (const category in categories) {
      const cmds = categories[category];
      helpString += seperator + '\n';
      helpString += `*${category}*\n`;
      helpString += cmds.join(', ') + '\n';
    }
    helpString += seperator + '\n';
    helpString += '{prefix}<command> help to show more';
    return helpString;
  }
}
