import { isObject, toRawType } from '@xcm-source-code/utils'
import { track, trigger } from './effect'

const ADD_PROTOTYPE_KEY = Symbol('collection_add')
const DELETE_PROTOTYPE_KEY = Symbol('collection_delete')
const HAS_PROTOTYPE_KEY = Symbol('collection_has')

enum TargetType {
  INVALID = 0,
  COMMON = 1,
  COLLECTION = 2,
}

function getTargetType(type: string) {
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

const baseHandlers: ProxyHandler<object> = {
  get(target, propertyKey, receiver) {
    const val = Reflect.get(target, propertyKey, receiver)
    track(target, 'get', propertyKey)
    return isObject(val) ? reactive(val) : val
  },
  set(target, propertyKey, val, receiver) {
    const afterVal = Reflect.set(target, propertyKey, val, receiver)
    trigger(target, 'set', propertyKey)
    return afterVal
  },
  deleteProperty(target, propertyKey) {
    Reflect.deleteProperty(target, propertyKey)
    trigger(target, 'delete', propertyKey)
    return true
  },
}

const collectionHandlers: ProxyHandler<object> = {
  get(target, propertyKey, receiver) {
    if (propertyKey === 'size') {
      track(target, 'collection-size', propertyKey)
      return Reflect.get(target, propertyKey)
    }
    if (propertyKey === 'add') {
      return (addValue: unknown) => {
        // 调用原来 target 对象的 add 方法
        const result = target.add(addValue)
        track(target, 'collection-add', ADD_PROTOTYPE_KEY)
        trigger(target, 'collection-add', ADD_PROTOTYPE_KEY)
        return result
      }
    }
    if (propertyKey === 'delete') {
      return (deleteValue) => {
        const result = target.delete(deleteValue)
        track(target, 'collection-delete', DELETE_PROTOTYPE_KEY)
        trigger(target, 'collection-delete', DELETE_PROTOTYPE_KEY)
        return result
      }
    }
    if (propertyKey === 'has') {
      return (hasValue) => {
        const result = target.has(hasValue)
        track(target, 'collection-has', HAS_PROTOTYPE_KEY)
        trigger(target, 'collection-has', HAS_PROTOTYPE_KEY)
        return result
      }
    }
  },
}

export function reactive(obj: unknown) {
  const handlers = getTargetType(toRawType(obj)) === TargetType.COMMON ? baseHandlers : collectionHandlers
  return new Proxy(obj, handlers)
}
