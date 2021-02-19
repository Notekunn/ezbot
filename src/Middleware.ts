import * as EventEmitter from 'eventemitter3';
import Payload, { PayloadType } from './utils/Payload';
import Chat from './Chat';
/**
 * Callback
 */
interface NextFunction {
	(context?: Object): void;
}
export interface Callback {
	(payload: Payload, chat: Chat, context: Object, next: NextFunction): void;
}
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
	constructor(type: PayloadType, executor: Callback) {
		this.type = type;
		this._executor = executor;
	}
	setNext(next: Middleware): void {
		this._next = next;
	}
	execute(payload: Payload, chat: Chat, context: Object): void {
		if (typeof this._executor !== 'function') throw new Error('executor must be a function');
		this._executor(payload, chat, context, (newContext = context) =>
			this.next(payload, chat, newContext)
		);
	}
	private next(payload: Payload, chat: Chat, context: Object): void {
		if (this._next) this._next.execute(payload, chat, context);
	}
	static isMiddleware(instance: any) {
		return instance instanceof Middleware;
	}
}
export default Middleware;
