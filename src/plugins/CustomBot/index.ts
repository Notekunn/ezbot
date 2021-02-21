import { CustomPlugin } from '../../Plugin';
interface Options {
	prefix: string;
	name: string;
	admin: string;
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
		});
	}
}
