/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  /*添加一个观察者对象*/
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  /*移除一个观察者对象*/
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  /*依赖收集，当存在Dep.target的时候添加观察者对象*/
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  /*通知所有订阅者*/
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
/*依赖收集完需要将Dep.target设为null，防止后面重复添加依赖。*/
// 一个全局唯一的, 因为只能有一个watcher 依赖的对象的值 被计算, 在任何时间
Dep.target = null
const targetStack = []

/*将watcher观察者实例设置给Dep.target，用以依赖收集。同时将该实例存入target栈中*/
/*利用这个中间变量, 缓存已有的target, 在 pushTarget 函数, 使用传入的target 代替 Dep.target; 然后使用 Dep.target
   最后使用 popTarget 还原 ; 主要是为了Observe中的get方法, 判断当前是否有watcher(Dep.target),
   如果有就在dep增加这个属性的依赖, Dep.target.depend( dep1 )

   比如 methods 的每一个方法可以是 一个 watcher, 这个wactcher可能会依赖多个 data里面的属性 */
export function pushTarget (_target: ?Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}

/*将观察者实例从target栈中取出并设置给Dep.target*/
export function popTarget () {
  Dep.target = targetStack.pop()
}
