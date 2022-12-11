import { toRawType } from '@xcm-source-code/utils'
import { baseHandlers } from './baseHandlers'
import { collectionHandlers } from './collectionHandlers'

const enum TargetType {
  INVALID = 0,
  COMMON = 1, // 普通对象
  COLLECTION = 2, // set, map, weakmap
}

export const COL_KEY = Symbol('collection')

export const ReactiveFlags = {
  RAW: '__reactive_raw',
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

export function reactive(obj: any) {
  const handlers = targetTypeMap(toRawType(obj)) === TargetType.COMMON ? baseHandlers : collectionHandlers
  return new Proxy(obj, handlers)
}
