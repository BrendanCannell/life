import React from 'react'
import {useSelector, useDispatch, useStore} from 'react-redux'
import {setLife, toggleShowingDrawer, ViewerState, advanceOneFrame, fitToBounds, pan, setScale, speedDown, speedUp, stepOnce, toggleCell, toggleEditing, toggleRunning, toggleShowingSpeedControls, zoom} from './redux'
import {MdArrowDropDown, MdArrowDropUp} from 'react-icons/md'
import InteractiveViewer from "./components/InteractiveViewer"
import ViewerControls from "./components/ViewerControls"
import Patterns from "./patterns/index.js"
import FPS from "./components/FPS"
// import SinglePatterns from "./patterns/index.js"
// let Patterns = [].concat(SinglePatterns, SinglePatterns)

let colors = {
  alive: [0, 255, 0, 255],
  dead: [20, 20, 20, 255],
  controlsBackground:  '#424242',
  controlsForeground: 'white',
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
    , drawerButtonHeight = '2em'
    , viewerHeight = `calc(100% - ${drawerButtonHeight})`
    , openDrawerHeight = viewerHeight
  return (
    <div style={{position: 'relative', height: '100%', width: '100%', backgroundColor: colors.background}}>
      {fps}
      <div style={{height: viewerHeight}}>
        <InteractiveViewer
          colors={colors}
          getState={() => ViewerState(store.getState())}
          {...viewerActionDispatchers}
          dragContainer={window}
        />
        <Controls />
      </div>
      <ul className="pattern-list" style={patternListStyle()}>{
        Patterns.map(PatternButton)
      }</ul>
      <div className="pattern-dropup-button" style={patternDropupStyle()} >
        <DrawerArrow
          size={drawerButtonHeight}
          color={colors.controlsForeground}
          onClick={() => dispatch(toggleShowingDrawer())}
        />
      </div>
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
            colors={colors}
            mutators={viewerActionDispatchers}
          />
        </div>
      </div>
    )
  }

  function PatternButton(pattern, index) {
    return (
      <li
        onClick={onClick}
        key={index}
        style={patternButtonStyle()}
      >
        {pattern.name.toUpperCase()}
      </li>
    )
  
    function onClick() {
      dispatch(setLife(pattern.locations));
      dispatch(toggleShowingDrawer())
    }
  }
  
  function patternListStyle() {
    let height = showingDrawer ? openDrawerHeight : 0
    return {
      width: '100%',
      position: 'relative',
      height,
      bottom: height,
      background: colors.controlsBackground,
      transition: 'height 0.5s, bottom 0.5s',
      overflowY: 'scroll',
    }
  }

  function patternDropupStyle() {
    return {
      width: '100%',
      height: drawerButtonHeight,
      position: 'absolute',
      bottom: '0px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: colors.controlsBackground
    }
  }
    
  function patternButtonStyle() {
    return {
      margin: '0.3em',
      padding: '0.3em',
      fontSize: '2em',
      fontFamily: 'Roboto, Arial, sans-serif',
      textAlign: 'center',
      cursor: 'default',
      color: colors.controlsBackground,
      backgroundColor: colors.controlsForeground
    }
  }
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