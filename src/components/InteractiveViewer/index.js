import React, {useRef, useState, useEffect} from 'react'
import AnimatedCanvas from "../AnimatedCanvas"
import ViewerControls from "../ViewerControls"

let mult = (n, v) => ({x: n * v.x, y: n * v.y})
  // , dot  = (v1, v2) => ({x: v1.x * v2.x, v1.y * v2.y})
  , add  = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y})
  , subtract = (v1, v2) => add(v1, mult(-1, v2))
  , midpoint = (v1, v2) => mult(1/2, add(v1, v2))
  , distance = (v1, v2) => Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2))

export default function InteractiveViewer(props) {
  let i = props.initialState
    , dragContainer = props.dragContainer
    , stepsPending = useRef(0)
    , life = useRef(i.life)
    , viewRef = useRef({center: i.center, scale: i.scale})
    , translationPerStepRef = useRef(i.translationPerStep)
    , stepsPerFrameRef = useRef(i.stepsPerFrame)
    , [running, setRunning] = useState(i.running)
    , [editing, setEditing] = useState(i.editing)
    , ToggleRunning = () => (setRunning(!running), setEditing(false))
    , ToggleEditing = () => (setEditing(!editing), setRunning(false))
    , canvasRef = useRef(null)
    , lastTouchesRef = useRef([])
    , mouseDownRef = useRef(null)
    , lastViewport = null
    , lifeChanged = true
    , StepOnce = () => {
        Step(1)
        TranslateSteps(1)
      }
    , SpeedDown = () => stepsPerFrameRef.current /= Math.PI/2
    , SpeedUp   = () => stepsPerFrameRef.current *= Math.PI/2
    , mouseHandlers = {
        mousemove: HandleMouseMove,
        mouseup: HandleMouseUp,
        mouseleave: CleanupMouseDown
      }
    , controls =
        <div
          style={{
            position: 'absolute',
            bottom: '0%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            paddingBottom: '5%',
            pointerEvents: 'none'
          }}
        >
          <span style={{pointerEvents: 'auto'}}>
            <ViewerControls {...{size: '2em', running, editing, ToggleRunning, ToggleEditing, SpeedUp, SpeedDown, StepOnce}} />
          </span>
        </div>
  useEffect(RegisterTouchHandlers)
  return (
    <div style={{position: 'absolute', width: '100%', height: '100%'}}>
      <AnimatedCanvas
        style={{
          touchAction: 'none',
          width: '100%',
          height: '100%'
        }}
        onMouseDown={HandleMouseDown}
        onFrame={HandleFrame}
        onWheel={HandleWheel}
        ref={canvasRef}
      />
      {controls}
    </div>
  )

  function RegisterTouchHandlers() {
    let c = canvasRef.current
      , Add = c.addEventListener.bind(c)
    Add("touchstart",  HandleTouch) 
    Add("touchend",    HandleTouch)
    Add("touchcancel", HandleTouch)
    Add("touchmove",   HandleTouch)
    return () => {
      let Remove = c.removeEventListener.bind(c)
      Remove("touchstart",  HandleTouch) 
      Remove("touchend",    HandleTouch)
      Remove("touchcancel", HandleTouch)
      Remove("touchmove",   HandleTouch)
    }
  }

  function ToggleCell({x, y}) {
    let cellLocation = [x, y].map(Math.floor)
      , cellState = life.current.has(cellLocation)
    lifeChanged = true
    life.current = cellState
      ? life.current.remove(cellLocation)
      : life.current.add(cellLocation)
  }

  function Viewport() {
    let {scale, center} = viewRef.current
      , bounds = canvasRef.current.getBoundingClientRect()
      , width  = bounds.width  / scale
      , height = bounds.height / scale
      , left = center.x - width / 2
      , right = center.x + width / 2
      , top = center.y - height / 2
      , bottom = center.y + height / 2
      , v0 = {x: left, y: top}
      , v1 = {x: right, y: bottom}
    return {v0, v1, left, right, top, bottom, center, width, height}
  }

  function HandleFrame({imageData, context}) {
    let viewport = Viewport()
      , viewportChanged = JSON.stringify(viewport) !== JSON.stringify(lastViewport)
      , shouldRedraw = viewportChanged || lifeChanged
    if (imageData && shouldRedraw) {
      life.current.render({imageData: imageData, viewport, colors})
      context.putImageData(imageData, 0, 0)
    }
    lastViewport = viewport
    lifeChanged = false
    if (running) {
      stepsPending.current += stepsPerFrameRef.current
      let stepsThisFrame = stepsPending.current | 0
      if (stepsThisFrame > 0) {
        Step(stepsThisFrame)
        stepsPending.current -= stepsThisFrame
      }
      TranslateSteps(stepsPerFrameRef.current)
    }
  }

  function Step(count) {
    life.current = life.current.step({count, canMutate: true})
    lifeChanged = true
  }

  function TranslateSteps(steps) {
    let {center, scale} = viewRef.current
      , d = translationPerStepRef.current
    viewRef.current = {
      center: {x: center.x + d.x * steps, y: center.y + d.y * steps},
      scale
    }
  }

  function HandleWheel(event) {
    let v = viewRef.current
      , client = {x: event.clientX, y: event.clientY}
      , gridBefore = GridCoordinates(client)
      , scale = v.scale * ScaleFactor(event.deltaY || 0)
    viewRef.current = {center: v.center, scale}
    let gridAfter = GridCoordinates(client)
      , delta = subtract(gridAfter, gridBefore)
      , center = subtract(v.center, delta)
    viewRef.current = {center, scale}

    function ScaleFactor(deltaY) {
      let c = 2
      return Math.pow(2, deltaY / Math.sqrt(1 + c * deltaY * deltaY))
    }
  }

  function HandleClick(event) {
    if (running)
      ToggleRunning()
    else if (editing)
      ToggleCell(GridCoordinates({x: event.clientX, y: event.clientY}))
  }

  function HandleTouch(event) {
    event.preventDefault()
    let eventTouches = EventTouches(event)
      , lastTouches = lastTouchesRef.current
      , newAndUpdatedTouches = UpdateTrackedTouches(eventTouches, lastTouches)
      , touchCount = newAndUpdatedTouches.length
      , [t1, t2] = newAndUpdatedTouches
    if (IsTap())
      HandleTap(lastTouches[0])
    else if (touchCount === 1)
      HandleDrag(t1)
    else if (touchCount === 2)
      HandlePinch(t1, t2)
    lastTouchesRef.current = newAndUpdatedTouches

    function IsTap() {
      let lastTouchCount = lastTouches.length
        , tapThreshold = 150
      if (lastTouchCount !== 1 || touchCount !== 0) return false
      let duration = event.timeStamp - lastTouches[0].initialTimeStamp
      return duration < tapThreshold
    }
  }

  function EventTouches(event) {
    var eventTouches = []
    for (let i = 0; i < event.touches.length; i++) {
      let t = event.touches.item(i)
        , client = {x: t.clientX, y: t.clientY}
        , grid = GridCoordinates(client)
      eventTouches.push({identifier: t.identifier, timeStamp: event.timeStamp, client, grid})
    }
    return eventTouches
  }

  function UpdateTrackedTouches(eventTouches, trackedTouches) {
    let OldVersion = eventTouch => trackedTouches.find(trackedTouch => trackedTouch.identifier === eventTouch.identifier)
      , existingTouches = eventTouches.filter(OldVersion)
      , shouldResetPinned = existingTouches.length < trackedTouches.length
      , newAndUpdatedTouches = eventTouches.map(eventTouch => {
          let oldVersion = OldVersion(eventTouch)
            , pinned = oldVersion && !shouldResetPinned
                ? oldVersion.pinned
                : eventTouch.grid
            , initialTimeStamp =
                oldVersion
                  ? oldVersion.initialTimeStamp
                  : eventTouch.timeStamp
          return {...eventTouch, pinned, initialTimeStamp}
        })
    return newAndUpdatedTouches.slice(0, 2)
  }
  
  function HandleTap(touch) {
    if (running)
      ToggleRunning()
    else if (editing)
      ToggleCell(touch.grid)
  }

  function HandleDrag(touch) {
    let {pinned, grid} = touch
      , movement = subtract(pinned, grid)
      , view = viewRef.current
    viewRef.current = {
      center: add(movement, view.center),
      scale: view.scale
    }
  }

  function HandlePinch(touch1, touch2) {
    let gridCenter   = midpoint(touch1.grid,   touch2.grid)
      , pinnedCenter = midpoint(touch1.pinned, touch2.pinned)
      , pan = subtract(pinnedCenter, gridCenter)
      , clientDist = distance(touch1.client, touch2.client)
      , pinnedDist = distance(touch1.pinned, touch2.pinned)
      , view = viewRef.current
    viewRef.current = {
      center: add(pan, view.center),
      scale: clientDist / pinnedDist
    }
  }

  function HandleMouseDown(event) {
    let {clientX, clientY, timeStamp} = event
      , client = {x: clientX, y: clientY}
    mouseDownRef.current = {
      client,
      pinned: GridCoordinates(client),
      timeStamp
    }
    let dc = dragContainer || canvasRef.current
    for (var key in mouseHandlers)
      dc.addEventListener(key, mouseHandlers[key])
  }

  function CleanupMouseDown() {
    mouseDownRef.current = null
    let dc = dragContainer || canvasRef.current
    for (var key in mouseHandlers)
      dc.removeEventListener(key, mouseHandlers[key])
  }

  function HandleMouseMove(event) {
    let mouseDown = mouseDownRef.current
    if (!mouseDown) return
    let {clientX, clientY} = event
      , client = {x: clientX, y: clientY}
      , grid = GridCoordinates(client)
      , movement = subtract(mouseDown.pinned, grid)
    viewRef.current = {
      center: add(movement, viewRef.current.center),
      scale: viewRef.current.scale
    }
  }

  function HandleMouseUp(event) {
    let mouseDown = mouseDownRef.current
    if (!mouseDown) return
    let {clientX, clientY, timeStamp} = event
      , grid = GridCoordinates({x: clientX, y: clientY})
      , movementDistanceLimit = 0
      , movementDistance = distance(mouseDown.pinned, grid)
      , withinMovementDistanceLimit = movementDistance <= movementDistanceLimit
      , mouseDownTimeLimit = 100
      , mouseDownTime = timeStamp - mouseDown.timeStamp
      , withinMouseDownTimeLimit = mouseDownTime <= mouseDownTimeLimit
      , isClick = withinMovementDistanceLimit && withinMouseDownTimeLimit
    if (isClick) HandleClick(event)
    CleanupMouseDown()
  }

  function GridCoordinates({x: clientX, y: clientY}) {
    let {v0, v1} = Viewport()
      , viewportWidth  = v1.x - v0.x
      , viewportHeight = v1.y - v0.y
      , bounds = canvasRef.current.getBoundingClientRect()
      , pixelsFromLeft = clientX - bounds.left
      , pixelsFromTop  = clientY - bounds.top
      , horizontalScale = viewportWidth  / bounds.width
      , verticalScale   = viewportHeight / bounds.height
      , gridX = pixelsFromLeft * horizontalScale + v0.x
      , gridY = pixelsFromTop  * verticalScale   + v0.y
    return {x: gridX, y: gridY}
  }
}

let colors = {
  alive: [0, 0, 255, 255],
  dead: [255, 255, 255, 255]
}