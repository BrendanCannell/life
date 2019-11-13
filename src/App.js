import React from 'react'
import {useSelector, useDispatch, useStore} from 'react-redux'
import {setLife, toggleShowingDrawer, ViewerState, advanceOneFrame, fitToBounds, pan, setScale, speedDown, speedUp, stepOnce, toggleCell, toggleEditing, toggleRunning, toggleShowingSpeedControls, zoom} from './redux'
import {MdArrowDropDown, MdArrowDropUp} from 'react-icons/md'
import InteractiveViewer from "./components/InteractiveViewer"
// import Patterns from "./patterns/index.js"
import FPS from "./components/FPS"
import SinglePatterns from "./patterns/index.js"
let Patterns = [].concat(SinglePatterns, SinglePatterns)

let colors = {
  alive: [0, 255, 0, 255],
  dead: [20, 20, 20, 255],
  controlsBackground: 'rgb(240,240,240)',
  controlsForeground: 'rgba(50,50,50,0.97)',
  controlsHighlight: 'red'
}
colors.background = `rgba(${colors.dead.join()})`

function App() {
  let dispatch = useDispatch()
    , showingDrawer = useSelector(st => st.showingDrawer)
    , store = useStore()
    , viewerActionCreators = {advanceOneFrame, fitToBounds, pan, setScale, speedDown, speedUp, stepOnce, toggleCell, toggleEditing, toggleRunning, toggleShowingDrawer, toggleShowingSpeedControls, zoom}
    , viewerActionDispatchers = mapObj(actionCreator => payload => dispatch(actionCreator(payload)), viewerActionCreators)
    , DrawerArrow = showingDrawer ? MdArrowDropDown : MdArrowDropUp
    , openDrawerHeight = '90%'
    , closedDrawerHeight = '2em'
  return (
    <div style={{position: 'relative', height: '100%', width: '100%', backgroundColor: colors.background}}>
      {fps}
      <div style={{height: `calc(100% - ${closedDrawerHeight})`}}>
        <InteractiveViewer
          colors={colors}
          getState={() => ViewerState(store.getState())}
          {...viewerActionDispatchers}
          dragContainer={window}
        />
      </div>
      <div
        style={{
          width: '100%',
          height: showingDrawer ? openDrawerHeight : closedDrawerHeight,
          transition: 'height 0.25s linear 0s',
          position: 'absolute',
          bottom: '0px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: colors.controlsBackground
        }}
      >
        <DrawerArrow
          size={closedDrawerHeight}
          color={colors.controlsForeground}
          onClick={() => dispatch(toggleShowingDrawer())}  
        />
        <ul
          style={{
            width: '100%',
            height: showingDrawer ? '100%' : '0px',
            transition: 'height 0.25s linear 0s',
            overflowY: 'scroll',
          }}
        >{
          Patterns.map((pattern, index) => {
              return (
                <li
                  onClick={onClick}
                  key={index}
                  style={{
                    margin: '0.3em',
                    padding: '0.3em',
                    fontSize: '2em',
                    textAlign: 'center',
                    cursor: 'default',
                    color: colors.controlsBackground,
                    backgroundColor: colors.controlsForeground
                  }}
                >
                  {pattern.name.toUpperCase()}
                </li>
              )

              function onClick() {
                dispatch(setLife(pattern.locations));
                dispatch(toggleShowingDrawer())
              }
          })
        }</ul>
      </div>
    </div>
  );
}

let constrainChildren = {position: 'relative'}

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
  for (let key in obj) {
    mapped[key] = fn(obj[key], key, obj)
  }
  return mapped
}

export default App;