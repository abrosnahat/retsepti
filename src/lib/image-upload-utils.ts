/**
 * Утилиты для обработки изображений в Rich Text Editor
 */

/**
 * Загружает изображения из Map на Cloudinary и возвращает обновленный HTML контент
 * @param content - HTML контент с base64 изображениями
 * @param imageFiles - Map с файлами изображений (ключ = uniqueId из alt)
 * @returns Promise с обновленным HTML где base64 заменены на Cloudinary URLs
 */
export async function uploadImagesInContent(
  content: string,
  imageFiles: Map<string, File>
): Promise<string> {
  if (!imageFiles || imageFiles.size === 0) {
    return content;
  }

  let updatedContent = content;
  const uploadPromises: Promise<void>[] = [];

  // Находим все изображения с временными ID в alt
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const images = doc.querySelectorAll('img[alt^="temp-"]');

  images.forEach((img) => {
    const altId = img.getAttribute("alt");
    if (!altId) return;

    const file = imageFiles.get(altId);
    if (!file) return;

    const uploadPromise = (async () => {
      try {
        // Загружаем файл на Cloudinary
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Ошибка загрузки изображения");
        }

        const data = await response.json();

        // Заменяем base64 на Cloudinary URL
        const oldSrc = img.getAttribute("src");
        if (oldSrc) {
          updatedContent = updatedContent.replace(
            new RegExp(
              `<img[^>]*src="${oldSrc.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              )}"[^>]*alt="${altId}"[^>]*>`,
              "g"
            ),
            `<img src="${data.url}" alt="" class="max-w-full h-auto rounded-lg">`
          );
        }
      } catch (error) {
        console.error(`Ошибка загрузки изображения ${altId}:`, error);
        // Можно оставить base64 или удалить изображение
        // Пока оставляем как есть
      }
    })();

    uploadPromises.push(uploadPromise);
  });

  // Ждем завершения всех загрузок
  await Promise.all(uploadPromises);

  return updatedContent;
}

/**
 * Извлекает все изображения из HTML контента
 * @param content - HTML контент
 * @returns Массив объектов с информацией об изображениях
 */
export function extractImagesFromContent(content: string): Array<{
  src: string;
  alt: string;
  isBase64: boolean;
  isTempFile: boolean;
}> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");
  const images = doc.querySelectorAll("img");

  return Array.from(images).map((img) => ({
    src: img.getAttribute("src") || "",
    alt: img.getAttribute("alt") || "",
    isBase64: img.getAttribute("src")?.startsWith("data:image/") || false,
    isTempFile: img.getAttribute("alt")?.startsWith("temp-") || false,
  }));
}

/**
 * Проверяет, есть ли в контенте изображения, требующие загрузки
 * @param content - HTML контент
 * @returns true если есть base64 изображения с временными ID
 */
export function hasUnuploadedImages(content: string): boolean {
  const images = extractImagesFromContent(content);
  return images.some((img) => img.isBase64 && img.isTempFile);
}
