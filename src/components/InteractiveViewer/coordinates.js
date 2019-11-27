export function ImageXYToOffset(x, y, imageData) {
  return x + y * imageData.width
}
export function GridToImageX(x, viewport) {
  return (x - viewport.left) * viewport.scale * (window.devicePixelRatio || 1)
}
export function GridToImageY(y, viewport) {
  return (y - viewport.top ) * viewport.scale * (window.devicePixelRatio || 1)
}
export function GridToImageCell(location, viewport) {
  let [x, y] = location
  let topleft     = {x: GridToImageX(x    , viewport), y: GridToImageY(y    , viewport)}
  let bottomright = {x: GridToImageX(x + 1, viewport), y: GridToImageY(y + 1, viewport)}
  return {topleft, bottomright}
}