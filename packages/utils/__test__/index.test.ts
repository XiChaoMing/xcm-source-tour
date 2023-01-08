import { describe, it, expect } from 'vitest'
import { isObject, isOn } from '../src'

describe('测试工具库', () => {
  it('测试 isObject 函数', () => {
    expect(isObject({})).toBe(true)
    expect(isObject(1)).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isObject(undefined)).toBe(false)
    expect(isObject([])).toBe(true)
    expect(isObject('')).toBe(false)
  })

  it('测试 isOn 函数', () => {
    expect(isOn('onClick')).toBe(true)
    expect(isOn('handleClick')).toBe(false)
  })

  it('位运算科普', () => {
    // 010，在二进制中是 2
    // & | !
    // & 两个位置都是1，结果才是1，否则就是0
    // | 两个位置只要有一个是1，结果就是1，否则就是0
    // 性能高

    const role1 = 1 // 0001
    const role2 = 1 << 1 // 0010
    const role3 = 1 << 2 // 0100

    // 按位或 就是授权
    let action = role1 | role3 // 0101 代表拥有 role1 和 role3 的权限
    // action |= role3 // 在做一次授权，效果一样
    // 按位与，就校验权限
    expect(!!(action & role1)).toBe(true)
    expect(!!(action & role2)).toBe(false)
    expect(!!(action & role3)).toBe(true)

    // 权限的删除
    action &= ~role3 // 删除 role3 权限

    expect(!!(action & role1)).toBe(true)
    expect(!!(action & role2)).toBe(false)
    expect(!!(action & role3)).toBe(false)
  })
})
