let MIN_SCALE = 5
// let Shade = scale => Math.min(128, (scale - MIN_SCALE) * (128 / (2 * MIN_SCALE))) | 0
let Shade = scale => 128 * (1 - Math.pow(MIN_SCALE / scale, 2))

export default function RenderGridLines({imageData, viewport}) {
  if (viewport.scale < MIN_SCALE) return
  let shade = Shade(viewport.scale)
  for (let x = Math.ceil(viewport.left); x < viewport.right; x++) {
    let imageX = GridToImageX(x, viewport)
    let offsetLo = ImageXYToOffset(imageX,                0, imageData)
    let offsetHi = ImageXYToOffset(imageX, imageData.height, imageData)
    for (let offset = offsetLo; offset < offsetHi; offset += imageData.width * 4) {
      imageData.data[offset    ] = shade
      imageData.data[offset + 1] = shade
      imageData.data[offset + 2] = shade
      imageData.data[offset + 3] = shade
    }
  }
  for (let y = Math.ceil(viewport.top); y < viewport.bottom; y++) {
    let imageY = GridToImageY(y, viewport)
    let offsetLo = ImageXYToOffset(0,               imageY, imageData)
    let offsetHi = ImageXYToOffset(imageData.width, imageY, imageData)
    for (let offset = offsetLo; offset < offsetHi; offset++) {
      imageData.data[offset] = shade
    }
  }
}

function ImageXYToOffset(x, y, imageData) {
  return (x + y * imageData.width) * 4
}

function GridToImageX(x, viewport) {
  return (x - viewport.left) * viewport.scale * (window.devicePixelRatio || 1) | 0
}

function GridToImageY(y, viewport) {
  return (y - viewport.top ) * viewport.scale * (window.devicePixelRatio || 1) | 0
}