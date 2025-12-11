"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

type AspectRatioOption = {
  name: string;
  ratio: number | "custom" | "freedragging";
  preselected?: boolean;
};

const ASPECT_RATIOS: AspectRatioOption[] = [
  { name: "16:9", ratio: 16 / 9 },
  { name: "4:3", ratio: 4 / 3 },
  { name: "1:1", ratio: 1 },
  { name: "2:3", ratio: 2 / 3 },
  { name: "Custom Ratio", ratio: "custom", preselected: true },
  { name: "No fixed Ratio", ratio: "freedragging" },
];

const MAX_DISPLAY_SIZE = 800;

export default function AspectRatioChangerTool() {
  const t = useTranslations("AspectRatioChanger.tool");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLCanvasElement | null>(null);
  
  // Aspect ratio settings
  const [selectedRatio, setSelectedRatio] = useState<string>("Custom Ratio");
  const [customWidth, setCustomWidth] = useState("16");
  const [customHeight, setCustomHeight] = useState("9");
  
  // Crop settings
  const [cropZoom, setCropZoom] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Download settings
  const [downloadSize, setDownloadSize] = useState("original");
  const [customSize, setCustomSize] = useState("2000");
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg" | "webp">("png");

  // Get current aspect ratio
  const getCurrentRatio = (): number | null => {
    const option = ASPECT_RATIOS.find((r) => r.name === selectedRatio);
    if (!option) return null;
    
    if (option.ratio === "custom") {
      const w = parseFloat(customWidth) || 16;
      const h = parseFloat(customHeight) || 9;
      return w / h;
    }
    
    if (option.ratio === "freedragging") {
      return null; // No fixed ratio
    }
    
    return option.ratio as number;
  };

  // Process image
  useEffect(() => {
    if (image) {
      renderCrop();
    }
  }, [image, selectedRatio, customWidth, customHeight, cropZoom, offsetX, offsetY]);

  // Render crop preview
  const renderCrop = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate display size
    const scale = Math.min(1, MAX_DISPLAY_SIZE / Math.max(image.width, image.height));
    const displayWidth = Math.floor(image.width * scale);
    const displayHeight = Math.floor(image.height * scale);

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";

    // Draw image
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

    // Get aspect ratio
    const ratio = getCurrentRatio();
    
    // Calculate crop area
    let cropWidth = displayWidth;
    let cropHeight = displayHeight;
    
    if (ratio !== null) {
      // Fixed aspect ratio
      if (ratio > displayWidth / displayHeight) {
        cropWidth = displayWidth;
        cropHeight = displayWidth / ratio;
      } else {
        cropHeight = displayHeight;
        cropWidth = displayHeight * ratio;
      }
    } else {
      // Free dragging - use original image size
      cropWidth = displayWidth;
      cropHeight = displayHeight;
    }

    // Apply zoom
    const zoomFactor = cropZoom / 100;
    const zoomedWidth = cropWidth * zoomFactor;
    const zoomedHeight = cropHeight * zoomFactor;

    // Calculate crop position (centered by default, adjusted by offset)
    const cropX = (displayWidth - cropWidth) / 2 + offsetX;
    const cropY = (displayHeight - cropHeight) / 2 + offsetY;

    // Draw crop area overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    
    // Top
    ctx.fillRect(0, 0, displayWidth, Math.max(0, cropY));
    // Bottom
    ctx.fillRect(0, Math.min(displayHeight, cropY + cropHeight), displayWidth, displayHeight);
    // Left
    ctx.fillRect(0, cropY, Math.max(0, cropX), cropHeight);
    // Right
    ctx.fillRect(Math.min(displayWidth, cropX + cropWidth), cropY, displayWidth, cropHeight);

    // Draw crop border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);

    // Save processed canvas for download
    const processedCanvas = document.createElement("canvas");
    processedCanvas.width = displayWidth;
    processedCanvas.height = displayHeight;
    const processedCtx = processedCanvas.getContext("2d");
    if (processedCtx) {
      processedCtx.drawImage(canvas, 0, 0);
      setProcessedImage(processedCanvas);
    }
  };

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x: x - offsetX, y: y - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !image || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newOffsetX = x - dragStart.x;
    const newOffsetY = y - dragStart.y;
    
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  // Load image
  const loadImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("messages.invalidFile"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setCropZoom(100);
        setOffsetX(0);
        setOffsetY(0);
        toast.success(t("messages.imageLoaded"));
      };
      img.onerror = () => {
        toast.error(t("messages.loadingFailed"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      toast.error(t("messages.readFileFailed"));
    };
    reader.readAsDataURL(file);
  };

  // Handle download
  const handleDownload = async () => {
    if (!image) {
      toast.error(t("messages.noImageToDownload"));
      return;
    }

    try {
      const ratio = getCurrentRatio();
      let outputWidth: number;
      let outputHeight: number;

      if (downloadSize === "original") {
        // Use original image dimensions
        const imgRatio = image.width / image.height;
        
        if (ratio !== null) {
          // Fixed aspect ratio
          if (ratio > imgRatio) {
            outputWidth = image.width;
            outputHeight = image.width / ratio;
          } else {
            outputHeight = image.height;
            outputWidth = image.height * ratio;
          }
        } else {
          // Free dragging - use original size
          outputWidth = image.width;
          outputHeight = image.height;
        }
      } else if (downloadSize === "custom") {
        const size = parseInt(customSize) || 2000;
        if (ratio !== null) {
          if (ratio > 1) {
            outputWidth = size;
            outputHeight = size / ratio;
          } else {
            outputHeight = size;
            outputWidth = size * ratio;
          }
        } else {
          // Free dragging - maintain aspect ratio
          const imgRatio = image.width / image.height;
          if (imgRatio > 1) {
            outputWidth = size;
            outputHeight = size / imgRatio;
          } else {
            outputHeight = size;
            outputWidth = size * imgRatio;
          }
        }
      } else {
        const size = parseInt(downloadSize) || 1200;
        if (ratio !== null) {
          if (ratio > 1) {
            outputWidth = size;
            outputHeight = size / ratio;
          } else {
            outputHeight = size;
            outputWidth = size * ratio;
          }
        } else {
          const imgRatio = image.width / image.height;
          if (imgRatio > 1) {
            outputWidth = size;
            outputHeight = size / imgRatio;
          } else {
            outputHeight = size;
            outputWidth = size * imgRatio;
          }
        }
      }

      // Create download canvas
      const downloadCanvas = document.createElement("canvas");
      downloadCanvas.width = Math.floor(outputWidth);
      downloadCanvas.height = Math.floor(outputHeight);
      const ctx = downloadCanvas.getContext("2d");
      if (!ctx) return;

      // Calculate source crop area
      const scale = Math.min(1, MAX_DISPLAY_SIZE / Math.max(image.width, image.height));
      const displayWidth = Math.floor(image.width * scale);
      const displayHeight = Math.floor(image.height * scale);
      
      const currentRatio = getCurrentRatio();
      let cropWidth = displayWidth;
      let cropHeight = displayHeight;
      
      if (currentRatio !== null) {
        if (currentRatio > displayWidth / displayHeight) {
          cropWidth = displayWidth;
          cropHeight = displayWidth / currentRatio;
        } else {
          cropHeight = displayHeight;
          cropWidth = displayHeight * currentRatio;
        }
      }

      const zoomFactor = cropZoom / 100;
      const zoomedWidth = cropWidth * zoomFactor;
      const zoomedHeight = cropHeight * zoomFactor;
      
      const cropX = (displayWidth - cropWidth) / 2 + offsetX;
      const cropY = (displayHeight - cropHeight) / 2 + offsetY;

      // Calculate source coordinates in original image
      const sourceX = (cropX / scale);
      const sourceY = (cropY / scale);
      const sourceWidth = (zoomedWidth / scale);
      const sourceHeight = (zoomedHeight / scale);

      // Draw cropped image
      ctx.drawImage(
        image,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(image.width, sourceWidth),
        Math.min(image.height, sourceHeight),
        0,
        0,
        downloadCanvas.width,
        downloadCanvas.height
      );

      // Download
      const mimeType = downloadFormat === "jpeg" ? "image/jpeg" : downloadFormat === "webp" ? "image/webp" : "image/png";
      const quality = downloadFormat === "jpeg" ? 0.92 : undefined;
      
      downloadCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error(t("messages.downloadFailed"));
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `aspect-ratio-changed.${downloadFormat}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(t("messages.downloadSuccess"));
      }, mimeType, quality);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(t("messages.downloadFailed"));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
          {t("title")}
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          {t("description")}
        </p>

        {/* Upload Area */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">{t("upload.title")}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("upload.subtitle")}</p>
            </div>
          </CardContent>
        </Card>

        {image && (
          <>
            {/* Preview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{t("preview.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={containerRef} className="flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-300 dark:border-gray-700 rounded-lg cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Aspect Ratio */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.aspectRatio.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t("settings.aspectRatio.select")}</Label>
                    <Select value={selectedRatio} onValueChange={setSelectedRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.name} value={ratio.name}>
                            {ratio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRatio === "Custom Ratio" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t("settings.aspectRatio.width")}</Label>
                        <Input
                          type="number"
                          value={customWidth}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomWidth(e.target.value)}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>{t("settings.aspectRatio.height")}</Label>
                        <Input
                          type="number"
                          value={customHeight}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomHeight(e.target.value)}
                          min="1"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Crop Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.crop.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t("settings.crop.zoom")}: {cropZoom}%</Label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={cropZoom}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCropZoom(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("settings.crop.positionX")}</Label>
                      <Input
                        type="number"
                        value={Math.round(offsetX)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOffsetX(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label>{t("settings.crop.positionY")}</Label>
                      <Input
                        type="number"
                        value={Math.round(offsetY)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOffsetY(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("settings.crop.hint")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Download */}
            <Card>
              <CardHeader>
                <CardTitle>{t("download.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t("download.size")}</Label>
                    <Select value={downloadSize} onValueChange={setDownloadSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">{t("download.sizeOriginal")}</SelectItem>
                        <SelectItem value="1200">1200px</SelectItem>
                        <SelectItem value="custom">{t("download.sizeCustom")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {downloadSize === "custom" && (
                    <div>
                      <Label>{t("download.customSize")}</Label>
                      <Input
                        type="number"
                        value={customSize}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomSize(e.target.value)}
                        min="100"
                        placeholder={t("download.customSizePlaceholder")}
                      />
                    </div>
                  )}
                  <div>
                    <Label>{t("download.format")}</Label>
                    <Select
                      value={downloadFormat}
                      onValueChange={(value: "png" | "jpeg" | "webp") => setDownloadFormat(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="webp">WEBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleDownload} className="w-full" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  {t("download.button")}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

