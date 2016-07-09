import Task from './task';

export default class Queue {

  /**
   * Promise Queue class/ constructor.
   *
   * @param asyncNumber {integer} Number of concurrent task(s) running.
   * @param delay {integer} Delay of success in ms.
   * @param errDelay {integer} Error delay in ms. If let it undefined, the value will be the same as
    delay above.
   * @param loopDelay {integer} Delay in looping process. If let it undefined, the value will be the
    same as delay above.
   * @property {array} tasks - Array of tasks of current tasks list.
   */
  constructor(asyncNumber = 1, delay = 0, errDelay = undefined, loopDelay = undefined) {
    this.tasks = [];
    this.promises = [];
    this.errors = [];
    this.running = 0;
    this.done = 0;

    this.workerNumber = asyncNumber;
    this.delay = delay;
    this.errDelay = errDelay || delay;
    this.loopDelay = loopDelay || delay;
    this.paused = false;
  }

  /**
   * Clear current counted done and error results.
   *
   * @param force {boolean} Force to delete tasks also.
   If set to true, all queued tasks will be vanished.
   * @param forceGc {boolean} Force doing gc (garbace collection) at the end of clear.
   This gc is safe to used even without `--expose-gc` option is set, but will do nothing.
   */
  clear(force = false, forceGc = false) {
    if (force === true) this.tasks = [];
    this.promises = [];
    this.errors = [];
    this.running = 0;
    this.done = 0;
    if (typeof global.gc === 'function' && forceGc === true) global.gc();
  }

  addRunning(number) {
    this.running += number;
  }

  removeRunning(number) {
    this.running -= number;
    this.done += number;
  }

  process() {
    const q = this;

    // TODO: is this a bug? Or there is something that can make tasks become undefined?
    if (!q.tasks) q.tasks = [];

    // stop when tasks is empty
    if (q.tasks.length < 1) return;

    // check available worker
    if (q.running < q.workerNumber) {
      const start = 0;
      const runner = q.tasks.splice(start, start + q.workerNumber);

      runner.forEach(task => {
        const promise = task.run()
          .then(res => {
            q.removeRunning(1);

            return new Promise(resolve => setTimeout(resolve, q.delay, res));
          })
          .catch(err => {
            q.removeRunning(1);

            const error =
              err instanceof Error ? err : new Error('catch error but not an error instance');

            q.errors.push(error);
            return new Promise(resolve => setTimeout(resolve, q.errDelay, err));
          });

        q.promises.push(promise);

        Promise.all(q.promises)
          .then(() => {
            q.process();
          });
      });

      q.addRunning(runner.length);
    } else {
      setTimeout(q.process, q.loopDelay);
    }
  }

  /**
   * Push `task` to the tasks list.
   *
   * @param task(s) {(Task|Function)} Input must be (an array or single item)
   * a function that return a promise object or a task object.
   */
  push(tasks) {
    const concat = [].concat(tasks);

    concat.forEach(tsk => {
      let task;
      if (tsk instanceof Task) task = tsk;
      if (typeof tsk === 'function') task = new Task(tsk);

      // reject if task is not unique
      const exist = this.tasks.filter(t => t.identifier === task.identifier);

      if (exist.length === 0) this.tasks.push(task);
    });

    if (!this.paused) this.process();
  }

  /**
   * Pause current queue progress. After last running task(s) finished, do nothing.)
   */
  pause() {
    this.paused = true;
  }

  /**
   * Resume current queue progress. Immediately execute current task(s) on tasks list if any.
   */
  resume() {
    this.paused = false;
    this.process();
  }

  /**
   * Drain is wait until all tasks on the tasks list is finished,
   * then we can chain it like `Promise.all` behaviour.
   *
   * @param succeed {boolean} Get only succeed promises.
   * The return will be always succeed (then able)
   * but the errors will be printed out to `console.error`.
   * @param clear {boolean} Clear this object @see clear.
   * @returns {Promise} Promise object that will resolved with an array of succeeds results.
   */
  drain(succeed = false, clear = true, errCb) {
    const q = this;
    let promise;

    if (q.tasks < 1) {
      promise = Promise.all(q.promises)
        .then(res => {
          const errs = q.errors;

          if (clear === true) q.clear();

          return new Promise((resolve, reject) => {
            if (!succeed && errs.length > 0) return reject(errs[0]);

            let value;
            if (succeed) {
              if (typeof errCb === 'function') errCb(errs);
              value = res.filter(result => !(result instanceof Error));
            } else {
              value = res;
            }

            return resolve(value);
          });
        });
    } else {
      promise = new Promise(resolve => {
        setTimeout(() => {
          resolve(q.drain(succeed, clear, errCb));
        }, q.loopDelay);
      });
    }
    return promise;
  }

}
