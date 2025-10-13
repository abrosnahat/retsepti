"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";

interface ImageUploadLocalProps {
  onFileSelect: (file: File | null) => void;
  preview?: string;
}

export default function ImageUploadLocal({
  onFileSelect,
  preview,
}: ImageUploadLocalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      setError("Файл должен быть изображением");
      return;
    }

    // Проверка размера файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Файл слишком большой. Максимальный размер 10MB");
      return;
    }

    // Создание превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Передача файла родителю
    onFileSelect(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative group">
          <div className="relative w-full h-64 rounded-xl overflow-hidden">
            <Image
              src={previewUrl}
              alt="Предпросмотр изображения"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-300 backdrop-blur-sm
            ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <svg
              className="w-16 h-16 text-black/50 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-black/90 font-medium mb-2">
              Перетащите изображение или нажмите для выбора
            </p>
            <p className="text-black/50 text-sm">
              PNG, JPG, GIF до 10MB
              <br />
              <span className="text-black/40 text-xs">
                Изображение будет загружено после создания рецепта
              </span>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
