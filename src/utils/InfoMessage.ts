import * as chalk from 'chalk';
/**
 * Log message wrapper with date
 */
class InfoMessage {
	message: string;
	createdAt: Date;
	group: string;
	/**
	 * @param  {string} message - Message to show
	 * @param  {string} [group=SYSTEM] - Group log (custom)
	 * @constructor
	 */
	constructor(message: string, group = 'SYSTEM') {
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
