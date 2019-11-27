import {GridToImageCell} from "./coordinates"
import {} from "./rgba-to-int32"

export default function RenderEdits({colors, context, edits, viewport}) {
  for (var [location, state] of edits) {
    let color = state ? colors.toggledOn : colors.toggledOff
    context.fillStyle = `rgba(${color.join()})`
    let {topleft, bottomright} = GridToImageCell(location, viewport)
    let {x: xLo, y: yLo} = topleft
    let {x: xHi, y: yHi} = bottomright
    context.fillRect(xLo | 0, yLo | 0, ceil(xHi - xLo), ceil(yHi - yLo))
  }
}

let {ceil} = Math