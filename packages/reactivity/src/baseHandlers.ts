import { isObject } from '@xcm-source-code/utils'
import { track, trigger } from './effect'
import { reactive } from './reactive'

function createGetter(isShadow: boolean) {
  return function get(target, key, receiver) {
    const returnVal = Reflect.get(target, key, receiver)
    // 收集依赖关系
    track(target, 'get', key)
    if (isObject(returnVal)) {
      return isShadow ? returnVal : reactive(returnVal)
    }
    return returnVal
  }
}

function createSetter() {
  return function set(target, key, val, receiver) {
    // 修改数据，执行副作用函数
    const ret = Reflect.set(target, key, val, receiver)
    trigger(target, 'set', key)
    return ret
  }
}

function createDeleteProperty() {
  return function deleteProperty(target, key) {
    Reflect.deleteProperty(target, key)
    trigger(target, 'delete', key)
    return true
  }
}

export const baseHandlers = {
  get: createGetter(false),
  set: createSetter(),
  deleteProperty: createDeleteProperty(),
}

export const shadowReactiveHandlers = {
  get: createGetter(true),
  set: createSetter(),
  deleteProperty: createDeleteProperty(),
}
