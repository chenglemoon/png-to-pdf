"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useCallback } from "react";
import { Upload, Download, FileImage, X, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { motion, AnimatePresence } from "framer-motion";

interface FileWithPreview extends File {
  preview?: string;
}

export default function PngToPdf() {
  const t = useTranslations("PngToPdf");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
  const validateFile = (file: File): boolean => {
    // 检查是否为 PNG 文件
    if (file.type !== "image/png" && !file.name.toLowerCase().endsWith(".png")) {
      toast.error(t("errors.notPng", { defaultValue: "请选择 PNG 格式的图片文件" }));
      return false;
    }

    // 验证文件大小 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t("errors.fileTooLarge", { defaultValue: "文件大小不能超过 50MB" }));
      return false;
    }

    return true;
  };

  // 处理文件选择
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles: FileWithPreview[] = [];

    fileArray.forEach((file) => {
      if (validateFile(file)) {
        // 创建预览
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        validFiles.push(fileWithPreview);
      }
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      toast.success(
        t("messages.filesAdded", {
          count: validFiles.length,
          defaultValue: `已添加 ${validFiles.length} 个文件`,
        })
      );
    }
  }, [t]);

  // 处理拖拽上传
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFileSelect(droppedFiles);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // 处理点击上传
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
    // 重置 input，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 移除文件
  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 清空所有文件
  const clearAllFiles = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  // 转换 PNG 为 PDF
  const convertToPdf = useCallback(async () => {
    if (files.length === 0) {
      toast.error(t("errors.noFiles", { defaultValue: "请至少选择一个 PNG 文件" }));
      return;
    }

    setIsProcessing(true);

    try {
      // 创建 PDF 文档
      const pdfDoc = await PDFDocument.create();

      // 遍历所有文件并添加到 PDF
      for (const file of files) {
        try {
          const pngBytes = await readFileAsArrayBuffer(file);
          const pngImage = await pdfDoc.embedPng(pngBytes);
          
          // 根据图片尺寸创建页面
          const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
          
          // 绘制图片
          page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: pngImage.width,
            height: pngImage.height,
          });
        } catch (error) {
          console.error(`处理文件 ${file.name} 时出错:`, error);
          toast.error(
            t("errors.processFileFailed", {
              fileName: file.name,
              defaultValue: `处理文件 ${file.name} 失败`,
            })
          );
        }
      }

      // 保存 PDF
      const pdfBytes = await pdfDoc.save();

      // 下载 PDF
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `from_pngs_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(
        t("messages.convertSuccess", {
          count: files.length,
          defaultValue: `成功将 ${files.length} 个 PNG 文件转换为 PDF`,
        })
      );
    } catch (error) {
      console.error("转换失败:", error);
      toast.error(
        t("errors.convertFailed", {
          defaultValue: "转换失败，请确保所有文件都是有效的 PNG 图片",
        })
      );
    } finally {
      setIsProcessing(false);
    }
  }, [files, t]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,.png"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 上传区域 */}
      {files.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative w-full max-w-3xl mx-auto 
            bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 
            dark:from-gray-900 dark:via-purple-950/20 dark:to-blue-950/20
            rounded-3xl shadow-xl border-2 border-dashed
            p-8 md:p-12 lg:p-16
            cursor-pointer transition-all duration-300
            ${isDragging 
              ? "scale-[1.02] shadow-2xl border-purple-500 bg-gradient-to-br from-purple-50 via-purple-100/50 to-blue-100/50 dark:from-purple-950/40 dark:via-purple-900/30 dark:to-blue-900/30" 
              : "border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-2xl"
            }
            overflow-hidden
          `}
        >
          {/* 背景装饰 */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10">
            {/* Upload Icon Area */}
            <div className="mb-8 flex justify-center">
              <div className={`
                relative p-8 rounded-3xl 
                bg-gradient-to-br from-purple-100 to-blue-100 
                dark:from-purple-900/40 dark:to-blue-900/40
                shadow-lg
                ${isDragging ? "scale-110 rotate-6" : "hover:scale-105"}
                transition-all duration-300
              `}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>
                <Upload className={`
                  relative w-20 h-20 
                  text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-blue-600 
                  dark:from-purple-400 dark:to-blue-400
                  ${isDragging ? "animate-bounce" : ""}
                  transition-all duration-300
                `} strokeWidth={1.5} />
              </div>
            </div>

            {/* Upload Title */}
            <div className="text-center mb-4">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 dark:from-purple-400 dark:via-purple-300 dark:to-blue-400 bg-clip-text text-transparent">
                {t("hero.uploadTitle", { defaultValue: "PNG 转 PDF" })}
              </h2>
            </div>

            {/* Drag & Drop Text */}
            <div className="text-center mb-3">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {t("hero.dragText", { defaultValue: "拖放 PNG 图片到这里" })}
              </p>
            </div>

            {/* Select File Text */}
            <div className="text-center mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("hero.selectText", { defaultValue: "或点击选择文件（支持多选）" })}
              </p>
            </div>

            {/* Format and Size Badges */}
            <div className="flex flex-wrap gap-3 justify-center">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md border border-purple-200/50 dark:border-purple-700/50">
                <FileImage className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("hero.format", { defaultValue: "PNG 格式" })}
                </span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md border border-blue-200/50 dark:border-blue-700/50">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("hero.maxSize", { defaultValue: "最大 50MB" })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 文件列表和转换区域 */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 mt-8"
          >
            {/* 文件列表卡片 */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/30 dark:to-blue-950/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg">
                      <FileImage className="w-5 h-5" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                      {t("fileList.title", {
                        count: files.length,
                        defaultValue: `已选择 ${files.length} 个文件`,
                      })}
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFiles}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t("fileList.clearAll", { defaultValue: "清空" })}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {files.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-300 overflow-hidden">
                          {/* 背景装饰 */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>
                          
                          {/* 预览图片 */}
                          {file.preview && (
                            <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-checkered border border-gray-200 dark:border-gray-700 shadow-inner">
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}

                          {/* 文件名 */}
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1 relative z-10">
                            {file.name}
                          </p>

                          {/* 文件大小 */}
                          <p className="text-xs text-gray-500 dark:text-gray-400 relative z-10">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>

                          {/* 删除按钮 */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 shadow-md z-20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* 添加更多文件按钮 */}
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={handleClick}
                    className="w-full border-2 border-dashed hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-all duration-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t("fileList.addMore", { defaultValue: "添加更多文件" })}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 转换按钮卡片 */}
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700">
              <CardContent className="p-6">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-4">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 animate-spin text-white" />
                      <Sparkles className="absolute inset-0 w-12 h-12 text-white/50 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-white">
                        {t("processing.title", { defaultValue: "正在转换中..." })}
                      </p>
                      <p className="text-sm text-white/80 mt-1">
                        {t("processing.subtitle", { defaultValue: "请稍候，这可能需要几秒钟" })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={convertToPdf}
                    className="w-full bg-white hover:bg-gray-50 text-purple-600 dark:text-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold py-6"
                    size="lg"
                    disabled={files.length === 0}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <span>
                        {t("convertButton", {
                          count: files.length,
                          defaultValue: `转换为 PDF (${files.length} 个文件)`,
                        })}
                      </span>
                    </div>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

