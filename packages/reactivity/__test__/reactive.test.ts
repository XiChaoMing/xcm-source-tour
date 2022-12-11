import { describe, expect, it } from 'vitest'
import { reactive, effect, ref } from '../src'

describe('test reactive', () => {
  it('base', () => {
    let value: number
    // get a reactive object
    const obj = reactive({ count: 0 })

    // listen obj change
    effect(() => {
      value = obj.count
    })

    expect(value).toBe(0)

    obj.count++

    expect(value).toBe(1)
  })

  it('reactive 支持嵌套', () => {
    let value: unknown
    const obj = reactive({ id: 1, info: { username: 'xcm' } })

    effect(() => {
      value = obj.info.username
    })

    expect(value).toBe('xcm')

    obj.info.username = 'xiaoming'

    expect(value).toBe('xiaoming')
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
    let value1
    let value2
    let refObj = ref({ count: 1, user: { name: 'zhangsan', age: 30 } })

    effect(() => {
      value1 = refObj.value.count
      value2 = refObj.value.user.name
    })

    expect(value1).toBe(1)
    expect(value2).toBe('zhangsan')

    refObj.value.count++
    refObj.value.user.name = 'lisi'

    expect(value1).toBe(2)
    expect(value2).toBe('lisi')
  })

  it('删除属性的响应式', () => {
    let value
    let obj = reactive({ name: 'zhangsan', age: 30 })

    effect(() => {
      value = obj.name
    })

    expect(value).toBe('zhangsan')

    delete obj.name

    expect(value).toBeUndefined()
  })
})

describe('支持 set/map', () => {
  it('set', () => {
    let value
    let set = reactive(new Set([1]))

    effect(() => {
      value = set.size
    })

    expect(value).toBe(1)

    set.add(2)

    expect(value).toBe(2)
  })

  it('set delete', () => {
    let value
    let set = reactive(new Set([1, 2]))

    effect(() => {
      value = set.size
    })

    expect(value).toBe(2)

    set.delete(1)

    expect(value).toBe(1)

    set.delete(2)

    expect(value).toBe(0)
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
