import Queue from '../src/queue';

describe('Queue Module', function() {

  let generate, generateError, startTime;

  before(function() {

    // helper for generate function that return Promise
    generate = (time) => () => new Promise(resolve => setTimeout(() => {
      // console.log(`Promise log: ${time} is done`);
      resolve(time);
    }, time * 10));

    generateError = (time) => () => new Promise((resolve, reject) => setTimeout(() => {
      // console.log(`Promise error log: ${time} is done`);
      reject(new Error(`error ${time}`));
    }, time * 10));

  });

  beforeEach(function() {

    // starting time
    startTime = new Date().getTime();

  });

  it('should be able to use pause, resume, and drain properly', function(done) {

    const queue = new Queue(5, 100);

    queue.pause();

    queue.push([generate(1), generate(3), generate(2)]);

    queue.tasks.length.should.equal(3);
    queue.running.should.equal(0);
    queue.done.should.equal(0);

    queue.resume();

    queue.running.should.equal(3);
    queue.done.should.equal(0);

    Promise.all(queue.promises)
      .then(res => {

        res[0].should.equal(1);
        res[1].should.equal(3);
        res[2].should.equal(2);
        queue.done.should.equal(3);

        queue.drain().then(res => {

            res[0].should.equal(1);
            res[1].should.equal(3);
            res[2].should.equal(2);
            queue.done.should.equal(0);

            const endTime = new Date().getTime();

            // run 3 concurrent async, higher (30) must be taken + 100 delay
            (endTime - startTime).should.be.greaterThan(130);
            done();
          })
          .catch(done);

      });

  });

  it('should be able to handle multiple drain calls', function(done) {

    const queue = new Queue(1, 100);

    queue.push([generate(1)]);

    queue.drain()
      .then(res => {

        res[0].should.equal(1);
        queue.done.should.equal(0);
        queue.promises.length.should.equal(0);

        queue.push([generate(1)]);

        return queue.drain();
      })
      .then(res => {

        res[0].should.equal(1);
        queue.done.should.equal(0);
        queue.promises.length.should.equal(0);

        done();
      })
      .catch(done);

  });

  it('should be able to handle multiple drain', function(done) {

    const queue = new Queue(1, 100);

    queue.drain()
      .then(res => {

        res.length.should.equal(0);
        queue.done.should.equal(0);

        done();
      })
      .catch(done);

  });

  it('should be able to push multiple tasks properly', function(done) {

    const queue = new Queue(5, 500);

    queue.push([generate(1), generate(3), generate(2)]);

    queue.push(generate(1));

    queue.push([generate(2)]);

    queue.drain()
      .then(res => {

        res[0].should.equal(1);
        res[1].should.equal(3);
        res[2].should.equal(2);
        res[3].should.equal(1);
        res[4].should.equal(2);
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 5 concurrent async, higher (30) must be taken + 500 delay
        (endTime - startTime).should.be.at.least(530);
        done();
      })
      .catch(done);

  });

  it('should be able to handle spammed tasks and still consistent with number of worker', function(done) {

    const queue = new Queue(3, 100);

    queue.push([generate(1), generate(1), generate(1), generate(1), generate(1), generate(1), generate(1), generate(1), generate(1), generate(1)]);

    queue.push(generate(1));

    queue.push([generate(2), generate(1), generate(1), generate(1), generate(1), generate(1)]);

    queue.drain()
      .then(res => {

        res[0].should.equal(1);
        res[1].should.equal(1);
        res[2].should.equal(1);

        res[3].should.equal(1);
        res[4].should.equal(1);
        res[5].should.equal(1);

        res[6].should.equal(1);
        res[7].should.equal(1);
        res[8].should.equal(1);

        res[9].should.equal(1);
        res[10].should.equal(1);
        res[11].should.equal(2);

        res[12].should.equal(1);
        res[13].should.equal(1);
        res[14].should.equal(1);

        res[15].should.equal(1);
        res[16].should.equal(1);

        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 3 concurrent async spammed by 17 tasks, 110 + 110 + 110 + 120 + 110 + 110 - 110 for expected overlap
        (endTime - startTime).should.be.at.least(550);
        done();
      })
      .catch(done);

  });

  it('should be able to run single concurrent task each time', function(done) {

    const queue = new Queue(1, 100);

    queue.push([generate(1), generate(2), generate(3)]);

    queue.drain()
      .then(res => {

        res[0].should.equal(1);
        res[1].should.equal(2);
        res[2].should.equal(3);
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 1 concurrent async, 10 + 20 + 30 + (3*100)
        (endTime - startTime).should.be.at.least(360);
        done();
      })
      .catch(done);

  });

  it('should be able to handle single rejected Promise', function(done) {

    const queue = new Queue(1, 100);

    queue.push([generate(1), generateError(2), generate(3)]);

    // use drain immediately regardless the result of succeed promises
    queue.drain()
      .then(() => done(new Error('should not pass here')))
      .catch(err => {

        err.message.should.equal('error 2');
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 1 concurrent async, 10 + 20 + 30 + (3*100)
        (endTime - startTime).should.be.at.least(360);
        done();
      });

  });

  it('should be able to handle multiple rejected Promise', function(done) {

    const queue = new Queue(1, 100);

    queue.push([generate(1), generateError(2), generateError(3), generate(1), generateError(1)]);

    // use drain immediately regardless the result of succeed promises
    queue.drain()
      .then(() => done(new Error('should not pass here')))
      .catch(err => {

        err.message.should.equal('error 2');
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 1 concurrent async, 10 + 20 + 30 + 10 + 10 + (5*100)
        (endTime - startTime).should.be.at.least(580);
        done();
      });

  });

  it('should be able to handle all rejected Promise', function(done) {

    const queue = new Queue(2, 100);

    queue.push([generateError(1), generateError(2), generateError(3), generateError(1), generateError(1)]);

    // use drain immediately regardless the result of succeed promises
    queue.drain()
      .then(() => done(new Error('should not pass here')))
      .catch(err => {

        err.message.should.equal('error 1');
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 1 concurrent async, 20 + 30 + 200
        (endTime - startTime).should.be.at.least(230);
        done();
      });

  });

  it('should be able to handle rejected Promise that thrown not an error function', function(done) {

    const queue = new Queue(2, 100);

    queue.push([generateError(1), generateError(2), generateError(3), generateError(1), generateError(1), () => Promise.reject('not error instance')]);

    // use drain immediately regardless the result of succeed promises
    queue.drain()
      .then(() => done(new Error('should not pass here')))
      .catch(err => {

        err.message.should.equal('error 1');
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 1 concurrent async, 20 + 10 + 200
        (endTime - startTime).should.be.at.least(230);
        done();
      });

  });

  it('should be able to get only all succeed Promise', function(done) {

    const queue = new Queue(3, 100);

    queue.push([generate(2), generateError(2), generate(1), generate(2), generateError(1)]);

    // use drain immediately regardless the result of succeed promises
    queue.drain(true)
      .then(res => {

        res[0].should.equal(2);
        res[1].should.equal(1);
        res[2].should.equal(2);
        queue.done.should.equal(0);

        const endTime = new Date().getTime();

        // run 1 concurrent async, 20 + 20 + 100)
        (endTime - startTime).should.be.at.least(120);
        done();
      })
      .catch(done);

  });

});
