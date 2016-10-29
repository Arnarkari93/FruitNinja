import PIXI from 'pixi.js';

export default class BaseContainer extends PIXI.Container {

  constructor(...args) {
    super(...args);
  }

  randomName() {
    return `${Math.random()}`;
  }

  add(name, child) {
    if(this[name] == undefined)
      this[name] = new Set();

    let uid = this.randomName();
    child.name = uid;
    this[name].add(uid);
    this.addChild(child);
  }

  get(name, uid=null) {
    if(this[name] == undefined || this[name].size == 0)
      return undefined;

    if(uid == null)
      return this.getChildByName(this[name].keys().next().value);
    return this.getChildByName(uid);

  }

  getAll(name) {
    if(this[name] == undefined)
      return [];

    let children = [];

    for(let e of this[name])
      children.push(this.getChildByName(e));

    return children;

  }

  remove(name, uid=null) {
    if(uid == null) {
      this.removeChild(this.get(name));
      delete this[name];
    }
    else {
      this.removeChild(this.get(name, uid));
      this[name].delete(uid);
    }
  }
}