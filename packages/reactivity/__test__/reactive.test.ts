import { describe, expect, it } from 'vitest'
import { effect, reactive, ref } from '../src'

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
