import {GridToImageX, GridToImageY} from "./coordinates"

export default function RenderEdits({colors, context: ctx, edits, viewport}) {
  let edited = `rgba(${colors.toggledOn.join()})`
  let background = `rgba(${colors.dead.join()})`
  ctx.save()
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (var [[xGrid, yGrid], alive] of edits) {
    let xImageLo = GridToImageX(xGrid,     viewport) | 0
    let xImageHi = GridToImageX(xGrid + 1, viewport) | 0
    let yImageLo = GridToImageY(yGrid,     viewport) | 0
    let yImageHi = GridToImageY(yGrid + 1, viewport) | 0
    let width  = xImageHi - xImageLo
    let height = yImageHi - yImageLo
    let b = 2
    ctx.fillStyle = edited
    ctx.fillRect(xImageLo - b/2, yImageLo - b/2, width + b, height + b)
    if (!alive) {
      ctx.fillStyle = background
      ctx.fillRect(xImageLo + b/2, yImageLo + b/2, width - b, height - b)
    }
  }
  ctx.restore()
}