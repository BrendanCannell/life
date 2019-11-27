import {GridToImageX, GridToImageY} from "./coordinates"

export default function RenderGridLines({colors, context: ctx, viewport}) {
  if (viewport.scale < FADE_MIN) return
  let {top, bottom, left, right, scale} = viewport
  let color = Color(scale, colors)
  ctx.save()
  ctx.fillStyle = `rgba(${colors.dead.join()})`
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.fillStyle = `rgba(${color.join()})`
  for (let xGrid = ceil(left); xGrid < right; xGrid++) {
    let xImage = GridToImageX(xGrid, viewport) | 0
    ctx.fillRect(xImage, 0, 1, ctx.canvas.height)
  }
  for (let yGrid = ceil(top); yGrid < bottom; yGrid++) {
    let yImage = GridToImageY(yGrid, viewport) | 0
    ctx.fillRect(0, yImage, ctx.canvas.width, 1)
  }
  ctx.restore()
}

let FADE_MIN = 5
let FADE_EXPONENT = 0.15

function Color(scale, colors) {
  let {lines, dead} = colors
  scale *= window.devicePixelRatio || 1
  let fade = pow(FADE_MIN / scale, FADE_EXPONENT)
  let rgb = [...Array(3)].map((_, i) => (1 - fade) * lines[i] + fade * dead[i])
  return [...rgb, 255]
}

let {ceil, pow} = Math