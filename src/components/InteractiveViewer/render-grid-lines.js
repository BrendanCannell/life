import {GridToImageX, GridToImageY} from "./coordinates"

export default function RenderGridLines({colors, context: ctx, viewport: v}) {
  ctx.save()
  // Clear canvas
  ctx.fillStyle = `rgba(${colors.dead.join()})`
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  // Abort if `scale` is too small for grid lines
  if (v.scale < MIN_SCALE) return ctx.restore()
  // Vertical grid lines
  ctx.fillStyle = GridLinesColor(v.scale, colors)
  for (let xGrid = ceil(v.left); xGrid < v.right; xGrid++) {
    let xImage = GridToImageX(xGrid, v) | 0
    ctx.fillRect(xImage, 0, 1, ctx.canvas.height)
  }
  // Horizontal grid lines
  for (let yGrid = ceil(v.top); yGrid < v.bottom; yGrid++) {
    let yImage = GridToImageY(yGrid, v) | 0
    ctx.fillRect(0, yImage, ctx.canvas.width, 1)
  }
  ctx.restore()
}

let MIN_SCALE = 5
let FADE_EXPONENT = 0.15

// Grid lines fade into the background color as `scale` decreases
function GridLinesColor(scale, colors) {
  let {lines, dead} = colors
  let fade = pow(MIN_SCALE / scale, FADE_EXPONENT)
  let [r, g, b] = [...Array(3)].map((_, i) => (1 - fade) * lines[i] + fade * dead[i])
  return `rgba(${r},${g},${b},255)`
}

let {ceil, pow} = Math