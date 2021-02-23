import * as admin from 'firebase-admin';
import Bot from '../../Bot';
import { CustomPlugin } from '../../Plugin';
import { PayloadMessage } from '../../types/Payload';
interface Options {
  serviceAccount: any;
  databaseURL: string;
}
const details = {
  name: 'FirebaseSync',
  descriptions: 'Sync local data with firebase realtime',
  version: '1.0.1-beta',
};
export class FirebaseSync extends CustomPlugin {
  private options: Options;
  private db: admin.database.Database;
  rootRef: admin.database.Reference;
  constructor(options: Options) {
    if (!options || !options.serviceAccount || !options.databaseURL) {
      throw new Error('You must specify service account and database url!');
    }
    super(details);
    this.options = options;
    this.initFirebase();
    this.setCallback(this.sync.bind(this));
  }
  private getCredential(): admin.credential.Credential {
    return admin.credential.cert(this.options.serviceAccount);
  }
  active(bot: Bot) {
    bot.rootRef = this.rootRef;
    super.active(bot);
  }
  initFirebase(): void {
    admin.initializeApp({
      credential: this.getCredential(),
      databaseURL: this.options.databaseURL,
    });
    this.db = admin.database();
    this.rootRef = this.db.ref('ezbot');
  }
  sync(bot: Bot) {
    // this.syncUser(bot);
    // this.syncThread(bot);
    this.syncRef(bot, 'users');
    this.syncRef(bot, 'threads');
    this.syncRef(bot, 'black_list');
    bot.on('message', (payload: PayloadMessage, chat, next) => {
      const { senderID, threadID } = payload;
      this.updateUser(bot, senderID);
      if (payload.isGroup) this.updateThread(bot, threadID);
    });
  }

  private syncRef(bot: Bot, child: string) {
    const ref = bot.rootRef.child(child);
    ref.on('child_added', (snapshot) => {
      const value = snapshot.val();
      const key = snapshot.key;
      if (!bot.cache[child]) bot.cache[child] = {};
      bot.cache[child][key] = value;
    });
    ref.on('child_changed', (snapshot) => {
      const value = snapshot.val();
      const key = snapshot.key;
      bot.cache[child][key] = value;
    });
    ref.on('child_removed', (snapshot) => {
      const key = snapshot.key;
      bot.cache[child][key] = null;
    });
  }
  updateUser(bot: Bot, senderID: string) {
    if (!senderID) return;
    if (bot.cache.users && bot.cache.users[senderID]) return;
    const userRef = this.rootRef.child('users');
    bot.getUserInfo(senderID, (err: any, info: any) => {
      if (err) return bot.emit('error:runtime', 'Sync users error: ' + err.message);
      const user = info[senderID];
      if (!user) return;
      //    bot.emit('error:runtime', 'Sync firebase error: Not found user');
      userRef.update({
        [senderID]: user,
      });
    });
  }
  updateThread(bot: Bot, threadID: string) {
    if (!threadID) return;
    if (bot.cache.threads && bot.cache.threads[threadID]) return;
    const threadRef = this.rootRef.child('threads');
    bot.getThreadInfo(threadID, (err, info) => {
      if (err) return bot.emit('error:runtime', 'Sync threads error: ' + err.message);
      if (!info) return;
      const { adminIDs, name, nicknames, folder, isArchived } = info;
      if (!name) return;
      threadRef.update({
        [threadID]: { adminIDs, name, nicknames, folder, isArchived },
      });
    });
  }
}
