const EventEmitter = require('eventemitter3');
const InfoMessage = require('./InfoMessage');
const Chat = require('./Chat');
const merge = require('lodash/merge');
const isObject = require('lodash/isObject');
const isArray = require('lodash/isArray');
const login = require('facebook-chat-api');
const fs = require('fs');
class Bot extends EventEmitter {
	options = {
		email: '',
		password: '',
		appStatePath: './appstate.json',
	};
	constructor(options) {
		super();
		this.setOptions(options);
		this._hearMap = [];
		this.hearer = [];
		this._conversations = [];
		this._listener = function () {};
	}
	setOptions(options) {
		if (!isObject(options)) throw new Error('options must be an object');
		merge(this.options, options);
	}

	start() {
		this._initListener();
		const { email, password } = this.options;
		const appState = this._getAppState();
		const callback = function (error, api) {
			if (error) {
				this._clean.call(this);
				this.emit('error:login', error);
				return;
			}
			this.api = api;
			this._writeAppstate.call(this);
			api.listenMqtt(this._listener);
		}.bind(this);

		login(appState ? { appState } : { email, password }, callback);
	}
	hear(keywords, callback) {
		keywords = isArray(keywords) ? keywords : [keywords];
		keywords.forEach((keyword) => this._hearMap.push({ keyword, callback }));
		return this;
	}

	_initListener() {
		this._initHearer();
		this._listener = function (error, payload) {
			if (error) return this.emit('error', error);
			this._handleListen(payload);
		}.bind(this);
	}
	_initHearer() {
		const self = this;
		self.hearer = self._hearMap.map((hear) => {
			return {
				match: self._mapHear(self, hear),
			};
		});
	}
	_mapHear(bot, hear) {
		if (typeof hear.keyword === 'string') {
			return (payload) => {
				if (payload.body.toLowerCase() == hear.keyword.toLowerCase()) {
					const chat = new Chat(
						bot,
						payload.threadID,
						payload.senderID,
						payload.messageID
					);
					hear.callback(payload, chat, {
						keyword: hear.keyword,
					});
					return true;
				}
				return false;
			};
		}
		if (hear.keyword instanceof RegExp) {
			return (payload) => {
				const text = payload.body;
				if (hear.keyword.test(text)) {
					const chat = new Chat(
						bot,
						payload.threadID,
						payload.senderID,
						payload.messageID
					);
					hear.callback(payload, chat, {
						keyword: hear.keyword,
						match: text.match(hear.keyword),
					});
					return true;
				}
				return false;
			};
		}
		return () => false;
	}
	_handleListen(payload) {
		switch (payload.type) {
			case 'message':
				this._handleMessage(payload);
				break;
			case 'event':
				this.emit('event', payload);
				break;
			case 'message_reaction':
				this.emit('message_reaction', payload);
				break;
			default:
				// console.log('payload: ', payload);
				break;
		}
	}
	_handleMessage(payload) {
		const text = payload.body;
		if (!text) return;
		const isMatch = this.hearer.some((hear) => hear.match(payload));
		if (!isMatch) {
			const chat = new Chat(this, payload.threadID, payload.senderID, payload.messageID);
			this.emit('message', payload, chat);
		}
	}
	_writeAppstate() {
		const { appStatePath } = this.options;
		if (!appStatePath)
			return this.emit('error:runtime', new Error('Appstate path is required'));
		fs.writeFile(
			appStatePath,
			JSON.stringify(this.api.getAppState()),
			function (...args) {
				this.emit('info', new InfoMessage('Lưu session thành công'));
			}.bind(this)
		);
	}
	_getAppState() {
		const { appStatePath } = this.options;
		if (fs.existsSync(appStatePath)) {
			const raw = fs.readFileSync(appStatePath);
			return JSON.parse(raw);
		}
		return undefined;
	}
	_clean() {
		const { appStatePath } = this.options;
		if (fs.existsSync(appStatePath)) {
			fs.unlinkSync(appStatePath);
		}
		this.emit('info', new InfoMessage('Dọn dẹp thành công'));
	}
}

module.exports = Bot;
