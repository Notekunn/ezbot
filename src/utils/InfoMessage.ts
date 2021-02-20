import * as chalk from 'chalk';
/**
 * Log message wrapper with date
 */
class InfoMessage {
	message: String;
	createdAt: Date;
	group: String;
	/**
	 * @param  {String} message - Message to show
	 * @param  {String} [group=SYSTEM] - Group log (custom)
	 * @constructor
	 */
	constructor(message: String, group = 'SYSTEM') {
		this.message = message;
		this.createdAt = new Date();
		this.group = group;
	}
	/**
	 * Show message
	 */
	log(): void {
		console.log(
			chalk.green(this.group),
			chalk.magenta(this.createdAt.toLocaleString()),
			this.message
		);
	}
}
export default InfoMessage;
