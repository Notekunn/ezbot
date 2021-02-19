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
		console.log(this.group, this.createdAt.toLocaleString(), this.message);
	}
}
export default InfoMessage;
