import PdfToBmpComponent from "@/components/pdf-to-bmp";
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
  const t = await getTranslations({ locale, namespace: "PdfToBmp.metadata" });

  return constructMetadata({
    page: "PdfToBmp",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/pdf-to-bmp`,
  });
}

export default async function PdfToBmpPage({ params }: { params: Params }) {
  return <PdfToBmpComponent />;
}

