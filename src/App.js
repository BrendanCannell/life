import React from 'react'
import InteractiveViewer from "./components/InteractiveViewer"
import Life from 'lowlife'
import * as P from "./patterns"
import FPS from "./components/FPS"
import './App.css'

let initialLivingLocations = P.period52gun
  , xs = initialLivingLocations.map(([x, y]) => x)
  , ys = initialLivingLocations.map(([x, y]) => y)
  , minX = Math.min(...xs)
  , maxX = Math.max(...xs)
  , sizeX = maxX - minX
  , scaleX = window.innerHeight / sizeX
  , minY = Math.min(...ys)
  , maxY = Math.max(...ys)
  , sizeY = maxY - minY
  , scaleY = window.innerHeight / sizeY
  , scale = Math.min(scaleX, scaleY) * 0.5
  , center = {x: (maxX + minX) / 2, y: (maxY + minY) / 2}

function App() {
  return (
    <div
      style={{display: 'flex', alignItems: 'stretch', position: 'fixed', overflow: 'hidden', height: '100%', width: '100%'}}
    >
      {fps}
      <InteractiveViewer
        initialState={{
          life: Life(initialLivingLocations),
          center,
          scale,
          stepsPerFrame: 1,
          translationPerStep: {x: 0, y: 0},
          running: false
        }}
      />
    </div>
  );
}

let fps =
  <div style={{
    position: 'fixed',
    zIndex: 1,
    color: 'black',
    textShadow: contrastShadow(0.05, 'white')
  }}>
    <FPS />
  </div>

function contrastShadow(size, color) {
  let strs = []
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      strs.push(`${i * size}em ${j * size}em ${color}`)
  return strs.join(",")
}

export default App;