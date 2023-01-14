import { track, trigger } from './effect'
import { COL_KEY, ReactiveFlags } from './reactive'

const collectionActions = {
  add(key) {
    const target = this[ReactiveFlags.RAW]
    const ret = target.add(key)
    trigger(target, 'collection-add', key)
    return ret
  },
  delete(key) {
    const target = this[ReactiveFlags.RAW]
    const ret = target.delete(key)
    trigger(target, 'collection-delete', key)
    return ret
  },
  has(key) {
    const target = this[ReactiveFlags.RAW]
    const ret = target.has(key)
    trigger(target, 'collection-has', key)
    return ret
  },
}

export const collectionHandlers = {
  get(target, key) {
    if (key === ReactiveFlags.RAW) {
      return target
    }
    if (key === 'size') {
      // size 属性的响应式监听
      track(target, 'collection-size', COL_KEY)
      return Reflect.get(target, key)
    }
    return collectionActions[key]
    // set.add
    // set.delete
    // set.has
  },
}
