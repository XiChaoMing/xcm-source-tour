// type TokenType = 'props' | 'tagstart' | 'tagend' | 'text' | ''

/**
 * 切开字符串
 */
function tokenizer(input) {
  const tokens = []

  // 标记类型，是标签开始，结束，还是空格等
  let type = ''
  let val = ''

  // 收集 tokens
  function push() {
    if (val) {
      // 标签开始，删除 <
      if (type === 'tagstart') val = val.slice(1)
      // 标签结束，删除 </
      if (type === 'tagend') val = val.slice(2)
      tokens.push({ type, val })
      val = ''
    }
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (ch === '<') {
      push()
      if (input[i + 1] === '/') {
        // 标签结束
        type = 'tagend'
      } else {
        // 标签开始
        type = 'tagstart'
      }
    } else if (ch === '>') {
      if (input[i - 1] === '=') {
        // TODO: 箭头函数
      } else {
        // 闭合标签的结束
        push()
        type = 'text'
        continue
      }
    } else if (/[\s]/.test(ch)) {
      // 遇见空格，收集一个 token
      push()
      type = 'props'
      continue
    }
    // 上述情况都不是
    val += ch
  }
  return tokens
}

/**
 * template -> ast
 */
function parse(template) {
  // 字符串挨个遍历，变成嵌套的对象
  const tokens = tokenizer(template)
  // console.log(tokens)

  let cur = 0
  // 遍历切开的内容，整理成嵌套的对象
  const ast = {
    type: 'root',
    props: {},
    children: [],
  }

  while (cur < tokens.length) ast.children.push(walk())

  function walk() {
    let token = tokens[cur]
    if (token.type === 'tagstart') {
      // tagstart 意味着新增一个子元素
      const node = {
        type: 'element',
        tag: token.val,
        props: [],
        children: [],
      }
      token = tokens[++cur]
      while (token.type !== 'tagend') {
        if (token.type === 'props') node.props.push(walk())
        else node.children.push(walk())

        token = tokens[cur]
      }
      cur++
      // 下一个节点
      return node
    } else if (token.type === 'tagend') {
      cur++
    } else if (token.type === 'text') {
      cur++
      return token
    } else if (token.type === 'props') {
      cur++
      const [key, val] = token.val.replace('=', '~').split('~')
      return { key, val }
    }
    cur++
  }

  return ast
}

// 静态标记
const PatchFlags = {
  TEXT: 1,
  CLASS: 1 << 1,
  STYLE: 1 << 2,
  PROPS: 1 << 3,
  EVENT: 1 << 4,
}

/**
 * 标记一些 vue 的语法，vue3 还多了一个静态标记
 */
function transform(ast) {
  const context = {
    // 收集当前模板依赖的函数，这样 generate 才能生成 import 语句
    helpers: new Set(['createElementVNode', 'createElementBlock']),
  }
  // 遍历 ast 这棵树，对 vue 识别的语法进行转换，对节点是否静态进行标记
  traverse(ast, context)
  // 挂载上下文
  ast.helpers = context.helpers
}

/**
 * 遍历 ast
 */
function traverse(ast, context) {
  // 提取 {{变量}} 的正则
  const reg = /\{\{(.*)\}\}/g
  switch (ast.type) {
    case 'root':
      context.helpers.add('openBlock')
      context.helpers.add('createElementBlock')
      ast.children.forEach((node) => {
        traverse(node, context)
      })
      break
    case 'element':
      ast.children.forEach((node) => {
        traverse(node, context)
      })
      ast.flag = 0
      ast.props = ast.props.map((prop) => {
        const { key, val } = prop
        if (key[0] === '@') {
          ast.flag |= PatchFlags.EVENT
          // 事件
          return {
            key: `on${key[1].toUpperCase()}${key.slice(2)}`,
            val,
          }
        } else if (key[0] === ':') {
          const k = key.slice(1)
          if (k === 'class') ast.flag |= PatchFlags.CLASS
          else if (k === 'style') ast.flag |= PatchFlags.STYLE
          else ast.flag |= PatchFlags.PROPS

          // 属性: class, style, 别的属性
          // 属性的操作函数不同，diff 的时候做不同的标记
          return {
            key: key.slice(1),
            val,
          }
        } else if (key.startsWith('v-')) {
          // v-model v-if
        }
        // 走到这里，所有的 vue 语法都没识别到，那这里就是静态的
        return { ...prop, static: true }
      })
      break
    case 'text':
      if (reg.test(ast.val)) {
        ast.flag |= PatchFlags.TEXT
        // 说明有变量
        context.helpers.add('toDisplayString')
        ast.val = ast.val.replace(reg, (s0, s1) => {
          return s1
        })
      } else {
        // 普通文本
        ast.static = true
      }
  }
}

/**
 * ast 经过 transform 后，去生成 render 函数
 */
function generate(ast) {
  const code = `
    import { ${[...ast.helpers].map((v) => `${v} as _${v}`).join(', ')} } from 'vue'

    export function render(_ctx, _cache, $props, $setup, $data, $options) {
      return (_openBlock(), ${ast.children.map((node) => traverseNode(node))})
    }
  `
  return code
  function traverseNode(node) {
    switch (node.type) {
      case 'element':
        let { flag } = ast
        let props = node.props
          .reduce((ret, p) => {
            if (flag & PatchFlags.PROPS) {
              ret.push(p.key + ':ctx.' + p.val)
            } else {
              ret.push(p.key + ':' + p.val)
            }
            return ret
          }, [])
          .join(',')
        return `_createElementVNode("${node.tag}", {${props}}, [
          ${node.children.map((n) => traverseNode(n))}
        ]${node.flag ? `,${node.flag}` : ''})`
      case 'text':
        if (node.static) {
          return `'${node.val}'`
        } else {
          return `_toDisplayString(_ctx.${node.val})`
        }
    }
  }
}

function compile(template) {
  // 模板解析成 render 函数

  const ast = parse(template.trim())
  // console.log('ast transform before:', JSON.stringify(ast, null, 2))
  transform(ast)
  // console.log('ast transform after:', JSON.stringify(ast, null, 2))
  return generate(ast)
}

const template = `
  <div id="app">
    <div @click="()=>{console.log('h1')}" :id="name">{{name}}</div>
    <h1 :name="title">Vue编译</h1>
    <p class="container">编译原理学习</p>
  </div>
`

const renderCode = compile(template)
console.log(renderCode)

/**
 * 上面的模板需要编译为下面的内容
 * https://vue-next-template-explorer.netlify.app/#eyJzcmMiOiI8ZGl2IGlkPVwiYXBwXCI+XG4gICAgPGRpdiBAY2xpY2s9XCIoKSA9PiB7Y29uc29sZS5sb2coJ2gxJyl9XCIgOmlkPVwibmFtZVwiPnt7bmFtZX19PC9kaXY+XG4gICAgPGgxIDpuYW1lPVwidGl0bGVcIj5WdWXnvJbor5E8L2gxPlxuICAgIDxwIGNsYXNzPVwiY29udGFpbmVyXCI+57yW6K+R5Y6f55CG5a2m5LmgPC9wPlxuICA8L2Rpdj5cbiAgIiwib3B0aW9ucyI6eyJvcHRpbWl6ZUltcG9ydHMiOmZhbHNlfX0=
 */
// const result = `
// import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

// export function render(_ctx, _cache, $props, $setup, $data, $options) {
//   return (_openBlock(), _createElementBlock("div", { id: "app" }, [
//     _createElementVNode("div", {
//       onClick: () => {_ctx.console.log('h1')},
//       id: _ctx.name
//     }, _toDisplayString(_ctx.name), 9 /* TEXT, PROPS */, ["onClick", "id"]),
//     _createElementVNode("h1", { name: _ctx.title }, "Vue编译", 8 /* PROPS */, ["name"]),
//     _createElementVNode("p", { class: "container" }, "编译原理学习")
//   ]))
// }
// `
