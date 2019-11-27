import {GridToImageX, GridToImageY, ImageXYToOffset} from "./coordinates"
import {RGBAToInt32} from "./rgba-to-int32"

export default function RenderGridLines({imageData, viewport, colors}) {
  if (viewport.scale < FADE_MIN) return
  let {width: imageWidth} = imageData
  let {top, bottom, left, scale} = viewport
  let data = new Int32Array(imageData.data.buffer)
  let color = Color(scale, colors) | 0
  let dead = RGBAToInt32(colors.dead) | 0
  imageWidth |= 0;
  top    = floor(top)    | 0
  bottom = ceil (bottom) | 0
  left   = ceil (left)   | 0
  scale = scale * (window.devicePixelRatio || 1)
  let leftImage = GridToImageX(left, viewport)
  let leftOffset = ImageXYToOffset(leftImage, 0, viewport)
  // For each (fully or partially) visible grid row...
  for (let row = top; row < bottom; row++) {
    // For each pixel in the topmost image line corresponding to the grid row,
    let topLineY = GridToImageY(row, viewport)
    let topLineOffset = ImageXYToOffset(0, topLineY | 0, imageData)
    let offsetLo = max(imageWidth , topLineOffset             )
    let offsetHi = min(data.length, topLineOffset + imageWidth)
    for (let offset = offsetLo; offset < offsetHi; offset++){
      if (data[offset] === dead && data[offset - imageWidth] === dead)
        data[offset] = color}
    // For all other image lines of the grid row...
    let linesOffsetLo = max(1                       , topLineOffset + imageWidth        )
    let linesOffsetHi = min(data.length - imageWidth, topLineOffset + imageWidth * scale)
    for (let lineOffset = linesOffsetLo; lineOffset < linesOffsetHi; lineOffset += imageWidth) {
      // For each cell in the row...
      let cellsOffsetLo = lineOffset + leftOffset
      let cellsOffsetHi = lineOffset + imageWidth
      let leftNeighborIsUncolored = true
      for (let offset = cellsOffsetLo; offset < cellsOffsetHi; offset += scale) {
        let nearest = offset | 0
        // Fill the cell's leftmost pixel if neither the cell nor its left neighbor are colored
        let cellIsUncolored = data[nearest] === dead
        if (leftNeighborIsUncolored && cellIsUncolored)
          data[nearest] = color
        leftNeighborIsUncolored = cellIsUncolored
      }
    }
  }
}

let FADE_MIN = 5
let FADE_EXPONENT = 0.15

function Color(scale, colors) {
  let {lines, dead} = colors
  let fade = pow(FADE_MIN / scale, FADE_EXPONENT)
  let rgb = [...Array(3)].map((_, i) => (1 - fade) * lines[i] + fade * dead[i])
  return RGBAToInt32([...rgb, 255])
}

let {ceil, floor, max, min, pow} = Math