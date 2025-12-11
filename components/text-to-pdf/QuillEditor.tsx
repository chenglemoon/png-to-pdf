"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import FontFamily from "@tiptap/extension-font-family";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Link as LinkIcon,
  Code,
  Quote,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Image as ImageIcon,
  Plus,
  ChevronDown,
  CheckSquare,
  Minus,
  Type,
  Minus as MinusIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Extension } from "@tiptap/core";

// 自定义字号扩展
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => {
              const fontSize = element.style.fontSize;
              if (!fontSize) return null;
              // 提取数字部分
              const match = fontSize.match(/(\d+(?:\.\d+)?)/);
              return match ? match[1] : null;
            },
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string | number) => ({ chain, tr, state }) => {
        const size = typeof fontSize === 'string' 
          ? fontSize.replace(/px/gi, '').trim() 
          : String(fontSize);
        
        if (!size || isNaN(Number(size))) {
          return false;
        }

        return chain()
          .setMark('textStyle', { fontSize: size })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// 高亮扩展
const Highlight = Extension.create({
  name: 'highlight',
  addOptions() {
    return {
      multicolor: false,
      HTMLAttributes: {},
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor || null,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setHighlight: (color: string) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { backgroundColor: color })
          .run();
      },
      unsetHighlight: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { backgroundColor: null })
          .removeEmptyTextStyle()
          .run();
      },
    } as any;
  },
});

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onWordCountChange?: (words: number, characters: number) => void;
  onActiveTagChange?: (tag: string) => void;
  wordCount?: number;
  charCount?: number;
  activeTag?: string;
}

export default function QuillEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className = "text-editor",
  onWordCountChange,
  onActiveTagChange,
  wordCount = 0,
  charCount = 0,
  activeTag = "p",
}: QuillEditorProps) {
  const t = useTranslations("TextToPdf");
  const [isMounted, setIsMounted] = useState(false);
  const [localWordCount, setLocalWordCount] = useState(0);
  const [localCharCount, setLocalCharCount] = useState(0);
  const [localActiveTag, setLocalActiveTag] = useState("p");
  const [fontSize, setFontSize] = useState(16);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(0);

  // HSL 转 RGB
  const hslToRgb = useCallback((h: number, s: number, l: number): [number, number, number] => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return [r, g, b];
  }, []);

  // RGB 转 Hex
  const rgbToHex = useCallback((r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }, []);

  // Hex 转 HSL
  const hexToHsl = useCallback((hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  }, []);

  // 更新颜色
  const updateColor = useCallback((newHue: number, newSaturation: number, newLightness: number) => {
    setHue(newHue);
    setSaturation(newSaturation);
    setLightness(newLightness);
    const [r, g, b] = hslToRgb(newHue, newSaturation, newLightness);
    const hex = rgbToHex(r, g, b);
    setSelectedColor(hex);
  }, [hslToRgb, rgbToHex]);

  // Hex 输入变化
  const handleHexChange = useCallback((hex: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setSelectedColor(hex);
      const [h, s, l] = hexToHsl(hex);
      setHue(h);
      setSaturation(s);
      setLightness(l);
    }
  }, [hexToHsl]);

  // 提取纯文本用于统计
  const extractText = useCallback((html: string): string => {
    if (typeof window === 'undefined') return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        link: false,
        underline: false,
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Highlight,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      HorizontalRule,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // 更新字数统计
      const text = extractText(html);
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const characters = text.length;
      setLocalWordCount(words);
      setLocalCharCount(characters);
      onWordCountChange?.(words, characters);

      // 更新当前标签
      let tag = "p";
      if (editor.isActive('heading', { level: 1 })) {
        tag = "h1";
      } else if (editor.isActive('heading', { level: 2 })) {
        tag = "h2";
      } else if (editor.isActive('heading', { level: 3 })) {
        tag = "h3";
      } else if (editor.isActive('heading', { level: 4 })) {
        tag = "h4";
      } else if (editor.isActive('heading', { level: 5 })) {
        tag = "h5";
      } else if (editor.isActive('heading', { level: 6 })) {
        tag = "h6";
      }
      setLocalActiveTag(tag);
      onActiveTagChange?.(tag);

      // 更新字体大小显示
      const { fontSize: currentFontSize } = editor.getAttributes('textStyle');
      if (currentFontSize) {
        const size = typeof currentFontSize === 'string' 
          ? parseInt(currentFontSize.replace('px', '')) 
          : parseInt(String(currentFontSize));
        if (!isNaN(size) && size > 0) {
          setFontSize(size);
        }
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // 当选择改变时更新字体大小显示
      const { fontSize: currentFontSize } = editor.getAttributes('textStyle');
      if (currentFontSize) {
        const size = typeof currentFontSize === 'string' 
          ? parseInt(currentFontSize.replace('px', '')) 
          : parseInt(String(currentFontSize));
        if (!isNaN(size) && size > 0) {
          setFontSize(size);
        } else {
          setFontSize(16);
        }
      } else {
        // 如果没有设置字体大小，使用默认值
        setFontSize(16);
      }

      // 更新当前选中文本的颜色
      const { color: currentColor } = editor.getAttributes('textStyle');
      if (currentColor && showColorPicker) {
        setSelectedColor(currentColor);
        const [h, s, l] = hexToHsl(currentColor);
        setHue(h);
        setSaturation(s);
        setLightness(l);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
        style: 'font-size: inherit;',
      },
    },
  });

  // 处理图片上传
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        editor.chain().focus().setImage({ src: base64 }).run();
      }
    };
    reader.onerror = () => {
      alert('Failed to read image file');
    };
    reader.readAsDataURL(file);

    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [editor]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      // 更新初始字数统计
      const text = extractText(value);
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
      const characters = text.length;
      setLocalWordCount(words);
      setLocalCharCount(characters);
      onWordCountChange?.(words, characters);
    }
  }, [value, editor, extractText, onWordCountChange]);

  if (!isMounted || !editor) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        Loading editor...
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-[16px] border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col ${className}`}>
      {/* 工具栏 - Tiptap 风格 */}
      <div className="border-b border-gray-200/60 bg-gray-50/30 px-4 py-3 flex items-center gap-1 flex-wrap">
        {/* 撤销/重做组 */}
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors disabled:opacity-40 text-black"
            title="Undo"
          >
            <Undo className="w-5 h-5 text-black" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors disabled:opacity-40 text-black"
            title="Redo"
          >
            <Redo className="w-5 h-5 text-black" />
          </Button>
        </div>

        {/* Normal 下拉菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 px-3 hover:bg-gray-200/60 rounded-sm transition-colors text-black text-base font-normal"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 flex items-center justify-center text-black">
                  {editor.isActive('heading', { level: 1 }) && <span className="text-sm font-bold text-black">H1</span>}
                  {editor.isActive('heading', { level: 2 }) && <span className="text-sm font-bold text-black">H2</span>}
                  {editor.isActive('heading', { level: 3 }) && <span className="text-sm font-bold text-black">H3</span>}
                  {editor.isActive('orderedList') && <ListOrdered className="w-5 h-5 text-black" />}
                  {editor.isActive('bulletList') && <List className="w-5 h-5 text-black" />}
                  {editor.isActive('taskList') && <CheckSquare className="w-5 h-5 text-black" />}
                  {editor.isActive('blockquote') && <Quote className="w-5 h-5 text-black" />}
                  {editor.isActive('codeBlock') && <Code className="w-5 h-5 text-black" />}
                  {!editor.isActive('heading') && !editor.isActive('orderedList') && !editor.isActive('bulletList') && !editor.isActive('taskList') && !editor.isActive('blockquote') && !editor.isActive('codeBlock') && <span className="text-sm text-black">¶</span>}
                </div>
                <span className="text-black">
                  {editor.isActive('heading', { level: 1 }) ? 'H1 Heading 1' :
                   editor.isActive('heading', { level: 2 }) ? 'H2 Heading 2' :
                   editor.isActive('heading', { level: 3 }) ? 'H3 Heading 3' :
                   editor.isActive('orderedList') ? 'Numbered List' :
                   editor.isActive('bulletList') ? 'Bullet List' :
                   editor.isActive('taskList') ? 'Check List' :
                   editor.isActive('blockquote') ? 'Quote' :
                   editor.isActive('codeBlock') ? 'Code Block' :
                   'Normal'}
                </span>
                <ChevronDown className="w-4 h-4 text-black" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={!editor.isActive('heading') && !editor.isActive('orderedList') && !editor.isActive('bulletList') && !editor.isActive('taskList') && !editor.isActive('blockquote') && !editor.isActive('codeBlock') ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-sm text-black">¶</span>
                  </div>
                  <span className="text-black text-base">Normal</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Alt+0</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-sm font-bold text-black">H1</span>
                  </div>
                  <span className="text-black text-base">H1 Heading 1</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Alt+1</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-sm font-bold text-black">H2</span>
                  </div>
                  <span className="text-black text-base">H2 Heading 2</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Alt+2</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-sm font-bold text-black">H3</span>
                  </div>
                  <span className="text-black text-base">H3 Heading 3</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Alt+3</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-black" />
                  <span className="text-black text-base">Numbered List</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Shift+7</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <List className="w-5 h-5 text-black" />
                  <span className="text-black text-base">Bullet List</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Shift+8</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={editor.isActive('taskList') ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-black" />
                  <span className="text-black text-base">Check List</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Shift+9</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Quote className="w-5 h-5 text-black" />
                  <span className="text-black text-base">Quote</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Shift+Q</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'bg-gray-100' : ''}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-black" />
                  <span className="text-black text-base">Code Block</span>
                </div>
                <span className="text-xs text-gray-500">Ctrl+Alt+C</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 字体大小调整器 */}
        <div className="flex items-center border border-gray-300/50 rounded-sm h-10">
          <button
            type="button"
            onClick={() => {
              if (!editor) return;
              const newSize = Math.max(8, fontSize - 1);
              setFontSize(newSize);
              editor.chain().focus().setFontSize(newSize.toString()).run();
            }}
            className="h-full px-3 hover:bg-gray-200/60 flex items-center justify-center text-black transition-colors"
            title="Decrease font size"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300/50"></div>
          <div className="px-3 text-base text-black font-medium min-w-[3rem] text-center">
            {fontSize}
          </div>
          <div className="w-px h-6 bg-gray-300/50"></div>
          <button
            type="button"
            onClick={() => {
              if (!editor) return;
              const newSize = Math.min(72, fontSize + 1);
              setFontSize(newSize);
              editor.chain().focus().setFontSize(newSize.toString()).run();
            }}
            className="h-full px-3 hover:bg-gray-200/60 flex items-center justify-center text-black transition-colors"
            title="Increase font size"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300/50 mx-1" />

        {/* 对齐组 */}
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-black ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Align Left"
          >
            <AlignLeft className="w-5 h-5 text-black" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`h-8 w-8 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-black ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Align Center"
          >
            <AlignCenter className="w-5 h-5 text-black" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`h-8 w-8 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-black ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Align Right"
          >
            <AlignRight className="w-5 h-5 text-black" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`h-8 w-8 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-black ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Justify"
          >
            <AlignJustify className="w-5 h-5 text-black" />
          </Button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300/50 mx-1" />

        {/* 列表组 */}
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-black ${editor.isActive('bulletList') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Bullet List"
          >
            <List className="w-5 h-5 text-black" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-black ${editor.isActive('orderedList') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Numbered List"
          >
            <ListOrdered className="w-5 h-5 text-black" />
          </Button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300/50 mx-1" />

        {/* 文本格式组 */}
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors font-bold text-base text-black ${editor.isActive('bold') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Bold"
          >
            B
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors italic text-base text-black ${editor.isActive('italic') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Italic"
          >
            I
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors line-through text-base text-black ${editor.isActive('strike') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Strikethrough"
          >
            S
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-sm text-black ${editor.isActive('code') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Inline Code"
          >
            &lt; &gt;
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors underline text-base text-black ${editor.isActive('underline') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Underline"
          >
            U
          </Button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300/50 mx-1" />

        {/* 链接 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-black ${editor.isActive('link') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
          title="Link"
        >
            <LinkIcon className="w-5 h-5 text-black" />
        </Button>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300/50 mx-1" />

        {/* 字体颜色选择器 */}
        <Popover 
          open={showColorPicker} 
          onOpenChange={(open) => {
            setShowColorPicker(open);
            if (open && editor) {
              // 打开时读取当前选中文本的颜色
              const { color: currentColor } = editor.getAttributes('textStyle');
              if (currentColor) {
                setSelectedColor(currentColor);
                const [h, s, l] = hexToHsl(currentColor);
                setHue(h);
                setSaturation(s);
                setLightness(l);
              } else {
                setSelectedColor("#000000");
                setHue(0);
                setSaturation(100);
                setLightness(0);
              }
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 px-3 hover:bg-gray-200/60 rounded-sm transition-colors text-black text-base font-bold"
              title="Text Color"
            >
              <span className="text-base font-bold text-black">A</span>
              <ChevronDown className="w-4 h-4 text-black ml-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {/* Hex 输入 */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600 w-8">Hex</Label>
                <Input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="flex-1 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>

              {/* 预定义颜色色板 */}
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1.5">
                  {['#FF0000', '#FFA500', '#FFFF00', '#8B4513', '#00FF00', '#006400', '#800080'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        handleHexChange(color);
                        editor.chain().focus().setColor(color).run();
                      }}
                      className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                        selectedColor.toUpperCase() === color.toUpperCase() 
                          ? 'border-gray-800 shadow-md' 
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {['#FF00FF', '#00BFFF', '#008080', '#90EE90', '#000000', '#808080', '#D3D3D3'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        handleHexChange(color);
                        editor.chain().focus().setColor(color).run();
                      }}
                      className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                        selectedColor.toUpperCase() === color.toUpperCase() 
                          ? 'border-gray-800 shadow-md' 
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                {/* 空色板（透明选项） */}
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 rounded border-2 border-gray-300 bg-white hover:scale-110 transition-all"
                  title="No color"
                />
              </div>

              {/* 主颜色选择区域 */}
              <div className="relative">
                <div
                  className="w-full h-48 rounded border border-gray-300 cursor-crosshair relative overflow-hidden"
                  style={{
                    background: `linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, hsl(${hue}, 100%, 50%))`,
                  }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
                    updateColor(hue, x * 100, (1 - y) * 100);
                    const handleMove = (moveEvent: MouseEvent) => {
                      const newX = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                      const newY = Math.max(0, Math.min(1, (moveEvent.clientY - rect.top) / rect.height));
                      updateColor(hue, newX * 100, (1 - newY) * 100);
                    };
                    const handleUp = () => {
                      document.removeEventListener('mousemove', handleMove);
                      document.removeEventListener('mouseup', handleUp);
                    };
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleUp);
                  }}
                >
                  <div
                    className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none"
                    style={{
                      left: `${saturation}%`,
                      top: `${100 - lightness}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>
              </div>

              {/* 色相滑块 */}
              <div className="relative">
                <div
                  className="w-full h-4 rounded border border-gray-300 cursor-pointer relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                  }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const newHue = x * 360;
                    updateColor(newHue, saturation, lightness);
                    const handleMove = (moveEvent: MouseEvent) => {
                      const newX = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                      const newHue = newX * 360;
                      updateColor(newHue, saturation, lightness);
                    };
                    const handleUp = () => {
                      document.removeEventListener('mousemove', handleMove);
                      document.removeEventListener('mouseup', handleUp);
                    };
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleUp);
                  }}
                >
                  <div
                    className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none top-1/2 -translate-y-1/2"
                    style={{
                      left: `${(hue / 360) * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              </div>

              {/* 亮度滑块 */}
              <div className="relative">
                <div
                  className="w-full h-4 rounded border border-gray-300 cursor-pointer relative overflow-hidden"
                  style={{
                    background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 100%))`,
                  }}
                  onMouseDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const newLightness = x * 100;
                    updateColor(hue, saturation, newLightness);
                    const handleMove = (moveEvent: MouseEvent) => {
                      const newX = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                      const newLightness = newX * 100;
                      updateColor(hue, saturation, newLightness);
                    };
                    const handleUp = () => {
                      document.removeEventListener('mousemove', handleMove);
                      document.removeEventListener('mouseup', handleUp);
                    };
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleUp);
                  }}
                >
                  <div
                    className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none top-1/2 -translate-y-1/2"
                    style={{
                      left: `${lightness}%`,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
              </div>

              {/* 应用按钮 */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColorPicker(false)}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    editor.chain().focus().setColor(selectedColor).run();
                    setShowColorPicker(false);
                  }}
                >
                  应用
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300/50 mx-1" />

        {/* 上标和下标 */}
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-sm text-black ${editor.isActive('superscript') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Superscript"
          >
            x²
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`h-10 w-10 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-sm text-black ${editor.isActive('subscript') ? 'bg-gray-200/80 border border-gray-300/50' : ''}`}
            title="Subscript"
          >
            x₂
          </Button>
        </div>

        {/* 右侧按钮组 */}
        <div className="ml-auto flex items-center gap-0.5">
          {/* Insert Image 按钮 */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            className="h-10 px-3 hover:bg-gray-200/60 rounded-sm transition-colors text-black text-base"
            title="Insert Image"
          >
            <ImageIcon className="w-5 h-5 mr-1 text-black" />
            <span className="text-black">Insert Image</span>
          </Button>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

            {/* 编辑器内容区域 */}
            <div className="bg-white min-h-[500px] max-h-[600px] overflow-y-auto">
              <EditorContent editor={editor} />
            </div>

      {/* 底部按钮栏 */}
      <div className="border-t border-gray-200 px-4 py-2 flex justify-between items-center bg-gray-50/50">
        {/* 左侧：上传按钮 - 默认显示 */}
        <div className="flex-1 flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && editor) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  if (text) {
                    const currentContent = editor.getText();
                    editor.commands.insertContent(currentContent ? "\n\n" + text : text);
                  }
                };
                reader.readAsText(file);
              }
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-3 hover:bg-blue-50 rounded-sm transition-colors text-blue-600 font-medium"
            title="Update Text File"
          >
            <Upload className="w-4 h-4 mr-1 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Update Text File</span>
          </Button>
        </div>
        {/* 右侧：清除按钮 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (editor) {
              editor.commands.clearContent();
            }
          }}
          className="h-8 w-8 p-0 hover:bg-gray-200/60 rounded-sm transition-colors text-gray-600"
          title="Clear All"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <style jsx global>{`
        /* TaskList 样式 */
        ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          margin: 0.25rem 0;
        }
        ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
          display: flex;
          align-items: center;
        }
        ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
          display: flex;
          align-items: center;
        }
        ul[data-type="taskList"] input[type="checkbox"] {
          cursor: pointer;
          width: 1rem;
          height: 1rem;
          margin: 0;
        }
        ul[data-type="taskList"] li[data-checked="true"] > div {
          text-decoration: line-through;
          opacity: 0.6;
        }
        ul[data-type="taskList"] li > div > p {
          margin: 0;
          line-height: 1.5;
        }
      `}</style>

    </div>
  );
}
