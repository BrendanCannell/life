import {configureStore, createAction, createReducer, createSelector} from 'redux-starter-kit'
import thunk from 'redux-thunk'
import Patterns from "./patterns/index.js"
import Life from 'lowlife'

let Mult = (n, v) => ({x: n * v.x, y: n * v.y})
  , Add  = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y})
  , Subtract = (v1, v2) => Add(v1, Mult(-1, v2))
  , Magnitude = ({x, y}) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  , Midpoint = (v1, v2) => Mult(1/2, Add(v1, v2))
  , Distance = (v1, v2) => Magnitude(Subtract(v1, v2))

let initialLocations = Patterns[0].locations

var minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity
for (var [x, y] of initialLocations) {
  minX = Math.min(x, minX)
  maxX = Math.max(x, maxX)
  minY = Math.min(y, minY)
  maxY = Math.max(y, maxY)
}
let sizeX = maxX - minX
  , scaleX = window.innerWidth / sizeX
  , sizeY = maxY - minY
  , scaleY = window.innerHeight / sizeY
  , scale = Math.min(scaleX, scaleY) * 0.5 || 10 // TODO deal with empty initialLocations
  , center = {x: (maxX + minX) / 2, y: (maxY + minY) / 2}

let initialState = {
  life: Life(initialLocations),
  stepsPerFrame: 1/8,
  stepsPending: 0,
  mainCanvas: document.createElement('canvas'),
  canvasBounds: null,
  center: center,
  scale: scale,
  lastViewport: null,
  translationPerStep: {x: 0, y: 0},
  running: false,
  editing: true,
  showingSpeedControls: false,
  showingDrawer: false,
  lastMouse: null,
  lastTouches: []
}

let Context = createSelector(
  [st => st.mainCanvas],
  mainCanvas => mainCanvas && mainCanvas.getContext('2d')
)

function CanvasBounds(st) {
  return st.mainCanvas && st.mainCanvas.getBoundingClientRect()
}

function DevicePixelRatio() {
  return window.devicePixelRatio || 1
}

let CanvasImageData = createSelector(
  [st => st.mainCanvas, Context, st => CanvasBounds(st).width, st => CanvasBounds(st).height, DevicePixelRatio],
  (canvas, context, logicalWidth, logicalHeight, dpr) => {
    let pixelWidth  = logicalWidth  * dpr
      , pixelHeight = logicalHeight * dpr
    canvas.width  = pixelWidth
    canvas.height = pixelHeight
    return pixelWidth !== 0 && pixelHeight !== 0
        ? context.createImageData(pixelWidth, pixelHeight)
        : null
  }
)

let DrawLife = createSelector(
  [Context, st => st.life, Viewport, CanvasImageData, st => st.life.hash()],
  (context, life, viewport, imageData) => {
    life.render({imageData, viewport, colors})
    context.putImageData(imageData, 0, 0)
  }
)

let AdvanceFrame = st => {
  st.stepsPending += st.stepsPerFrame
  Step(st, st.stepsPending)
  let stepsThisFrame = Math.floor(st.stepsPending)
  st.stepsPending -= stepsThisFrame
}

export let
    frame = createAction('frame')
  , mouseDown = createAction('mouseDown')
  , mouseMove = createAction('mouseMove')
  , mouseUp = createAction('mouseUp')
  , pan = createAction('pan')
  , zoom = createAction('zoom')
  , speedDown = createAction('speedDown')
  , speedUp = createAction('speedUp')
  , stepOnce = createAction('stepOnce')
  , toggleEditing = createAction('toggleEditing')
  , toggleRunning = createAction('toggleRunning')
  , toggleShowingSpeedControls = createAction('toggleShowingSpeedControls')
  , toggleShowingDrawer = createAction('toggleShowingDrawer')
  , touch = createAction('touch')

let reducer = createReducer(initialState, {
  [frame]: (st, {payload: now}) => {
    // Redraw, if needed
    DrawLife(st)
    // Advance, if running
    if (st.running)
      AdvanceFrame(st)
  },
  [mouseDown]: (st) => {},
  [mouseMove]: (st) => {},
  [mouseUp]: (st) => {},
  [pan]: (st, {payload: movement}) => {
    st.center = Add(movement, st.center)
  },
  [zoom]: (st, {payload: {fixedPoint, scaleFactor}}) => {
    let centerToFixed = Subtract(fixedPoint, st.center)
      , movement = Mult(1 - 1/scaleFactor, centerToFixed)
    st.center = Add(st.center, movement)
    st.scale *= scaleFactor
  },
  [speedDown]: (st) => {st.stepsPerFrame /= Math.PI/2},
  [speedUp]:   (st) => {st.stepsPerFrame *= Math.PI/2},
  [stepOnce]: (st) => {Step(st, 1)},
  [toggleEditing]: (st) => {
    st.editing = !st.editing
    st.running = false
    st.showingSpeedControls = false
  },
  [toggleRunning]: (st) => {
    st.running = !st.running
    st.editing = false
  },
  [toggleShowingDrawer]: (st) => {st.showingDrawer = !st.showingDrawer},
  [toggleShowingSpeedControls]: (st) => {
    st.showingSpeedControls = !st.showingSpeedControls
    st.editing = false
  },
  [touch]: (st, {payload: event}) => {
    let eventTouches = EventTouches(st, event)
      , lastTouches = st.lastTouches
      , newAndUpdatedTouches = UpdateTrackedTouches(eventTouches, st.lastTouches)
      , touchCount = newAndUpdatedTouches.length
      , [t1, t2] = newAndUpdatedTouches
    // TODO use enum
      , isTap = IsTap()
      , isDrag = IsDrag()
      , isPinch = touchCount === 2
    if (isDrag || isPinch)
      for (var t of newAndUpdatedTouches)
        t.noTap = true
    if (isTap)
      HandleTap(st, st.lastTouches[0])
    else if (isDrag) 
      HandleDrag(st, t1)
    else if (isPinch)
      HandlePinch(st, t1, t2)
    st.lastTouches = newAndUpdatedTouches
  
    function IsTap() {
      let lastTouchCount = lastTouches.length
      return (
        touchCount === 0
        && lastTouchCount === 1
        && !lastTouches[0].noTap
      )
    }
  
    function IsDrag() {
      if (touchCount !== 1) return false
      let clientMovement = Distance(t1.client, t1.initial.client)
        , dragThreshold = 3
      return clientMovement > dragThreshold
    }
  }
})
  
function HandleTap(st, touch) {
  if (st.editing)
    ToggleCell(st, touch.grid)
}

function HandleDrag(st, touch) {
  let movement = Subtract(touch.grid, touch.initial.grid)
  st.center = Subtract(st.center, movement)
}

function HandlePinch(st, touch1, touch2) {
  let currentCenter = Midpoint(touch1.grid, touch2.grid)
    , initialCenter = Midpoint(touch1.initial.grid, touch2.initial.grid)
    , movement = Subtract(initialCenter, currentCenter)
    , currentClientDistance = Distance(touch1.client, touch2.client)
    , initialGridDistance = Distance(touch1.initial.grid, touch2.initial.grid)
  st.center = Add(movement, st.center)
  st.scale = currentClientDistance / initialGridDistance
}

function ToggleCell(st, {payload: {x, y}}) {
  let cellLocation = [x, y].map(Math.floor)
    , cellState = st.life.has(cellLocation)
  st.life = cellState
    ? st.life.remove(cellLocation)
    : st.life.add(cellLocation)
  st.lifeChanged = true
  st.lifeIteration++
}

function EventTouches(st, event) {
  var eventTouches = []
  for (let i = 0; i < event.touches.length; i++) {
    let t = event.touches.item(i)
      , client = {x: t.clientX, y: t.clientY}
      , grid = GridCoordinates(st, client)
    eventTouches.push({identifier: t.identifier, timeStamp: event.timeStamp, client, grid})
  }
  return eventTouches
}

function UpdateTrackedTouches(eventTouches, trackedTouches) {
  let OldVersion = eventTouch => trackedTouches.find(trackedTouch => trackedTouch.identifier === eventTouch.identifier)
    , newAndUpdatedTouches = eventTouches.map(eventTouch => {
        let oldVersion = OldVersion(eventTouch)
          , initial = oldVersion ? oldVersion.initial : eventTouch
          , noTap   = oldVersion ? oldVersion.noTap   : false
        return {...eventTouch, initial, noTap}
      })
  return newAndUpdatedTouches.slice(0, 2)
}

function Step(st, count) {
  if (Math.floor(count) > 0) {
    st.life = st.life.step({count: Math.floor(count), canFree: true})
    st.lifeChanged = true
    st.lifeIteration++
  }
  st.center = Add(st.center, Mult(count, st.translationPerStep))
}

function Viewport(st) {
  let center = st.center
    , scale  = st.scale
    , canvasBounds = CanvasBounds(st)
    , width  = canvasBounds.width  / scale
    , height = canvasBounds.height / scale
    , left   = center.x - width  / 2
    , right  = center.x + width  / 2
    , top    = center.y - height / 2
    , bottom = center.y + height / 2
    , v0 = {x: left,  y: top}
    , v1 = {x: right, y: bottom}
  return {v0, v1, left, right, top, bottom, center, width, height}
}

// TODO use st.scale
function GridCoordinates(st, {x: clientX, y: clientY}) {
  let bounds = CanvasBounds(st)
    , viewport = Viewport(st)
    , pixelsFromLeft = clientX - bounds.left
    , pixelsFromTop  = clientY - bounds.top
    , horizontalScale = viewport.width  / bounds.width
    , verticalScale   = viewport.height / bounds.height
    , gridX = pixelsFromLeft * horizontalScale + viewport.left
    , gridY = pixelsFromTop  * verticalScale   + viewport.top
  return {x: gridX, y: gridY}
}

let colors = {alive: [0, 255, 0, 255], dead: [20, 20, 20, 255]}


// const {actions, reducer: todosReducer} = createSlice({
//   slice: "todos",
//   initialState,
//   reducers: {
//     addTodo(st, action) {
//       // You can "mutate" the state in a reducer, thanks to Immer
//       st.push(action.payload)
//     },
//     toggleTodo(st, action) {
//       const todo = st.find(todo => todo.id === action.payload)
//       todo.complete = !todo.complete
//     },
//     deleteTodo(st, action) {
//       return st.filter((todo) => todo.id !== action.payload)
//     }
//   }
// })

export let store = configureStore({reducer, middleware: [thunk]})