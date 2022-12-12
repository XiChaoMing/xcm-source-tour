import { toRawType } from '@xcm-source-code/utils'
import { baseHandlers, shadowReactiveHandlers } from './baseHandlers'
import { collectionHandlers } from './collectionHandlers'

const enum TargetType {
  INVALID = 0,
  COMMON = 1, // 普通对象
  COLLECTION = 2, // set, map, weakmap
}

export const COL_KEY = Symbol('collection')

export const ReactiveFlags = {
  RAW: '__reactive_raw',
  IS_REACTIVE: '__is_reactive',
}

export function isReactive(val: any) {
  return val[ReactiveFlags.IS_REACTIVE]
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

// 浅响应（对象内部的对象，不做响应式处理）
export function shadowReactive(obj: any) {
  const handlers = targetTypeMap(toRawType(obj)) === TargetType.COMMON ? shadowReactiveHandlers : collectionHandlers
  return new Proxy(obj, handlers)
}

export function reactive(obj: any) {
  const handlers = targetTypeMap(toRawType(obj)) === TargetType.COMMON ? baseHandlers : collectionHandlers
  return new Proxy(obj, handlers)
}
