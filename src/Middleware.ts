import * as EventEmitter from 'eventemitter3';
import Payload, { PayloadType } from './utils/Payload';
import Chat from './Chat';
/**
 * Callback
 */
export type Callback = (payload: Payload, chat: Chat, context: any, next: Function) => void;
/**
 * Middleware
 *
 */
class Middleware {
	private _executor: Callback;
	private _next: Middleware;
	type: PayloadType;
	/**
	 * Init a middleware
	 * @param  {Callback} executor
	 * @param  {Middleware} next
	 */
	constructor(type: PayloadType, executor: Callback, next?: Middleware) {
		this.type = type;
		this._executor = executor;
		this._next = next;
	}
	setNext(next: Middleware): void {
		this._next = next;
	}
	execute(payload: Payload, chat: Chat, context: any): void {
		if (typeof this._executor !== 'function') throw new Error('executor must be a function');
		this._executor(payload, chat, context, this.next);
	}
	private next(payload: Payload, chat: Chat, context: any): void {
		if (this._next) this._next.execute(payload, chat, context);
	}
	static isMiddleware(instance: any) {
		return instance instanceof Middleware;
	}
}
export default Middleware;
