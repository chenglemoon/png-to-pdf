"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const ShotEasyEditor = dynamic(() => import("./ShotEasyEditor"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[700px]">Loading editor...</div>,
});

export default function AspectRatioChangerTool() {
  const t = useTranslations("AspectRatioChanger.tool");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

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
      setImageSrc(e.target?.result as string);
      toast.success(t("messages.imageLoaded"));
    };
    reader.onerror = () => {
      toast.error(t("messages.readFileFailed"));
    };
    reader.readAsDataURL(file);
  };

  // Handle image change from editor
  const handleImageChange = (newImageSrc: string) => {
    setImageSrc(newImageSrc);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 隐藏的文件输入框 - 始终渲染以便 HeroSection 按钮可以触发 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {imageSrc ? (
        <ShotEasyEditor imageSrc={imageSrc} onImageChange={handleImageChange} />
      ) : null}
    </div>
  );
}

