import React, {useRef, useEffect, useCallback, useMemo} from 'react'
import {createSelectorCreator, defaultMemoize} from 'reselect'
import AnimatedCanvas from "../AnimatedCanvas"
import "../../styles/fill.css"
import * as L from 'lowlife'
import RenderBorder from "./render-border"
import RenderGridLines from "./render-grid-lines"
import RenderEdits from "./render-edits"
import {Edits, Editing, Running} from "../../redux"
import {Distance, Midpoint, Subtract} from "../../matrix"

export default function InteractiveViewer(props) {
  let {colors, dragContainer, getState, mutators: m} = props
  let canvasContainerRef = useRef(null)
  let dragContainerRef = useRef(dragContainer || null)
  let lastTouchesRef = useRef([])
  let mouseDownRef = useRef(null)
  let mouseHandlers = {
    mousemove: useCallback(HandleMouseMove, []),
    mouseup: useCallback(HandleMouseUp, []),
    mouseleave: useCallback(CleanupMouseDown, [])
  }
  let DrawFrame = useMemo(() => createDrawSelector(x => x, _DrawFrame), [])
  let Viewport = useMemo(() => defaultMemoize(_Viewport), [])
  // Add/remove mouse handlers on drag container
  useEffect(() => {
    if (dragContainer) UpdateDragContainerRef(dragContainer)
    return () => {if (dragContainer) UpdateDragContainerRef(null)}
  })
        
  return (
    <div
      className="fill"
      onMouseDown={useCallback(HandleMouseDown, [])}
      onWheel={useCallback(HandleWheel, [])}
      ref={useCallback(UpdateCanvasContainerRef, [])}
    >
      <AnimatedCanvas onFrame={useCallback(HandleFrame, [])} />
    </div>
  )

  function HandleFrame({context, imageData}) {
    let viewerState = getState()
    let {life, scale} = viewerState
    if (!scale) return
    let viewport = CurrentViewport()
    let edits = Edits(viewerState)
    let editing = Editing(viewerState)
    DrawFrame({colors, context, edits, editing, imageData, life, viewport})
    if (Running(viewerState)) m.advanceOneFrame()
  }

  function _DrawFrame(opts) {
    if (opts.imageData) {
      L.Render(opts.life, opts)
      RenderEdits(opts)
      RenderGridLines(opts)
      if (opts.editing) RenderBorder(opts)
      opts.context.putImageData(opts.imageData, 0, 0)
    }
  }

  function UpdateCanvasContainerRef(canvasContainer) {
    m.updateCanvasContainer(canvasContainer)
    let {current} = canvasContainerRef
    // Something about the way React does events required this manual handling to get pinch/zoom to work on mobile
    // This should be revisited later
    if (current && canvasContainer !== current) {
      // Remove handlers on unmount
      let Remove = current.removeEventListener.bind(current)
      Remove("touchstart",  HandleTouch) 
      Remove("touchend",    HandleTouch)
      Remove("touchcancel", HandleTouch)
      Remove("touchmove",   HandleTouch)
      canvasContainerRef.current = null
    }
    if (canvasContainer) {
      // Add handlers on mount
      let Add = canvasContainer.addEventListener.bind(canvasContainer)
      Add("touchstart",  HandleTouch) 
      Add("touchend",    HandleTouch)
      Add("touchcancel", HandleTouch)
      Add("touchmove",   HandleTouch)
      canvasContainerRef.current = canvasContainer
    }
    if (!dragContainerRef.current) UpdateDragContainerRef(canvasContainer)
  }

  function UpdateDragContainerRef(dragContainer) {
    let {current} = dragContainerRef
    if (current && dragContainer !== current) {
      let Remove = current.removeEventListener.bind(current)
      Remove("keyup", HandleKey)
      dragContainerRef.current = null
    }
    if (dragContainer) {
      let Add = dragContainer.addEventListener.bind(dragContainer)
      Add("keyup", HandleKey)
      dragContainerRef.current = dragContainer
    }
  }

  function HandleKey(event) {
    if (event.key === ' ') m.togglePlaying()
  }

  // TODO debouncing
  function HandleWheel(event) {
    let scaleFactor = ScaleFactor(event.deltaY || 0)
      , client = {x: event.clientX, y: event.clientY}
      , fixedPoint = GridCoordinates(client)
    m.zoom({scaleFactor, fixedPoint})

    function ScaleFactor(deltaY) {
      let c = 2
      return Math.pow(2, -deltaY / Math.sqrt(1 + c * deltaY * deltaY))
    }
  }

  function HandleTouch(event) {
    event.preventDefault()
    let eventTouches = EventTouches(event)
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
      HandleTap(lastTouches[0])
    else if (isDrag) 
      HandleDrag(t1)
    else if (isPinch)
      HandlePinch(t1, t2)
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
      , newAndUpdatedTouches = eventTouches.map(eventTouch => {
          let oldVersion = OldVersion(eventTouch)
            , initial = oldVersion ? oldVersion.initial : eventTouch
            , noTap   = oldVersion ? oldVersion.noTap   : false
          return {...eventTouch, initial, noTap}
        })
    return newAndUpdatedTouches.slice(0, 2)
  }
  
  function HandleTap(touch) {
    if (Editing(getState()))
      m.toggleCell(touch.grid)
  }

  function HandleDrag(touch) {
    let movement = Subtract(touch.initial.grid, touch.grid)
    m.pan(movement)
  }

  function HandlePinch(touch1, touch2) {
    let currentTouchCenter = Midpoint(touch1.grid, touch2.grid)
      , initialTouchCenter = Midpoint(touch1.initial.grid, touch2.initial.grid)
      , movement = Subtract(initialTouchCenter, currentTouchCenter)
      , currentClientDistance = Distance(touch1.client, touch2.client)
      , initialGridDistance = Distance(touch1.initial.grid, touch2.initial.grid)
    m.setScale(currentClientDistance / initialGridDistance)
    m.pan(movement)
  }

  function HandleMouseDown(event) {
    let {clientX, clientY, timeStamp} = event
      , client = {x: clientX, y: clientY}
    mouseDownRef.current = {
      client,
      grid: GridCoordinates(client),
      hasDragged: false,
      timeStamp
    }
    if (dragContainer) for (var key in mouseHandlers)
      dragContainer.addEventListener(key, mouseHandlers[key])
  }

  function CleanupMouseDown() {
    mouseDownRef.current = null
    if (dragContainer) for (var key in mouseHandlers)
      dragContainer.removeEventListener(key, mouseHandlers[key])
  }

  function HandleMouseMove(event) {
    let mouseDown = mouseDownRef.current
    if (!mouseDown) return
    let client = {x: event.clientX, y: event.clientY}
      , clientMovement = Distance(client, mouseDown.client)
      , dragThreshold = 3
    if (clientMovement < dragThreshold) return
    mouseDownRef.current.hasDragged = true
    let grid = GridCoordinates(client)
      , gridMovement = Subtract(mouseDown.grid, grid)
    m.pan(gridMovement)
  }

  function HandleMouseUp(event) {
    if (!mouseDownRef.current) return
    if (!mouseDownRef.current.hasDragged) HandleClick(event)
    CleanupMouseDown()
  }

  function HandleClick(event) {
    if (Editing(getState())) {
      let client = {x: event.clientX, y: event.clientY}
        , grid = GridCoordinates(client)
      m.toggleCell(grid)
    }
  }

  function GridCoordinates({x: clientX, y: clientY}) {
    let {v0, v1} = CurrentViewport()
      , viewportWidth  = v1.x - v0.x
      , viewportHeight = v1.y - v0.y
      , bounds = canvasContainerRef.current.getBoundingClientRect()
      , pixelsFromLeft = clientX - bounds.left
      , pixelsFromTop  = clientY - bounds.top
      , horizontalScale = viewportWidth  / bounds.width
      , verticalScale   = viewportHeight / bounds.height
      , gridX = pixelsFromLeft * horizontalScale + v0.x
      , gridY = pixelsFromTop  * verticalScale   + v0.y
    return {x: gridX, y: gridY}
  }


  function CurrentViewport() {
    let {center, scale} = getState()
    let {width, height} = canvasContainerRef.current.getBoundingClientRect()
    return Viewport(center.x, center.y, scale, width, height)
  }
}

function _Viewport(centerX, centerY, scale, clientWidth, clientHeight) {
  let width  = clientWidth  / scale
    , height = clientHeight / scale
    , left   = centerX - width  / 2
    , right  = centerX + width  / 2
    , top    = centerY - height / 2
    , bottom = centerY + height / 2
    , center = {x: centerX, y: centerY}
    , v0 = {x: left,  y: top}
    , v1 = {x: right, y: bottom}
  return {v0, v1, topleft: v0, bottomright: v0, left, right, top, bottom, center, width, height, scale}
}

let createDrawSelector = createSelectorCreator(defaultMemoize, (prev, next) =>
     prev.viewport  === next.viewport
  && prev.context   === next.context
  && prev.imageData === next.imageData
  && prev.life      === next.life
  && prev.edits     === next.edits
  && prev.editing   === next.editing
  && prev.colors    === next.colors
)