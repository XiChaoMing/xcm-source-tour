export function isObject(val: unknown) {
  return typeof val === 'object' && val !== null
}

export function isOn(key: string) {
  return key[0] === 'o' && key[1] === 'n'
}

export function toRawType(value: any) {
  // [object Object] => Object
  return Object.prototype.toString.call(value).slice(8, -1)
}
