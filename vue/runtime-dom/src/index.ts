import { createRenderer } from '@xcm-source-code/runtime-core'

let renderer = null

function ensureRenderer() {
  if (!renderer) {
    renderer = createRenderer()
  }
  return renderer
}

export const createApp = (...args) => {
  return ensureRenderer().createApp(...args)
}
