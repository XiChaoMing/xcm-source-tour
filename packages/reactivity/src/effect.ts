import { COL_KEY } from './reactive'

/**
 * 存储依赖关系
 *   使用 weakmap 性能比 map 好
 *   数据结构: { 变量: { 属性1: [effect1, effect2] } }
 */
const targetMap = new WeakMap()

// 存储全局的副作用
let activeEffect
const effectStack = []

/**
 * 绑定副作用映射关系
 * @param obj
 * @param type 操作类型 get | set
 * @param key
 * @returns
 */
export function track(obj, type, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(obj)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(obj, depsMap)
  }
  let deps = depsMap.get(key)
  if (!deps) {
    // 可以去重
    deps = new Set()
    depsMap.set(key, deps)
  }
  // 将副作用函数放入
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

/**
 * 触发副作用函数执行
 * @param obj
 * @param type 操作类型 et | set
 * @param key
 * @returns
 */
export function trigger(obj, type, key) {
  const depsMap = targetMap.get(obj)
  if (!depsMap) return
  if (type === 'collection-add' || type === 'collection-delete') {
    key = COL_KEY
  }
  const deps = depsMap.get(key)
  if (deps) {
    const depsToRun = new Set(deps)
    depsToRun.forEach((effectFn) => effectFn())
  }
}

function cleanup(effectFn) {
  // effectFn 的依赖清理
  for (let i = 0; i < effectFn.deps.length; i++) {
    effectFn.deps[i].delete(effectFn)
  }
  effectFn.deps = []
}

export function effect(fn) {
  const effectFn = () => {
    let result
    try {
      activeEffect = effectFn
      effectStack.push(activeEffect)
      cleanup(effectFn)
      result = fn() // 会触发 Proxy 的 get 方法，执行 track，执行依赖收集的
    } finally {
      // 在这里执行 effect 清理
      // fn 内部还有 effect，activeEffect 指向就错误了
      effectStack.pop()
      // 恢复上一个嵌套的值
      activeEffect = effectStack[effectStack.length - 1]
    }
    return result
  }
  effectFn.deps = []
  effectFn()
  return effectFn
}
