import React, { useState, useCallback } from 'react'
import { cn } from '../../../lib/utils'

// File Upload Root Component
export const FileUpload = {
  Root: ({ children, className, ...props }) => (
    <div className={cn("w-full", className)} {...props}>
      {children}
    </div>
  ),

  // Drop Zone Component
  DropZone: ({ onDropFiles, isDisabled, children, className, ...props }) => {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = useCallback((e) => {
      e.preventDefault()
      if (!isDisabled) {
        setIsDragOver(true)
      }
    }, [isDisabled])

    const handleDragLeave = useCallback((e) => {
      e.preventDefault()
      setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e) => {
      e.preventDefault()
      setIsDragOver(false)
      
      if (isDisabled) return
      
      const files = e.dataTransfer.files
      if (files.length > 0) {
        onDropFiles(files)
      }
    }, [isDisabled, onDropFiles])

    const handleFileSelect = useCallback((e) => {
      if (isDisabled) return
      
      const files = e.target.files
      if (files.length > 0) {
        onDropFiles(files)
      }
    }, [isDisabled, onDropFiles])

    return (
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          "bg-white/10 backdrop-blur-sm border-white/30",
          isDragOver && !isDisabled && "border-primary bg-primary/20",
          isDisabled && "opacity-50 cursor-not-allowed",
          !isDisabled && "cursor-pointer hover:border-white/50 hover:bg-white/20",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isDisabled && document.getElementById('file-input')?.click()}
        {...props}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
        {children || (
          <div className="space-y-4">
            <div className="text-4xl text-white">
              📁
            </div>
            <div>
              <p className="text-lg font-medium text-white drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                Drop your resume here or click to browse
              </p>
              <p className="text-sm text-white/90 font-bold drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_40%)]">
                Supports PDF and DOCX files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    )
  },

  // List Component
  List: ({ children, className, ...props }) => (
    <div className={cn("space-y-2 mt-4", className)} {...props}>
      {children}
    </div>
  ),

  // List Item with Progress Bar
  ListItemProgressBar: ({ 
    id, 
    name, 
    size, 
    progress, 
    failed, 
    onDelete, 
    onRetry,
    className,
    ...props 
  }) => (
    <div className={cn(
      "flex items-center justify-between p-3 border rounded-lg bg-white/10 backdrop-blur-sm border-white/30",
      failed && "border-destructive bg-destructive/20",
      !failed && progress === 100 && "border-green-500 bg-green-500/20",
      className
    )} {...props}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {failed ? (
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-destructive text-sm">⚠</span>
            </div>
          ) : progress === 100 ? (
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <span className="text-green-500 text-sm">✓</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-sm">📄</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {name}
          </p>
          <p className="text-xs text-white/80">
            {getReadableFileSize(size)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {progress < 100 && !failed && (
          <div className="w-16">
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {failed && (
          <button
            onClick={onRetry}
            className="text-xs text-white hover:text-white/80 px-2 py-1 rounded"
          >
            Retry
          </button>
        )}

        <button
          onClick={onDelete}
          className="text-xs text-white/80 hover:text-white px-2 py-1 rounded"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

// Utility function to format file size
export const getReadableFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
