export default function RenderBorder({colors, context}) {
  let {width, height} = context.canvas
  context.fillStyle = `rgba(${colors.border.join()})`
  context.fillRect(0, 0, width, 2)
  context.fillRect(0, 0, 2, height)
  context.fillRect(0, height - 2, width, 2)
  context.fillRect(width - 2, 0, 2, height)
}