import { PayloadType, Payload } from './types/Payload';
import Chat from './Chat';
/**
 * Callback
 */
interface NextFunction {
	(context?: Object | Error): void;
}
interface CommandParserContext {
	command?: string;
	args?: string[];
}
interface ContextObject extends CommandParserContext {
	[key: string]: any;
}
export interface Callback {
	(payload: Payload, chat: Chat, context: ContextObject, next: NextFunction, error?: Error): void;
}
/**
 * Middleware
 *
 */
export default class Middleware {
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
		this._next = null;
	}
	setNext(next: Middleware): void {
		this._next = next;
	}
	setExecutor(executor: Callback) {
		this._executor = executor;
	}
	execute(payload: Payload, chat: Chat, context: ContextObject, error?: Error): void {
		if (typeof this._executor !== 'function') throw new Error('executor must be a function');
		if (typeof context !== 'object') throw new Error('Context must be an object');
		if (this.isLast()) {
			// Neu la middleware cuoi cung - Error handler
			this._executor(payload, chat, context, () => {}, error);
		} else if (error instanceof Error) {
			//Neu co error this pass next de xu ly
			this._next.execute(payload, chat, context, error);
		} else {
			//Neu khong co loi xay ra
			//Truyen vo ham next - (ham executor tiep theo)
			const next = (err: Error) => this._next.execute(payload, chat, context, err);
			this._executor(payload, chat, context, next);
		}
	}
	isLast(): boolean {
		return this._next == null;
	}
	static isMiddleware(instance: any) {
		return instance instanceof Middleware;
	}
	showIntro(): string {
		return `Active middleware: ${this.type}`;
	}
}
