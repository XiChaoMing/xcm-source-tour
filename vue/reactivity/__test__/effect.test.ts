import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'

describe('effect', () => {
  it('effect 嵌套', () => {
    const data = { foo: 2, bar: 3 }
    const obj = reactive(data)

    let temp1, temp2
    // vi.fn 包裹之后，可以测试这个函数被执行了多少次
    let fn1 = vi.fn(() => {})
    let fn2 = vi.fn(() => {})

    effect(() => {
      fn1()
      effect(() => {
        fn2()
        temp2 = obj.foo
      })
      temp1 = obj.bar
    })

    expect(fn1).toBeCalledTimes(1)
    expect(fn2).toBeCalledTimes(1)
    expect(temp1).toBe(3)
    expect(temp2).toBe(2)

    obj.bar = 10
    expect(fn1).toBeCalledTimes(2)
    // expect(fn2).toBeCalledTimes(1) // TODO: 应该是 1
    // expect(temp1).toBe(10)
    // expect(temp2).toBe(2)

    // obj.foo = 20
    // expect(fn1).toBeCalledTimes(2)
    // expect(fn2).toBeCalledTimes(2) // TODO: 应该是 2
    // expect(temp1).toBe(10)
    // expect(temp2).toBe(20)
  })
})
