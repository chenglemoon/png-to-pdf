import PdfToPngComponent from "@/components/pdf-to-png";
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
  const t = await getTranslations({ locale, namespace: "PdfToPng.metadata" });

  return constructMetadata({
    page: "PdfToPng",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/pdf-to-png`,
  });
}

export default async function PdfToPngPage({ params }: { params: Params }) {
  return <PdfToPngComponent />;
}

