import React, {useRef, useState, useCallback, useEffect} from 'react'
import AnimatedCanvas from "../AnimatedCanvas"
import Life from 'lowlife'
import {FaPause, FaPlay, FaStepForward, FaPlus, FaMinus} from 'react-icons/fa'

let mult = (n, v) => ({x: n * v.x, y: n * v.y})
  // , dot  = (v1, v2) => ({x: v1.x * v2.x, v1.y * v2.y})
  , add  = (v1, v2) => ({x: v1.x + v2.x, y: v1.y + v2.y})
  , subtract = (v1, v2) => add(v1, mult(-1, v2))
  , midpoint = (v1, v2) => mult(1/2, add(v1, v2))
  , distance = (v1, v2) => Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2))

export default function InteractiveViewer(props) {
  let i = props.initialState
    , stepsPending = useRef(0)
    , life = useRef(i.life)
    , viewRef = useRef({center: i.center, scale: i.scale})
    , translationPerStepRef = useRef(i.translationPerStep)
    , stepsPerFrameRef = useRef(i.stepsPerFrame)
    , [running, setRunning] = useState(i.running)
    , viewerElementRef = useRef(null)
    , maxStepsRef = useRef(null)
    , blurBufferRef = useRef(null)
    , lastTouchesRef = useRef([])
    , lastMouseRef = useRef(null)
    , TranslateSteps = useCallback(
        steps => {
          let {center, scale} = viewRef.current
            , d = translationPerStepRef.current
          viewRef.current = {
            center: {x: center.x + d.x * steps, y: center.y + d.y * steps},
            scale
          }
        },
        []
      )
    , Viewport = () => {
        let {scale, center} = viewRef.current
          , bounds = viewerElementRef.current.getBoundingClientRect()
          , width  = bounds.width  / scale
          , height = bounds.height / scale
        return {
          v0: {
            x: center.x - width / 2,
            y: center.y - height / 2
          },
          v1: {
            x: center.x + width / 2,
            y: center.y + height / 2
          },
          center,
          width,
          height
        }
      }
    , HandleFrame = useCallback(
        ctx => {
          let v = Viewport()
            , {width, height} = v
            , maxSteps = 1 //Math.ceil(stepsPerFrameRef.current)
            , b = blurBufferRef.current
            , canReuseBuffer =
                b
                && width === b.width
                && height === b.height
                && maxSteps === b.maxSteps
          if (!canReuseBuffer)
            blurBufferRef.current = Life.BlurBuffer({width, height, maxSteps})
          let arrayViewport = {
            v0: [v.v0.x, v.v0.y],
            v1: [v.v1.x, v.v1.y]
          }
          blurBufferRef.current
            .clear()
            .add(life.current, arrayViewport)
            .draw(ctx.imageData, colors, arrayViewport)
          if (running) {
            stepsPending.current += stepsPerFrameRef.current
            let stepsThisFrame = stepsPending.current | 0
            if (stepsThisFrame > 0) {
              life.current = life.current.step({count: stepsThisFrame, canMutate: true})
              stepsPending.current -= stepsThisFrame
            }
            TranslateSteps(stepsPerFrameRef.current)
          }
        },
        [life, running, TranslateSteps]
      )
    , Play  = () => setRunning(true)
    , Pause = () => setRunning(false)
    , StepOnce = () => {
        life.current = life.current.step({canMutate: true})
        TranslateSteps(1)
      }
    , SpeedDown = () => stepsPerFrameRef.current /= Math.PI/2
    , SpeedUp   = () => stepsPerFrameRef.current *= Math.PI/2
    , controls =
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'lightgray',
            width: '100%',
            height: '100%'
          }}
        >
          {running
            ? <FaPause size={32} onClick={Pause} />
            : <FaPlay  size={32} onClick={Play} />}
          <FaStepForward
            size={32}
            onClick={StepOnce}
            color={running ? 'gray' : 'black'}
          />
          <FaMinus
            size={32}
            onClick={SpeedDown}
          />
          <FaPlus 
            size={32}
            onClick={SpeedUp}
          />
        </div>
    , ToggleCell = client => {
        if (!viewerElementRef.current) return
        let {x, y} = GridCoordinates(client)
          , cellLocation = [x, y].map(Math.floor)
          , cellState = life.current.has(cellLocation)
        console.log({cellLocation, cellState})
        life.current = cellState
          ? life.current.remove(cellLocation)
          : life.current.add(cellLocation)
      }
  useEffect(() => {
    let v = viewerElementRef.current
      , Add = v.addEventListener.bind(v)
      , Remove = v.removeEventListener.bind(v)
    Add("touchstart",  HandleTouch, { passive: false }) 
    Add("touchend",    HandleTouch, { passive: false })
    Add("touchcancel", HandleTouch, { passive: false })
    Add("touchmove",   HandleTouch, { passive: false })
    Add("wheel", HandleWheel)
    return () => {
      Remove("touchstart",  HandleTouch) 
      Remove("touchend",    HandleTouch)
      Remove("touchcancel", HandleTouch)
      Remove("touchmove",   HandleTouch)
      Remove("wheel", HandleWheel)
    }
  })

  console.log({stepsPerFrame: stepsPerFrameRef.current, stepsPending: stepsPending.current, running})
  return (
    <div style={{width: '100%', height: '100%'}}>
      <div
        ref={viewerElementRef}
        style={{position: 'relative', width: '100%', height: '90%'}}
        onClick={HandleClick}
      >
        <AnimatedCanvas onFrame={HandleFrame} />
      </div>
      <div style={{width: '100%', height: '10%'}}>
        {controls}
      </div>
    </div>
  )

  function HandleWheel(event) {
    let v = viewRef.current
      , client = {x: event.clientX, y: event.clientY}
      , gridBefore = GridCoordinates(client)
      , deltaY = event.deltaY || 0
      , scaleFactor =
            deltaY > 0 ? Math.sqrt(2)
          : deltaY < 0 ? 1 / Math.sqrt(2)
          : 0
      , scale = v.scale * scaleFactor
    viewRef.current = {center: v.center, scale}
    let gridAfter = GridCoordinates(client)
      , delta = subtract(gridAfter, gridBefore)
      , center = subtract(v.center, delta)
    viewRef.current = {center, scale}
  }

  function HandleClick(event) {
    if (!viewerElementRef.current) return
    if (running)
      Pause()
    else
      ToggleCell({x: event.clientX, y: event.clientY})
  }

  function HandleTouch(event) {
    event.preventDefault()

    // Update trackedTouches
    let eventTouches = []
    for (let i = 0; i < event.touches.length; i++) {
      let t = event.touches.item(i)
        , client = {x: t.clientX, y: t.clientY}
        , grid = GridCoordinates(client)
      eventTouches.push({identifier: t.identifier, timeStamp: event.timeStamp, client, grid})
    }
    let lastTouches = lastTouchesRef.current
      , newAndUpdatedTouches = UpdateTrackedTouches(eventTouches, lastTouches)
      , [t1, t2] = newAndUpdatedTouches
      , touchCount = newAndUpdatedTouches.length
    if (UserTapped())
      Tap(lastTouches[0])
    else
      viewRef.current =
          touchCount === 2 ? Pinch(t1, t2, viewRef.current)
        : touchCount === 1 ? Drag(t1, viewRef.current)
        : viewRef.current
    lastTouchesRef.current = newAndUpdatedTouches

    function UserTapped() {
      let lastTouchCount = lastTouches.length
        , tapThreshold = 150
      if (lastTouchCount !== 1 || touchCount !== 0) return false
      let duration = event.timeStamp - lastTouches[0].initialTimeStamp
      return duration < tapThreshold
    }
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
  
  function Tap(touch) {
    if (!viewerElementRef.current) return
    if (running)
      Pause()
    else
      ToggleCell(touch.client)
  }

  function Drag(touch, view) {
    let {pinned, grid} = touch
      , pan = subtract(pinned, grid)
    return {
      center: add(pan, view.center),
      scale: view.scale
    }
  }

  function Pinch(touch1, touch2, view) {
    let gridCenter   = midpoint(touch1.grid,   touch2.grid)
      , pinnedCenter = midpoint(touch1.pinned, touch2.pinned)
      , pan = subtract(pinnedCenter, gridCenter)
      , clientDist = distance(touch1.client, touch2.client)
      , pinnedDist = distance(touch1.pinned, touch2.pinned)
    return {
      center: add(pan, view.center),
      scale: clientDist / pinnedDist
    }
  }

  function GridCoordinates({x: clientX, y: clientY}) {
    let {v0, v1} = Viewport()
      , viewportWidth  = v1.x - v0.x
      , viewportHeight = v1.y - v0.y
      , bounds = viewerElementRef.current.getBoundingClientRect()
      , pixelsFromLeft = clientX - bounds.left
      , pixelsFromTop  = clientY - bounds.top
      , horizontalScale = viewportWidth  / bounds.width
      , verticalScale   = viewportHeight / bounds.height
      , gridX = pixelsFromLeft * horizontalScale + v0.x
      , gridY = pixelsFromTop  * verticalScale   + v0.y
    return {x: gridX, y: gridY}
  }
}

let maxSteps = 1
  , colors = Colors(maxSteps)

function Colors(maxSteps) {
  let colors = []
  for (let i = 0; i <= maxSteps; i++) {
    let R = 255 * (1 - i / maxSteps) | 0
      , G = R
      , B = 255
      , A = 255
    colors.push([R,G,B,A])
  }
  return colors
}