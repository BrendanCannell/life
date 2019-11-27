import React, {useMemo} from 'react'
import {useSelector, useDispatch, useStore} from 'react-redux'
import {setLife, toggleShowingDrawer, ViewerState, advanceOneFrame, fitToBounds, initializeBounds, pan, setScale, speedDown, speedUp, stepOnce, toggleCell, togglePlaying, toggleShowingSpeedControls, updateCanvasContainer, zoom} from './redux'
import InteractiveViewer from "./components/InteractiveViewer"
import ViewerControls from "./components/ViewerControls"
import Menu from "./components/Menu"
import FPS from "./components/FPS"

let colors = {
  alive: [20, 255, 20, 255],
  dead: [20, 20, 20, 255],
  lines: [192, 192, 192, 255],
  toggledOff: [192, 20, 96, 255],
  toggledOn: [255, 192, 20, 255],
  border: [255, 20, 20, 255],
  controlsBackground:  '#424242',
  controlsForeground: 'white',
  controlsHighlight: 'red'
}
colors.background = `rgba(${colors.dead.join()})`
let viewerActionCreators = {advanceOneFrame, fitToBounds, initializeBounds, pan, setLife, setScale, speedDown, speedUp, stepOnce, toggleCell, togglePlaying, toggleShowingDrawer, toggleShowingSpeedControls, updateCanvasContainer, zoom}

function App() {
  let dispatch = useDispatch()
    , showingDrawer = useSelector(st => st.showingDrawer)
    , store = useStore()
    , mutators = useMemo(
        () => mapObj(actionCreator => payload => dispatch(actionCreator(payload)), viewerActionCreators),
        [dispatch]
      )
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.background}}>
      {fps}
      <InteractiveViewer
        dragContainer={window}
        getState={() => ViewerState(store.getState())}
        {...{colors, mutators}}
      />
      <Controls />
      <Menu {...{colors, mutators, showingDrawer}} />
    </div>
  );

  function Controls() {
    return (
      <div
        style={{
          position: 'absolute',
          width: '100%',
          bottom: '10%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{pointerEvents: 'auto'}}>
          <ViewerControls
            size="2em"
            {...{colors, mutators}}
          />
        </div>
      </div>
    )
  }
}

let fps =
  <div style={{
    position: 'fixed',
    right: 0,
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

function mapObj(fn, obj) {
  let mapped = {}
  for (var key in obj) {
    mapped[key] = fn(obj[key], key, obj)
  }
  return mapped
}

export default App;