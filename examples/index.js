const EzBot = require('../');
const config = require('config');
const path = require('path');
const bot = new EzBot({
	email: config.get('email'),
	password: config.get('password'),
	appStatePath: path.resolve(__dirname, '../appstate.json'),
});

const ping = require('./plugins/ping');
const echo = require('./plugins/echo');
bot.register(ping).register(echo);

bot.start();
