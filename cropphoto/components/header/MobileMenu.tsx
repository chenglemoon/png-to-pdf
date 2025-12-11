"use client";

import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link as I18nLink } from "@/i18n/routing";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function MobileMenu() {
  const t = useTranslations("Home");
  const tToolNav = useTranslations("ToolNav");

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
    <div className="flex items-center gap-2">
      <LocaleSwitcher />
      <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2">
          <Menu className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <I18nLink
              href="/"
              title={t("title")}
              prefetch={true}
              className="flex items-center space-x-1 font-bold"
            >
              <Image
                alt={t("title")}
                src="/logo.svg"
                className="w-6 h-6"
                width={32}
                height={32}
              />
              <span className="gradient-text">{t("title")}</span>
            </I18nLink>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {tools.map((tool) => {
              const name = tToolNav(`${tool.key}.name`);
              const title = tToolNav(`${tool.key}.title`);
              return (
                <DropdownMenuItem key={tool.key}>
                  <I18nLink
                    href={tool.href}
                    title={title}
                    prefetch={true}
                  >
                    {name}
                  </I18nLink>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
