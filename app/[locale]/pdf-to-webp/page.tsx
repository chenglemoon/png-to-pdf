import PdfToWebpComponent from "@/components/pdf-to-webp";
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
  const t = await getTranslations({ locale, namespace: "PdfToWebp.metadata" });

  return constructMetadata({
    page: "PdfToWebp",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/pdf-to-webp`,
  });
}

export default async function PdfToWebpPage({ params }: { params: Params }) {
  return <PdfToWebpComponent />;
}

