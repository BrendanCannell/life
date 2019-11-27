import {GridToImageCell, ImageXYToOffset} from "./coordinates"
import {RGBAToInt32} from "./rgba-to-int32"

export default function RenderEdits({colors, edits, imageData, viewport}) {
  let data = new Int32Array(imageData.data.buffer)
  let toggledOff = RGBAToInt32(colors.toggledOff)
  let toggledOn = RGBAToInt32(colors.toggledOn)
  let {width, height} = imageData
  for (var [location, state] of edits) {
    let color = state ? toggledOn : toggledOff
    let {topleft, bottomright} = GridToImageCell(location, viewport)
    let {x: xLo, y: yLo} = topleft
    let {x: xHi, y: yHi} = bottomright
    xLo = max(xLo | 0, 0)
    xHi = min(xHi | 0, width)
    yLo = max(yLo | 0, 0)
    yHi = min(yHi | 0, height)
    for (let y = yLo; y < yHi; y++) {
      let offsetLo = ImageXYToOffset(xLo, y, imageData)
      let offsetHi = ImageXYToOffset(xHi, y, imageData)
      for (let offset = offsetLo; offset < offsetHi; offset++) {
        data[offset | 0] = color
      }
    }
  }
}

let {max, min} = Math