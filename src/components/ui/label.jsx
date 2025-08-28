import React from 'react'

export function Label({ className = '', children, ...props }) {
  return (
    <label {...props} className={`text-sm font-medium ${className}`}>
      {children}
    </label>
  )
}


