import React, {useMemo} from 'react'
import {CSSTransition} from 'react-transition-group'
import Patterns from "../../patterns.json"
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

  function PatternButton(pattern) {
    let [name, filename] = pattern
    return (
      <li key={filename}>
        <button
          onClick={SetPattern}
          key={filename}
          style={patternButtonStyle}
        >
          {name}
        </button>
      </li>
    )

    async function SetPattern() {
      try {
        let utf8Decoder = new TextDecoder("utf-8");
        let res = await fetch("patterns/" + filename)
        let reader = res.body.getReader()
        var rle = ""
        while (true) {
          let {value, done} = await reader.read()
          rle += utf8Decoder.decode(value)
          if (done) break
        }
        rle = rle.replace(/\r?\n|\r/, '\n')
        m.setLife({rle})
      } catch (e) {console.log(e)}
    }
  }
}

export default Menu