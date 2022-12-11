import { isObject } from '@xcm-source-code/utils'
import { track, trigger } from './effect'
import { reactive } from './reactive'

const REF_KEY = 'ref-value'

class RefClass {
  _val: unknown

  constructor(value: unknown) {
    this._val = isObject(value) ? reactive(value) : value
  }

  get value() {
    track(this, 'ref-get', REF_KEY)
    return this._val
  }

  set value(newValue: unknown) {
    if (newValue !== this._val) {
      this._val = newValue
      trigger(this, 'ref-set', REF_KEY)
    }
  }
}

export function ref(value: unknown) {
  return new RefClass(value)
}
