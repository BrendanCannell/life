import React, {useMemo} from 'react'
import Patterns from "../../patterns/index.js"

function Menu(props) {
  let {colors, mutators: m, showingDrawer} = props
  let patternListStyle = useMemo(PatternListStyle, [colors])
  let patternButtonStyle = useMemo(PatternButtonStyle, [colors])

  return (
    <div>
      <div
        className={!showingDrawer ? 'hide' : undefined}
        style={fillPositionedAncestor}
        onClick={() => m.toggleShowingDrawer()}
      />
      <ul
        className={'pattern-list' + (!showingDrawer ? ' hide' : '')}
        style={patternListStyle}
      >{
        Patterns.map(PatternButton)
      }</ul>
    </div>
  )

  function PatternButton(pattern, index) {
    return (
      <li
        onClick={SetPattern}
        key={index}
        style={patternButtonStyle}
      >
        {pattern.name.toUpperCase()}
      </li>
    )

    function SetPattern() {
      m.setLife(pattern.locations);
      m.toggleShowingDrawer()
    }
  }
  
  function PatternListStyle() {
    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      background: colors.controlsBackground,
      transition: 'width 0.5s',
      overflowY: 'scroll',
      overflowX: 'hidden'
    }
  }

  function PatternButtonStyle() {
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

let fillPositionedAncestor = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

export default Menu