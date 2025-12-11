import WebpToPdfComponent from "@/components/webp-to-pdf";
import { constructMetadata } from "@/lib/metadata";
import { Locale } from "@/i18n/routing";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Params = Promise<{ locale: string }>;

type MetadataProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WebpToPdf.metadata" });

  return constructMetadata({
    page: "WebpToPdf",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/webp-to-pdf`,
  });
}

export default async function WebpToPdfPage({ params }: { params: Params }) {
  return <WebpToPdfComponent />;
}

