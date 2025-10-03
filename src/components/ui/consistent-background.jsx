import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useRef, useState } from "react"

export function ConsistentBackground({ children, className = "" }) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [mounted, setMounted] = useState(false)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(1080)

  useEffect(() => {
    setMounted(true)

    const updateViewport = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight })

    const observeContent = () => {
      if (!contentRef.current) return
      const measure = () => {
        if (!contentRef.current) return
        const rect = contentRef.current.getBoundingClientRect()
        // Add some padding to cover below-the-fold overscroll
        setContentHeight(Math.max(document.documentElement.scrollHeight, rect.height + 200))
      }
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(contentRef.current)
      return () => ro.disconnect()
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    const cleanupRO = observeContent()
    return () => {
      window.removeEventListener("resize", updateViewport)
      cleanupRO && cleanupRO()
    }
  }, [])

  // Background height should at least match viewport and content
  const bgHeight = Math.max(dimensions.height, contentHeight)

  return (
    <div className={`relative w-full min-h-screen overflow-hidden will-change-transform will-change-opacity ${className}`}>
      <div className="absolute top-0 left-0 w-full" style={{ height: bgHeight }}>
        {mounted && (
          <>
            <MeshGradient
              width={dimensions.width}
              height={bgHeight}
              colors={["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"]}
              distortion={1.2}
              swirl={0.8}
              grainMixer={0}
              grainOverlay={0}
              speed={0.5}
              offsetX={0.1}
            />
            <div className="absolute inset-0 pointer-events-none bg-black/20" />
          </>
        )}
      </div>
      
      <div ref={contentRef} className="relative z-10">
        {children}
      </div>
    </div>
  )
}
