import Queue from './queue';
import Task from './task';

const def = Queue;

// for ES6 modules
export {def as default, Queue, Task};

// for CommonJS modules
module.exports = def;
