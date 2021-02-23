import Bot from './Bot';
import Chat from './Chat';
import { PayloadType, Payload, PayloadMessage, PayloadMessageReply } from './types/Payload';
// import MessageObject from './utils/MessageObject';
type Question = string | Function;
export interface AnswerCallback {
  (payload: Payload, convo: Conversation, chat?: Chat): void;
}
export default class Conversation extends Chat {
  private waitingForAnswer: boolean;
  private listeningAnswer: AnswerCallback;
  private listeningAnswerType: PayloadType[];
  private active: boolean;
  private context: {
    [key: string]: any;
  };
  constructor(bot: Bot, payload: Payload) {
    super(bot, payload);
    this.waitingForAnswer = false;
    this.context = {};
    this.start();
  }
  start() {
    this.active = true;
    this.emit('start', this);
    return this;
  }
  end() {
    this.active = false;
    this.emit('end', this);
    return this;
  }
  ask(
    question: Question,
    onAnswer: AnswerCallback,
    type?: PayloadType | PayloadType[]
  ): Conversation {
    if (!question || !onAnswer || typeof onAnswer !== 'function') {
      this.emit('error', new Error(`You need to specify a question and answer to ask`));
      return;
    }
    if (typeof question === 'function') {
      question.call(this);
    } else {
      this.say(question);
    }
    this.waitingForAnswer = true;
    this.listeningAnswer = onAnswer;
    if (typeof type == 'string') {
      this.listeningAnswerType = [type];
    } else if (Array.isArray(type)) {
      this.listeningAnswerType = type;
    } else {
      this.listeningAnswerType = ['message'];
    }
    return this;
  }
  response(payload: PayloadMessage | PayloadMessageReply): Conversation | boolean {
    //Skip if no question asked
    if (!this.isWaitingForAnswer()) {
      return false;
    }
    //Skip if payload type not match
    if (!this.listeningAnswerType.includes(payload.type)) {
      return false;
    }
    if (this.listeningAnswer && typeof this.listeningAnswer === 'function') {
      const listeningAnswer = this.listeningAnswer;
      this.stopWaitingForAnswer();
      listeningAnswer(payload, this /* new Chat(this.bot, payload) */);
      if (this.isWaitingForAnswer()) return this;
    }

    // End if not
    return this.end();
  }
  isWaitingForAnswer(): boolean {
    return this.waitingForAnswer;
  }
  stopWaitingForAnswer(): void {
    this.waitingForAnswer = false;
    this.listeningAnswer = null;
  }
  isActive(): boolean {
    return this.active;
  }
  get(property: string): any {
    return this.context[property];
  }
  set(property: string, value: any): void {
    this.context[property] = value;
  }
}
