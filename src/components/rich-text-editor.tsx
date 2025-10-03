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
import { useCallback } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
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
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt("URL изображения");

    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

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
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
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
    </div>
  );
}
