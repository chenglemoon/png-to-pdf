import { getTranslations } from "next-intl/server";
import PhotoToRoundedPage from "@/components/photo-to-rounded";
import { constructMetadata } from "@/lib/metadata";
import { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PhotoToRounded.metadata" });

  return constructMetadata({
    page: "PhotoToRounded",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/photo-to-rounded`,
  });
}

export default async function PhotoToRoundedRoutePage({ params }: { params: Params }) {
  return <PhotoToRoundedPage />;
}


