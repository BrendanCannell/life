import React, {useState} from 'react'
import {MdPause, MdPlayArrow, MdSlowMotionVideo, MdAdd, MdRemove, MdModeEdit} from 'react-icons/md'
import StepForward from "../icons/StepForward"

export default function Controls(props) {
  let {size, running, editing, ToggleRunning, ToggleEditing, SpeedUp, SpeedDown, StepOnce} = props
    , [showSpeedUpDown, SetShowSpeedUpDown] = useState(false)
    , ems = parseInt(size)
    , mainStyle = MainStyle(ems)
    , iconProps = {
        size, // for react-icons
        width: size,
        height: size
      }
    , PlayPause = running ? MdPause : MdPlayArrow
    , Spacer = () => <div style={{width: (ems / 3) + 'em'}}></div>
    , speedUpDown = showSpeedUpDown &&
        <div style={{...mainStyle, display: 'flex', flexDirection: 'column', position: 'absolute', bottom: '2.3em'}}>
          <MdAdd
            onClick={SpeedUp}
            {...iconProps}
          />
          <MdRemove
            onClick={SpeedDown}
            {...iconProps}
          />
        </div>
      
  return (
    <div style={{...mainStyle, display: 'flex'}} >
      <PlayPause onClick={ToggleRunning} {...iconProps} />
      <Spacer />
      <StepForward onClick={StepOnce} {...iconProps} />
      <Spacer />
      <div>
        <div style={{width: size, height: size, position: 'relative'}}>
          <MdSlowMotionVideo
            onClick={() => SetShowSpeedUpDown(!showSpeedUpDown)}
            {...iconProps}
          />
          {speedUpDown}
        </div>
      </div>
      <Spacer />
      <MdModeEdit onClick={ToggleEditing} {...iconProps} {...editing && {style: {color: 'red'}}} />
    </div>
  )
}

let MainStyle = ems => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(50,50,50,0.95)',
  padding: ems / 20 + 'em',
  borderRadius: ems / 4 + 'em',
  color: 'rgb(240,240,240)'
})