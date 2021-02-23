import { PayloadMessage, PayloadMessageReply } from './types/Payload';
import Middleware, { Callback } from './Middleware';
import Bot from './Bot';

export interface CommandConfig {
  enabled: boolean;
  groupOnly?: boolean;
  pmOnly?: boolean;
  alias?: string[];
  command: string;
  description: string;
  usage: string;
  category?: string | string[];
}
const defaultConfig: CommandConfig = {
  enabled: true,
  groupOnly: false,
  pmOnly: false,
  alias: [],
  command: 'pogg',
  description: '',
  usage: '{prefix}pogg',
  category: 'Basic',
};

export default class Command extends Middleware {
  private config: CommandConfig;
  constructor(config: CommandConfig, execute: Callback) {
    super('message', (payload: PayloadMessage | PayloadMessageReply, chat, context, next) => {
      const { command, args = [] } = context;
      const bot = chat.bot;
      //Khong match command
      if (!this.match(command)) return next();
      if (!this.isEnable()) return chat.reply(`Chức năng hiện đang bảo trì!`);
      if (args[0] === 'help')
        return chat.reply(
          bot.replaceMessage(this.showUsage(), { prefix: bot.getOptions().prefix })
        );
      if (payload.isGroup && this.config.pmOnly)
        return chat.reply(`Chỉ hoạt động trong tin nhắn riêng!`);
      if (!payload.isGroup && this.config.groupOnly)
        return chat.reply(`Chỉ hoạt động trong nhóm chat!`);
      execute(payload, chat, context, next);
    });
    this.config = {
      ...defaultConfig,
      ...config,
    };
  }
  private match(cmd: string): boolean {
    const { command, alias } = this.config;
    if (command && command === cmd) return true;
    return Array.isArray(alias) && alias.includes(cmd);
  }
  showUsage(): string {
    const { command, description, usage } = this.config;
    return `*${command}*\n${description}\n${usage}`;
  }
  isEnable(): boolean {
    return this.config.enabled;
  }
  active(bot: Bot) {
    const { command, category } = this.config;
    if (bot._commands[command]) throw new Error('Dupicate command: ' + command);
    super.active(bot);
    bot._commands[command] = this.config;
  }
}
