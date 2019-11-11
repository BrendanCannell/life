import React, {useRef, useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import AnimatedCanvas from "../AnimatedCanvas"
import ViewerControls from "../ViewerControls"

let Mult = (n, v) => ({x: n * v.x, y: n * v.y})
  // , dot  = (v1, v2) => ({x: v1.x * v2.x, v1.y * v2.y})
  , Add  = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y})
  , Subtract = (v1, v2) => Add(v1, Mult(-1, v2))
  , Magnitude = ({x, y}) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  , Midpoint = (v1, v2) => Mult(1/2, Add(v1, v2))
  , Distance = (v1, v2) => Magnitude(Subtract(v1, v2))

export default function InteractiveViewer(props) {
  let {withViewerState, dragContainer} = props
    , canvasRef = useRef(null)
    , lastTouchesRef = useRef([])
    , mouseDownRef = useRef(null)
    , stepsPendingRef = useRef(0)
    , lastViewport = null
    , lastImageData = null
    , lastLifeHash = null
    , mouseHandlers = {
        mousemove: HandleMouseMove,
        mouseup: HandleMouseUp,
        mouseleave: CleanupMouseDown
      }
        
  return (
    <div style={{position: 'relative', flex: 'auto'}}>
      <div style={{position: 'absolute', height: '100%', width: '100%'}}>
        <Viewer />
      </div>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          bottom: '10%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{pointerEvents: 'auto'}}>
          <Controls />
        </div>
      </div>
    </div>
  )

  function Viewer() {
    useEffect(RegisterTouchHandlers)
    return (
      <div
        style={{height: '100%', width: '100%'}}
        onMouseDown={HandleMouseDown}
        onWheel={HandleWheel}
        ref={canvasRef}
      >
        <AnimatedCanvas onFrame={frameData => withViewerState(st => HandleFrame(st, frameData))} />
      </div>
    )
  }

  function Controls() {
    let running = useSelector(st => st.running)
      , editing = useSelector(st => st.editing)
    return (
      <ViewerControls {...{size: '2em', running, editing, ToggleRunning, ToggleEditing, SpeedUp, SpeedDown, StepOnce}} />
    )
  }

  function RegisterTouchHandlers() {
    let c = canvasRef.current
      , Add = c.addEventListener.bind(c)
      , handler = event => withViewerState(st => HandleTouch(st, event))
    Add("touchstart",  handler) 
    Add("touchend",    handler)
    Add("touchcancel", handler)
    Add("touchmove",   handler)
    return () => {
      let Remove = c.removeEventListener.bind(c)
      Remove("touchstart",  handler) 
      Remove("touchend",    handler)
      Remove("touchcancel", handler)
      Remove("touchmove",   handler)
    }
  }

  function HandleFrame(st, {context, imageData}) {
    let viewport = CurrentViewport(st)
      , viewportChanged = JSON.stringify(viewport) !== JSON.stringify(lastViewport)
      , imageDataChanged = imageData !== lastImageData
      , lifeChanged = st.life.hash() !== lastLifeHash
      , shouldRedraw = viewportChanged || imageDataChanged || lifeChanged
    if (imageData && shouldRedraw) {
      st.life.render({imageData, viewport, colors})
      context.putImageData(imageData, 0, 0)
    }
    lastViewport = viewport
    lastImageData = imageData
    lastLifeHash = st.life.hash()
    if (st.running)
      AdvanceOneFrame()
  }

  // TODO debouncing
  function HandleWheel(st, event) {
    let scaleFactor = ScaleFactor(event.deltaY || 0)
    st.scale *= scaleFactor
    let client = {x: event.clientX, y: event.clientY}
      , fixedPoint = GridCoordinates(client)
      , offset = Subtract(fixedPoint, st.center)
      , movement = Mult(1 - 1/scaleFactor, offset)
    st.center = Add(st.center, movement)

    function ScaleFactor(deltaY) {
      let c = 2
      return Math.pow(2, deltaY / Math.sqrt(1 + c * deltaY * deltaY))
    }
  }

  function HandleClick(st, event) {
    if (st.editing) {
      let client = {x: event.clientX, y: event.clientY}
        , grid = GridCoordinates(st, client)
      ToggleCell(st, grid)
    }
  }

  function HandleTouch(st, event) {
    event.preventDefault()
    let eventTouches = EventTouches(st, event)
      , lastTouches = lastTouchesRef.current
      , newAndUpdatedTouches = UpdateTrackedTouches(eventTouches, lastTouches)
      , touchCount = newAndUpdatedTouches.length
      , [t1, t2] = newAndUpdatedTouches
      , isTap = IsTap()
      , isDrag = IsDrag()
      , isPinch = touchCount === 2
    if (isDrag || isPinch)
      for (var t of newAndUpdatedTouches)
        t.noTap = true
    if (isTap)
      HandleTap(st, lastTouches[0])
    else if (isDrag) 
      HandleDrag(st, t1)
    else if (isPinch)
      HandlePinch(st, t1, t2)
    lastTouchesRef.current = newAndUpdatedTouches

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

  function HandleMouseDown(st, event) {
    let {clientX, clientY, timeStamp} = event
      , client = {x: clientX, y: clientY}
    mouseDownRef.current = {
      client,
      grid: GridCoordinates(st, client),
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

  function HandleMouseMove(st, event) {
    let mouseDown = mouseDownRef.current
    if (!mouseDown) return
    let client = {x: event.clientX, y: event.clientY}
      , clientMovement = Distance(client, mouseDown.client)
      , dragThreshold = 3
    if (clientMovement < dragThreshold) return
    let grid = GridCoordinates(st, client)
      , gridMovement = Subtract(grid, mouseDown.grid)
    st.center = Subtract(st.center, gridMovement)
  }

  function HandleMouseUp(st, event) {
    let mouseDown = mouseDownRef.current
    if (!mouseDown) return
    let {clientX, clientY, timeStamp} = event
      , grid = GridCoordinates(st, {x: clientX, y: clientY})
      , movementDistanceLimit = 0
      , movementDistance = Distance(grid, mouseDown.grid)
      , withinMovementDistanceLimit = movementDistance <= movementDistanceLimit
      , mouseDownTimeLimit = 100
      , mouseDownTime = timeStamp - mouseDown.timeStamp
      , withinMouseDownTimeLimit = mouseDownTime <= mouseDownTimeLimit
      , isClick = withinMovementDistanceLimit && withinMouseDownTimeLimit
    if (isClick) HandleClick(st, event)
    CleanupMouseDown()
  }

  function GridCoordinates(st, {x: clientX, y: clientY}) {
    let {v0, v1} = CurrentViewport(st)
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

  function CurrentViewport(st) {
    return Viewport(st, canvasRef.current.getBoundingClientRect())
  }

  function AdvanceOneFrame(st) {
    stepsPendingRef.current += st.stepsPerFrame
    Step(st, stepsPendingRef.current)
    let stepsThisFrame = Math.floor(stepsPendingRef.current)
    stepsPendingRef.current -= stepsThisFrame
  }
}

let colors = {alive: [0, 255, 0, 255], dead: [20, 20, 20, 255]}