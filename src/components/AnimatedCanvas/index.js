import React, {useEffect, forwardRef} from 'react'

// A canvas with fixed dimensions and a `onFrame` function that will be called on each animation frame with the canvas's imageData and the frame's timestamp
export default forwardRef(function AnimatedCanvas(props, ref) {
  let {onFrame} = props
    , dpr = window.devicePixelRatio || 1
    , pendingRequest = null
    , canvas = document.createElement('canvas')
    , context = canvas.getContext('2d')
    , imageData = null
    , currentLogicalWidth = null
    , currentLogicalHeight = null
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  
  return <div ref={withContainer} style={{height: '100%', width: '100%'}}></div>

  function withContainer(container) {
    if (ref) {
      if (typeof ref === 'function')
        ref(canvas)
      else
        ref.current = canvas
    }
    if (!container) { cancelRequest(); return }
    container.appendChild(canvas)
    makeRequest()
  }
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
})