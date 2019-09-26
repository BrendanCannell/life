import React, {forwardRef} from 'react'

// A canvas with fixed dimensions and a `onFrame` function that will be called on each animation frame with the canvas's imageData and the frame's timestamp
export default forwardRef(function AnimatedCanvas(props, ref) {
  let {onFrame, ...canvasProps} = props
    , dpr = window.devicePixelRatio || 1
    , pendingRequest = null
  return <canvas ref={withCanvas} {...canvasProps} ></canvas>

  function withCanvas(canvas) {
    if (ref) {
      if (typeof ref === 'function')
        ref(canvas)
      else
        ref.current = canvas
    }
    if (!canvas) { cancelRequest(); return }
    let context = canvas.getContext('2d')
      , imageData = null
      , currentLogicalWidth = null
      , currentLogicalHeight = null
    makeRequest()

    function makeRequest() {
      pendingRequest = window.requestAnimationFrame(animate)
    }
    function cancelRequest() {
      pendingRequest && window.cancelAnimationFrame(pendingRequest)
    }
    function animate(timestamp) {
      makeRequest(animate)
      let rect = canvas.getBoundingClientRect()
      if (currentLogicalWidth !== rect.width || currentLogicalHeight !== rect.height) {
        currentLogicalWidth  = rect.width
        currentLogicalHeight = rect.height
        let pixelWidth  = currentLogicalWidth  * dpr
          , pixelHeight = currentLogicalHeight * dpr
        canvas.width  = pixelWidth
        canvas.height = pixelHeight
        imageData =
          pixelWidth !== 0 && pixelHeight !== 0
            ? context.createImageData(pixelWidth, pixelHeight)
            : null
      }
      onFrame({
        canvas,
        context,
        imageData,
        timestamp
      })
    }
  }
})