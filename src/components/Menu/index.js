import React, {useMemo, useState} from 'react'
import {CSSTransition} from 'react-transition-group'
import _Patterns from "../../patterns.json"
import "./index.css"
import "../../styles/fill.css"

let Normalize = str => str.toLowerCase().replace(/[\W_]/g, '')

let Patterns = _Patterns.map(([name, filename]) => ({
  name,
  normalizedName: Normalize(name),
  filename,
}))

function Menu(props) {
  let {colors, mutators: m, showingDrawer} = props
  let [searchTerm, SetSearchTerm] = useState("")
  let menuColors = useMemo(() => ({backgroundColor: colors.controlsBackground}), [colors])
  let menuButtonColors = useMemo(() => ({
    color: colors.controlsBackground,
    backgroundColor: colors.controlsForeground
  }), [colors])

  return (
    <CSSTransition in={showingDrawer} timeout={200} classNames="menu-container">
      <div className="menu-container">
        <div
          className="empty-space"
          onClick={() => m.toggleShowingDrawer()}
        />
        <div className="menu" style={menuColors}>
          <input
            className="search"
            type="text"
            onChange={e => SetSearchTerm(e.target.value)}
            value={searchTerm}
            placeholder="Search..."
          />
          <ul >{
            Patterns
            .filter(p => p.normalizedName.includes(Normalize(searchTerm)))
            .map(PatternButton)
          }</ul>
        </div>
      </div>
    </CSSTransition>
  )

  function PatternButton(pattern) {
    let {name, filename} = pattern
    return (
      <li key={filename}>
        <button
          onClick={SetPattern}
          key={filename}
          style={menuButtonColors}
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
        SetSearchTerm("")
      } catch (e) {console.log(e)}
    }
  }
}

export default Menu