const { Bot, Command } = require('../');
const { CustomBot, HelloGroup, FirebaseSync } = require('../lib/plugins/');
const serviceAccount = require('./serviceAccount.json');
const config = require('config');
const path = require('path');
const bot = new Bot({
  email: config.get('email'),
  password: config.get('password'),
  appStatePath: path.resolve(__dirname, '../appstate.json'),
  listenOptions: {
    logLevel: 'info',
  },
});
bot.on('error', (error, payload, chat) => {
  chat.say(error.stack);
});
bot
  .use((bot) => {
    bot.on('message', (payload, chat) => {
      console.log(payload);
    });
    bot.on('event', (payload) => {
      console.log(payload);
    });
    bot.on('info', (message) => {
      message.log();
    });
    bot.on('error:login', (error) => {
      console.log('Listen failed', error);
    });
    bot.on('error:runtime', (error) => {
      console.log(error);
    });
  })
  .use(
    new CustomBot({
      name: 'EZBoiiiiiii',
      prefix: '!#',
      admins: ['100009859624773'],
    })
  )
  .use(
    new FirebaseSync({
      databaseURL: 'https://ezbot-server-data-default-rtdb.firebaseio.com',
      serviceAccount,
    })
  )
  .use(
    new Command({ command: 'ping', usage: 'Ping thoi' }, (payload, chat, context) => {
      bot.getUserInfo(payload.senderID, (error, info) => {
        // const user = info[payload.senderID];
        // if (!user) return;
        // else {
        // 	bot.get('use
        // }
      });
      chat.say('Pong!');
    })
  );
bot.start({
  listenEvents: true,
});
