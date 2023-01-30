import { createAppAPI } from './apiCreateApp'
import { isSameType } from './vnode'

export function createRenderer() {
  /**
   * 更新逻辑
   * @param n1 上一次渲染的 vnode
   * @param n2 这次渲染的 vnode
   * @param container
   */
  function patch(n1, n2, container) {
    // 两次 vnode 一样，啥都不用做
    if (n1 === n2) return

    // 节点类型一样，执行自身更新
    if (n1 && isSameType(n1, n2)) {
    }

    // type 是 vnode 类型，shapeFlag 是子节点类型
    const { type, shapeFlag } = n2

    // TODO: 到这里要执行渲染逻辑了，到底是 mount 还是 update
    switch(type) {
      case Text:
        // 处理文本
        break
      default:
        if (shapeFlag && ShapeFlags.ELEMENT) {
          // html 标签
          processElement(n1, n2, container)
        } else {
          // 组件
          processComponent(n1, n2, container) {}
        }
    }
  }

  function processElement(n1, n2, container) {}

  function processComponent(n1, n2, container) {}

  function unmount(vnode) {}

  // render 是执行 mount 时执行的代码
  function render(vnode, container) {
    const preVnode = container._vnode
    if (vnode == null) {
      if (preVnode) {
        // 卸载
        unmount(preVnode)
      }
    } else {
      // vnode 是一个对象，我们需要渲染
      patch(preVnode, vnode, container)
    }
    container._vnode = vnode
  }
  return {
    createApp: createAppAPI(render),
  }
}
