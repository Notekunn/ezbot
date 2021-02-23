import { CustomPlugin } from '../../Plugin';
interface Options {
  prefix: string;
  name: string;
  admins: string[];
}
export class CustomBot extends CustomPlugin {
  constructor(options: Options) {
    const details = {
      name: 'Custom Bot',
      version: '1.0.1',
      description: 'Custom your bot',
    };
    super(details, (bot) => {
      bot.setOptions(options);
      bot.on('start', () => {
        bot.emitInfo(`Prefix: ${bot.getOptions().prefix}`);
        bot.emitInfo(`Name: ${bot.getOptions().name}`);
      });
      const helloPattern = [/bot ơi/i, new RegExp(options.name, 'gi'), new RegExp(`Accio`, 'i')];
      bot.hear(helloPattern, (payload, chat) => {
        const { name, prefix } = bot.getOptions();
        chat.say(`${name} ready!\n` + `Prefix: ${prefix}`, () => {
          if (!bot.get(`SET_NAME_${payload.threadID}`)) {
            chat.changeNickname(`[${prefix}] ${name}`);
            bot.set(`SET_NAME_${payload.threadID}`, true);
          }
        });
      });
    });
  }
}
