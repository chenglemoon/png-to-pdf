"use server";

import { Locale } from "@/i18n/routing";
import { actionResponse } from "@/lib/action-response";

// 定义 Tag 类型
export interface Tag {
  id: string;
  name: string;
  name_en: string;
  name_zh: string;
  name_de: string;
  name_es: string;
  name_ja: string;
}

// 静态标签数据，不再依赖数据库
const STATIC_TAGS: Tag[] = [
  { id: "1", name: "Screen Tools", name_en: "Screen Tools", name_zh: "屏幕工具", name_de: "Bildschirm-Tools", name_es: "Herramientas de Pantalla", name_ja: "スクリーンツール" },
  { id: "2", name: "Screensavers", name_en: "Screensavers", name_zh: "屏幕保护程序", name_de: "Bildschirmschoner", name_es: "Protectores de Pantalla", name_ja: "スクリーンセーバー" },
  { id: "3", name: "Display Testing", name_en: "Display Testing", name_zh: "显示测试", name_de: "Display-Tests", name_es: "Pruebas de Pantalla", name_ja: "ディスプレイテスト" }
];

export async function getTags(locale: Locale) {
  try {
    return actionResponse.success(STATIC_TAGS);
  } catch (error) {
    console.error("Failed to get tags:", error);
    return actionResponse.error("Failed to get tags");
  }
}

export async function getTag(id: string, locale: Locale) {
  try {
    const tag = STATIC_TAGS.find(t => t.id === id);
    if (!tag) {
      return actionResponse.error("Tag not found");
    }
    return actionResponse.success(tag);
  } catch (error) {
    console.error("Failed to get tag:", error);
    return actionResponse.error("Failed to get tag");
  }
}

export async function createTag() {
  return actionResponse.error("Tag creation not available");
}

export async function updateTag() {
  return actionResponse.error("Tag update not available");
}

export async function deleteTag() {
  return actionResponse.error("Tag deletion not available");
}

// 添加缺失的导出函数以匹配预期的API
export const listTagsAction = getTags; 