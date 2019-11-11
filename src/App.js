import React from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {toggleShowingDrawer} from './redux'
import {MdArrowDropDown, MdArrowDropUp} from 'react-icons/md'
// import InteractiveViewer from "./components/InteractiveViewer"
// import Life from 'lowlife'
// import Patterns from "./patterns/index.js"
import FPS from "./components/FPS"

// let turingMachine = Patterns.find(p => p.name === "Turing machine").locations
//   , universalTuringMachine = Patterns.find(p => p.name === "Universal Turing machine").locations
// console.log(universalTuringMachine.length)

function App() {
  let dispatch = useDispatch()
    , showingDrawer = useSelector(st => st.showingDrawer)
    , DrawerArrow = showingDrawer ? MdArrowDropDown : MdArrowDropUp
  return (
    <div
      style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'blue'}}
    >
      {fps}
      {/* <InteractiveViewer
        initialState={{
          life: Life(initialLocations),
          center,
          scale,
          stepsPerFrame: 1,
          translationPerStep: {x: 0, y: 0},
          running: false
        }}
        dragContainer={window}
      /> */}
      <div style={{color: 'white', backgroundColor: 'rgb(50,50,50)'}}>
        <div style={{height: '2em', height: showingDrawer ? '200px' : '50px', width: '100%', display: 'flex', justifyContent: 'center'}}>
          <DrawerArrow size='2em' color='white' onClick={() => dispatch(toggleShowingDrawer())} />
        </div>
        {/* {Patterns.map(pattern => <p onClick={() => false || SetInitialLocations(pattern.locations)}>{pattern.name}</p>)} */}
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

export default App;