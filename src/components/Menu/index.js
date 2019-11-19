import React, {useMemo} from 'react'
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
    <div className={'fill' + (!showingDrawer ? ' hide' : '')}>
      <div
        className={'fill'}
        onClick={() => m.toggleShowingDrawer()}
      />
      <ul
        className={'pattern-list'}
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
}

export default Menu