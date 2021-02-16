const Chat = require('./Chat');
const flatten = require('lodash/flatten');
class Conversation extends Chat {
	constructor(bot, threadID, senderID, messageID) {
		super(bot, threadID, senderID, messageID);
		this.bot = bot;
		this.context = {};
		this.waitingForAnswer = false;
		this.start();
	}
	/**
	 * const answer = (payload, convo) => {
	 *      const text = payload.message.text;
	 *      convo.say(`Oh, you like ${text}!`);
	 * };
	 * callbacks = [{
	 *  {
	 * 	pattern: ['black', 'white'],
	 * 	callback: () => { / User said "black" or "white" / }
	 * }]
	 *
	 */
	ask(question, answer, callbacks) {
		if (!question || !answer || typeof answer !== 'function') {
			return console.error(`You need to specify a question and answer to ask`);
		}
		if (typeof question === 'function') {
			question.call(this, this);
		} else {
			this.say(question);
		}
		this.waitingForAnswer = true;
		this.listeningAnswer = answer;
		this.listeningCallbacks = flatten([callbacks]);
		return this;
	}

	respond(payload) {
		if (!this.isWaitingForAnswer()) {
			return false;
		}
		if (this.listeningAnswer && typeof this.listeningAnswer === 'function') {
			const listeningAnswer = this.listeningAnswer;
			this.listeningAnswer = null;
			listeningAnswer.call(this, payload, this);
			return this;
		}
		return this.end();
	}

	isActive() {
		return this.active;
	}

	isWaitingForAnswer() {
		return this.waitingForAnswer;
	}

	stopWaitingForAnswer() {
		this.waitingForAnswer = false;
		this.listeningCallbacks = [];
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
	get(property) {
		return this.context[property];
	}
	set(property, value) {
		this.context[property] = value;
		return this.context[property];
	}
}

module.exports = Conversation;
