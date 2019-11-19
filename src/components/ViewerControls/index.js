import React from 'react'
import {useSelector} from 'react-redux'
import {ViewerState} from "../../redux"
import {MdPause, MdPlayArrow, MdSlowMotionVideo, MdAdd, MdRemove, MdModeEdit, MdMenu} from 'react-icons/md'
import StepForward from "../icons/StepForward"

export default function Controls(props) {
  let {size, colors, mutators: m} = props
    , running = useSelector(st => ViewerState(st).running)
    , editing = useSelector(st => ViewerState(st).editing)
    , showingSpeedControls = useSelector(st => ViewerState(st).showingSpeedControls)
    , ems = parseInt(size)
    , mainStyle = MainStyle(ems, colors)
    , iconProps = {
        size, // for react-icons
        width: size,
        height: size
      }
    , PlayPause = running ? MdPause : MdPlayArrow
    , Spacer = () => <div style={{width: (ems / 3) + 'em'}}></div>
    , speedControls = showingSpeedControls &&
        <div style={{...mainStyle, display: 'flex', flexDirection: 'column', position: 'absolute', bottom: '2.3em'}}>
          <MdAdd
            onClick={() => m.speedUp()}
            {...iconProps}
          />
          <MdRemove
            onClick={() => m.speedDown()}
            {...iconProps}
          />
        </div>
      
  return (
    <div style={{...mainStyle, display: 'flex'}} >
      <PlayPause onClick={() => m.toggleRunning()} {...iconProps} />
      <Spacer />
      <StepForward onClick={() => m.stepOnce()} {...iconProps} />
      <Spacer />
      <div>
        <div style={{width: size, height: size, position: 'relative'}}>
          <MdSlowMotionVideo
            onClick={() => m.toggleShowingSpeedControls()}
            {...iconProps}
          />
          {speedControls}
        </div>
      </div>
      <Spacer />
      <MdModeEdit onClick={() => m.toggleEditing()} {...iconProps} {...editing && {style: {color: colors.controlsHighlight}}} />
      <Spacer />
      <MdMenu onClick={() => m.toggleShowingDrawer()} {...iconProps} />
    </div>
  )
}

let MainStyle = (size, colors) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: colors.controlsBackground,
  padding: size / 20 + 'em',
  borderRadius: size / 4 + 'em',
  color: colors.controlsForeground
})