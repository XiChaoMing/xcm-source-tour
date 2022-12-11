import { describe, expect, it, vi } from 'vitest'
import { effect, reactive } from '../src'

describe('effect', () => {
  it('effect 嵌套', () => {
    const data = { foo: 2, bar: 3 }
    const obj = reactive(data)

    let temp1, temp2

    let fn1 = vi.fn(() => {})
    let fn2 = vi.fn(() => {})

    effect(() => {
      fn1()

      effect(() => {
        fn2()
        temp1 = obj.foo
      })

      temp2 = obj.bar
    })

    expect(fn1).toBeCalledTimes(1)
    expect(fn2).toBeCalledTimes(1)
    expect(temp1).toBe(2)
    expect(temp2).toBe(3)

    // obj.bar = 10

    // expect(fn1).toBeCalledTimes(2)
    // expect(fn2).toBeCalledTimes(2)
    // expect(temp1).toBe(2)
    // expect(temp2).toBe(10)

    // obj.foo = 30

    // expect(fn1).toBeCalledTimes(2)
    // expect(fn2).toBeCalledTimes(4)
    // expect(temp1).toBe(30)
    // expect(temp2).toBe(10)
  })
})
