"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, useEffect } from "react";
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
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE = 800; // 提高预览质量
const BOUNDARY_SIZE = 400;
const VIEWPORT_SIZE = 300;

export default function SquareCrop() {
  const t = useTranslations("SquareCrop");
  
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [downloadSize, setDownloadSize] = useState("original");
  const [downloadFormat, setDownloadFormat] = useState("jpeg");
  const [customSize, setCustomSize] = useState("2000");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 重置裁剪状态
  const resetCrop = () => {
    if (!processedImage) return;
    // 计算让图片填满整个预览区所需的最小缩放
    const minZoomForBoundary = Math.max(
      BOUNDARY_SIZE / processedImage.width,
      BOUNDARY_SIZE / processedImage.height
    );
    // 计算让图片至少填满裁剪框所需的最小缩放
    const minZoomForViewport = Math.max(
      VIEWPORT_SIZE / processedImage.width,
      VIEWPORT_SIZE / processedImage.height
    );
    // 使用较大的缩放值，确保图片填满预览区
    const initialZoomPercent = Math.round((minZoomForBoundary / minZoomForViewport) * 100);
    setZoom(Math.max(100, initialZoomPercent));
    setOffsetX(0);
    setOffsetY(0);
  };

  // 限制偏移量
  const constrainOffsets = (img: HTMLImageElement, z: number, ox: number, oy: number) => {
    const minZoom = Math.max(
      VIEWPORT_SIZE / img.width,
      VIEWPORT_SIZE / img.height
    );
    const actualZoom = minZoom * (z / 100);
    const scaledW = img.width * actualZoom;
    const scaledH = img.height * actualZoom;

    let newOx = ox;
    let newOy = oy;

    if (scaledW > VIEWPORT_SIZE) {
      const maxOff = (scaledW - VIEWPORT_SIZE) / 2;
      newOx = Math.max(-maxOff, Math.min(maxOff, ox));
    } else {
      newOx = 0;
    }

    if (scaledH > VIEWPORT_SIZE) {
      const maxOff = (scaledH - VIEWPORT_SIZE) / 2;
      newOy = Math.max(-maxOff, Math.min(maxOff, oy));
    } else {
      newOy = 0;
    }

    return { x: newOx, y: newOy };
  };

  // 渲染裁剪预览
  const renderCrop = () => {
    if (!processedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const constrained = constrainOffsets(processedImage, zoom, offsetX, offsetY);
    setOffsetX(constrained.x);
    setOffsetY(constrained.y);

    canvas.width = BOUNDARY_SIZE;
    canvas.height = BOUNDARY_SIZE;

    ctx.clearRect(0, 0, BOUNDARY_SIZE, BOUNDARY_SIZE);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, BOUNDARY_SIZE, BOUNDARY_SIZE);

    const minZoom = Math.max(
      VIEWPORT_SIZE / processedImage.width,
      VIEWPORT_SIZE / processedImage.height
    );
    const actualZoom = minZoom * (zoom / 100);
    const scaledW = processedImage.width * actualZoom;
    const scaledH = processedImage.height * actualZoom;
    const drawX = constrained.x + (BOUNDARY_SIZE - scaledW) / 2;
    const drawY = constrained.y + (BOUNDARY_SIZE - scaledH) / 2;

    ctx.drawImage(processedImage, drawX, drawY, scaledW, scaledH);
  };

  // 图片调整大小
  const resizeImage = (img: HTMLImageElement, maxDim: number): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const w = img.width;
      const h = img.height;

      if (w <= maxDim && h <= maxDim) {
        resolve(img);
        return;
      }

      const scale = maxDim / Math.max(w, h);
      const nw = Math.floor(w * scale);
      const nh = Math.floor(h * scale);

      const temp = document.createElement("canvas");
      temp.width = nw;
      temp.height = nh;
      const tCtx = temp.getContext("2d", { willReadFrequently: true });
      if (!tCtx) {
        resolve(img);
        return;
      }

      tCtx.drawImage(img, 0, 0, nw, nh);

      const newImg = new Image();
      newImg.onload = () => resolve(newImg);
      newImg.src = temp.toDataURL();
    });
  };

  // 加载图片
  const loadImage = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error(t("messages.invalidFile"));
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const img = new Image();
        
        img.onload = async () => {
          setImage(img);
          const resized = await resizeImage(img, MAX_SIZE);
          setProcessedImage(resized);
          resetCrop();
          setIsProcessing(false);
          
          // 等待下一帧再渲染
          requestAnimationFrame(() => renderCrop());
        };

        img.onerror = () => {
          toast.error(t("messages.loadingFailed"));
          setIsProcessing(false);
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        toast.error(t("messages.readFileFailed"));
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(t("messages.loadingFailed"));
      setIsProcessing(false);
    }
  };

  // 下载图片
  const handleDownload = async () => {
    if (!image || !processedImage) {
      toast.error(t("messages.noImageToDownload"));
      return;
    }

    try {
      let targetSize: number;
      
      if (downloadSize === "1200") {
        targetSize = 1200;
      } else if (downloadSize === "custom") {
        targetSize = Math.max(1, Math.min(10000, parseInt(customSize) || 2000));
      } else {
        // Original size - 使用原始图片尺寸计算
        const origScale = Math.max(image.width, image.height) / MAX_SIZE;
        targetSize = Math.round(VIEWPORT_SIZE * origScale);
      }

      const mimeType =
        downloadFormat === "png"
          ? "image/png"
          : downloadFormat === "webp"
          ? "image/webp"
          : "image/jpeg";
      const quality = downloadFormat === "jpeg" ? 1.0 : 0.98; // 提高质量
      const extension =
        downloadFormat === "png" ? "png" : downloadFormat === "webp" ? "webp" : "jpg";

      // 计算原始图片和预览图片的缩放比例
      const origToProcessedScale = Math.max(image.width, image.height) / MAX_SIZE;
      
      // 计算预览中的缩放参数对应到原始图片的值
      const minZoom = Math.max(
        VIEWPORT_SIZE / processedImage.width,
        VIEWPORT_SIZE / processedImage.height
      );
      const actualZoom = minZoom * (zoom / 100);
      
      // 在原始图片尺寸下的参数
      const origMinZoom = Math.max(
        (VIEWPORT_SIZE * origToProcessedScale) / image.width,
        (VIEWPORT_SIZE * origToProcessedScale) / image.height
      );
      const origActualZoom = origMinZoom * (zoom / 100);
      const origScaledW = image.width * origActualZoom;
      const origScaledH = image.height * origActualZoom;
      const origBoundarySize = BOUNDARY_SIZE * origToProcessedScale;
      const origViewportSize = VIEWPORT_SIZE * origToProcessedScale;
      const origOffsetX = offsetX * origToProcessedScale;
      const origOffsetY = offsetY * origToProcessedScale;
      
      // 计算裁剪区域在原始图片上的位置
      const origDrawX = origOffsetX + (origBoundarySize - origScaledW) / 2;
      const origDrawY = origOffsetY + (origBoundarySize - origScaledH) / 2;
      const origVpX = (origBoundarySize - origViewportSize) / 2;
      const origVpY = (origBoundarySize - origViewportSize) / 2;
      
      // 计算需要从原始图片裁剪的区域
      const cropX = (origVpX - origDrawX) / origActualZoom;
      const cropY = (origVpY - origDrawY) / origActualZoom;
      const cropW = origViewportSize / origActualZoom;
      const cropH = origViewportSize / origActualZoom;

      // 创建最终画布并直接从原始图片裁剪
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = targetSize;
      finalCanvas.height = targetSize;
      const finalCtx = finalCanvas.getContext("2d", { alpha: downloadFormat === "png" });
      if (!finalCtx) return;

      // 白色背景
      if (downloadFormat !== "png") {
        finalCtx.fillStyle = "#ffffff";
        finalCtx.fillRect(0, 0, targetSize, targetSize);
      }

      // 直接从原始图片裁剪并绘制到目标尺寸
      finalCtx.drawImage(
        image,
        cropX, cropY, cropW, cropH,
        0, 0, targetSize, targetSize
      );

      // 转换为 Blob 并下载
      finalCanvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.download = `square-crop.${extension}`;
          a.href = url;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 100);
          toast.success(t("messages.downloadSuccess"));
        },
        mimeType,
        quality
      );
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(t("messages.downloadFailed"));
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  // 处理拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  // 处理粘贴
  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        toast.error(t("messages.clipboardNotSupported"));
        return;
      }

      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], `pasted-image.${type.split("/")[1]}`, {
              type: type,
            });
            loadImage(file);
            return;
          }
        }
      }
      toast.error(t("messages.noImageInClipboard"));
    } catch (error) {
      toast.error(t("messages.pasteFailed"));
    }
  };

  // 鼠标拖动
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!processedImage) return;
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !canvasRef.current || !processedImage) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scale = BOUNDARY_SIZE / rect.width;
    const dx = (x - dragStart.x) * scale;
    const dy = (y - dragStart.y) * scale;

    setOffsetX((prev) => prev + dx);
    setOffsetY((prev) => prev + dy);
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!processedImage) return;
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -20 : 20;
    const newZoom = Math.max(100, Math.min(1000, zoom + delta));
    
    const minZoom = Math.max(
      VIEWPORT_SIZE / processedImage.width,
      VIEWPORT_SIZE / processedImage.height
    );
    const oldActualZoom = minZoom * (zoom / 100);
    const newActualZoom = minZoom * (newZoom / 100);
    const ratio = newActualZoom / oldActualZoom;

    setZoom(newZoom);
    setOffsetX((prev) => prev * ratio);
    setOffsetY((prev) => prev * ratio);
  };

  // 缩放滑块变化
  const handleZoomChange = (value: number[]) => {
    if (!processedImage) return;
    
    const newZoom = value[0];
    const minZoom = Math.max(
      VIEWPORT_SIZE / processedImage.width,
      VIEWPORT_SIZE / processedImage.height
    );
    const oldActualZoom = minZoom * (zoom / 100);
    const newActualZoom = minZoom * (newZoom / 100);
    const ratio = newActualZoom / oldActualZoom;

    setZoom(newZoom);
    setOffsetX((prev) => prev * ratio);
    setOffsetY((prev) => prev * ratio);
  };

  // 监听鼠标事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart, processedImage]);

  // 渲染画布
  useEffect(() => {
    if (processedImage) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(renderCrop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [processedImage, zoom, offsetX, offsetY]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* 隐藏的文件输入框 - 放在外层以便在所有状态下都能访问 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {processedImage ? (
        // 编辑区域
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
          {/* 左侧 - 预览卡片 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="w-5 h-5" />
                {t("settings.preview")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 预览区域 */}
              <div className="flex justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <div className="relative" style={{ width: BOUNDARY_SIZE, height: BOUNDARY_SIZE }}>
                  <canvas
                    ref={canvasRef}
                    className="cursor-grab active:cursor-grabbing rounded-lg"
                    style={{ width: "100%", height: "100%" }}
                    onMouseDown={handleMouseDown}
                    onWheel={handleWheel}
                  />
                  {/* 裁剪框 */}
                  <div
                    className="absolute border-2 border-white pointer-events-none"
                    style={{
                      width: VIEWPORT_SIZE,
                      height: VIEWPORT_SIZE,
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
              </div>

              {/* Zoom 控制 */}
              <div className="flex items-center justify-center gap-4">
                <Label className="text-sm font-medium whitespace-nowrap">
                  {t("settings.zoom")}
                </Label>
                <Slider
                  value={[zoom]}
                  onValueChange={handleZoomChange}
                  min={100}
                  max={1000}
                  step={10}
                  className="w-64"
                />
                <span className="text-sm font-semibold min-w-[50px] text-right">
                  {zoom} %
                </span>
              </div>

              {/* Change Image 按钮 */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-xs"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t("download.changeImage")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 右侧 - 下载设置卡片 */}
          <Card className="w-full lg:w-[280px]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {t("settings.cropSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 下载设置 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t("download.title")}
                </Label>
                <div className="space-y-2">
                  <Select value={downloadSize} onValueChange={setDownloadSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Original" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1200">1200px</SelectItem>
                      <SelectItem value="original">{t("download.sizeOriginal")}</SelectItem>
                      <SelectItem value="custom">{t("download.sizeCustom")}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="JPEG" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="webp">WEBP</SelectItem>
                    </SelectContent>
                  </Select>

                  {downloadSize === "custom" && (
                    <Input
                      type="number"
                      placeholder={t("download.customPlaceholder")}
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      min="1"
                      max="10000"
                    />
                  )}
                </div>
              </div>

              {/* 下载按钮 */}
              <Button 
                onClick={handleDownload} 
                className="w-full" 
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("download.button")}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

