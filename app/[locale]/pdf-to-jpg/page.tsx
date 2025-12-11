import PdfToJpgComponent from "@/components/pdf-to-jpg";
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
  const t = await getTranslations({ locale, namespace: "PdfToJpg.metadata" });

  return constructMetadata({
    page: "PdfToJpg",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/pdf-to-jpg`,
  });
}

export default async function PdfToJpgPage({ params }: { params: Params }) {
  return <PdfToJpgComponent />;
}

