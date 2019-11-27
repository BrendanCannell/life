import React, {useMemo} from 'react'
import {CSSTransition} from 'react-transition-group'
import Patterns from "../../patterns/index.js"
import "./index.css"
import "../../styles/fill.css"

function Menu(props) {
  let {colors, mutators: m, showingDrawer} = props
  let patternListStyle = useMemo(() => ({backgroundColor: colors.controlsBackground}), [colors])
  let patternButtonStyle = useMemo(() => ({
    color: colors.controlsBackground,
    backgroundColor: colors.controlsForeground
  }), [colors])

  return (
    <CSSTransition in={showingDrawer} timeout={200} classNames="menu">
      <div className={'menu'}>
        <div
          className='fill'
          onClick={() => m.toggleShowingDrawer()}
        />
        <ul
          className='pattern-list'
          style={patternListStyle}
        >{
          Patterns.map(PatternButton)
        }</ul>
      </div>
    </CSSTransition>
  )

  function PatternButton(pattern, index) {
    return (
      <li key={index}>
        <button
          onClick={SetPattern}
          key={index}
          style={patternButtonStyle}
        >
          {pattern.name.toUpperCase()}
        </button>
      </li>
    )

    function SetPattern() {
      m.setLife(pattern.locations);
      m.toggleShowingDrawer()
    }
  }
}

export default Menu