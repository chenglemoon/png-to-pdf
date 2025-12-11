"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SocialMediaSize {
  id: string;
  name: string;
  width: number;
  height: number;
}

export interface SocialMediaPlatform {
  id: string;
  name: string;
  icon?: React.ReactNode;
  sizes: SocialMediaSize[];
}

interface SocialMediaSizeSelectorProps {
  onSelectSize: (size: SocialMediaSize | null) => void;
  selectedSize: SocialMediaSize | null;
}

export default function SocialMediaSizeSelector({
  onSelectSize,
  selectedSize,
}: SocialMediaSizeSelectorProps) {
  const t = useTranslations("ProfilePictureMaker.socialMedia");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  // 定义所有社交媒体平台及其尺寸
  const platforms: SocialMediaPlatform[] = [
    {
      id: "instagram",
      name: "Instagram",
      sizes: [
        { id: "instagram-reel", name: t("sizes.instagramReel"), width: 1080, height: 1920 },
        { id: "instagram-post-4x5", name: t("sizes.instagramPost45"), width: 1080, height: 1350 },
        { id: "instagram-story", name: t("sizes.instagramStory"), width: 1080, height: 1920 },
        { id: "instagram-ad-4x5", name: t("sizes.instagramAd45"), width: 1080, height: 1350 },
        { id: "instagram-animated-post", name: t("sizes.instagramAnimatedPost"), width: 1080, height: 1350 },
        { id: "instagram-story-ad", name: t("sizes.instagramStoryAd"), width: 1080, height: 1920 },
      ],
    },
    {
      id: "tiktok",
      name: "TikTok",
      sizes: [
        { id: "tiktok-video", name: t("sizes.tiktokVideo"), width: 1080, height: 1920 },
      ],
    },
    {
      id: "facebook",
      name: "Facebook",
      sizes: [
        { id: "facebook-video", name: t("sizes.facebookVideo"), width: 1080, height: 1080 },
        { id: "facebook-post", name: t("sizes.facebookPost"), width: 940, height: 788 },
        { id: "facebook-cover", name: t("sizes.facebookCover"), width: 851, height: 315 },
        { id: "facebook-story", name: t("sizes.facebookStory"), width: 1080, height: 1920 },
        { id: "facebook-ad", name: t("sizes.facebookAd"), width: 1200, height: 628 },
        { id: "facebook-event-cover", name: t("sizes.facebookEventCover"), width: 1920, height: 1080 },
        { id: "facebook-shops-logo", name: t("sizes.facebookShopsLogo"), width: 500, height: 500 },
        { id: "facebook-animated-cover", name: t("sizes.facebookAnimatedCover"), width: 851, height: 315 },
        { id: "facebook-shops-ad", name: t("sizes.facebookShopsAd"), width: 1200, height: 628 },
        { id: "facebook-app-ad", name: t("sizes.facebookAppAd"), width: 810, height: 450 },
        { id: "facebook-shops-cover", name: t("sizes.facebookShopsCover"), width: 1024, height: 1024 },
      ],
    },
    {
      id: "youtube",
      name: "YouTube",
      sizes: [
        { id: "youtube-thumbnail", name: t("sizes.youtubeThumbnail"), width: 1280, height: 720 },
        { id: "youtube-intro", name: t("sizes.youtubeIntro"), width: 1920, height: 1080 },
        { id: "youtube-banner", name: t("sizes.youtubeBanner"), width: 2560, height: 1440 },
      ],
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      sizes: [
        { id: "linkedin-background", name: t("sizes.linkedinBackground"), width: 1584, height: 396 },
        { id: "linkedin-post", name: t("sizes.linkedinPost"), width: 1200, height: 1200 },
        { id: "linkedin-video-ad", name: t("sizes.linkedinVideoAd"), width: 1920, height: 1920 },
        { id: "linkedin-single-image-ad", name: t("sizes.linkedinSingleImageAd"), width: 1200, height: 627 },
      ],
    },
    {
      id: "pinterest",
      name: "Pinterest",
      sizes: [
        { id: "pinterest-pin-2x3", name: t("sizes.pinterestPin23"), width: 1000, height: 1500 },
      ],
    },
    {
      id: "twitter",
      name: "Twitter",
      sizes: [
        { id: "twitter-video", name: t("sizes.twitterVideo"), width: 1600, height: 900 },
        { id: "twitter-post", name: t("sizes.twitterPost"), width: 1600, height: 900 },
      ],
    },
  ];

  // 获取所有尺寸（当选择"All"时）
  const allSizes: SocialMediaSize[] = platforms.flatMap((p) => p.sizes);

  // 获取当前显示的尺寸列表
  const getCurrentSizes = (): SocialMediaSize[] => {
    if (selectedPlatform === "all") {
      return allSizes;
    }
    const platform = platforms.find((p) => p.id === selectedPlatform);
    return platform ? platform.sizes : [];
  };

  const currentSizes = getCurrentSizes();

  return (
    <div className="w-full">
      {/* 平台选择器 */}
      <div className="mb-4">
        <div className="relative">
          {/* 滚动容器 */}
          <div 
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(209 213 219) transparent',
              WebkitOverflowScrolling: 'touch',
              msOverflowStyle: '-ms-autohiding-scrollbar'
            }}
          >
            <button
              onClick={() => setSelectedPlatform("all")}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                selectedPlatform === "all"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {t("all")}
            </button>
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  selectedPlatform === platform.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {platform.name}
              </button>
            ))}
          </div>
          
          {/* 滚动提示渐变遮罩（右侧） */}
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-r from-transparent to-white dark:to-gray-900 pointer-events-none" />
        </div>
      </div>

      {/* 尺寸列表 */}
      <ScrollArea className="h-[320px]">
        <div className="space-y-2 pr-2">
          {currentSizes.map((size) => {
            const isSelected = selectedSize?.id === size.id;
            return (
              <button
                key={size.id}
                onClick={() => onSelectSize(isSelected ? null : size)}
                className={`w-full text-left p-2.5 rounded-lg transition-all ${
                  isSelected
                    ? "bg-purple-50 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 shadow-sm"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex-shrink-0 w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-purple-600 bg-purple-600"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${
                        isSelected
                          ? "text-purple-900 dark:text-purple-100"
                          : "text-gray-900 dark:text-gray-100"
                      }`}>
                        {size.name}
                      </span>
                      <span className={`text-xs font-mono whitespace-nowrap ${
                        isSelected
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {size.width} × {size.height} px
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {selectedSize && (
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold text-purple-700 dark:text-purple-300">{t("selected")}:</span>{" "}
            <span className="font-medium">{selectedSize.name}</span>{" "}
            <span className="text-gray-500 dark:text-gray-400">({selectedSize.width} × {selectedSize.height} px)</span>
          </p>
        </div>
      )}
    </div>
  );
}

