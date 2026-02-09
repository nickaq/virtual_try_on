import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';

export async function uploadFile(file: File, subfolder: string = ''): Promise<string> {
    try {
        // Створити директорію якщо не існує
        const uploadPath = join(process.cwd(), UPLOAD_DIR, subfolder);
        await mkdir(uploadPath, { recursive: true });

        // Генерувати унікальне ім'я файлу
        const fileExt = file.name.split('.').pop();
        const fileName = `${nanoid()}.${fileExt}`;
        const filePath = join(uploadPath, fileName);

        // Конвертувати File -> Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Зберегти файл
        await writeFile(filePath, buffer);

        // Повернути публічний URL
        return `/uploads/${subfolder}/${fileName}`;

    } catch (error) {
        console.error('File upload error:', error);
        throw new Error('Помилка завантаження файлу');
    }
}

export async function scheduleFileDeletion(filePath: string, deleteAt: Date): Promise<void> {
    // TODO: Імплементувати черга видалення файлів
    // Можна використати cron job або background worker
    console.log(`Заплановано видалення ${filePath} на ${deleteAt}`);
}
