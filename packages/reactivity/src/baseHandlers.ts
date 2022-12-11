import { isObject } from '@xcm-source-code/utils'
import { track, trigger } from './effect'
import { reactive } from './reactive'

export const baseHandlers = {
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
