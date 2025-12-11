"use client";

import ToolNav from "@/components/shared/ToolNav";
import Logo from "@/components/shared/Logo";
import MobileMenu from "@/components/header/MobileMenu";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link as I18nLink } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const Header = () => {
  const t = useTranslations("Header");

  return (
    <header className="container flex items-center justify-between p-3 md:p-4 relative z-10 select-none">
      <I18nLink
        href="/"
        title={t("title")}
        prefetch={true}
        className="flex items-center gap-2 font-extrabold text-lg text-gray-700 dark:text-gray-300"
      >
        <Logo height={42} />
        <span className="hidden sm:inline">CropPhoto</span>
      </I18nLink>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Tool Navigation - Desktop only */}
        <div className="hidden lg:flex items-center">
          <ToolNav />
        </div>
        
        {/* Mobile Menu - Mobile only */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
        
        {/* Language Switcher and Theme Toggle - Desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
