import id from './identifier';

export default class Task {

  constructor(func, identifier = Task.randomHash()) {
    this.func = func;
    this.identifier = identifier;
  }

  run() {
    return this.func();
  }

  static randomHash() {
    return `default-and-simple-key-${id.increment()}`;
  }

}
