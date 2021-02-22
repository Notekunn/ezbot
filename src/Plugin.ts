import Bot from './Bot';

interface PluginInfo {
	name?: string;
	version?: string;
	description?: string;
}
const defaultInfo: PluginInfo = {
	name: 'Anonymous Plugin',
	version: '1.0.0',
};
export interface PluginCallback {
	(bot: Bot): void;
}
export class CustomPlugin {
	private info: PluginInfo;
	private callback: PluginCallback;
	protected enabled: boolean = true;
	constructor(info: PluginInfo, callback?: PluginCallback) {
		if (!info) throw new Error('Info Plugin ?');
		this.info = {
			...defaultInfo,
			...info,
		};
		this.callback = callback;
	}
	static isPlugin(o: any): boolean {
		return o instanceof CustomPlugin;
	}
	setCallback(callback: PluginCallback) {
		this.callback = callback;
	}
	active(bot: Bot) {
		if (!Bot.isBot(bot)) throw new Error('Need bot instance');
		this.callback(bot);
	}
	showIntro(): string {
		return `Active plugin: ${this.info.name || 'Anonymous'}@${this.info.version}`;
	}
	enable() {
		this.enabled = true;
	}
	disable() {
		this.enabled = false;
	}
}
