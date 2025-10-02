import fs from 'fs'
import path from 'path'

export const ensureFile = (filePath, initialData) => {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2))
  }
}

export const readJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}


