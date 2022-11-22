import { isObject, toRawType } from '@xcm-source-code/utils'
import { track, trigger } from './effect'

export const COL_KEY = Symbol('collection')

const enum TargetType {
  INVALID = 0,
  COMMON = 1, // 普通对象
  COLLECTION = 2, // set, map, weakmap
}

function targetTypeMap(type: string) {
  switch (type) {
    case 'Object':
    case 'Array':
      return TargetType.COMMON
    case 'Map':
    case 'Set':
    case 'WeakMap':
    case 'WeakSet':
      return TargetType.COLLECTION
    default:
      return TargetType.INVALID
  }
}

const baseHandlers = {
  get(target, key, receiver) {
    const returnVal = Reflect.get(target, key, receiver)
    // 收集依赖关系
    track(target, 'get', key)
    return isObject(returnVal) ? reactive(returnVal) : returnVal
  },
  set(target, key, val, receiver) {
    // 修改数据，执行副作用函数
    const ret = Reflect.set(target, key, val, receiver)
    trigger(target, 'set', key)
    return ret
  },
  deleteProperty(target, key) {
    Reflect.deleteProperty(target, key)
    trigger(target, 'delete', key)
    return true
  },
}

const collectionActions = {
  add(key) {
    const target = this['__reactive_raw']
    const ret = target.add(key)
    trigger(target, 'collection-add', key)
    return ret
  },
  delete() {},
  has() {},
}

const collectionHandlers = {
  get(target, key) {
    if (key === '__reactive_raw') {
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

export function reactive(obj: any) {
  const handlers = targetTypeMap(toRawType(obj)) === TargetType.COMMON ? baseHandlers : collectionHandlers
  return new Proxy(obj, handlers)
}
