type ProxyType =
  | 'get'
  | 'set'
  | 'ref-set'
  | 'ref-get'
  | 'delete'
  | 'collection-size'
  | 'collection-add'
  | 'collection-delete'
  | 'collection-has'
type PropertyType = string | symbol

// 记录映射关系
const targetEffectMaps = new WeakMap()
// 临时记录调用 effect 传入的函数
let activeEffectFunc: Function
// activeEffectFunc 的调用栈
const activeEffectFuncStack = []

// get 方法中调用，手机依赖关系
export function track(target: unknown, type: ProxyType, propertyKey: PropertyType) {
  let targetEffect = targetEffectMaps.get(target)
  if (!targetEffect) {
    targetEffect = new Map()
    targetEffectMaps.set(target, targetEffect)
  }
  let effectFuncs = targetEffect.get(propertyKey)
  if (!effectFuncs) {
    effectFuncs = new Set()
    targetEffect.set(propertyKey, effectFuncs)
  }
  if (activeEffectFunc) effectFuncs.add(activeEffectFunc)
}

export function trigger(target: unknown, type: ProxyType, propertyKey: PropertyType) {
  // 取出 target 的 effect 映射数据
  const targetEffect = targetEffectMaps.get(target)
  if (!targetEffect) return

  const effectFuncs = targetEffect.get(propertyKey)
  if (effectFuncs) effectFuncs.forEach((func) => func())
}

export function effect(fn) {
  activeEffectFunc = fn
  // activeEffectFuncStack.push(fn)
  // fn() 执行的时候，如果内部调用了 reactive 对象的 get 方法，会进入 track 方法中
  fn()
  // activeEffectFuncStack.pop()
  // activeEffectFunc = activeEffectFuncStack[activeEffectFuncStack.length - 1]
}
