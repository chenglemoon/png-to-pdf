"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, FileText, Upload, Loader2, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import { getPDFDocument, readFileAsArrayBuffer } from "@/lib/pdf-utils";

interface ConvertedPage {
  pageNumber: number;
  imageDataUrl: string;
  blob: Blob;
}

// BMP 编码函数：将 canvas ImageData 转换为 BMP Blob
function encodeBMP(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  // BMP 文件头大小：14 字节
  // DIB 头大小：40 字节（BITMAPINFOHEADER）
  const fileHeaderSize = 14;
  const dibHeaderSize = 40;
  const pixelDataOffset = fileHeaderSize + dibHeaderSize;
  
  // 每行像素数据必须是 4 字节对齐
  const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = pixelDataOffset + pixelDataSize;
  
  // 创建 ArrayBuffer
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  
  // BMP 文件头 (14 字节)
  // 'BM' 标识
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4D); // 'M'
  // 文件大小
  view.setUint32(2, fileSize, true); // little-endian
  // 保留字段
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  // 像素数据偏移
  view.setUint32(10, pixelDataOffset, true);
  
  // DIB 头 (40 字节)
  // DIB 头大小
  view.setUint32(14, dibHeaderSize, true);
  // 宽度
  view.setInt32(18, width, true);
  // 高度（正数表示从上到下）
  view.setInt32(22, height, true);
  // 颜色平面数（必须为 1）
  view.setUint16(26, 1, true);
  // 每像素位数（24 = RGB）
  view.setUint16(28, 24, true);
  // 压缩方式（0 = 无压缩）
  view.setUint32(30, 0, true);
  // 像素数据大小
  view.setUint32(34, pixelDataSize, true);
  // 水平分辨率（像素/米）
  view.setInt32(38, 0, true);
  // 垂直分辨率（像素/米）
  view.setInt32(42, 0, true);
  // 调色板颜色数（0 = 不使用调色板）
  view.setUint32(46, 0, true);
  // 重要颜色数（0 = 所有颜色都重要）
  view.setUint32(50, 0, true);
  
  // 像素数据（BMP 是从下到上存储的，所以需要反转）
  let offset = pixelDataOffset;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // BMP 使用 BGR 顺序，而不是 RGB
      view.setUint8(offset++, data[idx + 2]); // B
      view.setUint8(offset++, data[idx + 1]); // G
      view.setUint8(offset++, data[idx]);     // R
    }
    // 填充到 4 字节对齐
    while (offset % 4 !== 0) {
      view.setUint8(offset++, 0);
    }
  }
  
  return new Blob([buffer], { type: 'image/bmp' });
}

export default function HeroSection() {
  const t = useTranslations("PdfToBmp");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [imageQuality, setImageQuality] = useState("medium");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证文件类型
  const validateFile = useCallback((file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    if (!fileName.endsWith('.pdf') && fileType !== 'application/pdf') {
      toast.error(t("errors.notPdf"));
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

  // 将 PDF 页面转换为 BMP
  const convertPdfToBmp = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const pdfTask = await getPDFDocument(arrayBuffer);
      const pdf = await pdfTask.promise;
      
      if (!pdf) {
        throw new Error('Failed to load PDF: PDF document is null');
      }
      
      if (typeof pdf.numPages !== 'number') {
        throw new Error(`Failed to load PDF: invalid PDF document. numPages is ${typeof pdf.numPages}`);
      }
      
      const numPages = pdf.numPages;

      // 根据质量设置确定 scale（BMP 是无损的，只调整分辨率）
      let scale = 2.0;
      if (imageQuality === "low") {
        scale = 1.0;
      } else if (imageQuality === "medium") {
        scale = 2.0;
      } else {
        scale = 3.0;
      }

      const pages: ConvertedPage[] = [];

      // 转换每一页
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Failed to get canvas context');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        // 获取 ImageData 并转换为 BMP
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const bmpBlob = encodeBMP(imageData);

        // 为了预览，创建一个 PNG 数据 URL（BMP 在浏览器中预览可能有问题）
        const pngBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to convert canvas to blob'));
            },
            'image/png'
          );
        });

        const imageDataUrl = URL.createObjectURL(pngBlob);
        pages.push({
          pageNumber: pageNum,
          imageDataUrl,
          blob: bmpBlob, // 实际下载的是 BMP
        });
      }

      setConvertedPages(pages);
      setPdfFile(file);
      toast.success(t("messages.convertSuccess", { count: numPages }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(t("errors.convertFailed") + (errorMessage ? `: ${errorMessage}` : ""));
    } finally {
      setIsProcessing(false);
    }
  }, [t, validateFile, imageQuality]);

  // 下载单个 BMP
  const downloadSingleBmp = useCallback((page: ConvertedPage) => {
    const url = URL.createObjectURL(page.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `page_${page.pageNumber}.bmp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // 下载所有 BMP 为 ZIP
  const downloadAllAsZip = useCallback(async () => {
    if (convertedPages.length === 0) return;

    try {
      const zip = new JSZip();
      
      convertedPages.forEach((page) => {
        zip.file(`page_${page.pageNumber}.bmp`, page.blob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pdf_pages_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t("errors.createZipFailed"));
    }
  }, [convertedPages, t]);

  // 清空所有
  const clearAll = useCallback(() => {
    convertedPages.forEach((page) => {
      URL.revokeObjectURL(page.imageDataUrl);
    });
    setPdfFile(null);
    setConvertedPages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [convertedPages]);

  // 处理文件选择
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    if (fileArray.length > 0) {
      const file = fileArray[0];
      convertPdfToBmp(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [convertPdfToBmp]);

  // 检查滚动状态
  const checkScrollButtons = useCallback(() => {
    if (previewScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = previewScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  }, []);

  // 滚动到左侧
  const scrollLeft = useCallback(() => {
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  // 滚动到右侧
  const scrollRight = useCallback(() => {
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const scrollContainer = previewScrollRef.current;
    if (scrollContainer) {
      checkScrollButtons();
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [checkScrollButtons, convertedPages.length]);

  // 当页面数量变化时，重新检查滚动状态
  useEffect(() => {
    setTimeout(checkScrollButtons, 100);
  }, [convertedPages.length, checkScrollButtons]);

  // 当质量改变时，如果已有 PDF，重新转换
  useEffect(() => {
    if (pdfFile && convertedPages.length > 0) {
      const timer = setTimeout(() => {
        convertPdfToBmp(pdfFile);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [imageQuality, pdfFile, convertPdfToBmp, convertedPages.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 mt-16 md:mt-24">
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

        {/* 下方：转换器工具 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-6xl xl:max-w-7xl mx-auto mt-24 md:mt-32 lg:mt-40"
          data-converter-section
        >
          {/* 上传区域 */}
          {!pdfFile && (
            <div 
              className={`border-2 ${isDragging ? 'border-orange-400' : 'border-dashed border-gray-300'} rounded-xl p-12 text-center bg-white dark:bg-gray-800 transition-colors`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <FileText className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">{t("hero.dragText")}</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                {t("upload")}
              </Button>
            </div>
          )}

          {/* 预览和下载区域 */}
          {pdfFile && convertedPages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-[16px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              {/* 头部：标题和清除按钮 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("preview.title", { current: convertedPages.length, total: convertedPages.length })}
                </h3>
                <Button
                  onClick={clearAll}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {t("preview.clearAll")}
                </Button>
              </div>

              {/* 图片质量选择 */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("imageQuality.label")}
                </label>
                <Select value={imageQuality} onValueChange={setImageQuality}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("imageQuality.low")}</SelectItem>
                    <SelectItem value="medium">{t("imageQuality.medium")}</SelectItem>
                    <SelectItem value="high">{t("imageQuality.high")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 横向滚动预览 */}
              <div className="relative mb-4">
                {canScrollLeft && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                )}
                {canScrollRight && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                )}
                <div
                  ref={previewScrollRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {convertedPages.map((page, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-48 bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="relative w-full aspect-[3/4] mb-2 rounded overflow-hidden bg-white dark:bg-gray-800">
                        <img
                          src={page.imageDataUrl}
                          alt={`${t("preview.page")} ${page.pageNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("preview.page")} {page.pageNumber}
                        </span>
                        <Button
                          onClick={() => downloadSingleBmp(page)}
                          size="sm"
                          variant="outline"
                          className="h-8"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 下载所有按钮 */}
              <div className="flex justify-center">
                <Button
                  onClick={downloadAllAsZip}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-[50px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {t("preview.downloadAll")}
                </Button>
              </div>
            </div>
          )}

          {/* 处理中状态 */}
          {isProcessing && (
            <div className="bg-white dark:bg-gray-800 rounded-[16px] p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("processing.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("processing.subtitle")}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

