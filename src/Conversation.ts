import { Bot } from './Bot';
import { Chat } from './Chat';
import Payload, { PayloadType } from './utils/Payload';
// import MessageObject from './utils/MessageObject';
type Question = String | Function;
export interface AnswerCallback {
	(payload: Payload, convo: Conversation, chat?: Chat): void;
}
export class Conversation extends Chat {
	private waitingForAnswer: Boolean;
	private listeningAnswer: AnswerCallback;
	private listeningAnswerType: PayloadType[];
	private active: Boolean;
	private context: {
		[key: string]: any;
	};
	constructor(bot: Bot, payload: Payload) {
		super(bot, payload);
		this.waitingForAnswer = false;
		this.context = {};
		this.start();
	}
	start() {
		this.active = true;
		this.emit('start', this);
		return this;
	}
	end() {
		this.active = false;
		this.emit('end', this);
		return this;
	}
	ask(
		question: Question,
		onAnswer: AnswerCallback,
		type?: PayloadType | PayloadType[]
	): Conversation {
		if (!question || !onAnswer || typeof onAnswer !== 'function') {
			this.emit('error', new Error(`You need to specify a question and answer to ask`));
			return;
		}
		if (typeof question === 'function') {
			question.call(this);
		} else {
			this.say(question);
		}
		this.waitingForAnswer = true;
		this.listeningAnswer = onAnswer;
		if (typeof type == 'string') {
			this.listeningAnswerType = [type];
		} else if (Array.isArray(type)) {
			this.listeningAnswerType = type;
		} else {
			this.listeningAnswerType = ['message'];
		}
		return this;
	}
	response(payload: Payload): Conversation | Boolean {
		//Skip if no question asked
		if (!this.isWaitingForAnswer()) {
			return false;
		}
		//Skip if payload type not match
		if (!this.listeningAnswerType.includes(payload.type)) {
			return false;
		}
		if (this.listeningAnswer && typeof this.listeningAnswer === 'function') {
			// this.stopWaitingForAnswer();
			const listeningAnswer = this.listeningAnswer;
			this.listeningAnswer = null;
			listeningAnswer(payload, this /* new Chat(this.bot, payload) */);
			return this;
		}
		// End if not
		return this.end();
	}
	isWaitingForAnswer(): Boolean {
		return this.waitingForAnswer;
	}
	stopWaitingForAnswer(): void {
		this.waitingForAnswer = false;
		this.listeningAnswer = null;
	}
	isActive(): Boolean {
		return this.active;
	}
	get(property: string): any {
		this.context[property];
	}
	set(property: string, value: any): void {
		this.context[property] = value;
	}
}
