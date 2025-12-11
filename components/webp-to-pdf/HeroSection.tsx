"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, FileImage, FileText, Upload, Loader2, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { toast } from "sonner";
import { decode as decodeTiff } from "tiff";

export default function HeroSection() {
  const t = useTranslations("WebpToPdf");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pdfQuality, setPdfQuality] = useState("medium");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 读取文件为 ArrayBuffer
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // 验证文件类型
  const validateFile = useCallback((file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // 支持的图片格式
    const supportedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/webp", 
      "image/bmp", "image/tiff", "image/tif", "image/svg+xml"
    ];
    
    const supportedExtensions = [
      ".jpg", ".jpeg", ".png", ".webp", 
      ".bmp", ".tiff", ".tif", ".svg", 
      ".heic", ".heif"
    ];
    
    const isSupportedType = supportedTypes.some(type => fileType.includes(type));
    const isSupportedExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isSupportedType && !isSupportedExtension) {
      toast.error(t("errors.unsupportedFormat"));
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

  /**
   * Takes any image byte array and uses the browser's canvas to convert it
   * into a standard, web-friendly (baseline, sRGB) JPEG byte array.
   * @param {Uint8Array} imageBytes The raw bytes of the image file.
   * @returns {Promise<Uint8Array>} A promise that resolves with the sanitized JPEG bytes.
   */
  const sanitizeImageAsJpeg = useCallback((imageBytes: Uint8Array): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([imageBytes as BlobPart]);
      const imageUrl = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(imageUrl);
          return reject(new Error('Could not get canvas context.'));
        }
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          async (jpegBlob) => {
            if (!jpegBlob) {
              URL.revokeObjectURL(imageUrl);
              return reject(new Error('Canvas toBlob conversion failed.'));
            }
            const arrayBuffer = await jpegBlob.arrayBuffer();
            URL.revokeObjectURL(imageUrl);
            resolve(new Uint8Array(arrayBuffer));
          },
          'image/jpeg',
          0.9
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(
          new Error(
            'The provided file could not be loaded as an image. It may be corrupted.'
          )
        );
      };

      img.src = imageUrl;
    });
  }, []);

  // 将图片转换为 PNG bytes（用于 BMP, SVG 等格式）
  const convertImageToPngBytes = useCallback((file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          const pngBlob = await new Promise<Blob | null>((res) =>
            canvas.toBlob(res, 'image/png')
          );
          if (!pngBlob) {
            reject(new Error('Failed to convert to PNG'));
            return;
          }
          const pngBytes = await pngBlob.arrayBuffer();
          resolve(pngBytes);
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  }, []);

  // 转换图片为 PDF
  const convertToPdf = useCallback(async (filesToConvert: File[]) => {
    if (filesToConvert.length === 0) {
      toast.error(t("errors.noFiles"));
      return;
    }

    setIsProcessing(true);

    try {
      // 创建 PDF 文档
      const pdfDoc = await PDFDocument.create();

      // 遍历所有文件并添加到 PDF
      for (const file of filesToConvert) {
        try {
          const fileName = file.name.toLowerCase();
          const fileType = file.type.toLowerCase();
          let image: any;
          let imageWidth: number;
          let imageHeight: number;

          // 根据文件类型选择处理方式
          if (fileType === 'image/jpeg' || fileType === 'image/jpg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
            // JPG 格式
            const originalBytes = await readFileAsArrayBuffer(file);
            try {
              image = await pdfDoc.embedJpg(new Uint8Array(originalBytes));
            } catch (e) {
              const sanitizedBytes = await sanitizeImageAsJpeg(new Uint8Array(originalBytes));
              image = await pdfDoc.embedJpg(sanitizedBytes);
            }
            imageWidth = image.width;
            imageHeight = image.height;
          } else if (fileType === 'image/png' || fileName.endsWith('.png')) {
            // PNG 格式
            const originalBytes = await readFileAsArrayBuffer(file);
            image = await pdfDoc.embedPng(new Uint8Array(originalBytes));
            imageWidth = image.width;
            imageHeight = image.height;
          } else if (fileType === 'image/webp' || fileName.endsWith('.webp')) {
            // WebP 格式 - 转换为 PNG
            const originalBytes = await readFileAsArrayBuffer(file);
            const imageBitmap = await createImageBitmap(new Blob([originalBytes]));
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get canvas context');
            ctx.drawImage(imageBitmap, 0, 0);
            const pngBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, 'image/png')
            );
            if (!pngBlob) throw new Error('Failed to convert WebP to PNG');
            const pngBytes = await pngBlob.arrayBuffer();
            image = await pdfDoc.embedPng(new Uint8Array(pngBytes));
            imageWidth = image.width;
            imageHeight = image.height;
            imageBitmap.close();
          } else if (fileType === 'image/bmp' || fileName.endsWith('.bmp')) {
            // BMP 格式 - 转换为 PNG
            const pngBytes = await convertImageToPngBytes(file);
            image = await pdfDoc.embedPng(pngBytes);
            imageWidth = image.width;
            imageHeight = image.height;
          } else if (fileType === 'image/tiff' || fileType === 'image/tif' || fileName.endsWith('.tiff') || fileName.endsWith('.tif')) {
            // TIFF 格式
            const tiffBytes = await readFileAsArrayBuffer(file);
            const ifds = decodeTiff(new Uint8Array(tiffBytes));
            
            // TIFF 可能包含多页，为每一页创建 PDF 页面
            for (const ifd of ifds) {
              const canvas = document.createElement('canvas');
              canvas.width = ifd.width;
              canvas.height = ifd.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error('Failed to get canvas context');
              
              const imageData = ctx.createImageData(ifd.width, ifd.height);
              const pixels = imageData.data;
              const totalPixels = ifd.width * ifd.height;
              const samplesPerPixel = ifd.data.length / totalPixels;
              
              // 转换 TIFF 数据为 RGBA
              for (let i = 0; i < totalPixels; i++) {
                const dstIndex = i * 4;
                if (samplesPerPixel === 1) {
                  const gray = ifd.data[i];
                  pixels[dstIndex] = gray;
                  pixels[dstIndex + 1] = gray;
                  pixels[dstIndex + 2] = gray;
                  pixels[dstIndex + 3] = 255;
                } else if (samplesPerPixel === 3) {
                  const srcIndex = i * 3;
                  pixels[dstIndex] = ifd.data[srcIndex];
                  pixels[dstIndex + 1] = ifd.data[srcIndex + 1];
                  pixels[dstIndex + 2] = ifd.data[srcIndex + 2];
                  pixels[dstIndex + 3] = 255;
                } else if (samplesPerPixel === 4) {
                  const srcIndex = i * 4;
                  pixels[dstIndex] = ifd.data[srcIndex];
                  pixels[dstIndex + 1] = ifd.data[srcIndex + 1];
                  pixels[dstIndex + 2] = ifd.data[srcIndex + 2];
                  pixels[dstIndex + 3] = ifd.data[srcIndex + 3];
                }
              }
              
              ctx.putImageData(imageData, 0, 0);
              const pngBlob = await new Promise<Blob | null>((res) =>
                canvas.toBlob(res, 'image/png')
              );
              if (!pngBlob) throw new Error('Failed to convert TIFF to PNG');
              const pngBytes = await pngBlob.arrayBuffer();
              const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBytes));
              
              // 获取页面尺寸
              let pageWidth: number, pageHeight: number;
              if (pageSize === "fit") {
                pageWidth = pngImage.width;
                pageHeight = pngImage.height;
              } else {
                [pageWidth, pageHeight] = PageSizes[pageSize as keyof typeof PageSizes];
                if (orientation === "landscape" && pageWidth < pageHeight) {
                  [pageWidth, pageHeight] = [pageHeight, pageWidth];
                } else if (orientation === "portrait" && pageWidth > pageHeight) {
                  [pageWidth, pageHeight] = [pageHeight, pageWidth];
                }
              }
              
              const page = pdfDoc.addPage([pageWidth, pageHeight]);
              
              if (pageSize === "fit") {
                page.drawImage(pngImage, {
                  x: 0,
                  y: 0,
                  width: pngImage.width,
                  height: pngImage.height,
                });
              } else {
                const scaleX = pageWidth / pngImage.width;
                const scaleY = pageHeight / pngImage.height;
                const scale = Math.min(scaleX, scaleY);
                const scaledWidth = pngImage.width * scale;
                const scaledHeight = pngImage.height * scale;
                const x = (pageWidth - scaledWidth) / 2;
                const y = (pageHeight - scaledHeight) / 2;
                page.drawImage(pngImage, {
                  x,
                  y,
                  width: scaledWidth,
                  height: scaledHeight,
                });
              }
            }
            continue; // TIFF 已处理，跳过后续处理
          } else if (fileType === 'image/svg+xml' || fileName.endsWith('.svg')) {
            // SVG 格式 - 转换为 PNG
            const pngBytes = await convertImageToPngBytes(file);
            image = await pdfDoc.embedPng(pngBytes);
            imageWidth = image.width;
            imageHeight = image.height;
          } else if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
            // HEIC/HEIF 格式 - 动态导入以避免 SSR 错误
            const heic2any = (await import('heic2any')).default;
            const conversionResult = await heic2any({
              blob: file,
              toType: 'image/png',
            });
            const pngBlob = Array.isArray(conversionResult)
              ? conversionResult[0]
              : conversionResult;
            const pngBytes = await (pngBlob as Blob).arrayBuffer();
            image = await pdfDoc.embedPng(new Uint8Array(pngBytes));
            imageWidth = image.width;
            imageHeight = image.height;
          } else {
            // 其他格式 - 使用 createImageBitmap 转换为 JPEG
            const imageBitmap = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get canvas context');
            ctx.drawImage(imageBitmap, 0, 0);
            
            const jpegBlob = await new Promise<Blob | null>((resolve) =>
              canvas.toBlob(resolve, 'image/jpeg', 0.9)
            );
            if (!jpegBlob) throw new Error('Failed to convert to JPEG');
            const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
            image = await pdfDoc.embedJpg(jpegBytes);
            imageWidth = image.width;
            imageHeight = image.height;
            imageBitmap.close();
          }
          
          // 获取页面尺寸（TIFF 已在上面处理）
          let pageWidth: number, pageHeight: number;
          if (pageSize === "fit") {
            pageWidth = imageWidth;
            pageHeight = imageHeight;
          } else {
            [pageWidth, pageHeight] = PageSizes[pageSize as keyof typeof PageSizes];
            if (orientation === "landscape" && pageWidth < pageHeight) {
              [pageWidth, pageHeight] = [pageHeight, pageWidth];
            } else if (orientation === "portrait" && pageWidth > pageHeight) {
              [pageWidth, pageHeight] = [pageHeight, pageWidth];
            }
          }
          
          // 创建页面
          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          
          if (pageSize === "fit") {
            page.drawImage(image, {
              x: 0,
              y: 0,
              width: imageWidth,
              height: imageHeight,
            });
          } else {
            const scaleX = pageWidth / imageWidth;
            const scaleY = pageHeight / imageHeight;
            const scale = Math.min(scaleX, scaleY);
            const scaledWidth = imageWidth * scale;
            const scaledHeight = imageHeight * scale;
            const x = (pageWidth - scaledWidth) / 2;
            const y = (pageHeight - scaledHeight) / 2;
            page.drawImage(image, {
              x,
              y,
              width: scaledWidth,
              height: scaledHeight,
            });
          }
        } catch (error) {
          console.error(`处理文件 ${file.name} 时出错:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          toast.error(t("errors.processFileFailed", { fileName: file.name }) + `: ${errorMessage}`);
        }
      }

      // 保存 PDF
      const pdfBytes = await pdfDoc.save();

      // 下载 PDF
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `from_images_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (pdfDoc.getPageCount() === 0) {
        throw new Error('No valid images could be processed. Please check your files.');
      }

      toast.success(t("messages.convertSuccess", { count: filesToConvert.length }));
      // 转换成功后清空文件列表和预览
      setFiles([]);
      setImagePreviews([]);
      setCurrentPreviewIndex(0);
    } catch (error) {
      console.error("转换失败:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(t("errors.convertFailed") + (errorMessage ? `: ${errorMessage}` : ""));
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [t, sanitizeImageAsJpeg, convertImageToPngBytes, pageSize, orientation]);

  // 删除单个文件
  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // 清空所有文件
  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setImagePreviews([]);
    setCurrentPreviewIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 滚动到转换器区域
  const scrollToConverter = useCallback(() => {
    const converterSection = document.querySelector('[data-converter-section]');
    if (converterSection) {
      converterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // 处理文件选择 - 只存储文件，不立即转换
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles: File[] = [];

    fileArray.forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      // 生成预览图
      const newPreviews: Promise<string>[] = validFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.onerror = () => {
            resolve(""); // 如果读取失败，返回空字符串
          };
          reader.readAsDataURL(file);
        });
      });
      
      // 等待所有预览图生成完成后再更新状态
      Promise.all(newPreviews).then((previews) => {
        const validPreviews = previews.filter(p => p !== ""); // 过滤掉失败的预览
        setFiles((prev) => [...prev, ...validFiles]);
        setImagePreviews((prev) => [...prev, ...validPreviews]);
        toast.success(t("messages.filesAdded", { count: validFiles.length }));
        
        // 添加文件后，自动滚动到最右侧，确保 "Add More" 可见
        setTimeout(() => {
          if (previewScrollRef.current) {
            previewScrollRef.current.scrollTo({
              left: previewScrollRef.current.scrollWidth,
              behavior: 'smooth'
            });
          }
        }, 100);
      });
    }
  }, [t, validateFile]);

  // 当文件列表变化时，重置预览索引
  useEffect(() => {
    if (currentPreviewIndex >= files.length && files.length > 0) {
      setCurrentPreviewIndex(files.length - 1);
    }
  }, [files.length, currentPreviewIndex]);

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
  }, [checkScrollButtons, imagePreviews.length]);

  // 当图片数量变化时，重新检查滚动状态
  useEffect(() => {
    setTimeout(checkScrollButtons, 100);
  }, [imagePreviews.length, checkScrollButtons]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

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
      // 清空文件输入，避免重复触发
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 处理 Ctrl+V 粘贴（支持多个图片）
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            // 保持原始 MIME 类型，或根据类型推断扩展名
            const mimeType = blob.type || 'image/png';
            const extension = mimeType.split('/')[1] || 'png';
            const file = new File([blob], `pasted-image-${i}.${extension}`, { type: mimeType });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        handleFileSelect(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFileSelect]);

  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-950 min-h-[80vh] flex items-center">
      {/* 点状背景图案 - 浅棕色点，覆盖整个画布 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #d4a574 2px, transparent 2px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0',
          opacity: 0.3,
        }}
      ></div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
                onClick={scrollToConverter}
                size="lg"
                disabled={isProcessing}
                className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-semibold px-10 py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("hero.uploadTitle")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* 右侧：图片转PDF插图 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg">
              <svg
                viewBox="0 0 500 200"
                className="w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 黄色背景 - 左侧部分 */}
                <rect x="0" y="0" width="250" height="200" fill="#FCD34D" />
                
                {/* 白色背景 - 右侧部分 */}
                <rect x="250" y="0" width="250" height="200" fill="#FFFFFF" />
                
                {/* 点状背景图案 */}
                <defs>
                  <pattern id="dotPattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                    <circle cx="6" cy="6" r="1" fill="#D1D5DB" opacity="0.3" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="500" height="200" fill="url(#dotPattern)" />
                
                {/* 左侧：四个图片图标 (2x2网格，稍微重叠) - 山脉和太阳图标 */}
                <g transform="translate(30, 50)">
                  {/* 第一行第一个 */}
                  <g transform="translate(0, 0)">
                    <rect x="0" y="0" width="60" height="60" fill="white" stroke="#1F2937" strokeWidth="2.5" rx="3" />
                    {/* 山脉 */}
                    <path d="M 10 50 L 20 35 L 30 45 L 40 30 L 50 40 L 50 50 Z" fill="#4B5563" stroke="#1F2937" strokeWidth="1.5" />
                    {/* 太阳 */}
                    <circle cx="45" cy="15" r="6" fill="#FCD34D" stroke="#1F2937" strokeWidth="1.5" />
                    <line x1="45" y1="9" x2="45" y2="5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="45" y1="21" x2="45" y2="25" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="39" y1="15" x2="35" y2="15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="51" y1="15" x2="55" y2="15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                  
                  {/* 第一行第二个 - 稍微重叠 */}
                  <g transform="translate(50, -8)">
                    <rect x="0" y="0" width="60" height="60" fill="white" stroke="#1F2937" strokeWidth="2.5" rx="3" />
                    {/* 山脉 */}
                    <path d="M 10 50 L 20 35 L 30 45 L 40 30 L 50 40 L 50 50 Z" fill="#4B5563" stroke="#1F2937" strokeWidth="1.5" />
                    {/* 太阳 */}
                    <circle cx="45" cy="15" r="6" fill="#FCD34D" stroke="#1F2937" strokeWidth="1.5" />
                    <line x1="45" y1="9" x2="45" y2="5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="45" y1="21" x2="45" y2="25" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="39" y1="15" x2="35" y2="15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="51" y1="15" x2="55" y2="15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                  
                  {/* 第二行第一个 - 稍微重叠 */}
                  <g transform="translate(-8, 55)">
                    <rect x="0" y="0" width="60" height="60" fill="white" stroke="#1F2937" strokeWidth="2.5" rx="3" />
                    {/* 山脉 */}
                    <path d="M 10 50 L 20 35 L 30 45 L 40 30 L 50 40 L 50 50 Z" fill="#4B5563" stroke="#1F2937" strokeWidth="1.5" />
                    {/* 太阳 */}
                    <circle cx="45" cy="15" r="6" fill="#FCD34D" stroke="#1F2937" strokeWidth="1.5" />
                    <line x1="45" y1="9" x2="45" y2="5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="45" y1="21" x2="45" y2="25" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="39" y1="15" x2="35" y2="15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="51" y1="15" x2="55" y2="15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                  
                  {/* 第二行第二个 - 稍微重叠 */}
                  <g transform="translate(42, 47)">
                    <rect x="0" y="0" width="60" height="60" fill="white" stroke="#1F2937" strokeWidth="2.5" rx="3" />
                    {/* 山脉 */}
                    <path d="M 10 50 L 20 35 L 30 45 L 40 30 L 50 40 L 50 50 Z" fill="#4B5563" stroke="#1F2937" strokeWidth="1.5" />
                    {/* 太阳 */}
                    <circle cx="45" cy="15" r="6" fill="#FCD34D" stroke="#1F2937" strokeWidth="1.5" />
                    <line x1="45" y1="9" x2="45" y2="5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="45" y1="21" x2="45" y2="25" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="39" y1="15" x2="35" y2="15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="51" y1="15" x2="55" y2="15" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" />
                  </g>
                </g>
                
                {/* 粗箭头 - 从左指向右 */}
                <g transform="translate(200, 85)">
                  {/* 箭头主体 - 更粗更明显 */}
                  <line x1="0" y1="15" x2="80" y2="15" stroke="#1F2937" strokeWidth="12" strokeLinecap="round" />
                  {/* 箭头头部 - 更大更明显 */}
                  <polygon points="80,15 60,0 60,30" fill="#1F2937" />
                </g>
                
                {/* 右侧：PDF文档图标 */}
                <g transform="translate(300, 25)">
                  {/* 文档主体 - 白色背景 */}
                  <rect x="0" y="0" width="120" height="150" fill="white" stroke="#1F2937" strokeWidth="3" rx="3" />
                  
                  {/* 右上角折叠 */}
                  <path d="M 95 0 L 120 0 L 120 25 L 95 0 Z" fill="#E5E7EB" stroke="#1F2937" strokeWidth="3" strokeLinejoin="round" />
                  <line x1="95" y1="0" x2="120" y2="25" stroke="#1F2937" strokeWidth="3" />
                  
                  {/* 内部三条水平线 - 不同长度，表示文本内容 */}
                  <line x1="20" y1="60" x2="90" y2="60" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
                  <line x1="20" y1="80" x2="75" y2="80" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
                  <line x1="20" y1="100" x2="65" y2="100" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* PDF标签 - 黑色矩形，白色文字，居中 */}
                  <rect x="30" y="120" width="60" height="24" fill="#1F2937" rx="3" />
                  <text x="60" y="132" fill="#FFFFFF" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, sans-serif">PDF</text>
                </g>
              </svg>
            </div>
          </motion.div>
        </div>

        {/* 上传组件卡片 - 放在文字和图片下面 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-24 lg:mt-32 xl:mt-40 max-w-5xl xl:max-w-6xl mx-auto"
          data-converter-section
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/bmp,image/tiff,image/tif,image/svg+xml,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,.svg,.heic,.heif"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* 白色卡片 */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10 lg:p-12">
            {/* 预览界面 - 默认显示 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full min-h-[450px]">
                {/* 顶部标题和清除按钮 */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-gray-300 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {t("preview.title", { current: files.length, max: 50 })}
                  </h3>
                  <Button
                    onClick={clearAllFiles}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-semibold px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                  >
                    {t("preview.clearAll")}
                  </Button>
                </div>

                {/* 图片预览区域 - 网格布局 */}
                <div className="relative flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col">
                  {/* 左箭头 */}
                  {canScrollLeft && (
                    <button
                      onClick={scrollLeft}
                      className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all"
                      disabled={isProcessing}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* 右箭头 */}
                  {canScrollRight && (
                    <button
                      onClick={scrollRight}
                      className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all"
                      disabled={isProcessing}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                  
                  <div 
                    ref={previewScrollRef}
                    className="overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex items-center"
                    onScroll={checkScrollButtons}
                  >
                    <div className="flex gap-3 items-center" style={{ minWidth: 'max-content' }}>
                    {/* 已上传的图片缩略图 */}
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group flex-shrink-0 w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-contain p-2"
                        />
                        {/* 删除按钮 */}
                        <button
                          onClick={() => {
                            const newFiles = files.filter((_, i) => i !== index);
                            const newPreviews = imagePreviews.filter((_, i) => i !== index);
                            setFiles(newFiles);
                            setImagePreviews(newPreviews);
                            if (currentPreviewIndex >= newFiles.length && newFiles.length > 0) {
                              setCurrentPreviewIndex(newFiles.length - 1);
                            }
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isProcessing}
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* 图片序号 */}
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                    
                    {/* 添加更多图片的占位符 - 放在图片列表之后（右侧） */}
                    {files.length < 50 && (
                      <div
                        onClick={!isProcessing ? handleClick : undefined}
                        onDrop={!isProcessing ? handleDrop : undefined}
                        onDragOver={!isProcessing ? handleDragOver : undefined}
                        onDragLeave={!isProcessing ? handleDragLeave : undefined}
                        className={`
                          flex-shrink-0 w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                          ${isProcessing 
                            ? "cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600" 
                            : "border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                          }
                        `}
                      >
                        <Plus className="w-10 h-10 md:w-12 md:h-12 text-purple-400 dark:text-purple-500 mb-2" />
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 text-center px-2">
                          {t("preview.addMore")}
                        </p>
                      </div>
                    )}
                    </div>
                  </div>
                  
                </div>

                {/* 底部控制区域 */}
                <div className="flex items-center gap-4">
                  {/* 页面大小 */}
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-600 h-12 text-base">
                      <SelectValue placeholder={t("pageSize.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">{t("pageSize.A4")}</SelectItem>
                      <SelectItem value="A5">{t("pageSize.A5")}</SelectItem>
                      <SelectItem value="Letter">{t("pageSize.Letter")}</SelectItem>
                      <SelectItem value="Legal">{t("pageSize.Legal")}</SelectItem>
                      <SelectItem value="A3">{t("pageSize.A3")}</SelectItem>
                      <SelectItem value="fit">{t("pageSize.fit")}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 页面方向 */}
                  <Select value={orientation} onValueChange={setOrientation}>
                    <SelectTrigger className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-12 text-base">
                      <SelectValue placeholder={t("orientation.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">{t("orientation.portrait")}</SelectItem>
                      <SelectItem value="landscape">{t("orientation.landscape")}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 下载PDF按钮 */}
                  <Button
                    onClick={() => convertToPdf(files)}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white font-semibold px-6 py-6 text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t("processing.title")}
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5 mr-2" />
                        {t("preview.downloadPdf")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

