import { CustomPlugin } from './../../Plugin';
import * as fs from 'fs';
import Bot, { BotOptions } from '../../Bot';
interface Options {
	location: string;
	forceWrite: boolean;
}
export class SyncOptions extends CustomPlugin {
	private options: Options;
	private isReady: boolean;
	constructor(options: Options) {
		if (!options || !options) throw new Error('You need to config this plugin');

		const details = {
			name: 'SyncOptions',
			version: '1.0.1',
			description: 'Sync option when your bot start',
		};
		super(details, (bot) => {
			// bot.on
			bot.on('update_options', (opt) => {
				this.writeOptions(bot, opt);
			});
		});
		this.options = options;
		//Chua khoi dong luc dau
		this.isReady = false;
	}
	writeOptions(bot: Bot, opt: BotOptions): void {
		const { location, forceWrite } = this.options;
		if (!this.isReady) return;
		fs.writeFile(location, JSON.stringify(opt, null, '\t'), { encoding: 'utf-8' }, (error) => {
			if (error)
				return bot.emit('error:runtime', new Error('Write option error: ' + error.message));
			bot.emitInfo('Save options success!');
		});
	}
	sync(bot: Bot): void {
		const { location, forceWrite } = this.options;
		try {
			const exists = fs.existsSync(location);
			if (!exists) {
				fs.writeFileSync(location, '{}');
				return;
			}
			const data = fs.readFileSync(location, { encoding: 'utf-8' });
			const opt = JSON.parse(data);
			bot.setOptions(opt);
			//Enable auto sync
			this.isReady = true;
			bot.emitInfo('Sync options success!');
		} catch (error) {
			bot.emit('error:runtime', new Error('Sync error: ' + error.message));
		}
	}
	active(bot: Bot): void {
		super.active(bot);
		this.sync(bot);
	}
}
