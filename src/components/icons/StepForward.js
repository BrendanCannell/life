import React from 'react'

export default function StepForward(props) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      {...props}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8z
        M 11.7 17.7
        v -4.4
        l -1.3 .4
        v -.9
        l 2.4 -.8
        v 5.7
        z"
      />
    </svg>
  )
}