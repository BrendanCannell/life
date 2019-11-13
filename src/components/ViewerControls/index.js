import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {ViewerState} from "../../redux"
import {MdPause, MdPlayArrow, MdSlowMotionVideo, MdAdd, MdRemove, MdModeEdit} from 'react-icons/md'
import StepForward from "../icons/StepForward"

export default function Controls(props) {
  let {size, colors, toggleEditing, toggleRunning, toggleShowingSpeedControls, speedUp, speedDown, stepOnce} = props
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
            onClick={() => speedUp()}
            {...iconProps}
          />
          <MdRemove
            onClick={() => speedDown()}
            {...iconProps}
          />
        </div>
      
  return (
    <div style={{...mainStyle, display: 'flex'}} >
      <PlayPause onClick={() => toggleRunning()} {...iconProps} />
      <Spacer />
      <StepForward onClick={() => stepOnce()} {...iconProps} />
      <Spacer />
      <div>
        <div style={{width: size, height: size, position: 'relative'}}>
          <MdSlowMotionVideo
            onClick={() => toggleShowingSpeedControls()}
            {...iconProps}
          />
          {speedControls}
        </div>
      </div>
      <Spacer />
      <MdModeEdit onClick={() => toggleEditing()} {...iconProps} {...editing && {style: {color: colors.controlsHighlight}}} />
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