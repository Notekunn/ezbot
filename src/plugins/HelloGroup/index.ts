import Middleware from '../../Middleware';
import { CustomPlugin } from '../../Plugin';
import { PayloadEvent } from '../../types/Payload';
interface Options {}

export class HelloGroup extends CustomPlugin {
	constructor(options: Options) {
		const details = {
			name: 'HelloGroup',
			version: '1.0.1',
			description: 'Say hello when you join group',
		};
		super(details, (bot) => {
			const middleware = new Middleware(
				'event',
				(event: PayloadEvent, chat, context, next) => {
					const { prefix, name, admins } = bot.getOptions();
					if (event.logMessageType == 'log:subscribe') {
						const addedParticipants: any[] =
							event.logMessageData.addedParticipants || [];
						if (addedParticipants.find((e) => e.userFbId == bot.getCurrentUserID())) {
							bot.emitInfo(`Added into group: ${event.threadID}`, 'BOT');
							chat.say(`${name} ready!\n` + `Prefix: ${prefix}`);
							chat.changeNickname(`[${prefix}] ${name}`, bot.getCurrentUserID());
						}
					}
					if (event.logMessageType == 'log:unsubscribe') {
						const leftID = event.logMessageData.leftParticipantFbId;
						if (leftID == bot.getCurrentUserID()) {
							bot.emitInfo(`Remove from group: ${event.threadID}`, 'BOT');
							chat.deleteThread();
						}
					}
					next();
				}
			);
			bot.use(middleware);
		});
	}
}
