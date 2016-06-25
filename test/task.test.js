import Queue from '../src/queue';
import Task from '../src/task';

describe('Task Module', () => {
  let generate;
  let startTime;

  beforeEach(() => {
    // helper for generate function that return Promise
    generate = (time, identifier) => {
      const func = () => new Promise(resolve => setTimeout(() => {
        // console.log(`Promise log: ${time} is done`);
        resolve(time);
      }, time * 100));

      return new Task(func, identifier);
    };
    // starting time
    startTime = new Date().getTime();
  });

  afterEach(() => {
    generate = null;
    startTime = null;
  });

  it('test generate hash result', () => {
    (Task.generateHash() === Task.generateHash()).should.not.equal(true);
  });

  it('should be able to push task instead of function', (done) => {
    const queue = new Queue(5, 100);

    queue.pause();

    queue.push([generate(1, 'a'), generate(3, 'b'), generate(2, 'c')]);

    queue.tasks.length.should.equal(3);
    queue.running.should.equal(0);
    queue.done.should.equal(0);

    queue.resume();

    queue.running.should.equal(3);
    queue.done.should.equal(0);

    Promise.all(queue.promises).then(res => {
      res[0].should.equal(1);
      res[1].should.equal(3);
      res[2].should.equal(2);
      queue.done.should.equal(3);

      queue.drain().then(res2 => {
        res2[0].should.equal(1);
        res2[1].should.equal(3);
        res2[2].should.equal(2);
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 3 concurrent async, higher (30) must be taken + 100 delay
        (endTime - startTime).should.be.greaterThan(130);
        done();
      });
    });
  });

  it('should be able to ditch duplicated task', (done) => {
    const queue = new Queue(1, 100);

    queue.pause();

    queue.push([generate(1, 'a'), generate(3, 'a'), generate(2, 'b')]);

    queue.tasks.length.should.equal(2);

    queue.resume();

    Promise.all(queue.promises).then(() => {
      queue.drain().then(() => {
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 1 concurrent async, higher (20) must be taken + 100 delay
        (endTime - startTime).should.be.greaterThan(120);
        done();
      });
    });
  });
});
