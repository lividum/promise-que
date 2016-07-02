# promise-que
Promise based queue with rich API.

[![Build Status](https://travis-ci.org/lividum/promise-que.svg?branch=master)](https://travis-ci.org/lividum/promise-que)
[![Coverage Status](https://coveralls.io/repos/github/lividum/promise-que/badge.svg?branch=master)](https://coveralls.io/github/lividum/promise-que?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/npm/name/badge.svg)](https://snyk.io/test/npm/name)
[![bitHound Dependencies](https://www.bithound.io/github/lividum/promise-que/badges/dependencies.svg)](https://www.bithound.io/github/lividum/promise-que/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/lividum/promise-que/badges/devDependencies.svg)](https://www.bithound.io/github/lividum/promise-que/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/lividum/promise-que/badges/code.svg)](https://www.bithound.io/github/lividum/promise-que)

## Installation

```$ npm install promise-que --save```

## Example

```
import { Queue } from 'promise-que'
// or use require for CommonJS Module
// const Queue = require('promise-que').Queue;

// create queue object, for example use 1 worker and delay 1000 ms (1 second)
const queue = new Queue(1, 1000);

// define task
const task1 = () => Promise.resolve('task 1');
const task2 = () => Promise.resolve('task 2');

// push/ inject tasks to queue object
queue.push([task1, task2]);

// try to invoke `drain` one of promise-que API
queue.drain(ress => {
  console.log(ress[0] === 'task1');
  console.log(ress[1] === 'task2');
  // should print true twice.
});
```

## API and Documentation

[APIDoc Details](https://lividum.github.io/promise-que/docs/)

### Queue
Is class (constructor function) to create queue object which is represent number of worker (concurrent) and delay each succeed or failed tasks. If failed delay is not specified, succeed delay will be used.

Example:
```
const queue = new Queue(number_of_worker, succeed_delay, failed_delay);
```

### Task
Represent a function that return a Promise (**not a promise object it self**). Task can be pushed to queue object as a function it self or as a task object. The difference is, when we create task by creating task object, we can define it's identifier which means, in a single queue object, identifier must be unique, so if we define exactly same identifier when creating a task, it will ignored when current identifier is still available on current tasks list.

Example:
```
// use function that return a promise
const task1 = () => Promise.resolve('task 1');
queue.push(task1);

// by creating task object
import { Task } from 'promise-que';
const task2 = new Task(() => Promise.resolve('task 2'), 'id-task-2`);
queue.push(task2);
```

## License
[MIT](https://github.com/lividum/promise-que/blob/master/LICENSE)
