import {configureStore, createAction, createReducer, createSelector} from 'redux-starter-kit'
import {createSelectorCreator, defaultMemoize} from 'reselect'
import thunk from 'redux-thunk'
import * as L from 'lowlife'
import {Mult, Add, Subtract} from "./matrix"

let initialState = {
  viewerState: {
    life: L.Empty(),
    canvasContainer: null,
    center: null,
    scale: null,
    stepsPerFrame: 1/4,
    stepsPending: 0,
    translationPerStep: {x: 0, y: 0},
    playing: false,
    suspended: false,
    editHistory: [],
    showingSpeedControls: false,
  },
  showingDrawer: false,
}

export let ViewerState = st => st.viewerState

export let AdvanceFrame = st => {
  st.stepsPending += st.stepsPerFrame
  Step(st, st.stepsPending)
  let stepsThisFrame = Math.floor(st.stepsPending)
  st.stepsPending -= stepsThisFrame
}

let LifeSelector = createSelectorCreator(defaultMemoize, (prev, next) => (prev && prev.hash) === (next && next.hash))
export let Life = LifeSelector(vst => vst.life, x => x)

export let Editing = vst => !vst.playing && !vst.suspended

export let Running = vst => vst.playing && !vst.suspended

export let
    advanceOneFrame = createAction('advanceOneFrame')
  , fitToBounds = createAction('fitToBounds')
  , initializeBounds = createAction('initializeBounds')
  , pan = createAction('pan')
  , setScale = createAction('setScale')
  , setLife = createAction('setLife')
  , speedDown = createAction('speedDown')
  , speedUp = createAction('speedUp')
  , stepOnce = createAction('stepOnce')
  , toggleCell = createAction('toggleCell')
  // , toggleEditing = createAction('toggleEditing')
  , togglePlaying = createAction('togglePlaying')
  , toggleShowingDrawer = createAction('toggleShowingDrawer')
  , toggleShowingSpeedControls = createAction('toggleShowingSpeedControls')
  , updateCanvasContainer = createAction('updateCanvasContainer')
  , zoom = createAction('zoom')

let reducer = createReducer(initialState, {
  [advanceOneFrame]: (st) => {
    let vst = ViewerState(st)
    vst.stepsPending += vst.stepsPerFrame
    Step(vst, vst.stepsPending)
    let stepsThisFrame = Math.floor(vst.stepsPending)
    vst.stepsPending -= stepsThisFrame
  },
  [pan]: (st, {payload: movement}) => {
    let vst = ViewerState(st)
    vst.center = Add(movement, vst.center)
  },
  [fitToBounds]: (st) => {
    FitToBounds(ViewerState(st))
  },
  [setScale]: (st, {payload: scale}) => {ViewerState(st).scale = scale},
  [setLife]: (st, {payload: Locations}) => {
    let vst = ViewerState(st)
    vst.life = L.FromLiving(Locations())
    vst.playing = false
    vst.editHistory = []
    vst.showingSpeedControls = false
    if (vst.canvasContainer) {
      FitToBounds(vst)
    }
  },
  [speedDown]: (st) => {ViewerState(st).stepsPerFrame /= Math.PI/2},
  [speedUp]:   (st) => {ViewerState(st).stepsPerFrame *= Math.PI/2},
  [stepOnce]: (st) => {
    let vst = ViewerState(st)
    FlushEditHistory(vst)
    Step(vst, 1)
    vst.showingSpeedControls = false
  },
  [toggleCell]: (st, {payload: {x, y}}) => {
    let vst = ViewerState(st)
      , cellLocation = [x, y].map(Math.floor)
    vst.editHistory.push(cellLocation)
    vst.showingSpeedControls = false
  },
  [togglePlaying]: (st) => {
    let vst = ViewerState(st)
    vst.playing = !vst.playing
    FlushEditHistory(vst)
    vst.showingSpeedControls = false
  },
  [toggleShowingDrawer]: (st) => {
    st.showingDrawer = !st.showingDrawer
    let vst = ViewerState(st)
    vst.suspended = st.showingDrawer
    vst.showingSpeedControls = false
  },
  [toggleShowingSpeedControls]: (st) => {
    let vst = ViewerState(st)
    vst.showingSpeedControls = !vst.showingSpeedControls
  },
  [updateCanvasContainer]: (st, {payload: canvasContainer}) => {
    let vst = ViewerState(st)
    vst.canvasContainer = canvasContainer
    if (canvasContainer && !vst.scale) {
      FitToBounds(vst)
      if (!vst.scale)
        DefaultBounds(vst)
    }
  },
  [zoom]: (st, {payload: {fixedPoint, scaleFactor}}) => {
    let vst = ViewerState(st)
    let centerToFixed = Subtract(fixedPoint, vst.center)
      , movement = Mult(1 - 1/scaleFactor, centerToFixed)
    vst.center = Add(vst.center, movement)
    vst.scale *= scaleFactor
  },
})

function Step(vst, count) {
  vst.center = Add(vst.center, Mult(count, vst.translationPerStep))
  for (count = Math.floor(count); count > 0; count--) {
    vst.life = L.Next(vst.life, {canFree: true})
  }
}

function FitToBounds(vst) {
  let clientBounds = vst.canvasContainer.getBoundingClientRect()
  let lifeBounds = L.BoundingRect(vst.life)
  if (!lifeBounds && Edits(vst).length === 0) return
  let {left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity} = lifeBounds || {}
  for (var [[x, y]] of Edits(vst)) {
    left = Math.min(left, x)
    right = Math.max(right, x + 1)
    top = Math.min(top, y)
    bottom = Math.max(bottom, y + 1)
  }
  let width  = Math.max((right - left) * 1.2, 10)
  let height = Math.max((bottom - top) * 1.2, 10)
  let scaleX = clientBounds.width  / width
  let scaleY = clientBounds.height / height
  vst.center = {x: (left + right) / 2, y: (top + bottom) / 2}
  vst.scale = Math.min(scaleX, scaleY)
}

function DefaultBounds(vst) {
  let clientBounds = vst.canvasContainer.getBoundingClientRect()
  let width  = 10
  let height = 10
  let scaleX = clientBounds.width  / width
  let scaleY = clientBounds.height / height
  vst.center = {x: 0, y: 0}
  vst.scale = Math.min(scaleX, scaleY)
}

export let Edits = createSelector(
  [vst => vst.life, vst => vst.editHistory],
  (life, editHistory) => {
    let toggleCounts = new Map()
    for (var location of editHistory) {
      let str = location.join()
      let toggleCount = toggleCounts.get(str) || 0
      toggleCounts.set(str, toggleCount + 1)
    }
    let updates = []
    for (var [locationStr, toggleCount] of toggleCounts)
      if (toggleCount % 2 === 1) {
        let location = locationStr.split(',').map(n => parseInt(n))
        let currentState = L.Has(life, location)
        updates.push([location, !currentState])
      }
    return updates
  })

function FlushEditHistory(vst) {
  if (vst.editHistory.length > 0) {
    vst.life = L.SetMany(vst.life, Edits(vst), {canFree: true})
    vst.editHistory = []
  }
}

let actionSanitizer = action =>
    action.type === setLife.toString()               ? {...action, payload: '<<LOCATIONS_ARRAY>>'}
  : action.type === updateCanvasContainer.toString() ? {...action, payload: '<<CANVAS_CONTAINER>>'}
  : action
let stateSanitizer = ({viewerState, ...rest}) => {
    let {life, canvasContainer, ...viewerStateRest} = viewerState
    return {
      viewerState: {
        life: life && `<<LIFE-${life.hash}>>`,
        canvasContainer: canvasContainer && '<<CANVAS_CONTAINER>>',
        ...viewerStateRest
      },
      ...rest
    }
  }

export let store = configureStore({
  reducer,
  middleware: [thunk],
  devTools: {actionSanitizer, stateSanitizer}
})