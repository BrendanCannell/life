import React, {useState, useEffect} from 'react'

export default function FPS() {
  let [fps, setFps] = useState(null)
  useEffect(() => {
    let pendingRequest = null
      , lastTimestamp = null
      , lastFpsTimestamp = -Infinity
    requestTimestamp()
    return () => window.cancelAnimationFrame(pendingRequest)

    function requestTimestamp() {
      pendingRequest = window.requestAnimationFrame(updateTimestamp)
    }
    function updateTimestamp(now) {
      requestTimestamp()
      if (lastTimestamp && (now - lastFpsTimestamp > 1000)) {
        let delta = now - lastTimestamp
        setFps(1000 / delta | 0)
        lastFpsTimestamp = now
      }
      lastTimestamp = now
    }
  })
  return <span style={fps ? {} : {visibility: "hidden"}}>{"" + fps}</span>
}