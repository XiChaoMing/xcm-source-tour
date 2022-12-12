import { describe, expect, it } from 'vitest'
import { effect, reactive, ref, shadowReactive, isReactive, isRef } from '../src'

describe('响应式', () => {
  it('reactive 基本功能', () => {
    let value
    // obj 是一个响应式对象
    const obj = reactive({ count: 1 })

    // obj.count 发生变化，会执行 effect 中的函数，实时赋值给 value
    effect(() => {
      value = obj.count
    })

    expect(value).toBe(1)

    obj.count++

    expect(value).toBe(2)
  })

  it('reactive 支持嵌套', () => {
    let value
    // obj 是一个响应式对象
    const obj = reactive({ id: 1, info: { usename: 'xiaoming' } })

    // obj.count 发生变化，会执行 effect 中的函数，实时赋值给 value
    effect(() => {
      value = obj.info.usename
    })

    expect(value).toBe('xiaoming')

    obj.info.usename = 'lisi'

    expect(value).toBe('lisi')
  })

  it('工具函数测试', () => {
    let val1 = ref(1)
    let val2 = reactive({ name: 'zhangsan' })
    let val3 = shadowReactive({ name: 'xiaoming' })
    expect(isRef(val1)).toBeTruthy()
    expect(isReactive(val2)).toBeTruthy()
    expect(isReactive(val3)).toBeTruthy()
  })

  it('ref 测试', () => {
    let value
    const num = ref(1)

    effect(() => {
      value = num.value
    })

    expect(value).toBe(1)

    num.value++
    expect(value).toBe(2)
  })

  it('ref 的复杂数据类型', () => {
    let value
    const obj = ref({ count: 1 })

    effect(() => {
      value = obj.value.count
    })

    expect(value).toBe(1)

    obj.value.count++
    expect(value).toBe(2)
  })

  it('删除属性的响应式', () => {
    let obj = reactive({ name: 'zhangsan', count: 1 })
    let val
    effect(() => {
      val = obj.name
    })
    expect(val).toBe('zhangsan')
    delete obj.name
    expect(val).toBeUndefined()
  })
})

describe('支持 set/map', () => {
  it('set', () => {
    let set = reactive(new Set([1]))
    let val
    effect(() => {
      val = set.size
    })
    expect(val).toBe(1)
    set.add(2)
    expect(val).toBe(2)
  })

  it('set 的删除', () => {
    let set = reactive(new Set([1, 2]))
    let val
    effect(() => {
      val = set.size
    })
    expect(val).toBe(2)
    set.delete(1)
    expect(val).toBe(1)
  })

  it('set 的 has 方法', () => {
    const set = reactive(new Set([1, 2]))

    expect(set.has(1)).toBeTruthy()
    expect(set.has(2)).toBeTruthy()
    set.delete(2)
    expect(set.has(1)).toBeTruthy()
    expect(set.has(2)).toBeFalsy()
  })
})

describe('浅层响应式', () => {
  it('shadowReactive 支持嵌套', () => {
    let value1, value2
    // obj 是一个响应式对象
    const obj = shadowReactive({ id: 1, info: { usename: 'xiaoming' } })

    // obj.count 发生变化，会执行 effect 中的函数，实时赋值给 value
    effect(() => {
      value1 = obj.info.usename
    })
    effect(() => {
      value2 = obj.id
    })

    expect(value1).toBe('xiaoming')
    expect(value2).toBe(1)

    obj.info.usename = 'lisi'
    obj.id++

    expect(value1).toBe('xiaoming')
    expect(value2).toBe(2)
  })
})
