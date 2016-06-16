export default class Task {

  constructor(func, identifier = Task.generateHash()) {
    this.func       = func;
    this.identifier = identifier;
  }

  run(){
    return this.func();
  }

  static generateHash(){
    return new Date().getTime() + ('0' + Math.round((Math.random() * 100))).slice(-2);
  }

}
