export let
    StepOnce = st => Step(st, 1)
  , SpeedDown = st => st.stepsPerFrame /= Math.PI/2
  , SpeedUp   = st => st.stepsPerFrame *= Math.PI/2
  , ToggleRunning = st => {
      st.running = !st.running;
      st.editing = false
    }
  , ToggleEditing = st => {
      st.editing = !st.editing;
      st.running = false
    }

export function ToggleCell(st, {x, y}) {
  let cellLocation = [x, y].map(Math.floor)
    , cellIsAlive = st.life.has(cellLocation)
    , method = cellIsAlive ? 'remove' : 'add'
  st.life = st.life[method](cellLocation)
}

export function Step(st, count) {
  if (Math.floor(count) > 0)
    st.life = st.life.step({count: Math.floor(count), canFree: true})
  st.center = Add(st.center, Mult(count, st.translationPerStep))
}

export function Viewport(st, bounds) {
  let {center, scale} = st
    , width  = bounds.width  / scale
    , height = bounds.height / scale
    , left   = center.x - width  / 2
    , right  = center.x + width  / 2
    , top    = center.y - height / 2
    , bottom = center.y + height / 2
    , v0 = {x: left, y: top}
    , v1 = {x: right, y: bottom}
  return {v0, v1, left, right, top, bottom, center, width, height}
}