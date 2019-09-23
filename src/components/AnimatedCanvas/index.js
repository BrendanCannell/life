import React from 'react'

// A canvas with fixed dimensions and a `onFrame` function that will be called on each animation frame with the canvas's imageData and the frame's timestamp
export default function AnimatedCanvas(props) {
  let {onFrame} = props
    , dpr = window.devicePixelRatio || 1
    , pendingRequest = null
  return (
    <div style={{width: '100%', height: '100%'}}>
      <canvas ref={withCanvas} ></canvas>
    </div>
  )

  function withCanvas(canvas) {
    if (!canvas) {
      cancelRequest()
      return
    }
    let context = canvas.getContext('2d')
      , imageData = null
      , currentLogicalWidth = null
      , currentLogicalHeight = null
    makeRequest()
    return

    function makeRequest() {
      pendingRequest = window.requestAnimationFrame(animate)
    }
    function cancelRequest() {
      pendingRequest && window.cancelAnimationFrame(pendingRequest)
    }
    function animate(timestamp) {
      makeRequest(animate)
      let rect = canvas.parentElement.getBoundingClientRect()
      if (currentLogicalWidth !== rect.width || currentLogicalHeight !== rect.height) {
      // if (currentLogicalWidth === null) {
        currentLogicalWidth  = rect.width
        currentLogicalHeight = rect.height
        let pixelWidth  = currentLogicalWidth  * dpr
          , pixelHeight = currentLogicalHeight * dpr
        canvas.width  = pixelWidth
        canvas.height = pixelHeight
        canvas.style.width  = currentLogicalWidth + 'px'
        canvas.style.height = currentLogicalHeight + 'px'
        context = canvas.getContext('2d')
        imageData = context.createImageData(pixelWidth, pixelHeight)
      }
      onFrame({
        imageData,
        timestamp,
        height: currentLogicalHeight,
        width:  currentLogicalWidth
      })
      context.putImageData(imageData, 0, 0)
    }
  }
}