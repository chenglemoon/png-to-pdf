import TiffToPdfComponent from "@/components/tiff-to-pdf";
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
  const t = await getTranslations({ locale, namespace: "TiffToPdf.metadata" });

  return constructMetadata({
    page: "TiffToPdf",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    locale: locale as Locale,
    path: `/tiff-to-pdf`,
  });
}

export default async function TiffToPdfPage({ params }: { params: Params }) {
  return <TiffToPdfComponent />;
}

