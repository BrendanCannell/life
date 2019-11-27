import React, {useMemo, useCallback} from 'react'
import "../../styles/fill.css"

// A canvas with fixed dimensions and a `onFrame` function that will be called on each animation frame with the canvas's imageData and the frame's timestamp
export default function AnimatedCanvas(props) {
  let {onFrame} = props
    , pendingRequest = null
    , canvas = useMemo(() => console.log('create canvas') || document.createElement('canvas'), [])
    , context = useMemo(() => canvas.getContext('2d'), [canvas])
    , imageData = null
    , currentLogicalWidth = null
    , currentLogicalHeight = null
    , currentDevicePixelRatio = window.devicePixelRatio || 1
    , withContainer = useCallback(_withContainer, [])
    , makeRequest   = useCallback(_makeRequest, [])
    , cancelRequest = useCallback(_cancelRequest, [])
    , animate       = useCallback(_animate, [])
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  
  return <div ref={useCallback(withContainer, [])} className="fill"></div>

  function _withContainer(container) {
    if (!container) { cancelRequest(); return }
    container.appendChild(canvas)
    makeRequest()
  }
  function _makeRequest() {
    pendingRequest = window.requestAnimationFrame(animate)
  }
  function _cancelRequest() {
    pendingRequest && window.cancelAnimationFrame(pendingRequest)
  }
  function _animate(timestamp) {
    makeRequest(animate)
    let rect = canvas.getBoundingClientRect()
    if (
      currentLogicalWidth !== rect.width
      || currentLogicalHeight !== rect.height
      || currentDevicePixelRatio !== (window.devicePixelRatio || 1)
      ) {
      currentLogicalWidth  = rect.width
      currentLogicalHeight = rect.height
      currentDevicePixelRatio = window.devicePixelRatio || 1
      let pixelWidth  = currentLogicalWidth  * currentDevicePixelRatio
        , pixelHeight = currentLogicalHeight * currentDevicePixelRatio
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