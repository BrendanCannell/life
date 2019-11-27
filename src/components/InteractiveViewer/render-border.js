import {RGBAToInt32} from "./rgba-to-int32"

export default function RenderBorder({colors, imageData}) {
  let {height, width} = imageData
  let data = new Int32Array(imageData.data.buffer)
  let color = RGBAToInt32(colors.border)
  for (let x = 0; x < width; x++) {
    data[x] = color
    data[x + width] = color
    data[x + width * (height - 2)] = color
    data[x + width * (height - 1)] = color
  }
  for (let y = 0; y < height; y++) {
    data[y * width] = color
    data[y * width + 1] = color
    data[y * width + (width - 2)] = color
    data[y * width + (width - 1)] = color
  }
}