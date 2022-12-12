import { isObject } from '@xcm-source-code/utils'

export const result = isObject({})

export { effect } from './effect'
export { reactive, shadowReactive, isReactive } from './reactive'
export { ref, isRef } from './ref'
