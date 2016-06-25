import imp from '../src/index';
const req = require('../src/index');
import Queue from '../src/queue';
// import Task from '../src/task';

describe('Entrypoint', () => {
  it('should able to handle ES6 modules', () => {
    (imp === Queue).should.equal(true);
  });
  it('should able to handle Common JS modules', () => {
    (req === Queue).should.equal(true);
  });
});
