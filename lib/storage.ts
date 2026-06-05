import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const UPLOAD_DIRECTORY = path.join(process.cwd(), 'public', 'uploads', 'cards')

function getExtension(file: File) {
  const filename = file.name || 'image'
  const extension = path.extname(filename)

  if (extension) {
    return extension.toLowerCase()
  }

  if (file.type === 'image/png') return '.png'
  if (file.type === 'image/webp') return '.webp'
  return '.jpg'
}

export async function saveCardImage(file: File, id: string) {
  await mkdir(UPLOAD_DIRECTORY, { recursive: true })

  const extension = getExtension(file)
  const fileName = `${id}${extension}`
  const filePath = path.join(UPLOAD_DIRECTORY, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(filePath, buffer)

  return {
    fileName,
    publicUrl: `/uploads/cards/${fileName}`,
  }
}

export async function removeCardImage(publicUrl: string | null | undefined) {
  if (!publicUrl || !publicUrl.startsWith('/uploads/cards/')) {
    return
  }

  const filePath = path.join(process.cwd(), 'public', publicUrl.replace(/^\//, ''))

  try {
    await unlink(filePath)
  } catch {
    // Ignore missing files from previous runs or manual cleanup.
  }
}
