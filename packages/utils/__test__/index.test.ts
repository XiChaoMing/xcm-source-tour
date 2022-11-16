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
})
