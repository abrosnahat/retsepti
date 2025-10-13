"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Button } from "./ui/button";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Palette,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  onImageFilesChange?: (files: Map<string, File>) => void; // Новый prop для отслеживания файлов
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  onImageFilesChange,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageFilesRef = useRef<Map<string, File>>(new Map()); // Хранилище файлов

  // Вспомогательная функция для конвертации файла в base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Обработка файла изображения
  const processImageFile = useCallback(
    async (file: File): Promise<{ base64: string; id: string } | null> => {
      if (!file.type.startsWith("image/")) {
        alert("Пожалуйста, используйте файл изображения");
        return null;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert("Файл слишком большой. Максимальный размер 10MB");
        return null;
      }

      try {
        const base64 = await fileToBase64(file);
        const uniqueId = `temp-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Сохраняем файл для последующей загрузки
        imageFilesRef.current.set(uniqueId, file);
        if (onImageFilesChange) {
          onImageFilesChange(imageFilesRef.current);
        }

        return { base64, id: uniqueId };
      } catch (error) {
        console.error("Error processing image:", error);
        alert("Не удалось обработать изображение");
        return null;
      }
    },
    [fileToBase64, onImageFilesChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      TextStyle,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 text-gray-800",
        style: "color: #1f2937 !important;",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;

        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/")
        );

        if (imageFiles.length > 0) {
          event.preventDefault();

          imageFiles.forEach(async (file) => {
            const result = await processImageFile(file);
            if (result) {
              const { schema } = view.state;
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              if (coordinates) {
                const node = schema.nodes.image.create({
                  src: result.base64,
                  alt: result.id,
                });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              }
            }
          });

          return true;
        }

        return false;
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter((item) =>
          item.type.startsWith("image/")
        );

        if (imageItems.length > 0) {
          event.preventDefault();

          imageItems.forEach((item) => {
            const file = item.getAsFile();
            if (file) {
              processImageFile(file).then((result) => {
                if (result) {
                  editor
                    ?.chain()
                    .focus()
                    .setImage({
                      src: result.base64,
                      alt: result.id,
                    })
                    .run();
                }
              });
            }
          });

          return true;
        }

        return false;
      },
    },
  });

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const result = await processImageFile(file);
      if (result) {
        setIsUploadingImage(true);
        try {
          editor
            ?.chain()
            .focus()
            .setImage({
              src: result.base64,
              alt: result.id,
            })
            .run();

          // Очищаем input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } finally {
          setIsUploadingImage(false);
        }
      }
    },
    [editor, processImageFile]
  );

  const setColor = useCallback(() => {
    const color = window.prompt("Цвет текста (например: #ff0000)");

    if (color) {
      editor?.chain().focus().setColor(color).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white/20 backdrop-blur-md">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={
            editor.isActive("bold")
              ? "bg-gray-200 text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            editor.isActive("italic")
              ? "bg-gray-200 text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            editor.isActive("strike")
              ? "bg-gray-200 text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={
            editor.isActive("bulletList")
              ? "bg-gray-200 text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={
            editor.isActive("orderedList")
              ? "bg-gray-200 text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={
            editor.isActive({ textAlign: "left" })
              ? "bg-gray-200 text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" })
              ? "bg-gray-200 text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={
            editor.isActive({ textAlign: "right" })
              ? "bg-gray-200 text-gray-800"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          }
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addImage}
          disabled={isUploadingImage}
          className={`text-gray-700 hover:text-gray-900 hover:bg-gray-100 ${
            isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Загрузить изображение"
        >
          {isUploadingImage ? (
            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={setColor}
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose max-w-none text-gray-800"
        placeholder={placeholder}
      />
      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-200 bg-white/5">
        <span className="flex items-center gap-2">
          <ImageIcon className="h-3 w-3" />
          Совет: Изображения будут загружены на сервер после сохранения рецепта.
          Вы можете перетащить их или вставить из буфера обмена.
        </span>
      </div>
    </div>
  );
}
