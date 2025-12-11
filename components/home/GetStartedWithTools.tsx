"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Link } from "@/i18n/routing";

// 图标名称映射：bentopdf-main 的图标名称 -> lucide-react 的图标名称
const iconMap: Record<string, string> = {
  "pencil-ruler": "Ruler",
  "combine": "Merge",
  "scissors": "Scissors",
  "zap": "Zap",
  "pocket-knife": "PocketKnife",
  "image-up": "ImageUp",
  "pen-tool": "PenTool",
  "crop": "Crop",
  "ungroup": "Ungroup",
  "files": "Files",
  "trash-2": "Trash2",
  "bookmark": "Bookmark",
  "list": "List",
  "list-ordered": "ListOrdered",
  "droplets": "Droplets",
  "pilcrow": "Pilcrow",
  "contrast": "Contrast",
  "palette": "Palette",
  "type": "Type",
  "stamp": "Stamp",
  "eraser": "Eraser",
  "square-pen": "SquarePen",
  "file-input": "FileInput",
  "file-minus-2": "FileMinus2",
  "images": "Images",
  "image": "Image",
  "smartphone": "Smartphone",
  "layers": "Layers",
  "file-pen": "FilePen",
  "file-code": "FileCode",
  "file-image": "FileImage",
};

interface Tool {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  categoryKey: string;
}

export default function GetStartedWithTools() {
  const t = useTranslations("Home.getStartedWithTools");
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = useState("");

  // 工具 ID 到路由路径的映射
  const toolRouteMap: Record<string, string> = {
    // Convert to PDF
    imageToPdf: "/image-to-pdf",
    jpgToPdf: "/merge-jpg",
    pngToPdf: "/", // 首页，使用滚动
    webpToPdf: "/webp-to-pdf",
    svgToPdf: "/svg-to-pdf",
    bmpToPdf: "/bmp-to-pdf",
    heicToPdf: "/heic-to-pdf",
    tiffToPdf: "/tiff-to-pdf",
    textToPdf: "/text-to-pdf",
    // Convert from PDF
    pdfToJpg: "/pdf-to-jpg",
    pdfToPng: "/pdf-to-png",
    pdfToWebp: "/pdf-to-webp",
    pdfToBmp: "/pdf-to-bmp",
    pdfToTiff: "/pdf-to-tiff",
  };

  // 构建所有工具列表
  const allTools = useMemo(() => {
    const tools: Tool[] = [];
    
    // Convert to PDF
    const convertToPdfConfig = [
      { id: "imageToPdf", iconKey: "images" },
      { id: "jpgToPdf", iconKey: "image-up" },
      { id: "pngToPdf", iconKey: "image-up" },
      { id: "webpToPdf", iconKey: "image-up" },
      { id: "svgToPdf", iconKey: "pen-tool" },
      { id: "bmpToPdf", iconKey: "image" },
      { id: "heicToPdf", iconKey: "smartphone" },
      { id: "tiffToPdf", iconKey: "layers" },
      { id: "textToPdf", iconKey: "file-pen" },
    ];

    convertToPdfConfig.forEach(({ id, iconKey }) => {
      tools.push({
        id,
        name: t(`categories.convertToPdf.tools.${id}.name`),
        icon: getIconName(iconKey),
        subtitle: t(`categories.convertToPdf.tools.${id}.subtitle`),
        categoryKey: "convertToPdf",
      });
    });

    // Convert from PDF
    const convertFromPdfConfig = [
      { id: "pdfToJpg", iconKey: "file-image" },
      { id: "pdfToPng", iconKey: "file-image" },
      { id: "pdfToWebp", iconKey: "file-image" },
      { id: "pdfToBmp", iconKey: "file-image" },
      { id: "pdfToTiff", iconKey: "file-image" },
    ];

    convertFromPdfConfig.forEach(({ id, iconKey }) => {
      tools.push({
        id,
        name: t(`categories.convertFromPdf.tools.${id}.name`),
        icon: getIconName(iconKey),
        subtitle: t(`categories.convertFromPdf.tools.${id}.subtitle`),
        categoryKey: "convertFromPdf",
      });
    });

    return tools;
  }, [t]);

  // 根据图标键获取图标名称
  function getIconName(iconKey: string): string {
    return iconMap[iconKey] || "File";
  }

  // 过滤工具
  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) return allTools;
    const search = searchTerm.toLowerCase();
    return allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(search) ||
        tool.subtitle.toLowerCase().includes(search)
    );
  }, [allTools, searchTerm]);

  // 按分类分组工具
  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, Tool[]> = {};
    filteredTools.forEach((tool) => {
      if (!grouped[tool.categoryKey]) {
        grouped[tool.categoryKey] = [];
      }
      grouped[tool.categoryKey].push(tool);
    });
    return grouped;
  }, [filteredTools]);

  const handleToolClick = (toolId: string, e?: React.MouseEvent) => {
    // PNG to PDF 通过 Link 组件跳转到首页，不需要特殊处理
    // 其他工具通过 Link 组件自动跳转
  };

  const categories = [
    { key: "convertToPdf", name: t("categories.convertToPdf.name") },
    { key: "convertFromPdf", name: t("categories.convertFromPdf.name") },
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              {t("title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* 搜索栏 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 max-w-lg mx-auto"
          >
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder={t("searchPlaceholder")}
              />
              <span className="absolute inset-y-0 right-0 flex items-center rounded-lg pr-2 gap-2">
                <kbd className="bg-gray-200 dark:bg-gray-700 px-2.5 py-1.5 rounded-md text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 shadow-sm">
                  ⌘K
                </kbd>
              </span>
            </div>
          </motion.div>

          {/* 工具分类和网格 */}
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryTools = toolsByCategory[category.key] || [];
              if (categoryTools.length === 0) return null;

              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {/* 分类标题 */}
                  <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4 mt-8 first:mt-0">
                    {category.name}
                  </h3>

                  {/* 工具网格 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {categoryTools.map((tool, index) => {
                      const route = toolRouteMap[tool.id];
                      
                      const ToolCardContent = (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="tool-card bg-gray-50 dark:bg-gray-800 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:-translate-y-1"
                        >
                          <div className="w-10 h-10 mb-3 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <DynamicIcon name={tool.icon} className="w-10 h-10" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base mb-1">
                            {tool.name}
                          </h3>
                          {tool.subtitle && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 px-2 line-clamp-2">
                              {tool.subtitle}
                            </p>
                          )}
                        </motion.div>
                      );

                      // 如果没有路由，直接渲染（不包装 Link）
                      if (!route) {
                        return (
                          <div key={`${category.key}-${tool.id}`}>
                            {ToolCardContent}
                          </div>
                        );
                      }

                      // 所有有路由的工具（包括 PNG to PDF）都使用 Link 包装
                      return (
                        <Link
                          key={`${category.key}-${tool.id}`}
                          href={route}
                          className="block"
                        >
                          {ToolCardContent}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
