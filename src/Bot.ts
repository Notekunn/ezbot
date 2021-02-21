import { EventEmitter, DefaultEventMap } from 'tsee';
import * as login from 'facebook-chat-api';
import * as fs from 'fs';
import InfoMessage from './utils/InfoMessage';
import MessageObject from './types/MessageObject';
import Middleware, { Callback } from './Middleware';
import Chat from './Chat';
import { Payload, PayloadType } from './types/Payload';
import Conversation from './Conversation';
import getPatternMatcher from './types/MatchPattern';
/**
 * Option for listen message
 * @alias ListenOptionsMiddleware
 * @type {Object}MiddlewareMiddleware
 */
export interface ListenOptions {
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
	selfListen?: boolean;
	/**
	 * Will make api.listen also handle events
	 * @default false
	 */
	listenEvents?: boolean;
	pageID?: String;
	/**
	 * Will make listener also return presence
	 */
	updatePresence?: boolean;
	/**
	 * Will automatically approve of any recent logins
	 * and continue with the login proces
	 */
	forceLogin?: boolean;
	/**
	 * The desired simulated User Agent.
	 * @example (Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18)
	 */
	userAgent?: String;
	/**
	 * Will automatically mark new messages as delivered.
	 */
	autoMarkDelivery?: boolean;
	autoMarkRead?: boolean;
}
/**
 * Option of bot
 */
export interface BotOptions {
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
export interface BotEvent extends DefaultEventMap {
	message: Callback;
	message_reply: Callback;
	event: Callback;
	message_reaction: Callback;
	info: (message: InfoMessage) => void;
	error: (error: Error, payload: Payload, chat: Chat, context: Object) => void;
}
export default class Bot extends EventEmitter<BotEvent> {
	private _options: BotOptions = {
		email: '',
		password: '',
		appStatePath: '',
		listenOptions: {
			listenEvents: true,
		},
	};
	private _isLogin: boolean = false;
	private _conversations: {
		[key: string]: Conversation;
	} = {};
	private _messageMiddleware: Middleware[] = [];
	private _eventMiddleware: Middleware[] = [];
	private _defaultMiddleware: {
		[key in PayloadType]: Middleware;
	};
	private api: any;

	/**
	 * Init a bot instance
	 * @param  {BotOptions} options
	 */
	constructor(options: BotOptions) {
		super();
		if (!options || typeof options !== 'object') throw new Error('Need bot options to start!');
		this.setOptions(options);
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
	private setListenOptions(options: ListenOptions) {
		if (options) {
			this._options = {
				...this._options,
				listenOptions: {
					...this._options.listenOptions,
					...options,
				},
			};
		}
	}
	start(options?: ListenOptions): void {
		if (this._isLogin) return;
		this.emit('start');
		this.setListenOptions(options);
		const { email, password, listenOptions = {} } = this._options;
		const appState: Object = this._readAppState();
		const identy = appState ? { appState } : { email, password };
		this.setup();
		login(identy, listenOptions, (error: any, api: any) => {
			if (error) return this.emit('error:login', error);
			this.api = api;
			this._writeAppState();
			this.emit('info', new InfoMessage('Login successfully'));
			this.listen();
		});
	}

	stop(): void {
		this.emit('stop');
	}

	listen(): void {
		if (!this.api) return;
		this.emit('info', new InfoMessage('Start listen'));
		const listener = this._getListener();
		this.api.listenMqtt(listener);
	}
	/**
	 * Setups bot
	 */
	private setup(): void {
		const errorHandler = new Middleware('event', (payload, chat, context, next, error) => {
			this.emit('error', error, payload, chat, context);
		});
		const messageMiddleware = new Middleware('message', (payload, chat, context) => {
			this.emit(payload.type, payload, chat, context, () => {});
		});
		const eventMiddleware = new Middleware('event', (payload, chat, context) => {
			this.emit('event', payload, chat, context, () => {});
		});
		messageMiddleware.setNext(errorHandler);
		eventMiddleware.setNext(errorHandler);
		this.useMiddleWare(this._messageMiddleware, messageMiddleware);
		this.useMiddleWare(this._eventMiddleware, eventMiddleware);
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
		const eventHandler = this._getEventHandler();
		const conversationHandler = this._handleConversationResponse.bind(this);
		return (error: any, payload: Payload) => {
			if (error) return this.emit('error:listen', error);

			const chat = new Chat(this, payload);
			const context = {};
			if (conversationHandler(payload)) return;
			switch (payload.type) {
				case 'message':
				case 'message_reply':
					messageHandler.execute(payload, chat, context);
					break;
				case 'event':
					eventHandler.execute(payload, chat, context);
				default:
					break;
			}
		};
	}
	private _getMessageHandler(): Middleware {
		const first = this._messageMiddleware[0];
		return first;
	}
	private _getEventHandler(): Middleware {
		const first = this._eventMiddleware[0];
		return first;
	}
	private _getConversationKey(payload: Payload): string {
		const conversationKey = payload.threadID + '_';
		if (
			payload.type === 'message' ||
			payload.type === 'message_reaction' ||
			payload.type === 'message_reply'
		)
			return conversationKey + payload.senderID;
		if (payload.type === 'event') return conversationKey + payload.author;
		return conversationKey;
	}
	private _handleConversationResponse(payload: Payload): boolean | Conversation {
		if (payload.type !== 'message' && payload.type !== 'message_reply') return false;
		const conversationKey = this._getConversationKey(payload);
		const convo = this._conversations[conversationKey];
		if (!convo || !convo.isActive()) return false;
		return convo.response(payload);
	}
	use(middleware: Middleware): this {
		//Use middleware
		if (Middleware.isMiddleware(middleware)) {
			if (middleware.type === 'message')
				this.useMiddleWare(this._messageMiddleware, middleware);
			else if (middleware.type === 'event')
				this.useMiddleWare(this._eventMiddleware, middleware);
			else throw new Error('This middleware type is not supported');
			this.emit('info', new InfoMessage(`Active middleware: ${middleware.type}`, 'BUILD'));
			return this;
		}
		//Use plugin
		return this;
	}
	private useMiddleWare(middlewares: Middleware[], middleware: Middleware): void {
		const lastMiddleware = middlewares[middlewares.length - 1];
		if (lastMiddleware) {
			lastMiddleware.setNext(middleware);
		}
		middlewares.push(middleware);
	}
	hear(patterns: RegExp | String | Array<RegExp | String>, callback: Callback) {
		if (!Array.isArray(patterns)) patterns = [patterns];
		const matchPattern = getPatternMatcher(patterns);
		const middleware = new Middleware('message', (payload, chat, context, next) => {
			if (payload.type !== 'message' && payload.type !== 'message_reply') return next();
			const { matched, command, args } = matchPattern(payload.body);
			if (!matched) return next();
			context.matched = matched;
			context.command = command;
			context.args = args;
			return callback(payload, chat, context, next);
		});
		this.use(middleware);
	}

	conversation(payload: Payload, factory: (covo: Conversation) => void) {
		if (!payload || !factory || typeof factory !== 'function') {
			return console.error(
				`You need to specify a payload and a callback to start a conversation`
			);
		}
		const convo = new Conversation(this, payload);
		const conversationKey = this._getConversationKey(payload);
		convo.on('end', (covo) => {
			this._conversations[conversationKey] = null;
		});
		this._conversations[conversationKey] = convo;

		factory(convo);
		return convo;
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
