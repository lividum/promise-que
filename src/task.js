export default class Task {

  constructor(func, identifier = Task.randomHash()) {
    this.func = func;
    this.identifier = identifier;
  }

  run() {
    return this.func();
  }

  static randomHash() {
    // reference for this method http://stackoverflow.com/a/2117523/2793961
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}
