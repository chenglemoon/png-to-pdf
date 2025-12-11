"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, FileText, Loader2, X, Upload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument, PageSizes, StandardFonts, rgb } from "pdf-lib";
import { toast } from "sonner";
import QuillEditor from "./QuillEditor";

export default function HeroSection() {
  const t = useTranslations("TextToPdf");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showEditor, setShowEditor] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [activeTag, setActiveTag] = useState("P");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [pageMargin, setPageMargin] = useState("30");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 读取文本文件内容
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file, 'UTF-8');
    });
  };

  // 从 HTML 提取纯文本
  const extractTextFromHtml = useCallback((html: string): string => {
    if (typeof window === 'undefined') return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }, []);

  // 解析 HTML 表格
  const parseTable = useCallback((tableElement: HTMLTableElement) => {
    const rows: string[][] = [];
    const trElements = tableElement.querySelectorAll('tr');
    
    trElements.forEach((tr) => {
      const row: string[] = [];
      const cells = tr.querySelectorAll('td, th');
      cells.forEach((cell) => {
        const text = cell.textContent || '';
        row.push(text.trim());
      });
      if (row.length > 0) {
        rows.push(row);
      }
    });
    
    return rows;
  }, []);

  // 计算字数和字符数
  const updateCounts = useCallback((html: string) => {
    const text = extractTextFromHtml(html);
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(text.length);
  }, []);

  // 验证文件类型
  const validateFile = useCallback((file: File): boolean => {
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.txt')) {
      toast.error(t("errors.notText"));
      return false;
    }

    // 验证文件大小 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t("errors.fileTooLarge"));
      return false;
    }

    return true;
  }, [t]);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    try {
      const textContent = await readFileAsText(file);
      // 如果编辑器已有内容，追加新内容；否则替换
      if (editorContent.trim()) {
        setEditorContent(editorContent + "\n\n" + textContent);
      } else {
        setEditorContent(textContent);
      }
      setShowEditor(true);
      setShowSettings(false);
      const newContent = editorContent.trim() ? editorContent + "\n\n" + textContent : textContent;
      updateCounts(newContent);
      toast.success(t("messages.filesAdded", { count: 1 }));
    } catch (error) {
      console.error("读取文件失败:", error);
      toast.error(t("errors.readFileFailed", { fileName: file.name }));
    }
  }, [t, validateFile, updateCounts, editorContent]);

  // 处理文件选择
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    if (fileArray.length > 0) {
      handleFileUpload(fileArray[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [handleFileUpload]);

  // 处理 Proceed 按钮
  const handleProceed = useCallback(() => {
    const text = extractTextFromHtml(editorContent);
    if (text.trim().length === 0) {
      toast.error(t("errors.noFiles"));
      return;
    }
    // Proceed 后显示 PDF 设置
    setShowSettings(true);
  }, [editorContent, t]);

  // 转换文本为 PDF
  const convertToPdf = useCallback(async () => {
    if (editorContent.trim().length === 0) {
      toast.error(t("errors.noFiles"));
      return;
    }

    setIsConverting(true);

    try {
      // 创建 PDF 文档
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // 获取页面尺寸
      let [pageWidth, pageHeight] = PageSizes[pageSize as keyof typeof PageSizes];
      if (orientation === "landscape" && pageWidth < pageHeight) {
        [pageWidth, pageHeight] = [pageHeight, pageWidth];
      } else if (orientation === "portrait" && pageWidth > pageHeight) {
        [pageWidth, pageHeight] = [pageWidth, pageHeight];
      }

      const margin = parseFloat(pageMargin);
      const textWidth = pageWidth - margin * 2;
      const fontSize = 12;
      const lineHeight = fontSize * 1.3;
      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      // 解析 HTML 内容
      if (typeof window === 'undefined') {
        throw new Error('Window is not defined');
      }
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editorContent;

      // 检查文本是否包含非 ASCII 字符（如中文）
      const containsNonAscii = (text: string): boolean => {
        return /[^\x00-\x7F]/.test(text);
      };

      // 使用 Canvas 渲染文本为图片（高分辨率）
      const renderTextAsImage = async (text: string, textSize: number, isBold: boolean = false): Promise<Uint8Array> => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法创建 Canvas 上下文');

        // 使用高 DPI 缩放因子提高清晰度
        const scale = 2; // 2倍分辨率
        const scaledTextSize = textSize * scale;

        // 设置字体（使用更清晰的字体）
        ctx.font = `${isBold ? 'bold ' : ''}${scaledTextSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "SimHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'top';
        
        // 启用图像平滑以获得更好的质量
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 测量文本宽度（使用缩放后的尺寸）
        const metrics = ctx.measureText(text);
        const textWidth_actual = metrics.width;
        const textHeight = scaledTextSize * 1.2;

        // 设置画布尺寸（使用缩放后的尺寸）
        canvas.width = Math.ceil(textWidth_actual) + 8;
        canvas.height = Math.ceil(textHeight) + 8;

        // 填充白色背景
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 重新设置字体和样式（因为 canvas 尺寸改变了）
        ctx.font = `${isBold ? 'bold ' : ''}${scaledTextSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "SimHei", "PingFang SC", "Hiragino Sans GB", sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'top';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 绘制文本（添加边距）
        ctx.fillText(text, 4, 4);

        // 转换为 PNG（高质量）
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('无法创建图片'));
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              resolve(new Uint8Array(reader.result as ArrayBuffer));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
          }, 'image/png', 1.0); // 最高质量
        });
      };

      // 绘制文本（支持中文）
      const drawText = async (text: string, x: number, yPos: number, textSize: number, isBold: boolean = false) => {
        if (containsNonAscii(text)) {
          // 包含中文，使用 Canvas 渲染（高分辨率）
          try {
            const scale = 2; // 与 renderTextAsImage 中的缩放因子一致
            const imageBytes = await renderTextAsImage(text, textSize, isBold);
            const pdfImage = await pdfDoc.embedPng(imageBytes);
            // 将高分辨率图片缩放回原始尺寸
            const imageWidth = pdfImage.width / scale;
            const imageHeight = pdfImage.height / scale;
            
            page.drawImage(pdfImage, {
              x: x,
              y: yPos - imageHeight,
              width: imageWidth,
              height: imageHeight,
            });
          } catch (error) {
            console.warn('渲染文本为图片失败:', error);
          }
        } else {
          // 纯 ASCII，使用标准字体
          page.drawText(text, {
            x: x,
            y: yPos,
            size: textSize,
            font: isBold ? boldFont : font,
            color: rgb(0, 0, 0),
          });
        }
      };

      // 计算文本宽度（支持中文）
      const getTextWidth = (text: string, textSize: number): number => {
        if (containsNonAscii(text)) {
          // 对于中文，使用 Canvas 测量
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return text.length * textSize * 0.6; // 估算值
          ctx.font = `${textSize}px Arial, "Microsoft YaHei", "SimHei", sans-serif`;
          return ctx.measureText(text).width;
        } else {
          // 纯 ASCII，使用字体测量
          return font.widthOfTextAtSize(text, textSize);
        }
      };

      // 遍历所有子节点
      const processNode = async (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // 处理文本节点 - 按照 bentopdf-main 的方式处理换行
          const text = node.textContent || '';
          if (text.trim() === '') return;

          // 按换行符分割段落
          const paragraphs = text.split('\n');
          for (const paragraph of paragraphs) {
            if (paragraph.trim() === '') {
              // 空行，换行
              y -= lineHeight;
              continue;
            }

            // 对于混合文本（中英文），需要更智能的处理
            // 先按空格分割，然后对每个部分检查是否需要进一步分割
            const words = paragraph.trim().split(/\s+/);
            let currentLine = '';
            
            for (const word of words) {
              if (word.trim() === '') continue;

              // 构建测试行
              const testLine = currentLine.length > 0 ? `${currentLine} ${word}` : word;
              const testWidth = getTextWidth(testLine, fontSize);
              
              if (testWidth <= textWidth) {
                // 可以添加到当前行
                currentLine = testLine;
              } else {
                // 需要换行
                if (currentLine.length > 0) {
                  if (y < margin + lineHeight) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin;
                  }
                  await drawText(currentLine, margin, y, fontSize, false);
                  y -= lineHeight;
                }
                
                // 如果单个单词就超出宽度，需要按字符分割（主要用于中文）
                if (getTextWidth(word, fontSize) > textWidth) {
                  // 单词太长，需要按字符分割
                  let remaining = word;
                  while (remaining.length > 0) {
                    let chunk = '';
                    for (let i = 0; i < remaining.length; i++) {
                      const testChunk = chunk + remaining[i];
                      if (getTextWidth(testChunk, fontSize) <= textWidth) {
                        chunk = testChunk;
                      } else {
                        break;
                      }
                    }
                    if (chunk.length === 0) chunk = remaining[0];
                    
                    if (y < margin + lineHeight) {
                      page = pdfDoc.addPage([pageWidth, pageHeight]);
                      y = pageHeight - margin;
                    }
                    await drawText(chunk, margin, y, fontSize, false);
                    y -= lineHeight;
                    remaining = remaining.slice(chunk.length);
                  }
                  currentLine = '';
                } else {
                  currentLine = word;
                }
              }
            }

            // 绘制剩余的行
            if (currentLine.length > 0) {
              if (y < margin + lineHeight) {
                page = pdfDoc.addPage([pageWidth, pageHeight]);
                y = pageHeight - margin;
              }
              await drawText(currentLine, margin, y, fontSize, false);
              y -= lineHeight;
            }
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const tagName = element.tagName.toLowerCase();

          if (tagName === 'table') {
            // 处理表格
            const table = element as HTMLTableElement;
            const tableData = parseTable(table);
            
            if (tableData.length === 0) return;

            // 计算列数
            const maxCols = Math.max(...tableData.map(row => row.length));
            if (maxCols === 0) return;

            // 计算列宽
            const cellPadding = 4;
            const availableWidth = textWidth;
            const colWidth = availableWidth / maxCols;
            const cellHeight = lineHeight * 1.5;

            // 检查是否有足够空间
            if (y < margin + cellHeight * tableData.length) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }

            const startY = y;
            const startX = margin;

            // 绘制表格
            for (let rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
              const row = tableData[rowIndex];
              const isHeaderRow = rowIndex === 0 && table.querySelector('th') !== null;
              const currentY = startY - rowIndex * cellHeight;

              for (let colIndex = 0; colIndex < row.length; colIndex++) {
                const cell = row[colIndex];
                const cellX = startX + colIndex * colWidth;
                const cellText = cell || '';

                // 绘制单元格边框
                page.drawRectangle({
                  x: cellX,
                  y: currentY - cellHeight,
                  width: colWidth,
                  height: cellHeight,
                  borderColor: rgb(0, 0, 0),
                  borderWidth: 0.5,
                });

                // 绘制单元格文本
                const textToDraw = cellText.length > 20 ? cellText.substring(0, 17) + '...' : cellText;
                const textWidth_actual = getTextWidth(textToDraw, fontSize);
                const textX = cellX + cellPadding;
                const textY = currentY - cellHeight / 2;

                if (textWidth_actual <= colWidth - cellPadding * 2) {
                  await drawText(textToDraw, textX, textY, fontSize, isHeaderRow);
                }
              }
            }

            y = startY - tableData.length * cellHeight - lineHeight * 0.5;
          } else if (tagName === 'hr') {
            // 处理水平线
            y -= lineHeight * 0.5;
            if (y < margin + lineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }
            page.drawLine({
              start: { x: margin, y: y },
              end: { x: pageWidth - margin, y: y },
              thickness: 0.5,
              color: rgb(0, 0, 0),
            });
            y -= lineHeight * 0.5;
          } else if (tagName === 'img') {
            // 处理图片
            const img = element as HTMLImageElement;
            const src = img.src;
            
            if (src && (src.startsWith('data:image/') || src.startsWith('http'))) {
              try {
                let imageBytes: Uint8Array;
                
                if (src.startsWith('data:')) {
                  // Base64 图片
                  const base64Data = src.split(',')[1];
                  imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                } else {
                  // 网络图片 - 需要先转换为 Base64（这里简化处理，实际可能需要 fetch）
                  return;
                }

                // 尝试嵌入图片
                let pdfImage;
                try {
                  pdfImage = await pdfDoc.embedPng(imageBytes);
                } catch {
                  try {
                    pdfImage = await pdfDoc.embedJpg(imageBytes);
                  } catch {
                    console.warn('无法嵌入图片，跳过');
                    return;
                  }
                }

                // 计算图片尺寸（适应页面宽度）
                const maxImageWidth = textWidth;
                const imageAspectRatio = pdfImage.width / pdfImage.height;
                let imageWidth = Math.min(pdfImage.width, maxImageWidth);
                let imageHeight = imageWidth / imageAspectRatio;

                // 检查是否需要新页面
                if (y < margin + imageHeight + lineHeight) {
                  page = pdfDoc.addPage([pageWidth, pageHeight]);
                  y = pageHeight - margin;
                }

                // 绘制图片
                page.drawImage(pdfImage, {
                  x: margin,
                  y: y - imageHeight,
                  width: imageWidth,
                  height: imageHeight,
                });

                y -= imageHeight + lineHeight;
              } catch (error) {
                console.warn('处理图片时出错:', error);
              }
            }
          } else if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
            // 处理标题
            const level = parseInt(tagName.charAt(1));
            const headingSize = fontSize * (1.5 - level * 0.1);
            
            y -= lineHeight * 0.5;
            for (const childNode of Array.from(element.childNodes)) {
              await processNode(childNode);
            }
            // 标题结束后换行
            y -= lineHeight * 0.5;
          } else if (tagName === 'ul' || tagName === 'ol') {
            // 处理列表
            const listItems = element.querySelectorAll('li');
            for (const li of Array.from(listItems)) {
              const text = li.textContent || '';
              if (text.trim()) {
                const prefix = tagName === 'ul' ? '• ' : `${listItems.length > 0 ? Array.from(listItems).indexOf(li) + 1 : 1}. `;
                const fullText = prefix + text.trim();
                
                if (y < margin + lineHeight) {
                  page = pdfDoc.addPage([pageWidth, pageHeight]);
                  y = pageHeight - margin;
                }
                
                await drawText(fullText, margin, y, fontSize, false);
                y -= lineHeight;
              }
            }
          } else if (tagName === 'p' || tagName === 'div') {
            // 处理段落和 div
            for (const childNode of Array.from(element.childNodes)) {
              await processNode(childNode);
            }
            // 段落结束后换行（类似 bentopdf-main 的处理）
            y -= lineHeight * 0.5;
          } else if (tagName === 'br') {
            // 处理换行
            y -= lineHeight;
          } else {
            // 处理其他元素（递归处理子节点）
            for (const childNode of Array.from(element.childNodes)) {
              await processNode(childNode);
            }
          }
        }
      };

      // 处理所有子节点（需要异步处理，因为图片嵌入是异步的）
      for (const node of Array.from(tempDiv.childNodes)) {
        await processNode(node);
      }

      // 保存 PDF
      const pdfBytes = await pdfDoc.save();

      // 下载 PDF
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `text-to-pdf_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(t("messages.convertSuccess", { count: 1 }));
    } catch (error) {
      console.error("转换失败:", error);
      toast.error(t("errors.convertFailed"));
    } finally {
      setIsConverting(false);
    }
  }, [editorContent, pageSize, orientation, pageMargin, t, parseTable]);

  // 清空编辑器
  const handleClear = useCallback(() => {
    setEditorContent("");
    setWordCount(0);
    setCharCount(0);
    setShowEditor(false);
    setShowSettings(false);
  }, []);

  // 开始重新
  const handleStartOver = useCallback(() => {
    handleClear();
    setPageSize("A4");
    setOrientation("portrait");
    setPageMargin("30");
  }, [handleClear]);

  // 返回编辑器
  const handleGoBack = useCallback(() => {
    setShowSettings(false);
  }, []);

  // 处理拖放
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  };


  // 监听编辑器内容变化
  useEffect(() => {
    if (editorContent) {
      updateCounts(editorContent);
      // 如果有内容，自动显示编辑器
      if (!showEditor && editorContent.trim().length > 0) {
        setShowEditor(true);
      }
    }
  }, [editorContent, updateCounts, showEditor]);

  return (
    <section className="relative overflow-hidden bg-[#faf9f7] dark:bg-gray-950 min-h-[80vh]">
      {/* 顶部渐变背景 */}
      <div 
        className="absolute inset-0 top-0 h-[500px] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(251, 146, 60, 0.1) 30%, rgba(20, 184, 166, 0.12) 70%, rgba(34, 197, 94, 0.08) 100%)',
          filter: 'blur(100px)',
          transform: 'scale(1.3)',
          opacity: 0.8,
        }}
      ></div>
      
      {/* 点状背景图案 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(212, 165, 116, 0.2) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0',
          opacity: 0.4,
        }}
      ></div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {/* 上方：标题和插图 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* 左侧：文字内容 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* 标题 */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 text-gray-900 dark:text-white leading-tight">
              {t("hero.title")}
            </h1>
            
            {/* 描述文字 */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mt-6">
              {t("hero.description")}
            </p>

            {/* CTA 按钮 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8"
            >
              <Button
                onClick={() => {
                  const converterSection = document.querySelector('[data-converter-section]');
                  if (converterSection) {
                    converterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                size="lg"
                disabled={isProcessing}
                className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold px-10 py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("hero.uploadTitle")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* 右侧：插图 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-3xl p-12 shadow-xl">
                <FileText className="w-32 h-32 text-orange-600 dark:text-orange-400 mx-auto" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* 下方：编辑器工具 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-6xl xl:max-w-7xl mx-auto mt-32"
          data-converter-section
        >
          {/* 编辑器容器 */}
          <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-gray-800 rounded-[16px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          {/* 左侧：编辑器区域 */}
          <div className="flex-1">
            <div 
              className={`border-2 ${isDragging ? 'border-gray-300' : 'border-transparent'} border-dashed rounded-xl min-h-[600px] max-h-[800px] flex flex-col overflow-hidden`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {/* 返回按钮（当在设置阶段时显示） */}
              {showSettings && (
                <div className="p-2 border-b">
                  <button
                    onClick={handleGoBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>{t("back")}</span>
                  </button>
                </div>
              )}

              {/* 编辑器工具栏和内容 - 始终显示编辑器 */}
              {showEditor && (
                <QuillEditor
                  value={editorContent}
                  onChange={setEditorContent}
                  placeholder={t("startTyping")}
                  className="text-editor"
                  onWordCountChange={(words, chars) => {
                    setWordCount(words);
                    setCharCount(chars);
                  }}
                  onActiveTagChange={(tag) => {
                    setActiveTag(tag);
                  }}
                  wordCount={wordCount}
                  charCount={charCount}
                  activeTag={activeTag}
                />
              )}
            </div>
          </div>

          {/* 右侧：PDF 设置 */}
          {showSettings && (
            <div className="lg:w-80 bg-[#F5F5F5] rounded-xl p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-lg">{t("pageOrientation")}</p>
                <button
                  onClick={handleStartOver}
                  title={t("startOver")}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

            {/* 页面方向选择 */}
            <div className="flex gap-4">
              <button
                onClick={() => setOrientation("portrait")}
                className={`flex-1 flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  orientation === "portrait"
                    ? "border-red-500 bg-white"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="w-12 h-16 border-2 border-red-500 rounded mb-2"></div>
                <span className="text-sm">{t("orientation.portrait")}</span>
              </button>
              <button
                onClick={() => setOrientation("landscape")}
                className={`flex-1 flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  orientation === "landscape"
                    ? "border-red-500 bg-white"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="w-16 h-12 border-2 border-red-500 rounded mb-2"></div>
                <span className="text-sm">{t("orientation.landscape")}</span>
              </button>
            </div>

            {/* 页面大小 */}
            <div>
              <label className="font-semibold text-sm sm:text-base text-[#264653] block mb-1">
                {t("pageSize.label")}
              </label>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="bg-white border-2 border-white focus:border-[#EA4335] h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A3">{t("pageSize.A3")}</SelectItem>
                  <SelectItem value="A4">{t("pageSize.A4")}</SelectItem>
                  <SelectItem value="A5">{t("pageSize.A5")}</SelectItem>
                  <SelectItem value="Letter">{t("pageSize.Letter")}</SelectItem>
                  <SelectItem value="Legal">{t("pageSize.Legal")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 页面边距 */}
            <div>
              <label className="font-semibold text-sm sm:text-base text-[#264653] block mb-1">
                {t("pageMargin")}
              </label>
              <Select value={pageMargin} onValueChange={setPageMargin}>
                <SelectTrigger className="bg-white border-2 border-white focus:border-[#EA4335] h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("noMargin")}</SelectItem>
                  <SelectItem value="10">10pt</SelectItem>
                  <SelectItem value="20">20pt</SelectItem>
                  <SelectItem value="30">30pt</SelectItem>
                  <SelectItem value="40">40pt</SelectItem>
                  <SelectItem value="50">50pt</SelectItem>
                  <SelectItem value="60">60pt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          )}
          </div>

          {/* 操作按钮 - 只在编辑器显示时显示 */}
          {showEditor && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {!showSettings ? (
                <Button
                  onClick={handleProceed}
                  disabled={editorContent.trim().length === 0}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-[50px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <b className="text-base sm:text-xl font-medium">{t("proceed")}</b>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={convertToPdf}
                  disabled={isConverting || editorContent.trim().length === 0}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-[50px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <b className="text-base sm:text-xl font-medium">{t("converting")}</b>
                    </>
                  ) : (
                    <>
                      <b className="text-base sm:text-xl font-medium">{t("convert")}</b>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        .text-editor .ql-container {
          min-height: 400px;
          font-size: 14px;
        }
        .text-editor .ql-editor {
          min-height: 400px;
        }
        .text-editor .ql-editor.ql-blank::before {
          font-style: italic;
          color: #999;
        }
      `}</style>
    </section>
  );
}
