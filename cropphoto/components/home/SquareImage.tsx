"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Upload, Download, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { canvasRGBA } from "stackblur-canvas";

type ToolMode = "blur" | "color" | "resize" | "crop";
type DownloadSize = "1200" | "original" | "custom";
type DownloadFormat = "jpeg" | "png" | "webp";

interface ColorOption {
  id: string;
  value: string;
  label: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { id: "gray", value: "#6b7280", label: "灰色" },
  { id: "white", value: "#ffffff", label: "白色" },
  { id: "black", value: "#000000", label: "黑色" },
  { id: "red", value: "#ef4444", label: "红色" },
  { id: "green", value: "#10b981", label: "绿色" },
  { id: "blue", value: "#3b82f6", label: "蓝色" },
];

export default function SquareImage() {
  const t = useTranslations("SquareImage");
  
  // 状态管理
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 工具选项
  const [toolMode, setToolMode] = useState<ToolMode>("blur");
  const [blurAmount, setBlurAmount] = useState(20);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [customColor, setCustomColor] = useState("#000000");
  
  // 裁剪选项
  const [cropZoom, setCropZoom] = useState(100);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  
  // 下载选项
  const [downloadSize, setDownloadSize] = useState<DownloadSize>("1200");
  const [customSize, setCustomSize] = useState("2000");
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("jpeg");
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // 文件上传处理
  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("messages.unsupportedFormat"));
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(t("messages.fileTooLarge"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setFileName(file.name);
        setCropZoom(100);
        setCropOffsetX(0);
        setCropOffsetY(0);
        toast.success(t("messages.uploadSuccess"));
      };
      img.onerror = () => {
        toast.error(t("messages.loadFailed"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      toast.error(t("messages.readFailed"));
    };
    reader.readAsDataURL(file);
  }, [t]);

  // 拖拽处理
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
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

  // 粘贴处理
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
          }
          return;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handleFileSelect]);

  // 点击上传
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 渲染预览
  const renderPreview = useCallback(() => {
    if (!image || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // 计算显示大小（最大 400px）
    const maxOriginal = Math.max(image.width, image.height);
    const displaySize = Math.min(400, maxOriginal);
    
    canvas.width = displaySize;
    canvas.height = displaySize;

    const scale = displaySize / maxOriginal;

    try {
      if (toolMode === "blur") {
        // 模糊背景模式
        renderBlurMode(ctx, displaySize, scale);
      } else if (toolMode === "color") {
        // 纯色背景模式
        renderColorMode(ctx, displaySize, scale);
      } else if (toolMode === "resize") {
        // 调整大小模式
        ctx.drawImage(image, 0, 0, displaySize, displaySize);
      } else if (toolMode === "crop") {
        // 裁剪模式
        renderCropMode(ctx, displaySize, scale);
      }

      setPreviewImage(canvas.toDataURL());
    } catch (error) {
      console.error("Preview render error:", error);
    }
  }, [image, toolMode, blurAmount, selectedColor, cropZoom, cropOffsetX, cropOffsetY]);

  // 模糊模式渲染
  const renderBlurMode = (ctx: CanvasRenderingContext2D, size: number, scale: number) => {
    if (!image) return;

    // 绘制缩放的背景图
    const bgScaleX = size / image.width;
    const bgScaleY = size / image.height;
    const bgScale = Math.max(bgScaleX, bgScaleY);
    const bgWidth = image.width * bgScale;
    const bgHeight = image.height * bgScale;
    const bgX = (size - bgWidth) / 2;
    const bgY = (size - bgHeight) / 2;

    ctx.drawImage(image, bgX, bgY, bgWidth, bgHeight);

    // 应用模糊效果
    const blurValue = Math.floor(blurAmount * 0.5);
    if (blurValue >= 1) {
      canvasRGBA(
        ctx.canvas,
        0,
        0,
        size,
        size,
        Math.min(150, blurValue)
      );
    }

    // 在中心绘制清晰的原图
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (size - imgWidth) / 2;
    const imgY = (size - imgHeight) / 2;
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
  };

  // 纯色模式渲染
  const renderColorMode = (ctx: CanvasRenderingContext2D, size: number, scale: number) => {
    if (!image) return;

    // 填充背景色
    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, size, size);

    // 在中心绘制原图
    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (size - imgWidth) / 2;
    const imgY = (size - imgHeight) / 2;
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
  };

  // 裁剪模式渲染
  const renderCropMode = (ctx: CanvasRenderingContext2D, size: number, scale: number) => {
    if (!image) return;

    // 背景色
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, size, size);

    // 计算裁剪参数 (按照 HTML 的逻辑)
    const zoom = cropZoom / 100;
    const imgWidth = image.width * scale * zoom;
    const imgHeight = image.height * scale * zoom;
    const imgX = cropOffsetX + (size - imgWidth) / 2;
    const imgY = cropOffsetY + (size - imgHeight) / 2;

    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    // 绘制裁剪视口 (75% 区域)
    const vpSize = size * 0.75;
    const vpX = (size - vpSize) / 2;
    const vpY = (size - vpSize) / 2;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(vpX, vpY, vpSize, vpSize);

    // 绘制遮罩
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, size, vpY);
    ctx.fillRect(0, vpY, vpX, vpSize);
    ctx.fillRect(vpX + vpSize, vpY, size - vpX - vpSize, vpSize);
    ctx.fillRect(0, vpY + vpSize, size, size - vpY - vpSize);
  };

  // 当参数改变时重新渲染
  useEffect(() => {
    if (image) {
      renderPreview();
    }
  }, [image, renderPreview]);

  // 裁剪模式的鼠标事件
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolMode !== "crop") return;
    setIsDraggingCrop(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStartX(e.clientX - rect.left);
    setDragStartY(e.clientY - rect.top);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCrop || toolMode !== "crop") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const deltaX = currentX - dragStartX;
    const deltaY = currentY - dragStartY;
    
    setCropOffsetX((prev) => prev + deltaX);
    setCropOffsetY((prev) => prev + deltaY);
    setDragStartX(currentX);
    setDragStartY(currentY);
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCrop(false);
  };

  // 裁剪模式的滚轮缩放
  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (toolMode !== "crop") return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    setCropZoom((prev) => Math.max(100, Math.min(1000, prev + delta)));
  };

  // 下载功能
  const handleDownload = async () => {
    if (!image) {
      toast.error(t("messages.noImage"));
      return;
    }

    setIsProcessing(true);
    try {
      const size = downloadSize === "1200" 
        ? 1200 
        : downloadSize === "original" 
        ? Math.max(image.width, image.height)
        : parseInt(customSize) || 2000;

      console.log("Download settings:", { 
        downloadSize, 
        customSize, 
        calculatedSize: size,
        imageSize: { width: image.width, height: image.height }
      });

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("无法创建 Canvas 上下文");

      const scale = size / Math.max(image.width, image.height);

      if (toolMode === "blur") {
        renderBlurModeForDownload(ctx, size, scale);
      } else if (toolMode === "color") {
        renderColorModeForDownload(ctx, size, scale);
      } else if (toolMode === "resize") {
        ctx.drawImage(image, 0, 0, size, size);
      } else if (toolMode === "crop") {
        renderCropModeForDownload(ctx, size, scale);
      }

      const mimeType = 
        downloadFormat === "png" ? "image/png" 
        : downloadFormat === "webp" ? "image/webp" 
        : "image/jpeg";
      const quality = downloadFormat === "jpeg" ? 0.98 : 0.95;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error(t("messages.downloadFailed"));
            return;
          }

          const link = document.createElement("a");
          const extension = downloadFormat === "png" ? "png" : downloadFormat === "webp" ? "webp" : "jpg";
          link.download = `square-image-${Date.now()}.${extension}`;
          link.href = URL.createObjectURL(blob);
          link.click();
          setTimeout(() => URL.revokeObjectURL(link.href), 100);
          toast.success(t("messages.downloadSuccess"));
        },
        mimeType,
        quality
      );
    } catch (error) {
      console.error("Download error:", error);
      toast.error(t("messages.downloadFailed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const renderBlurModeForDownload = (ctx: CanvasRenderingContext2D, size: number, scale: number) => {
    if (!image) return;

    const bgScaleX = size / image.width;
    const bgScaleY = size / image.height;
    const bgScale = Math.max(bgScaleX, bgScaleY);
    const bgWidth = image.width * bgScale;
    const bgHeight = image.height * bgScale;
    const bgX = (size - bgWidth) / 2;
    const bgY = (size - bgHeight) / 2;

    ctx.drawImage(image, bgX, bgY, bgWidth, bgHeight);

    const blurValue = Math.floor(blurAmount * 0.5);
    if (blurValue >= 1) {
      canvasRGBA(ctx.canvas, 0, 0, size, size, Math.min(150, blurValue));
    }

    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (size - imgWidth) / 2;
    const imgY = (size - imgHeight) / 2;
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
  };

  const renderColorModeForDownload = (ctx: CanvasRenderingContext2D, size: number, scale: number) => {
    if (!image) return;

    ctx.fillStyle = selectedColor;
    ctx.fillRect(0, 0, size, size);

    const imgWidth = image.width * scale;
    const imgHeight = image.height * scale;
    const imgX = (size - imgWidth) / 2;
    const imgY = (size - imgHeight) / 2;
    ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
  };

  const renderCropModeForDownload = (ctx: CanvasRenderingContext2D, size: number, scale: number) => {
    if (!image) return;

    // 按照 HTML 的逻辑：先在下载尺寸画布上绘制，然后提取裁剪区域
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // 背景色
    tempCtx.fillStyle = "#f0f0f0";
    tempCtx.fillRect(0, 0, size, size);

    // 计算比例转换
    const maxOriginal = Math.max(image.width, image.height);
    const previewMax = Math.min(400, maxOriginal);
    const downloadScale = size / previewMax;

    // 应用缩放和偏移
    const zoom = cropZoom / 100;
    const scaledOffsetX = cropOffsetX * downloadScale;
    const scaledOffsetY = cropOffsetY * downloadScale;
    const imgWidth = image.width * scale * zoom;
    const imgHeight = image.height * scale * zoom;
    const imgX = scaledOffsetX + (size - imgWidth) / 2;
    const imgY = scaledOffsetY + (size - imgHeight) / 2;

    // 绘制图片
    tempCtx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

    // 提取裁剪视口区域 (75%)
    const vpSize = size * 0.75;
    const vpX = (size - vpSize) / 2;
    const vpY = (size - vpSize) / 2;
    const cropData = tempCtx.getImageData(vpX, vpY, vpSize, vpSize);

    // 将裁剪区域缩放到完整的下载尺寸
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = vpSize;
    cropCanvas.height = vpSize;
    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) return;
    
    cropCtx.putImageData(cropData, 0, 0);

    // 填充白色背景并绘制裁剪的图片
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(cropCanvas, 0, 0, vpSize, vpSize, 0, 0, size, size);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {!image && (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-lg p-8 md:p-12
            cursor-pointer transition-all duration-300
            ${isDragging ? "scale-[1.02] shadow-xl border-2 border-purple-500" : "hover:shadow-xl border-2 border-transparent"}
          `}
        >
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {t("hero.uploadTitle")}
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-2xl p-12 md:p-16 flex items-center justify-center">
              <Upload className="w-16 h-16 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
            </div>
          </div>

          <div className="text-center mb-2">
            <p className="text-gray-900 dark:text-white font-medium text-base">
              {t("hero.dragText")}
            </p>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t("hero.selectText")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-full">
              <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t("hero.formats")}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-full">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t("hero.maxSize")}
              </span>
            </div>
          </div>
        </div>
      )}

      {image && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
          {/* 预览区域 */}
          <Card className="overflow-hidden border shadow-lg">
            <CardHeader className="border-b bg-white dark:bg-gray-900">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {t("preview.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-800 rounded-lg">
                <canvas
                  ref={previewCanvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onWheel={handleCanvasWheel}
                  className={`max-w-full max-h-[500px] ${toolMode === "crop" ? "cursor-move" : ""}`}
                />
              </div>

              {/* 模式特定的控制选项 */}
              {toolMode === "blur" && (
                <div className="mt-6 space-y-2">
                  <Label className="flex justify-between items-center">
                    <span className="text-base font-medium">Blur Amount</span>
                    <span className="font-semibold text-lg">{blurAmount}</span>
                  </Label>
                  <Slider
                    value={[blurAmount]}
                    onValueChange={(value) => setBlurAmount(value[0])}
                    min={1}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {toolMode === "color" && (
                <div className="mt-6 space-y-3">
                  <Label className="text-base font-medium text-center block">Color</Label>
                  <div className="flex items-center justify-center gap-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-12 h-12 rounded-lg border-2 transition-all ${
                          selectedColor === color.value
                            ? "border-blue-600 dark:border-blue-400 scale-110 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800"
                            : "border-gray-300 dark:border-gray-600 hover:scale-105 hover:border-gray-400 dark:hover:border-gray-500"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                    <label
                      className={`w-12 h-12 rounded-lg border-2 transition-all cursor-pointer ${
                        !COLOR_OPTIONS.find(c => c.value === selectedColor)
                          ? "border-blue-600 dark:border-blue-400 scale-110 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800"
                          : "border-gray-300 dark:border-gray-600 hover:scale-105 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                      style={{ 
                        background: COLOR_OPTIONS.find(c => c.value === selectedColor) 
                          ? undefined 
                          : `conic-gradient(from 45deg, #ef4444, #f59e0b, #eab308, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)`
                      }}
                      title="Custom color"
                    >
                      <Input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setSelectedColor(e.target.value);
                        }}
                        className="w-full h-full opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              )}

              {toolMode === "crop" && (
                <div className="mt-6 space-y-2">
                  <Label className="flex justify-between items-center">
                    <span className="text-base font-medium">Zoom</span>
                    <span className="font-semibold text-lg">{cropZoom} %</span>
                  </Label>
                  <Slider
                    value={[cropZoom]}
                    onValueChange={(value) => setCropZoom(value[0])}
                    min={100}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}

              <div className="mt-4 text-center">
                <Button variant="outline" onClick={handleClick} size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  {t("download.changeImage")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 工具面板 */}
          <Card className="overflow-hidden border shadow-lg">
            <CardHeader className="border-b bg-white dark:bg-gray-900">
              <CardTitle className="text-lg font-semibold">{t("tools.title")}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant={toolMode === "blur" ? "default" : "outline"}
                  onClick={() => setToolMode("blur")}
                  className="w-full h-12"
                  size="lg"
                >
                  {t("tools.blurBackground")}
                </Button>
                <Button
                  variant={toolMode === "color" ? "default" : "outline"}
                  onClick={() => setToolMode("color")}
                  className="w-full h-12"
                  size="lg"
                >
                  {t("tools.colorBackground")}
                </Button>
                <Button
                  variant={toolMode === "resize" ? "default" : "outline"}
                  onClick={() => setToolMode("resize")}
                  className="w-full h-12"
                  size="lg"
                >
                  {t("tools.resize")}
                </Button>
                <Button
                  variant={toolMode === "crop" ? "default" : "outline"}
                  onClick={() => setToolMode("crop")}
                  className="w-full h-12"
                  size="lg"
                >
                  {t("tools.crop")}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-base font-semibold mb-3">{t("download.title")}</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <Select value={downloadSize} onValueChange={(v) => setDownloadSize(v as DownloadSize)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={t("download.size1200")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1200">{t("download.size1200")}</SelectItem>
                      <SelectItem value="original">{t("download.sizeOriginal")}</SelectItem>
                      <SelectItem value="custom">{t("download.sizeCustom")}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as DownloadFormat)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="JPEG" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WEBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {downloadSize === "custom" && (
                  <Input
                    type="number"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder={t("download.customPlaceholder")}
                    min="1"
                    max="10000"
                    className="mb-3 h-12"
                  />
                )}

                <Button
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="w-full h-12"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? t("download.processing") : t("download.button")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

