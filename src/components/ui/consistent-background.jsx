import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"

export function ConsistentBackground({ children, className = "" }) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <div className={`relative w-full min-h-screen overflow-hidden will-change-transform will-change-opacity ${className}`}>
      <div className="fixed inset-0 w-screen h-screen">
        {mounted && (
          <>
            <MeshGradient
              width={dimensions.width}
              height={dimensions.height}
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
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
