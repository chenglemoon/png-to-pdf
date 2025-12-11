"use client";

import { Link as I18nLink, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ToolNav() {
  const t = useTranslations("ToolNav");
  const pathname = usePathname();

  const tools = [
    {
      key: "editor",
      href: "/",
    },
    {
      key: "pfpmaker",
      href: "/pfpmaker",
    },
    {
      key: "rounded",
      href: "/photo-to-rounded",
    },
    {
      key: "aspectRatioChanger",
      href: "/aspect-ratio-changer",
    },
    {
      key: "compressor",
      href: "/image-compressor",
    },
  ];

  return (
    <nav className="flex gap-2 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-gray-800 rounded-3xl p-1 px-2 [&_span]:rounded-xl [&_span]:px-2 [&_span]:bg-blue-600 [&_span]:text-white [&_a]:rounded-xl [&_a]:px-2 hover:[&_a]:bg-sky-50 dark:hover:[&_a]:bg-gray-700 hover:[&_a]:text-blue-600 dark:hover:[&_a]:text-blue-400 transition-colors">
      {tools.map((tool) => {
        // 规范化路径进行比较
        // usePathname 可能返回带或不带语言前缀的路径
        // 移除语言前缀（如果存在）和尾部斜杠
        let normalizedPathname = pathname;
        // 如果路径以语言代码开头（如 /en/photo-to-rounded），移除语言前缀
        if (normalizedPathname.match(/^\/[a-z]{2}(-[A-Z]{2})?\//)) {
          normalizedPathname = normalizedPathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?\//, "/");
        }
        // 移除尾部斜杠（除了根路径）
        normalizedPathname = normalizedPathname.replace(/\/$/, "") || "/";
        
        const normalizedHref = tool.href === "/" ? "/" : tool.href.replace(/\/$/, "");
        const isActive = normalizedPathname === normalizedHref;
        const name = t(`${tool.key}.name`);
        const title = t(`${tool.key}.title`);

        if (isActive) {
          return (
            <span key={tool.key} title={title}>
              {name}
            </span>
          );
        }

        return (
          <I18nLink
            key={tool.key}
            href={tool.href}
            title={title}
            prefetch={true}
          >
            {name}
          </I18nLink>
        );
      })}
    </nav>
  );
}
