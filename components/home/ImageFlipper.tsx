"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface FlipOptions {
  horizontal: boolean;
  vertical: boolean;
  rotation: 0 | 90 | 180 | 270;
}

export default function ImageFlipper() {
  const t = useTranslations("ImageFlipper");
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [options, setOptions] = useState<FlipOptions>({
    horizontal: false,
    vertical: false,
    rotation: 0,
  });

  // 处理文件选择
  const handleFileSelect = useCallback((file: File) => {
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(t("errors.unsupportedFormat"));
      return;
    }

    // 验证文件大小 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t("errors.fileTooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      setOriginalImage(result);
      setFileName(file.name);
      // 重置选项
      setOptions({
        horizontal: false,
        vertical: false,
        rotation: 0,
      });
    };
    reader.onerror = () => {
      toast.error(t("errors.loadFailed"));
    };
    reader.readAsDataURL(file);
  }, [t]);

  // 处理拖拽上传
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
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

  // 处理点击上传
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 应用图片变换
  const applyTransformation = useCallback(async (showSuccessMessage = false) => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalImage;
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Cannot get canvas context');
      }

      // 根据旋转角度调整画布大小
      const isRotated = options.rotation === 90 || options.rotation === 270;
      canvas.width = isRotated ? img.height : img.width;
      canvas.height = isRotated ? img.width : img.height;

      // 保存当前状态
      ctx.save();

      // 移动到画布中心
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // 应用旋转
      ctx.rotate((options.rotation * Math.PI) / 180);

      // 应用翻转
      const scaleX = options.horizontal ? -1 : 1;
      const scaleY = options.vertical ? -1 : 1;
      ctx.scale(scaleX, scaleY);

      // 绘制图片（从中心点绘制）
      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );

      // 恢复状态
      ctx.restore();

      // 更新预览图片
      const transformedImage = canvas.toDataURL('image/png');
      setImage(transformedImage);
      
      if (showSuccessMessage) {
        toast.success(t("messages.flipSuccess"));
      }
    } catch (error) {
      console.error('Transformation error:', error);
      toast.error(t("errors.processFailed"));
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage, options, t]);

  // 当选项改变时自动应用变换
  useEffect(() => {
    if (originalImage) {
      applyTransformation(false);
    }
  }, [options, originalImage, applyTransformation]);

  // 下载图片
  const handleDownload = useCallback(() => {
    if (!image) return;

    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    const baseName = fileName.replace(/\.[^/.]+$/, "") || 'flipped-image';
    link.download = `${baseName}-flipped-${timestamp}.png`;
    link.href = image;
    link.click();
    
    toast.success(t("messages.imageDownloaded"));
  }, [image, fileName, t]);

  // 重置为原图
  const handleReset = useCallback(() => {
    if (originalImage) {
      setImage(originalImage);
      setOptions({
        horizontal: false,
        vertical: false,
        rotation: 0,
      });
    }
  }, [originalImage]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 隐藏的canvas用于图片处理 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* 隐藏的文件输入，始终存在以便随时可以重新上传 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 上传区域 */}
      {!image && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-8 md:p-12
            cursor-pointer transition-all duration-300
            ${isDragging ? 'scale-[1.02] shadow-xl' : 'hover:shadow-xl'}
          `}
        >

          {/* Upload Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {t("hero.uploadTitle")}
            </h2>
          </div>

          {/* Upload Icon Area */}
          <div className="mb-6">
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-12 md:p-16 flex items-center justify-center">
              <div className="relative">
                <Upload className="w-16 h-16 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Drag & Drop Text */}
          <div className="text-center mb-2">
            <p className="text-gray-900 dark:text-white font-medium text-base">
              {t("hero.dragText")}
            </p>
          </div>

          {/* Select File Text */}
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t("hero.selectText")}
            </p>
          </div>

          {/* Format and Size Badges */}
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-full">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t("hero.formats")}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-full">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t("hero.maxSize")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 图片预览和操作区域 */}
      {image && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* 预览卡片 */}
          <Card className="overflow-hidden border shadow-lg">
            <CardHeader className="border-b bg-white dark:bg-gray-900">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                {t("preview.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div 
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative rounded-lg bg-checkered min-h-[400px] flex items-center justify-center p-4 border cursor-pointer transition-colors group ${
                  isDragging 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
                }`}
              >
                <img 
                  src={image} 
                  alt="Preview" 
                  className="max-w-full max-h-[500px] object-contain pointer-events-none"
                />
                {/* 点击重新上传提示 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
                    {t("preview.clickToUpload", { defaultValue: "Click to upload a new image" })}
                  </span>
                </div>
              </div>
              {originalImage && image === originalImage && (
                <div className="text-xs text-center mt-4 p-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                  {t("hero.defaultImageHint")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 选项卡片 */}
          <Card className="overflow-hidden border shadow-lg">
            <CardHeader className="border-b bg-white dark:bg-gray-900">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                {t("options.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* 翻转控制 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 block">{t("options.flipOptions")}</Label>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <FlipHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <Label htmlFor="horizontal" className="cursor-pointer">{t("options.horizontalFlip")}</Label>
                  </div>
                  <Switch
                    id="horizontal"
                    checked={options.horizontal}
                    onCheckedChange={(checked) => setOptions({...options, horizontal: checked})}
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <FlipVertical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <Label htmlFor="vertical" className="cursor-pointer">{t("options.verticalFlip")}</Label>
                  </div>
                  <Switch
                    id="vertical"
                    checked={options.vertical}
                    onCheckedChange={(checked) => setOptions({...options, vertical: checked})}
                  />
                </div>
              </div>

              {/* 旋转控制 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2 block">{t("options.rotation")}</Label>
                <RadioGroup 
                  value={options.rotation.toString()}
                  onValueChange={(value) => setOptions({...options, rotation: parseInt(value) as 0 | 90 | 180 | 270})}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                    options.rotation === 0 
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}>
                    <RadioGroupItem value="0" id="r0" />
                    <Label htmlFor="r0" className="text-sm cursor-pointer">{t("options.rotation0")}</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                    options.rotation === 90 
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}>
                    <RadioGroupItem value="90" id="r90" />
                    <Label htmlFor="r90" className="text-sm cursor-pointer">{t("options.rotation90")}</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                    options.rotation === 180 
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}>
                    <RadioGroupItem value="180" id="r180" />
                    <Label htmlFor="r180" className="text-sm cursor-pointer">{t("options.rotation180")}</Label>
                  </div>
                  <div className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer ${
                    options.rotation === 270 
                      ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}>
                    <RadioGroupItem value="270" id="r270" />
                    <Label htmlFor="r270" className="text-sm cursor-pointer">{t("options.rotation270")}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3 pt-3">
                {isProcessing ? (
                  <div className="flex items-center justify-center py-3 text-blue-600 dark:text-blue-400">
                    <RotateCw className="w-5 h-5 mr-2 animate-spin" />
                    <span className="text-sm font-medium">{t("hero.processing")}</span>
                  </div>
                ) : (
                  <>
                    <Button 
                      onClick={handleDownload}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                      disabled={!image}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t("options.downloadButton")}
                    </Button>
                    
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t("options.resetButton")}
                    </Button>
                  </>
                )}
              </div>

              {/* 实时预览提示 */}
              <div className="text-xs text-center p-2 bg-green-50 dark:bg-green-950/30 rounded text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                ✓ {t("messages.realTimePreview")}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

