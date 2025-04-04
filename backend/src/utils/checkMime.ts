import fs from 'node:fs/promises'

const mimeSignatures: { [key: string]: Buffer } = {
    'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47]), //fromat PNG
    'image/jpeg': Buffer.from([0xff, 0xd8, 0xff]), //format JPEG
    'image/gif': Buffer.from([0x47, 0x49, 0x46, 0x38]), //format GIF
}

export const checkMime = async (
    filePath: string
): Promise<string | null> => {
    const file = await fs.open(filePath, 'r')
    const buffer = Buffer.alloc(256)
    await file.read(buffer, 0, 256, 0)
    await file.close()

    const mime = Object.entries(mimeSignatures).find(([_, signature]) =>
        buffer.slice(0, signature.length).equals(signature)
    )

    if (mime) {
        return mime[0]
    }

    const fileContentExit = buffer.toString('utf8').trim()
    if (fileContentExit.startsWith('<?xml') || fileContentExit.startsWith('<svg')) {
        return 'image/svg+xml'
    }

    return null
}