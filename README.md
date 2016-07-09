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

### Create Queue Object

Create basic queue job.

```
import { Queue } from 'promise-que';
// or use require for CommonJS Module
// const Queue = require('promise-que').Queue;

// create queue object use default number of worker and default delay
const queue = new Queue();

// define task
const task1 = () => Promise.resolve('task 1');
const task2 = () => Promise.resolve('task 2');

// push/ inject tasks to queue object
queue.push([task1, task2]);

// or we can push it one by one
queue.push(task1);
queue.push(task2);
```

Set number of worker. Number of worker is representing how many maximum asynchronous task(s) will be executed at a time.

```
// create queue object with `4` number of worker (default is 1).
const queue = new Queue(4);
```

Set delay. There is 3 kind of delay.
1. `delay` is how long the next task is executed, and also become fallback of `error delay`.
2. `error delay`, is how long the next task is executed if previous task is return error.
3. `loop delay`, how long the queue object check for next task when there is still any task(s) running.

```
const queue = new Queue(
  // number of worker
  4,
  // delay
  100,
  // error delay
  500,
  // loop delay
  100
  );
```

### Task

Each function that return a Promise that pushed to queue object will be converted to `Task` object. Task it self have it's own behavior.

Only one task with same `identity` that will be processed and pushed to `tasks list`. So we can create better un-duplication task by giving pre-defined `identifier` for each of tasks.

```
import { Queue, Task } from 'promise-que';
// or use require for CommonJS Module
// const Queue = require('promise-que').Queue;
// const Task = require('promise-que').Task;

// create tasks with same identifier
const task1 = new Task(() => Promise.resolve('task 1'), 'sameid');
const task2 = new Task(() => Promise.resolve('task 2'), 'sameid');

// push/ inject tasks to queue object
queue.push([task1, task2]);
```

At above example, `task2` will not be processed, since it have same identifier with `task1`, and `task1` is pushed first.

### Drain

Get the result when all of the tasks is done. It's like `Promise.all` so if one or more tasks is failed, it will return an error.

```
queue
  .drain(ress => {
    console.log(ress[0] === 'task1');
    console.log(ress[1] === 'task2');
    // should print true twice.
  })
  // handle error
  .catch(err => console.error);
```

### Pause and Resume

Hold and resuming tasks process.

```
// define task
const task1 = () => Promise.resolve('task 1');
const task2 = () => Promise.resolve('task 2');

// pause queue
queue.pause();

// push/ inject tasks to queue object
queue.push([task1, task2]);

// at this moment no tasks will be executed, we can do something here.
console.log(queue.tasks.length);
// should be print `2`, since we pushed 2 tasks to queue object.

// we can resume the process anytime.
queue.resume();
// now queue object will processing all tasks.
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
