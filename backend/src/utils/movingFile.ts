import { existsSync, rename } from 'fs'
import { basename, join, normalize, resolve } from 'path'

function movingFile(imagePath: string, from: string, to: string) {
    const fileName = basename(imagePath)
    const imagePathFolder = join(from, fileName)
    const imagePathTrue = join(to, fileName)
    const correctImagePathTemp = normalize(imagePathFolder)
    const correctImagePathTrue = normalize(imagePathTrue)

    if (!correctImagePathTemp.startsWith(resolve(from))) {
        throw new Error('Неверный путь к временной папке')
    }
    if (!correctImagePathTrue.startsWith(resolve(to))) {
        throw new Error('Неверный путь к постоянной папке')
    }

    if (!existsSync(correctImagePathTemp)) {
        throw new Error('Файл не найден')
    }

    rename(correctImagePathTemp, correctImagePathTrue, (err) => {
        if (err) {
            throw new Error('Ошибка при сохранении файла')
        }
    })
}

export default movingFile
