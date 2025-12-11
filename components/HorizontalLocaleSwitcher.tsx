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
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export default function HorizontalLocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = useLocale();
  const { dismissLanguageAlert } = useLocaleStore();
  const [, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState("locale");

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale, setCurrentLocale]);

  function onSelectChange(nextLocale: Locale) {
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
    <div className="flex items-center gap-0.5 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-x-auto max-w-full">
      {routing.locales.map((cur) => (
        <Button
          key={cur}
          variant="ghost"
          size="sm"
          onClick={() => onSelectChange(cur)}
          className={cn(
            "min-w-fit px-4 py-2.5 text-sm font-bold transition-all duration-300 whitespace-nowrap rounded-xl",
            "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:scale-105 hover:shadow-md",
            "active:scale-95",
            currentLocale === cur
              ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600"
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
          )}
        >
          {LOCALE_NAMES[cur]}
        </Button>
      ))}
    </div>
  );
}
