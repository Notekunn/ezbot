const assert = require('assert');
('use strict');
const expect = require('chai').expect;
function replaceMessage(message, values) {
  if (!values) {
    return message;
  }
  return message.replace(/\{(\w+)\}/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return values[key];
    }
    return txt;
  });
}
describe('Text replace', () => {
  it('replace text', () => {
    expect(replaceMessage('{prefix}name', { prefix: '!' })).equal('!name');
    expect(replaceMessage('{prefix}{name}', { prefix: '!', name: 'linh' })).equal('!linh');
    expect(replaceMessage('{prefix}{hihi}', { prefix: '!', hehe: 'hihi' })).equal('!{hihi}');
  });
});
