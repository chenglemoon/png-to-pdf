import PdfToTiffComponent from "@/components/pdf-to-tiff";
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
  const t = await getTranslations({ locale, namespace: "PdfToTiff.metadata" });

  return constructMetadata({
    page: "PdfToTiff",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/pdf-to-tiff`,
  });
}

export default async function PdfToTiffPage({ params }: { params: Params }) {
  return <PdfToTiffComponent />;
}

