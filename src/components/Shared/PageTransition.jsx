import React, { useEffect, useState } from 'react'

const PageTransition = ({ children }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation on mount
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className={
        `transition-transform duration-300 ease-out will-change-transform ` +
        (visible ? 'translate-y-0' : 'translate-y-2')
      }
      style={{ opacity: 1 }}
    >
      {children}
    </div>
  )
}

export default PageTransition


