import Bot from '../../Bot';
import Middleware from '../../Middleware';
import { CustomPlugin } from '../../Plugin';
import { PayloadEvent } from '../../types/Payload';
interface Options {
	sayHello?: {
		showPrefix?: boolean;
		setNickname?: boolean;
	};
}
const defaultOption: Options = {
	sayHello: {
		setNickname: false,
		showPrefix: true,
	},
};
export class HelloGroup extends CustomPlugin {
	private options: Options;
	constructor(options: Options) {
		const details = {
			name: 'HelloGroup',
			version: '1.0.1',
			description: 'Say hello when you join group',
		};
		super(details, (bot) => {
			const middleware = new Middleware('event', this.onEvent(bot));
			bot.use(middleware);
		});
		this.options = {
			...defaultOption,
			...options,
		};
	}
	onEvent(bot: Bot) {
		return (event: PayloadEvent, chat, context, next) => {
			// if (!this.enabled) return next();
			const { prefix, name, admins } = bot.getOptions();
			const { sayHello } = this.options;
			if (event.logMessageType == 'log:subscribe') {
				const addedParticipants: any[] = event.logMessageData.addedParticipants || [];
				if (
					!sayHello ||
					!addedParticipants.find((e) => e.userFbId == bot.getCurrentUserID())
				)
					return;
				bot.emitInfo(`Added into group: ${event.threadID}`, 'BOT');
				if (!sayHello.showPrefix) return;
				chat.say(`${name} ready!\n` + `Prefix: ${prefix}`, () => {
					if (!sayHello.setNickname || bot.get(`SET_NAME_${event.threadID}`)) return;
					chat.changeNickname(`[${prefix}] ${name}`);
					bot.set(`SET_NAME_${event.threadID}`, true);
				});
			}
			if (event.logMessageType == 'log:unsubscribe') {
				const leftID = event.logMessageData.leftParticipantFbId;
				if (leftID == bot.getCurrentUserID()) {
					bot.emitInfo(`Remove from group: ${event.threadID}`, 'BOT');
					chat.deleteThread();
				}
			}
			next();
		};
	}
}
