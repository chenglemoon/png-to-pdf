"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Edit2, X } from "lucide-react";
import SocialMediaSizeSelector, { SocialMediaSize } from "./SocialMediaSizeSelector";

const MAX_DISPLAY_SIZE = 500;
const VARIANT_PREVIEW_SIZE = 600; // 大幅增加预览尺寸以提高清晰度

type BackgroundType = "solid" | "gradient";
type FilterType = "none" | "grayscale" | "sepia" | "blackwhite" | "vintage";
type CanvasShape = "square" | "circle" | "rounded" | "rectangle4x5";

interface VariantConfig {
  id: string;
  name: string;
  backgroundType: BackgroundType;
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  showOutline: boolean;
  outlineColor: string;
  outlineThickness: number;
  filterType: FilterType;
  scale: number;
  rotate: number;
  canvasShape: CanvasShape;
}

export default function ProfilePictureMaker() {
  const t = useTranslations("ProfilePictureMaker");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [showVariants, setShowVariants] = useState(false);
  const [variants, setVariants] = useState<VariantConfig[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [enlargedVariant, setEnlargedVariant] = useState<string | null>(null);
  
  type VariantSetType = "colorSet1" | "colorSet2" | "colors2024" | "brightColors" | "borders" | "socialMedia" | "blackWhite2";
  const [activeVariantSet, setActiveVariantSet] = useState<VariantSetType>("colorSet1");
  
  // Background settings
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("solid");
  const [backgroundColor, setBackgroundColor] = useState("#B86CF9");
  const [gradientStart, setGradientStart] = useState("#B86CF9");
  const [gradientEnd, setGradientEnd] = useState("#3B82F6");

  // Outline/Border settings
  const [showOutline, setShowOutline] = useState(true);
  const [outlineColor, setOutlineColor] = useState("#FFFFFF");
  const [outlineThickness, setOutlineThickness] = useState(0.05);

  // Filter settings
  const [filterType, setFilterType] = useState<FilterType>("none");

  // Shadow settings
  const [showShadow, setShowShadow] = useState(true);
  const [shadowBlur, setShadowBlur] = useState(0.1);
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(0);

  // Transform settings
  const [scale, setScale] = useState(100);
  const [rotate, setRotate] = useState(0);

  // Canvas shape
  const [canvasShape, setCanvasShape] = useState<CanvasShape>("square");

  // Download settings
  const [downloadSize, setDownloadSize] = useState("1200");
  const [downloadFormat, setDownloadFormat] = useState("png");
  const [selectedSocialMediaSize, setSelectedSocialMediaSize] = useState<SocialMediaSize | null>(null);
  const [useSocialMediaSize, setUseSocialMediaSize] = useState(false);

  // 生成变体配置 - 根据不同类型生成不同的变体集合
  const generateVariants = (setType: VariantSetType): VariantConfig[] => {
    switch (setType) {
      case "colorSet1":
        // Color set #1: 鲜艳明亮的彩色背景 + 彩色肖像，轮廓稍细
        return [
          { id: "cs1-v1", name: "Vibrant Orange", backgroundType: "solid", backgroundColor: "#FF4500", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v2", name: "Deep Teal", backgroundType: "solid", backgroundColor: "#008B8B", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v3", name: "Rich Green", backgroundType: "solid", backgroundColor: "#00C851", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v4", name: "Golden Amber", backgroundType: "solid", backgroundColor: "#FF8C00", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v5", name: "Bright Cyan", backgroundType: "solid", backgroundColor: "#00BCD4", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v6", name: "Coral", backgroundType: "solid", backgroundColor: "#FF7F50", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v7", name: "Sunny Yellow", backgroundType: "solid", backgroundColor: "#FFD700", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v8", name: "Crimson Red", backgroundType: "solid", backgroundColor: "#DC143C", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v9", name: "Hot Pink", backgroundType: "solid", backgroundColor: "#FF1493", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v10", name: "Royal Purple", backgroundType: "solid", backgroundColor: "#8B00FF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v11", name: "Lime", backgroundType: "solid", backgroundColor: "#32CD32", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v12", name: "Fuchsia", backgroundType: "solid", backgroundColor: "#FF00FF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v13", name: "Deep Blue", backgroundType: "solid", backgroundColor: "#0000CD", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v14", name: "Forest Green", backgroundType: "solid", backgroundColor: "#228B22", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v15", name: "Tomato", backgroundType: "solid", backgroundColor: "#FF6347", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "cs1-v16", name: "Indigo", backgroundType: "solid", backgroundColor: "#4B0082", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.05, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
        ];

      case "colorSet2":
        // Color set #2: 柔和淡雅的彩色背景 + 彩色肖像，轮廓稍粗，肖像稍小
        return [
          { id: "cs2-v1", name: "Soft Lavender", backgroundType: "solid", backgroundColor: "#E6E6FA", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v2", name: "Light Periwinkle", backgroundType: "solid", backgroundColor: "#CCCCFF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v3", name: "Peach Blush", backgroundType: "solid", backgroundColor: "#FFCCCB", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v4", name: "Soft Purple", backgroundType: "solid", backgroundColor: "#DDA0DD", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v5", name: "Mint Green", backgroundType: "solid", backgroundColor: "#B2F5EA", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v6", name: "Vanilla Cream", backgroundType: "solid", backgroundColor: "#FFFDD0", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v7", name: "Powder Blue", backgroundType: "solid", backgroundColor: "#B0E0E6", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v8", name: "Lilac", backgroundType: "solid", backgroundColor: "#E6CCFF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v9", name: "Aqua", backgroundType: "solid", backgroundColor: "#E0F7FA", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v10", name: "Rose Pink", backgroundType: "solid", backgroundColor: "#FFB6C1", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v11", name: "Lavender Mist", backgroundType: "solid", backgroundColor: "#F0E6FF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v12", name: "Apricot", backgroundType: "solid", backgroundColor: "#FFE5B4", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v13", name: "Blush", backgroundType: "solid", backgroundColor: "#FFE4E1", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v14", name: "Sky", backgroundType: "solid", backgroundColor: "#87CEEB", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v15", name: "Sandy", backgroundType: "solid", backgroundColor: "#F4A460", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "cs2-v16", name: "Cornflower", backgroundType: "solid", backgroundColor: "#9EC5FF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.07, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
        ];

      case "brightColors":
        // Bright Colors: 黑白肖像配明亮彩色背景
        return [
          { id: "bc-v1", name: "Bright Red", backgroundType: "solid", backgroundColor: "#FF0000", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.06, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bc-v2", name: "Neon Yellow", backgroundType: "solid", backgroundColor: "#FFFF00", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.06, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bc-v3", name: "Vibrant Purple", backgroundType: "solid", backgroundColor: "#8B00FF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.06, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bc-v4", name: "Teal", backgroundType: "solid", backgroundColor: "#00FFFF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.06, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bc-v5", name: "Sky Blue", backgroundType: "solid", backgroundColor: "#87CEEB", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.06, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bc-v6", name: "Bright Green", backgroundType: "solid", backgroundColor: "#00FF00", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.06, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bc-v7", name: "Hot Pink", backgroundType: "solid", backgroundColor: "#FF69B4", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.06, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bc-v8", name: "Royal Blue", backgroundType: "solid", backgroundColor: "#4169E1", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.06, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
        ];

      case "colors2024":
        // Colors 2024: 混合效果 - 灰度、彩色、半色调，不同轮廓颜色
        return [
          { id: "c2024-v1", name: "Medium Blue", backgroundType: "solid", backgroundColor: "#4169E1", showOutline: true, outlineColor: "#000000", outlineThickness: 0.08, filterType: "grayscale", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v2", name: "Bright Cyan", backgroundType: "solid", backgroundColor: "#00FFFF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.08, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v3", name: "Magenta", backgroundType: "solid", backgroundColor: "#FF00FF", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.08, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v4", name: "Bright Yellow", backgroundType: "solid", backgroundColor: "#FFFF00", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.08, filterType: "vintage", scale: 100, rotate: 0, canvasShape: "square" }, // 半色调效果用vintage模拟
          { id: "c2024-v5", name: "Purple", backgroundType: "solid", backgroundColor: "#9370DB", showOutline: true, outlineColor: "#000000", outlineThickness: 0.08, filterType: "grayscale", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v6", name: "Gradient Blue Yellow", backgroundType: "gradient", gradientStart: "#4169E1", gradientEnd: "#FFD700", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.08, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v7", name: "Light Gray", backgroundType: "solid", backgroundColor: "#D3D3D3", showOutline: true, outlineColor: "#FF6347", outlineThickness: 0.08, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" }, // 渐变轮廓用单色模拟
          { id: "c2024-v8", name: "Bright Yellow 2", backgroundType: "solid", backgroundColor: "#FFFF00", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.08, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v9", name: "Light Blue", backgroundType: "solid", backgroundColor: "#ADD8E6", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.08, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v10", name: "Gradient Orange Pink", backgroundType: "gradient", gradientStart: "#FF8C00", gradientEnd: "#FF69B4", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.08, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v11", name: "Light Purple", backgroundType: "solid", backgroundColor: "#DDA0DD", showOutline: true, outlineColor: "#FFFF00", outlineThickness: 0.08, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "c2024-v12", name: "Bright Yellow 3", backgroundType: "solid", backgroundColor: "#FFFF00", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.08, filterType: "grayscale", scale: 100, rotate: 0, canvasShape: "square" },
        ];

      case "borders":
        // Borders: 不同边框样式
        return [
          { id: "b-v1", name: "Yellow Frame", backgroundType: "solid", backgroundColor: "#FFFF00", showOutline: true, outlineColor: "#000000", outlineThickness: 0.12, filterType: "grayscale", scale: 85, rotate: 0, canvasShape: "square" },
          { id: "b-v2", name: "Gradient Frame", backgroundType: "solid", backgroundColor: "#FFFFFF", showOutline: true, outlineColor: "#A855F7", outlineThickness: 0.15, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "b-v3", name: "Yellow Background", backgroundType: "solid", backgroundColor: "#FFFF00", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.12, filterType: "grayscale", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "b-v4", name: "Black Background", backgroundType: "solid", backgroundColor: "#000000", showOutline: true, outlineColor: "#FF6347", outlineThickness: 0.12, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
        ];

      case "socialMedia":
        // Social Media: 社交媒体风格 - 简化版
        return [
          { id: "sm-v1", name: "Gradient Outline Black", backgroundType: "solid", backgroundColor: "#000000", showOutline: true, outlineColor: "#A855F7", outlineThickness: 0.15, filterType: "grayscale", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "sm-v2", name: "Gradient Outline Black 2", backgroundType: "solid", backgroundColor: "#000000", showOutline: true, outlineColor: "#EC4899", outlineThickness: 0.15, filterType: "grayscale", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "sm-v3", name: "Gradient Frame White", backgroundType: "solid", backgroundColor: "#FFFFFF", showOutline: true, outlineColor: "#FF6B6B", outlineThickness: 0.15, filterType: "none", scale: 90, rotate: 0, canvasShape: "square" },
          { id: "sm-v4", name: "Yellow Background", backgroundType: "solid", backgroundColor: "#FFFF00", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.1, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "sm-v5", name: "Dark Gray Background", backgroundType: "solid", backgroundColor: "#2C2C2C", showOutline: true, outlineColor: "#FFFFFF", outlineThickness: 0.1, filterType: "none", scale: 100, rotate: 0, canvasShape: "square" },
        ];

      case "blackWhite2":
        // Black and White #2: 黑白风格变体
        return [
          { id: "bw2-v1", name: "Yellow Outline Mesh", backgroundType: "solid", backgroundColor: "#000000", showOutline: true, outlineColor: "#FFFF00", outlineThickness: 0.15, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bw2-v2", name: "Gradient Outline Grunge", backgroundType: "solid", backgroundColor: "#1A1A1A", showOutline: true, outlineColor: "#A855F7", outlineThickness: 0.15, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
          { id: "bw2-v3", name: "Spotlight Gradient", backgroundType: "gradient", gradientStart: "#D3D3D3", gradientEnd: "#2C2C2C", showOutline: false, outlineColor: "#FFFFFF", outlineThickness: 0, filterType: "blackwhite", scale: 100, rotate: 0, canvasShape: "square" },
        ];

      default:
        return [];
    }
  };

  // 处理图片上传
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("messages.invalidFile"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // 生成默认变体集合
        const generatedVariants = generateVariants(activeVariantSet);
        setVariants(generatedVariants);
        setShowVariants(true);
        setSelectedVariant(null);
        toast.success(t("messages.imageLoaded"));
      };
      img.onerror = () => {
        toast.error(t("messages.loadingFailed"));
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.onerror = () => {
      toast.error(t("messages.readFileFailed"));
    };
    reader.readAsDataURL(file);
  };

  // 选择变体进行编辑
  const handleSelectVariant = (variant: VariantConfig) => {
    setSelectedVariant(variant.id);
    setShowVariants(false);
    // 应用变体设置
    setBackgroundType(variant.backgroundType);
    if (variant.backgroundColor) setBackgroundColor(variant.backgroundColor);
    if (variant.gradientStart) setGradientStart(variant.gradientStart);
    if (variant.gradientEnd) setGradientEnd(variant.gradientEnd);
    setShowOutline(variant.showOutline);
    setOutlineColor(variant.outlineColor);
    setOutlineThickness(variant.outlineThickness);
    setFilterType(variant.filterType);
    setScale(variant.scale);
    setRotate(variant.rotate);
    setCanvasShape(variant.canvasShape);
  };

  // 渲染单个变体预览
  const renderVariantPreview = (variant: VariantConfig): string | null => {
    if (!image) return null;

    const canvas = document.createElement("canvas");
    // 对于4:5长方形，使用正确的宽高比
    if (variant.canvasShape === "rectangle4x5") {
      canvas.width = VARIANT_PREVIEW_SIZE;
      canvas.height = VARIANT_PREVIEW_SIZE * (5 / 4);
    } else {
      canvas.width = VARIANT_PREVIEW_SIZE;
      canvas.height = VARIANT_PREVIEW_SIZE;
    }
    const ctx = canvas.getContext("2d", { 
      willReadFrequently: false,
      alpha: true,
      desynchronized: false 
    });
    if (!ctx) return null;

    // 启用高质量图像渲染
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    if (variant.backgroundType === "solid" && variant.backgroundColor) {
      ctx.fillStyle = variant.backgroundColor;
    } else if (variant.backgroundType === "gradient" && variant.gradientStart && variant.gradientEnd) {
      const gradient = ctx.createLinearGradient(0, 0, VARIANT_PREVIEW_SIZE, VARIANT_PREVIEW_SIZE);
      gradient.addColorStop(0, variant.gradientStart);
      gradient.addColorStop(1, variant.gradientEnd);
      ctx.fillStyle = gradient;
    }

    if (variant.canvasShape === "circle") {
      ctx.beginPath();
      ctx.arc(VARIANT_PREVIEW_SIZE / 2, VARIANT_PREVIEW_SIZE / 2, VARIANT_PREVIEW_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (variant.canvasShape === "rounded") {
      const radius = VARIANT_PREVIEW_SIZE * 0.1;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(VARIANT_PREVIEW_SIZE - radius, 0);
      ctx.quadraticCurveTo(VARIANT_PREVIEW_SIZE, 0, VARIANT_PREVIEW_SIZE, radius);
      ctx.lineTo(VARIANT_PREVIEW_SIZE, VARIANT_PREVIEW_SIZE - radius);
      ctx.quadraticCurveTo(VARIANT_PREVIEW_SIZE, VARIANT_PREVIEW_SIZE, VARIANT_PREVIEW_SIZE - radius, VARIANT_PREVIEW_SIZE);
      ctx.lineTo(radius, VARIANT_PREVIEW_SIZE);
      ctx.quadraticCurveTo(0, VARIANT_PREVIEW_SIZE, 0, VARIANT_PREVIEW_SIZE - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else if (variant.canvasShape === "rectangle4x5") {
      // 4:5 宽高比，填充整个画布
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((variant.rotate * Math.PI) / 180);
    
    // 改进缩放算法：确保图片能够完整显示且清晰
    const maxImageSize = Math.max(image.width, image.height);
    const baseScale = Math.min(canvas.width, canvas.height) / maxImageSize;
    const scaleValue = baseScale * (variant.scale / 100);
    
    // 计算图片的实际绘制尺寸（保持宽高比）
    // 注意：这里不使用ctx.scale，而是直接计算缩放后的尺寸
    const imgAspectRatio = image.width / image.height;
    const baseImgSize = Math.min(image.width, image.height) * scaleValue;
    let imgDrawWidth: number;
    let imgDrawHeight: number;
    
    if (imgAspectRatio > 1) {
      // 横向图片：以较小边（高度）为基准
      imgDrawHeight = baseImgSize;
      imgDrawWidth = baseImgSize * imgAspectRatio;
    } else {
      // 纵向或方形图片：以较小边（宽度）为基准
      imgDrawWidth = baseImgSize;
      imgDrawHeight = baseImgSize / imgAspectRatio;
    }

    // 绘制轮廓 - 基于实际图片尺寸
    if (variant.showOutline) {
      ctx.strokeStyle = variant.outlineColor;
      ctx.lineWidth = variant.outlineThickness * Math.min(canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      const halfWidth = imgDrawWidth / 2;
      const halfHeight = imgDrawHeight / 2;
      ctx.beginPath();
      ctx.moveTo(-halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, halfHeight);
      ctx.lineTo(-halfWidth, halfHeight);
      ctx.closePath();
      ctx.stroke();
    }

    // 应用滤镜
    if (variant.filterType !== "none") {
      ctx.filter = getFilterCSS(variant.filterType);
    }

    // 绘制图片 - 保持宽高比
    ctx.drawImage(image, -imgDrawWidth / 2, -imgDrawHeight / 2, imgDrawWidth, imgDrawHeight);

    ctx.restore();
    // 使用更高的质量导出
    return canvas.toDataURL("image/png", 1.0);
  };

  // 为对话框渲染高分辨率预览
  const renderHighResPreviewForDialog = (variant: VariantConfig, size: number): string | null => {
    if (!image) return null;

    const canvas = document.createElement("canvas");
    // 对于4:5长方形，使用正确的宽高比
    if (variant.canvasShape === "rectangle4x5") {
      canvas.width = size;
      canvas.height = size * (5 / 4);
    } else {
      canvas.width = size;
      canvas.height = size;
    }
    const ctx = canvas.getContext("2d", { 
      willReadFrequently: false,
      alpha: true,
      desynchronized: false 
    });
    if (!ctx) return null;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    if (variant.backgroundType === "solid" && variant.backgroundColor) {
      ctx.fillStyle = variant.backgroundColor;
    } else if (variant.backgroundType === "gradient" && variant.gradientStart && variant.gradientEnd) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, variant.gradientStart);
      gradient.addColorStop(1, variant.gradientEnd);
      ctx.fillStyle = gradient;
    }

    if (variant.canvasShape === "circle") {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (variant.canvasShape === "rounded") {
      const radius = Math.min(canvas.width, canvas.height) * 0.1;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else if (variant.canvasShape === "rectangle4x5") {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((variant.rotate * Math.PI) / 180);
    
    const maxImageSize = Math.max(image.width, image.height);
    const baseScale = Math.min(canvas.width, canvas.height) / maxImageSize;
    const scaleValue = baseScale * (variant.scale / 100);

    // 计算图片的实际绘制尺寸（保持宽高比）
    const imgAspectRatio = image.width / image.height;
    const baseImgSize = Math.min(image.width, image.height) * scaleValue;
    let imgDrawWidth: number;
    let imgDrawHeight: number;
    
    if (imgAspectRatio > 1) {
      // 横向图片：以较小边（高度）为基准
      imgDrawHeight = baseImgSize;
      imgDrawWidth = baseImgSize * imgAspectRatio;
    } else {
      // 纵向或方形图片：以较小边（宽度）为基准
      imgDrawWidth = baseImgSize;
      imgDrawHeight = baseImgSize / imgAspectRatio;
    }

    // 绘制轮廓
    if (variant.showOutline) {
      ctx.strokeStyle = variant.outlineColor;
      ctx.lineWidth = variant.outlineThickness * Math.min(canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      const halfWidth = imgDrawWidth / 2;
      const halfHeight = imgDrawHeight / 2;
      ctx.beginPath();
      ctx.moveTo(-halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, halfHeight);
      ctx.lineTo(-halfWidth, halfHeight);
      ctx.closePath();
      ctx.stroke();
    }

    // 应用滤镜
    if (variant.filterType !== "none") {
      ctx.filter = getFilterCSS(variant.filterType);
    }

    // 绘制图片（保持宽高比）
    ctx.drawImage(image, -imgDrawWidth / 2, -imgDrawHeight / 2, imgDrawWidth, imgDrawHeight);

    ctx.restore();
    return canvas.toDataURL("image/png", 1.0);
  };

  // 下载单个变体
  const handleDownloadVariant = (variant: VariantConfig) => {
    if (!image) return;

    const size = parseInt(downloadSize === "original" ? "1200" : downloadSize);
    const canvas = document.createElement("canvas");
    // 对于4:5长方形，使用正确的宽高比
    if (variant.canvasShape === "rectangle4x5") {
      canvas.width = size;
      canvas.height = size * (5 / 4);
    } else {
      canvas.width = size;
      canvas.height = size;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxSize = Math.max(image.width, image.height);
    const baseScale = Math.min(canvas.width, canvas.height) / maxSize;

    // 绘制背景
    if (variant.backgroundType === "solid" && variant.backgroundColor) {
      ctx.fillStyle = variant.backgroundColor;
    } else if (variant.backgroundType === "gradient" && variant.gradientStart && variant.gradientEnd) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, variant.gradientStart);
      gradient.addColorStop(1, variant.gradientEnd);
      ctx.fillStyle = gradient;
    }

    if (variant.canvasShape === "circle") {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (variant.canvasShape === "rounded") {
      const radius = Math.min(canvas.width, canvas.height) * 0.1;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else if (variant.canvasShape === "rectangle4x5") {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((variant.rotate * Math.PI) / 180);
    const scaleValue = baseScale * (variant.scale / 100);

    // 计算图片的实际绘制尺寸（保持宽高比）
    const imgAspectRatio = image.width / image.height;
    const baseImgSize = Math.min(image.width, image.height) * scaleValue;
    let imgDrawWidth: number;
    let imgDrawHeight: number;
    
    if (imgAspectRatio > 1) {
      // 横向图片：以较小边（高度）为基准
      imgDrawHeight = baseImgSize;
      imgDrawWidth = baseImgSize * imgAspectRatio;
    } else {
      // 纵向或方形图片：以较小边（宽度）为基准
      imgDrawWidth = baseImgSize;
      imgDrawHeight = baseImgSize / imgAspectRatio;
    }

    // 绘制轮廓
    if (variant.showOutline) {
      ctx.strokeStyle = variant.outlineColor;
      ctx.lineWidth = variant.outlineThickness * Math.min(canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      const halfWidth = imgDrawWidth / 2;
      const halfHeight = imgDrawHeight / 2;
      ctx.beginPath();
      ctx.moveTo(-halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, halfHeight);
      ctx.lineTo(-halfWidth, halfHeight);
      ctx.closePath();
      ctx.stroke();
    }

    // 应用滤镜
    if (variant.filterType !== "none") {
      ctx.filter = getFilterCSS(variant.filterType);
    }

    // 绘制图片（保持宽高比）
    ctx.drawImage(image, -imgDrawWidth / 2, -imgDrawHeight / 2, imgDrawWidth, imgDrawHeight);

    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error(t("messages.downloadFailed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `profile-picture-${variant.name.toLowerCase().replace(/\s+/g, "-")}.${downloadFormat}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t("messages.downloadSuccess"));
      },
      downloadFormat === "png" ? "image/png" : "image/jpeg",
      0.95
    );
  };

  // 渲染画布
  useEffect(() => {
    if (image && canvasRef.current) {
      renderCanvas();
    }
  }, [
    image,
    backgroundType,
    backgroundColor,
    gradientStart,
    gradientEnd,
    showOutline,
    outlineColor,
    outlineThickness,
    filterType,
    showShadow,
    shadowBlur,
    shadowOffsetX,
    shadowOffsetY,
    scale,
    rotate,
    canvasShape,
  ]);

  const renderCanvas = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const maxSize = Math.max(image.width, image.height);
    const displayScale = Math.min(1, MAX_DISPLAY_SIZE / maxSize);
    
    // 对于4:5长方形，使用正确的宽高比
    if (canvasShape === "rectangle4x5") {
      const displayWidth = Math.floor(maxSize * displayScale);
      const displayHeight = Math.floor(displayWidth * (5 / 4));
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      canvas.style.width = displayWidth + "px";
      canvas.style.height = displayHeight + "px";
    } else {
      const displaySize = Math.floor(maxSize * displayScale);
      canvas.width = displaySize;
      canvas.height = displaySize;
      canvas.style.width = displaySize + "px";
      canvas.style.height = displaySize + "px";
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    if (backgroundType === "solid") {
      ctx.fillStyle = backgroundColor;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, gradientStart);
      gradient.addColorStop(1, gradientEnd);
      ctx.fillStyle = gradient;
    }

    // 根据形状绘制背景
    if (canvasShape === "circle") {
      const radius = Math.min(canvas.width, canvas.height) / 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (canvasShape === "rounded") {
      const radius = Math.min(canvas.width, canvas.height) * 0.1;
      ctx.beginPath();
      // 使用兼容的方式绘制圆角矩形
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvas.width - radius, 0);
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
      ctx.lineTo(canvas.width, canvas.height - radius);
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
      ctx.lineTo(radius, canvas.height);
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else if (canvasShape === "rectangle4x5") {
      // 4:5 宽高比，填充整个画布
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 保存状态
    ctx.save();

    // 应用变换
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    const scaleValue = scale / 100;
    ctx.scale(scaleValue, scaleValue);

    // 绘制阴影（在图片下方）
    if (showShadow) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = shadowBlur * Math.min(canvas.width, canvas.height);
      ctx.shadowOffsetX = shadowOffsetX * Math.min(canvas.width, canvas.height);
      ctx.shadowOffsetY = shadowOffsetY * Math.min(canvas.width, canvas.height);
    }

    // 计算图片的实际绘制尺寸（保持宽高比）
    const maxImageSize = Math.max(image.width, image.height);
    const imgDisplayScale = Math.min(1, MAX_DISPLAY_SIZE / maxImageSize);
    const baseImgSize = Math.min(image.width, image.height) * (imgDisplayScale * scaleValue);
    
    // 根据图片宽高比计算实际绘制尺寸
    const imgAspectRatio = image.width / image.height;
    let imgDrawWidth: number;
    let imgDrawHeight: number;
    
    if (imgAspectRatio > 1) {
      // 横向图片：以较小边（高度）为基准
      imgDrawHeight = baseImgSize;
      imgDrawWidth = baseImgSize * imgAspectRatio;
    } else {
      // 纵向或方形图片：以较小边（宽度）为基准
      imgDrawWidth = baseImgSize;
      imgDrawHeight = baseImgSize / imgAspectRatio;
    }

    // 绘制轮廓（在图片下方）
    if (showOutline) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineThickness * Math.min(canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // 使用实际图片尺寸绘制轮廓
      ctx.beginPath();
      const halfWidth = imgDrawWidth / 2;
      const halfHeight = imgDrawHeight / 2;
      ctx.moveTo(-halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, halfHeight);
      ctx.lineTo(-halfWidth, halfHeight);
      ctx.closePath();
      ctx.stroke();
    }

    // 应用滤镜
    if (filterType !== "none") {
      ctx.filter = getFilterCSS(filterType);
    }

    // 清除阴影（图片不需要阴影，轮廓才有）
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 绘制图片（保持宽高比）
    ctx.drawImage(image, -imgDrawWidth / 2, -imgDrawHeight / 2, imgDrawWidth, imgDrawHeight);

    // 恢复状态
    ctx.restore();
  };

  const getFilterCSS = (filter: FilterType): string => {
    switch (filter) {
      case "grayscale":
        return "grayscale(100%)";
      case "sepia":
        return "sepia(100%)";
      case "blackwhite":
        return "contrast(200%) grayscale(100%)";
      case "vintage":
        return "sepia(50%) contrast(120%) brightness(110%)";
      default:
        return "none";
    }
  };

  // 渲染高分辨率画布用于下载
  const renderHighResCanvas = (width: number, height?: number): HTMLCanvasElement | null => {
    if (!image) return null;

    const downloadCanvas = document.createElement("canvas");
    // 如果提供了高度，使用自定义尺寸；否则根据形状决定
    if (height !== undefined) {
      downloadCanvas.width = width;
      downloadCanvas.height = height;
    } else if (canvasShape === "rectangle4x5") {
      downloadCanvas.width = width;
      downloadCanvas.height = width * (5 / 4);
    } else {
      downloadCanvas.width = width;
      downloadCanvas.height = width;
    }
    const ctx = downloadCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);

    const canvasWidth = downloadCanvas.width;
    const canvasHeight = downloadCanvas.height;
    
    // 计算缩放比例（基于较小的一边，确保图片完整显示）
    const maxSize = Math.max(image.width, image.height);
    const minCanvasSize = Math.min(canvasWidth, canvasHeight);
    const baseScale = minCanvasSize / maxSize;

    // 绘制背景
    if (backgroundType === "solid") {
      ctx.fillStyle = backgroundColor;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, gradientStart);
      gradient.addColorStop(1, gradientEnd);
      ctx.fillStyle = gradient;
    }

    // 根据形状绘制背景
    if (canvasShape === "circle") {
      const radius = Math.min(canvasWidth, canvasHeight) / 2;
      ctx.beginPath();
      ctx.arc(canvasWidth / 2, canvasHeight / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (canvasShape === "rounded") {
      const radius = Math.min(canvasWidth, canvasHeight) * 0.1;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(canvasWidth - radius, 0);
      ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius);
      ctx.lineTo(canvasWidth, canvasHeight - radius);
      ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight);
      ctx.lineTo(radius, canvasHeight);
      ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    const scaleValue = baseScale * (scale / 100);
    
    // 计算图片的实际绘制尺寸（保持宽高比）
    const imgAspectRatio = image.width / image.height;
    // 以图片的较小边为基准，计算缩放后的尺寸
    const baseImgSize = Math.min(image.width, image.height) * scaleValue;
    
    // 根据图片宽高比计算实际绘制尺寸
    let imgDrawWidth: number;
    let imgDrawHeight: number;
    
    if (imgAspectRatio > 1) {
      // 横向图片：以较小边（高度）为基准
      imgDrawHeight = baseImgSize;
      imgDrawWidth = baseImgSize * imgAspectRatio;
    } else {
      // 纵向或方形图片：以较小边（宽度）为基准
      imgDrawWidth = baseImgSize;
      imgDrawHeight = baseImgSize / imgAspectRatio;
    }

    // 绘制轮廓
    if (showOutline) {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineThickness * minCanvasSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // 使用实际图片尺寸绘制轮廓
      ctx.beginPath();
      const halfWidth = imgDrawWidth / 2;
      const halfHeight = imgDrawHeight / 2;
      ctx.moveTo(-halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, -halfHeight);
      ctx.lineTo(halfWidth, halfHeight);
      ctx.lineTo(-halfWidth, halfHeight);
      ctx.closePath();
      ctx.stroke();
    }

    // 应用滤镜
    if (filterType !== "none") {
      ctx.filter = getFilterCSS(filterType);
    }

    // 绘制图片（保持宽高比）
    ctx.shadowColor = "transparent";
    ctx.drawImage(image, -imgDrawWidth / 2, -imgDrawHeight / 2, imgDrawWidth, imgDrawHeight);

    ctx.restore();
    return downloadCanvas;
  };

  // 下载图片
  const handleDownload = () => {
    if (!image || !canvasRef.current) {
      toast.error(t("messages.noImageToDownload"));
      return;
    }

    let downloadCanvas: HTMLCanvasElement | null;
    let fileName = `profile-picture.${downloadFormat}`;

    // 如果选择了社交媒体尺寸，使用该尺寸
    if (useSocialMediaSize && selectedSocialMediaSize) {
      downloadCanvas = renderHighResCanvas(
        selectedSocialMediaSize.width,
        selectedSocialMediaSize.height
      );
      fileName = `${selectedSocialMediaSize.name.toLowerCase().replace(/\s+/g, "-")}.${downloadFormat}`;
    } else {
      // 否则使用默认尺寸
      const size = downloadSize === "original" ? Math.max(image.width, image.height) : parseInt(downloadSize);
      downloadCanvas = renderHighResCanvas(size);
    }

    if (!downloadCanvas) {
      toast.error(t("messages.downloadFailed"));
      return;
    }

    downloadCanvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error(t("messages.downloadFailed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t("messages.downloadSuccess"));
      },
      downloadFormat === "png" ? "image/png" : "image/jpeg",
      0.95
    );
  };

  // 状态：变体预览 URL 缓存
  const [variantPreviews, setVariantPreviews] = useState<Record<string, string>>({});

  // 切换变体集合
  const handleChangeVariantSet = (setType: VariantSetType) => {
    setActiveVariantSet(setType);
    if (image) {
      const generatedVariants = generateVariants(setType);
      setVariants(generatedVariants);
      setVariantPreviews({}); // 清空预览，重新生成
    }
  };

  // 生成所有变体预览
  useEffect(() => {
    if (image && showVariants && variants.length > 0) {
      // 使用 setTimeout 确保在下一个事件循环中生成，避免阻塞 UI
      const timer = setTimeout(() => {
        const previews: Record<string, string> = {};
        variants.forEach((variant) => {
          const preview = renderVariantPreview(variant);
          if (preview) {
            previews[variant.id] = preview;
          }
        });
        setVariantPreviews(previews);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [image, showVariants, variants]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {image && showVariants ? (
        // 变体选择界面
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t("variants.title")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("variants.subtitle")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setImage(null);
                setShowVariants(false);
                setVariants([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              {t("variants.replacePhoto")}
            </Button>
          </div>

          {/* 变体集合切换器 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("variants.selectSet")}:
              </span>
              <div className="flex gap-2 flex-wrap">
                {([
                  { key: "colorSet1", label: t("variants.colorSet1") },
                  { key: "colorSet2", label: t("variants.colorSet2") },
                  { key: "colors2024", label: t("variants.colors2024") },
                  { key: "brightColors", label: t("variants.brightColors") },
                  { key: "borders", label: t("variants.borders") },
                  { key: "socialMedia", label: t("variants.socialMedia") },
                  { key: "blackWhite2", label: t("variants.blackWhite2") },
                ] as { key: VariantSetType; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleChangeVariantSet(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeVariantSet === key
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas 形状选择器 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("variants.canvas")}:
              </span>
              <div className="flex gap-2">
                {(["square", "circle", "rounded", "rectangle4x5"] as CanvasShape[]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => {
                      // 更新所有变体的 canvasShape
                      setVariants((prev) =>
                        prev.map((v) => ({ ...v, canvasShape: shape }))
                      );
                      // 清空预览，触发重新生成
                      setVariantPreviews({});
                    }}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                      variants[0]?.canvasShape === shape
                        ? "border-purple-600 border-2 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {shape === "square" && (
                      <svg width="20" height="20" viewBox="0 0 20 20" className={variants[0]?.canvasShape === shape ? "text-purple-600" : "text-gray-600 dark:text-gray-400"}>
                        <rect x="2" y="2" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {shape === "circle" && (
                      <svg width="20" height="20" viewBox="0 0 20 20" className={variants[0]?.canvasShape === shape ? "text-purple-600" : "text-gray-600 dark:text-gray-400"}>
                        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {shape === "rounded" && (
                      <svg width="20" height="20" viewBox="0 0 20 20" className={variants[0]?.canvasShape === shape ? "text-purple-600" : "text-gray-600 dark:text-gray-400"}>
                        <rect x="2" y="2" width="16" height="16" rx="3" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                    {shape === "rectangle4x5" && (
                      <svg width="20" height="20" viewBox="0 0 20 20" className={variants[0]?.canvasShape === shape ? "text-purple-600" : "text-gray-600 dark:text-gray-400"}>
                        <rect x="3" y="1" width="14" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 变体网格 */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {activeVariantSet === "colorSet1" && t("variants.colorSet1")}
              {activeVariantSet === "colorSet2" && t("variants.colorSet2")}
              {activeVariantSet === "colors2024" && t("variants.colors2024")}
              {activeVariantSet === "brightColors" && t("variants.brightColors")}
              {activeVariantSet === "borders" && t("variants.borders")}
              {activeVariantSet === "socialMedia" && t("variants.socialMedia")}
              {activeVariantSet === "blackWhite2" && t("variants.blackWhite2")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className={`group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 min-w-[120px] ${
                    variant.canvasShape === "rectangle4x5" ? "aspect-[4/5]" : "aspect-square"
                  }`}
                >
                  {variantPreviews[variant.id] ? (
                    <img
                      src={variantPreviews[variant.id]}
                      alt={variant.name}
                      className="w-full h-full object-cover cursor-pointer"
                      style={{ imageRendering: "auto" }}
                      onClick={() => setEnlargedVariant(variant.id)}
                    />
                  ) : (
                    <div className={`w-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${
                      variant.canvasShape === "rectangle4x5" ? "aspect-[4/5]" : "aspect-square"
                    }`}>
                      <div className="text-xs text-gray-400">Loading...</div>
                    </div>
                  )}
                  {/* 操作按钮 */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVariant(variant);
                      }}
                      className="h-8"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      {t("variants.customize")}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadVariant(variant);
                      }}
                      className="h-8"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {t("variants.download")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 放大查看对话框 - 使用更高分辨率 */}
          <Dialog open={enlargedVariant !== null} onOpenChange={(open) => !open && setEnlargedVariant(null)}>
            <DialogContent className="max-w-4xl w-full p-0">
              <DialogDescription className="sr-only">
                {t("variants.enlargedView")}
              </DialogDescription>
              {enlargedVariant && (() => {
                const variant = variants.find(v => v.id === enlargedVariant);
                if (!variant || !image) return null;
                // 在对话框中渲染更高分辨率的预览
                const highResPreview = renderHighResPreviewForDialog(variant, 800);
                return (
                  <div className="relative">
                    <button
                      onClick={() => setEnlargedVariant(null)}
                      className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {highResPreview && (
                      <img
                        src={highResPreview}
                        alt="Enlarged variant"
                        className="w-full h-auto"
                        style={{ imageRendering: "auto" }}
                      />
                    )}
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        </div>
      ) : image && !showVariants ? (
        // 编辑界面
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          {/* 预览区 */}
          <div className="flex flex-col gap-4">
            <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-0 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow-inner min-h-[500px]">
                <canvas ref={canvasRef} className="max-w-full h-auto drop-shadow-2xl" />
              </CardContent>
            </Card>
          </div>

          {/* 设置面板 */}
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="background" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger 
                  value="background"
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-purple-400"
                >
                  {t("settings.background")}
                </TabsTrigger>
                <TabsTrigger 
                  value="outline"
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-purple-400"
                >
                  {t("settings.outline")}
                </TabsTrigger>
                <TabsTrigger 
                  value="filter"
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-purple-400"
                >
                  {t("settings.filter")}
                </TabsTrigger>
                <TabsTrigger 
                  value="transform"
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-purple-400"
                >
                  {t("settings.transform")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="background" className="space-y-4 mt-4">
                <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t("settings.background")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">{t("settings.backgroundType")}</Label>
                      <Select
                        value={backgroundType}
                        onValueChange={(value) => setBackgroundType(value as BackgroundType)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">{t("settings.solid")}</SelectItem>
                          <SelectItem value="gradient">{t("settings.gradient")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {backgroundType === "solid" ? (
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">{t("settings.color")}</Label>
                        <Input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="h-12 w-full cursor-pointer border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label className="text-sm font-semibold mb-2 block">{t("settings.gradientStart")}</Label>
                          <Input
                            type="color"
                            value={gradientStart}
                            onChange={(e) => setGradientStart(e.target.value)}
                            className="h-12 w-full cursor-pointer border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold mb-2 block">{t("settings.gradientEnd")}</Label>
                          <Input
                            type="color"
                            value={gradientEnd}
                            onChange={(e) => setGradientEnd(e.target.value)}
                            className="h-12 w-full cursor-pointer border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="outline" className="space-y-4 mt-4">
                <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t("settings.outline")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showOutline"
                        checked={showOutline}
                        onChange={(e) => setShowOutline(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="showOutline">{t("settings.showOutline")}</Label>
                    </div>

                    {showOutline && (
                      <>
                        <div>
                          <Label className="text-sm font-semibold mb-2 block">{t("settings.outlineColor")}</Label>
                          <Input
                            type="color"
                            value={outlineColor}
                            onChange={(e) => setOutlineColor(e.target.value)}
                            className="h-12 w-full cursor-pointer border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                          />
                        </div>
                        <div>
                          <Label>{t("settings.outlineThickness")}: {outlineThickness.toFixed(2)}</Label>
                          <Slider
                            value={[outlineThickness]}
                            onValueChange={(value) => setOutlineThickness(value[0])}
                            min={0.01}
                            max={0.2}
                            step={0.01}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="filter" className="space-y-4 mt-4">
                <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t("settings.filter")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={filterType}
                      onValueChange={(value) => setFilterType(value as FilterType)}
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("settings.none")}</SelectItem>
                        <SelectItem value="grayscale">{t("settings.grayscale")}</SelectItem>
                        <SelectItem value="sepia">{t("settings.sepia")}</SelectItem>
                        <SelectItem value="blackwhite">{t("settings.blackwhite")}</SelectItem>
                        <SelectItem value="vintage">{t("settings.vintage")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transform" className="space-y-4 mt-4">
                <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t("settings.transform")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>{t("settings.scale")}: {scale}%</Label>
                      <Slider
                        value={[scale]}
                        onValueChange={(value) => setScale(value[0])}
                        min={50}
                        max={200}
                        step={5}
                      />
                    </div>
                    <div>
                      <Label>{t("settings.rotate")}: {rotate}°</Label>
                      <Slider
                        value={[rotate]}
                        onValueChange={(value) => setRotate(value[0])}
                        min={-180}
                        max={180}
                        step={5}
                      />
                    </div>
                    <div>
                      <Label>{t("settings.canvasShape")}</Label>
                      <Select
                        value={canvasShape}
                        onValueChange={(value) => setCanvasShape(value as CanvasShape)}
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="square">{t("settings.square")}</SelectItem>
                         <SelectItem value="circle">{t("settings.circle")}</SelectItem>
                         <SelectItem value="rounded">{t("settings.rounded")}</SelectItem>
                         <SelectItem value="rectangle4x5">{t("settings.rectangle4x5")}</SelectItem>
                       </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 下载设置 */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/20 dark:to-gray-900 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-700 dark:text-purple-300">{t("download.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* 社交媒体尺寸选择 */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="useSocialMediaSize"
                        checked={useSocialMediaSize}
                        onChange={(e) => {
                          setUseSocialMediaSize(e.target.checked);
                          if (!e.target.checked) {
                            setSelectedSocialMediaSize(null);
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="useSocialMediaSize" className="cursor-pointer">
                        {t("download.useSocialMediaSize")}
                      </Label>
                    </div>
                    {useSocialMediaSize && (
                      <div className="mt-2">
                        <SocialMediaSizeSelector
                          onSelectSize={setSelectedSocialMediaSize}
                          selectedSize={selectedSocialMediaSize}
                        />
                      </div>
                    )}
                  </div>

                  {/* 自定义尺寸（仅在未使用社交媒体尺寸时显示） */}
                  {!useSocialMediaSize && (
                    <div>
                      <Label>{t("download.size")}</Label>
                      <Select value={downloadSize} onValueChange={setDownloadSize}>
                        <SelectTrigger className="border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1200">1200px</SelectItem>
                          <SelectItem value="2000">2000px</SelectItem>
                          <SelectItem value="original">{t("download.original")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>{t("download.format")}</Label>
                    <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                      <SelectTrigger className="border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleDownload} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 shadow-md hover:shadow-lg transition-all"
                  disabled={useSocialMediaSize && !selectedSocialMediaSize}
                >
                  {t("download.button")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVariants(true);
                    setSelectedVariant(null);
                  }}
                  className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t("variants.backToVariants")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImage(null);
                    setShowVariants(false);
                    setVariants([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t("download.changeImage")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

