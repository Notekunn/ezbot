import { EventEmitter, DefaultEventMap } from 'tsee';
import * as login from 'facebook-chat-api';
import * as fs from 'fs';
import InfoMessage from './utils/InfoMessage';
import MessageObject from './utils/MessageObject';
import Middleware, { Callback } from './Middleware';
import Chat from './Chat';
import Payload from './utils/Payload';
import getPatternMatcher from './utils/MatchPattern';
/**
 * Option for listen message
 * @alias ListenOptions
 * @type {Object}
 */
interface ListenOptions {
	/**
	 * The desired logging level as determined by npmlog.
	 * Choose from either "silly", "verbose", "info", "http", "warn",
	 * "error", or "silent".
	 */
	logLevel?: 'silly' | 'verbose' | 'info' | 'http' | 'warn' | 'error' | 'silent';
	/**
	 * Set this to true if you want your api to receive messages
	 * from its own account.
	 * This is to be used with caution, as it can result in loops
	 * (a simple echo bot will send messages forever).
	 * @default false
	 */
	selfListen?: Boolean;
	/**
	 * Will make api.listen also handle events
	 * @default false
	 */
	listenEvents?: Boolean;
	pageID?: String;
	/**
	 * Will make listener also return presence
	 */
	updatePresence?: Boolean;
	/**
	 * Will automatically approve of any recent logins
	 * and continue with the login proces
	 */
	forceLogin?: Boolean;
	/**
	 * The desired simulated User Agent.
	 * @example (Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18)
	 */
	userAgent?: String;
	/**
	 * Will automatically mark new messages as delivered.
	 */
	autoMarkDelivery?: Boolean;
	autoMarkRead?: Boolean;
}
/**
 * Option of bot
 */
interface BotOptions {
	/**
	 * The email of bot account
	 */
	email: String;
	/**
	 * The password of bot account
	 */
	password: String;
	/**
	 * The location which bot state is saved
	 * Ex: './appstate.json'
	 */
	appStatePath: string;
	/**
	 * The config for bot listen in facebook
	 */
	listenOptions?: ListenOptions;
}
interface BotEvent extends DefaultEventMap {
	message: Callback;
	event: Callback;
	message_reaction: Callback;
	info: (message: InfoMessage) => void;
}

// declare interface Bot {
// 	on<U extends keyof BotEvent>(event: U, listener: BotEvent[U]): this;

// 	emit<U extends keyof BotEvent>(event: U, ...args: Parameters<BotEvent[U]>): boolean;
// }
class Bot extends EventEmitter<BotEvent> {
	private _options: BotOptions;
	private _isLogin: Boolean = false;
	private _messageMiddleware: Middleware[] = [];
	private _eventMiddleware: Middleware[] = [];
	private _defaultMiddleware: {
		message: Middleware;
		event: Middleware;
	} = { message: null, event: null };
	private api: any;

	/**
	 * Init a bot instance
	 * @param  {BotOptions} options
	 */
	constructor(options: BotOptions) {
		super();
		if (!options || typeof options !== 'object') throw new Error('Need bot options to start!');
		this._options = options;
		this.on('start', () => {
			this._isLogin = true;
		});
		this.on('stop', () => {
			this._isLogin = false;
		});
		this.on('error:login', () => {
			this._clean();
			this.stop();
		});
		this._defaultMiddleware.message = new Middleware('message', (payload, chat, context) => {
			this.emit('message', payload, chat, context, () => {});
		});
		this._defaultMiddleware.event = new Middleware('event', (payload, chat, context) => {
			this.emit('event', payload, chat, context, () => {});
		});
	}

	/**
	 * Update option
	 * @param  {BotOptions} options
	 */
	setOptions(options: BotOptions) {
		this._options = {
			...this._options,
			...options,
		};
	}
	getOptions(): BotOptions {
		return this._options;
	}
	start(): void {
		this.emit('start');
		const { email, password, appStatePath, listenOptions = {} } = this._options;
		const appState: Object = this._readAppState();
		const identy = appState ? { appState } : { email, password };
		login(identy, listenOptions, (error: any, api: any) => {
			if (error) return this.emit('error:login', error);
			this.api = api;
			this._writeAppState();
			this.listen();
		});
	}

	stop(): void {
		this.emit('stop');
	}

	listen(): void {
		if (!this.api) return;
		const listener = this._getListener();
		this.api.listenMqtt(listener);
	}
	private _writeAppState(): void {
		if (!this._isLogin) return;
		const { appStatePath } = this._options;

		if (!appStatePath) {
			this.emit('error:runtime', new Error('Appstate path is required'));
			return;
		}
		fs.writeFile(appStatePath, JSON.stringify(this.getAppState()), () => {
			this.emit('info', new InfoMessage('Lưu session thành công'));
		});
	}

	private _readAppState(): Object {
		const { appStatePath } = this._options;
		if (fs.existsSync(appStatePath)) {
			const raw: string = fs.readFileSync(appStatePath, 'utf8');
			return JSON.parse(raw);
		}
		return undefined;
	}

	private _clean(): void {
		const { appStatePath } = this._options;
		if (fs.existsSync(appStatePath)) {
			fs.unlinkSync(appStatePath);
		}
		this.emit('info', new InfoMessage('Dọn dẹp thành công'));
	}
	private _getListener() {
		const messageHandler = this._getMessageHandler();
		return (error: any, payload: Payload): void => {
			if (error) {
				this.emit('error:listen', error);
				return;
			}
			const chat = new Chat(this, payload);
			const context = {};
			switch (payload.type) {
				case 'message':
					messageHandler.execute(payload, chat, context);
					break;

				default:
					break;
			}
		};
	}
	private _getMessageHandler(): Middleware {
		const first = this._messageMiddleware[0];
		if (!first) return this._defaultMiddleware.message;
		return first;
	}
	use(middleware: Middleware): this {
		//Use middleware
		if (Middleware.isMiddleware(middleware)) {
			let middlewares: Middleware[];
			middleware.setNext(this._defaultMiddleware[middleware.type]);
			if (middleware.type === 'message') middlewares = this._messageMiddleware;
			else if (middleware.type === 'event') middlewares = this._eventMiddleware;
			else throw new Error('This middleware type is not supported');
			const lastMiddleware = middlewares[middlewares.length - 1];
			if (lastMiddleware) {
				lastMiddleware.setNext(middleware);
			}
			middlewares.push(middleware);
			this.emit('info', new InfoMessage(`Active middleware: ${middleware.type}`, 'BUILD'));
			return this;
		}
		//Use plugin
		return this;
	}
	hear(patterns: RegExp | String | Array<RegExp | String>, callback: Callback) {
		if (!Array.isArray(patterns)) patterns = [patterns];
		const matchPattern = getPatternMatcher(patterns);
		const middleware = new Middleware('message', (payload, chat, context, next) => {
			const { matched, command, args } = matchPattern(payload.body);
			if (!matched) return next();
			const newContext = { ...context, matched, command, args };
			return callback(payload, chat, newContext, next);
		});
		this.use(middleware);
	}
	getAppState(): Object {
		return this.api.getAppState();
	}
	getCurrentUserID(): Number {
		return this.api.getCurrentUserID();
	}
	sendMessage(
		message: String | MessageObject,
		threadID: String,
		callback?: Function,
		messageID?: String
	): void {
		if (!callback) {
			callback = () => {};
		}
		if (typeof callback === 'string') {
			messageID = callback;
			callback = () => {};
		}
		return this.api.sendMessage(message, threadID, callback, messageID);
	}
	sendTypingIndicator(threadID: String) {
		return this.api.sendTypingIndicator(threadID);
	}
	markAsDelivered(threadID: String) {
		return this.api.markAsDelivered(threadID);
	}
	maskAsRead(threadID: String) {
		return this.api.markAsRead(threadID);
	}
	muteThread(threadID: String, muteSeconds = 60) {
		return this.api.muteThread(threadID, muteSeconds);
	}
	setMessageReaction(reaction: String, messageID: String) {
		return this.api.setMessageReaction(reaction, messageID);
	}
	static isBot(instance: any) {
		return instance instanceof Bot;
	}
}

export default Bot;
