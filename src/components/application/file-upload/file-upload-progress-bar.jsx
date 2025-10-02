import { useState } from "react"
import { FileUpload, getReadableFileSize } from "./file-upload-base"

const uploadFile = (file, onProgress) => {
  // Add your upload logic here...
  
  // This is dummy upload logic
  let progress = 0
  const interval = setInterval(() => {
    onProgress(++progress)
    if (progress === 100) {
      clearInterval(interval)
    }
  }, 100)
}

const placeholderFiles = [
  {
    id: "file-01",
    name: "Example dashboard screenshot.jpg",
    type: "jpg",
    size: 720 * 1024,
    progress: 50,
  },
  {
    id: "file-02",
    name: "Tech design requirements_2.pdf",
    type: "pdf",
    size: 720 * 1024,
    progress: 100,
  },
  {
    id: "file-03",
    name: "Tech design requirements.pdf",
    type: "pdf",
    failed: true,
    size: 1024 * 1024 * 1,
    progress: 0,
  },
]

export const FileUploadProgressBar = ({ isDisabled = false, onFileUpload }) => {
  const [uploadedFiles, setUploadedFiles] = useState([])

  const handleDropFiles = (files) => {
    const newFiles = Array.from(files)
    const newFilesWithIds = newFiles.map((file) => ({
      id: Math.random().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      fileObject: file,
    }))

    setUploadedFiles([...newFilesWithIds.map(({ fileObject: _, ...file }) => file), ...uploadedFiles])

    newFilesWithIds.forEach(({ id, fileObject }) => {
      // Call the custom upload handler if provided
      if (onFileUpload) {
        onFileUpload(fileObject)
      } else {
        // Use default upload logic
        uploadFile(fileObject, (progress) => {
          setUploadedFiles((prev) => prev.map((uploadedFile) => (uploadedFile.id === id ? { ...uploadedFile, progress } : uploadedFile)))
        })
      }
    })
  }

  const handleDeleteFile = (id) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleRetryFile = (id) => {
    const file = uploadedFiles.find((file) => file.id === id)
    if (!file) return

    uploadFile(new File([], file.name, { type: file.type }), (progress) => {
      setUploadedFiles((prev) => prev.map((uploadedFile) => (uploadedFile.id === id ? { ...uploadedFile, progress, failed: false } : uploadedFile)))
    })
  }

  return (
    <FileUpload.Root>
      <FileUpload.DropZone isDisabled={isDisabled} onDropFiles={handleDropFiles} />
      {/* File list removed - no longer showing uploaded files */}
    </FileUpload.Root>
  )
}
