"use client";

import { Button } from "@/components/ui/button";
import {
  Locale,
  LOCALE_NAMES,
  routing,
  usePathname,
  useRouter,
} from "@/i18n/routing";
import { useLocaleStore } from "@/stores/localeStore";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export default function FooterLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("Footer");
  const { dismissLanguageAlert } = useLocaleStore();
  const [, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  useEffect(() => {
    setCurrentLocale(locale as Locale);
  }, [locale]);

  // 获取语言部分的标题
  const languageSectionTitle = (() => {
    try {
      const groups = t.raw("Links.groups") as any[];
      const languageGroup = groups?.find((g: any) => 
        g.links?.every?.((l: any) => l.useA === true)
      );
      return languageGroup?.title || "Choose Language";
    } catch {
      return "Choose Language";
    }
  })();

  function onLanguageChange(nextLocale: Locale) {
    setCurrentLocale(nextLocale);
    dismissLanguageAlert();

    startTransition(() => {
      // 从当前路径中移除语言前缀，获取实际的页面路径
      const currentPath = pathname;
      const pathWithoutLocale = currentPath.replace(`/${locale}`, '') || '/';

      // 构建新的参数对象，排除locale参数
      const pathParams = { ...params };
      delete pathParams.locale;

      router.replace(
        pathWithoutLocale,
        { locale: nextLocale }
      );
    });
  }

  return (
    <div className="w-full">
      {/* 紫色分隔线 */}
      <div className="h-0.5 bg-purple-500 mb-4 w-full"></div>
      
      {/* Choose Language 标题 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-white" />
        <h3 className="text-white text-base font-medium">{languageSectionTitle}</h3>
      </div>

      {/* 语言按钮网格 */}
      <div className="grid grid-cols-3 gap-2">
        {routing.locales.map((cur) => (
          <Button
            key={cur}
            onClick={() => onLanguageChange(cur)}
            className={cn(
              "rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              "whitespace-nowrap border-0 w-full",
              currentLocale === cur
                ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                : "bg-gray-700/80 text-white hover:bg-gray-600/80"
            )}
          >
            {LOCALE_NAMES[cur]}
          </Button>
        ))}
      </div>
    </div>
  );
}

