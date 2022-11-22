import { isObject } from '@xcm-source-code/utils'
import { track, trigger } from './effect'
import { reactive } from './reactive'

function convert(val: unknown) {
  return isObject(val) ? reactive(val) : val
}

class RefImplement {
  isRef: boolean
  _val: any

  constructor(val) {
    this.isRef = true
    this._val = convert(val)
  }

  get value() {
    track(this, 'ref-get', 'value')
    return this._val
  }

  set value(newVal: unknown) {
    if (newVal !== this._val) {
      this._val = newVal
      trigger(this, 'ref-set', 'value')
    }
  }
}

export function ref(val: any) {
  return new RefImplement(val)
}
