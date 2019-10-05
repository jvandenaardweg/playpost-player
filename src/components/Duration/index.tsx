import React from 'react'

interface Props {
  className?: string;
  seconds: number;
}

export const Duration: React.FC<Props> = ({ className, seconds }) => {
  return (
    <time dateTime={`P${Math.round(seconds)}S`} className={className}>
      {format(seconds)}
    </time>
  )
}

function format (seconds: number) {
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = pad(date.getUTCSeconds())
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`
  }
  return `${mm}:${ss}`
}

function pad (number: number) {
  return ('0' + number).slice(-2)
}
