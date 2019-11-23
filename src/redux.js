import {configureStore, createAction, createReducer} from 'redux-starter-kit'
import thunk from 'redux-thunk'
import * as L from 'lowlife'

let Mult = (n, v) => ({x: n * v.x, y: n * v.y})
  , Add  = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y})
  , Subtract = (v1, v2) => Add(v1, Mult(-1, v2))
  // , Magnitude = ({x, y}) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  // , Midpoint = (v1, v2) => Mult(1/2, Add(v1, v2))
  // , Distance = (v1, v2) => Magnitude(Subtract(v1, v2))

let initialState = {
  viewerState: {
    life: L.Empty(),
    canvasContainer: null,
    center: null,
    scale: null,
    stepsPerFrame: 1/4,
    stepsPending: 0,
    translationPerStep: {x: 0, y: 0},
    running: false,
    suspended: true,
    editing: true,
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
  , toggleEditing = createAction('toggleEditing')
  , toggleRunning = createAction('toggleRunning')
  , toggleShowingDrawer = createAction('toggleShowingDrawer')
  , toggleShowingSpeedControls = createAction('toggleShowingSpeedControls')
  , updateCanvasContainer = createAction('updateCanvasContainer')
  , zoom = createAction('zoom')

let reducer = createReducer(initialState, {
  [advanceOneFrame]: (st) => {
    let vst = ViewerState(st)
    if (!vst.running || vst.editing) return
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
  [setLife]: (st, {payload: locations}) => {
    let vst = ViewerState(st)
    vst.life = L.FromLiving(locations)
    vst.running = false
    vst.suspended = false
    vst.editing = false
    if (vst.canvasContainer) {
      FitToBounds(vst)
    }
  },
  [speedDown]: (st) => {ViewerState(st).stepsPerFrame /= Math.PI/2},
  [speedUp]:   (st) => {ViewerState(st).stepsPerFrame *= Math.PI/2},
  [stepOnce]: (st) => Step(ViewerState(st), 1),
  [toggleCell]: (st, {payload: {x, y}}) => {
    let vst = ViewerState(st)
      , cellLocation = [x, y].map(Math.floor)
      , cellState = L.Has(vst.life, cellLocation)
    vst.life = L.Set(vst.life, cellLocation, !cellState, {canFree: true})
  },
  [toggleEditing]: (st) => {
    let vst = ViewerState(st)
    vst.editing = !vst.editing
    if (vst.editing) {
      vst.showingSpeedControls = false
    }
    UpdateSuspension(st)
  },
  [toggleRunning]: (st) => {
    let vst = ViewerState(st)
    vst.running = !vst.running
    vst.editing = false
    vst.suspended = false
  },
  [toggleShowingDrawer]: (st) => {
    st.showingDrawer = !st.showingDrawer
    UpdateSuspension(st)
  },
  [toggleShowingSpeedControls]: (st) => {
    let vst = ViewerState(st)
    vst.showingSpeedControls = !vst.showingSpeedControls
  },
  [updateCanvasContainer]: (st, {payload: canvasContainer}) => {
    let vst = ViewerState(st)
    let oldCanvasContainer = vst.canvasContainer
    vst.canvasContainer = canvasContainer
    if (canvasContainer && !oldCanvasContainer) {
      FitToBounds(vst)
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
    vst.life = L.Step(vst.life, {canFree: true})
  }
}

function UpdateSuspension(st) {
  let vst = ViewerState(st)
  if (vst.suspended && !vst.editing && ! st.showingDrawer) {
    vst.running = true;
    vst.suspended = false;
  }
  else if (vst.running && (vst.editing || st.showingDrawer)) {
    vst.running = false;
    vst.suspended = true;
  }
}

function FitToBounds(vst) {
  let clientBounds = vst.canvasContainer.getBoundingClientRect()
    , gridBounds = L.BoundingRect(vst.life) || {}
    , width  = Math.max((gridBounds.width  || 0) * 1.2, 10)
    , height = Math.max((gridBounds.height || 0) * 1.2, 10)
    , scaleX = clientBounds.width  / width
    , scaleY = clientBounds.height / height
  vst.center = gridBounds.center || {x: 0, y: 0}
  vst.scale = Math.min(scaleX, scaleY)
}


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